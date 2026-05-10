import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { useNavigate } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar';
import { ArrowRight, BookOpen, Clock, Eye, TrendingUp } from 'lucide-react';

export default function Blog({ theme, toggleTheme }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/api/blog`)
      .then(r => r.json())
      .then(data => {
        setPosts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg)' }}>
      <PublicNavbar theme={theme} toggleTheme={toggleTheme} />
      
      <div style={{ padding: '2rem 5%', maxWidth: '1400px', margin: '120px auto 0 auto', flex: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
        
        {/* Header */}
        <div className="animate-in" style={{ textAlign: 'center', marginBottom: '5rem', borderBottom: '2px solid var(--fg)', paddingBottom: '3rem' }}>
          <h1 style={{ fontSize: 'clamp(3.5rem, 6vw, 5.5rem)', fontFamily: 'DM Serif Display, serif', marginBottom: '1rem', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
            Dersa Akademi
          </h1>
          <p className="text-muted text-lg" style={{ maxWidth: '650px', margin: '0 auto', lineHeight: '1.6' }}>
            Öğretmenlerimizin vizyonları, sınıf içi deneyimleri ve yenilikçi eğitim yaklaşımlarıyla dolu açık kütüphane blogumuz.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--fg-subtle)' }}>Makaleler Yükleniyor...</div>
        ) : (
          <div className="grid animate-in animate-delay-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '3rem' }}>
            {posts.length > 0 ? posts.map((post, i) => (
              <div 
                key={post.id} 
                className="card-hover" 
                style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }} 
                onClick={() => navigate(`/blog/${post.slug}`)}
              >
                {/* Visual Block (Simulating a premium image or pattern) */}
                <div style={{ width: '100%', height: '220px', background: 'var(--bg-raised)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', position: 'relative', overflow: 'hidden', borderRadius: '8px' }}>
                  {post.coverImage ? (
                     <img src={post.coverImage} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                     <TrendingUp size={48} opacity={i===0? 1 : 0.1} color="var(--fg)" />
                  )}
                  {i === 0 && (
                    <div style={{ position: 'absolute', top: 0, left: 0, background: 'var(--fg)', color: 'var(--bg)', padding: '0.4rem 1rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em' }}>EDİTÖRÜN SEÇİMİ</div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                  <span className="tag tag-filled">{post.author.name}</span>
                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', fontSize: '0.75rem', color: 'var(--fg-muted)', fontWeight: 600 }}>
                     <Clock size={12}/> {new Date(post.createdAt).toLocaleDateString('tr-TR')}
                  </div>
                </div>

                <h3 style={{ fontSize: '1.75rem', fontFamily: 'DM Serif Display, serif', marginBottom: '0.75rem', lineHeight: '1.1' }}>
                  {post.title}
                </h3>
                
                <p className="text-subtle text-sm" style={{ flex: 1, marginBottom: '1.5rem', lineHeight: '1.6' }}>
                  {post.excerpt || 'Bu makalede eğitimin geleceği hakkında yeni fikirler ve detaylı anlatımlar yer alıyor. Hemen keşfedin...'}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                     <span style={{ fontSize: '0.8rem', color: 'var(--fg-subtle)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}><Eye size={14}/> {post.views}</span>
                     <span style={{ fontSize: '0.8rem', color: 'var(--fg-subtle)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}><BookOpen size={14}/> {post._count?.comments || 0}</span>
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>Oku <ArrowRight size={14}/></span>
                </div>
              </div>
            )) : (
              <div style={{ gridColumn: '1 / -1', padding: '5rem 0', textAlign: 'center', border: '1px dashed var(--border)' }}>
                <h3 style={{ fontSize: '1.5rem', fontFamily: 'DM Serif Display, serif', marginBottom: '1rem' }}>Henüz Bir Makale Yok</h3>
                <p className="text-subtle text-sm">İlk içeriği üreten öğretmenimiz olmak için hemen stüdyoya girin!</p>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
