import React, { useState, useEffect } from 'react';
import Navbar from '../components/navbar.jsx';
import Sidebar from '../components/sidebar.jsx';
import SpeakerHeader from '../components/speaker/SpeakerHeader.jsx';
import Showspeaker from '../components/live_announcement/showspeaker.jsx';
import SpeakerGroups from '../components/speaker/SpeakerGroups.jsx';
import { getSpeakerGroups } from "../api/speakerapi";

const Speakers = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [speakerGroups, setSpeakerGroups] = useState([]);

  const handleMenuToggle = () => setSidebarOpen(!sidebarOpen);
  const handleSidebarClose = () => setSidebarOpen(false);

  useEffect(() => {
  getSpeakerGroups()
    .then(res => {
      if (res.data?.data) {
        const hiddenGroupIds = [1,2,3,4]; 
        const groupsWithCount = res.data.data
          .filter(group => !hiddenGroupIds.includes(Number(group.id)))
          .map(group => ({
            ...group,
            speaker_count: group.speaker_count ? Number(group.speaker_count) : (group.speakers?.length || 0)
          }));
        setSpeakerGroups(groupsWithCount);
      }
    })
    .catch(err => console.error("❌ Fetch speaker groups error:", err));
}, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#E6E9EC]">
      <Navbar
        currentPage="ลำโพง"
        onMenuToggle={handleMenuToggle}
        sidebarOpen={sidebarOpen}
      />
      <Sidebar
        isOpen={sidebarOpen}
        onClose={handleSidebarClose}
        currentPage="ลำโพง"
        onPageChange={() => { }}
      />
      <main className={`transition-all duration-300 ml-80`}>
        <div className="pt-30 p-15 bg-[#E6E9EC] min-h-screen">
          <SpeakerHeader onAddGroup={(newGroup) => setSpeakerGroups(prev => [newGroup, ...prev])} />
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-[2] h-[675px] -mt-5">
              <Showspeaker />
            </div>
            <div className="flex-1 h-[650px] mt-0">
              <SpeakerGroups
                groups={speakerGroups}
                setGroups={setSpeakerGroups}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Speakers;
