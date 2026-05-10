import React, { useState, useContext } from 'react';
import { API_URL } from '../config';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ArrowLeft, UserPlus, LogIn, Disc as GraduationCap, User } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

export default function Auth() {
  const [activeTab, setActiveTab] = useState('STUDENT'); // 'STUDENT' or 'TEACHER'
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [teacherCode, setTeacherCode] = useState('');
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setErr('');
    try {
      const resp = await fetch(`${API_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential, role: 'STUDENT' })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'İşlem başarısız');
      
      login(data.user, data.token);
      navigate('/dashboard'); // student dashboard later, for now redirect standard
    } catch (err) {
      setErr(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setErr('Google ile giriş sırasında bir hata oluştu. Popuplara izin verdiğinizden emin olun.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr('');
    
    const ep = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin 
      ? { email, password }
      : { name, email, password, role: activeTab, teacherCode: activeTab === 'TEACHER' ? teacherCode : undefined };

    try {
      const resp = await fetch(`${API_URL}${ep}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await resp.json();
      
      if (!resp.ok) {
        throw new Error(data.error || 'İşlem başarısız');
      }

      login(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      setErr(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100%', padding: '2rem' }}>
      
      <div style={{ width: '100%', maxWidth: '440px', display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '4rem' }}>
        <button className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start' }} onClick={() => navigate('/')}>
          <ArrowLeft size={16} /> Geri Dön
        </button>

        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
            <button 
              onClick={() => { setActiveTab('STUDENT'); setIsLogin(true); setErr(''); }}
              style={{ flex: 1, padding: '1.25rem', display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center', border: 'none', background: activeTab === 'STUDENT' ? 'var(--bg)' : 'transparent', fontWeight: activeTab === 'STUDENT' ? 700 : 500, color: activeTab === 'STUDENT' ? 'var(--fg)' : 'var(--fg-subtle)', borderBottom: activeTab === 'STUDENT' ? '2px solid var(--fg)' : '2px solid transparent', cursor: 'pointer' }}
            >
              <User size={16} /> Öğrenci
            </button>
            <button 
              onClick={() => { setActiveTab('TEACHER'); setIsLogin(true); setErr(''); }}
              style={{ flex: 1, padding: '1.25rem', display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center', border: 'none', background: activeTab === 'TEACHER' ? 'var(--bg)' : 'transparent', fontWeight: activeTab === 'TEACHER' ? 700 : 500, color: activeTab === 'TEACHER' ? 'var(--fg)' : 'var(--fg-subtle)', borderBottom: activeTab === 'TEACHER' ? '2px solid var(--fg)' : '2px solid transparent', cursor: 'pointer' }}
            >
              <GraduationCap size={16} /> Öğretmen
            </button>
          </div>

          <div style={{ padding: '2.5rem' }}>
            <h1 style={{ marginBottom: '0.5rem', textAlign: 'center', fontSize: '2rem', fontFamily: 'DM Serif Display, serif' }}>
              {activeTab === 'STUDENT' ? 'Öğrenci Portalı' : (isLogin ? 'Stüdyoya Giriş' : 'Öğretmen Başvurusu')}
            </h1>
            <p className="text-muted text-sm" style={{ textAlign: 'center', marginBottom: '2rem' }}>
              {activeTab === 'STUDENT' ? 'Hesabınızla giriş yaparak tüm puanları ve kütüphaneyi kaydedin.' : 'Sadece yetkili öğretmenler kendi sınıflarını oluşturabilir.'}
            </p>
            
            {err && (
              <div style={{ padding: '1rem', background: 'var(--bg-raised)', color: 'var(--fg)', marginBottom: '1.5rem', borderLeft: '4px solid #ef5350', fontSize: '0.875rem', fontWeight: 600 }}>
                {err}
              </div>
            )}

            {activeTab === 'STUDENT' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
                <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                  <GoogleLogin 
                    onSuccess={handleGoogleSuccess} 
                    onError={handleGoogleError} 
                    theme="outline" 
                    text="continue_with"
                    shape="rectangular"
                  />
                </div>
                
                <div style={{ width: '100%', textAlign: 'center', position: 'relative', margin: '0.5rem 0' }}>
                  <hr style={{ borderColor: 'var(--border)' }} />
                  <span style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: 'var(--bg)', padding: '0 0.5rem', color: 'var(--fg-subtle)', fontSize: '0.75rem', fontWeight: 600 }}>VEYA E-POSTA</span>
                </div>
                
                <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {!isLogin && (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', uppercase: 'true', color: 'var(--fg-subtle)', marginBottom: '0.4rem' }}>
                        Öğrenci Ad Soyad
                      </label>
                      <input 
                        className="field" 
                        placeholder="Örn: Ayşe D." 
                        value={name} 
                        onChange={e=>setName(e.target.value)} 
                        required 
                      />
                    </div>
                  )}
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', uppercase: 'true', color: 'var(--fg-subtle)', marginBottom: '0.4rem' }}>
                      E-Posta Adresi
                    </label>
                    <input 
                      className="field" 
                      type="email" 
                      placeholder="ornek@ogrenci.com" 
                      value={email} 
                      onChange={e=>setEmail(e.target.value)} 
                      required 
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', uppercase: 'true', color: 'var(--fg-subtle)', marginBottom: '0.4rem' }}>
                      Şifre
                    </label>
                    <input 
                      className="field" 
                      type="password" 
                      placeholder="••••••••" 
                      value={password} 
                      onChange={e=>setPassword(e.target.value)} 
                      required 
                    />
                  </div>

                  <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '0.5rem', height: '44px' }} disabled={loading}>
                    {loading ? 'Yükleniyor...' : (isLogin ? <><LogIn size={15}/> Giriş Yap</> : <><UserPlus size={15}/> Öğrenci Kaydı Aç</>)}
                  </button>

                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
                    <p className="text-sm text-subtle" style={{ margin: 0 }}>
                      {isLogin ? "Kayıt olmadınız mı?" : "Zaten hesabınız var mı?"}{" "}
                      <button 
                        type="button" 
                        onClick={() => { setIsLogin(!isLogin); setErr(''); }} 
                        style={{ background: 'transparent', border: 'none', color: 'var(--fg)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        {isLogin ? 'Ücretsiz Kayıt Ol' : 'Giriş Yap'}
                      </button>
                    </p>
                  </div>
                </form>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {!isLogin && (
                  <>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', uppercase: 'true', color: 'var(--fg-subtle)', marginBottom: '0.4rem' }}>
                        Ad Soyad
                      </label>
                      <input 
                        className="field" 
                        placeholder="Örn: Ahmet Yılmaz" 
                        value={name} 
                        onChange={e=>setName(e.target.value)} 
                        required 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', uppercase: 'true', color: 'var(--fg-subtle)', marginBottom: '0.4rem' }}>
                        Öğretmen Davet Kodu
                      </label>
                      <input 
                        className="field" 
                        placeholder="Okulun verdiği 10 haneli kod" 
                        value={teacherCode} 
                        onChange={e=>setTeacherCode(e.target.value)} 
                        required 
                        style={{ borderBottom: '2px solid var(--fg)' }}
                      />
                      <span className="text-xs text-muted mt-1 inline-block">Davet kodunuz yoksa yöneticiye başvurun. Test Kodu: DERSA-2026</span>
                    </div>
                  </>
                )}
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', uppercase: 'true', color: 'var(--fg-subtle)', marginBottom: '0.4rem' }}>
                    E-Posta Adresi
                  </label>
                  <input 
                    className="field" 
                    type="email" 
                    placeholder="ornek@okul.edu.tr" 
                    value={email} 
                    onChange={e=>setEmail(e.target.value)} 
                    required 
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', uppercase: 'true', color: 'var(--fg-subtle)', marginBottom: '0.4rem' }}>
                    Şifre
                  </label>
                  <input 
                    className="field" 
                    type="password" 
                    placeholder="••••••••" 
                    value={password} 
                    onChange={e=>setPassword(e.target.value)} 
                    required 
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '1rem', height: '44px' }} disabled={loading}>
                  {loading ? 'Yükleniyor...' : (isLogin ? <><LogIn size={15}/> Stüdyoya Giriş</> : <><UserPlus size={15}/> Başvuruyu Tamamla</>)}
                </button>

                <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
                  <p className="text-sm text-subtle" style={{ margin: 0 }}>
                    {isLogin ? "Öğretmen hesabınız yok mu?" : "Zaten hesabınız var mı?"}{" "}
                    <button 
                      type="button" 
                      onClick={() => { setIsLogin(!isLogin); setErr(''); }} 
                      style={{ background: 'transparent', border: 'none', color: 'var(--fg)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      {isLogin ? 'Davet Kodu İle Kayıt Ol' : 'Giriş Yap'}
                    </button>
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
