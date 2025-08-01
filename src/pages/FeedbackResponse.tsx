import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ChatBubbleLeftRightIcon, CalendarIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { publicFeedbackAPI, responsesAPI } from '../services/api';
import { FeedbackResponse as FeedbackResponseType } from '../types';

// Using the Answer and FeedbackResponse interfaces from types

const FeedbackResponse: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [response, setResponse] = useState<FeedbackResponseType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResponse = async () => {
      if (!id) return;
      
      setLoading(true);
      setError('');
      try {
        // Try public API first
        let data;
        try {
          data = await publicFeedbackAPI.getPublicResponse(id);
        } catch (publicError) {
          console.log('Public API failed, trying authenticated API:', publicError);
          // Fallback to authenticated API
          data = await responsesAPI.getResponse(id);
        }
        setResponse(data);
      } catch (err: any) {
        console.error('Failed to load response:', err);
        setError(err.response?.data?.error || 'Failed to load response. You may not have permission to view this response.');
      } finally {
        setLoading(false);
      }
    };
    fetchResponse();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading response...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Response Not Found</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!response) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-xl w-full bg-white shadow rounded-lg p-8">
        <div className="mb-6 text-center">
          <ChatBubbleLeftRightIcon className="mx-auto h-10 w-10 text-primary-500" />
          <h2 className="text-2xl font-bold text-gray-900 mt-2 mb-1">Feedback Response</h2>
          <p className="text-gray-600">{response.form_title}</p>
          <div className="flex items-center justify-center text-sm text-gray-500 mt-2">
            <CalendarIcon className="h-4 w-4 mr-1" />
            <span>Submitted {new Date(response.submitted_at).toLocaleString()}</span>
          </div>
        </div>
        <div className="space-y-6">
          {response.answers.map((ans, idx) => (
            <div key={ans.id || idx} className="border-b pb-4">
              <div className="flex items-center text-gray-700 mb-1">
                <DocumentTextIcon className="h-4 w-4 mr-2" />
                <span className="font-medium">{ans.question_text}</span>
              </div>
              <div className="ml-6 text-gray-900">{ans.answer_text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeedbackResponse;