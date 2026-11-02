import React from 'react';
import { useSelector } from 'react-redux';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import ToastContainer from '../common/ToastContainer';

const MainLayout = ({ children }) => {
  const { sidebarOpen } = useSelector((state) => state.ui);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Sidebar />
      <div
        className={`pt-16 transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-0'
        }`}
      >
        <main className="p-8">{children}</main>
      </div>
      <ToastContainer />
    </div>
  );
};

export default MainLayout;
