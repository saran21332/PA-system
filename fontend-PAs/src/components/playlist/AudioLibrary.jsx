import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import play from '../../assets/play-purple2.png';
import musicpurple from '../../assets/music-purple.png';
import { getMusicLibrary, deleteMusic } from '../../api/speakerapi';

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

const AudioLibrary = () => {
  const [audios, setAudios] = useState([]);
  const [search, setSearch] = useState("");
  const [audioToDelete, setAudioToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAudios = async () => {
    try {
      const res = await getMusicLibrary();
      setAudios(res.data);
    } catch (err) {
      setAudios([]);
    }
  };

  useEffect(() => {
    fetchAudios();
    const handler = (e) => {
    const newAudio = e.detail;
    setAudios(prev => {
      if (prev.find(a => a.id === newAudio.id)) return prev;
      return [newAudio, ...prev];
    });
  };
    window.addEventListener("audioUploaded", handler);
    return () => window.removeEventListener("audioUploaded", handler);
  }, []);

  const filterAudios = audios.filter(
    audio => audio.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handlePlay = (audio) => {
    const fileUrl = `${import.meta.env.VITE_MY_API}/uploads/${audio.name}`;
    localStorage.setItem("currentSong", JSON.stringify({
      name: audio.name,
      url: fileUrl
    }));
    window.dispatchEvent(new Event("musicChanged"));
    localStorage.setItem("autoPlay", "true");
  };

  const handleDeleteClick = (audio) => {
    setAudioToDelete(audio);
  };

  const cancelDelete = () => {
    setAudioToDelete(null);
  };


const confirmDelete = async () => {
  if (!audioToDelete) return;
  setDeleting(true);
  try {
    await deleteMusic(audioToDelete.id); 
    setAudios(prev => prev.filter(a => a.id !== audioToDelete.id));
    window.dispatchEvent(
      new CustomEvent("audioDeleted", { detail: audioToDelete.zycoo_music_id })
    );
  } catch (err) {
    alert(err?.response?.data?.message || "ลบเพลงไม่สำเร็จ");
  } finally {
    setDeleting(false);
    setAudioToDelete(null);
  }
};

  return (
    <div className="bg-white rounded-xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 prompt-bold">
          ไฟล์เสียงทั้งหมด ({filterAudios.length} ไฟล์)
        </h3>
        <div className="relative w-[320px]">
          <input
            type="text"
            placeholder="ค้นหาไฟล์เสียง...."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pr-12 pl-5 py-2.5 bg-white border border-gray-300 rounded-full text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#AD7CE1] focus:border-[#AD7CE1] prompt-regular"
          />
          <Search className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <div className="border-b border-gray-300 -mx-6 mb-0"></div>

      <div className="space-y-2 max-h-[calc(5*73px)] overflow-y-auto overflow-x-hidden custom-scrollbar">
        {filterAudios.map(audio => (
          <div
            key={audio.id}
            className="flex items-center justify-between px-2 py-3 border-b border-gray-300 -mx-6 mb-0"
          >
            <div className="w-12 h-12 ml-5 bg-white rounded-lg border border-gray-400 flex items-center justify-center">
              <img src={musicpurple} alt="music" className="w-6 h-6" />
            </div>
            <div className="flex-1 flex flex-col justify-center ml-4">
              <div className="font-medium text-left text-gray-800 prompt-regular">
                {cleanFileName(audio.name)}
              </div>
              <div className="text-sm text-left text-gray-400 prompt-regular flex items-center gap-2">
                <span>{formatTime(audio.duration)}</span>
                <button
                  onClick={() => handleDeleteClick(audio)}
                  className="text-red-500 hover:underline text-sm cursor-pointer"
                >
                  ลบ
                </button>
              </div>
            </div>
            <button onClick={() => handlePlay(audio)}>
              <img src={play} alt="play" className="w-8 h-8 cursor-pointer mr-8" />
            </button>
          </div>
        ))}
      </div>

      {audioToDelete && (
        <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-lg text-center kanit-regular">
            <p className="mb-1 text-xl font-semibold text-gray-800 prompt-regular">
              ยืนยันการลบเพลง
            </p>
            <p className="mb-3 text-l font-semibold text-gray-600 prompt-regular">
              คุณแน่ใจหรือไม่ว่าต้องการลบ "{cleanFileName(audioToDelete.name)}" หากลบเพลงจะทำให้เพลลิสที่มีเพลงนี้ถูกลบไปด้วย ?
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

export default AudioLibrary;
