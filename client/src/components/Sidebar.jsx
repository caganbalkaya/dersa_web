import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Compass, LayoutDashboard, PenTool, Gamepad2, Settings, FileText, PresentationIcon, Film } from 'lucide-react';

const nav = [
  { label: 'Vitrin', path: '/vitrin', icon: Home },
  { label: 'Keşfet', path: '/explore', icon: Compass },
  { label: 'Panelim', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Stüdyo', path: '/studio', icon: PenTool },
  { label: 'Oyunlar', path: '/gamestudio', icon: Gamepad2 },
];

export default function Sidebar({ theme }) {
  const navigate = useNavigate();
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-header" style={{ justifyContent: 'center', height: '80px' }}>
        <img
          src={theme === 'dark' ? '/whitepn.png' : '/blackpng.png'}
          alt="Dersa Platform"
          style={{ height: '44px', cursor: 'pointer' }}
          onClick={() => navigate('/')}
        />
      </div>

      {/* Navigation */}
      <nav className="sidebar-menu">
        <div className="menu-section-label">Platform</div>

        {nav.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => isActive ? 'menu-item active' : 'menu-item'}
            >
              <Icon size={16} strokeWidth={1.75} />
              {item.label}
            </NavLink>
          );
        })}

        <div className="menu-section-label" style={{ marginTop: '1rem' }}>Eğitmen</div>
        <NavLink
          to="/writepost"
          className={({ isActive }) => isActive ? 'menu-item active' : 'menu-item'}
        >
          <FileText size={16} strokeWidth={1.75} />
          Makale Yaz
        </NavLink>
 
        <NavLink
          to="/slidemaker"
          className={({ isActive }) => isActive ? 'menu-item active' : 'menu-item'}
        >
          <PresentationIcon size={16} strokeWidth={1.75} />
          Sunum Hazırla
        </NavLink>

        <NavLink
          to="/academystudio"
          className={({ isActive }) => isActive ? 'menu-item active' : 'menu-item'}
        >
          <Film size={16} strokeWidth={1.75} />
          Akademi Stüdyosu
        </NavLink>

        <div className="menu-section-label" style={{ marginTop: '1rem' }}>Öğrenci</div>
        <NavLink
          to="/play"
          className={({ isActive }) => isActive ? 'menu-item active' : 'menu-item'}
        >
          <Gamepad2 size={16} strokeWidth={1.75} />
          Derse Katıl
        </NavLink>
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <NavLink
          to="/settings"
          className={({ isActive }) => isActive ? 'menu-item active' : 'menu-item'}
        >
          <Settings size={16} strokeWidth={1.75} />
          Ayarlar
        </NavLink>
      </div>
    </aside>
  );
}
