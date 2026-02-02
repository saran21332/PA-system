import React, { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import add from '../../assets/add.png';
import musicwhite from '../../assets/music-white.png';
import musicpurple from '../../assets/music-purple.png';
import add2 from '../../assets/add2.png';
import deleteimage from '../../assets/delete.png';
import shuffle from '../../assets/shuffle.png';
import { getMusicLibrary, createPlaylist } from "../../api/speakerapi";
import { showSuccess, showError, showWarning } from '../../components/ToastNotifier';

// function cleanFileName(filename) {
//   if (!filename) return "";
//   let nameWithoutExt = filename.replace(/\.[^/.]+$/, ""); 
//   return nameWithoutExt.split("-")[0]; 
// }

function cleanFileName(filename) {
  if (!filename) return "";
  let nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
  return nameWithoutExt.replace(/-Tal\d+$/, "");
}

function formatTime(sec) {
  if (!sec && sec !== 0) return '-';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const CreatePlaylistModal = ({ isOpen, onClose }) => {
  const [playlistName, setPlaylistName] = useState('');
  const [remark, setRemark] = useState('');
  const [dragIndex, setDragIndex] = useState(null);
  const [audios, setAudios] = useState([]);
  const [search, setSearch] = useState("");
  const [playlist, setPlaylist] = useState([]);

  useEffect(() => {
  if (!isOpen) return;
  const fetchLibrary = async () => {
    try {
      const res = await getMusicLibrary();
      setAudios(res.data || []);
    } catch (err) {
      setAudios([]);
    }
  };
  fetchLibrary();
}, [isOpen]); 

useEffect(() => {
  const uploadHandler = (e) => {
    const newAudio = e.detail;
    setAudios(prev => {
      if (prev.find(a => a.id === newAudio.id)) return prev;
      return [newAudio, ...prev];
    });
  };
  const deleteHandler = (e) => {
    setAudios(prev => prev.filter(a => a.id !== e.detail));
    setPlaylist(prev => prev.filter(p => p.id !== e.detail));
  };
  window.addEventListener("audioUploaded", uploadHandler);
  window.addEventListener("audioDeleted", deleteHandler);
  return () => {
    window.removeEventListener("audioUploaded", uploadHandler);
    window.removeEventListener("audioDeleted", deleteHandler);
  };
}, []);

  const handleDragStart = (e, index) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e, index) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    const updated = [...playlist];
    const [moved] = updated.splice(dragIndex, 1);
    updated.splice(index, 0, moved);
    setPlaylist(updated);
    setDragIndex(null);
  };
  const handleDragEnd = () => setDragIndex(null);

  const handleAddSong = (song) => {
    if (!playlist.find(p => p.id === song.id)) {
      setPlaylist(prev => [...prev, song]);
    }
  };

  const handleRemoveSong = (id) => {
    setPlaylist(prev => prev.filter(s => s.id !== id));
  };

  const handleSavePlaylist = async () => {
    if (!playlistName) {
      showWarning("กรุณาใส่ชื่อ Playlist");
      return;
    }
    if (playlist.length === 0) {
      showWarning("กรุณาเพิ่มเพลงลง Playlist อย่างน้อย 1 เพลง");
      return;
    }
    const payload = {
      playList: {
        name: playlistName,
        musicLibraryIds: playlist.map(s => s.id),
        remark
      }
    };

    try {
      await createPlaylist(payload);
      showSuccess(`สร้าง Playlist "${playlistName}" สำเร็จ!`);
      window.dispatchEvent(new Event("playlistCreated"));
      setPlaylist([]);
      setPlaylistName('');
      setRemark('');
      onClose();
    } catch (err) {
      console.error("Failed to create playlist:", err.response?.data || err.message);
      showError(`เกิดข้อผิดพลาด: ${err.response?.data?.message || err.message}`);
    }
  };

  if (!isOpen) return null;

  const filteredAudios = audios.filter(song =>
    cleanFileName(song.name).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/50 custom-scrollbar">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center mb-1">
            <img src={add} alt="Stop" className="w-5 h-5" />
            <h2 className="text-2xl font-semibold text-gray-800 prompt-bold ml-4">สร้าง Playlist</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
            <X className="w-6 h-6 text-gray-500 cursor-pointer" />
          </button>
        </div>

        <div className="p-6 pt-1 pb-1 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="mb-3">
            <label className="block text-md text-left font-medium text-gray-700 mb-1 prompt-bold">
              ชื่อ Playlist <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              placeholder="เช่น เพลงชาติ, เพลงกีฬา"
              required
              className="w-full px-4 py-2.5 border border-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#AD7CE1] focus:border-[#AD7CE1] text-sm prompt-regular"
            />
          </div>

          <div className="mb-6">
            <label className="block text-md text-left font-medium text-gray-700 mb-1 prompt-bold">
              remark
            </label>
            <input
              type="text"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="เช่น เล่นทุกวันตอน 7.30"
              className="w-full px-4 py-2.5 border border-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#AD7CE1] focus:border-[#AD7CE1] text-sm prompt-regular"
            />
          </div>

          <div className="mb-3 w-full">
            <label className="block text-md text-left font-medium text-gray-700 mb-1 prompt-bold">
              เพิ่มไฟล์เสียงลงใน Playlist
            </label>
            <div className="relative w-full">
              <input 
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหาไฟล์เสียง...."
                className="w-full px-4 py-2.5 bg-white border border-gray-400 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#AD7CE1] focus:border-[#AD7CE1] prompt-regular"
              />
              <Search className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div className="bg-gray-200 rounded-lg p-2 mb-3">
            <div className="space-y-1">
              {filteredAudios.map((song) => (
                <div key={song.id} className="flex items-center justify-between p-2 bg-gray-200 rounded-lg">
                  <div className="flex items-center flex-1 min-w-0">
                    <div className="w-12 h-12 flex-shrink-0 bg-gray-200 rounded-lg flex items-center justify-center border border-gray-400">
                      <img src={musicwhite} alt="music" className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col ml-3 flex-1 min-w-0">
                      <p className="font-medium text-left text-gray-800 prompt-regular truncate">{cleanFileName(song.name)}</p>
                      <p className="text-sm text-left text-gray-500 prompt-regular truncate">{formatTime(song.duration)}</p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 w-12 flex justify-center">
                    <button onClick={() => handleAddSong(song)} className="p-2">
                      <img src={add2} alt="add" className="w-8 h-8 cursor-pointer" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {playlist.length > 0 && (
            <div className="pt-6">
              <div className="flex items-center mb-4">
                <h3 className="text-md font-semibold text-gray-800 prompt-bold">
                  เพลงใน Playlist ({playlist.length}) • รวม
                </h3>
                <span className="text-purple-400 ml-2 prompt-bold">
                  {formatTime(playlist.reduce((acc, s) => acc + (s.duration || 0), 0))}
                </span>
              </div>

              <div className="bg-white rounded-lg border border-gray-400 p-4">
                <div className="divide-y divide-gray-200">
                  {playlist.map((song, index) => (
                    <div
                      key={song.id}
                      className={`flex items-center justify-between ${index === 0 ? 'pb-4' : 'py-4'}`}
                      onDragOver={(e) => handleDragOver(e)}
                      onDrop={(e) => handleDrop(e, index)}
                    >
                      <div className="flex items-center flex-1 min-w-0">
                        <div className="w-12 h-12 flex-shrink-0 bg-white rounded-lg flex items-center justify-center border border-gray-400">
                          <img src={musicpurple} alt="music" className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col flex-1 ml-3 min-w-0">
                          <p className="font-medium text-left text-gray-800 prompt-regular truncate">{cleanFileName(song.name)}</p>
                          <p className="text-sm text-left text-gray-500 prompt-regular truncate">{formatTime(song.duration)}</p>
                        </div>
                      </div>
                      <div className="flex gap-0.5 flex-shrink-0">
                        <button
                          className="p-2 text-red-500 hover:bg-red-100 rounded-full transition"
                          onClick={() => handleRemoveSong(song.id)}
                        >
                          <img src={deleteimage} alt="remove" className="w-6 h-6 cursor-pointer" />
                        </button>
                        <button
                          className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition"
                          draggable
                          onDragStart={(e) => handleDragStart(e, index)}
                          onDragEnd={handleDragEnd}
                        >
                          <img src={shuffle} alt="shuffle" className="w-6 h-6 cursor-pointer" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        <div className="flex justify-end gap-4 p-6 bg-white">
          <button
            onClick={onClose}
            className="px-6 py-3 text-gray-600 bg-gray-200 rounded-xl hover:bg-gray-300 shadow-xl transition prompt-bold cursor-pointer"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSavePlaylist}
            className="px-6 py-3 bg-gradient-to-r from-[#A86DD5] to-[#EC77BA] text-white rounded-xl hover:from-[#9762bf] hover:to-[#d46ba7] transition prompt-bold shadow-xl cursor-pointer"
          >
            บันทึกเพลงลิสต์
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePlaylistModal;
