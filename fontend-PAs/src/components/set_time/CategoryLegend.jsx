import React from 'react';

const CategoryLegend = () => {
  const categories = [
    {
      id: 2,
      name: 'Schedule',
      color: 'bg-blue-400',
      dotColor: 'bg-blue-400'
    },
    {
      id: 3,
      name: 'Calendar',
      color: 'bg-purple-400',
      dotColor: 'bg-purple-400'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-800 prompt-bold mb-6 text-center">
        หมวดหมู่
      </h3>
      
      <div className="space-y-4">
        {categories.map((category) => (
          <div key={category.id} className="flex items-center">
            <div className={`w-4 h-4 ${category.dotColor} rounded-full mr-4`}></div>
            <span className="text-gray-700 prompt-regular text-base">
              {category.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryLegend;