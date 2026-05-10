import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { Search, SlidersHorizontal, Layers, PlayCircle, MousePointer2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar';

const categories = ['Tümü', 'Matematik', 'Tarih', 'Coğrafya', 'Biyoloji', 'Fizik', 'Kimya', 'Edebiyat'];

export default function Explore({ theme, toggleTheme }) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('Tümü');
  const [query, setQuery] = useState('');
  const [library, setLibrary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/library`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setLibrary(data.items);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filtered = library.filter(c =>
    (filter === 'Tümü' || c.subject === filter) &&
    (!query || c.title.toLowerCase().includes(query.toLowerCase()) || c.author.toLowerCase().includes(query.toLowerCase()))
  );

  const getIcon = (name) => {
    switch(name) {
      case 'MousePointer2': return <MousePointer2 size={20}/>;
      case 'Layers': return <Layers size={20}/>;
      case 'PlayCircle': return <PlayCircle size={20}/>;
      default: return <PlayCircle size={20}/>;
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg)', minHeight: '100vh' }}>
      <PublicNavbar theme={theme} toggleTheme={toggleTheme} />
      
      <div style={{ padding: '2rem 5%', maxWidth: '1400px', margin: '88px auto 0 auto', flex: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
      
      {/* ─── EXPLORE HERO SEARCH ─── */}
      <div className="animate-in" style={{ textAlign: 'center', margin: '4rem 0 5rem 0' }}>
        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontFamily: 'DM Serif Display, serif', marginBottom: '1.5rem' }}>Dersa Kütüphanesi</h1>
        <p className="text-muted text-lg" style={{ marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem auto' }}>
          Platformdaki öğretmenlerin herkese açık sisteme yüklediği binlerce etkileşimli dersi ücretsiz izleyin, görevleri tamamlayın ve seviye atlayın.
        </p>

        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', gap: '0.5rem', background: 'var(--bg-surface)', border: '2px solid var(--border-strong)', padding: '0.5rem', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', flex: 1, paddingLeft: '1rem', gap: '1rem', color: 'var(--fg-subtle)' }}>
            <Search size={24} />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Konu, içerik veya eğitmen adı arayın..."
              style={{ flex: 1, fontSize: '1.25rem', background: 'transparent', border: 'none', outline: 'none', color: 'var(--fg)', fontFamily: 'DM Serif Display, serif' }}
            />
          </div>
          <button className="btn btn-primary" style={{ padding: '0 2.5rem', height: '56px', fontSize: '1.1rem' }}>
            Keşfet
          </button>
        </div>
      </div>

      {/* ─── FILTERS ─── */}
      <div className="animate-in animate-delay-2" style={{ borderBottom: '2px solid var(--fg)', paddingBottom: '1rem', marginBottom: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`btn btn-sm ${filter === cat ? 'btn-primary' : 'btn-ghost'}`}
              style={{ borderRadius: 0, padding: '0.35rem 1rem', fontSize: '0.85rem' }}
            >
              {cat}
            </button>
          ))}
        </div>
        <button className="btn btn-ghost btn-sm" style={{ gap: '0.5rem' }}>
          <SlidersHorizontal size={14} /> Detaylı Filtre
        </button>
      </div>

      {/* ─── RESULTS GRID ─── */}
      <div className="animate-in animate-delay-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '3rem' }}>
        {loading ? (
           <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--fg-subtle)' }}>Kütüphane yükleniyor...</div>
        ) : filtered.map((item) => (
          <div key={item.id} className="card-hover" style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer' }} onClick={() => navigate(`/explore/${item.id}`)}>
            
            <div className="browser-mockup" style={{ position: 'relative' }}>
              <div className="browser-chrome">
                <div className="browser-dot" /><div className="browser-dot" /><div className="browser-dot" />
              </div>
              <div className="browser-content" style={{ position: 'relative' }}>
                 {/* Video thumbnail logic using item.videoId if available */}
                 {item.videoId ? (
                    <img src={`https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg`} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                 ) : (
                    <div style={{ width: '40px', height: '40px', background: 'var(--bg-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center', outline: '1px solid var(--border)', margin: 'auto', marginTop: '30%' }}>
                      {getIcon(item.stringIcon)}
                    </div>
                 )}
                 <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }} className="overlay">
                    <div style={{ width: 60, height: 60, background: 'var(--fg)', color: 'var(--bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       <PlayCircle size={30} />
                    </div>
                 </div>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span className="tag" style={{ border: 'none', background: 'var(--fg)', color: 'var(--bg)' }}>{item.subject}</span>
                <span className="text-xs font-semibold" style={{ color: 'var(--fg-subtle)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{item.type}</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'DM Serif Display, serif', marginBottom: '1rem' }}>{item.title}</h3>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="text-sm font-bold text-muted">yazar {item.author}</span>
                <span className="text-xs font-semibold" style={{ background: 'var(--bg-surface)', padding: '0.2rem 0.5rem', border: '1px solid var(--border)' }}>{item.plays} GÖRÜNTÜLENME</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {(!loading && filtered.length === 0) && (
        <div className="animate-in" style={{ textAlign: 'center', padding: '6rem 0' }}>
          <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '2rem', color: 'var(--fg-subtle)' }}>Aradığınız kriterlere uygun içerik bulunamadı.</h2>
          <p className="text-muted mt-4">Lütfen farklı kelimelerle arama yapın veya filtreyi temizleyin.</p>
          <button className="btn btn-primary mt-6" onClick={() => { setQuery(''); setFilter('Tümü'); }}>Tüm Sonuçları Gör</button>
        </div>
      )}

      {/* Basic hover effect style for the image overlay */}
      <style>{`
        .card-hover:hover .overlay { opacity: 1 !important; }
      `}</style>
      </div>
    </div>
  );
}
