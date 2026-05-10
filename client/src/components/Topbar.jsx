import React, { useRef, useContext } from 'react';
import { Search, Sun, Moon, Bell, LogOut } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Topbar({ theme, toggleTheme }) {
  const inputRef = useRef();
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="topbar">
      {/* Search */}
      <div
        className="search-bar"
        onClick={() => inputRef.current?.focus()}
      >
        <Search size={14} color="var(--fg-subtle)" />
        <input ref={inputRef} type="text" placeholder="İçerik, konu veya öğretmen ara…" />
      </div>

      <div className="topbar-spacer" />

      {/* Actions */}
      <div className="flex items-center gap-3">
        {user ? (
          <div className="flex items-center gap-3">
             <div style={{ fontSize: '0.825rem', fontWeight: 600 }}>{user.name}</div>
             <button className="btn btn-ghost btn-sm" style={{ padding: '0.4rem 0.4rem' }} title="Bildirimler">
               <Bell size={15} strokeWidth={1.75} />
             </button>
             <button className="btn btn-ghost btn-sm" onClick={handleLogout} title="Çıkış Yap">
               <LogOut size={15} strokeWidth={1.75} />
             </button>
          </div>
        ) : (
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/auth')}>Giriş Yap</button>
        )}

        <button
          className="mode-toggle"
          onClick={toggleTheme}
          title={theme === 'light' ? 'Karanlık moda geç' : 'Aydınlık moda geç'}
        >
          {theme === 'light'
            ? <><Moon size={13} /> Karanlık</>
            : <><Sun size={13} /> Aydınlık</>
          }
        </button>
      </div>
    </header>
  );
}
