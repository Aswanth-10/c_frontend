import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ChartBarIcon,
  CalendarIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';
import { formsAPI } from '../services/api';
import { FeedbackForm } from '../types';

const FormsList: React.FC = () => {
  const [forms, setForms] = useState<FeedbackForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await formsAPI.getForms();
      setForms(data);
    } catch (err) {
      console.error('Failed to load forms:', err);
      setError('Failed to load forms');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteForm = async (formId: string) => {
    if (window.confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
      try {
        await formsAPI.deleteForm(formId);
        setForms(forms.filter(form => form.id !== formId));
      } catch (err) {
        console.error('Failed to delete form:', err);
        alert('Failed to delete form');
      }
    }
  };

  const getStatusBadge = (form: FeedbackForm) => {
    if (!form.is_active) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Inactive
        </span>
      );
    }
    if (form.is_expired) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Expired
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Active
      </span>
    );
  };

  const getFormTypeBadge = (formType: string) => {
    const typeColors = {
      survey: 'bg-blue-100 text-blue-800',
      feedback: 'bg-green-100 text-green-800',
      questionnaire: 'bg-purple-100 text-purple-800',
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColors[formType as keyof typeof typeColors] || 'bg-gray-100 text-gray-800'}`}>
        {formType.charAt(0).toUpperCase() + formType.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Forms</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your feedback forms
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

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Forms List */}
      {forms.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No forms</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first feedback form.
          </p>
          <div className="mt-6">
            <Link
              to="/admin/forms/create"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Form
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {forms.map((form) => (
              <li key={form.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <DocumentTextIcon className="h-8 w-8 text-gray-400" />
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <h3 className="text-lg font-medium text-gray-900">
                            {form.title}
                          </h3>
                          <div className="ml-2 flex space-x-2">
                            {getStatusBadge(form)}
                            {getFormTypeBadge(form.form_type)}
                          </div>
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <p>{form.description}</p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 space-x-4">
                          <div className="flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            Created {new Date(form.created_at).toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                            {form.response_count} responses
                          </div>
                          {form.questions && (
                            <div className="flex items-center">
                              <QuestionMarkCircleIcon className="h-4 w-4 mr-1" />
                              {form.questions.length} questions
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/admin/forms/${form.id}/analytics`}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200"
                      >
                        <ChartBarIcon className="h-3 w-3 mr-1" />
                        Analytics
                      </Link>
                      <Link
                        to={`/admin/forms/${form.id}/edit`}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
                      >
                        <PencilIcon className="h-3 w-3 mr-1" />
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteForm(form.id)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                      >
                        <TrashIcon className="h-3 w-3 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FormsList; 