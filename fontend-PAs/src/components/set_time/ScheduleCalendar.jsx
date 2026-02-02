import React, { useState, useEffect } from 'react';
import TodayEvents from './TodayEvents.jsx';
import CategoryLegend from './CategoryLegend.jsx';
import { getTasks } from '../../api/speakerapi';

const ScheduleCalendar = ({ refreshFlag }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [eventsByDate, setEventsByDate] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);

  const daysOfWeek = ['Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun'];
  const monthNames = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];

  useEffect(() => {
    fetchTasks();
  }, [currentMonth]);


const fetchTasks = async () => {
  try {
    const res = await getTasks();
    const tasks = res.data.rows;
    const eventsMap = {};
    tasks.forEach(task => {
      const month = currentMonth.getMonth();
      const year = currentMonth.getFullYear();
      const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
      if (task.task_type === 'schedule' && task.conditions?.weekDays) {
        const createdDate = new Date(task.createdAt);
        const createdAtMidnight = new Date(createdDate.setHours(0, 0, 0, 0));
        const times = Array.isArray(task.conditions.time) ? task.conditions.time : [null, null];
        const startTime = times[0] || null;
        const endTime = times[1] || null;
        for (let d = 1; d <= lastDayOfMonth; d++) {
          const currentDate = new Date(year, month, d);
          if (currentDate < createdAtMidnight) continue;
          const dayName = daysOfWeek[currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1].toLowerCase();
          if (task.conditions.weekDays.includes(dayName)) {
            const key = `${year}-${month + 1}-${d}`;
            if (!eventsMap[key]) eventsMap[key] = [];
            if (!eventsMap[key].some(e => e.id === task.id)) {
              eventsMap[key].push({
                id: task.id,
                category: task.name,
                start_at: startTime,
                end_at: endTime,
                color: 'bg-blue-500'
              });
            }
          }
        }
      }
      if (task.task_type === 'calendar') {
        const dates = Array.isArray(task.conditions.date) ? task.conditions.date : [task.conditions.date];
        const times = Array.isArray(task.conditions.time) ? task.conditions.time : [null, null];
        const startTime = times[0] || null;
        const endTime = times[1] || null;
        dates.forEach(dStr => {
          const dateObj = new Date(dStr);
          const key = `${dateObj.getFullYear()}-${dateObj.getMonth() + 1}-${dateObj.getDate()}`;
          if (!eventsMap[key]) eventsMap[key] = [];
          if (!eventsMap[key].some(e => e.id === task.id)) {
            eventsMap[key].push({
              id: task.id,
              category: task.name,
              start_at: startTime,
              end_at: endTime,
              color: 'bg-purple-500'
            });
          }
        });
      }
    });
    setEventsByDate(eventsMap);
  } catch (error) {
    console.error('Error fetching tasks', error);
  }
};


  useEffect(() => {
  fetchTasks();
}, [currentMonth, refreshFlag]);

  const getEventsForDate = (date) => {
    const key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    return eventsByDate[key] || [];
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    const days = [];
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const dayDate = new Date(year, month - 1, prevMonth.getDate() - i);
      days.push({ day: prevMonth.getDate() - i, isCurrentMonth: false, isToday: false, date: dayDate, events: getEventsForDate(dayDate) });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dayDate = new Date(year, month, d);
      const today = new Date();
      days.push({
        day: d,
        isCurrentMonth: true,
        isToday: dayDate.toDateString() === today.toDateString(),
        date: dayDate,
        events: getEventsForDate(dayDate)
      });
    }
    const totalCells = 35;
    const remainingDays = totalCells - days.length;
    for (let d = 1; d <= remainingDays; d++) {
      const dayDate = new Date(year, month + 1, d);
      days.push({ day: d, isCurrentMonth: false, isToday: false, date: dayDate, events: getEventsForDate(dayDate) });
    }
    return days.slice(0, 35);
  };

  const days = getDaysInMonth(currentMonth);

  const renderCategoryDots = (events) => {
    if (events.length === 0) return null;
    const maxDots = 3;
    const visibleEvents = events.slice(0, maxDots);

    return (
      <div className="flex justify-center gap-0.5 mt-0.5">
        {visibleEvents.map((event, i) => (
          <div key={i} className={`w-1.5 h-1.5 rounded-full ${event.color}`} title={event.category} />
        ))}
        {events.length > maxDots && (
          <div className="w-1.5 h-1.5 rounded-full bg-gray-400" title={`+${events.length - maxDots} more`} />
        )}
      </div>
    );
  };

  const isSelected = (date) =>
    selectedDate && date.toDateString() === selectedDate.toDateString();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-160">
      <div className="lg:col-span-2 flex flex-col">
        <div className="bg-white rounded-xl shadow-lg p-6 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 prompt-bold">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h2>
            <div className="flex gap-2">
              <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="เดือนก่อนหน้า">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="เดือนถัดไป">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>

          <div className="flex-1 grid grid-rows-6 gap-2">
            <div className="grid grid-cols-7 gap-2">
              {daysOfWeek.map(day => (
                <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2 prompt-bold">
                  {day}
                </div>
              ))}
            </div>

            {Array.from({ length: 5 }, (_, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-7 gap-2">
                {days.slice(rowIndex * 7, (rowIndex + 1) * 7).map((day, colIndex) => {
                  const circleClass = day.isToday
                    ? 'bg-blue-300 text-gray-800 font-bold rounded-full'
                    : isSelected(day.date)
                    ? 'bg-purple-300 text-gray-800 font-bold rounded-full'
                    : 'rounded-lg';

                  return (
                    <div
                      key={rowIndex * 7 + colIndex}
                      onClick={() => setSelectedDate(day.date)}
                      className={`relative flex flex-col items-center justify-center cursor-pointer mx-auto transition-colors duration-150 w-12 h-12
                        ${day.isCurrentMonth ? 'text-gray-800' : 'text-gray-300 cursor-not-allowed'}
                        ${circleClass}`}
                    >
                      <span className="text-sm prompt-regular">{day.day}</span>
                      {day.isCurrentMonth && renderCategoryDots(day.events)}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:col-span-1 flex flex-col space-y-6">
        <div className="flex-1"><TodayEvents selectedDate={selectedDate || new Date()} eventsByDate={eventsByDate} refreshTasks={fetchTasks} /></div>
        <div className="flex-shrink-0"><CategoryLegend /></div>
      </div>
    </div>
  );
};

export default ScheduleCalendar;
