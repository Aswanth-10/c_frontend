import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  TrashIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';
import { formsAPI } from '../services/api';
import { CreateFeedbackFormData, CreateQuestionData } from '../types';

const CreateForm: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateFeedbackFormData>({
    title: '',
    description: '',
    form_type: 'general',
    is_active: true,
    expires_at: null,
    questions: [],
  });

  const questionTypes = [
    { value: 'text', label: 'Text Input' },
    { value: 'textarea', label: 'Long Text' },
    { value: 'radio', label: 'Single Choice' },
    { value: 'checkbox', label: 'Multiple Choice' },
    { value: 'rating', label: 'Rating (1-5)' },
    { value: 'rating_10', label: 'Rating (1-10)' },
    { value: 'yes_no', label: 'Yes/No' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone Number' },
  ];

  const addQuestion = () => {
    const newQuestion: CreateQuestionData = {
      text: '',
      question_type: 'text',
      is_required: false,
      order: formData.questions.length,
      options: [],
    };
    setFormData({
      ...formData,
      questions: [...formData.questions, newQuestion],
    });
  };

  const removeQuestion = (index: number) => {
    const updatedQuestions = formData.questions.filter((_, i) => i !== index);
    // Update order for remaining questions
    const reorderedQuestions = updatedQuestions.map((q, i) => ({
      ...q,
      order: i,
    }));
    setFormData({
      ...formData,
      questions: reorderedQuestions,
    });
  };

  const updateQuestion = (index: number, field: keyof CreateQuestionData, value: any) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value,
    };
    setFormData({
      ...formData,
      questions: updatedQuestions,
    });
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === formData.questions.length - 1)
    ) {
      return;
    }

    const updatedQuestions = [...formData.questions];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    [updatedQuestions[index], updatedQuestions[newIndex]] = [
      updatedQuestions[newIndex],
      updatedQuestions[index],
    ];

    // Update order
    updatedQuestions.forEach((q, i) => {
      q.order = i;
    });

    setFormData({
      ...formData,
      questions: updatedQuestions,
    });
  };

  const addOption = (questionIndex: number) => {
    const question = formData.questions[questionIndex];
    const updatedOptions = [...(question.options || []), ''];
    updateQuestion(questionIndex, 'options', updatedOptions);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const question = formData.questions[questionIndex];
    const updatedOptions = question.options?.filter((_, i) => i !== optionIndex) || [];
    updateQuestion(questionIndex, 'options', updatedOptions);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const question = formData.questions[questionIndex];
    const updatedOptions = [...(question.options || [])];
    updatedOptions[optionIndex] = value;
    updateQuestion(questionIndex, 'options', updatedOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Please enter a form title');
      return;
    }

    if (formData.questions.length === 0) {
      alert('Please add at least one question');
      return;
    }

    // Validate questions
    for (let i = 0; i < formData.questions.length; i++) {
      const question = formData.questions[i];
      if (!question.text.trim()) {
        alert(`Please enter text for question ${i + 1}`);
        return;
      }
      
      if (['radio', 'checkbox'].includes(question.question_type) && (!question.options || question.options.length < 2)) {
        alert(`Question ${i + 1} needs at least 2 options`);
        return;
      }
    }

    try {
      setLoading(true);
      const createdForm = await formsAPI.createForm(formData);
      navigate(`/admin/forms/${createdForm.id}/analytics`);
    } catch (error) {
      console.error('Failed to create form:', error);
      alert('Failed to create form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderQuestionOptions = (questionIndex: number) => {
    const question = formData.questions[questionIndex];
    
    if (!['radio', 'checkbox'].includes(question.question_type)) {
      return null;
    }

    return (
      <div className="mt-3 space-y-2">
        <label className="block text-sm font-medium text-gray-700">Options</label>
        {(question.options || []).map((option, optionIndex) => (
          <div key={optionIndex} className="flex items-center space-x-2">
            <input
              type="text"
              value={option}
              onChange={(e) => updateOption(questionIndex, optionIndex, e.target.value)}
              className="flex-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder={`Option ${optionIndex + 1}`}
            />
            <button
              type="button"
              onClick={() => removeOption(questionIndex, optionIndex)}
              className="inline-flex items-center p-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addOption(questionIndex)}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Option
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create Form</h1>
        <p className="mt-1 text-sm text-gray-500">
          Create a new feedback form
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Form Details */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Form Details</h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Form Title *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Enter form title"
                required
              />
            </div>

            <div>
              <label htmlFor="form_type" className="block text-sm font-medium text-gray-700">
                Form Type
              </label>
                                              <select
                                  id="form_type"
                                  value={formData.form_type}
                                  onChange={(e) => setFormData({ ...formData, form_type: e.target.value as 'customer_satisfaction' | 'employee_feedback' | 'product_feedback' | 'service_feedback' | 'general' })}
                                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                >
                                  <option value="general">General Feedback</option>
                                  <option value="customer_satisfaction">Customer Satisfaction</option>
                                  <option value="employee_feedback">Employee Feedback</option>
                                  <option value="product_feedback">Product Feedback</option>
                                  <option value="service_feedback">Service Feedback</option>
                                </select>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Enter form description"
              />
            </div>

            <div>
              <label htmlFor="expires_at" className="block text-sm font-medium text-gray-700">
                Expiration Date
              </label>
              <input
                type="datetime-local"
                id="expires_at"
                value={formData.expires_at || ''}
                onChange={(e) => setFormData({ ...formData, expires_at: e.target.value || null })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                Active
              </label>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Questions</h3>
            <button
              type="button"
              onClick={addQuestion}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Question
            </button>
          </div>

          {formData.questions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No questions added yet. Click "Add Question" to get started.</p>
          ) : (
            <div className="space-y-4">
              {formData.questions.map((question, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-900">Question {index + 1}</h4>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => moveQuestion(index, 'up')}
                        disabled={index === 0}
                        className="inline-flex items-center p-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
                      >
                        <ChevronUpIcon className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveQuestion(index, 'down')}
                        disabled={index === formData.questions.length - 1}
                        className="inline-flex items-center p-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
                      >
                        <ChevronUpIcon className="h-4 w-4 transform rotate-180" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeQuestion(index)}
                        className="inline-flex items-center p-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Question Text *</label>
                      <input
                        type="text"
                        value={question.text}
                        onChange={(e) => updateQuestion(index, 'text', e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        placeholder="Enter your question"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Question Type</label>
                      <select
                        value={question.question_type}
                                                 onChange={(e) => updateQuestion(index, 'question_type', e.target.value as 'text' | 'textarea' | 'radio' | 'checkbox' | 'rating' | 'rating_10' | 'yes_no' | 'email' | 'phone')}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      >
                        {questionTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center">
                    <input
                      type="checkbox"
                      checked={question.is_required}
                      onChange={(e) => updateQuestion(index, 'is_required', e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">Required</label>
                  </div>

                  {renderQuestionOptions(index)}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/admin/forms')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Form'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateForm; 