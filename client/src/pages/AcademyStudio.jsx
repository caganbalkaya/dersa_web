import React, { useState, useContext, useRef, useEffect } from 'react';
import { API_URL } from '../config';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { PlayCircle, Plus, Save, Clock, Trash2, ArrowLeft, CheckCircle, Film } from 'lucide-react';

export default function AcademyStudio() {
   const navigate = useNavigate();
   const { user } = useContext(AuthContext);

   // Editor State
   const [title, setTitle] = useState('');
   const [videoId, setVideoId] = useState('');
   const [videoUrl, setVideoUrl] = useState('');
   const [subject, setSubject] = useState('Genel');
   
   // Questions State
   const [questions, setQuestions] = useState([]);
   const [isModalOpen, setIsModalOpen] = useState(false);
   
   // Form State for new question
   const [currentTimeSec, setCurrentTimeSec] = useState(0);
   const [prompt, setPrompt] = useState('');
   const [options, setOptions] = useState(['', '', '', '']);
   const [correctIndex, setCorrectIndex] = useState(0);
   
   const [isSaving, setIsSaving] = useState(false);
   const [myContents, setMyContents] = useState([]);
   const playerRef = useRef(null);

   useEffect(() => {
      if(!user?.id) return;
      fetch(`${API_URL}/api/library`)
         .then(r => r.json())
         .then(data => {
            if(data.success && data.items) {
               setMyContents(data.items.filter(i => i.authorId === user.id));
            }
         });
   }, [user?.id]);

   const deleteContent = (id) => {
      if(!window.confirm('Bu içeriği akademiden silmek istediğinize emin misiniz?')) return;
      fetch(`${API_URL}/api/library/${id}`, {
         method: 'DELETE',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ authorId: user.id })
      })
      .then(r => r.json())
      .then(data => {
         if(data.success) {
            setMyContents(prev => prev.filter(x => x.id !== id));
         } else alert(data.error);
      });
   };

   const extractVideoId = (url) => {
      const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
      return match ? match[1] : '';
   };

   const handleUrlChange = (e) => {
      setVideoUrl(e.target.value);
      const id = extractVideoId(e.target.value);
      if(id) setVideoId(id);
   };

   // Connect to YouTube Web API to track time
   useEffect(() => {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
         if (videoId && !playerRef.current) {
            playerRef.current = new window.YT.Player('youtube-player', {
               params: { autoplay: 0, modestbranding: 1, rel: 0 },
               events: {
                  onStateChange: () => {}
               }
            });
         }
      };

      // Watch for changes and initialize if api is ready
      if (window.YT && window.YT.Player && videoId && !playerRef.current) {
         playerRef.current = new window.YT.Player('youtube-player', {
            events: {
               onStateChange: () => {}
            }
         });
      }
   }, [videoId]);

   const handleAddQuestionClick = () => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
         setCurrentTimeSec(Math.floor(playerRef.current.getCurrentTime()));
         playerRef.current.pauseVideo();
      } else {
         setCurrentTimeSec(0);
      }
      setPrompt('');
      setOptions(['', '', '', '']);
      setCorrectIndex(0);
      setIsModalOpen(true);
   };

   const saveQuestion = () => {
      if(!prompt.trim()) return alert('Soru boş olamaz.');
      if(options.some(o => !o.trim())) return alert('Bütün şıkları doldurun.');
      
      const newQuestion = {
         id: 'q_' + Date.now(),
         timestampSec: currentTimeSec,
         prompt,
         options,
         correctIndex
      };
      
      setQuestions(prev => [...prev, newQuestion].sort((a,b) => a.timestampSec - b.timestampSec));
      setIsModalOpen(false);
      if (playerRef.current && playerRef.current.playVideo) playerRef.current.playVideo();
   };

   const formatTime = (sec) => {
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      return `${m < 10 ? '0'+m : m}:${s < 10 ? '0'+s : s}`;
   };

   const publishContent = () => {
      if(!title || !videoId) return alert('Başlık ve YouTube linki zorunludur.');
      setIsSaving(true);

      const payload = {
         title,
         videoId,
         subject,
         author: user?.name,
         authorId: user?.id,
         questions
      };

      fetch(`${API_URL}/api/library`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(payload)
      })
      .then(res => res.json())
      .then(data => {
         if(data.error) alert(data.error);
         else {
            navigate('/dashboard');
         }
      })
      .catch(() => alert('Hata oluştu'))
      .finally(() => setIsSaving(false));
   };

   return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
         <button className="btn btn-ghost" onClick={() => navigate('/dashboard')} style={{ marginBottom: '2rem' }}>
            <ArrowLeft size={16} /> Panoya Dön
         </button>

         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontFamily: 'DM Serif Display', fontSize: '2.5rem' }}>İnteraktif Video Stüdyosu</h1>
            <button className="btn btn-primary" onClick={publishContent} disabled={isSaving}>
               {isSaving ? 'Kaydediliyor...' : <><Save size={18} /> Akademiye Ekle</>}
            </button>
         </div>

         <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: '3rem' }}>
            
            {/* Editor Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
               
               <div className="card" style={{ padding: '2rem' }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 600 }}>Video Bilgileri</h3>
                  <div className="field-group">
                     <label>Ders Başlığı</label>
                     <input type="text" className="field" placeholder="Örn: Hücre Zarı ve Madde Geçişleri" value={title} onChange={e=>setTitle(e.target.value)} />
                  </div>
                  <div className="field-group" style={{ marginTop: '1rem' }}>
                     <label>YouTube Linki</label>
                     <input type="text" className="field" placeholder="https://youtube.com/watch?v=..." value={videoUrl} onChange={handleUrlChange} />
                  </div>
                  <div className="field-group" style={{ marginTop: '1rem' }}>
                     <label>Konu / Kategori</label>
                     <select className="field" value={subject} onChange={e=>setSubject(e.target.value)}>
                        <option value="Genel">Genel</option>
                        <option value="Matematik">Matematik</option>
                        <option value="Fizik">Fizik</option>
                        <option value="Kimya">Kimya</option>
                        <option value="Biyoloji">Biyoloji</option>
                        <option value="Tarih">Tarih</option>
                        <option value="Edebiyat">Edebiyat</option>
                        <option value="Coğrafya">Coğrafya</option>
                        <option value="İngilizce">İngilizce</option>
                     </select>
                  </div>
               </div>

               <div className="card" style={{ padding: '2rem', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                     <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Zamanlanmış Sorular ({questions.length})</h3>
                  </div>

                  {questions.length === 0 ? (
                     <div style={{ textAlign: 'center', color: 'var(--fg-subtle)', padding: '2rem' }}>
                        <PlayCircle size={40} opacity={0.2} style={{ marginBottom: '1rem', display: 'block', margin: '0 auto 1rem' }} />
                        <p>Henüz soru eklemediniz.<br/>Videoyu izlerken "Soru Ekle"ye basarak interaktif testler oluşturun.</p>
                     </div>
                  ) : (
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {questions.map((q, i) => (
                           <div key={q.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', background: 'var(--bg-surface)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                              <div style={{ background: 'var(--fg)', color: 'var(--bg)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                 <Clock size={12} /> {formatTime(q.timestampSec)}
                              </div>
                              <div style={{ flex: 1 }}>
                                 <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{q.prompt}</div>
                                 <div style={{ fontSize: '0.8rem', color: 'var(--fg-subtle)' }}>Doğru Yanıt: {q.options[q.correctIndex]}</div>
                              </div>
                              <button className="btn btn-ghost" style={{ padding: '0.5rem', color: 'var(--fg-subtle)' }} onClick={() => setQuestions(qs => qs.filter(x => x.id !== q.id))}>
                                 <Trash2 size={16} />
                              </button>
                           </div>
                        ))}
                     </div>
                  )}
               </div>

            </div>

            {/* Video Player */}
            <div>
               <div style={{ position: 'sticky', top: '100px' }}>
                  <div style={{ background: '#000', width: '100%', aspectRatio: '16/9', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                     {videoId ? (
                        <iframe
                           id="youtube-player"
                           width="100%" height="100%" 
                           src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0&modestbranding=1`} 
                           frameBorder="0" 
                           allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                           allowFullScreen 
                        />
                     ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)', flexDirection: 'column' }}>
                           <Film size={64} style={{ marginBottom: '1rem' }} />
                           <p>Önizleme için YouTube adresi girin</p>
                        </div>
                     )}
                  </div>
                  
                  <button 
                     className="btn btn-block" 
                     style={{ marginTop: '1.5rem', padding: '1.25rem', fontSize: '1.1rem', background: 'var(--fg)', color: 'var(--bg)', border: 'none' }}
                     onClick={handleAddQuestionClick}
                     disabled={!videoId}
                  >
                     <Plus size={20} style={{ marginRight: '0.5rem' }} /> {playerRef.current ? 'Şu Anki Süreye Soru Ekle' : 'Soru Ekle (Önce Videoyu Oynatın)'}
                  </button>
               </div>
            </div>

         </div>

         {/* My Contents Section */}
         <div style={{ marginTop: '4rem', paddingTop: '3rem', borderTop: '1px solid var(--border)' }}>
            <h2 style={{ fontFamily: 'DM Serif Display', fontSize: '2rem', marginBottom: '1.5rem' }}>Benim İçeriklerim</h2>
            {myContents.length === 0 ? (
               <div style={{ padding: '3rem', background: 'var(--bg-surface)', textAlign: 'center', borderRadius: '12px', border: '1px solid var(--border)', color: 'var(--fg-subtle)' }}>
                  Henüz akademiye içerik yayınlamadınız. Yukarıdaki araçları kullanarak ilk interaktif videonuzu yükleyebilirsiniz!
               </div>
            ) : (
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                  {myContents.map(item => (
                     <div key={item.id} className="card" style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem', background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                           <span className="badge" style={{ background: 'var(--fg)', color: 'var(--bg)' }}>{item.subject}</span>
                           <button className="btn btn-ghost" style={{ padding: '0.4rem', color: '#ef4444' }} onClick={() => deleteContent(item.id)} title="İçeriği Sil">
                              <Trash2 size={18} />
                           </button>
                        </div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', lineHeight: '1.3' }}>{item.title}</h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '1rem', color: 'var(--fg-subtle)', fontSize: '0.85rem' }}>
                           <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Film size={14} /> {item.questions?.length || 0} Soru</span>
                           <span>{item.plays} İzlenme</span>
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </div>

         {/* ADD QUESTION MODAL */}
         {isModalOpen && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <div className="card animate-in" style={{ width: '100%', maxWidth: '600px', padding: '2rem' }}>
                  <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    Soru Ekleniyor <span style={{ background: 'var(--bg-raised)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '1.2rem' }}>{formatTime(currentTimeSec)}</span>
                  </h2>
                  
                  <div className="field-group" style={{ marginBottom: '2rem' }}>
                     <label>Soru Metni</label>
                     <textarea className="field" rows={2} style={{ resize: 'vertical' }} value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Öğrencinin videoyu izlerken çözeceği soru..." />
                  </div>

                  <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 600, fontSize: '0.9rem' }}>Şıklar (Doğru cevabı seçin)</label>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                     {options.map((opt, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                           <button 
                              style={{ width: 30, height: 30, borderRadius: '50%', background: correctIndex === i ? '#10b981' : 'var(--bg-surface)', border: `1px solid ${correctIndex === i ? '#10b981' : 'var(--border)'}`, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                              onClick={() => setCorrectIndex(i)}
                           >
                              {correctIndex === i && <CheckCircle size={16} />}
                           </button>
                           <input type="text" className="field" style={{ flex: 1 }} value={opt} onChange={e => {
                              const newOpts = [...options];
                              newOpts[i] = e.target.value;
                              setOptions(newOpts);
                           }} placeholder={`${String.fromCharCode(65+i)} şıkkı`} />
                        </div>
                     ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                     <button className="btn btn-ghost" onClick={() => { setIsModalOpen(false); if(playerRef.current && playerRef.current.playVideo) playerRef.current.playVideo(); }}>İptal</button>
                     <button className="btn btn-primary" onClick={saveQuestion}>Soruyu Kaydet</button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}
