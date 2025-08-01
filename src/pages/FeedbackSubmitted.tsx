import React from 'react';

const FeedbackSubmitted: React.FC = () => (
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
      <p className="text-sm text-gray-500">
        Browse more feedback forms or submit additional responses
      </p>
    </div>
  </div>
);

export default FeedbackSubmitted;