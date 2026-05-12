import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar';
import { Mail, MapPin, Phone, Send } from 'lucide-react';

export default function Contact({ theme, toggleTheme }) {
  const [isHovering, setIsHovering] = useState(false);
  const navigate = useNavigate();

  const interactiveProps = {
    onMouseEnter: () => setIsHovering(true),
    onMouseLeave: () => setIsHovering(false)
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg)' }}>
      <PublicNavbar theme={theme} toggleTheme={toggleTheme} />
      
      <div style={{ padding: '2rem 5%', maxWidth: '1400px', margin: '120px auto 0 auto', flex: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
        
        <div className="grid grid-2" style={{ gap: '4rem', alignItems: 'flex-start' }}>
          {/* Left Side: Info */}
          <div className="animate-in">
            <h1 style={{ fontSize: 'clamp(3rem, 5vw, 4.5rem)', fontFamily: 'DM Serif Display, serif', marginBottom: '1.5rem', lineHeight: '1' }}>
              Bize ulaşın.
            </h1>
            <p className="text-muted text-lg" style={{ marginBottom: '3rem', maxWidth: '500px', lineHeight: '1.6' }}>
              Teknik destek, okullar için özel çözümler veya sadece merhaba demek için... Size yardımcı olmak için buradayız.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ width: '48px', height: '48px', background: 'var(--bg-surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                  <Mail size={20} />
                </div>
                <div>
                  <h4 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>E-Posta</h4>
                  <p className="text-subtle text-sm">destek@dersa.com.tr</p>
                  <p className="text-subtle text-sm">satis@dersa.com.tr</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ width: '48px', height: '48px', background: 'var(--bg-surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                  <MapPin size={20} />
                </div>
                <div>
                  <h4 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Ofis (Randevu İle)</h4>
                  <p className="text-subtle text-sm">Teknopark İstanbul, Kuluçka Merkezi</p>
                  <p className="text-subtle text-sm">Pendik, İstanbul 34906</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ width: '48px', height: '48px', background: 'var(--bg-surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                  <Phone size={20} />
                </div>
                <div>
                  <h4 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Telefon</h4>
                  <p className="text-subtle text-sm">+90 (850) 123 45 67</p>
                  <p className="text-subtle text-sm">Hafta içi: 09:00 - 18:00</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="animate-in animate-delay-2 card" style={{ padding: '3rem' }}>
            <h3 style={{ fontSize: '1.75rem', fontFamily: 'DM Serif Display, serif', marginBottom: '2rem' }}>Mesaj Gönderin</h3>
            <form onSubmit={(e) => { e.preventDefault(); alert('Mesajınız başarıyla iletildi!'); }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <div className="grid grid-2" style={{ gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', uppercase: 'true', color: 'var(--fg-subtle)', marginBottom: '0.5rem' }}>
                    Ad Soyad
                  </label>
                  <input className="field" required placeholder="Adınız Soyadınız" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', uppercase: 'true', color: 'var(--fg-subtle)', marginBottom: '0.5rem' }}>
                    Okul / Kurum
                  </label>
                  <input className="field" placeholder="İsteğe bağlı" />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', uppercase: 'true', color: 'var(--fg-subtle)', marginBottom: '0.5rem' }}>
                  E-Posta Adresi
                </label>
                <input type="email" className="field" required placeholder="ornek@okul.edu.tr" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', uppercase: 'true', color: 'var(--fg-subtle)', marginBottom: '0.5rem' }}>
                  Konu
                </label>
                <select className="field" style={{ appearance: 'none' }}>
                  <option>Genel Destek</option>
                  <option>Eğitmen Başvurusu</option>
                  <option>Kurumsal / Okul Paketleri Yükseltme</option>
                  <option>Fatura ve Ödemeler</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', uppercase: 'true', color: 'var(--fg-subtle)', marginBottom: '0.5rem' }}>
                  Mesajınız
                </label>
                <textarea className="field" rows={5} required placeholder="Mesajınızı buraya yazın..." style={{ resize: 'none' }}></textarea>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '54px', fontSize: '1.1rem' }}>
                <Send size={18} /> Gönder
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* FOOTER */}
      <footer style={{ borderTop: '4px solid var(--fg)', marginTop: '6rem' }}>
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
