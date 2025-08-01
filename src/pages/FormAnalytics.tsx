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
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
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
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

const FormAnalytics: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [analytics, setAnalytics] = useState<FormAnalyticsType | null>(null);
  const [questionAnalytics, setQuestionAnalytics] = useState<QuestionAnalytics[]>([]);
  const [form, setForm] = useState<FeedbackForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState<'auth' | 'notfound' | 'network' | 'general'>('general');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Check authentication first
    if (!isAuthenticated) {
      setError('You must be logged in to view analytics');
      setErrorType('auth');
      setLoading(false);
      return;
    }

    const loadAnalytics = async () => {
      if (!id) {
        setError('Form ID is required');
        setErrorType('notfound');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError('');
        
        // Load form data first to validate access
        const formData = await formsAPI.getForm(id);
        setForm(formData);
        
        // Then load analytics data
        const [analyticsData, questionData] = await Promise.all([
          formsAPI.getFormAnalytics(id),
          formsAPI.getQuestionAnalytics(id)
        ]);
        
        setAnalytics(analyticsData);
        setQuestionAnalytics(questionData);
        setRetryCount(0); // Reset retry count on success
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
          setErrorType('general');
        }
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [id, isAuthenticated, retryCount]);

  // Generate colors for charts
  const generateColors = (count: number) => {
    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
      '#06B6D4', '#F97316', '#84CC16', '#EC4899', '#6366F1'
    ];
    return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
  };

  // Prepare chart data for question analytics
  const getQuestionChartData = (question: QuestionAnalytics) => {
    const labels = Object.keys(question.answer_distribution);
    const data = Object.values(question.answer_distribution);
    const colors = generateColors(labels.length);

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors,
          borderColor: colors.map(color => color + '80'),
          borderWidth: 2,
          hoverBorderWidth: 3,
        },
      ],
    };
  };

  // Enhanced chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
            weight: 500
          }
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#3B82F6',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          }
        }
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#3B82F6',
        borderWidth: 1,
        cornerRadius: 8,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          font: {
            size: 12,
            weight: 500
          }
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
            weight: 500
          }
        }
      }
    },
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#3B82F6',
        borderWidth: 1,
        cornerRadius: 8,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          font: {
            size: 12,
            weight: 500
          }
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
            weight: 500
          }
        }
      }
    },
    elements: {
      point: {
        radius: 6,
        hoverRadius: 8,
        backgroundColor: '#3B82F6',
        borderColor: '#fff',
        borderWidth: 2,
      },
      line: {
        tension: 0.4,
        borderWidth: 3,
      }
    }
  };

  // Prepare response timeline data (mock data for demonstration)
  const getResponseTimelineData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - 6 + i);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    // Mock response data - in real implementation, this would come from the backend
    const responseCounts = [2, 5, 3, 8, 6, 4, 7];

    return {
      labels: last7Days,
      datasets: [
        {
          label: 'Responses',
          data: responseCounts,
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
        },
      ],
    };
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
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {errorType === 'auth' ? 'Authentication Required' :
             errorType === 'notfound' ? 'Form Not Found' :
             errorType === 'network' ? 'Connection Error' : 'Error Loading Analytics'}
          </h2>
          <p className="text-red-600 mb-6">{error}</p>
          
          <div className="space-y-3">
            {errorType === 'auth' ? (
              <button
                onClick={handleLoginRedirect}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
              >
                Go to Login
              </button>
            ) : (
              <button
                onClick={handleRetry}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition flex items-center justify-center"
              >
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                Try Again
              </button>
            )}
            
            <button
              onClick={() => navigate('/admin/forms')}
              className="w-full text-blue-600 hover:text-blue-800 border border-blue-600 px-4 py-2 rounded-md transition"
            >
              ← Back to Forms
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics || !form) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">No analytics data available for this form</p>
        <button
          onClick={() => navigate('/admin/forms')}
          className="text-blue-600 hover:text-blue-800"
        >
          ← Back to Forms
        </button>
      </div>
    );
  }

  const stats = [
    {
      name: 'Total Responses',
      value: analytics.total_responses,
      icon: UsersIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'Completion Rate',
      value: `${analytics.completion_rate.toFixed(1)}%`,
      icon: ArrowTrendingUpIcon,
      color: 'bg-green-500',
    },
    {
      name: 'Average Rating',
      value: analytics.average_rating ? analytics.average_rating.toFixed(1) : 'N/A',
      icon: StarIcon,
      color: 'bg-yellow-500',
    },
    {
      name: 'Last Updated',
      value: new Date(analytics.last_updated).toLocaleDateString(),
      icon: ClockIcon,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/admin/forms')}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-2"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Forms
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Form Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">
            Detailed insights for "{form.title}"
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CalendarIcon className="h-3 w-3 mr-1" />
            Created {new Date(form.created_at).toLocaleDateString()}
          </span>
          <button
            onClick={() => window.open(`/feedback/${form.id}`, '_blank')}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <EyeIcon className="h-4 w-4 mr-2" />
            Preview Form
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`${stat.color} rounded-md p-3`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Response Timeline */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Response Timeline (Last 7 Days)</h3>
        <div className="h-64">
          <Line data={getResponseTimelineData()} options={lineChartOptions} />
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
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Question {index + 1}: {question.question_text}
                  </h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Type: {question.question_type}</span>
                    <span>Responses: {question.response_count}</span>
                    {question.average_rating && (
                      <span>Avg Rating: {question.average_rating.toFixed(1)}</span>
                    )}
                  </div>
                </div>

                {/* Rating Questions */}
                {(question.question_type === 'rating' || question.question_type === 'rating_10') && question.average_rating && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Average Rating</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {question.average_rating.toFixed(1)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                        style={{
                          width: `${(question.average_rating / (question.question_type === 'rating_10' ? 10 : 5)) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Distribution Charts */}
                {Object.keys(question.answer_distribution).length > 0 && (
                  <div className="h-64">
                    {question.question_type === 'radio' || question.question_type === 'yes_no' ? (
                      <Doughnut data={getQuestionChartData(question)} options={chartOptions} />
                    ) : (
                      <Bar data={getQuestionChartData(question)} options={barChartOptions} />
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

      {/* Form Details */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Form Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Basic Information</h4>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm text-gray-500">Title</dt>
                <dd className="text-sm font-medium text-gray-900">{form.title}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Type</dt>
                <dd className="text-sm font-medium text-gray-900 capitalize">
                  {form.form_type.replace('_', ' ')}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Status</dt>
                <dd>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    form.is_active && !form.is_expired
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {form.is_active && !form.is_expired ? 'Active' : 'Inactive'}
                  </span>
                </dd>
              </div>
            </dl>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Statistics</h4>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm text-gray-500">Total Questions</dt>
                <dd className="text-sm font-medium text-gray-900">{form.questions.length}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Required Questions</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {form.questions.filter(q => q.is_required).length}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Shareable Link</dt>
                <dd className="text-sm font-mono text-blue-600 break-all">
                  {window.location.origin}/feedback/{form.id}
                </dd>
              </div>
            </dl>
          </div>
        </div>
        
        {form.description && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
            <p className="text-sm text-gray-600">{form.description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormAnalytics;