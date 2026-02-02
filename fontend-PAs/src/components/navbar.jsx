import React from 'react';
import { useLocation } from 'react-router-dom';
import { menuItems } from './menuItems';
import Menu from '../assets/menu.png';

const SIDEBAR_WIDTH = 320;

const Navbar = ({ onMenuToggle, sidebarOpen }) => {
  const location = useLocation();
  const currentMenu = menuItems.find(item => item.path === location.pathname);
  

  return (
    <nav
      className="bg-white border-b-4 border-purple-400  h-[10vh] flex items-center fixed top-0 left-0 right-0 z-50 transition-all duration-300"
    >
      <div
        className="flex items-center w-full h-full transition-all duration-300"
        style={{
          paddingLeft: sidebarOpen ? SIDEBAR_WIDTH + 24 : 24,
          paddingRight: 24,
        }}
      >
        {!sidebarOpen && (
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors mr-4 cursor-pointer"
          >
            <img
              src={Menu}
              alt="menu"
              style={{ width: 30, height: 30, objectFit: 'contain' }}
              draggable={false}
            />
          </button>
        )}

        <div className="flex items-start gap-4">
          {/* Icon */}
          {currentMenu && (
            <div className="mt-3">
              {currentMenu.icon(32, 'purple')}
            </div>
          )}

          <div className="flex flex-col justify-center">
            <h1
              className="text-[26px] font-medium text-gray-800 leading-snug text-left prompt-medium"
            >
              {currentMenu ? currentMenu.title : ''}
            </h1>
            {currentMenu && (
              <p className="text-sm text-gray-600 font-sm leading-tight prompt-regular">
                {currentMenu.subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;