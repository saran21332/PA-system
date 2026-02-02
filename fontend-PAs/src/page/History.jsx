import React, { useState, useCallback } from 'react';
import Navbar from '../components/navbar.jsx';
import Sidebar from '../components/sidebar.jsx';
import HistoryHeader from '../components/history/HistoryHeader.jsx';
import Historylog from '../components/history/historylog.jsx';

const History = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [announcements, setAnnouncements] = useState([]);
  const [filters, setFilters] = useState({
    searchTerm: '',
    selectedCategory: 'ทุกวันที่',
    selectedStatus: 'ทุกประเภท',
    selectedDate: 'ทุกลำโพง'
  });

  const handleMenuToggle = () => setSidebarOpen(!sidebarOpen);
  const handleSidebarClose = () => setSidebarOpen(false);

  const handleAnnouncementsLoad = useCallback((data) => {
    setAnnouncements(data);
  }, []);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#E6E9EC]">
      <Navbar
        currentPage="ประกาศสด"
        onMenuToggle={handleMenuToggle}
        sidebarOpen={sidebarOpen}
      />

      <Sidebar
        isOpen={sidebarOpen}
        onClose={handleSidebarClose}
        currentPage="ประกาศสด"
        onPageChange={() => { }} 
      />

      <main className={`transition-all duration-300 ml-80 mt-16`}>
        <div className="p-15 bg-[#E6E9EC] min-h-screen pb-24">
          <HistoryHeader 
            onFilterChange={handleFilterChange}
            announcements={announcements}
          />
          <Historylog 
            filters={filters}
            onAnnouncementsLoad={handleAnnouncementsLoad}
          />
        </div>
      </main>
    </div>
  );
};

export default History;