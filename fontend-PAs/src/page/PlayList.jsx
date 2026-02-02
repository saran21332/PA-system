import React, { useState } from 'react';
import Navbar from '../components/navbar.jsx';
import Sidebar from '../components/sidebar.jsx';
import PlaylistHeader from '../components/playlist/PlaylistHeader.jsx';
import CurrentPlaying from '../components/playlist/CurrentPlaying.jsx';
import AudioLibrary from '../components/playlist/AudioLibrary.jsx';
import PlaylistComponent from '../components/playlist/PlaylistComponent.jsx';

const playlists = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleMenuToggle = () => setSidebarOpen(!sidebarOpen);
  const handleSidebarClose = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#E6E9EC]">
      <Navbar
        currentPage="Playlist"
        onMenuToggle={handleMenuToggle}
        sidebarOpen={sidebarOpen}
      />
      <Sidebar
        isOpen={sidebarOpen}
        onClose={handleSidebarClose}
        currentPage="Playlist"
        onPageChange={() => { }}
      />
      <main className={`transition-all duration-300 ml-80 mt-16`}>
        <div className="p-15 bg-[#E6E9EC] min-h-screen pb-24">
          <PlaylistHeader />
          <CurrentPlaying />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AudioLibrary />
            <PlaylistComponent />
          </div>
        </div>
      </main>
    </div>
  );
};

export default playlists;