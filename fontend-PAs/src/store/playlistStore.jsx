import { create } from "zustand";

export const usePlaylistStore = create((set, get) => ({
  selectedPlaylistId: null,
  selectedPlaylistForApi: null,
  checkedSpeakers: new Set(),
  volume: 10,
  isPlaylistPlaying: false,
  isPaused: false,
  currentSongIndex: 0,
  elapsedTime: 0,
  selectedGroupId: "1",
  isPlaylistLocked: false,
  playlists: [],
  announcementElapsedTime: 0,

  setSelectedGroupId: (id) => {
    const currentState = get();
    if (currentState.selectedGroupId !== id) {
      set({ selectedGroupId: id });
    }
  },

  setSelectedPlaylistId: (id) => {
    const currentState = get();
    if (currentState.selectedPlaylistId !== id) {
      set({ selectedPlaylistId: id });
    }
  },

  setSelectedPlaylistForApi: (id) => {
    const currentState = get();
    if (currentState.selectedPlaylistForApi !== id) {
      set({ selectedPlaylistForApi: id });
    }
  },

  setSelectedPlaylist: (id, sourceId) => {
    const currentState = get();
    if (
      currentState.selectedPlaylistId !== id ||
      currentState.selectedPlaylistForApi !== sourceId
    ) {
      set({ selectedPlaylistId: id, selectedPlaylistForApi: sourceId });
    }
  },

setCheckedSpeakers: (updater) => {
    const currentState = get();
    const newSpeakersValue = typeof updater === 'function'
        ? updater(currentState.checkedSpeakers)
        : updater;
    const newSet = newSpeakersValue instanceof Set ? newSpeakersValue : new Set(newSpeakersValue || []);
    const currentArray = Array.from(currentState.checkedSpeakers || []).sort();
    const newArray = Array.from(newSet).sort();
    if (JSON.stringify(currentArray) !== JSON.stringify(newArray)) {
        set({ checkedSpeakers: newSet });
    }
},

  setVolume: (v) => {
    const currentState = get();
    if (currentState.volume !== v) {
      set({ volume: v });
    }
  },

  setIsPlaylistPlaying: (val) => set({ isPlaylistPlaying: val }),
  setIsPaused: (val) => set({ isPaused: val }),
  setCurrentSongIndex: (idx) => set({ currentSongIndex: idx }),
  setElapsedTime: (t) => set({ elapsedTime: t }),
  
  resetPlaylist: () =>
    set({
      selectedPlaylistId: null,
      selectedPlaylistForApi: null,
      checkedSpeakers: new Set(),
      volume: 10,
      isPlaylistPlaying: false,
      isPaused: false,
      currentSongIndex: 0,
      elapsedTime: 0,
      selectedGroupId: null,
    }),

  setSelectedSpeakerGroup: (group) => {
    const currentState = get();
    if (currentState.selectedGroupId !== group) {
      set({ selectedGroupId: group });
    }
  },

    stopAndResetPlaylist: () => set({
    isPlaylistPlaying: false,
    isPaused: false,
    currentSongIndex: 0,
    elapsedTime: 0
  }),

  setIsPlaylistLocked: (locked) => set({ isPlaylistLocked: locked }),
  setPlaylists: (playlists) => set({ playlists }),
  setAnnouncementElapsedTime: (time) => set({ announcementElapsedTime: time }),
}));
