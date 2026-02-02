import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { getPlaylists, deletePlaylist } from "../../api/speakerapi";
import EditPlaylistModal from './editplaylistModal.jsx';
import delete2 from '../../assets/delete2.png';

const PlaylistComponent = ({ createPlaylistRef }) => {
  const [playlists, setPlaylists] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPlaylists = async () => {
    try {
      const res = await getPlaylists();
      setPlaylists(res.data.playlists || []);
    } catch (err) {
      console.error('Failed to fetch playlists:', err);
      setPlaylists([]);
    }
  };

  useEffect(() => { fetchPlaylists() }, []);
  useEffect(() => {
    const handleAudioDeleted = async () => { await fetchPlaylists(); };
    window.addEventListener("audioDeleted", handleAudioDeleted);
    return () => window.removeEventListener("audioDeleted", handleAudioDeleted);
  }, []);
  useEffect(() => {
    const handleRefresh = async () => { await fetchPlaylists() };
    window.addEventListener("playlistCreated", handleRefresh);
    window.addEventListener("playlistDeleted", handleRefresh);
    return () => {
      window.removeEventListener("playlistCreated", handleRefresh);
      window.removeEventListener("playlistDeleted", handleRefresh);
    };
  }, []);
  useEffect(() => {
    if (createPlaylistRef) {
      createPlaylistRef.current = {
        onPlaylistCreated: fetchPlaylists,
      };
    }
  }, [createPlaylistRef]);

  const filteredPlaylists = playlists.filter(pl =>
    pl.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditClick = (playlist) => {
    setSelectedPlaylist(playlist);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (playlist) => {
    setGroupToDelete(playlist);
  };

  const cancelDelete = () => {
    setGroupToDelete(null);
  };

  const confirmDelete = async () => {
    if (!groupToDelete) return;
    setDeleting(true);
    try {
      await deletePlaylist(groupToDelete.id);
      await fetchPlaylists();
    } catch (err) {
      console.error('Delete error:', err);
      alert('Delete failed');
    } finally {
      setDeleting(false);
      setGroupToDelete(null);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 prompt-bold">
          Playlist ({playlists.length} รายการ)
        </h3>
        <div className="relative w-[320px]">
          <input
            type="text"
            placeholder="ค้นหา playlist...."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-12 pl-5 py-2.5 bg-white border border-gray-300 rounded-full text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#AD7CE1] focus:border-[#AD7CE1] prompt-regular"
          />
          <Search className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <div className="space-y-4 max-h-[calc(5*73px)] overflow-y-auto overflow-x-hidden custom-scrollbar">
        {filteredPlaylists.map(pl => (
          <div key={pl.id} className="flex items-center border border-gray-200 rounded-2xl px-6 py-4">
            <div className="flex-1">
              <div className="text-md ml-1 text-left font-semibold text-gray-800 prompt-regular truncate max-w-xs">
                {pl.name}
              </div>
              <div className="text-sm ml-1 text-left text-gray-500 prompt-regular truncate max-w-xs">
                {pl.remark}
              </div>
              <div className="mt-1 flex space-x-2">
                <button
                  onClick={() => handleDeleteClick(pl)}
                  className="px-4 py-1 rounded-xl bg-red-400 hover:bg-red-500 text-white text-sm font-semibold prompt-regular cursor-pointer"
                >
                  ลบ
                </button>
                <button
                  className="px-4 py-1 rounded-xl bg-gray-200 text-gray-600 text-sm font-semibold prompt-regular hover:bg-gray-300 transition cursor-pointer"
                  onClick={() => handleEditClick(pl)}
                >
                  แก้ไข
                </button>
              </div>
            </div>

            <div className="ml-6 flex items-center">
              <span className="px-4 py-1 rounded-full text-xs font-medium bg-[#AD7CE1] text-white prompt-regular">
                {pl.songs?.length || 0} เพลง
              </span>
            </div>
          </div>
        ))}
      </div>

      {editModalOpen && selectedPlaylist && (
        <EditPlaylistModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          playlistId={selectedPlaylist.id}
          initialData={selectedPlaylist}
          onPlaylistUpdated={fetchPlaylists}
        />
      )}

      {groupToDelete && (
        <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-lg text-center kanit-regular">
            <div className="flex items-center justify-center mx-auto mb-4 bg-red-100/50 rounded-full w-25 h-25">
              <img src={delete2} className="h-12 w-12 object-contain block" alt="delete" />
            </div>
            <p className="mb-1 text-xl font-semibold text-gray-800 prompt-regular">
              ยืนยันการลบ Playlist
            </p>
            <p className="mb-3 text-l font-semibold text-gray-600 prompt-regular">
              คุณแน่ใจหรือไม่ว่าต้องการลบ "{groupToDelete.name}"?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={cancelDelete}
                className="px-6 py-2 rounded-lg border text-red-500 border-red-400 hover:bg-purple-50 transition prompt-regular cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="px-6 py-2 rounded-lg border bg-red-500 text-white transition prompt-regular cursor-pointer"
              >
                {deleting ? 'กำลังลบ...' : 'ยืนยัน'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaylistComponent;
