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

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await dashboardAPI.getSummary();
      setSummary(data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load dashboard data</p>
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

      {/* Timeline of Recent Feedbacks */}
      <div className="bg-white shadow rounded-lg mt-8">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Recent Feedback Timeline
          </h3>
          <ul className="timeline-list">
            {summary.recent_responses_list.map((feedback) => (
              <li key={feedback.id} className="mb-4 flex items-start">
                <span className="inline-block w-2 h-2 bg-primary-500 rounded-full mt-2 mr-4"></span>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-900">{feedback.form_title}</span>
                    <span className="text-xs text-gray-500">{new Date(feedback.submitted_at).toLocaleString()}</span>
                  </div>
                  {/* Optionally, show a snippet of the first answer if available */}
                  {/* <div className="text-gray-700 text-sm mt-1">{feedback.commentSnippet}</div> */}
                </div>
              </li>
            ))}
            {summary.recent_responses_list.length === 0 && (
              <li className="text-gray-500">No recent feedbacks</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 