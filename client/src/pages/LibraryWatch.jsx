import React, { useState, useEffect, useContext, useRef } from 'react';
import { API_URL } from '../config';
import { useParams, useNavigate } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar';
import { ArrowLeft, PlayCircle, Star, MessageSquare, CheckCircle, Shield, Award, Crown, Diamond } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export default function LibraryWatch({ theme, toggleTheme }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Gamification states
  const [progress, setProgress] = useState(0);
  const [watchRewarded, setWatchRewarded] = useState(false);
  
  // User stats
  const [points, setPoints] = useState(0);
  const [rank, setRank] = useState('Bronze');

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  // Strict Focus state
  const [isFocused, setIsFocused] = useState(true);

  // EdPuzzle Logic
  const playerRef = useRef(null);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [answeredQuestions, setAnsweredQuestions] = useState({});
  const [selectedAns, setSelectedAns] = useState(null);

  // Focus tracking (no blur event to prevent iframe clicking issues)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) setIsFocused(false);
      else setIsFocused(true);
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // Fetch initial data
  useEffect(() => {
    fetch(`${API_URL}/api/library/${id}`)
      .then(r => r.json())
      .then(data => {
        if(data.success) {
          // ensure questions are sorted by timestamp
          if(data.item.questions) {
             data.item.questions.sort((a,b) => a.timestampSec - b.timestampSec);
          }
          setItem(data.item);
        }
        setLoading(false);
      });

    fetch(`${API_URL}/api/library/${id}/comments`)
      .then(r => r.json())
      .then(data => { if(data.success) setComments(data.comments); });

    fetchUserRank();
  }, [id, user?.id]);

  // Handle YouTube Iframe API
  useEffect(() => {
    if (!item) return;

    window.onYouTubeIframeAPIReady = () => {
      if (!playerRef.current) {
        playerRef.current = new window.YT.Player('youtube-player', {
          events: {
            onStateChange: (event) => {
               if(event.data === window.YT.PlayerState.PLAYING && !isFocused) {
                  playerRef.current.pauseVideo();
               }
            }
          }
        });
      }
    };

    if (window.YT && window.YT.Player && !playerRef.current) {
      playerRef.current = new window.YT.Player('youtube-player', {
         events: {
            onStateChange: (event) => {
               if(event.data === window.YT.PlayerState.PLAYING && (!isFocused || activeQuestion)) {
                  playerRef.current.pauseVideo();
               }
            }
         }
      });
    }

    // Polling interval to check time for questions
    const timer = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime && playerRef.current.getPlayerState() === 1) { // 1 is playing
        const currentSec = Math.floor(playerRef.current.getCurrentTime());
        const totalDuration = playerRef.current.getDuration() || 1;
        
        // Progress logic based on actual playback
        setProgress(Math.floor((currentSec / totalDuration) * 100));

        if (!watchRewarded && currentSec >= totalDuration - 5) {
           setWatchRewarded(true);
           rewardPoints(20);
        }

        // Active Question Trigger
        if(item.questions && item.questions.length > 0) {
           const nextQuestion = item.questions.find(q => currentSec >= q.timestampSec && !answeredQuestions[q.id || q.timestampSec]);
           if (nextQuestion && !activeQuestion) {
              playerRef.current.pauseVideo();
              setActiveQuestion(nextQuestion);
              setSelectedAns(null);
           }
        }
      }
    }, 500);

    return () => clearInterval(timer);
  }, [item, isFocused, activeQuestion, answeredQuestions]);

  const fetchUserRank = () => {
    if(user?.id) {
       fetch(`${API_URL}/api/user/${user.id}/rank`)
         .then(r => r.json())
         .then(data => {
           if(data.success) {
             setPoints(data.points);
             setRank(data.rank);
           }
         });
    }
  };

  const rewardPoints = (amount) => {
    if(!user?.id) return;
    fetch(`${API_URL}/api/user/reward`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, points: amount })
    })
    .then(r => r.json())
    .then(data => {
      if(data.success) fetchUserRank();
    });
  };

  const handleQuizAnswer = (idx) => {
    if(selectedAns !== null) return;
    setSelectedAns(idx);
    
    // Check if correct
    if(idx === activeQuestion.ans) {
      rewardPoints(50); // +50 points for correct answer
    }
    
    // Wait briefly then close modal
    setTimeout(() => {
       setAnsweredQuestions(prev => ({...prev, [activeQuestion.id || activeQuestion.timestampSec]: true}));
       setActiveQuestion(null);
       if(playerRef.current && playerRef.current.playVideo) playerRef.current.playVideo();
    }, 2000);
  };

  const postComment = (e) => {
    e.preventDefault();
    if(!newComment.trim()) return;

    const body = {
      content: newComment,
      authorName: user ? user.name : 'Ziyaretçi',
      authorId: user ? user.id : null
    };

    fetch(`${API_URL}/api/library/${id}/comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    .then(r => r.json())
    .then(data => {
      if(data.success) {
        setComments([{...data.comment, createdAt: new Date().toISOString()}, ...comments]);
        setNewComment('');
      }
    });
  };

  const getRankConfig = (r) => {
    switch(r) {
      case 'Bronze': return { label: 'Bronz', icon: '/src/assets/bronze.png', max: 300, color: '#b45309', bg: '#fef3c7' };
      case 'Silver': return { label: 'Gümüş', icon: '/src/assets/silver.png', max: 600, color: '#64748b', bg: '#f1f5f9' };
      case 'Gold': return { label: 'Altın', icon: '/src/assets/gold.png', max: 1000, color: '#d97706', bg: '#fef3c7' };
      case 'Platinum': return { label: 'Platin', icon: '/src/assets/platinum.png', max: 1500, color: '#0ea5e9', bg: '#e0f2fe' };
      case 'Diamond': return { label: 'Elmas', icon: '/src/assets/diamond.png', max: 2500, color: '#6366f1', bg: '#e0e7ff' };
      case 'Master': return { label: 'Usta', icon: '/src/assets/master.png', max: 5000, color: '#be185d', bg: '#fce7f3' };
      default: return { label: 'Bronz', icon: '/src/assets/bronze.png', max: 300, color: '#b45309', bg: '#fef3c7' };
    }
  };

  if(loading) return <div style={{ paddingTop: 200, textAlign: 'center' }}>İçerik yükleniyor...</div>;
  if(!item) return <div style={{ paddingTop: 200, textAlign: 'center' }}>İçerik bulunamadı.</div>;

  const rankConf = getRankConfig(rank);
  const nextProgress = Math.min((points / rankConf.max) * 100, 100);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg)', minHeight: '100vh', paddingBottom: '4rem' }}>
      <PublicNavbar theme={theme} toggleTheme={toggleTheme} />
      
      <div style={{ padding: '0 5%', maxWidth: '1600px', margin: '70px auto 0 auto', width: '100%' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/explore')} style={{ margin: '1.5rem 0', marginLeft: '-0.5rem' }}>
          <ArrowLeft size={16} /> Akademiye Dön
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 400px', gap: '3rem', alignItems: 'start' }} className="responsive-grid-watch">
          
          {/* LEFT SIDE: VIDEO & DETAILS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* VIDEO PLAYER CONTAINER */}
            <div style={{ position: 'relative', background: '#000', borderRadius: 16, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', aspectRatio: '16/9' }}>
              <iframe
                id="youtube-player"
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${item.videoId}?enablejsapi=1&autoplay=1&rel=0&modestbranding=1`}
                title={item.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              
              {/* Focus Protection Overlay */}
              {!isFocused && !watchRewarded && (
                 <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', zIndex: 10, backdropFilter: 'blur(8px)', animation: 'fadeIn 0.2s ease', padding: '2rem', textAlign: 'center' }}>
                    <Shield size={48} color="#ef4444" style={{ marginBottom: '1rem' }} />
                    <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '2rem', marginBottom: '0.5rem' }}>İzleme Duraklatıldı</h2>
                    <p style={{ fontSize: '1.1rem', color: '#cbd5e1', maxWidth: 400 }}>Sekmeyi veya tarayıcıyı terk ettiğiniz için oynatma durduruldu. Puan kazanmak için videoyu bu sekmede izlemelisiniz.</p>
                 </div>
              )}

              {/* ACTIVE QUESTION OVERLAY */}
              {activeQuestion && (
                 <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', zIndex: 20, animation: 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)', padding: '2rem' }}>
                    <div className="card" style={{ background: 'var(--bg)', color: 'var(--fg)', padding: '3rem', width: '100%', maxWidth: '700px', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', border: '1px solid var(--border)' }}>
                       <h3 style={{ fontSize: '1.25rem', color: 'var(--fg-subtle)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>İnteraktif Soru</h3>
                       <p style={{ fontSize: '1.8rem', fontWeight: 600, fontFamily: 'DM Serif Display, serif', marginBottom: '3rem' }}>{activeQuestion.q}</p>
                       
                       <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                         {activeQuestion.opts.map((opt, i) => {
                            let btnClass = "btn btn-ghost btn-block";
                            let btnStyle = { padding: '1.25rem', fontSize: '1.2rem', justifyContent: 'flex-start', border: '1px solid var(--border)', background: 'var(--bg-surface)' };
                            
                            if (selectedAns !== null) {
                               if (i === activeQuestion.ans) {
                                  btnStyle.background = 'rgba(16, 185, 129, 0.15)';
                                  btnStyle.borderColor = '#10b981';
                                  btnStyle.color = '#10b981';
                               } else if (i === selectedAns) {
                                  btnStyle.background = 'rgba(239, 68, 68, 0.15)';
                                  btnStyle.borderColor = '#ef4444';
                                  btnStyle.color = '#ef4444';
                               }
                            } else {
                               btnStyle.cursor = 'pointer';
                            }

                            return (
                               <button key={i} className={btnClass} style={btnStyle} onClick={() => handleQuizAnswer(i)} disabled={selectedAns !== null}>
                                  <span style={{ fontWeight: 700, marginRight: '1rem', opacity: 0.5 }}>{String.fromCharCode(65+i)}</span> {opt}
                               </button>
                            );
                         })}
                       </div>
                       
                       {selectedAns !== null && (
                         <div style={{ marginTop: '2rem', fontSize: '1.1rem', fontWeight: 600, color: selectedAns === activeQuestion.ans ? '#10b981' : '#ef4444', animation: 'slideUp 0.3s ease' }}>
                           {selectedAns === activeQuestion.ans ? '🎉 Doğru! Video devam ediyor...' : '❌ Yanlış. Video devam ediyor...'}
                         </div>
                       )}
                    </div>
                 </div>
              )}
            </div>

            {/* Title Block & Author */}
            <div>
              <span className="badge" style={{ background: 'var(--fg)', color: 'var(--bg)', marginBottom: '1rem', display: 'inline-block' }}>{item.subject}</span>
              <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '2.5rem', marginBottom: '1rem', lineHeight: '1.2' }}>{item.title}</h1>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '2rem', borderBottom: '1px solid var(--border)' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--fg)', color: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700 }}>
                       {item.author.charAt(0)}
                    </div>
                    <div>
                       <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{item.author}</div>
                       <div style={{ color: 'var(--fg-subtle)', fontSize: '0.9rem' }}>İçerik Üreticisi</div>
                    </div>
                 </div>
                 
                 <div style={{ display: 'flex', gap: '2rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                       <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>{item.plays}</span>
                       <span style={{ color: 'var(--fg-subtle)', fontSize: '0.85rem' }}>Görüntülenme</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                       <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>{item.questions ? item.questions.length : 0}</span>
                       <span style={{ color: 'var(--fg-subtle)', fontSize: '0.85rem' }}>İnteraktif Soru</span>
                    </div>
                 </div>
              </div>
            </div>

            {/* COMMENTS SECTION */}
            <div style={{ marginTop: '2rem' }}>
               <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <MessageSquare size={24} /> Tartışma ({comments.length})
               </h3>
               
               <form onSubmit={postComment} style={{ marginBottom: '3rem' }}>
                 <textarea 
                   className="field" 
                   rows={3} 
                   placeholder="Ders hakkında bir şeyler yazın..."
                   value={newComment}
                   onChange={e=>setNewComment(e.target.value)}
                   style={{ resize: 'vertical', marginBottom: '1rem', background: 'var(--bg-surface)' }}
                 />
                 <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                   <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>Yorum Gönder</button>
                 </div>
               </form>

               <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                 {comments.length === 0 ? (
                   <p style={{ color: 'var(--fg-subtle)', textAlign: 'center', padding: '3rem', background: 'var(--bg-surface)', borderRadius: '12px' }}>Henüz yorum yapılmamış. İlk yorumu siz yapın!</p>
                 ) : comments.map(c => (
                   <div key={c.id} style={{ display: 'flex', gap: '1.25rem' }}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--bg-surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 700 }}>
                        {c.authorName.charAt(0)}
                      </div>
                      <div style={{ flex: 1 }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                            <strong style={{ fontSize: '1rem' }}>{c.authorName}</strong>
                            <span style={{ fontSize: '0.85rem', color: 'var(--fg-subtle)' }}>
                              {new Date(c.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                         </div>
                         <p style={{ margin: 0, fontSize: '1rem', lineHeight: 1.6, color: 'var(--fg)' }}>{c.content}</p>
                      </div>
                   </div>
                 ))}
               </div>
            </div>

          </div>

          {/* RIGHT SIDE: STATS & PROGRESS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'sticky', top: '100px' }}>
            
            {/* Rank Widget */}
            <div className="card" style={{ padding: '2rem', border: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
              <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--fg-subtle)', marginBottom: '1.5rem', fontWeight: 700 }}>Öğrenci Profili</h3>
              
              {!user ? (
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                  <Crown size={32} style={{ color: 'var(--fg-subtle)', margin: '0 auto 1rem auto' }}/>
                  <p style={{ fontSize: '0.9rem', color: 'var(--fg-subtle)', marginBottom: '1.5rem' }}>Puan toplamak için giriş yapmalısın.</p>
                  <button className="btn btn-primary btn-block" onClick={() => navigate('/auth')}>Hesabına Giriş Yap</button>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ width: 70, height: 70, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src={rankConf.icon} alt={rankConf.label} style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{user.name}</div>
                      <div style={{ fontSize: '0.9rem', color: rankConf.color, fontWeight: 700 }}>{rankConf.label} • {points} Puan</div>
                    </div>
                  </div>

                  <div>
                     <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                        <span style={{ color: 'var(--fg-subtle)' }}>Seviye İlerlemesi</span>
                        <span>{points} / {rankConf.max}</span>
                     </div>
                     <div style={{ height: 6, background: 'var(--bg-raised)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: rankConf.color, width: `${nextProgress}%`, transition: 'width 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                     </div>
                  </div>
                </>
              )}
            </div>

            {/* Video Progress Widget */}
            <div className="card" style={{ padding: '2rem', border: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
              <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--fg-subtle)', marginBottom: '1.5rem', fontWeight: 700 }}>Ders Görevleri</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                       Dersi Tamamla
                    </div>
                    <span style={{ fontSize: '0.85rem', color: watchRewarded ? '#10b981' : 'var(--fg)', fontWeight: 700 }}>
                      {watchRewarded ? <CheckCircle size={14} /> : `${progress}%`}
                    </span>
                  </div>
                  {!watchRewarded && (
                    <div style={{ height: 4, background: 'var(--bg-raised)', borderRadius: 2, overflow: 'hidden' }}>
                       <div style={{ height: '100%', background: 'var(--fg)', width: `${progress}%`, transition: 'width 0.2s linear' }} />
                    </div>
                  )}
                </div>

                {item.questions && item.questions.length > 0 && (
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                     <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--fg-subtle)' }}>İnteraktif Sorular ({Object.keys(answeredQuestions).length}/{item.questions.length})</h4>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {item.questions.map((q, i) => (
                           <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Soru {i+1}</span>
                              {answeredQuestions[q.id || q.timestampSec] ? (
                                 <CheckCircle size={16} color="#10b981" />
                              ) : (
                                 <span style={{ fontSize: '0.75rem', background: 'var(--bg-raised)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>Bekliyor</span>
                              )}
                           </div>
                        ))}
                     </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .responsive-grid-watch { grid-template-columns: 1fr !important; }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { 0% { transform: translateY(10px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
}
