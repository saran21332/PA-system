import React from 'react';

function AppLayout({ children, playlists = [] }) {
  return (
    <div>
      {children}
    </div>
  );
}

export default AppLayout;