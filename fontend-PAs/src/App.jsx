import './App.css'
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './page/login.jsx'
import Home from './page/Home.jsx'
import PlayList from './page/PlayList.jsx';
import Schedule from './page/Schedule.jsx';
import Speakers from './page/Speakers.jsx';
import History from './page/History.jsx';
import AppLayout from './page/AppLayout.jsx';
import ToastNotifier from './components/ToastNotifier.jsx';

function App() {
  return (
    <AppLayout>
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/playlist" element={<PlayList />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/speakers" element={<Speakers />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </Router>
    <ToastNotifier />
    </AppLayout>
  )
}

export default App