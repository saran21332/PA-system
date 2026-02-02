import React, { useState } from 'react';
import Navbar from '../components/navbar.jsx';
import Sidebar from '../components/sidebar.jsx';
import ScheduleHeader from '../components/set_time/ScheduleHeader.jsx';
import ScheduleCalendar from '../components/set_time/ScheduleCalendar.jsx';

const Schedule = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [refreshFlag, setRefreshFlag] = useState(false);

  const handleMenuToggle = () => setSidebarOpen(!sidebarOpen);
  const handleSidebarClose = () => setSidebarOpen(false);

  const handleRefresh = () => setRefreshFlag(prev => !prev);

  return (
    <div className="min-h-screen flex flex-col bg-[#E6E9EC]">
      <Navbar
        currentPage="ตั้งเวลา"
        onMenuToggle={handleMenuToggle}
        sidebarOpen={sidebarOpen}
      />

      <Sidebar
        isOpen={sidebarOpen}
        onClose={handleSidebarClose}
        currentPage="ตั้งเวลา"
        onPageChange={() => {}} 
      />

      <main className={`transition-all duration-300 ml-80`}>
        <div className="pt-30 p-15 bg-[#E6E9EC] min-h-screen">
          <ScheduleHeader onSave={handleRefresh} />
          <ScheduleCalendar refreshFlag={refreshFlag} />
        </div>
      </main>
    </div>
  );
};

export default Schedule;