import { LucideEqualApproximately } from "lucide-react";
import api from "./axios";

export const getSpeakerGroups = () => api.get("/watch/group");
export const getAllSpeakers = () => api.get("/all/speaker");
export const Announcement = (speaker_ids) => {
  return api.post("/announce", { speaker_ids });
};
export const StopAnnouncement = () => api.post("/hangup");
export const createSpeakerGroup = (payload) => api.post("/create/group", payload);
export const updateSpeakerGroup = (payload) => api.put("/update/group", payload);
export const deleteSpeakerGroup = (id) => api.delete("/delete/group", { data: { id } })
export const uploadMusicFile = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post("/upload/music", formData, {
    headers: {"Content-Type": "multipart/form-data"}
  });
};
export const getMusicLibrary = () => api.get("/watch/music");
export const createPlaylist = (payload) => {
  return api.post("/create/playlist", payload);
};
export const getPlaylists = () => api.get("/watch/playlist");
export const updatePlaylist = (payload) => {
  return api.put("/update/playlist", payload);
};
export const deletePlaylist = (id) => api.delete("/delete/playlist", { data: { id } });
export const deleteMusic = (id) => api.delete("/delete/music", { data: { id } });
export const playPlaylist = ({ speaker_ids, sourceId, hardVolume }) => {
  return api.post("/play/playlist", {
    speaker_ids,
    action: "play",
    sourceId,
    hardVolume
  });
};
export const stopPlaylist = ({ speaker_ids }) => {
  return api.post("/play/playlist", {
    speaker_ids,
    action: "stop"
  });
};
export const pausePlaylist = (data) =>api.post('/pause/playlist', data);
export const setSpeakerVolume = ({ speaker_ids, hardVolume }) => {
  return api.post("/play/playlist", {
    speaker_ids,
    action: "set-hard-volume",
    hardVolume
  });
};

export const createTaskSchedule = (payload) => api.post("/create/schedule", payload);
export const createTaskCalendar = (payload) => api.post("/create/calendar", payload);

export const getTasks = () => api.get("/watch/task");
export const deleteTask = (id) => api.delete("/delete/task", { data: { id } });
export const getPlaybackLogs = () => api.get("/playbacklog");
export const deletePlaybackLogs = (id) => api.delete("/delete/playbacklog", { data: { id } });

export const getPlaybackStatus = () => api.get("/playback/status");
export const updatePlaybackStatus = (payload) => api.put("/playback/status", payload);