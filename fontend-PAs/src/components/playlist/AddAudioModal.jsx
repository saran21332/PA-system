import React, { useState } from 'react';
import cloudpurple from '../../assets/cloud-purple.png'; 
import cloudwhite from '../../assets/cloud-white.png'; 
import deleteimage from '../../assets/delete.png';
import musicpurple from '../../assets/music-purple.png';
import { uploadMusicFile } from "../../api/speakerapi";

const AddAudioModal = ({ isOpen, onClose, onUploadSuccess = () => {} }) => {
  const [pendingFiles, setPendingFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]); 
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;
  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter(file => file.type === 'audio/mpeg');
    const invalid = files.filter(file => file.type !== 'audio/mpeg');
    if (invalid.length > 0) {
      alert('กรุณาเลือกไฟล์ MP3 เท่านั้น');
    }
    const merged = [
      ...pendingFiles, 
      ...validFiles.filter(newFile => 
        !pendingFiles.some(oldFile => oldFile.name === newFile.name && oldFile.size === newFile.size)
      )
    ];
    setPendingFiles(merged);
    event.target.value = null;
  };

  const handleDeletePendingFile = (index) => {
    setPendingFiles(files => files.filter((_, idx) => idx !== index));
  };

  const handleDeleteUploadedFile = (fileId) => {
    setUploadedFiles(files => files.filter(file => file.id !== fileId));
  };

const handleUpload = async () => {
  if (pendingFiles.length === 0) {
    alert('กรุณาเลือกไฟล์ก่อนอัพโหลด');
    return;
  }
  setLoading(true);
  for (const file of pendingFiles) {
    try {
      const res = await uploadMusicFile(file);
      const fileData = res.data.data;
      const duration = await new Promise(resolve => {
        const audioEl = document.createElement("audio");
        audioEl.src = URL.createObjectURL(file);
        audioEl.addEventListener("loadedmetadata", () => resolve(Math.floor(audioEl.duration)));
      });
      const newFile = {
        id: fileData.zycoo_music_id,
        name: fileData.name,
        size: (file.size/1024/1024).toFixed(2)+' MB',
        duration: duration || 0
      };
      setUploadedFiles(prev => [newFile, ...prev].slice(0,3));
      window.dispatchEvent(new CustomEvent("audioUploaded", { detail: newFile }));
      if (onUploadSuccess) onUploadSuccess(newFile);
    } catch (err) {
      alert(err?.response?.data?.message || err.message || "อัพโหลดไม่สำเร็จ");
    }
  }

  setLoading(false);
  setPendingFiles([]);
  onClose();
};


  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="flex items-center justify-center mr-3">
              <img src={cloudpurple} alt="head" className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 prompt-bold">อัพโหลดไฟล์เสียง</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-5xl font-regular cursor-pointer"
          >
            ×
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <div className="border-2 border-dashed border-purple-300 rounded-xl p-8 text-center mb-6 bg-purple-50">
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center mb-4">
                <img src={cloudwhite} alt="cloud" className="w-25 h-25" />
              </div>
              <h3 className="text-2xl font-medium text-gray-800 prompt-regular mb-1">
                ลากไฟล์มาวางที่นี่
              </h3>
              <p className="text-md text-gray-500 prompt-regular mb-2">
                หรือคลิกเพื่อเลือกไฟล์
              </p>
              <label className="bg-gradient-to-r from-[#AD7CE1] to-[#EC77BA] text-white text-xl px-6 py-3 rounded-xl hover:from-[#9762bf] hover:to-[#d46ba7] prompt-light cursor-pointer shadow-xl">
                เลือกไฟล์เสียง
                <input 
                  type="file" 
                  multiple 
                  accept="audio/*"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={loading}
                />
              </label>
              <p className="text-xs text-gray-400 mt-1 prompt-regular">
                รองรับ MP3 (ไม่เกิน 128kbps) 
              </p>
            </div>
          </div>

          {pendingFiles.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-300 p-4 mb-4">
              <h3 className="text-lg font-semibold text-gray-800 prompt-bold mb-2 flex items-center">
                <div className="w-5 h-5 bg-purple-400 rounded-full mr-3 flex items-center justify-center" />
                ไฟล์ที่เลือก
              </h3>
              <div className="space-y-1">
                {pendingFiles.map((file, idx) => (
                  <div key={file.name + file.size} className="flex items-center justify-between py-1 px-2">
                    <div className="flex items-center flex-1 min-w-0">
                      <div className="w-12 h-12 flex-shrink-0 bg-white rounded-lg flex items-center justify-center border border-gray-400">
                        <img src={musicpurple} alt="music" className="w-6 h-6" />
                      </div>
                      <div className="flex flex-col ml-3 flex-1 min-w-0">
                        <p className="font-medium text-left text-gray-800 prompt-regular truncate">{file.name}</p>
                        <p className="text-sm text-left text-gray-500 prompt-regular truncate">{(file.size/1024/1024).toFixed(2) + " MB"}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeletePendingFile(idx)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition flex-shrink-0 ml-4"
                      disabled={loading}
                    >
                      <img src={deleteimage} alt="delete" className="w-6 h-6 cursor-pointer" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {uploadedFiles.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-800 prompt-bold mb-2 flex items-center">
                <div className="w-5 h-5 bg-purple-400 rounded-full mr-3 flex items-center justify-center" />
                อัพโหลดไฟล์ล่าสุด
              </h3>
              <div className="space-y-1">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between py-1 px-2">
                    <div className="flex items-center flex-1 min-w-0">
                      <div className="w-12 h-12 flex-shrink-0 bg-white rounded-lg flex items-center justify-center border border-gray-400">
                        <img src={musicpurple} alt="music" className="w-6 h-6" />
                      </div>
                      <div className="flex flex-col ml-3 flex-1 min-w-0">
                        <p className="font-medium text-left text-gray-800 prompt-regular truncate">{file.name}</p>
                        <p className="text-sm text-left text-gray-500 prompt-regular truncate">{file.size}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteUploadedFile(file.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition flex-shrink-0 ml-4"
                      disabled={loading}
                    >
                      <img src={deleteimage} alt="delete" className="w-6 h-6 cursor-pointer" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {loading && <div className="text-center text-purple-500 mt-4">กำลังอัพโหลด...</div>}
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button 
            onClick={onClose}
            className="px-6 py-3 text-gray-600 bg-gray-200  rounded-xl hover:bg-gray-300 shadow-xl transition prompt-bold cursor-pointer"
            disabled={loading}
          >
            ยกเลิก
          </button>
          <button 
            className="bg-gradient-to-r from-[#AD7CE1] to-[#EC77BA] text-white px-6 py-3 rounded-xl hover:from-[#9762bf] hover:to-[#d46ba7] prompt-regular shadow-lg cursor-pointer"
            onClick={handleUpload}
            disabled={loading || pendingFiles.length === 0}
          >
            เพิ่มไฟล์เสียง
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddAudioModal;