import React, { useState } from 'react';
import calendarPurple from '../../assets/calendar-purple.png';
import CreateScheduleModal from './CreateScheduleModal';

const ScheduleHeader = ({ onSave }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleSaveSchedule = () => {
    setShowCreateModal(false);
    if (onSave) onSave();
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-xl mt-3 mb-6">
        <div className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img
                src={calendarPurple}
                alt="Music Icon"
                className="w-8 h-8 mr-4 object-contain"
              />
              <div>
                <h2 className="text-xl text-left font-semibold text-gray-800 prompt-bold">ตั้งเวลา</h2>
                <p className="text-sm text-gray-600 prompt-regular">กำหนดเวลาและตารางการประกาศอัตโนมัติ</p>
              </div>
            </div>
            <div className="flex gap-5">
              <button 
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-[#AD7CE1] to-[#EC77BA] text-white px-6 py-3 rounded-xl hover:from-[#9762bf] hover:to-[#d46ba7] prompt-regular cursor-pointer shadow-2xl"
              >
                สร้างรายการตั้งเวลา
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <CreateScheduleModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleSaveSchedule}
      />
    </>
  );
};

export default ScheduleHeader;