import React, { useState, useEffect } from 'react';
import Navbar from '../components/navbar.jsx';
import Sidebar from '../components/sidebar.jsx';
import AnnouncementControlPanel from '../components/live_announcement/AnnouncementControl.jsx';
import MapsComponent from '../components/live_announcement/googlemap.jsx';
import MapImageComponent from '../components/live_announcement/map.jsx';
import { usePlaylistStore } from '../store/playlistStore';

const Home = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showFloorplan, setShowFloorplan] = useState(false);
  const [forceSelectGroupId, setForceSelectGroupId] = useState(null);
  const [checkedFloors, setCheckedFloors] = useState(new Set());
  const { checkedSpeakers } = usePlaylistStore();
  const handleMenuToggle = () => setSidebarOpen(!sidebarOpen);
  const handleSidebarClose = () => setSidebarOpen(false);
  const handleFloorPlanClick = () => {
    setShowFloorplan(true);
  };

  const floorMarkersMap = {
    1: [3],
    2: [4],
    3: [17]
  };

  useEffect(() => {
    const speakersArray = Array.isArray(checkedSpeakers)
      ? checkedSpeakers
      : checkedSpeakers instanceof Set
        ? Array.from(checkedSpeakers)
        : [];

    const speakersSet = new Set(speakersArray);

    const newCheckedFloors = new Set();
    for (const [floor, speakerIds] of Object.entries(floorMarkersMap)) {
      if (speakerIds.some(id => speakersSet.has(id))) {
        newCheckedFloors.add(Number(floor));
      }
    }
    setCheckedFloors(newCheckedFloors);
  }, [checkedSpeakers]);


  return (
    <div className="h-screen flex flex-col bg-[#E6E9EC]">
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

      <main className="ml-80 flex-1 flex flex-col">
        <div className="flex-1 flex flex-col pt-24 px-3 md:px-6 min-h-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
            <div className="lg:col-span-2 h-full min-h-0 flex flex-col">
              {!showFloorplan ? (
                <MapsComponent
                  onSpeakerGroupSelect={setForceSelectGroupId}
                  onFloorPlanClick={handleFloorPlanClick} />
              ) : (
                <MapImageComponent
                  onBackToGoogleMap={() => setShowFloorplan(false)}
                  checkedFloors={checkedFloors}
                />
              )}
            </div>
            <div className="lg:col-span-1 h-full min-h-0 flex flex-col">
              <AnnouncementControlPanel
                forceSelectGroupId={forceSelectGroupId}
                onForceSelectHandled={() => setForceSelectGroupId(null)} />
              {showFloorplan && (
                <button
                  onClick={() => setShowFloorplan(false)}
                  className="mt-4 py-2 px-4 bg-purple-500 text-white rounded hover:bg-purple-600 transition"
                >
                  ปิด Floorplan
                </button>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;