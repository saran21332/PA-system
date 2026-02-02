const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const loginAndSaveToken  = require('./service/getzycookey.js');
const Statusspeaker  = require('./service/statusspeaker.js');
const ScheduleInterval  = require('./service/scheduleInterval.js');
const userRoutes = require('./routes/PAsystem');
const path = require('path');
const http = require('http');

const app = express();
const server = http.createServer(app);

const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
app.set("io", io);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(bodyParser.json());
app.use('/api', userRoutes); 

loginAndSaveToken();
Statusspeaker();
ScheduleInterval();

server.listen(3000, '0.0.0.0', () => console.log('Server running at http://localhost:3000'));
