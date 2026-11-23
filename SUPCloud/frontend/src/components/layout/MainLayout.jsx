import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import ToastContainer from '../common/ToastContainer';
import MoveModal from '../common/MoveModal';
import { setSidebarOpen } from '../../store/uiSlice';

const MainLayout = ({ children }) => {
  const dispatch = useDispatch();
  const { sidebarOpen } = useSelector((state) => state.ui);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Sidebar />
      {/* Petit écran : fond assombri derrière le menu ouvert, un clic le referme */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 top-16 z-30 bg-black/30 lg:hidden"
          onClick={() => dispatch(setSidebarOpen(false))}
          aria-hidden="true"
        />
      )}
      <div
        className={`pt-16 transition-all duration-300 ${
          sidebarOpen ? 'lg:ml-64' : 'ml-0'
        }`}
      >
        <main className="p-4 sm:p-6 lg:p-8 pb-28">{children}</main>
      </div>
      <MoveModal />
      <ToastContainer />
    </div>
  );
};

export default MainLayout;
