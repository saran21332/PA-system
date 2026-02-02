import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { deleteTask } from '../../api/speakerapi';

const TodayEvents = ({ selectedDate, eventsByDate, refreshTasks }) => {
  const [events, setEvents] = useState([]);

  const formatDate = (dateObj) => {
    const date = new Date(dateObj);
    const day = date.getDate();
    const monthNames = [
      'มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน',
      'กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'
    ];
    const weekday = ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัส','ศุกร์','เสาร์'];
    const buddhistYear = date.getFullYear() + 543;
    return `${weekday[date.getDay()]}ที่ ${day} ${monthNames[date.getMonth()]} ${buddhistYear}`;
  };

  useEffect(() => {
    const key = `${selectedDate.getFullYear()}-${selectedDate.getMonth() + 1}-${selectedDate.getDate()}`;
    const newEvents = eventsByDate[key] || [];
    setEvents(newEvents);
  }, [selectedDate, eventsByDate]);

const handleDeleteEvent = async (id) => {
  try {
    await deleteTask(id);
    toast.success('ลบกิจกรรมเรียบร้อยแล้ว');
    setEvents(prev => prev.filter(e => e.id !== id));
    if (refreshTasks) await refreshTasks();
  } catch (err) {
    toast.error('ไม่สามารถลบกิจกรรมได้');
    console.error(err);
  }
};

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 h-120 overflow-y-auto overflow-x-hidden custom-scrollbar">
      <h3 className="text-lg text-left font-bold text-gray-800 prompt-bold mb-6">
        {formatDate(selectedDate)}
      </h3>

      {events.length === 0 ? (
        <p className="text-gray-500 text-lg prompt-bold mt-40">ไม่มีอีเว้นต์ในวันนี้</p>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div
              key={event.id}
              className={`p-4 rounded-xl border-l-4 ${
                event.color === 'bg-blue-500'
                  ? 'bg-blue-50 border-blue-400'
                  : event.color === 'bg-purple-500'
                  ? 'bg-purple-50 border-purple-400'
                  : 'bg-gray-50 border-gray-400'
              }`}
            >
              <h4 className="font-semibold text-left text-gray-800 prompt-bold text-base mb-1">
                {event.category}
              </h4>
              <p className="text-gray-600 text-left prompt-regular text-sm mb-2">
               เวลา: {event.start_at || '-'} - {event.end_at || '-'}
              </p>
              <div className="flex justify-start">
                <button
                  onClick={() => handleDeleteEvent(event.id)} // ใช้ id แทน category
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs prompt-regular font-medium transition-all duration-200 hover:scale-105 bg-red-100 text-red-600 hover:bg-red-200 cursor-pointer"
                  title="ลบกิจกรรม"
                >
                  ลบ
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TodayEvents;
