import React, { useState, useEffect, useContext } from 'react';
import { API_URL } from '../config';
import { useNavigate } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar';
import { AuthContext } from '../context/AuthContext';
import { Camera, Mail, TrendingUp, Award, Clock, Star, X, CheckCircle, Flame, LogOut, ChevronRight, Check } from 'lucide-react';

export default function StudentDashboard({ theme, toggleTheme }) {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext); 

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ points: 0, rank: 'Bronze', name: '', avatar: '' });
  
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', avatar: '' });

  useEffect(() => {
    if (!user) {
      if (!loading) navigate('/'); // Protect route
      return;
    }
    
    // Fetch Rank
    fetch(`${API_URL}/api/user/${user.id}/rank`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setStats(data);
          setEditForm({ name: data.name, avatar: data.avatar || '' });
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [user, navigate, loading]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/user/profile/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      const data = await res.json();
      if(data.success) {
        setStats({ ...stats, name: data.user.name, avatar: data.user.avatar });
        const localUserStr = localStorage.getItem('dersa_user');
        if(localUserStr) {
          const localUser = JSON.parse(localUserStr);
          localUser.name = data.user.name;
          localUser.avatar = data.user.avatar;
          localStorage.setItem('dersa_user', JSON.stringify(localUser));
        }
        setEditMode(false);
        window.location.reload(); 
      }
    } catch(err) {
      console.error(err);
    }
  };

  const getRankConfig = (r) => {
    switch(r) {
      case 'Bronze': return { label: 'Bronz', icon: '/src/assets/bronze.png', max: 300, color: '#b45309', bg: '#fef3c7', desc: 'Başlangıç' };
      case 'Silver': return { label: 'Gümüş', icon: '/src/assets/silver.png', max: 600, color: '#64748b', bg: '#f1f5f9', desc: 'Gelişme aşaması' };
      case 'Gold': return { label: 'Altın', icon: '/src/assets/gold.png', max: 1000, color: '#d97706', bg: '#fef3c7', desc: 'Ortalama üstü yetenek' };
      case 'Platinum': return { label: 'Platin', icon: '/src/assets/platinum.png', max: 1500, color: '#0ea5e9', bg: '#e0f2fe', desc: 'İleri seviye' };
      case 'Diamond': return { label: 'Elmas', icon: '/src/assets/diamond.png', max: 2500, color: '#6366f1', bg: '#e0e7ff', desc: 'Elit oyuncular' };
      case 'Master': return { label: 'Usta', icon: '/src/assets/master.png', max: 5000, color: '#be185d', bg: '#fce7f3', desc: 'En üst kademe' };
      default: return { label: 'Bronz', icon: '/src/assets/bronze.png', max: 300, color: '#b45309', bg: '#fef3c7', desc: 'Başlangıç' };
    }
  };

  const joinClassroom = async () => {
    const code = prompt("Öğretmeninizin verdiği 6 haneli kalıcı Sınıf Kodunu girin:");
    if (!code?.trim()) return;
    try {
      const res = await fetch(`${API_URL}/api/classrooms/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), studentId: user?.id || 'anon', studentName: stats.name })
      });
      const data = await res.json();
      if (data.success) {
        alert(`${data.classroom.name} sınıfına başarıyla katıldınız! (Öğretmen paneli eklendi, Canlı Dersleriniz ana sayfada gözükecek).`);
      } else {
        alert(data.error || 'Hata oluştu');
      }
    } catch {
      alert("Sunucu hatası.");
    }
  };

  const getTimeGreeting = () => {
    const hr = new Date().getHours();
    if(hr < 12) return "Günaydın";
    if(hr < 18) return "İyi günler";
    return "İyi akşamlar";
  };

  if(!user || loading) return <div style={{ paddingTop: '150px', textAlign: 'center' }}>Yükleniyor...</div>;

  const rankConf = getRankConfig(stats.rank);
  const nextProgress = Math.min((stats.points / rankConf.max) * 100, 100);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg)', minHeight: '100vh', overflowX: 'hidden' }}>
      <PublicNavbar theme={theme} toggleTheme={toggleTheme} />
      
      {/* ── HERO SECTION ── */}
      <div style={{ background: theme === 'dark' ? '#09090b' : '#f8fafc', padding: '140px 5% 4rem 5%', borderBottom: '1px solid var(--border)', position: 'relative' }}>
         <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', zIndex: 0 }}>
            {/* Soft Ambient Glow */}
            <div style={{ position: 'absolute', top: -100, left: '20%', width: 500, height: 500, background: 'var(--fg)', opacity: 0.03, filter: 'blur(100px)', borderRadius: '50%' }}></div>
         </div>
         <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }} className="hero-stack">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ width: 90, height: 90, borderRadius: '50%', background: 'var(--bg-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '2px solid var(--border)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                 {stats.avatar ? (
                   <img src={stats.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                 ) : (
                   <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--fg)' }}>{stats.name?.charAt(0)}</span>
                 )}
              </div>
              <div>
                 <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--fg-subtle)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                   {getTimeGreeting()}
                 </p>
                 <h1 style={{ margin: 0, fontFamily: 'DM Serif Display, serif', fontSize: '2.5rem', lineHeight: 1.2 }}>{stats.name}</h1>
                 <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.9rem', color: 'var(--fg-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   <Mail size={14}/> {user.email}
                 </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
               <button className="btn btn-primary" onClick={joinClassroom} style={{ boxShadow: 'var(--shadow-md)' }}>+ Sınıfa Katıl</button>
               <button className="btn btn-ghost" onClick={() => setEditMode(true)} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>Profili Düzenle</button>
            </div>
         </div>
      </div>

      <div style={{ padding: '3rem 5%', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: '2.5rem' }} className="student-grid">
          
          {/* ── LEFT COLUMN ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            
            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
               <div className="stat-card">
                  <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}><CheckCircle size={20}/></div>
                  <div>
                    <div className="stat-value">12</div>
                    <div className="stat-label">Tamamlanan Video</div>
                  </div>
               </div>
               <div className="stat-card">
                  <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}><Flame size={20}/></div>
                  <div>
                    <div className="stat-value">4 Gün</div>
                    <div className="stat-label">Çalışma Serisi</div>
                  </div>
               </div>
               <div className="stat-card">
                  <div className="stat-icon" style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}><Clock size={20}/></div>
                  <div>
                    <div className="stat-value">18.5s</div>
                    <div className="stat-label">Toplam Süre</div>
                  </div>
               </div>
            </div>

            {/* Performance Chart (CSS based) */}
            <div className="card" style={{ padding: '2rem' }}>
               <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <TrendingUp size={18} color="var(--fg-subtle)" /> Haftalık Performans
               </h3>
               
               <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 160, paddingBottom: '2rem', borderBottom: '1px dashed var(--border)' }}>
                 {/* Chart Bars Dummy Data */}
                 {[
                   { day: 'Pzt', h: 40 }, { day: 'Sal', h: 85 }, { day: 'Çar', h: 50 }, 
                   { day: 'Per', h: 100 }, { day: 'Cum', h: 30 }, { day: 'Cts', h: 60 }, { day: 'Paz', h: 90 }
                 ].map((b, i) => (
                   <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                     <div className="bar-wrapper" style={{ width: '100%', maxWidth: '32px', height: 120, background: 'var(--bg-raised)', borderRadius: 6, position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${b.h}%`, background: b.h === 100 ? 'var(--fg)' : 'var(--fg-subtle)', borderRadius: 6, transition: 'height 1s ease' }}></div>
                     </div>
                     <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--fg-subtle)' }}>{b.day}</span>
                   </div>
                 ))}
               </div>
            </div>

            {/* Activity Timeline */}
            <div className="card" style={{ padding: '2rem' }}>
               <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 Tarihçe & Kütüphane Kayıtları
               </h3>
               
               <div className="timeline">
                 {[
                   { konusu: 'Tarih: Osmanlı Kuruluş', tarih: 'Bugün, 14:30', test: '100/100 QP', stat: 'Tamamlandı' },
                   { konusu: 'Coğrafya: İklim Tipleri', tarih: 'Dün, 09:15', test: '50/50 QP', stat: 'Tamamlandı' },
                   { konusu: 'Matematik: Olasılık', tarih: '4 gün önce', test: '0 QP', stat: 'Gözden Geçir' },
                   { konusu: 'Sisteme Kayıt Olundu', tarih: '1 hafta önce', test: '', stat: 'Milestone' }
                 ].map((item, id) => (
                   <div key={id} style={{ display: 'flex', gap: '1.5rem', position: 'relative', paddingBottom: '2rem' }}>
                     {/* Line segment */}
                     {id !== 3 && <div style={{ position: 'absolute', top: 24, left: 11, bottom: 0, width: 2, background: 'var(--border)' }}></div>}
                     
                     {/* Node */}
                     <div style={{ width: 24, height: 24, borderRadius: '50%', background: item.stat === 'Milestone' ? 'var(--fg)' : 'var(--bg-surface)', border: item.stat === 'Milestone' ? 'none' : '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                       {item.stat === 'Milestone' && <Star size={12} color="var(--bg)" />}
                     </div>
                     
                     {/* Content */}
                     <div style={{ flex: 1, marginTop: -2 }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '1rem' }}>{item.konusu}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--fg-subtle)', marginTop: '0.25rem' }}>{item.tarih}</div>
                          </div>
                          {item.stat !== 'Milestone' && (
                            <div style={{ textAlign: 'right' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.5rem', borderRadius: 4, background: item.stat === 'Tamamlandı' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: item.stat === 'Tamamlandı' ? '#10b981' : '#ef4444' }}>
                                 {item.stat}
                              </span>
                              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--fg)', marginTop: '0.4rem' }}>{item.test}</div>
                            </div>
                          )}
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
               
               <button className="btn btn-ghost btn-block mt-4" onClick={() => navigate('/explore')}>Kütüphaneyi Keşfet <ChevronRight size={16}/></button>
            </div>

          </div>

          {/* ── RIGHT COLUMN ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            
            {/* Gamified Hero Badge Widget */}
            <div className="card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
               <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 130, background: 'var(--bg-raised)', zIndex: 0, borderBottom: '1px solid var(--border)' }}></div>
               
               <div style={{ zIndex: 1, marginTop: '2rem', marginBottom: '1.5rem', position: 'relative', width: 140, height: 140 }}>
                  {/* Glowing Rotating Sun Effect */}
                  <div className="glowing-sun" style={{ position: 'absolute', top: '50%', left: '50%', width: 140, height: 140, background: `radial-gradient(circle, ${rankConf.color} 0%, transparent 70%)`, opacity: 0.25 }}></div>
                  
                  {/* Badge */}
                  <img src={rankConf.icon} alt={rankConf.label} style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 15px 35px rgba(0,0,0,0.3))', zIndex: 2, position: 'relative' }} />
               </div>

               <h3 style={{ fontSize: '2rem', fontFamily: 'DM Serif Display, serif', margin: 0, position: 'relative', zIndex: 1 }}>{rankConf.label}</h3>
               <p style={{ color: rankConf.color, fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.4rem', marginBottom: '2rem' }}>{rankConf.desc}</p>
               
               <div style={{ width: '100%', background: 'var(--bg-surface)', padding: '1.5rem', borderRadius: 12, border: '1px solid var(--border)', textAlign: 'left', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.02)' }}>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--fg-subtle)', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Toplam QP (Puan)</span>
                    <span style={{ fontWeight: 800, color: 'var(--fg)' }}>{stats.points}</span>
                  </p>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--fg-muted)', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Sonraki rütbeye kalan</span>
                    <span>{Math.max(rankConf.max - stats.points, 0)} QP</span>
                  </p>
                  <div style={{ height: 8, background: 'var(--bg)', borderRadius: 4, overflow: 'hidden', border: '1px solid var(--border)' }}>
                      <div style={{ height: '100%', background: rankConf.color, width: `${nextProgress}%`, transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                  </div>
               </div>
            </div>

            {/* Quests (Görevler) Widget */}
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Award size={18} color="var(--fg-subtle)" /> Günlük Görevler
                </h3>
                <span className="badge" style={{ background: 'var(--fg)', color: 'var(--bg)', fontSize: '0.7rem' }}>3 GÖREV</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 {[
                   { title: '1 Kütüphane Videosu İzle', reward: '+20 QP', done: true },
                   { title: 'Testi Başarıyla Çöz', reward: '+50 QP', done: false },
                   { title: 'Günde 3 Saat Çalış', reward: '+100 QP', done: false },
                 ].map((q, i) => (
                   <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: 8, background: q.done ? 'var(--bg)' : 'var(--bg-surface)', border: `1px solid ${q.done ? 'var(--border)' : 'var(--border)'}`, opacity: q.done ? 0.6 : 1 }}>
                     <div style={{ width: 28, height: 28, borderRadius: '50%', background: q.done ? '#10b981' : 'var(--bg-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                       {q.done ? <Check size={16} /> : <div style={{width:8,height:8,background:'var(--border)',borderRadius:'50%'}}></div>}
                     </div>
                     <div style={{ flex: 1 }}>
                       <div style={{ fontWeight: 600, fontSize: '0.9rem', textDecoration: q.done ? 'line-through' : 'none' }}>{q.title}</div>
                     </div>
                     <div style={{ fontSize: '0.8rem', fontWeight: 800, color: q.done ? 'var(--fg-subtle)' : 'var(--fg)' }}>{q.reward}</div>
                   </div>
                 ))}
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* ── EDIT PROFILE MODAL ── */}
      {editMode && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="card animate-in" style={{ width: '100%', maxWidth: 450, padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Profili Düzenle</h3>
               <button onClick={() => setEditMode(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--fg-subtle)' }}><X size={20}/></button>
            </div>
            <form onSubmit={handleUpdate} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
               <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--fg-subtle)' }}>Öğrenci Ad Soyad</label>
                  <input type="text" className="field" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} required />
               </div>
               <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--fg-subtle)' }}>Profil Fotoğrafı Bağlantısı (URL)</label>
                  <input type="url" className="field" placeholder="https://resim-adresi.png" value={editForm.avatar} onChange={e => setEditForm({...editForm, avatar: e.target.value})} />
               </div>
               <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setEditMode(false)}>Vazgeç</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Kaydet</button>
               </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .stat-card {
          background: var(--bg-surface); border: 1px solid var(--border); padding: 1.5rem; border-radius: 12px; display: flex; align-items: center; gap: 1rem;
        }
        .stat-icon {
          width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center;
        }
        .stat-value { font-size: 1.5rem; font-weight: 800; color: var(--fg); line-height: 1.2; }
        .stat-label { font-size: 0.75rem; color: var(--fg-subtle); text-transform: uppercase; letter-spacing: 0.05em; margin-top: 0.25rem; font-weight: 600; }
        
        .glowing-sun {
          transform-origin: center center;
          animation: rotateSun 10s linear infinite;
        }

        @keyframes rotateSun {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }

        @media (max-width: 900px) {
          .hero-stack { flex-direction: column; align-items: flex-start !important; gap: 1.5rem; }
          .student-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
