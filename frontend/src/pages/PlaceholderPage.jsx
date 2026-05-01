import React from 'react';

export const PlaceholderPage = ({ title }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
        <p className="text-gray-500 mb-6">
          Giao diện này đang trong quá trình phát triển (Under Construction). 
          Vui lòng quay lại sau!
        </p>
        <div className="w-24 h-1 bg-blue-500 mx-auto rounded-full"></div>
      </div>
    </div>
  );
};

export default PlaceholderPage;
