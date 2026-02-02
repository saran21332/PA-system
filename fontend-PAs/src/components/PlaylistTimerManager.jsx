// import { useEffect, useRef } from "react";
// import { usePlaylistStore } from "../store/playlistStore";
// import { getPlaylists, getMusicLibrary, getPlaybackStatus, updatePlaybackStatus } from "../api/speakerapi";

// const PlaylistTimerManager = () => {
//   const { isPlaylistPlaying, isPaused, selectedPlaylistForApi, setElapsedTime, elapsedTime, currentSongIndex, setCurrentSongIndex, playlists, setPlaylists } = usePlaylistStore();
//   const elapsedTimeRef = useRef(elapsedTime);
//   const currentSongIndexRef = useRef(currentSongIndex);
//   const playlistsRef = useRef(playlists);
//   const timerRef = useRef(null);
//   const getPlaylistIdNumber = (sourceId) => {
//     if (!sourceId) return null;
//     if (typeof sourceId === "string" && sourceId.startsWith("sourceId-")) {
//       return Number(sourceId.replace("sourceId-", ""));
//     }
//     return Number(sourceId);
//   };

//   useEffect(() => {
//     const fetchPlaylists = async () => {
//       if (playlists.length > 0) return;

//       try {
//         const resPlaylists = await getPlaylists();
//         const apiPlaylists = resPlaylists.data.playlists || [];
//         const resLibrary = await getMusicLibrary();
//         const librarySongs = resLibrary.data || [];

//         const formatDuration = (sec) => {
//           if (!sec) return "00:00";
//           const totalSec = Math.floor(sec);
//           const m = Math.floor(totalSec / 60);
//           const s = totalSec % 60;
//           return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
//         };

//         const mappedPlaylists = apiPlaylists.map((p) => ({
//           id: `sourceId-${p.source_id}`,
//           name: p.name,
//           songs: p.songs.map((s) => {
//             const match = librarySongs.find((m) => m.id === s.zycoo_music_id);
//             return {
//               name: s.name.replace(/\.[^/.]+$/, ""),
//               duration: match ? formatDuration(match.duration) : "00:00",
//               durationSec: match ? Math.floor(match.duration) : 0,
//               zycoo_music_id: s.zycoo_music_id,
//               music_id: s.music_id,
//               playlist_id: s.playlist_id
//             };
//           })
//         }));

//         setPlaylists([{ id: "", name: "เลือก Playlist", songs: [] }, ...mappedPlaylists]);
//       } catch (err) {
//         console.error("Failed to fetch playlists in PlaylistTimerManager:", err);
//       }
//     };

//     fetchPlaylists();
//   }, [playlists.length, setPlaylists]);

//   useEffect(() => { elapsedTimeRef.current = elapsedTime }, [elapsedTime]);
//   useEffect(() => { currentSongIndexRef.current = currentSongIndex }, [currentSongIndex]);
//   useEffect(() => { playlistsRef.current = playlists }, [playlists]);

//   useEffect(() => {
//     const syncFromDB = async () => {
//       if (!selectedPlaylistForApi) return;
//       const playlistIdNumber = getPlaylistIdNumber(selectedPlaylistForApi);

//       try {
//         const statusRes = await getPlaybackStatus(playlistIdNumber);
//         const status = statusRes.data || {};
//         if (status.currentSongIndex !== undefined) setCurrentSongIndex(status.currentSongIndex);
//         if (status.elapsed !== undefined) setElapsedTime(status.elapsed);
//       } catch (err) {
//         console.error("Failed to fetch playback status:", err);
//       }
//     };

//     syncFromDB();
//   }, [selectedPlaylistForApi, setCurrentSongIndex, setElapsedTime]);

// useEffect(() => {
//   if (!isPlaylistPlaying || isPaused || !selectedPlaylistForApi) return;

//   if (timerRef.current) clearInterval(timerRef.current);

//   timerRef.current = setInterval(async () => {
//     elapsedTimeRef.current += 1;
//     setElapsedTime(elapsedTimeRef.current);

//     const pl = playlistsRef.current.find(p => p.id === selectedPlaylistForApi);
//     if (!pl) return;

//     const curSong = pl.songs[currentSongIndexRef.current];
//     if (!curSong) return;

//     if (elapsedTimeRef.current >= curSong.durationSec) {
//       currentSongIndexRef.current = (currentSongIndexRef.current + 1) % pl.songs.length;
//       elapsedTimeRef.current = 0;
//       setCurrentSongIndex(currentSongIndexRef.current);
//       setElapsedTime(0);
//     }

//     if (elapsedTimeRef.current % 3 === 0 || elapsedTimeRef.current === 0) {
//       try {
//         await updatePlaybackStatus({
//           playlistId: getPlaylistIdNumber(selectedPlaylistForApi),
//           current_song_index: currentSongIndexRef.current,
//           elapsed_time: elapsedTimeRef.current,
//           is_paused: isPaused,
//           is_playing: isPlaylistPlaying
//         });
//       } catch (err) {
//         console.error(err);
//       }
//     }
//   }, 1000);

//   return () => clearInterval(timerRef.current);
// }, [isPlaylistPlaying, isPaused, selectedPlaylistForApi]);


//   useEffect(() => () => {
//     if (timerRef.current) clearInterval(timerRef.current);
//   }, []);

//   return null;
// };

// export default PlaylistTimerManager;

import { useEffect, useRef } from "react";
import { usePlaylistStore } from "../store/playlistStore";
import { getPlaylists, getMusicLibrary, getPlaybackStatus, updatePlaybackStatus, stopPlaylist } from "../api/speakerapi";

const PlaylistTimerManager = () => {
  const { 
    isPlaylistPlaying, 
    isPaused, 
    selectedPlaylistForApi, 
    setElapsedTime, 
    elapsedTime, 
    currentSongIndex, 
    setCurrentSongIndex, 
    playlists, 
    setPlaylists,
    checkedSpeakers,
    setIsPlaylistPlaying,
    setIsPaused
  } = usePlaylistStore();
  
  const elapsedTimeRef = useRef(elapsedTime);
  const currentSongIndexRef = useRef(currentSongIndex);
  const playlistsRef = useRef(playlists);
  const timerRef = useRef(null);
  
  const getPlaylistIdNumber = (sourceId) => {
    if (!sourceId) return null;
    if (typeof sourceId === "string" && sourceId.startsWith("sourceId-")) {
      return Number(sourceId.replace("sourceId-", ""));
    }
    return Number(sourceId);
  };

  useEffect(() => {
    const fetchPlaylists = async () => {
      if (playlists.length > 0) return;

      try {
        const resPlaylists = await getPlaylists();
        const apiPlaylists = resPlaylists.data.playlists || [];
        const resLibrary = await getMusicLibrary();
        const librarySongs = resLibrary.data || [];

        const formatDuration = (sec) => {
          if (!sec) return "00:00";
          const totalSec = Math.floor(sec);
          const m = Math.floor(totalSec / 60);
          const s = totalSec % 60;
          return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
        };

        const mappedPlaylists = apiPlaylists.map((p) => ({
          id: `sourceId-${p.source_id}`,
          name: p.name,
          songs: p.songs.map((s) => {
            const match = librarySongs.find((m) => m.id === s.zycoo_music_id);
            return {
              name: s.name.replace(/\.[^/.]+$/, ""),
              duration: match ? formatDuration(match.duration) : "00:00",
              durationSec: match ? Math.floor(match.duration) : 0,
              zycoo_music_id: s.zycoo_music_id,
              music_id: s.music_id,
              playlist_id: s.playlist_id
            };
          })
        }));

        setPlaylists([{ id: "", name: "เลือก Playlist", songs: [] }, ...mappedPlaylists]);
      } catch (err) {
        console.error("Failed to fetch playlists in PlaylistTimerManager:", err);
      }
    };

    fetchPlaylists();
  }, [playlists.length, setPlaylists]);

  useEffect(() => { elapsedTimeRef.current = elapsedTime }, [elapsedTime]);
  useEffect(() => { currentSongIndexRef.current = currentSongIndex }, [currentSongIndex]);
  useEffect(() => { playlistsRef.current = playlists }, [playlists]);

  useEffect(() => {
    const syncFromDB = async () => {
      if (!selectedPlaylistForApi) return;
      const playlistIdNumber = getPlaylistIdNumber(selectedPlaylistForApi);

      try {
        const statusRes = await getPlaybackStatus(playlistIdNumber);
        const status = statusRes.data || {};
        if (status.currentSongIndex !== undefined) setCurrentSongIndex(status.currentSongIndex);
        if (status.elapsed !== undefined) setElapsedTime(status.elapsed);
      } catch (err) {
        console.error("Failed to fetch playback status:", err);
      }
    };

    syncFromDB();
  }, [selectedPlaylistForApi, setCurrentSongIndex, setElapsedTime]);

  useEffect(() => {
    if (!isPlaylistPlaying || isPaused || !selectedPlaylistForApi) return;

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(async () => {
      elapsedTimeRef.current += 1;
      setElapsedTime(elapsedTimeRef.current);

      const pl = playlistsRef.current.find(p => p.id === selectedPlaylistForApi);
      if (!pl) return;

      const curSong = pl.songs[currentSongIndexRef.current];
      if (!curSong) return;

      if (elapsedTimeRef.current >= curSong.durationSec) {
        const isLastSong = currentSongIndexRef.current === pl.songs.length - 1;
        if (isLastSong) {
          try {
            const speaker_ids = Array.from(checkedSpeakers || []);
            if (speaker_ids.length > 0) {
              await stopPlaylist({
                speaker_ids,
                sourceId: selectedPlaylistForApi,
                action: "stop"
              });
            }
            await updatePlaybackStatus({
              playlistId: getPlaylistIdNumber(selectedPlaylistForApi),
              current_song_index: 0,
              elapsed_time: 0,
              is_paused: false,
              is_playing: false
            });
            setIsPlaylistPlaying(false);
            setIsPaused(false);
            setCurrentSongIndex(0);
            setElapsedTime(0);
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            
          } catch (err) {
            console.error('Failed to stop playlist:', err);
          }
          
          return;
        }
        currentSongIndexRef.current = (currentSongIndexRef.current + 1) % pl.songs.length;
        elapsedTimeRef.current = 0;
        setCurrentSongIndex(currentSongIndexRef.current);
        setElapsedTime(0);
      }
      if (elapsedTimeRef.current % 3 === 0 || elapsedTimeRef.current === 0) {
        try {
          await updatePlaybackStatus({
            playlistId: getPlaylistIdNumber(selectedPlaylistForApi),
            current_song_index: currentSongIndexRef.current,
            elapsed_time: elapsedTimeRef.current,
            is_paused: isPaused,
            is_playing: isPlaylistPlaying
          });
        } catch (err) {
          console.error(err);
        }
      }
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [
    isPlaylistPlaying, 
    isPaused, 
    selectedPlaylistForApi,
    checkedSpeakers,
    setIsPlaylistPlaying,
    setIsPaused,
    setCurrentSongIndex,
    setElapsedTime
  ]);

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  return null;
};

export default PlaylistTimerManager;
