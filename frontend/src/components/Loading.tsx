import React from 'react';

const Loading: React.FC = () => {
  return (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-500"></div>
      <span className="ml-2">Loading...</span>
    </div>
  );
};

export default Loading;