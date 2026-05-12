import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar';
import { Check, X } from 'lucide-react';

export default function Pricing({ theme, toggleTheme }) {
  const navigate = useNavigate();
  const [isHovering, setIsHovering] = useState(false);
  const [annual, setAnnual] = useState(false);

  const interactiveProps = {
    onMouseEnter: () => setIsHovering(true),
    onMouseLeave: () => setIsHovering(false)
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg)' }}>
      <PublicNavbar theme={theme} toggleTheme={toggleTheme} />
      
      <div style={{ padding: '2rem 5%', maxWidth: '1400px', margin: '140px auto 0 auto', flex: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
        
        {/* Header */}
        <div className="animate-in" style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h1 style={{ fontSize: 'clamp(3rem, 5vw, 4.5rem)', fontFamily: 'DM Serif Display, serif', marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
            Eğitime değer katan <br/> sade fiyatlandırma.
          </h1>
          <p className="text-muted text-lg" style={{ maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
            Karmaşık lisanslar yok. İhtiyacınız olan her şey, basit ve öngörülebilir fiyatlarla. Dünyanın en iyi öğrenim stüdyosu parmaklarınızın ucunda.
          </p>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '3rem' }}>
            <span style={{ fontWeight: 600, color: !annual ? 'var(--fg)' : 'var(--fg-subtle)' }}>Aylık Faturalama</span>
            <button 
              onClick={() => setAnnual(!annual)}
              style={{ width: '56px', height: '32px', borderRadius: '16px', background: 'var(--border)', position: 'relative', border: 'none', cursor: 'pointer', transition: 'all 0.3s' }}
            >
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--fg)', position: 'absolute', top: '4px', left: annual ? '28px' : '4px', transition: 'all 0.3s' }} />
            </button>
            <span style={{ fontWeight: 600, color: annual ? 'var(--fg)' : 'var(--fg-subtle)' }}>Yıllık (%20 İndirim)</span>
          </div>
        </div>

        {/* PRICING CARDS */}
        <div className="animate-in animate-delay-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '6rem' }}>
          
          {/* FREE PLAN */}
          <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', border: '1px solid var(--border)' }}>
            <div style={{ padding: '1rem 0' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Başlangıç</h3>
              <p className="text-subtle text-sm mt-2">Dersa'yı keşfetmek isteyen bireysel öğretmenler için.</p>
            </div>
            <div style={{ padding: '2rem 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: '3.5rem', fontFamily: 'DM Serif Display, serif', lineHeight: 1 }}>₺0</span>
              <span className="text-subtle ml-2">/ ömür boyu</span>
            </div>
            <div style={{ padding: '2rem 0', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}><Check size={18} /> <span className="text-sm">5 Sınıf ve Slayt Seti</span></div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}><Check size={18} /> <span className="text-sm">Maksimum 30 Öğrenci Kapasitesi</span></div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}><Check size={18} /> <span className="text-sm">Temel Soru Tipleri (Çoktan Seçmeli)</span></div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', color: 'var(--fg-muted)' }}><X size={18} /> <span className="text-sm">Canlı Öğrenci Detaylı Analizi Yok</span></div>
            </div>
            <button className="btn btn-ghost" style={{ width: '100%', height: '48px', marginTop: 'auto', border: '1px solid var(--border-strong)' }} onClick={() => navigate('/auth')}>Hesap Aç</button>
          </div>

          {/* PRO PLAN */}
          <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', border: '2px solid var(--fg)', position: 'relative', boxShadow: 'var(--shadow-md)' }}>
            <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: 'var(--fg)', color: 'var(--bg)', padding: '0.25rem 1rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em' }}>
              EN POPÜLER
            </div>
            <div style={{ padding: '1rem 0' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Öğretmen Pro</h3>
              <p className="text-subtle text-sm mt-2">Sınırsız güç ve profesyonel analitik araçlarına ihtiyaç duyanlar için.</p>
            </div>
            <div style={{ padding: '2rem 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: '3.5rem', fontFamily: 'DM Serif Display, serif', lineHeight: 1 }}>₺{annual ? '149' : '189'}</span>
              <span className="text-subtle ml-2">/ ay</span>
            </div>
            <div style={{ padding: '2rem 0', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}><Check size={18} /> <span className="text-sm">Sınırsız Sınıf ve Stüdyo Kullanımı</span></div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}><Check size={18} /> <span className="text-sm">Maksimum 150 Öğrenci (Oturum Başına)</span></div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}><Check size={18} /> <span className="text-sm">Tüm Soru Tipleri ve Oyun Motorları</span></div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}><Check size={18} /> <span className="text-sm">Detaylı Yapay Zeka Sınıf Analizi</span></div>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', height: '48px', marginTop: 'auto' }} onClick={() => navigate('/auth')}>Pro'ya Geç</button>
          </div>

          {/* SCHOOL PLAN */}
          <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', border: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
            <div style={{ padding: '1rem 0' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Kurum & Okul</h3>
              <p className="text-subtle text-sm mt-2">Tüm okulu tek bir dijital kampüs sisteminde birleştirin.</p>
            </div>
            <div style={{ padding: '2rem 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: '3.5rem', fontFamily: 'DM Serif Display, serif', lineHeight: 1 }}>Özel</span>
            </div>
            <div style={{ padding: '2rem 0', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}><Check size={18} /> <span className="text-sm">Özel Davet Kodu Üretimi (Sınırsız Öğretmen)</span></div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}><Check size={18} /> <span className="text-sm">LMS (Moodle vb.) LTI Entegrasyonu</span></div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}><Check size={18} /> <span className="text-sm">Beyaz Etiket (White Label) Kurum Logosu</span></div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}><Check size={18} /> <span className="text-sm">24/7 Teknik Destek Yöneticisi</span></div>
            </div>
            <button className="btn btn-ghost" style={{ width: '100%', height: '48px', marginTop: 'auto', background: 'var(--bg)', border: '1px solid var(--border-strong)' }} onClick={() => navigate('/auth')}>Satış İle Görüş</button>
          </div>

        </div>

        {/* FAQ Section Minimal */}
        <div className="animate-in animate-delay-3" style={{ borderTop: '1px solid var(--border)', paddingTop: '4rem', paddingBottom: '6rem', maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontFamily: 'DM Serif Display, serif', textAlign: 'center', marginBottom: '3rem' }}>Sık Sorulan Sorular</h2>
          
          <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Öğrenciler ücret ödüyor mu?</h4>
            <p className="text-subtle text-sm" style={{ lineHeight: '1.6' }}>Hayır. Öğrenci hesapları, misafir katılımları ve puan/skor tutma özellikleri her zaman tamamen ücretsizdir. Abonelik sadece öğretmen ve kurumlar içindir.</p>
          </div>
          <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>İstediğim zaman iptal edebilir miyim?</h4>
            <p className="text-subtle text-sm" style={{ lineHeight: '1.6' }}>Evet, hiçbir taahhüt bulunmuyor. İptal ettiğinizde fatura döneminizin sonuna kadar Pro özelliklerini kullanmaya devam edersiniz.</p>
          </div>
          <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Kurum planı için kaç öğretmene sahip olmalıyız?</h4>
            <p className="text-subtle text-sm" style={{ lineHeight: '1.6' }}>Minimum 15 öğretmen için kurum paketinden faydalanabilirsiniz. Okul yöneticisi için atanmış yönetici profili ile tüm raporlara ulaşabilirsiniz.</p>
          </div>
        </div>
      </div>
    
      {/* ─── FOOTER ─── */}
      <footer style={{ borderTop: '4px solid var(--fg)' }} {...interactiveProps}>
        <div style={{ padding: '2.5rem 2rem' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
            <img src={theme === 'dark' ? '/whitepn.png' : '/blackpng.png'} alt="Dersa logo" style={{ height: '24px', opacity: 0.5 }} />
            <p className="text-xs text-muted">© {new Date().getFullYear()} Dersa Eğitim Ekosistemi. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
