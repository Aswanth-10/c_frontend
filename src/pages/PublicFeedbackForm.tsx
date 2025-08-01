import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { publicFeedbackAPI } from '../services/api';
import { FeedbackForm, SubmitFeedbackData } from '../types';

const PublicFeedbackForm: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const [form, setForm] = useState<FeedbackForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
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
      setSuccess(true);
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
            type={question.question_type}
            value={value}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            required={question.is_required}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            rows={4}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            required={question.is_required}
          />
        );

      case 'radio':
        return (
          <div className="mt-2 space-y-2">
            {question.options.map((option: string, index: number) => (
              <label key={index} className="flex items-center">
                <input
                  type="radio"
                  name={`question_${question.id}`}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300"
                  required={question.is_required}
                />
                <span className="ml-2 text-sm text-gray-900">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="mt-2 space-y-2">
            {question.options.map((option: string, index: number) => (
              <label key={index} className="flex items-center">
                <input
                  type="checkbox"
                  value={option}
                  checked={Array.isArray(value) && value.includes(option)}
                  onChange={(e) => {
                    const currentValues = Array.isArray(value) ? value : [];
                    if (e.target.checked) {
                      handleAnswerChange(question.id, [...currentValues, option]);
                    } else {
                      handleAnswerChange(question.id, currentValues.filter((v: string) => v !== option));
                    }
                  }}
                  className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-900">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'rating':
        return (
          <div className="mt-2 flex space-x-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => handleAnswerChange(question.id, rating)}
                className={`p-2 rounded-full ${
                  value === rating
                    ? 'bg-yellow-400 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                ⭐
              </button>
            ))}
          </div>
        );

      case 'rating_10':
        return (
          <div className="mt-2 flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => handleAnswerChange(question.id, rating)}
                className={`px-3 py-1 rounded ${
                  value === rating
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {rating}
              </button>
            ))}
          </div>
        );

      case 'yes_no':
        return (
          <div className="mt-2 flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name={`question_${question.id}`}
                value="Yes"
                checked={value === 'Yes'}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300"
                required={question.is_required}
              />
              <span className="ml-2 text-sm text-gray-900">Yes</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name={`question_${question.id}`}
                value="No"
                checked={value === 'No'}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300"
                required={question.is_required}
              />
              <span className="ml-2 text-sm text-gray-900">No</span>
            </label>
          </div>
        );

      case 'phone':
        return (
          <input
            type="tel"
            value={value}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            required={question.is_required}
          />
        );

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            required={question.is_required}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading form...</p>
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={loadForm}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Form not found</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Thank You!</h2>
          <p className="text-lg text-gray-600 mb-6">
            Your feedback has been submitted successfully and will be reviewed by the administrator.
          </p>
          <div className="space-y-2">
            <p className="text-sm text-gray-500">
              Your response has been recorded and saved.
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Submission ID: {formId}
            </p>
          </div>
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