import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardDocumentListIcon, UserGroupIcon, StarIcon } from '@heroicons/react/24/outline';

const UserAccess: React.FC = () => {
  const navigate = useNavigate();
  const [formId, setFormId] = useState('');
  const [error, setError] = useState('');

  const handleFormAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formId.trim()) {
      setError('Please enter a valid form ID');
      return;
    }
    
    // Navigate to the public feedback form
    navigate(`/feedback/${formId.trim()}`);
  };

  const features = [
    {
      icon: ClipboardDocumentListIcon,
      title: 'Easy Form Access',
      description: 'Access feedback forms directly using the form ID provided by your administrator'
    },
    {
      icon: UserGroupIcon,
      title: 'No Registration Required',
      description: 'Submit feedback instantly without creating an account or logging in'
    },
    {
      icon: StarIcon,
      title: 'Anonymous Feedback',
      description: 'Your responses are collected anonymously to ensure honest feedback'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            User Feedback Portal
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Welcome! Enter your feedback form ID to get started, or access forms directly through shared links.
          </p>
        </div>

        {/* Main Form */}
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Access Feedback Form
          </h2>
          
          <form onSubmit={handleFormAccess}>
            <div className="mb-4">
              <label htmlFor="formId" className="block text-sm font-medium text-gray-700 mb-2">
                Form ID
              </label>
              <input
                type="text"
                id="formId"
                value={formId}
                onChange={(e) => {
                  setFormId(e.target.value);
                  setError('');
                }}
                placeholder="Enter the form ID provided by your administrator"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
            >
              Access Form
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have a form ID? Contact your administrator for access.
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-semibold text-gray-900 text-center mb-8">
            Why Choose Our Feedback System?
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 text-center">
                <feature.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h4>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="max-w-2xl mx-auto mt-16 bg-white rounded-lg shadow-md p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            How it Works
          </h3>
          <div className="space-y-4">
            <div className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                1
              </span>
              <p className="text-gray-600">
                Receive a feedback form ID or direct link from your administrator
              </p>
            </div>
            <div className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                2
              </span>
              <p className="text-gray-600">
                Enter the form ID above or click the direct link to access the form
              </p>
            </div>
            <div className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                3
              </span>
              <p className="text-gray-600">
                Fill out the feedback form and submit your responses
              </p>
            </div>
            <div className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                4
              </span>
              <p className="text-gray-600">
                Your feedback is automatically sent to the administrator for review
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16">
          <p className="text-gray-600">
            Need help? Contact your system administrator for assistance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserAccess;