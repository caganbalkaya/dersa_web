import React, { useState, useEffect, useContext } from 'react';
import { API_URL } from './config';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';

// Pages
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Vitrin from './pages/Home'; // reusing Home as Vitrin
import Explore from './pages/Explore';
import Dashboard from './pages/Dashboard';
import Studio from './pages/Studio';
import GameStudio from './pages/GameStudio';
import Play from './pages/Play';
import Pricing from './pages/Pricing';
import Contact from './pages/Contact';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Settings from './pages/Settings';
import WritePost from './pages/WritePost';
import SlideMaker from './pages/SlideMaker';
import FAQ from './pages/FAQ';
import LibraryWatch from './pages/LibraryWatch';
import AcademyStudio from './pages/AcademyStudio';
import StudentDashboard from './pages/StudentDashboard';

import { AuthProvider, AuthContext } from './context/AuthContext';
import './index.css';

const socket = io(API_URL);

function AppRoutes({ theme, toggleTheme }) {
  const location = useLocation();
  const { user, loading } = useContext(AuthContext);

  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    if (isMobile) return;

    const moveCursor = (e) => setCursorPos({ x: e.clientX, y: e.clientY });
    // Differentiate native cursor state as global
    const handleMouseLeave = () => setCursorPos({ x: -100, y: -100 });

    window.addEventListener('mousemove', moveCursor);
    document.addEventListener('mouseleave', handleMouseLeave); // hide when leaving window

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  if (loading) return null;

  const isTeacherEcosystem = ['/vitrin', '/dashboard', '/studio', '/gamestudio', '/settings', '/writepost', '/slidemaker', '/academystudio'].includes(location.pathname);
  const requiresAuth = ['/dashboard', '/studio', '/gamestudio', '/settings', '/writepost', '/slidemaker', '/academystudio'].includes(location.pathname);

  // If trying to access protected teacher routes without login
  if (requiresAuth && (!user || user.role !== 'TEACHER')) {
    return <Navigate to="/" />;
  }

  return isTeacherEcosystem ? (
    <div className="app-layout" data-theme={theme} style={{ cursor: 'none' }}>
      <div className={`v6-cursor hide-on-mobile ${isHovering ? 'active' : ''}`} style={{ left: `${cursorPos.x}px`, top: `${cursorPos.y}px`, display: 'block' }} />
      <Sidebar theme={theme} />
      <div className="main-content">
        <Topbar theme={theme} toggleTheme={toggleTheme} />

        <div className="page-container animate-in">
          <Routes>
            <Route path="/vitrin" element={<Vitrin />} />
            <Route path="/dashboard" element={<Dashboard socket={socket} />} />
            <Route path="/studio" element={<Studio socket={socket} />} />
            <Route path="/gamestudio" element={<GameStudio socket={socket} />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/writepost" element={<WritePost />} />
            <Route path="/slidemaker" element={<SlideMaker />} />
            <Route path="/academystudio" element={<AcademyStudio />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </div>
    </div>
  ) : (
    <div data-theme={theme} style={{ cursor: 'none' }}>
      <div className={`v6-cursor hide-on-mobile ${isHovering ? 'active' : ''}`} style={{ left: `${cursorPos.x}px`, top: `${cursorPos.y}px`, display: 'block' }} />
      <div className="animate-in" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
         <Routes>
            <Route path="/" element={<Landing theme={theme} toggleTheme={toggleTheme} isHovering={isHovering} setIsHovering={setIsHovering} />} />
            <Route path="/explore" element={<Explore theme={theme} toggleTheme={toggleTheme} />} />
            <Route path="/explore/:id" element={<LibraryWatch theme={theme} toggleTheme={toggleTheme} />} />
            <Route path="/pricing" element={<Pricing theme={theme} toggleTheme={toggleTheme} />} />
            <Route path="/contact" element={<Contact theme={theme} toggleTheme={toggleTheme} />} />
            <Route path="/faq" element={<FAQ theme={theme} toggleTheme={toggleTheme} />} />
            <Route path="/blog" element={<Blog theme={theme} toggleTheme={toggleTheme} />} />
            <Route path="/blog/:slug" element={<BlogPost theme={theme} toggleTheme={toggleTheme} />} />
            <Route path="/auth" element={user ? <Navigate to="/" /> : <Auth theme={theme} toggleTheme={toggleTheme} />} />
            <Route path="/play" element={<Play socket={socket} theme={theme} toggleTheme={toggleTheme} />} />
            <Route path="/panel" element={<StudentDashboard theme={theme} toggleTheme={toggleTheme} />} />
            <Route path="*" element={<Navigate to="/" />} />
         </Routes>
      </div>
    </div>
  );
}

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('dersa-theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('dersa-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  return (
    <AuthProvider>
      <BrowserRouter>
         <AppRoutes theme={theme} toggleTheme={toggleTheme} />
      </BrowserRouter>
    </AuthProvider>
  );
}
