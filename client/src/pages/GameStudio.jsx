import React, { useState, useEffect, useContext } from 'react';
import { API_URL } from '../config';
import { Play, Plus, Trash2, Edit3, Type, CheckCircle, Search, HelpCircle, Gamepad2, ChevronLeft, Save, Minus, Trophy, Crown, Award } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function GameStudio({ socket }) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [games, setGames] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  
  const [activeView, setActiveView] = useState('LIST'); // LIST, CREATE, LIVE
  
  // Game Creation State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Genel');
  const [questions, setQuestions] = useState([]);
  
  // Live State
  const [selectedClass, setSelectedClass] = useState('RANDOM');
  const [liveGame, setLiveGame] = useState(null);
  const [livePin, setLivePin] = useState(null);
  const [students, setStudents] = useState([]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(-1);
  const [liveAnswers, setLiveAnswers] = useState({});
  const [liveState, setLiveState] = useState({}); // E.g., revealed letters in hangman

  useEffect(() => {
    if (user?.id) {
       fetchGames();
       fetchClassrooms();
    }
  }, [user]);

  const fetchGames = async () => {
    const res = await fetch(`${API_URL}/api/games/teacher/${user.id}`);
    const data = await res.json();
    if (data.success) setGames(data.games);
  };

  const fetchClassrooms = async () => {
    const res = await fetch(`${API_URL}/api/classrooms/teacher/${user.id}`);
    const data = await res.json();
    if (data.success) setClassrooms(data.classrooms);
  };

  // --- CREATE LOGIC ---
  const addQuestion = (type) => {
    if (type === 'QUIZ') {
      setQuestions([...questions, { type: 'QUIZ', prompt: 'Yeni Soru', timeLimit: 30, payloadObj: { options: ['A', 'B', 'C', 'D'], correctIndex: 0 } }]);
    } else if (type === 'HANGMAN') {
      setQuestions([...questions, { type: 'HANGMAN', prompt: 'Adam Asmaca', timeLimit: 60, payloadObj: { word: 'DERSA', hint: 'Bir ipucu girin' } }]);
    } else if (type === 'FILL_BLANK') {
      setQuestions([...questions, { type: 'FILL_BLANK', prompt: 'Cümleyi tamamlayın', timeLimit: 40, payloadObj: { text: "Python bir ___ dilidir.", answer: "programlama" } }]);
    }
  };

  const updateQuestion = (idx, field, value) => {
    const newQ = [...questions];
    newQ[idx][field] = value;
    setQuestions(newQ);
  };

  const updateQuestionPayload = (idx, field, value) => {
    const newQ = [...questions];
    newQ[idx].payloadObj[field] = value;
    setQuestions(newQ);
  };

  const saveGame = async () => {
    if (!newTitle) return alert('Oyun başlığı girmelisiniz!');
    
    // Create Template
    const res = await fetch(`${API_URL}/api/games`, {
       method: 'POST', headers: { 'Content-Type':'application/json' },
       body: JSON.stringify({ title: newTitle, category: newCategory, teacherId: user.id })
    });
    const data = await res.json();
    
    if (data.success) {
      const templateId = data.game.id;
      // Add questions
      for (const q of questions) {
         await fetch(`${API_URL}/api/games/${templateId}/questions`, {
            method: 'POST', headers: { 'Content-Type':'application/json' },
            body: JSON.stringify({ type: q.type, prompt: q.prompt, payload: JSON.stringify(q.payloadObj), timeLimit: q.timeLimit })
         });
      }
      setActiveView('LIST');
      setNewTitle(''); setQuestions([]);
      fetchGames();
    }
  };

  const deleteGame = async (gameId) => {
    if(!window.confirm('Bu şablonu silmek istediğinize emin misiniz?')) return;
    const res = await fetch(`${API_URL}/api/games/${gameId}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) fetchGames();
  };

  const seedGames = async () => {
    const res = await fetch(`${API_URL}/api/games/seed/${user.id}`, { method: 'POST' });
    const data = await res.json();
    if (data.success) fetchGames();
  };

  // --- LIVE KİTLEME VE BAŞLATMA LOGIC ---
  const launchGame = async (gameId) => {
     // Fetch full game details
     const res = await fetch(`${API_URL}/api/games/${gameId}`);
     const data = await res.json();
     if(data.success) {
       setLiveGame(data.game);
       setLiveAnswers({});
       
       let payload = {};
       if (selectedClass !== 'RANDOM') payload.pin = selectedClass;

       socket.emit('create_session', payload, r => {
         if (r.success) {
            setLivePin(r.pin);
            setLiveState({});
            setActiveView('LIVE_PRE_LOBBY'); // Teacher Lobby
         }
       });
     }
  };

  const startAutoGameEngine = () => {
     setActiveView('LIVE_AUTO_RUNNING');
     socket.emit('start_auto_game', { pin: livePin, gameId: liveGame.id });
  };

  const [liveAutoState, setLiveAutoState] = useState(null);

  useEffect(() => {
    if (activeView === 'LIVE_PRE_LOBBY' || activeView === 'LIVE_AUTO_RUNNING') {
      socket.on('attendance_update', (list) => setStudents(list));
      
      socket.on('sync_auto_game', (data) => {
         setLiveAnswers({}); // reset for fresh action payload
         setLiveAutoState({ type: 'QUESTION', queue: data.queueInfo, data: data.gameData, limit: data.timeLimit });
      });

      socket.on('sync_game_results', (data) => {
         setLiveAutoState(prev => ({ ...prev, type: 'RESULTS', answers: data.answers, scores: data.currentScores }));
      });

      socket.on('game_over', (data) => {
         setLiveAutoState({ type: 'GAME_OVER', scores: data.scores });
      });

      socket.on('live_action_received', (act) => {
         setLiveAnswers(prev => ({
            ...prev,
            [act.studentId]: { points: act.points, action: act.actionPayload }
         }));
      });

      return () => {
         socket.off('attendance_update');
         socket.off('sync_auto_game');
         socket.off('sync_game_results');
         socket.off('game_over');
         socket.off('live_action_received');
      };
    }
  }, [activeView, livePin, liveGame, socket]);

  // ----------------------------------------------------
  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 56px)', overflow: 'hidden', background: 'var(--bg-raised)' }}>
      
      {/* ─── LEFT PANEL ─── */}
      <div style={{ width: '320px', background: 'var(--bg-surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontFamily: 'DM Serif Display', fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Gamepad2 color="var(--accent)" /> Dersa Oyunları
          </h2>
          {activeView === 'LIST' && (
            <button className="btn btn-primary btn-block" onClick={() => setActiveView('CREATE')}>
              <Plus size={16} /> Yeni Oyun Oluştur
            </button>
          )}
          {activeView !== 'LIST' && (
            <button className="btn btn-ghost btn-block" style={{ border: '1px solid var(--border)' }} onClick={() => { setActiveView('LIST'); socket.emit('change_slide', { pin: livePin, slide: null }); }}>
              <ChevronLeft size={16} /> Geri Dön
            </button>
          )}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
           {activeView === 'LIST' ? (
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '1rem' }}>
                   <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--fg-subtle)' }}>BAŞLATMADAN ÖNCE SINIF SEÇ</label>
                   <select className="field btn-sm" value={selectedClass} onChange={e => setSelectedClass(e.target.value)} style={{ padding: '0.5rem' }}>
                     <option value="RANDOM">Hızlı Sınıf (Rastgele PIN)</option>
                     {classrooms.map(c => <option key={c.id} value={c.code}>{c.name} ({c.code})</option>)}
                   </select>
                </div>

               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                 <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--fg-subtle)' }}>Oyun Şablonlarım</h3>
                 {games.length === 0 && <button className="btn btn-ghost btn-sm" onClick={seedGames}>Doldur</button>}
               </div>
               
               {games.length === 0 ? <p className="text-subtle text-sm">Henüz oyun oluşturmadınız.</p> : null}
               {games.map(g => (
                 <div key={g.id} className="card" style={{ padding: '1rem', border: '1px solid var(--border)', background: 'var(--bg)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div style={{ fontWeight: 600 }}>{g.title}</div>
                      <Trash2 size={14} color="red" style={{ cursor: 'pointer' }} onClick={() => deleteGame(g.id)} />
                    </div>
                    <div className="text-sm text-subtle">{g._count?.questions || 0} Soru • {g.category}</div>
                    <button className="btn btn-sm" style={{ background: 'var(--accent)', color: 'white', marginTop: '0.5rem' }} onClick={() => launchGame(g.id)}>
                      Oyunu Sınıfta Başlat
                    </button>
                 </div>
               ))}
             </div>
           ) : (activeView === 'LIVE_PRE_LOBBY' || activeView === 'LIVE_AUTO_RUNNING') ? (
             <div>
                <div style={{ background: 'var(--accent)', color: 'white', padding: '1rem', borderRadius: '8px', textAlign: 'center', marginBottom: '1rem' }}>
                   <div style={{ fontSize: '0.8rem', fontWeight: 700, opacity: 0.8 }}>YAYINDAKI SINIF PIN KODU</div>
                   <div style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '0.2em' }}>{livePin}</div>
                </div>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--fg-subtle)', marginBottom: '0.5rem' }}>Katılan Öğrenciler ({students.length})</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', maxHeight: '150px', overflowY: 'auto', marginBottom: '1rem' }}>
                  {students.map(s => <div key={s.id} style={{ padding: '0.3rem 0.5rem', background: 'var(--bg)', borderRadius: '4px', fontSize: '0.85rem' }}>{s.name}</div>)}
                </div>

                <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--fg-subtle)', marginBottom: '0.5rem' }}>Sıradaki Etkinlikler Sistemi</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', opacity: 0.8 }}>
                  {liveGame?.questions?.map((q, i) => (
                    <div key={q.id} style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '4px', background: 'var(--bg-surface)' }}>
                       {i+1}. {q.type === 'HANGMAN' ? 'A. Asmaca' : q.type === 'QUIZ' ? 'Test' : 'Boşluk'}
                    </div>
                  ))}
                </div>
             </div>
           ) : (
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
               <input className="field" placeholder="Oyun Seti Başlığı..." value={newTitle} onChange={e=>setNewTitle(e.target.value)} />
               <input className="field" placeholder="Kategori (Fizik, Mat...)" value={newCategory} onChange={e=>setNewCategory(e.target.value)} />
               
               <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--fg-subtle)', marginBottom: '0.5rem', display: 'block' }}>ETKİNLİK EKLE</label>
                  <button className="btn btn-ghost btn-sm btn-block" style={{ justifyContent: 'flex-start' }} onClick={() => addQuestion('QUIZ')}><HelpCircle size={14}/> Çoktan Seçmeli Test</button>
                  <button className="btn btn-ghost btn-sm btn-block" style={{ justifyContent: 'flex-start' }} onClick={() => addQuestion('HANGMAN')}><Type size={14}/> Adam Asmaca (Kelime Bilme)</button>
                  <button className="btn btn-ghost btn-sm btn-block" style={{ justifyContent: 'flex-start' }} onClick={() => addQuestion('FILL_BLANK')}><Minus size={14}/> Boşluk Doldurma</button>
               </div>
             </div>
           )}
        </div>
      </div>

      {/* ─── MIDDLE PANEL (EDITOR OR LIVE VIEW) ─── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column' }}>
         {activeView === 'LIST' && (
           <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
              <Gamepad2 size={64} style={{ marginBottom: '1rem' }} />
              <h2 style={{ fontFamily: 'DM Serif Display, serif' }}>Oyun motorunu sol taraftan başlatın veya dizayn edin.</h2>
           </div>
         )}
         
         {activeView === 'CREATE' && (
           <div style={{ maxWidth: '800px', width: '100%', margin: '0 auto' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontFamily: 'DM Serif Display', fontSize: '2.5rem' }}>Oyun Tasarımı: {newTitle || 'İsimsiz'}</h1>
                <button className="btn btn-primary" onClick={saveGame}><Save size={16}/> Oyunu Kaydet</button>
             </div>
             
             {questions.length === 0 ? (
                <div className="card" style={{ padding: '3rem', textAlign: 'center', border: '2px dashed var(--border)', background: 'transparent' }}>
                   Henüz etkinlik eklenmedi. Soldan bir oyun türü seçin.
                </div>
             ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {questions.map((q, i) => (
                    <div key={i} className="card" style={{ padding: '1.5rem', border: '1px solid var(--border)' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                         <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{i+1}. {q.type === 'HANGMAN' ? 'Adam Asmaca' : q.type === 'QUIZ' ? 'Test' : 'Boşluk Doldurma'}</h3>
                         <button className="btn btn-ghost btn-sm" style={{ color: 'red' }} onClick={() => setQuestions(questions.filter((_, idx) => idx !== i))}><Trash2 size={14}/></button>
                       </div>
                       
                       <input className="field mb-3" placeholder="Soru metni veya yönlendirici başlık..." value={q.prompt} onChange={e => updateQuestion(i, 'prompt', e.target.value)} />
                       
                       {q.type === 'HANGMAN' && (
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                             <input className="field" placeholder="Gizli Kelime (Örn: PARİS)" value={q.payloadObj.word} onChange={e => updateQuestionPayload(i, 'word', e.target.value)} />
                             <input className="field" placeholder="İpucu" value={q.payloadObj.hint} onChange={e => updateQuestionPayload(i, 'hint', e.target.value)} />
                          </div>
                       )}

                       {q.type === 'FILL_BLANK' && (
                          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                             <input className="field" placeholder="Örn: Yerçekimini ___ bulmuştur." value={q.payloadObj.text} onChange={e => updateQuestionPayload(i, 'text', e.target.value)} />
                             <input className="field" placeholder="Doğru Yanıt (Boşluğa gelecek kelime)" value={q.payloadObj.answer} onChange={e => updateQuestionPayload(i, 'answer', e.target.value)} />
                          </div>
                       )}

                       {q.type === 'QUIZ' && (
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                             {q.payloadObj.options.map((opt, oIdx) => (
                               <div key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                 <input type="radio" name={`correct_${i}`} checked={q.payloadObj.correctIndex === oIdx} onChange={() => updateQuestionPayload(i, 'correctIndex', oIdx)} />
                                 <input className="field" placeholder={`${oIdx+1}. Seçenek`} value={opt} onChange={e => {
                                    const opts = [...q.payloadObj.options];
                                    opts[oIdx] = e.target.value;
                                    updateQuestionPayload(i, 'options', opts);
                                 }} />
                               </div>
                             ))}
                          </div>
                       )}
                       <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--fg-subtle)' }}>Süre Limiti (Saniye): <input type="number" className="field btn-sm" style={{ width: 80, display: 'inline-block', marginLeft: '0.5rem' }} value={q.timeLimit} onChange={e => updateQuestion(i, 'timeLimit', parseInt(e.target.value))} /></div>
                    </div>
                  ))}
                </div>
             )}
           </div>
         )}

         {activeView === 'LIVE_PRE_LOBBY' && (
           <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
              <div>
                 <Gamepad2 size={80} style={{ margin: '0 auto 1.5rem auto', color: 'var(--accent)' }} />
                 <h2 style={{ fontSize: '2.5rem', fontFamily: 'DM Serif Display', marginBottom: '1rem' }}>Lobi Hazır!</h2>
                 <p className="text-subtle mb-4 text-lg">Öğrencilerin <strong>{livePin}</strong> koduyla oyuna katılmalarını bekleyin.</p>
                 <button className="btn btn-primary btn-lg" onClick={startAutoGameEngine} style={{ padding: '1rem 3rem', fontSize: '1.2rem', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}>Herkes Hazırsa Oyunu Başlat</button>
              </div>
           </div>
         )}

         {activeView === 'LIVE_AUTO_RUNNING' && liveAutoState?.type === 'QUESTION' && (
           <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '3rem', background: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--border)', flex: 1, position: 'relative', overflow: 'hidden' }}>
                 
                 <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '8px', background: 'var(--border)' }}>
                     <div style={{ height: '100%', background: 'var(--accent)', width: '100%', animation: `shrink linear ${liveAutoState.limit}s` }} />
                 </div>

                 <div className="text-subtle" style={{ textAlign: 'center', marginBottom: '1rem', fontWeight: 800 }}>ETKİNLİK {liveAutoState.queue} • {liveAutoState.limit} SN</div>
                 <h1 style={{ fontFamily: 'DM Serif Display', fontSize: '2.5rem', textAlign: 'center', marginBottom: '2rem' }}>
                   {liveAutoState.data?.prompt}
                 </h1>
                 
                 <div style={{ textAlign: 'center', opacity: 0.5, marginTop: '2rem' }}>
                    <Gamepad2 size={60} style={{ margin: '0 auto 1rem auto' }} />
                    <p style={{ fontSize: '1.2rem' }}>Öğrencilerin cihazlarında süre işliyor, cevaplar bekleniyor...</p>
                 </div>

                 <div style={{ marginTop: '4rem' }}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', fontWeight: 700 }}>Canlı Cevap Akışı</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                       {Object.entries(liveAnswers).map(([id, val]) => {
                          const user = students.find(s => s.id === id);
                          return (
                             <div key={id} style={{ padding: '1rem', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                               <span>{user?.name || 'Bilinmiyor'}</span>
                               <strong style={{ color: 'var(--accent)' }}>Cevapladı! ({val.points} Puan)</strong>
                             </div>
                          );
                       })}
                    </div>
                 </div>

              </div>
              <style>{`@keyframes shrink { from { width: 100%; } to { width: 0%; } }`}</style>
           </div>
         )}

         {activeView === 'LIVE_AUTO_RUNNING' && liveAutoState?.type === 'RESULTS' && (
           <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '3rem', background: 'var(--bg-raised)', borderRadius: '16px', border: '1px solid var(--border)', flex: 1, textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', animation: 'fadeIn 0.5s ease-out' }}>
                 <h1 style={{ fontFamily: 'DM Serif Display', fontSize: '3rem', color: 'var(--fg)', marginBottom: '2rem', animation: 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}>Anlık Lider Tablosu</h1>
                 
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '600px', margin: '0 auto', animation: 'slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                    {Object.entries(liveAutoState.scores).sort((a,b)=>b[1]-a[1]).map(([id, score], i) => {
                       const user = students.find(s => s.id === id);
                       const isFirst = i === 0;
                       return (
                          <div key={id} style={{ 
                             padding: '1.2rem 2rem', 
                             background: isFirst ? 'var(--fg)' : 'var(--bg-surface)', 
                             border: '1px solid var(--border)', 
                             borderRadius: '16px', 
                             display: 'flex', justifyContent: 'space-between', 
                             fontSize: '1.25rem', fontWeight: 500, 
                             color: isFirst ? 'var(--bg)' : 'var(--fg)',
                             boxShadow: isFirst ? '0 10px 20px rgba(0,0,0,0.1)' : '0 4px 6px rgba(0,0,0,0.05)',
                             transform: isFirst ? 'scale(1.02)' : 'none'
                          }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                               <span style={{ opacity: isFirst ? 1 : 0.5 }}>#{i+1}</span>
                               {user?.name || 'Bilinmiyor'} {isFirst && <Crown size={18} style={{ marginLeft: '0.5rem' }} />}
                            </span>
                            <span style={{ opacity: 0.9 }}>{score} Puan</span>
                          </div>
                       )
                    })}
                 </div>
              </div>
           </div>
         )}

         {activeView === 'LIVE_AUTO_RUNNING' && liveAutoState?.type === 'GAME_OVER' && (
           <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ position: 'relative', overflow: 'hidden', padding: '4rem 2rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '16px', flex: 1, textAlign: 'center', color: 'var(--fg)', animation: 'fadeIn 0.8s ease-out' }}>
                 
                 <div style={{ position: 'relative', zIndex: 1, animation: 'slideUp 1s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', animation: 'floatFloat 4s infinite' }}>
                       <Trophy size={64} strokeWidth={1} />
                    </div>
                    <h1 style={{ fontFamily: 'DM Serif Display', fontSize: '4.5rem', color: 'var(--fg)', marginBottom: '3rem', letterSpacing: '2px' }}>ŞAMPİYONLAR</h1>
                 </div>

                 <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '1.5rem', height: '350px', marginTop: '2rem', position: 'relative', zIndex: 1, animation: 'slideUp 1.2s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                    {Object.entries(liveAutoState.scores).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([id, score], i) => {
                       const user = students.find(s => s.id === id);
                       const heights = [280, 200, 140];
                       const delays = ['0.2s', '0.4s', '0.6s'];
                       const isFirst = i === 0;
                       
                       return (
                          <div key={id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', animation: `fadeInUp 0.8s ease backwards ${delays[i]}` }}>
                             <div style={{ fontWeight: 400, fontSize: '1.5rem', marginBottom: '1rem' }}>{user?.name}</div>
                             <div style={{ 
                                background: isFirst ? 'var(--fg)' : 'var(--bg-surface)', 
                                border: '1px solid var(--border)',
                                width: '140px', height: `${heights[i]}px`, 
                                borderTopLeftRadius: '16px', borderTopRightRadius: '16px', 
                                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                color: isFirst ? 'var(--bg)' : 'var(--fg)', fontWeight: 500, fontSize: '2.5rem',
                                position: 'relative'
                             }}>
                               {i === 0 && <span style={{ position: 'absolute', top: '-50px', animation: 'floatFloat 3s infinite' }}><Crown size={32} /></span>}
                               {score}
                             </div>
                          </div>
                       );
                    })}
                 </div>
                 
                 <button className="btn btn-ghost" style={{ marginTop: '4rem', padding: '1rem 3rem', fontSize: '1.2rem', borderRadius: '50px', position: 'relative', zIndex: 1, border: '1px solid var(--border)' }} onClick={() => setActiveView('LIST')}>Stüdyoya Dön</button>
              </div>

              <style>{`
                 @keyframes floatFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
                 @keyframes fadeInUp { from { opacity: 0; transform: translateY(50px); } to { opacity: 1; transform: translateY(0); } }
                 @keyframes slideUp { 0% { transform: translateY(40px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
                 @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
              `}</style>
           </div>
         )}
      </div>
    </div>
  );
}
