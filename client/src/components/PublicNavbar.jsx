import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronDown, LogOut, HelpCircle, Mail, BookOpen } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export default function PublicNavbar({ theme, toggleTheme, isHovering, setIsHovering }) {
  const navigate = useNavigate();
  const { user, logout } = React.useContext(AuthContext);

  const [userDrop, setUserDrop] = useState(false);
  const [helpDrop, setHelpDrop] = useState(false);
  const dropTimer = React.useRef(null);

  const closeAll = () => { setUserDrop(false); setHelpDrop(false); };

  const enterDrop = (setter) => {
    if (dropTimer.current) clearTimeout(dropTimer.current);
    setter(true);
  };
  
  const leaveDrop = (setter) => {
    dropTimer.current = setTimeout(() => {
      setter(false);
    }, 250); // 250ms delay makes it feel premium and prevents jitter
  };

  const interactiveProps = setIsHovering ? {
    onMouseEnter: () => setIsHovering(true),
    onMouseLeave: () => { setIsHovering(false); closeAll(); }
  } : {};

  const navBtn = {
    background: 'transparent', border: 'none', fontSize: '0.9rem',
    fontWeight: 600, color: 'var(--fg)', cursor: 'pointer',
    padding: 0, letterSpacing: '0.02em', display: 'flex',
    alignItems: 'center', gap: '0.25rem', fontFamily: 'inherit',
  };

  const dropItem = {
    display: 'flex', alignItems: 'center', gap: '0.6rem',
    width: '100%', padding: '0.6rem 0.75rem', border: 'none',
    background: 'transparent', cursor: 'pointer',
    fontSize: '0.88rem', color: 'var(--fg)', textAlign: 'left',
    borderRadius: 6, fontFamily: 'inherit', transition: 'background 0.15s',
  };

  return (
    <header
      {...interactiveProps}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(var(--bg-rgb), 0.9)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)'
      }}
    >
      <div style={{ height: 88, maxWidth: 1400, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem' }}>

        {/* Logo + Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '3.5rem' }}>
          <img
            src={theme === 'dark' ? '/src/assets/whitepn.png' : '/src/assets/blackpng.png'}
            alt="Dersa Platform"
            style={{ height: 48, cursor: 'pointer' }}
            onClick={() => { navigate('/'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          />
          <nav className="hide-on-mobile" style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
            <button style={navBtn} onClick={() => { navigate('/'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Ana Sayfa</button>
            <button style={navBtn} data-tour="nav-pricing" onClick={() => navigate('/pricing')}>Ücretlendirme</button>
            <button style={navBtn} data-tour="nav-academy" onClick={() => navigate('/blog')}>Akademi</button>
            <button style={navBtn} data-tour="nav-explore" onClick={() => navigate('/explore')}>Açık Kütüphane <ArrowRight size={13} /></button>

            {/* ── Yardım Dropdown ─────────────────── */}
            <div style={{ position: 'relative' }} onMouseLeave={() => leaveDrop(setHelpDrop)} onMouseEnter={() => enterDrop(setHelpDrop)}>
              <button
                style={navBtn}
                onClick={() => setHelpDrop(p => !p)}
              >
                Yardım <ChevronDown size={13} style={{ transition: 'transform 0.2s', transform: helpDrop ? 'rotate(180deg)' : 'rotate(0deg)' }} />
              </button>

              {helpDrop && (
                <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', paddingTop: 16, zIndex: 200, width: 220 }}>
                  <div style={{
                    background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10,
                    boxShadow: '0 12px 40px rgba(0,0,0,0.12)', padding: '0.4rem', position: 'relative',
                    animation: 'fadeIn 0.15s ease',
                  }}>
                    {/* Arrow tip */}
                    <div style={{ position: 'absolute', top: -6, left: '50%', transform: 'translateX(-50%)', width: 12, height: 12, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRight: 'none', borderBottom: 'none', rotate: '45deg' }} />

                    <div style={{ padding: '0.4rem 0.75rem 0.25rem', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--fg-subtle)' }}>Yardım Merkezi</div>

                    <button
                      style={dropItem}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-raised)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      onClick={() => { closeAll(); navigate('/faq'); }}
                    >
                      <HelpCircle size={15} opacity={0.6} />
                      <div>
                        <div style={{ fontWeight: 600 }}>S.S.S</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--fg-subtle)' }}>Sıkça sorulan sorular</div>
                      </div>
                    </button>

                    <button
                      style={dropItem}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-raised)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      onClick={() => { closeAll(); navigate('/contact'); }}
                    >
                      <Mail size={15} opacity={0.6} />
                      <div>
                        <div style={{ fontWeight: 600 }}>İletişim</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--fg-subtle)' }}>Bizimle iletişime geç</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <button className="mode-toggle hide-on-mobile" onClick={toggleTheme} style={{ padding: '0 1.25rem', height: 42, borderRadius: 0 }}>
            {theme === 'light' ? 'Karanlık Mod' : 'Aydınlık Mod'}
          </button>

          {user ? (
            <div style={{ position: 'relative' }} onMouseLeave={() => leaveDrop(setUserDrop)} onMouseEnter={() => enterDrop(setUserDrop)}>
              <button
                className="btn btn-ghost hide-on-mobile"
                data-tour="panel-link"
                onClick={() => setUserDrop(p => !p)}
                style={{ fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem' }}
              >
                {user.avatar ? (
                  <img src={user.avatar} alt="Avatar" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--fg)', color: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>
                    {user.name?.charAt(0)}
                  </div>
                )}
                <span style={{ maxWidth: 100, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</span>
                <ChevronDown size={13} style={{ transition: 'transform 0.2s', transform: userDrop ? 'rotate(180deg)' : 'none' }} />
              </button>

              {userDrop && (
                <div style={{ position: 'absolute', top: '100%', right: 0, paddingTop: 10, width: 210, zIndex: 200 }}>
                  <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, boxShadow: '0 10px 30px rgba(0,0,0,0.1)', padding: '0.4rem' }}>
                    <div style={{ padding: '0.6rem 0.75rem', borderBottom: '1px solid var(--border)', marginBottom: '0.3rem' }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem' }}>{user.name}</p>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--fg-subtle)' }}>{user.email}</p>
                    </div>
                    {[
                      { label: 'Panelime Git', to: user.role === 'TEACHER' ? '/dashboard' : '/panel' }
                    ].map(item => (
                      <button key={item.to} className="btn btn-ghost btn-block" style={{ justifyContent: 'flex-start', padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
                        onClick={() => { closeAll(); navigate(item.to); }}>
                        {item.label}
                      </button>
                    ))}
                    <button className="btn btn-ghost btn-block" style={{ justifyContent: 'flex-start', padding: '0.5rem 0.75rem', fontSize: '0.875rem', color: 'var(--fg-subtle)' }}
                      onClick={() => { closeAll(); logout(); navigate('/'); }}>
                      <LogOut size={13} /> Çıkış Yap
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button className="btn btn-ghost hide-on-mobile" onClick={() => navigate('/auth')} style={{ fontSize: '0.9rem', fontWeight: 600 }}>
              Giriş Yap
            </button>
          )}

          <button className="btn btn-primary" onClick={() => navigate(user ? (user.role === 'TEACHER' ? '/dashboard' : '/panel') : '/auth')} style={{ height: 44, padding: '0 1.75rem', fontSize: '0.9rem' }}>
            {user ? 'Panelime Git' : 'Öğretmenler İçin'}
          </button>
        </div>
      </div>
    </header>
  );
}
