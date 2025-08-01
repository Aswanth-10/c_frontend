import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ChatBubbleLeftRightIcon, CalendarIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

interface Answer {
  question_text: string;
  answer_text: string;
}

interface ResponseData {
  id: string;
  form_title: string;
  submitted_at: string;
  answers: Answer[];
}

const FeedbackResponse: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [response, setResponse] = useState<ResponseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResponse = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/public/response/${id}`);
        if (!res.ok) throw new Error('Response not found');
        const data = await res.json();
        setResponse(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load response');
      } finally {
        setLoading(false);
      }
    };
    fetchResponse();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
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
            <div key={idx} className="border-b pb-4">
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