import React, { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import CreatePlaylistModal from '../../playlist/CreatePlaylistModal.jsx';
import { usePlaylistStore } from '../../../store/playlistStore';
import { getPlaybackStatus } from '../../../api/speakerapi.jsx'; 

function formatDuration(duration) {
  if (typeof duration === 'string' && duration.includes(':')) return duration;
  const s = Math.floor(duration % 60);
  const m = Math.floor((duration / 60) % 60);
  const h = Math.floor(duration / 3600);
  return `${h > 0 ? String(h).padStart(2,'0')+':' : ''}${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function sumDuration(songs) {
  let totalSec = 0;
  songs.forEach(s => {
    if (typeof s.duration === 'string' && s.duration.includes(':')) {
      const parts = s.duration.split(':').reverse();
      let sec = 0;
      if (parts.length === 2) sec = Number(parts[1]) * 60 + Number(parts[0]);
      else if (parts.length === 3) sec = Number(parts[2]) * 3600 + Number(parts[1]) * 60 + Number(parts[0]);
      totalSec += sec;
    } else if (typeof s.duration === 'number') totalSec += s.duration;
  });
  return formatDuration(totalSec);
}

const PlaylistSelector = ({ playlists = [] }) => {
  const [showModal, setShowModal] = useState(false);
  const { selectedPlaylistId, selectedPlaylistForApi, setSelectedPlaylist, setSelectedPlaylistId } = usePlaylistStore();
  
useEffect(() => {
  const fetchPlaybackStatus = async () => {
    try {
      const res = await getPlaybackStatus();
      if (res?.task_type === 'playlist' && res?.task_id) {
        const playlistIdFromAPI = `sourceId-${res.task_id}`;
        setSelectedPlaylistId(playlistIdFromAPI);
        setSelectedPlaylist(playlistIdFromAPI, playlistIdFromAPI);
      }
    } catch (err) {
      console.error('Failed to fetch playback status:', err);
    }
  };

  fetchPlaybackStatus();
}, [setSelectedPlaylist, setSelectedPlaylistId]);


  const displaySongs = !selectedPlaylistId ? [] : playlists.find(p => p.id === selectedPlaylistId)?.songs || [];

  const handleChange = e => {
    setSelectedPlaylistId(e.target.value);
  };

  return (
    <div className="h-full bg-[#EFF0F2] rounded-xl border border-gray-200 p-4 flex-1 flex flex-col min-h-0 shadow-lg">
      <div className="flex justify-between items-center mb-2 flex-shrink-0">
        <label className="block text-md text-left font-medium text-gray-800 prompt-bold">เลือก Playlist</label>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="group items-center justify-center rounded-full bg-gradient-to-r from-[#AD7CE1] to-[#EC77BA] p-[2px]"
        >
          <div className="text-sm px-2 py-0.5 items-center justify-center rounded-full bg-[#EFF0F2] text-[#AD7CE1] cursor-pointer prompt-regular">
            สร้างPlaylist
          </div>
        </button>
      </div>

      {showModal && <CreatePlaylistModal isOpen={showModal} onClose={() => setShowModal(false)} />}

      <div className="relative mb-3 flex-shrink-0">
        <select
          value={selectedPlaylistId || ''}
          onChange={handleChange}
          className="text-xs w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#AD7CE1] focus:border-[#AD7CE1] prompt-regular appearance-none bg-white pr-10"
        >
          {playlists.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
      </div>

      {displaySongs.length > 0 && (
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 bg-white rounded-2xl min-h-0 overflow-y-auto custom-scrollbar">
            <div className="space-y-1 p-1">
              {displaySongs.map((song, idx) => (
                <div key={idx} className="bg-white px-3 py-2 border-b border-gray-200 last:border-b-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-800 prompt-regular">{song.name}</span>
                    <span className="text-gray-500 text-xs">{formatDuration(song.duration)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-300 text-right text-xs text-gray-600 prompt-regular flex-shrink-0">
            รวมทั้งหมด {sumDuration(displaySongs)}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaylistSelector;
