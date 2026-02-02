import React, { useState } from 'react';
import speakerPurple from '../../assets/megaphone-purple.png';
import CreatespeakerModal from './createspeakergroups.jsx';

const ScheduleHeader = ({ onAddGroup }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleSaveSchedule = (newGroup) => {
    if (onAddGroup) onAddGroup(newGroup);
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-xl mt-3 mb-6">
        <div className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img
                src={speakerPurple}
                alt="Music Icon"
                className="w-8 h-8 mr-4 object-contain"
              />
              <div>
                <h2 className="text-xl text-left font-semibold text-gray-800 prompt-bold">ลำโพง</h2>
                <p className="text-sm text-gray-600 prompt-regular">กำหนดกลุ่มลำโพงสำหรับการประกาศ</p>
              </div>
            </div>
            <div className="flex gap-5">
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-[#AD7CE1] to-[#EC77BA] text-white px-6 py-3 rounded-xl hover:from-[#9762bf] hover:to-[#d46ba7] prompt-regular cursor-pointer shadow-2xl"
              >
                สร้างกลุ่มลำโพง
              </button>
            </div>
          </div>
        </div>
      </div>

      <CreatespeakerModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleSaveSchedule}
      />
    </>
  );
};

export default ScheduleHeader;