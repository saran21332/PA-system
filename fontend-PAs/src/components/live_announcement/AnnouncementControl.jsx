import io from "socket.io-client";
import React, { useEffect, useState, useRef } from 'react';
import { Square } from 'lucide-react';
import PlaylistSelector from './select/PlaylistSelector.jsx';
import SpeakerGroupSelector from './select/SpeakerGroupSelector.jsx';
import play from "../../assets/play-playlist.png";
import paused_image from "../../assets/pause-playlist.png";
import next from "../../assets/next-playlist.png";
import previous from "../../assets/previous.png";
import AppLayout from '../../page/AppLayout.jsx';
import { usePlaylistStore } from "../../store/playlistStore";
import {
  Announcement, StopAnnouncement, getPlaylists, getMusicLibrary, playPlaylist,
  stopPlaylist,
  setSpeakerVolume,
  pausePlaylist,
  getPlaybackStatus
} from "../../api/speakerapi";

const AnnouncementControlPanel = ({ forceSelectGroupId = null, onForceSelectHandled = () => { } }) => {
  const [playlists, setPlaylists] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedTab, setSelectedTab] = useState('live');
  const [playbackStatus, setPlaybackStatus] = useState({});
  const announcementTimerRef = useRef(null);
  const announcementElapsedTimeRef = useRef(0);
  const volumeChangeTimeout = useRef(null);
  const socketRef = useRef(null);
  const {
    selectedPlaylistId,
    selectedPlaylistForApi,
    setSelectedPlaylistForApi,
    setSelectedPlaylist,
    currentSongIndex,
    setCurrentSongIndex,
    elapsedTime,
    setElapsedTime,
    isPlaylistPlaying,
    setIsPlaylistPlaying,
    isPaused,
    setIsPaused,
    checkedSpeakers,
    setSelectedSpeakerGroup,
    setCheckedSpeakers,
    selectedGroupId,
    announcementElapsedTime,
    setAnnouncementElapsedTime,
    volume,
    setVolume
  } = usePlaylistStore();

  const storeSetPlaylist = (id, sourceId) => {
    if (typeof setSelectedPlaylist === 'function') setSelectedPlaylist(id, sourceId);
    if (typeof setSelectedPlaylistForApi === 'function') setSelectedPlaylistForApi(id);
  };

  const isCurrentPlaylistPlaying = selectedPlaylistId === selectedPlaylistForApi && isPlaylistPlaying;

  useEffect(() => {
    const socket = io("http://192.168.100.175:3500", { transports: ["websocket"] });

    socket.on("playback_status", (data) => {
      if (!data) return;

      setSelectedPlaylistForApi(`sourceId-${data.task_id}`);
      setCurrentSongIndex(Number(data.current_song_index) || 0);
      setElapsedTime(typeof data.elapsed_time === "number" ? data.elapsed_time : 0);
      setIsPaused(Boolean(data.is_paused));
      setIsPlaylistPlaying(data.status === "playing");
      if (Array.isArray(data.extension_number) && data.extension_number.length > 0) {
        setCheckedSpeakers(prev => {
          const newSet = new Set(prev || []);
          data.extension_number.forEach(id => newSet.add(id));
          return newSet;
        });
      }
      if (typeof data.volume === "number") {
      setVolume(data.volume * 10); 
  }
    });

    socket.on("announce_status", (data) => {
      setIsRecording(!!data);
      if (data && data.start_at) {
        const elapsed = Math.floor((Date.now() - new Date(data.start_at).getTime()) / 1000);
        setAnnouncementElapsedTime(elapsed);
      } else {
        setAnnouncementElapsedTime(0);
      }
    });

    return () => {
      socket.off("playback_status");
      socket.off("announce_status");
      socket.disconnect();
    };
  }, [
    setSelectedPlaylistForApi,
    setCurrentSongIndex,
    setElapsedTime,
    setIsPaused,
    setIsPlaylistPlaying,
    setCheckedSpeakers,
    setIsRecording,
    setAnnouncementElapsedTime
  ]);

  useEffect(() => {
    const fetchData = async () => {
      if (playlists.length > 1) return;

      try {
        const resPlaylists = await getPlaylists();
        const apiPlaylists = resPlaylists.data.playlists || [];
        const resLibrary = await getMusicLibrary();
        const librarySongs = resLibrary.data || [];

        const formatDuration = sec => {
          if (!sec) return "00:00";
          const totalSec = Math.floor(sec);
          const m = Math.floor(totalSec / 60);
          const s = totalSec % 60;
          return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        };

        const mappedPlaylists = apiPlaylists.map(p => ({
          id: `sourceId-${p.source_id}`,
          name: p.name,
          songs: p.songs.map(s => {
            const match = librarySongs.find(m => m.id === s.zycoo_music_id);
            return {
              name: s.name.replace(/\.[^/.]+$/, ''),
              duration: match ? formatDuration(match.duration) : '00:00',
              durationSec: match ? Math.floor(match.duration) : 0,
              zycoo_music_id: s.zycoo_music_id,
              music_id: s.music_id,
              playlist_id: s.playlist_id
            };
          })
        }));

        const finalPlaylists = [{ id: '', name: 'เลือก Playlist', songs: [] }, ...mappedPlaylists];
        setPlaylists(finalPlaylists);
      } catch (err) {
        console.error("❌ Failed to fetch playlists or library:", err);
      }
    };

    fetchData();
  }, [playlists.length]);

  useEffect(() => {
    if (forceSelectGroupId) {
      setSelectedSpeakerGroup && setSelectedSpeakerGroup(forceSelectGroupId + "");
      onForceSelectHandled();
    }
  }, [forceSelectGroupId, onForceSelectHandled, setSelectedSpeakerGroup]);
  useEffect(() => { announcementElapsedTimeRef.current = announcementElapsedTime; }, [announcementElapsedTime]);
  useEffect(() => {
    if (isRecording) {
      announcementTimerRef.current = setInterval(() => {
        setAnnouncementElapsedTime(announcementElapsedTimeRef.current + 1);
      }, 1000);
    } else {
      if (announcementTimerRef.current) {
        clearInterval(announcementTimerRef.current);
        announcementTimerRef.current = null;
      }
    }
    return () => {
      if (announcementTimerRef.current) {
        clearInterval(announcementTimerRef.current);
        announcementTimerRef.current = null;
      }
    };
  }, [isRecording, setAnnouncementElapsedTime]);

  const formatTime = seconds => {
    const n = Number.isFinite(seconds) ? seconds : 0;
    const h = String(Math.floor(n / 3600)).padStart(2, '0');
    const m = String(Math.floor((n % 3600) / 60)).padStart(2, '0');
    const s = String(Math.floor(n % 60)).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  useEffect(() => {
    const loadPlaybackStatus = async () => {
      try {
        const res = await getPlaybackStatus();
        const status = res?.data || {};
        if (!status) return;

        if (status.task_id) {
          const playlistIdFromAPI = `sourceId-${status.task_id}`;
          setSelectedPlaylistForApi(playlistIdFromAPI);
          setCurrentSongIndex(status.current_song_index ?? 0);
          setElapsedTime(typeof status.elapsed_time === "number" ? status.elapsed_time : 0);
        }

        if (status.extension_number?.length) {
          setCheckedSpeakers(new Set(status.extension_number));
        }

        setIsPlaylistPlaying(status.status === "playing");
        setIsPaused(Boolean(status.is_paused));
        if (typeof status.volume === 'number') {
        setVolume(status.volume * 10);
      }
      } catch (err) {
        console.error("Failed to fetch current playback status:", err);
      }
    };

    loadPlaybackStatus();
  }, []);

  const handlePlayPlaylist = async () => {
    const speaker_ids = Array.from(checkedSpeakers || []);
    if (!selectedPlaylistId) return alert("กรุณาเลือก Playlist");

    const res = await getPlaybackStatus({ playlistId: selectedPlaylistId });
    const status = res?.data || {};
    if (status.task_id && status.task_id === Number(selectedPlaylistId.replace("sourceId-", ""))
      && status.is_paused && status.status === "playing") {
      const resumeSpeakers = status.extension_number?.length ? status.extension_number : speaker_ids;
      if (!resumeSpeakers.length) return alert("กรุณาเลือกลำโพงก่อนเล่นต่อ");

      try {
        await playPlaylist({ speaker_ids: resumeSpeakers, action: "play", sourceId: selectedPlaylistId, hardVolume: Math.floor(volume / 10) });
        setIsPlaylistPlaying(true);
        setIsPaused(false);
        setPlaybackStatus({ ...status, is_paused: false, status: "playing" });
        return;
      } catch (err) {
        console.error("Resume failed:", err);
        return;
      }
    }
    if (status.status === "playing" && status.task_id && status.task_id !== Number(selectedPlaylistId.replace("sourceId-", ""))) {
      try {
        await stopPlaylist({ speaker_ids, sourceId: `sourceId-${status.task_id}`, action: "stop" });
      } catch (err) {
        console.error(err);
      }
      setIsPlaylistPlaying(false);
      setIsPaused(false);
    }
    if (!speaker_ids.length) return alert("กรุณาเลือกลำโพงก่อนเริ่มเล่น");
    setSelectedPlaylistForApi(selectedPlaylistId);
    setCurrentSongIndex(0);
    setElapsedTime(0);
    try {
      await playPlaylist({ speaker_ids, action: "play", sourceId: selectedPlaylistId, hardVolume: Math.floor(volume / 10) });
      setIsPlaylistPlaying(true);
      setIsPaused(false);
      setPlaybackStatus({ task_id: Number(selectedPlaylistId.replace("sourceId-", "")), status: "playing", is_paused: false, extension_number: speaker_ids });
    } catch (err) {
      console.error("Start playlist failed:", err);
      setIsPlaylistPlaying(false);
      setIsPaused(true);
    }
  };

  const handlePauseResume = async () => {
    const speaker_ids = Array.from(checkedSpeakers || []);
    if (!selectedPlaylistForApi) return;
    try {
      await pausePlaylist({ speaker_ids, sourceId: selectedPlaylistForApi, action: "pause" });
      setIsPaused(!isPaused);
      setPlaybackStatus(prev => ({ ...prev, isPaused: !isPaused }));
    } catch (err) { console.error(err); }
  };

  const handleNextPrev = async type => {
    if (!selectedPlaylistForApi) return;
    const pl = playlists.find(p => p.id === selectedPlaylistForApi);
    if (!pl?.songs?.length) return;
    const nextIndex = type === 'next' ? (currentSongIndex + 1) % pl.songs.length : (currentSongIndex - 1 + pl.songs.length) % pl.songs.length;
    setCurrentSongIndex(nextIndex); setElapsedTime(0);
    const speaker_ids = Array.from(checkedSpeakers || []);
    if (!speaker_ids.length) return alert("กรุณาเลือกลำโพงก่อนเปลี่ยนเพลง");
    try { await pausePlaylist({ speaker_ids, sourceId: selectedPlaylistForApi, action: type }); } catch (err) { console.error(err); }
  };

  const handleVolumeChange = (e) => {
    const value = parseInt(e.target.value);
    const snapValues = [10,20,30,40,50,60,70,80,90];
    const closest = snapValues.reduce((prev, curr) =>
      Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
    );

    setVolume(closest);
    const speaker_ids = Array.from(checkedSpeakers || []);
    if (!speaker_ids.length) return;

    if (volumeChangeTimeout.current) clearTimeout(volumeChangeTimeout.current);
    volumeChangeTimeout.current = setTimeout(async () => {
      try {
        await setSpeakerVolume({ speaker_ids, hardVolume: Math.floor(closest / 10) });
      } catch (err) {
        console.error(err);
      }
    }, 300);
  };

  const handleStartAnnouncement = async () => {
    setIsRecording(true);
    setAnnouncementElapsedTime(0);
    await Announcement(Array.from(checkedSpeakers || []));
  };

  const handleStopAnnouncement = async () => {
    setIsRecording(false);
    setAnnouncementElapsedTime(0);
    await StopAnnouncement();
  };

  return (
    <AppLayout playlists={playlists}>
      <div className="bg-white mt-5 rounded-lg p-4 shadow-2xl h-[820px] flex flex-col w-full max-w-full">
        <div className="flex-shrink-0 mb-4 flex border-b border-gray-200">
          <button onClick={() => setSelectedTab('live')} className={`flex-1 py-3 px-1 text-md font-medium transition-colors relative prompt-regular cursor-pointer ${selectedTab === 'live' ? 'bg-gradient-to-r from-[#AD7CE1] to-[#EC77BA] bg-clip-text text-transparent' : 'text-gray-500 hover:text-gray-700'}`}>ประกาศสด</button>
          <button onClick={() => setSelectedTab('playlist')} className={`flex-1 py-3 px-1 text-md font-medium transition-colors relative prompt-regular cursor-pointer ${selectedTab === 'playlist' ? 'bg-gradient-to-r from-[#AD7CE1] to-[#EC77BA] bg-clip-text text-transparent' : 'text-gray-500 hover:text-gray-700'}`}>เล่น Playlist</button>
        </div>

        <div className="flex-1 flex flex-col space-y-4">
          {selectedTab === 'playlist' && (
            <div className="h-65">
              <PlaylistSelector
                playlists={playlists}
                selectedPlaylistId={selectedPlaylistId}
                setSelectedPlaylistId={setSelectedPlaylist}
                disableControl={isPlaylistPlaying && selectedTab === "playlist" && selectedPlaylistId === selectedPlaylistForApi}
              />
            </div>
          )}
          <div className={`${selectedTab === 'playlist' ? 'h-59' : 'h-140'} overflow-y-auto`}>
            <SpeakerGroupSelector selectedTab={selectedTab} />
          </div>
        </div>

        <div className="flex-shrink-0">
          {selectedTab === 'playlist' && (
            <div className="bg-white rounded-xl p-3 border border-gray-300 mt-3">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm text-left font-medium text-gray-700 prompt-bold">ระดับเสียง</label>
                <span className="bg-gradient-to-r from-[#AD7CE1] to-[#EC77BA] bg-clip-text text-transparent text-sm font-medium">{volume}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="90"
                step="1"
                value={volume}
                onChange={handleVolumeChange}
                className="volume-slider w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style={{ background: `linear-gradient(to right, #AD7CE1 0%, #EC77BA ${(volume - 10) / 80 * 100}%, #e5e7eb ${(volume - 10) / 80 * 100}%, #e5e7eb 100%)` }}
              />
            </div>
          )}

          <div className="flex flex-col flex-grow justify-between mt-3">
            {selectedTab === 'playlist' && (() => {
              const currentPlaylist = playlists.find(p => p.id === selectedPlaylistForApi);
              const currentSong = currentPlaylist?.songs?.[currentSongIndex];
              return (
                <div className="text-sm font-semibold text-gray-500 truncate px-2 prompt-regular">
                  {currentSong?.name || "ยังไม่ได้เลือกเพลง"}
                </div>
              );
            })()}

            <div className="text-md font-mono font-light text-gray-500">
              {selectedTab === 'live'
                ? formatTime(announcementElapsedTime)
                : formatTime(elapsedTime)}
            </div>
          </div>


          <div className="flex justify-center items-center space-x-5">
            {selectedTab === 'playlist' ? (
              <>
                <button onClick={() => handleNextPrev('previous')}>
                  <img src={previous} alt="Previous" className="w-15 h-20 cursor-pointer" />
                </button>

                <button
                  onClick={() => {
                    if (isCurrentPlaylistPlaying) {
                      handlePauseResume();
                    } else {
                      handlePlayPlaylist();
                    }
                  }}
                >
                  {isCurrentPlaylistPlaying ? (
                    isPaused ? (
                      <img src={play} alt="Resume" className="w-15 h-20 cursor-pointer" />
                    ) : (
                      <img src={paused_image} alt="Pause" className="w-15 h-20 cursor-pointer" />
                    )
                  ) : (
                    <img src={play} alt="Play" className="w-15 h-20 cursor-pointer" />
                  )}
                </button>

                <button onClick={() => handleNextPrev('next')}>
                  <img src={next} alt="Next" className="w-15 h-20 cursor-pointer" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => (isRecording ? handleStopAnnouncement() : handleStartAnnouncement())}
                  className={`w-full py-4 mb-10 rounded-2xl cursor-pointer font-medium transition-all duration-200 flex items-center justify-center space-x-2 shadow-xl ${isRecording ? 'bg-red-400 hover:bg-red-500' : 'bg-gradient-to-r from-[#AD7CE1] to-[#EC77BA] text-white'}`}
                >
                  {isRecording ? (<><Square size={20} /> <span>หยุดประกาศ</span></>) : 'เริ่มประกาศ'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AnnouncementControlPanel;
