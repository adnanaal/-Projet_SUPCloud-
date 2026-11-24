import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import ToastContainer from '../common/ToastContainer';
import MoveModal from '../common/MoveModal';
import { setSidebarOpen } from '../../store/uiSlice';

const MainLayout = ({ children }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { sidebarOpen } = useSelector((state) => state.ui);

  return (
    <div className="relative isolate min-h-screen bg-slate-50">
      {/* Halos aux couleurs du logo en arrière-plan */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute -right-40 -top-40 h-[32rem] w-[32rem] animate-blob rounded-full bg-brand-200/40 blur-3xl" />
        <div className="absolute -bottom-48 left-1/4 h-[30rem] w-[30rem] animate-blob rounded-full bg-sky-200/30 blur-3xl" style={{ animationDelay: '-8s' }} />
      </div>
      <Navbar />
      <Sidebar />
      {/* Petit écran : fond assombri derrière le menu ouvert, un clic le referme */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 top-16 z-30 animate-fade-in bg-brand-950/30 backdrop-blur-sm lg:hidden"
          onClick={() => dispatch(setSidebarOpen(false))}
          aria-hidden="true"
        />
      )}
      <div
        className={`pt-16 transition-all duration-300 ${
          sidebarOpen ? 'lg:ml-64' : 'ml-0'
        }`}
      >
        <main key={location.pathname} className="animate-page-in p-4 sm:p-6 lg:p-8 pb-28">{children}</main>
      </div>
      <MoveModal />
      <ToastContainer />
    </div>
  );
};

export default MainLayout;
