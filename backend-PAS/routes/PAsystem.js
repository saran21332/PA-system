const express = require('express');
const multer = require('multer');
const router = express.Router();
const userController = require('../controllers/Usercontroller');
const speakerControllers = require('../controllers/Speakercontroller');
const Announcement = require('../controllers/anouncement');
const Musics = require('../controllers/Music');
const Playlists = require('../controllers/Playlist');
const Playmusic = require('../controllers/playmusic');
const Schedule = require('../controllers/schedule');
const playlistStatus = require('../controllers/PlaybackStatus');
const authentication = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, './uploads'),
  filename: (req, file, cb) => cb(null, file.originalname)
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'audio/mpeg') {
    cb(null, true);
  } else {
    cb(new Error('Only mp3 files are allowed'), false);
  }
};

const upload = multer({ storage, fileFilter });

router.post('/createusers', userController.createUser);
router.post('/login', userController.login);
router.post('/logout', userController.logout)
router.get('/playbacklog', authentication.verifyToken, userController.getPlaybackLogs)
router.delete('/delete/playbacklog', authentication.verifyToken, userController.deletePlaybackLogs);
router.delete('/clear/playbacklog', authentication.verifyToken, userController.clearPlaybackLogs)

router.get('/all/speaker',authentication.verifyToken,speakerControllers.getAllSpeakers)
router.post('/create/group',authentication.verifyToken, speakerControllers.createSpeakerGroup)
router.put('/update/group', authentication.verifyToken, speakerControllers.updateSpeakerGroup)
router.get('/watch/group', authentication.verifyToken, speakerControllers.getAllSpeakerGroups)
router.delete('/delete/group', authentication.verifyToken, speakerControllers.deleteSpeakerGroup)

router.post('/upload/music',authentication.verifyToken,upload.single('file'), Musics.uploadMusic);
router.get('/watch/music', authentication.verifyToken, Musics.getMySongs);
router.delete('/delete/music', authentication.verifyToken, Musics.deleteMusic)

router.post('/create/playlist', authentication.verifyToken, Playlists.createPlaylist);
router.get('/watch/playlist', authentication.verifyToken, Playlists.getAllPlaylists);
router.put('/update/playlist', authentication.verifyToken, Playlists.updatePlaylist);
router.delete('/delete/playlist', authentication.verifyToken, Playlists.deletePlaylist);

router.post('/create/schedule', authentication.verifyToken, Schedule.createSchedule)
router.post('/create/calendar', authentication.verifyToken, Schedule.createCalendar)
router.delete('/delete/task', authentication.verifyToken, Schedule.deleteTask)
router.get('/watch/task', authentication.verifyToken, Schedule.getTaskList)

router.post('/announce', authentication.verifyToken, Announcement.announce)
router.post('/hangup', authentication.verifyToken, Announcement.stopAnnounce)
router.post('/play/playlist', authentication.verifyToken, Playmusic.controlDevice)
router.post('/pause/playlist', authentication.verifyToken, Playmusic.controlBroadcast)

// router.get('/get/playback', authentication.verifyToken, playlistStatus.getCurrentPlaybackStatus)
router.get('/playback/status', authentication.verifyToken, playlistStatus.getPlaybackStatus)
router.put('/playback/status', authentication.verifyToken, playlistStatus.updatePlaybackStatus)

module.exports = router;