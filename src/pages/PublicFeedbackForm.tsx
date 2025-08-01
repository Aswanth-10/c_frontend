import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { publicFeedbackAPI } from '../services/api';
import { FeedbackForm, SubmitFeedbackData } from '../types';

const PublicFeedbackForm: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const [form, setForm] = useState<FeedbackForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Record<number, any>>({});

  const loadForm = useCallback(async () => {
    try {
      setLoading(true);
      const formData = await publicFeedbackAPI.getPublicForm(formId!);
      setForm(formData);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to load form');
    } finally {
      setLoading(false);
    }
  }, [formId]);

  useEffect(() => {
    if (formId) {
      loadForm();
    }
  }, [formId, loadForm]);

  const handleAnswerChange = (questionId: number, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const validateForm = () => {
    if (!form) return false;
    
    for (const question of form.questions) {
      if (question.is_required) {
        const answer = answers[question.id];
        if (answer === undefined || answer === '' || (Array.isArray(answer) && answer.length === 0)) {
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert('Please fill in all required fields.');
      return;
    }

    try {
      setSubmitting(true);
      const submitData: SubmitFeedbackData = {
        form: formId!,
        answers: Object.entries(answers).map(([questionId, value]) => ({
          question: parseInt(questionId),
          answer_text: Array.isArray(value) ? value.join(', ') : String(value),
          answer_value: { value }
        }))
      };

      await publicFeedbackAPI.submitFeedback(formId!, submitData);
      navigate('/feedback/submitted'); // Redirect to thank you page
    } catch (error: any) {
      console.error('Failed to submit feedback:', error);
      setError(error.response?.data?.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestionInput = (question: any) => {
    const value = answers[question.id] || '';

    switch (question.question_type) {
      case 'text':
      case 'email':
        return (
          <input
            type={question.question_type === 'email' ? 'email' : 'text'}
            value={value}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder={`Enter your ${question.question_type === 'email' ? 'email' : 'answer'}...`}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            rows={4}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="Enter your answer..."
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="Enter a number..."
          />
        );

      case 'rating':
        return (
          <div className="mt-1 flex space-x-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => handleAnswerChange(question.id, rating)}
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                  value === rating
                    ? 'border-primary-500 bg-primary-500 text-white'
                    : 'border-gray-300 text-gray-700 hover:border-primary-300'
                }`}
              >
                {rating}
              </button>
            ))}
          </div>
        );

      case 'rating_10':
        return (
          <div className="mt-1 flex space-x-2 flex-wrap">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => handleAnswerChange(question.id, rating)}
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-medium ${
                  value === rating
                    ? 'border-primary-500 bg-primary-500 text-white'
                    : 'border-gray-300 text-gray-700 hover:border-primary-300'
                }`}
              >
                {rating}
              </button>
            ))}
          </div>
        );

      case 'yes_no':
        return (
          <div className="mt-1 flex space-x-4">
            {['Yes', 'No'].map((option) => (
              <label key={option} className="flex items-center">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'radio':
        return (
          <div className="mt-1 space-y-2">
            {question.options?.map((option: string, index: number) => (
              <label key={index} className="flex items-center">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="mt-1 space-y-2">
            {question.options?.map((option: string, index: number) => (
              <label key={index} className="flex items-center">
                <input
                  type="checkbox"
                  value={option}
                  checked={Array.isArray(value) && value.includes(option)}
                  onChange={(e) => {
                    const currentValues = Array.isArray(value) ? value : [];
                    const newValues = e.target.checked
                      ? [...currentValues, option]
                      : currentValues.filter(v => v !== option);
                    handleAnswerChange(question.id, newValues);
                  }}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="Enter your answer..."
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Form Not Found</h2>
          <p className="text-gray-600">The requested feedback form could not be found.</p>
        </div>
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">User Feedback Portal</h1>
        {/* Removed Back to Portal Home link as requested */}
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{form.title}</h1>
          {form.description && (
            <p className="text-gray-600 mb-6">{form.description}</p>
          )}
          
          <div className="space-y-6">
            {form.questions.map((question, index) => (
              <div key={question.id} className="border-b border-gray-200 pb-6">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {index + 1}. {question.text}
                  {question.is_required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {renderQuestionInput(question)}
              </div>
            ))}
          </div>
          
          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PublicFeedbackForm;