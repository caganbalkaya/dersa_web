import React, { useContext, useState, useRef } from 'react';
import { API_URL } from '../config';
import { AuthContext } from '../context/AuthContext';
import { Save, User, Shield, Key } from 'lucide-react';

export default function Settings() {
  const { user, token, login } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('profile'); // profile | privacy | security
  
  const fileInputRef = useRef(null);
  const [loadingPic, setLoadingPic] = useState(false);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoadingPic(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64Avatar = ev.target.result;

      try {
        const res = await fetch(`${API_URL}/api/user/profile`, {
           method: 'PUT',
           headers: {
             'Content-Type': 'application/json',
             'Authorization': `Bearer ${token}`
           },
           body: JSON.stringify({ avatar: base64Avatar })
        });
        
        const data = await res.json();
        if (data.success) {
           login(data.user, token); // Update context and local storage immediately
           alert("Profil fotoğrafı güncellendi.");
        } else {
           alert(data.error || 'Yükleme başarısız oldu.');
        }
      } catch (err) {
        console.error(err);
        alert('Sunucu hatası, fotoğraf yüklenemedi.');
      } finally {
        setLoadingPic(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      <div style={{ paddingBottom: '1.5rem', marginBottom: '2.5rem', borderBottom: '1px solid var(--border)' }}>
        <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '2.25rem', marginBottom: '0.2rem' }}>Öğretmen Ayarları</h1>
        <p className="text-subtle">Profilinizi, izinlerinizi ve veri kullanımlarını yönetin.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '3rem' }}>
        
        {/* Settings Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button 
             onClick={() => setActiveTab('profile')}
             className="menu-item"
             style={{ background: activeTab === 'profile' ? 'var(--bg-raised)' : 'transparent', fontWeight: activeTab === 'profile' ? 600 : 500 }}
          >
             <User size={18} /> Profil Bilgileri
          </button>
          <button 
             onClick={() => setActiveTab('privacy')}
             className="menu-item"
             style={{ background: activeTab === 'privacy' ? 'var(--bg-raised)' : 'transparent', fontWeight: activeTab === 'privacy' ? 600 : 500 }}
          >
             <Shield size={18} /> Gizlilik ve KVKK
          </button>
          <button 
             onClick={() => setActiveTab('security')}
             className="menu-item"
             style={{ background: activeTab === 'security' ? 'var(--bg-raised)' : 'transparent', fontWeight: activeTab === 'security' ? 600 : 500 }}
          >
             <Key size={18} /> Şifre & Güvenlik
          </button>
        </div>

        {/* Settings Content */}
        <div style={{ background: 'var(--bg-surface)', padding: '2rem', border: '1px solid var(--border)', borderRadius: '8px' }}>
          
          {activeTab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--fg)', color: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 700, overflow: 'hidden' }}>
                   {user?.avatar ? (
                     <img src={user.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Avatar" />
                   ) : (
                     user?.name?.[0]?.toUpperCase() || 'Ö'
                   )}
                </div>
                <div>
                   <input type="file" accept="image/*" style={{ display: 'none' }} ref={fileInputRef} onChange={handlePhotoUpload} />
                   <button className="btn btn-ghost btn-sm" style={{ border: '1px solid var(--border)' }} onClick={() => fileInputRef.current.click()} disabled={loadingPic}>
                     {loadingPic ? 'Yükleniyor...' : 'Fotoğraf Yükle'}
                   </button>
                   <p className="text-xs text-subtle mt-2">Önerilen boyut 256x256px. Maksimum 2MB.</p>
                </div>
              </div>

              <div>
                <label className="text-subtle text-sm" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Ad Soyad</label>
                <input className="field" type="text" defaultValue={user?.name} />
              </div>

              <div>
                <label className="text-subtle text-sm" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>E-Posta Adresi</label>
                <input className="field" type="email" defaultValue={user?.email} disabled style={{ opacity: 0.7 }} />
                <p className="text-xs text-subtle mt-2">E-posta adresinizi değiştirmek için destek ekibiyle iletişime geçin.</p>
              </div>

              <div>
                <label className="text-subtle text-sm" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Hakkımda (Öğrenci arayüzünde görünür)</label>
                <textarea className="field" rows={4} placeholder="Kısaca kendinizden ve uzmanlık alanlarınızdan bahsedin..." />
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>Kişisel Verilerin Korunması (KVKK)</h3>
                <p className="text-sm text-subtle mb-4" style={{ lineHeight: 1.6 }}>Dersa, eğitim oluşturma süreçlerinizde sağladığınız verileri platformu geliştirmek amacıyla işler. Öğrencilerinizin anonim katılım verileri güvenle saklanmaktadır.</p>
                
                <label style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', cursor: 'pointer', padding: '1rem', border: '1px solid var(--border)', background: 'var(--bg)' }}>
                  <input type="checkbox" defaultChecked style={{ marginTop: '0.3rem' }} />
                  <div>
                    <strong style={{ display: 'block', marginBottom: '0.2rem', fontSize: '0.9rem' }}>Analitik ve İyileştirme Verileri</strong>
                    <span className="text-xs text-subtle">Kullanım alışkanlıklarımı anonim olarak toplayıp Dersa'nın gelişmesine yardımcı olun.</span>
                  </div>
                </label>

                <label style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', cursor: 'pointer', padding: '1rem', border: '1px solid var(--border)', background: 'var(--bg)', borderTop: 'none' }}>
                  <input type="checkbox" defaultChecked style={{ marginTop: '0.3rem' }} />
                  <div>
                    <strong style={{ display: 'block', marginBottom: '0.2rem', fontSize: '0.9rem' }}>Öğrenci Skoru Paylaşımı</strong>
                    <span className="text-xs text-subtle">Quiz sonuçlarını ders bitiminde global tabloda anonim isimlerle yayınla.</span>
                  </div>
                </label>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                <button className="btn btn-ghost text-sm" style={{ color: 'var(--accent)' }}>Verilerimi İndir (.json)</button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label className="text-subtle text-sm" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Mevcut Şifre</label>
                <input className="field" type="password" />
              </div>
              <div>
                <label className="text-subtle text-sm" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Yeni Şifre</label>
                <input className="field" type="password" />
              </div>
              <div>
                <label className="text-subtle text-sm" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Yeni Şifre (Yeniden)</label>
                <input className="field" type="password" />
              </div>
            </div>
          )}

          <div style={{ marginTop: '2.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
             <button className="btn btn-primary" onClick={() => alert('Değişiklikler başarıyla kaydedildi.')}>
               <Save size={16} /> Kaydet
             </button>
          </div>

        </div>

      </div>
    </div>
  );
}
