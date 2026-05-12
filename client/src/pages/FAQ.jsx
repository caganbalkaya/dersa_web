import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar';
import { ChevronDown, ChevronUp, Mail } from 'lucide-react';

const FAQS = [
  {
    cat: 'Genel',
    items: [
      { q: 'Dersa nedir?', a: 'Dersa, öğretmenlerin canlı dersler yapmasını, interaktif sorular sormasını ve makale yayımlamasını sağlayan modern bir eğitim platformudur.' },
      { q: 'Ücretsiz kullanabilir miyim?', a: 'Evet. Bireysel öğretmenler için temel özellikler ücretsizdir. Kurumsal ve gelişmiş özellikler için ücretli planlarımızı inceleyebilirsiniz.' },
      { q: 'Öğrencilerin hesap açması gerekiyor mu?', a: 'Hayır. Öğrenciler 6 haneli PIN koduyla hesap açmadan derse katılabilir.' },
    ]
  },
  {
    cat: 'Öğretmenler için',
    items: [
      { q: 'Öğretmen hesabı nasıl açılır?', a: 'Kayıt sırasında size iletilen davet kodunu (invite code) girin. Demo için DERSA-2026 kodunu kullanabilirsiniz.' },
      { q: 'Canlı ders nasıl başlatılır?', a: 'Stüdyo sayfasına gidip slaytlarınızı hazırladıktan sonra "Ders Yayınını Başlat" butonuna tıklayın. Öğrenciler ekrana yansıttığınız PIN koduyla katılır.' },
      { q: 'PDF yükleyip sunum yapabilir miyim?', a: 'Evet. Stüdyo\'da "Arka Plan / PDF" butonuyla PDF yükleyebilirsiniz; her sayfa otomatik olarak bir sunum slaytına dönüşür.' },
    ]
  },
  {
    cat: 'Teknik',
    items: [
      { q: 'Hangi tarayıcılar destekleniyor?', a: 'Chrome, Firefox, Edge ve Safari\'nin güncel sürümleri. Mobil tarayıcılarda da çalışır.' },
      { q: 'Veri güvenliği nasıl sağlanıyor?', a: 'Tüm veriler şifrelenmiş bağlantı (HTTPS) üzerinden aktarılır. Şifreler bcrypt ile hash\'lenir, hiçbir zaman düz metin olarak saklanmaz.' },
      { q: 'Sorun yaşıyorum, nasıl destek alabilirim?', a: 'destek@dersa.com.tr adresine e-posta gönderebilir veya İletişim sayfamızdaki formu kullanabilirsiniz. Hafta içi 09:00–18:00 arasında yanıt verilir.' },
    ]
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
      onClick={() => setOpen(o => !o)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 0', gap: '1rem' }}>
        <span style={{ fontWeight: 600, fontSize: '1rem', lineHeight: 1.4 }}>{q}</span>
        {open ? <ChevronUp size={18} style={{ flexShrink: 0, color: 'var(--fg-subtle)' }} /> : <ChevronDown size={18} style={{ flexShrink: 0, color: 'var(--fg-subtle)' }} />}
      </div>
      {open && (
        <p style={{ margin: '0 0 1.25rem', color: 'var(--fg-subtle)', lineHeight: 1.7, fontSize: '0.95rem' }}>
          {a}
        </p>
      )}
    </div>
  );
}

export default function FAQ({ theme, toggleTheme }) {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <PublicNavbar theme={theme} toggleTheme={toggleTheme} />

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '140px 2rem 6rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '3.5rem' }}>
          <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', marginBottom: '1rem', lineHeight: 1.1 }}>Sıkça Sorulan Sorular</h1>
          <p style={{ color: 'var(--fg-subtle)', fontSize: '1.1rem', lineHeight: 1.6 }}>
            Aklınızdaki soruların cevabını burada bulamadıysanız{' '}
            <button onClick={() => navigate('/contact')} style={{ background: 'none', border: 'none', color: 'var(--fg)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline', padding: 0, fontSize: 'inherit' }}>
              bize ulaşın
            </button>.
          </p>
        </div>

        {/* FAQ Groups */}
        {FAQS.map(group => (
          <div key={group.cat} style={{ marginBottom: '3rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--fg-subtle)', marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '2px solid var(--fg)' }}>
              {group.cat}
            </div>
            {group.items.map(item => <FAQItem key={item.q} {...item} />)}
          </div>
        ))}

        {/* CTA Card */}
        <div style={{ marginTop: '4rem', padding: '2.5rem', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ width: 48, height: 48, background: 'var(--fg)', color: 'var(--bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Mail size={20} />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <h3 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.4rem', marginBottom: '0.25rem' }}>Hâlâ sorunuz var mı?</h3>
            <p style={{ margin: 0, color: 'var(--fg-subtle)', fontSize: '0.9rem' }}>destek@dersa.com.tr — Hafta içi 09:00–18:00</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/contact')}>
            İletişime Geç
          </button>
        </div>
      </div>

      <footer style={{ borderTop: '4px solid var(--fg)' }}>
        <div style={{ padding: '2.5rem 2rem', maxWidth: 1400, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <img src={theme === 'dark' ? '/whitepn.png' : '/blackpng.png'} alt="Dersa" style={{ height: 24, opacity: 0.5 }} />
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--fg-subtle)' }}>
            © {new Date().getFullYear()} Dersa Eğitim Ekosistemi.
          </p>
        </div>
      </footer>
    </div>
  );
}
