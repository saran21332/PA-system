import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { menuItems } from './menuItems';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getAllSpeakers, stopPlaylist } from '../api/speakerapi';
import delete2 from '../assets/delete2.png';
import { usePlaylistStore } from "../store/playlistStore";
import axios from "axios";

const Sidebar = () => {
  const [currentTime, setCurrentTime] = useState('');
  const [totalSpeakers, setTotalSpeakers] = useState(0);
  const [onlineCount, setOnlineCount] = useState(0);
  const [offlineCount, setOfflineCount] = useState(0);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const datePart = new Intl.DateTimeFormat('th-TH', {
        timeZone: 'Asia/Bangkok',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(now);
      const timePart = new Intl.DateTimeFormat('th-TH', {
        timeZone: 'Asia/Bangkok',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(now);
      setCurrentTime(`${datePart} ${timePart}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchSpeakers = async () => {
      try {
        const res = await getAllSpeakers();
        const speakers = res.data.data;
        const total = speakers.length;
        const online = speakers.filter((spk) => spk.is_online).length;
        const offline = total - online;
        setTotalSpeakers(total);
        setOnlineCount(online);
        setOfflineCount(offline);
      } catch (err) {
        console.error('ไม่สามารถดึงข้อมูลลำโพง:', err);
      }
    };
    fetchSpeakers();
  }, []);

const handleLogout = async () => {
  setLoggingOut(true);
  try {
    const token = localStorage.getItem('token');
    if (token) {
      await axios.post(
        'http://localhost:3000/api/logout',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }
    navigate('/login');
  } catch (err) {
    console.error('Logout failed:', err);
    navigate('/login');
  } finally {
    setLoggingOut(false);
    setShowLogoutConfirm(false);
  }
};

  return (
    <>
      <div className="fixed top-0 left-0 h-full w-80 bg-gradient-to-b from-slate-600 to-slate-800 text-white transform transition-transform duration-300 ease-in-out z-50">
        <div className="flex flex-col h-full overflow-y-auto custom-scrollbar">
        <div className="h-[96px] px-6 border-b-4 border-slate-500 flex items-center">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-[#AD7CE1] to-[#EC77BA] rounded-xl flex items-center justify-center">
                <span className="text-white text-lg prompt-medium">PA</span>
              </div>
              <div>
                <h2 className="text-2xl text-white prompt-semibold">PA Dashboard</h2>
                <p className="text-sm text-gray-100 prompt-regular">{currentTime}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4">
          <p className="text-xs text-left text-white prompt-regular mb-3">
            ลำโพงกระจายเสียงทั้งหมด {totalSpeakers} ตัว
          </p>
          <div className="flex justify-center items-center mt-2 space-x-10">
            <div className="flex flex-col items-center">
              <span className="text-lg text-white font-semibold prompt-regular">{onlineCount}</span>
              <span className="text-sm text-white prompt-regular">ออนไลน์</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-lg text-red-400 font-semibold prompt-regular">{offlineCount}</span>
              <span className="text-sm text-red-400 prompt-regular">ออฟไลน์</span>
            </div>
          </div>
        </div>

        <div className="py-2 px-4">
          {menuItems.map((item) =>
            item.id === 'ออกจากระบบ' ? (
              <button
                key={item.id}
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full flex items-center gap-4 px-4 py-4 hover:bg-slate-500/50 transition-all duration-200 rounded-lg mb-1 cursor-pointer"
              >
                <div className="text-white flex items-center justify-center w-6">
                  {item.icon(24, 'white')}
                </div>
                <div className="text-left">
                  <p className="text-white text-lg prompt-medium">{item.title}</p>
                  <p className="text-sm text-gray-300 prompt-regular">{item.subtitle}</p>
                </div>
              </button>
            ) : (
              <Link
                key={item.id}
                to={item.path}
                className={`w-full flex items-center gap-4 px-4 py-4 hover:bg-slate-500/50 transition-all duration-200 rounded-lg mb-1 cursor-pointer ${location.pathname === item.path
                    ? 'bg-gradient-to-r from-[#AD7CE1] to-[#EC77BA]'
                    : ''
                  }`}
              >
                <div className="text-white flex items-center justify-center w-6">
                  {item.icon(24, 'white')}
                </div>
                <div className="text-left">
                  <p className="text-white text-lg prompt-medium">{item.title}</p>
                  <p className="text-sm text-gray-300 prompt-regular">{item.subtitle}</p>
                </div>
              </Link>
            )
          )}
        </div>
      </div>

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-70 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-lg text-center">
            <div className="flex items-center justify-center mx-auto mb-4 bg-red-100/50 rounded-full w-25 h-25">
              <img src={delete2} className="h-12 w-12 object-contain" alt="logout" />
            </div>
            <p className="mb-1 text-xl font-semibold text-gray-800 prompt-regular">ยืนยันการออกจากระบบ</p>
            <p className="mb-3 text-l text-gray-600 propmt-regular">คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบ?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-6 py-2 rounded-lg border text-red-500 border-red-400 hover:bg-purple-50 transition prompt-regular cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="px-6 py-2 rounded-lg border bg-red-500 text-white transition prompt-regular cursor-pointer"
              >
                {loggingOut ? 'กำลังออก...' : 'ยืนยัน'}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default Sidebar;
