import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { 
  ChartBarIcon, 
  ClockIcon, 
  StarIcon, 
  UsersIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  EyeIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { formsAPI } from '../services/api';
import { FormAnalytics as FormAnalyticsType, QuestionAnalytics, FeedbackForm } from '../types';
import { useAuth } from '../contexts/AuthContext';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const FormAnalytics: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState<FeedbackForm | null>(null);
  const [analytics, setAnalytics] = useState<FormAnalyticsType | null>(null);
  const [questionAnalytics, setQuestionAnalytics] = useState<QuestionAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'auth' | 'network' | 'notfound' | 'generic'>('generic');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setError('You must be logged in to view analytics');
      setErrorType('auth');
      setLoading(false);
      return;
    }

    const loadAnalytics = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        setErrorType('generic');

        // First load form data to check if it exists
        const formData = await formsAPI.getForm(id);
        setForm(formData);

        // Then load analytics data
        const [analyticsData, questionData] = await Promise.all([
          formsAPI.getFormAnalytics(id),
          formsAPI.getQuestionAnalytics(id)
        ]);

        setAnalytics(analyticsData);
        setQuestionAnalytics(questionData);
      } catch (error: any) {
        console.error('Failed to load analytics:', error);
        
        // More specific error handling
        if (error.response?.status === 401) {
          setError('You are not authorized to view this form\'s analytics. Please log in again.');
          setErrorType('auth');
        } else if (error.response?.status === 404) {
          setError('The requested form was not found or you don\'t have permission to view it.');
          setErrorType('notfound');
        } else if (error.response?.status >= 500) {
          setError('Server error occurred while loading analytics. Please try again later.');
          setErrorType('network');
        } else if (error.code === 'NETWORK_ERROR' || !error.response) {
          setError('Network connection error. Please check your internet connection and try again.');
          setErrorType('network');
        } else {
          setError(error.response?.data?.error || 'Failed to load analytics data. Please try again.');
          setErrorType('generic');
        }
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [id, user, retryCount]);

  // Prepare chart data for question analytics
  const getQuestionChartData = (question: QuestionAnalytics) => {
    if (question.question_type === 'rating' || question.question_type === 'rating_10') {
      const maxRating = question.question_type === 'rating' ? 5 : 10;
      const labels = Array.from({ length: maxRating }, (_, i) => `${i + 1}`);
      const data = labels.map(label => question.answer_distribution[label] || 0);

      return {
        labels,
        datasets: [
          {
            label: 'Count',
            data,
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1,
          },
        ],
      };
    }

    if (question.question_type === 'radio' || question.question_type === 'checkbox' || question.question_type === 'yes_no') {
      const labels = Object.keys(question.answer_distribution);
      const data = Object.values(question.answer_distribution);

      return {
        labels,
        datasets: [
          {
            data,
            backgroundColor: [
              '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
              '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
            ].slice(0, labels.length),
            borderWidth: 1,
          },
        ],
      };
    }

    return null;
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: false,
      },
    },
  };


  // Retry function
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  // Handle authentication redirect
  const handleLoginRedirect = () => {
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading analytics data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center max-w-md">
              <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {errorType === 'auth' ? 'Authentication Required' : 
                 errorType === 'network' ? 'Connection Error' : 'Error Loading Analytics'}
              </h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <div className="space-x-3">
                {errorType === 'auth' ? (
                  <button
                    onClick={handleLoginRedirect}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                  >
                    Go to Login
                  </button>
                ) : (
                  <button
                    onClick={handleRetry}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                  >
                    <ArrowPathIcon className="h-4 w-4 mr-2" />
                    Try Again
                  </button>
                )}
                <button
                  onClick={() => navigate('/admin/forms')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back to Forms
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics || !form) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-gray-600 mb-4">No analytics data available for this form</p>
          <button
            onClick={() => navigate('/admin/forms')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Forms
          </button>
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      name: 'Total Responses',
      value: analytics.total_responses,
      icon: UsersIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Completion Rate',
      value: `${analytics.completion_rate.toFixed(1)}%`,
      icon: ArrowTrendingUpIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Average Rating',
      value: analytics.average_rating ? analytics.average_rating.toFixed(1) : 'N/A',
      icon: StarIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      name: 'Last Updated',
      value: new Date(analytics.last_updated).toLocaleDateString(),
      icon: CalendarIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => navigate('/admin/forms')}
                className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-2"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                Back to Forms
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Form Analytics</h1>
              <p className="text-gray-600">{form.title}</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => navigate(`/admin/responses`)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <EyeIcon className="h-4 w-4 mr-2" />
                View Responses
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {statsCards.map((item) => (
            <div key={item.name} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <item.icon className={`h-6 w-6 ${item.color}`} />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {item.name}
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {item.value}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      {/* Response Summary */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Response Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{analytics?.total_responses || 0}</div>
            <div className="text-sm text-gray-600">Total Responses</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{analytics?.completion_rate.toFixed(1) || 0}%</div>
            <div className="text-sm text-gray-600">Completion Rate</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{analytics?.average_rating?.toFixed(1) || 'N/A'}</div>
            <div className="text-sm text-gray-600">Average Rating</div>
          </div>
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            Last updated: {analytics ? new Date(analytics.last_updated).toLocaleDateString() : 'N/A'}
          </p>
        </div>
      </div>

      {/* Question Analytics */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900">Question Analytics</h3>
        
        {questionAnalytics.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No question analytics available yet.</p>
            <p className="text-sm text-gray-500 mt-2">Analytics will appear once responses are submitted.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {questionAnalytics.map((question, index) => (
              <div key={question.question_id} className="bg-white shadow rounded-lg p-6">
                <div className="mb-4">
                  <h4 className="text-md font-semibold text-gray-800 mb-2">
                    Q{index + 1}: {question.question_text}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {question.response_count} response{question.response_count !== 1 ? 's' : ''}
                    {question.average_rating && (
                      <span className="ml-2">
                        • Avg: {question.average_rating.toFixed(1)}
                      </span>
                    )}
                  </p>
                </div>

                {/* Chart based on question type */}
                {getQuestionChartData(question) && (
                  <div className="h-64">
                    {(question.question_type === 'radio' || 
                      question.question_type === 'checkbox' || 
                      question.question_type === 'yes_no') && (
                      <Doughnut 
                        data={getQuestionChartData(question)!} 
                        options={doughnutOptions} 
                      />
                    )}
                    {(question.question_type === 'rating' || 
                      question.question_type === 'rating_10') && (
                      <Bar 
                        data={getQuestionChartData(question)!} 
                        options={chartOptions} 
                      />
                    )}
                  </div>
                )}

                {/* Text Responses Summary */}
                {(question.question_type === 'text' || question.question_type === 'textarea') && (
                  <div className="text-center text-gray-500">
                    <p>Text responses: {question.response_count}</p>
                    <p className="text-sm mt-1">View individual responses in the Responses tab</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default FormAnalytics;