import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  PlusIcon,
  EyeIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { dashboardAPI } from '../services/api';
import { FormSummary } from '../types';
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<FormSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<'1hr' | '6hr' | '24hr'>('1hr');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardAPI.getSummary();
      setSummary(data);
    } catch (error: any) {
      console.error('Failed to load dashboard data:', error);
      setError(error.response?.data?.error || 'Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter responses based on time
  const getFilteredResponses = () => {
    if (!summary) return [];
    
    const now = new Date();
    let cutoffTime: Date;
    
    switch (timeFilter) {
      case '1hr':
        cutoffTime = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '6hr':
        cutoffTime = new Date(now.getTime() - 6 * 60 * 60 * 1000);
        break;
      case '24hr':
        cutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      default:
        cutoffTime = new Date(now.getTime() - 60 * 60 * 1000);
    }

    return summary.recent_responses_list.filter(response => 
      new Date(response.submitted_at) >= cutoffTime
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center max-w-md">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Dashboard Error</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={loadDashboardData}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No dashboard data available</p>
      </div>
    );
  }

  const chartData = {
    labels: ['Total Forms', 'Active Forms', 'Total Responses', 'Recent Responses'],
    datasets: [
      {
        label: 'Count',
        data: [
          summary.total_forms,
          summary.active_forms,
          summary.total_responses,
          summary.recent_responses,
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(168, 85, 247, 0.8)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(251, 146, 60, 1)',
          'rgba(168, 85, 247, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const completionRateData = {
    labels: ['Completed', 'Incomplete'],
    datasets: [
      {
        data: [summary.average_completion_rate, 100 - summary.average_completion_rate],
        backgroundColor: ['rgba(34, 197, 94, 0.8)', 'rgba(239, 68, 68, 0.8)'],
        borderColor: ['rgba(34, 197, 94, 1)', 'rgba(239, 68, 68, 1)'],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Feedback System Overview',
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
        display: true,
        text: 'Completion Rate',
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Overview of your feedback forms and responses
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/admin/forms/create"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Form
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Forms
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {summary.total_forms}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Forms
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {summary.active_forms}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-orange-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Responses
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {summary.total_responses}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Recent Responses
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {summary.recent_responses}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <Bar data={chartData} options={chartOptions} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <Doughnut data={completionRateData} options={doughnutOptions} />
        </div>
      </div>

      {/* Recent Feedback with Time Filter */}
      <div className="bg-white shadow rounded-lg mt-8">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Feedback
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setTimeFilter('1hr')}
                className={`px-3 py-1 text-xs font-medium rounded-md ${
                  timeFilter === '1hr' 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Last 1 hr
              </button>
              <button
                onClick={() => setTimeFilter('6hr')}
                className={`px-3 py-1 text-xs font-medium rounded-md ${
                  timeFilter === '6hr' 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Last 6 hrs
              </button>
              <button
                onClick={() => setTimeFilter('24hr')}
                className={`px-3 py-1 text-xs font-medium rounded-md ${
                  timeFilter === '24hr' 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Last 24 hrs
              </button>
            </div>
          </div>
          <div className="space-y-3">
            {getFilteredResponses().map((feedback) => (
              <div key={feedback.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">{feedback.form_title}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(feedback.submitted_at).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <ClockIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-xs text-gray-500">
                    {Math.round((Date.now() - new Date(feedback.submitted_at).getTime()) / (1000 * 60))} min ago
                  </span>
                </div>
              </div>
            ))}
            {getFilteredResponses().length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <ClockIcon className="h-8 w-8 mx-auto mb-2" />
                <p>No feedback received in the selected time period</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Responses */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Recent Responses
          </h3>
          <div className="flow-root">
            <ul className="-my-5 divide-y divide-gray-200">
              {summary.recent_responses_list.map((response) => (
                <li key={response.id} className="py-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <ChatBubbleLeftRightIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {response.form_title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(response.submitted_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <Link
                        to={`/feedback/response/${response.id}`}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200"
                      >
                        <EyeIcon className="h-3 w-3 mr-1" />
                        View
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          {summary.recent_responses_list.length === 0 && (
            <p className="text-center text-gray-500 py-4">No recent responses</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 