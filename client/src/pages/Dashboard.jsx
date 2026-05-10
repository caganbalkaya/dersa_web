import React, { useState, useEffect, useContext } from 'react';
import { API_URL } from '../config';
import { ArrowRight, Plus, Users, BookOpen, MessageSquare, Eye, ExternalLink, Trash2, Edit3, Gamepad2, PenTool, Presentation, Settings, Film } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const POLL_INTERVAL = 60000; // 60 saniye — sunucuyu sıkmadan

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [stats, setStats] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchStats = async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`${API_URL}/api/dashboard/stats/${user.id}`);
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setPosts(data.posts || []);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Dashboard stats error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [user?.id]);

  const deletePost = async (id) => {
    if (!confirm('Bu makaleyi silmek istediğinize emin misiniz?')) return;
    try {
      await fetch(`${API_URL}/api/blog/${id}`, { method: 'DELETE' });
      setPosts(prev => prev.filter(p => p.id !== id));
      setStats(prev => prev ? { ...prev, totalPosts: prev.totalPosts - 1 } : prev);
    } catch (err) {
      console.error(err);
    }
  };

  const statCards = [
    {
      label: 'Yayımlanan Makale',
      value: loading ? '—' : (stats?.totalPosts ?? 0),
      note: stats?.totalPosts > 0 ? 'Makalelerim' : 'İlk makaleni yaz',
      icon: <BookOpen size={22} opacity={0.5} />,
      cta: () => navigate('/writepost'),
    },
    {
      label: 'Toplam Okuma',
      value: loading ? '—' : (stats?.totalViews ?? 0).toLocaleString('tr-TR'),
      note: 'Tüm makaleler geneli',
      icon: <Eye size={22} opacity={0.5} />,
    },
    {
      label: 'Toplam Yorum',
      value: loading ? '—' : (stats?.totalComments ?? 0),
      note: 'Okuyuculardan geri bildirim',
      icon: <MessageSquare size={22} opacity={0.5} />,
    },
    {
      label: 'Aktif Öğrenci',
      value: '—',
      note: 'Canlı ders verileri',
      icon: <Users size={22} opacity={0.5} />,
      cta: () => navigate('/studio'),
    },
  ];

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const createClassroom = async () => {
    const clsName = prompt("Kalıcı Sınıfınızın adını girin (Örn: 11-A Matematik):");
    if (!clsName?.trim()) return;
    try {
      const res = await fetch(`${API_URL}/api/classrooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: clsName, teacherId: user.id })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Sınıf oluşturuldu! Kalıcı PIN Kodunuz: ${data.classroom.code}\n\nÖğrencileriniz panellerinden bu kod ile sınıfınıza kalıcı kayıt olabilir.`);
      } else {
        alert(data.error || 'Hata oluştu');
      }
    } catch {
      alert("Sunucu hatası.");
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>

      {/* ─── Header ─── */}
      <div style={{ paddingBottom: '1.5rem', marginBottom: '2.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '2.25rem', marginBottom: '0.5rem' }}>Öğretmen Paneli</h1>
          <p className="text-subtle text-lg" style={{ margin: 0 }}>
            Hoş geldiniz, <strong>{user?.name}</strong>.
            {lastUpdated && (
              <span style={{ fontSize: '0.78rem', color: 'var(--fg-subtle)', marginLeft: '0.75rem' }}>
                Son güncelleme: {lastUpdated.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-ghost btn-sm" onClick={createClassroom}>
            + Yeni Sınıf Aç (Kalıcı)
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/studio')}>
            Stüdyo
          </button>
          <button className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }} onClick={() => navigate('/writepost')}>
            <Plus size={16} /> Yeni Makale
          </button>
        </div>
      </div>

      {/* ─── Stats Grid ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        {statCards.map((s, i) => (
          <div
            key={i}
            className="stat-card"
            style={{ position: 'relative', overflow: 'hidden', cursor: s.cta ? 'pointer' : 'default' }}
            onClick={s.cta}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div className="stat-card-label">{s.label}</div>
              <div style={{ color: 'var(--fg)' }}>{s.icon}</div>
            </div>
            <div className="stat-card-value" style={{ position: 'relative', zIndex: 1 }}>
              {s.value}
            </div>
            <div className="text-sm text-subtle" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500 }}>
              <span style={{ width: 6, height: 6, background: 'var(--fg-subtle)', borderRadius: '50%', flexShrink: 0 }} />
              {s.note}
            </div>
            <div style={{ position: 'absolute', right: -20, bottom: -20, width: 100, height: 100, background: 'var(--fg)', opacity: 0.03, borderRadius: '50%', filter: 'blur(20px)' }} />
          </div>
        ))}
      </div>

      {/* ─── Recent Posts Table ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h3 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.5rem' }}>Son Makalelerim</h3>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/writepost')}>
          Tümünü Yönet <ArrowRight size={14} />
        </button>
      </div>

      <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', overflowX: 'auto', boxShadow: 'var(--shadow-sm)' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--fg-subtle)' }}>Yükleniyor...</div>
        ) : posts.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--fg-subtle)' }}>
            <BookOpen size={40} opacity={0.2} style={{ marginBottom: '1rem' }} />
            <p>Henüz yayınlanmış makale yok.</p>
            <button className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }} onClick={() => navigate('/writepost')}>
              İlk Makalemi Yaz
            </button>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
                {['Başlık', 'Tarih', 'Görüntülenme', 'Yorum', 'İşlemler'].map((h, i) => (
                  <th key={h} style={{ padding: '1rem 1.25rem', fontSize: '0.78rem', fontWeight: 700, color: 'var(--fg-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: i === 4 ? 'right' : 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {posts.map((post, i) => (
                <tr
                  key={post.id}
                  style={{ borderBottom: i < posts.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 600, fontSize: '0.9rem', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {post.title}
                  </td>
                  <td style={{ padding: '1rem 1.25rem', color: 'var(--fg-subtle)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                    {formatDate(post.createdAt)}
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--fg-subtle)', fontSize: '0.85rem' }}>
                      <Eye size={13} /> {post.views ?? 0}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--fg-subtle)', fontSize: '0.85rem' }}>
                      <MessageSquare size={13} /> {post._count?.comments ?? 0}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => window.open(`/blog/${post.slug}`, '_blank')} title="Görüntüle">
                        <ExternalLink size={13} />
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => deletePost(post.id)} title="Sil" style={{ color: 'var(--fg-subtle)' }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ─── Quick Links ─── */}
      <div style={{ marginTop: '3rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {[
          { label: 'Makale Yaz', icon: <Edit3 size={18} />, desc: 'Yeni blog içeriği oluştur', to: '/writepost', id: 'writepost' },
          { label: 'Oyun Stüdyosu', icon: <Gamepad2 size={18} />, desc: 'Sınıf içi yarışmalar', to: '/gamestudio', id: 'gamestudio' },
          { label: 'Akademi Stüdyosu', icon: <Film size={18} />, desc: 'İnteraktif video testleri', to: '/academystudio', id: 'academystudio' },
          { label: 'Çizim Stüdyosu', icon: <PenTool size={18} />, desc: 'Canlı slayt panosu', to: '/studio', id: 'studio' },
          { label: 'Sunum Hazırla', icon: <Presentation size={18} />, desc: 'Slayt editörü', to: '/slidemaker', id: 'slidemaker' },
          { label: 'Ayarlar', icon: <Settings size={18} />, desc: 'Profil ve hesap', to: '/settings', id: 'settings' },
        ].map(link => (
          <button
            key={link.to}
            data-tour={link.id}
            className="card"
            style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left', cursor: 'pointer', padding: '1.25rem 1.5rem', border: '1px solid var(--border)', background: 'var(--bg-surface)', transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)' }}
            onClick={() => navigate(link.to)}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--fg)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.05)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.95rem', color: 'var(--fg)' }}>
               {link.icon} {link.label}
            </div>
            <div className="text-sm text-subtle" style={{ color: 'var(--fg-subtle)' }}>{link.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
