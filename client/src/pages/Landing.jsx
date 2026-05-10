import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, ArrowRight, Zap, RefreshCw, BarChart, Layers, Search, MousePointer2, BookOpen } from 'lucide-react';
import PublicNavbar from '../components/PublicNavbar';
import GuidedTour from '../components/GuidedTour';

export default function Landing({ theme, toggleTheme, isHovering, setIsHovering }) {
  const navigate = useNavigate();
  const [pin, setPin] = useState('');

  const handleJoin = (e) => {
    e.preventDefault();
    if (pin.trim().length >= 4) {
      navigate('/play', { state: { initialPin: pin } });
    }
  };

  const interactiveProps = {
    onMouseEnter: () => setIsHovering && setIsHovering(true),
    onMouseLeave: () => setIsHovering && setIsHovering(false)
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg)', cursor: 'none' }}>

      <PublicNavbar theme={theme} toggleTheme={toggleTheme} isHovering={isHovering} setIsHovering={setIsHovering} />
      <GuidedTour />

      {/* ─── HERO SECTION ─── */}
      <section className="hero-padding" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        position: 'relative',
        marginTop: '88px', // Offset for bigger navbar
        borderBottom: '1px solid var(--border)'
      }}>
        <div className="animate-in animate-delay-1" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-raised)', padding: '0.5rem 1.25rem', border: '1px solid var(--border)', marginBottom: '2.5rem' }}>
          <span className="badge" style={{ background: 'var(--fg)', color: 'var(--bg)', border: 'none' }}>YENİ V8</span>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em' }}>PREMIUM EKOSİSTEM</span>
        </div>

        <h1 className="animate-in animate-delay-2" style={{
          fontSize: 'clamp(3rem, 7vw, 6.5rem)',
          fontFamily: 'DM Serif Display, serif',
          lineHeight: '1.02',
          marginBottom: '2rem',
          maxWidth: '900px',
          letterSpacing: '-0.02em'
        }}>
          Geleceğin Sınıfı. <br /> <span style={{ color: 'var(--fg-subtle)' }}>Saniyeler İçinde Bağlan.</span>
        </h1>
        <p className="animate-in animate-delay-3 text-muted" style={{ fontSize: 'clamp(1.1rem, 2vw, 1.35rem)', maxWidth: '650px', marginBottom: '3.5rem', lineHeight: '1.6' }}>
          Karmaşık menüleri bırakın. Basit bir 6 haneli kodla tüm sınıfı aynı editoryal ekranda senkronize edin.
        </p>

        <div className="animate-in animate-delay-4" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', width: '100%', maxWidth: '440px' }} {...interactiveProps}>
          <form onSubmit={handleJoin} style={{ display: 'flex', width: '100%', border: '2px solid var(--border-strong)', padding: '0.35rem', paddingLeft: '1.25rem', background: 'var(--bg-surface)', boxShadow: 'var(--shadow-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--fg)', flex: 1 }}>
              <PlayCircle size={22} />
              <input
                type="text"
                placeholder="ÖRN: 948210"
                value={pin}
                onChange={(e) => setPin(e.target.value.toUpperCase())}
                maxLength={8}
                style={{
                  background: 'transparent', border: 'none', outline: 'none',
                  fontSize: '1.35rem', color: 'var(--fg)', width: '100%',
                  letterSpacing: '0.15em', fontWeight: 'bold'
                }}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ height: '54px', padding: '0 2rem', fontSize: '1.1rem' }}>
              Derse Katıl
            </button>
          </form>
          <span style={{ fontSize: '0.8rem', color: 'var(--fg-subtle)', fontWeight: 600, letterSpacing: '0.05em', marginTop: '0.75rem' }}>Öğrenci Kodu ile Anında Bağlanın</span>
        </div>
      </section>

      {/* ─── MARQUEE TICKER ─── */}
      <div className="marquee-container animate-in animate-delay-5">
        <div className="marquee-content" {...interactiveProps}>
          <span className="marquee-item">Minimalist Eğitim Ekosistemi</span>
          <span className="marquee-item">Sınıf İçi Etkileşim Platform</span>
          <span className="marquee-item">Anlık Senkronizasyon</span>
          <span className="marquee-item">Premium Slayt Stüdyosu</span>
          <span className="marquee-item">Açık Kaynak Felsefesi</span>
          <span className="marquee-item">Minimalist Eğitim Ekosistemi</span>
          <span className="marquee-item">Sınıf İçi Etkileşim Platform</span>
          <span className="marquee-item">Anlık Senkronizasyon</span>
          <span className="marquee-item">Premium Slayt Stüdyosu</span>
          <span className="marquee-item">Açık Kaynak Felsefesi</span>
        </div>
      </div>

      {/* ─── BENTO GRID FEATURES ─── */}
      <section id="ozellikler" className="section-padding" style={{ background: 'var(--bg)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ marginBottom: '4rem' }}>
            <h2 style={{ fontSize: 'clamp(2.5rem, 4vw, 4rem)', fontFamily: 'DM Serif Display, serif', marginBottom: '1rem' }}>Sıfır Sürtünme.</h2>
          </div>

          <div className="bento-grid">
            <div className="card-hover" style={{ background: 'var(--bg)', padding: '4rem 3rem', gridColumn: '1 / -1' }} {...interactiveProps}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem' }}>
                <div style={{ maxWidth: '600px' }}>
                  <div style={{ marginBottom: '2rem', display: 'inline-block', padding: '1.25rem', background: 'var(--fg)', color: 'var(--bg)', borderRadius: '0' }}>
                    <Zap size={32} />
                  </div>
                  <h3 style={{ fontSize: '2.5rem', marginBottom: '1.25rem', fontFamily: 'DM Serif Display, serif' }}>Gerçek Zamanlı Soket Ağı.</h3>
                  <p className="text-subtle text-lg" style={{ lineHeight: '1.6' }}>Öğretmen tahtada slaytı değiştirdiği milisaniyede tüm öğrencilerin telefon ve tabletlerindeki ekran tamamen senkronize olur.</p>
                </div>
              </div>
            </div>

            <div className="card-hover" style={{ background: 'var(--bg)', padding: '3rem 2.5rem' }} {...interactiveProps}>
              <Layers size={28} style={{ marginBottom: '1.25rem' }} />
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontFamily: 'DM Serif Display, serif' }}>Slayt Stüdyosu</h3>
              <p className="text-subtle" style={{ lineHeight: '1.6' }}>Karmaşık paletleri kaldırıp sadece odaklanacağınız saf içeriğe yer açan editoryal tasarım motoru.</p>
            </div>

            <div className="card-hover" style={{ background: 'var(--bg)', padding: '3rem 2.5rem' }} {...interactiveProps}>
              <BarChart size={28} style={{ marginBottom: '1.25rem' }} />
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontFamily: 'DM Serif Display, serif' }}>Anlık Liderlik</h3>
              <p className="text-subtle" style={{ lineHeight: '1.6' }}>Öğrencilerin quizlerdeki performansını anlık olarak ölçün, rekabetçi skor tabloları (Liderlik) yaratın.</p>
            </div>

            <div className="card-hover" style={{ background: 'var(--bg)', padding: '3rem 2.5rem' }} {...interactiveProps}>
              <RefreshCw size={28} style={{ marginBottom: '1.25rem' }} />
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontFamily: 'DM Serif Display, serif' }}>Açık Kütüphane</h3>
              <p className="text-subtle" style={{ lineHeight: '1.6' }}>Sadece kendi sınıfınıza kapalı kalmayın, açık sistem havuzu ile diğer öğretmenlerin içeriklerini sınırsızca kopyalayın.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SHOWCASE LIBRARIES (Premium Design) ─── */}
      <section className="section-padding" style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4rem', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div style={{ maxWidth: '600px' }}>
              <h2 style={{ fontSize: 'clamp(2.5rem, 4.5vw, 3.5rem)', fontFamily: 'DM Serif Display, serif', marginBottom: '1rem' }}>Özenle Seçilmiş İçerikler</h2>
              <p className="text-subtle text-lg">Platforma kayıt bile olmadan yüzlerce slayt ve eğitim oyununu anında oynatabilir veya inceleyebilirsiniz.</p>
            </div>
            <button className="btn btn-primary" style={{ padding: '0.75rem 2rem' }} onClick={() => navigate('/explore')} {...interactiveProps}>
              Kütüphane'yi Aç <Search size={16} style={{ marginLeft: '0.5rem' }} />
            </button>
          </div>

          <div className="featured-carousel-container">
            <div className="featured-carousel-track">
              {[
                { id: 1, type: 'Etkileşimli Slayt', title: 'Dünya Edebiyatı Klasikleri Özeti', author: 'Ceren K.', icon: <Layers size={14} /> },
                { id: 2, type: 'Bulmaca Oyunu', title: 'Avrupa Başkentleri Eşleştirme', author: 'Dersa Ekibi', icon: <MousePointer2 size={14} /> },
                { id: 3, type: 'Quiz & Soru Seti', title: 'Hücre Organelleri Fonksiyonları', author: 'Selin Akın', icon: <PlayCircle size={14} /> },
                { id: 4, type: 'Etkileşimli Slayt', title: 'Roma İmparatorluğu Tarihi', author: 'Ahmet T.', icon: <Layers size={14} /> },
                { id: 5, type: 'Hızlı Pratik', title: 'Temel Matematik Denklemleri', author: 'Merve S.', icon: <MousePointer2 size={14} /> },
                /* Duyular arası kayma hilesi için aynı diziyi tekrar ediyoruz */
                { id: 6, type: 'Etkileşimli Slayt', title: 'Dünya Edebiyatı Klasikleri Özeti', author: 'Ceren K.', icon: <Layers size={14} /> },
                { id: 7, type: 'Bulmaca Oyunu', title: 'Avrupa Başkentleri Eşleştirme', author: 'Dersa Ekibi', icon: <MousePointer2 size={14} /> },
                { id: 8, type: 'Quiz & Soru Seti', title: 'Hücre Organelleri Fonksiyonları', author: 'Selin Akın', icon: <PlayCircle size={14} /> },
                { id: 9, type: 'Etkileşimli Slayt', title: 'Roma İmparatorluğu Tarihi', author: 'Ahmet T.', icon: <Layers size={14} /> },
                { id: 10, type: 'Hızlı Pratik', title: 'Temel Matematik Denklemleri', author: 'Merve S.', icon: <MousePointer2 size={14} /> },
              ].map(item => (
                <div key={item.id} className="featured-carousel-card card-hover" style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer' }} {...interactiveProps} onClick={() => navigate('/explore')}>

                  {/* Browser Mockup visual (Added for V8 Quality) */}
                  <div className="browser-mockup">
                    <div className="browser-chrome">
                      <div className="browser-dot"></div>
                      <div className="browser-dot"></div>
                      <div className="browser-dot"></div>
                    </div>
                    <div className="browser-content">
                      <div style={{ textAlign: 'center', padding: '2rem' }}>
                        <div style={{ width: '40px', height: '40px', background: 'var(--bg-raised)', margin: '0 auto 1rem auto', display: 'flex', alignItems: 'center', justifyContent: 'center', outline: '1px solid var(--border)', rotate: '45deg' }}>
                          <div style={{ rotate: '-45deg', color: 'var(--fg)' }}>{item.icon}</div>
                        </div>
                        <h4 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.25rem', marginBottom: '0.5rem' }}>{item.title}</h4>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span className="tag" style={{ border: 'none', background: 'var(--fg)', color: 'var(--bg)', marginBottom: '0.5rem' }}>{item.type}</span>
                      <h3 style={{ fontSize: '1rem', fontWeight: 600, marginTop: '0.5rem', lineHeight: '1.2' }}>{item.title}</h3>
                    </div>
                    <span className="text-xs text-subtle" style={{ letterSpacing: '0.05em' }}>by {item.author.toUpperCase()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS (Nearpod Inspired) ─── */}
      <section className="section-padding" style={{ background: 'var(--bg)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', fontFamily: 'DM Serif Display, serif', marginBottom: '3rem', textAlign: 'center' }}>
            Dersa Eğitmenleri Ne Diyor?
          </h2>

          <div className="grid grid-3" style={{ gap: '2rem' }}>
            {/* Testimonial 1 */}
            <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2.5rem' }} {...interactiveProps}>
              <div style={{ color: 'var(--fg)', opacity: 0.2 }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>
              <p className="text-lg" style={{ lineHeight: '1.7', flex: 1 }}>
                "Öğrencilerin quiz skorlarının Dersa'yı benimsedikten sonra %30 arttığını gördük. Rekabet ve anlık geri bildirim bir arada olunca motivasyon tavan yapıyor."
              </p>
              <div>
                <h4 style={{ fontWeight: 700, fontFamily: 'DM Serif Display, serif', fontSize: '1.25rem' }}>Elif Karaca</h4>
                <span className="text-subtle text-sm">Matematik Öğretmeni, Okyanus Koleji</span>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2.5rem', background: 'var(--fg)', color: 'var(--bg)' }} {...interactiveProps}>
              <div style={{ opacity: 0.2 }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>
              <p className="text-lg" style={{ lineHeight: '1.7', flex: 1 }}>
                "Dersa, yoklama takibi ve eşzamanlı slayt motoruyla sınıftaki tüm oyunun kurallarını yeniden yazıyor. Tahtada anlattığım an saniyesinde tablette."
              </p>
              <div>
                <h4 style={{ fontWeight: 700, fontFamily: 'DM Serif Display, serif', fontSize: '1.25rem' }}>Dr. Selim Tekin</h4>
                <span className="text-subtle text-sm" style={{ opacity: 0.8 }}>Zümre Başkanı</span>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2.5rem' }} {...interactiveProps}>
              <div style={{ color: 'var(--fg)', opacity: 0.2 }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>
              <p className="text-lg" style={{ lineHeight: '1.7', flex: 1 }}>
                "Dürüst olmak gerekirse artık Dersa olmadan hiçbir derse girmezdim. Karmaşık menüler ve renk cümbüşü yok; sadece eğitim var."
              </p>
              <div>
                <h4 style={{ fontWeight: 700, fontFamily: 'DM Serif Display, serif', fontSize: '1.25rem' }}>Aylin Şahin</h4>
                <span className="text-subtle text-sm">Tarih Öğretmeni</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── DERSA AKADEMİ (BLOG HIGHLIGHTS) ─── */}
      <section className="section-padding" style={{ background: 'var(--bg-raised)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div style={{ maxWidth: '600px' }}>
              <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontFamily: 'DM Serif Display, serif', marginBottom: '1rem' }}>Sınıfa İlk Adım veya Uzmanlık</h2>
              <p className="text-subtle text-lg">Dersa Akademi'yi keşfedin. Türkiye'nin dört bir yanından öğretmenlerin etkili ders stüdyosu taktiklerini ve eğitim makalelerini okuyun.</p>
            </div>
            <button className="btn btn-ghost" style={{ padding: '0.75rem 2rem', border: '1px solid var(--border-strong)' }} onClick={() => navigate('/blog')} {...interactiveProps}>
              Akademi'ye Git <ArrowRight size={16} style={{ marginLeft: '0.5rem' }} />
            </button>
          </div>

          <div className="grid grid-3" style={{ gap: '2rem' }}>
            {[
              { id: 1, title: 'Eğitimde Oyunlaştırmanın Matematik ve Fendeki Pozitif Etkisi', author: 'Dersa Ekibi' },
              { id: 2, title: 'Etkili Bir İçerik Stüdyosu Tasarlamanın 7 Altın Kuralı', author: 'Selin Akın' },
              { id: 3, title: 'Liderlik Tablosunun Sınıf Dinamiğindeki Şaşırtıcı Gücü', author: 'Ahmet T.' }
            ].map(b => (
              <div key={b.id} className="card-hover" style={{ cursor: 'pointer' }} onClick={() => navigate('/blog')} {...interactiveProps}>
                {/* Decorative image block */}
                <div style={{ width: '100%', height: '180px', background: 'var(--border)', marginBottom: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'var(--fg)', opacity: 0.05 }}></div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--fg-subtle)' }}><BookOpen size={40} opacity={0.2} /></div>
                </div>
                <h4 style={{ fontSize: '1.25rem', fontFamily: 'DM Serif Display, serif', marginBottom: '0.75rem', lineHeight: '1.3' }}>{b.title}</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="text-xs text-subtle" style={{ letterSpacing: '0.05em', textTransform: 'uppercase' }}>{b.author}</span>
                  <span className="text-xs" style={{ fontWeight: 600, color: 'var(--fg)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>Oku <ArrowRight size={12} /></span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─── MEGA FOOTER ─── */}
      <footer style={{ background: 'var(--bg)', borderTop: '4px solid var(--fg)' }} {...interactiveProps}>
        <div className="section-padding" style={{ maxWidth: '1400px', margin: '0 auto', textAlign: 'center', padding: '6rem 2rem' }}>
          <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontFamily: 'DM Serif Display, serif', marginBottom: '2rem' }}>Sınıfta Odak Yaratın.</h2>
          <button className="btn btn-primary" style={{ padding: '1.25rem 4rem', fontSize: '1.2rem' }} onClick={() => navigate('/auth')}>
            Öğretmen Hesabı Aç
          </button>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', padding: '4rem 5%', background: 'var(--bg-surface)' }}>
          <div className="grid grid-4" style={{ maxWidth: '1400px', margin: '0 auto', gap: '4rem', alignItems: 'flex-start' }}>

            {/* Col 1: Brand */}
            <div>
              <img src={theme === 'dark' ? '/src/assets/whitepn.png' : '/src/assets/blackpng.png'} alt="Dersa logo" style={{ height: '32px', marginBottom: '1.5rem' }} />
              <p className="text-subtle text-sm" style={{ lineHeight: '1.6', marginBottom: '1.5rem' }}>
                Türkiye'nin en gelişmiş, modern, bulut ve senkronize sınıf içi eğitim ve slayt kütüphanesi.
              </p>
              <div style={{ display: 'flex', gap: '1rem', color: 'var(--fg)' }}>
                {/* Social links simulation */}
                <div style={{ width: '32px', height: '32px', background: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', cursor: 'pointer' }}>In</div>
                <div style={{ width: '32px', height: '32px', background: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', cursor: 'pointer' }}>X</div>
              </div>
            </div>

            {/* Col 2: Platform */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Platform</h4>
              <button onClick={() => navigate('/explore')} style={{ background: 'none', border: 'none', color: 'var(--fg-subtle)', textAlign: 'left', cursor: 'pointer', fontSize: '0.9rem' }}>Açık Kütüphane</button>
              <button onClick={() => navigate('/pricing')} style={{ background: 'none', border: 'none', color: 'var(--fg-subtle)', textAlign: 'left', cursor: 'pointer', fontSize: '0.9rem' }}>Ücretlendirme</button>
              <button onClick={() => navigate('/auth')} style={{ background: 'none', border: 'none', color: 'var(--fg-subtle)', textAlign: 'left', cursor: 'pointer', fontSize: '0.9rem' }}>Yeni Üyelik</button>
            </div>

            {/* Col 3: Kaynaklar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Kaynaklar</h4>
              <button onClick={() => navigate('/blog')} style={{ background: 'none', border: 'none', color: 'var(--fg-subtle)', textAlign: 'left', cursor: 'pointer', fontSize: '0.9rem' }}>Dersa Akademi (Blog)</button>
              <button onClick={() => navigate('/contact')} style={{ background: 'none', border: 'none', color: 'var(--fg-subtle)', textAlign: 'left', cursor: 'pointer', fontSize: '0.9rem' }}>Yardım Merkezi</button>
              <button onClick={() => alert('Sistem durumu: %100 Çalışıyor')} style={{ background: 'none', border: 'none', color: 'var(--fg-subtle)', textAlign: 'left', cursor: 'pointer', fontSize: '0.9rem' }}>Sistem Durumu</button>
            </div>

            {/* Col 4: Şirket */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Şirket</h4>
              <button onClick={() => navigate('/contact')} style={{ background: 'none', border: 'none', color: 'var(--fg-subtle)', textAlign: 'left', cursor: 'pointer', fontSize: '0.9rem' }}>İletişim</button>
              <button style={{ background: 'none', border: 'none', color: 'var(--fg-subtle)', textAlign: 'left', cursor: 'pointer', fontSize: '0.9rem' }}>Kariyer</button>
              <button style={{ background: 'none', border: 'none', color: 'var(--fg-subtle)', textAlign: 'left', cursor: 'pointer', fontSize: '0.9rem' }}>Gizlilik Politikası</button>
            </div>

          </div>

          <div style={{ maxWidth: '1400px', margin: '3rem auto 0 auto', paddingTop: '2rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <p className="text-xs text-muted">© {new Date().getFullYear()} Dersa Eğitim Ekosistemi. Tüm hakları saklıdır.</p>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <span className="text-xs text-muted" style={{ cursor: 'pointer' }}>KVKK</span>
              <span className="text-xs text-muted" style={{ cursor: 'pointer' }}>Çerez Politikası</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
