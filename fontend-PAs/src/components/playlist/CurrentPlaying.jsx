import React, { useState, useRef, useEffect } from 'react';
import nextpurple from '../../assets/next-purple.png';
import pausepurple from '../../assets/pause-purple.png';
import playpurple from '../../assets/play-purple.png';
import musicwhite from '../../assets/music-white.png';

function formatTime(time) {
  const min = Math.floor(time / 60);
  const sec = Math.floor(time % 60);
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

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

const CurrentPlaying = () => {
  const audioRef = useRef(null);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

useEffect(() => {
  const song = localStorage.getItem('currentSong');
  if (song) {
    const parsed = JSON.parse(song);
    setCurrentSong(parsed);
  }
  const handler = () => {
    const song = localStorage.getItem('currentSong');
    if (song) {
      const parsed = JSON.parse(song);
      setCurrentSong(parsed);
    }
  };
  window.addEventListener('musicChanged', handler);
  return () => window.removeEventListener('musicChanged', handler);
}, []);

useEffect(() => {
  if (currentSong && audioRef.current) {
    if (isPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    } else {
      audioRef.current.pause();
    }
  }
}, [currentSong, isPlaying])

useEffect(() => {
  if (currentSong) {
    const shouldAutoPlay = localStorage.getItem("autoPlay") === "true";
    if (shouldAutoPlay) {
      setIsPlaying(true); 
      localStorage.removeItem("autoPlay");
    }
  }
}, [currentSong]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleTogglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    if (!audioRef.current) return;
    const bar = e.target.getBoundingClientRect();
    const clickX = e.nativeEvent.clientX - bar.left;
    const ratio = Math.max(0, Math.min(1, clickX / bar.width));
    const newTime = ratio * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };
  const percent = duration ? (currentTime / duration) * 100 : 0;
  if (!currentSong) {
    return (
      <div className="bg-[rgb(230,233,236)] rounded-lg border border-gray-400 p-4 pb-0 mb-6">
        <p className="pt-15 pb-15 text-gray-500 text-center prompt-regular">ยังไม่ได้เลือกเพลง</p>
      </div>
    );
  }

  return (
    <div className="bg-[#E6E9EC] rounded-lg border border-gray-400 p-4 pb-0 mb-6">
      <div className="flex items-center mb-1">
        <img src={nextpurple} alt="next Icon" className="w-6 h-6 object-contain mr-2" />
        <h3 className="text-lg text-left font-semibold text-gray-700 prompt-bold">กำลังเล่น</h3>
      </div>

      <div className="bg-[#E6E9EC] p-2 rounded-lg">
        <div className="flex items-center gap-3 -mb-2">
          <div className="w-12 h-12 bg-[#E6E9EC] rounded-lg border border-gray-400 flex items-center justify-center">
            <img src={musicwhite} alt="music" className="w-6 h-6" />
          </div>
          <div>
            <p className="font-medium text-left text-gray-800 prompt-regular">{cleanFileName(currentSong.name)}</p>
            <p className="text-sm text-left text-gray-500 prompt-regular">
              {formatTime(duration)}
            </p>
          </div>
        </div>

        <div className="flex items-center mt-3">
          <div className="flex-1 relative">
            <div
              className="w-full bg-gray-300 rounded-full h-3 cursor-pointer"
              onClick={handleSeek}
            >
              <div
                className="bg-gradient-to-r from-[#AD7CE1] to-[#EC77BA] h-3 rounded-full transition-all duration-300"
                style={{ width: `${percent}%` }}
              ></div>
            </div>
            <div style={{
              position: "absolute",
              left: 0, right: 0, bottom: -22,
              display: "flex", justifyContent: "space-between",
              width: "100%", fontSize: "0.9em"
            }}>
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
          <button
            onClick={handleTogglePlay}
            className="ml-3 p-3 hover:bg-purple-100 rounded-full transition cursor-pointer"
          >
            {isPlaying ? (
              <img src={pausepurple} alt="Stop" className="w-8 h-8" />
            ) : (
              <img src={playpurple} alt="Play" className="w-8 h-8" />
            )}
          </button>
        </div>

        <audio
          ref={audioRef}
          src={currentSong.url}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
        />
      </div>
    </div>
  );
};

export default CurrentPlaying;
