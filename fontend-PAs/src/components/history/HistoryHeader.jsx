import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

const HistoryHeader = ({ onFilterChange, announcements = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ทุกวันที่');
  const [selectedStatus, setSelectedStatus] = useState('ทุกประเภท');
  const [selectedDate, setSelectedDate] = useState('ทุกลำโพง');

  const getUniqueValues = (key) => {
    const values = announcements.map(item => item[key]).filter(Boolean);
    return [...new Set(values)].sort();
  };
  const categories = ['ทุกวันที่', ...getUniqueValues('date')];
  const statuses = ['ทุกประเภท', ...getUniqueValues('task_type')];
  const getSpeakerOptions = () => {
    const allSpeakers = announcements.reduce((acc, item) => {
      if (item.speaker_code && Array.isArray(item.speaker_code)) {
        acc.push(...item.speaker_code);
      }
      return acc;
    }, []);
    return [...new Set(allSpeakers)].sort();
  };
  
  const dates = ['ทุกลำโพง', ...getSpeakerOptions()];
  const handleSearch = () => {
    if (onFilterChange) {
      onFilterChange({
        searchTerm: searchTerm.trim(),
        selectedCategory,
        selectedStatus,
        selectedDate
      });
    }
  };

  useEffect(() => {
    handleSearch();
  }, [searchTerm, selectedCategory, selectedStatus, selectedDate]);

  return (
    <div className="bg-white rounded-3xl shadow-xl mt-3 mb-6">
      <div className="p-6 pl-10 pr-10">
        <div className="flex items-center mb-2">
          <h2 className="text-xl text-left font-semibold text-gray-800 prompt-bold">ค้นหาและกรอง</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาชื่อรายการ" 
              className="w-full pl-3 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#AD7CE1] focus:border-[#AD7CE1] text-sm prompt-regular" 
            />
          </div>
          
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#AD7CE1] focus:border-[#AD7CE1] text-sm prompt-regular bg-white cursor-pointer min-w-[120px]"
          >
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          
          <select 
            value={selectedStatus} 
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#AD7CE1] focus:border-[#AD7CE1] text-sm prompt-regular bg-white cursor-pointer min-w-[120px]"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          
          <select 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#AD7CE1] focus:border-[#AD7CE1] text-sm prompt-regular bg-white cursor-pointer min-w-[120px]"
          >
            {dates.map((date) => (
              <option key={date} value={date}>{date}</option>
            ))}
          </select>
          
          <button 
            onClick={handleSearch}
            className="bg-gradient-to-r from-[#AD7CE1] to-[#EC77BA] text-white px-6 py-2.5 rounded-xl hover:from-[#9762bf] hover:to-[#d46ba7] prompt-regular cursor-pointer shadow-xl whitespace-nowrap"
          >
            ค้นหา
          </button>
        </div>
      </div>
    </div>
  );
};

export default HistoryHeader;