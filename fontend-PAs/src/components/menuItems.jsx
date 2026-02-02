import React from 'react';
import micWhite from '../assets/mic-white.png';
import micPurple from '../assets/mic-purple.png';
import musicWhite from '../assets/music-white.png';
import musicPurple from '../assets/music-purple.png';
import calendarWhite from '../assets/calendar-white.png';
import calendarPurple from '../assets/calendar-purple.png';
import megaphoneWhite from '../assets/megaphone-white.png';
import megaphonePurple from '../assets/megaphone-purple.png';
import historyWhite from '../assets/history-white.png';
import historyPurple from '../assets/history-purple.png';
import Logout from '../assets/logout.png';

export const menuItems = [
  {
    id: 'ประกาศสด',
    title: 'ประกาศสด',
    subtitle: 'Live Announcement Control',
    icon: (size = 24, color = 'white') => (
      <img
        src={color === 'purple' ? micPurple : micWhite}
        style={{ width: size, height: size, objectFit: 'contain' }}
        alt=""
        draggable={false}
      />
    ),
    path: '/Home',
    bgColor: 'bg-purple-500',
  },
  {
    id: 'PlayList',
    title: 'PlayList',
    subtitle: 'Music & Audio',
    icon: (size = 18, color = 'white') => (
      <img
        src={color === 'purple' ? musicPurple : musicWhite}
        style={{ width: size, height: size, objectFit: 'contain' }}
        alt=""
        draggable={false}
      />
    ),
    path: '/playlist',
    bgColor: 'bg-slate-600',
  },
  {
    id: 'ตั้งเวลา',
    title: 'ตั้งเวลา',
    subtitle: 'Schedule & Calendar',
    icon: (size = 18, color = 'white') => (
      <img
        src={color === 'purple' ? calendarPurple : calendarWhite}
        style={{ width: size, height: size, objectFit: 'contain' }}
        alt=""
        draggable={false}
      />
    ),
    path: '/schedule',
    bgColor: 'bg-slate-700',
  },
  {
    id: 'ลำโพง',
    title: 'ลำโพง',
    subtitle: 'Speaker Management',
    icon: (size = 18, color = 'white') => (
      <img
        src={color === 'purple' ? megaphonePurple : megaphoneWhite}
        style={{ width: size, height: size, objectFit: 'contain' }}
        alt=""
        draggable={false}
      />
    ),
    path: '/speakers',
    bgColor: 'bg-slate-800',
  },
  {
    id: 'ประวัติ',
    title: 'ประวัติ',
    subtitle: 'History & Logs',
        icon: (size = 18, color = 'white') => (
      <img
        src={color === 'purple' ? historyPurple : historyWhite}
        style={{ width: size, height: size, objectFit: 'contain' }}
        alt=""
        draggable={false}
      />
    ),
    path: '/history',
    bgColor: 'bg-slate-900',
  },
    {
    id: 'ออกจากระบบ',
    title: 'ออกจากระบบ',
    subtitle: 'Logout',
        icon: (size = 18, color = 'white') => (
      <img
        src={color === 'purple' ? historyPurple : Logout}
        style={{ width: size, height: size, objectFit: 'contain' }}
        alt=""
        draggable={false}
      />
    ),
    action: 'logout',
    bgColor: 'bg-slate-900',
  },
];