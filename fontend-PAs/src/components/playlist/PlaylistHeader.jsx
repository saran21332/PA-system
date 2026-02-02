import React, { useState } from 'react';
import musicPurple from '../../assets/music-purple.png';
import CreatePlaylistModal from './CreatePlaylistModal.jsx';
import AddAudioModal from './AddAudioModal.jsx';
import ToastNotifier from "../../components/ToastNotifier";

const PlaylistHeader = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddAudioModal, setShowAddAudioModal] = useState(false);

  return (
    <>
      <div className="bg-white rounded-xl shadow-xl mt-3 mb-6">
        <div className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img
                src={musicPurple}
                alt="Music Icon"
                className="w-8 h-8 mr-4 object-contain"
              />
              <div>
                <h2 className="text-xl text-left font-semibold text-gray-800 prompt-bold">จัดการ Playlist</h2>
                <p className="text-sm text-gray-600 prompt-regular">จัดการเพลงและไฟล์เสียงในระบบ</p>
              </div>
            </div>
            <div className="flex gap-5">
              <button 
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-[#6C81D4] to-[#A07EDF] text-white px-6 py-3 rounded-xl hover:from-[#6174BF] hover:to-[#8064b2] prompt-regular cursor-pointer shadow-2xl"
              >
                สร้าง Playlist
              </button>
              <button
                onClick={() => setShowAddAudioModal(true)} 
                className="bg-gradient-to-r from-[#A86DD5] to-[#EC77BA] text-white px-6 py-3 rounded-xl hover:from-[#9762bf] hover:to-[#d46ba7] prompt-regular cursor-pointer shadow-2xl">
                เพิ่มไฟล์เสียง
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Create Playlist Modal */}
      <CreatePlaylistModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
       <ToastNotifier />

      <AddAudioModal 
        isOpen={showAddAudioModal}
        onClose={() => setShowAddAudioModal(false)}
        onUploadSuccess={(newFile) => {
          window.dispatchEvent(new CustomEvent("audioUploaded", { detail: newFile }));
        }}
      />
    </>
  );
};

export default PlaylistHeader;