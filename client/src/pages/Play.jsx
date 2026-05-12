import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, PenTool, Edit3, X, CheckCircle2, XCircle, Trophy, Star, Circle, Check } from 'lucide-react';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

export default function Play({ socket }) {
  const location = useLocation();
  const navigate = useNavigate();
  const initialPinVal = location.state?.initialPin || '';
  
  const [pin, setPin] = useState(initialPinVal);
  const [name, setName] = useState('');
  const [step, setStep] = useState(initialPinVal.length >= 4 ? 'name' : 'pin'); // 'pin' | 'name' | 'waiting' | 'live'

  // Live State
  const [slide, setSlide] = useState(null);
  const [quizMode, setQuizMode] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  
  // Game Mode State
  const [gameMode, setGameMode] = useState(false);
  const [gameData, setGameData] = useState(null);
  
  // Local independent game tracking for competitive mode
  const [localGameState, setLocalGameState] = useState({
     revealed: [],
     wrongGuesses: 0,
     isFinished: false,
     feedback: null // 'success' or 'error' for flashes
  });

  // Notes Drawer State
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [notes, setNotes] = useState('');

  // Canvas
  const canvasRef = useRef(null);

  useEffect(() => {
    if (step === 'live' || step === 'waiting') {
      socket.on('sync_slide', (data) => {
        setGameMode(false);
        setSlide(data.slide);
        setQuizMode(data.quizMode);
        setSelectedAnswer(null); // reset selected answer
        setShowLeaderboard(false);
        setStep('live');
      });

      socket.on('sync_auto_game', (data) => {
        setSlide(null);
        setGameMode(true);
        setGameData(data); // data contains { gameData, timeLimit, queueInfo }
        setSelectedAnswer(null); 
        setLocalGameState({ revealed: [], wrongGuesses: 0, isFinished: false, feedback: null, type: 'QUESTION' });
        setStep('live');
      });

      socket.on('sync_game_results', (data) => {
        setLocalGameState(prev => ({ ...prev, type: 'RESULTS', resultsData: data }));
      });

      socket.on('game_over', (data) => {
        setLocalGameState(prev => ({ ...prev, type: 'GAME_OVER', finalScores: data.scores }));
      });

      socket.on('receive_stroke', (stroke) => {
        drawStroke(stroke);
      });

      socket.on('clear_canvas', () => {
        clearCanvas();
      });

      socket.on('show_results', () => {
        setQuizMode(false);
        setShowLeaderboard(true);
      });
    }

    return () => {
      socket.off('sync_slide');
      socket.off('sync_auto_game');
      socket.off('sync_game_results');
      socket.off('game_over');
      socket.off('receive_stroke');
      socket.off('clear_canvas');
      socket.off('show_results');
    };
  }, [step, socket]);

  // Adjust canvas size when window changes or we switch to live step
  useEffect(() => {
    if (step === 'live' && canvasRef.current) {
      const resizeCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas && canvas.parentElement) {
          canvas.width = canvas.parentElement.clientWidth;
          canvas.height = canvas.parentElement.clientHeight;
        }
      };
      // Delay slightly to let React render the DOM completely
      setTimeout(resizeCanvas, 50);
      window.addEventListener('resize', resizeCanvas);
      return () => window.removeEventListener('resize', resizeCanvas);
    }
  }, [step, slide]);

  const midPointBtw = (p1, p2) => ({ x: p1.x + (p2.x - p1.x) / 2, y: p1.y + (p2.y - p1.y) / 2 });

  const drawStroke = (stroke) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    
    // Eraser Mode
    if (stroke.color === 'ERASER' || stroke.tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = 25;
      ctx.globalAlpha = 1.0;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = stroke.color || 'var(--fg)';
      ctx.lineWidth = stroke.width || (stroke.tool === 'chalk' ? 6 : 3);
      ctx.globalAlpha = stroke.tool === 'chalk' ? 0.7 : 1.0;
    }

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    
    if (stroke.type === 'path') {
      const p1 = stroke.p1;
      const p2 = stroke.p2;
      ctx.moveTo(p1.x * w, p1.y * h);
      const mid = midPointBtw(p1, p2);
      ctx.quadraticCurveTo(p1.x * w, p1.y * h, mid.x * w, mid.y * h);
      ctx.lineTo(p2.x * w, p2.y * h);
    } 
    else if (stroke.type === 'line' || stroke.type === 'rect' || stroke.type === 'circle') {
      const sx = stroke.start.x * w;
      const sy = stroke.start.y * h;
      const ex = stroke.end.x * w;
      const ey = stroke.end.y * h;

      if (stroke.type === 'line') {
        ctx.moveTo(sx, sy);
        ctx.lineTo(ex, ey);
      } else if (stroke.type === 'rect') {
        ctx.rect(sx, sy, ex - sx, ey - sy);
      } else if (stroke.type === 'circle') {
        const radius = Math.sqrt(Math.pow(ex - sx, 2) + Math.pow(ey - sy, 2));
        ctx.arc(sx, sy, radius, 0, 2 * Math.PI);
      }
    } else {
      // Fallback for legacy strokes
      if (!stroke.isLine) {
         ctx.moveTo(stroke.x * w, stroke.y * h);
      } else {
         ctx.lineTo(stroke.x * w, stroke.y * h);
      }
    }

    ctx.stroke();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
    }
  };

  const submitPin = e => {
    e.preventDefault();
    if (pin.trim().length >= 4) setStep('name');
  };

  const submitName = e => {
    e.preventDefault();
    if (name.trim()) {
      socket.emit('join_session', { pin, studentName: name }, (res) => {
        if (res.success) {
          if (res.sessionState?.gameMode) {
            setGameMode(true);
            setGameData(res.sessionState.currentGame);
            setStep('live');
          } else if (res.sessionState?.currentSlide) {
            setSlide(res.sessionState.currentSlide);
            setQuizMode(res.sessionState.quizMode);
            setStep('live');
          } else {
            setStep('waiting');
          }
        } else {
          alert(res.message);
          setStep('pin');
        }
      });
    }
  };

  const handleAnswer = (ansLabel) => {
    if (selectedAnswer) return; // Prevent multiple submissions
    setSelectedAnswer(ansLabel);
    socket.emit('submit_answer', { pin, answer: ansLabel });
  };

  const handleHangmanGuess = (char) => {
     if(localGameState.isFinished) return;
     const actualData = gameData?.gameData || gameData;
     const payload = typeof actualData.payload === 'string' ? JSON.parse(actualData.payload || '{}') : (actualData.payload || {});
     const word = payload.word?.toUpperCase();
     
     if (word.includes(char)) {
         const nextRevealed = [...localGameState.revealed, char];
         const allFound = word.split('').every(c => c === ' ' || nextRevealed.includes(c));
         setLocalGameState(s => ({ ...s, revealed: nextRevealed, isFinished: allFound }));
         
         if (allFound) {
            socket.emit('submit_auto_game_action', { pin, isCorrect: true, actionPayload: 'KAZANDI' });
         }
     } else {
         const nextWrong = localGameState.wrongGuesses + 1;
         const isDead = nextWrong >= 6;
         setLocalGameState(s => ({ ...s, wrongGuesses: nextWrong, isFinished: isDead }));
         
         if (isDead) {
            socket.emit('submit_auto_game_action', { pin, isCorrect: false, actionPayload: 'KAYBETTİ' });
         }
     }
  };

  const handleQuizAnswer = (idx) => {
     if(selectedAnswer !== null) return;
     const actualData = gameData?.gameData || gameData;
     const payload = typeof actualData.payload === 'string' ? JSON.parse(actualData.payload || '{}') : (actualData.payload || {});
     const isCorrect = payload.correctIndex === idx;
     setSelectedAnswer(idx);
     setLocalGameState(s => ({ ...s, isFinished: true, feedback: isCorrect ? 'success' : 'error' }));
     socket.emit('submit_auto_game_action', { pin, isCorrect, actionPayload: payload.options[idx] });
  };

  const handleFillBlank = (e) => {
     e.preventDefault();
     if(selectedAnswer !== null) return;
     const actualData = gameData?.gameData || gameData;
     const payload = typeof actualData.payload === 'string' ? JSON.parse(actualData.payload || '{}') : (actualData.payload || {});
     const val = e.target.answer.value.trim().toUpperCase();
     const correct = payload.answer?.trim().toUpperCase();
     const isCorrect = val === correct;
     
     setSelectedAnswer(val);
     setLocalGameState(s => ({ ...s, isFinished: true, feedback: isCorrect ? 'success' : 'error' }));
     socket.emit('submit_auto_game_action', { pin, isCorrect, actionPayload: val || '-' });
  };

  // ─── Render Pre-Game (Login/Waiting) ───
  if (step === 'pin' || step === 'name' || step === 'waiting') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 56px)', background: 'var(--bg)' }}>
        <div style={{ width: '100%', maxWidth: '400px', padding: '0 1rem' }}>
          
          <div style={{ borderBottom: '2px solid var(--border)', paddingBottom: '1.25rem', marginBottom: '2rem', textAlign: 'center' }}>
            <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '2.5rem', marginBottom: '0.5rem' }}>Dersa Sınıfı</h1>
            <p className="text-subtle">Etkileşimli derse katılın.</p>
          </div>

          {step === 'pin' && (
            <form onSubmit={submitPin}>
              <div style={{ marginBottom: '1.5rem' }}>
                <input
                  className="field field-lg"
                  type="text"
                  inputMode="numeric"
                  maxLength={8}
                  placeholder="PIN Kodu (Örn: 123456)"
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                  autoFocus
                  style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.2em' }}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-block" style={{ padding: '1rem', fontSize: '1.1rem' }}>Katıl <ArrowRight size={18} /></button>
            </form>
          )}

          {step === 'name' && (
            <form onSubmit={submitName}>
              <div style={{ marginBottom: '1.5rem' }}>
                <input
                  className="field field-lg"
                  type="text"
                  placeholder="Adınız ve Soyadınız"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoFocus
                  style={{ textAlign: 'center', fontSize: '1.2rem' }}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-block" style={{ padding: '1rem', fontSize: '1.1rem' }}>Sınıfa Gir</button>
              <button type="button" className="btn btn-ghost btn-block mt-2" onClick={() => setStep('pin')}>Geri Dön</button>
            </form>
          )}

          {step === 'waiting' && (
            <div style={{ padding: '3rem 1.5rem', border: '1px solid var(--border)', textAlign: 'center', background: 'var(--bg-surface)' }}>
              <div className="spinner" style={{ margin: '0 auto 1.5rem auto' }}></div>
              <h3 style={{ fontSize: '1.5rem', fontFamily: 'DM Serif Display, serif', marginBottom: '0.5rem' }}>Hoşgeldin, {name}</h3>
              <p className="text-subtle" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span>Öğretmen dersi başlattığında ekranınız otomatik olarak güncellenecek.</span>
                <strong style={{ letterSpacing: '0.1em', marginTop: '1rem', fontSize: '1.2rem', color: 'var(--fg)' }}>PIN: {pin}</strong>
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Render GAME View (DERSA KAHOOT UI) ───
  if (gameMode && gameData) {
     const stateType = localGameState.type || 'QUESTION';

     if (stateType === 'RESULTS') {
        const { answers, currentScores, correctPayload } = localGameState.resultsData;
        const myAnswer = answers[socket.id] || { isCorrect: false, points: 0 };
        
        return (
           <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', background: 'var(--bg)', color: 'var(--fg)', alignItems: 'center', justifyContent: 'center', textAlign: 'center', animation: 'fadeIn 0.4s ease-out' }}>
              <div style={{ animation: 'bounceUp 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
                 <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center', color: myAnswer.isCorrect ? 'var(--fg)' : 'var(--fg-subtle)' }}>
                     {myAnswer.isCorrect ? <CheckCircle2 size={80} strokeWidth={1} /> : <XCircle size={80} strokeWidth={1} />}
                 </div>
                 <h1 style={{ fontFamily: 'DM Serif Display', fontSize: '3rem', marginBottom: '1rem', fontWeight: 400 }}>
                    {myAnswer.isCorrect ? 'Doğru Yanıt' : 'Yanlış Yanıt'}
                 </h1>
                 {myAnswer.isCorrect && <div style={{ fontSize: '1.25rem', opacity: 0.7, marginBottom: '2rem' }}>+{myAnswer.points} Puan</div>}
                 
                 <div style={{ fontSize: '1.1rem', padding: '1rem 2rem', background: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border)', display: 'inline-block' }}>
                    <span style={{ opacity: 0.6 }}>Toplam Puanınız:</span> <strong style={{ fontSize: '1.25rem', marginLeft: '0.5rem', fontWeight: 600 }}>{currentScores[socket.id] || 0}</strong>
                 </div>
              </div>
              <style>{`
                 @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                 @keyframes bounceUp { 0% { transform: translateY(20px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
              `}</style>
           </div>
        );
     }

     if (stateType === 'GAME_OVER') {
        const myScore = localGameState.finalScores[socket.id] || 0;
        
        return (
           <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', background: 'var(--bg)', color: 'var(--fg)', alignItems: 'center', justifyContent: 'center', textAlign: 'center', animation: 'fadeIn 0.6s ease-out' }}>
              
              <div style={{ animation: 'floatFloat 4s ease-in-out infinite' }}>
                 <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                     <Trophy size={80} strokeWidth={1} />
                 </div>
              </div>
              <h1 style={{ fontFamily: 'DM Serif Display', fontSize: '3.5rem', marginBottom: '1rem', fontWeight: 400, animation: 'bounceUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>Etkinlik Bitti</h1>
              
              <div style={{ animation: 'bounceUp 1s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
                 <p style={{ fontSize: '1.2rem', opacity: 0.6, marginTop: '2rem' }}>Kazandığınız Toplam Puan</p>
                 <div style={{ fontSize: '4rem', fontWeight: 300, marginBottom: '3rem', letterSpacing: '1px' }}>{myScore}</div>
                 <button className="btn btn-ghost" style={{ border: '1px solid var(--border)', padding: '1rem 2rem', borderRadius: '8px' }} onClick={() => window.location.reload()}>Sınıf Lobisine Dön</button>
              </div>

              <style>{`
                 @keyframes floatFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
                 @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                 @keyframes bounceUp { 0% { transform: translateY(20px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
              `}</style>
           </div>
        );
     }

     // === GAME QUESTION RENDERING ===
     const actualData = gameData?.gameData || gameData;
     const limitTime = gameData?.timeLimit || 30;
     const payload = typeof actualData.payload === 'string' ? JSON.parse(actualData.payload || '{}') : (actualData.payload || {});
     
     if (actualData.type === 'HANGMAN') {
        return (
           <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#1c1c1c', display: 'flex', flexDirection: 'column' }}>
             
             {/* The Blackboard Texture */}
             <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.4) 100%)', pointerEvents: 'none' }} />
             
             {/* Progress Bar (Time) */}
             <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', zIndex: 10 }}>
                <div style={{ height: '100%', background: '#fcd34d', animation: `shrink linear ${limitTime}s` }} />
             </div>

             <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', zIndex: 1, color: 'rgba(255,255,255,0.4)' }}>
                <span style={{ fontFamily: 'Cabin Sketch, sans-serif', fontSize: '1.2rem', letterSpacing: '2px' }}>DERSA OYUN • {gameData?.queueInfo}</span>
                <span style={{ fontFamily: 'Cabin Sketch, sans-serif', fontSize: '1.2rem' }}>{name}</span>
             </div>

             {/* HANGMAN CANVAS AREA */}
             <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '1rem 0', zIndex: 1 }}>
                
                {/* SVG Stickman Blackboard Style */}
                <svg width="200" height="200" viewBox="0 0 200 200" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.85, filter: 'drop-shadow(0px 0px 4px rgba(255,255,255,0.3))' }}>
                   <path d="M20 180 L180 180" opacity={1} />
                   <path d="M60 180 L60 20 L140 20 L140 40" opacity={1} />
                   <path d="M60 60 L100 20" opacity={1} />
                   
                   {localGameState.wrongGuesses >= 1 && <circle cx="140" cy="65" r="25" />}
                   {localGameState.wrongGuesses >= 2 && <path d="M140 90 L140 140" />}
                   {localGameState.wrongGuesses >= 3 && <path d="M140 110 L115 130" />}
                   {localGameState.wrongGuesses >= 4 && <path d="M140 110 L165 130" />}
                   {localGameState.wrongGuesses >= 5 && <path d="M140 140 L120 170" />}
                   {localGameState.wrongGuesses >= 6 && <path d="M140 140 L160 170" />}
                </svg>
                
                {payload.hint && <p style={{ fontFamily: 'Cabin Sketch, sans-serif', fontSize: '1.5rem', color: '#fcd34d', margin: '1rem 0' }}>{payload.hint}</p>}

                {/* Word Blanks */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                   {payload.word?.split('').map((char, i) => {
                      if (char === ' ') return <div key={i} style={{ width: '20px' }} />;
                      const isRevealed = localGameState.revealed.includes(char) || localGameState.wrongGuesses >= 6;
                      const isLostReveal = localGameState.wrongGuesses >= 6 && !localGameState.revealed.includes(char);
                      return (
                         <div key={i} style={{ 
                            width: '40px', height: '50px', borderBottom: '4px solid rgba(255,255,255,0.7)', 
                            display: 'flex', alignItems: 'flex-end', justifyContent: 'center', 
                            fontSize: '2.5rem', fontFamily: 'Cabin Sketch, sans-serif', color: isLostReveal ? '#ef4444' : '#fff'
                         }}>
                            {isRevealed ? char : ''}
                         </div>
                      );
                   })}
                </div>
                
                {localGameState.isFinished && (
                  <div style={{ marginTop: '1rem', fontSize: '2rem', fontFamily: 'Cabin Sketch, sans-serif', color: localGameState.wrongGuesses >= 6 ? '#ef4444' : '#10b981', animation: 'pulse 1s infinite' }}>
                     {localGameState.wrongGuesses >= 6 ? 'KAYBETTINN :(' : 'TEBRIKLER!!'}
                  </div>
                )}
             </div>

             {/* Keyboard */}
             <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 1, opacity: localGameState.isFinished ? 0.3 : 1, pointerEvents: localGameState.isFinished ? 'none' : 'auto' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', maxWidth: '600px' }}>
                   {"ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ".split('').map(char => {
                      const isGuessedLetter = localGameState.revealed.includes(char);
                      return (
                         <button 
                            key={char} 
                            onClick={() => {
                               if(!localGameState.revealed.includes(char)) {
                                  setLocalGameState(s => ({...s, revealed: [...s.revealed, char] }));
                                  handleHangmanGuess(char);
                               }
                            }}
                            disabled={isGuessedLetter}
                            style={{ 
                               width: '40px', height: '48px', fontSize: '1.5rem', fontFamily: 'Cabin Sketch, sans-serif', 
                               background: 'rgba(255,255,255,0.05)', color: isGuessedLetter ? 'rgba(255,255,255,0.2)' : '#fff', 
                               border: `2px solid ${isGuessedLetter ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.4)'}`, 
                               borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s' 
                            }}
                         >
                            {char}
                         </button>
                      );
                   })}
                </div>
             </div>
             
             {/* Webfont injection for Cabin Sketch */}
             <style>{`@import url('https://fonts.googleapis.com/css2?family=Cabin+Sketch:wght@400;700&display=swap'); @keyframes shrink { from { width: 100%; } to { width: 0%; } }`}</style>
           </div>
        );
     }
     
     // QUIZ AND FILL BLANK DERSA THEMES
     const isSuccess = localGameState.feedback === 'success';
     const isError = localGameState.feedback === 'error';
     const isWait = selectedAnswer !== null; // Submitted but waiting for results

     return (
       <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: 'var(--bg)', color: 'var(--fg)', display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '8px', background: 'var(--border)' }}>
             <div style={{ height: '100%', background: 'var(--accent)', width: '100%', animation: `shrink linear ${limitTime}s` }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid var(--border)' }}>
             <strong style={{ opacity: 0.5 }}>{gameData?.queueInfo}</strong>
             <strong style={{ opacity: 0.5 }}>{name}</strong>
          </div>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', position: 'relative', zIndex: 1, animation: 'fadeInContent 0.4s ease-out' }}>
             
             {isWait ? (
                 <div style={{ textAlign: 'center', animation: 'scaleSoft 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', background: 'rgba(255,255,255,0.03)', borderRadius: '24px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '4px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent)', animation: 'spin 1s cubic-bezier(0.5, 0.1, 0.4, 0.9) infinite', marginBottom: '1.5rem' }} />
                    <h2 style={{ fontFamily: 'DM Serif Display', fontSize: '3rem', textShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>Yanıt Uçtu!</h2>
                    <p style={{ opacity: 0.7, fontSize: '1.25rem', marginTop: '0.5rem', maxWidth: '400px', lineHeight: 1.5 }}>Herkesin cevaplamasını veya sürenin bitmesini bekliyoruz...</p>
                 </div>
             ) : (
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                   <h2 style={{ fontFamily: 'DM Serif Display', fontSize: 'clamp(2rem, 5vw, 3.5rem)', textAlign: 'center', marginBottom: '3rem', maxWidth: '800px', lineHeight: 1.3, textShadow: '0 4px 20px rgba(0,0,0,0.4)', padding: '0 1rem' }}>
                     {actualData.prompt}
                   </h2>

                   {actualData.type === 'FILL_BLANK' && (
                      <div style={{ width: '100%', maxWidth: '600px', background: 'rgba(255,255,255,0.03)', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
                         <p style={{ fontSize: '1.35rem', marginBottom: '2.5rem', textAlign: 'center', lineHeight: 1.6, opacity: 0.9 }}>
                           {payload.text.replace('___', ' _____ ')}
                         </p>
                         <form onSubmit={handleFillBlank} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <input name="answer" className="field field-lg" placeholder="Cevabı buraya yazın..." style={{ background: 'var(--bg-surface)', fontSize: '1.5rem', textAlign: 'center', borderRadius: '16px', padding: '1.25rem', border: '2px solid transparent' }} autoFocus />
                            <button type="submit" className="btn btn-primary btn-block" style={{ padding: '1.25rem', borderRadius: '16px', fontSize: '1.25rem', fontWeight: 700, boxShadow: '0 10px 20px rgba(99,102,241,0.3)' }}>Yanıtla</button>
                         </form>
                      </div>
                   )}

                   {actualData.type === 'QUIZ' && (
                      <div style={{ width: '100%', maxWidth: '900px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                         {payload.options?.map((opt, i) => {
                            return (
                            <button 
                               key={i} 
                               onClick={() => handleQuizAnswer(i)}
                               style={{ 
                                  padding: '1.5rem', minHeight: '100px', fontSize: '1.25rem', fontWeight: 500, 
                                  background: 'var(--bg-surface)', color: 'var(--fg)', 
                                  border: '1px solid var(--border)', borderRadius: '12px', cursor: 'pointer',
                                  transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                  display: 'flex', alignItems: 'center', gap: '1.5rem', textAlign: 'left'
                               }}
                               onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-raised)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.1)'; }}
                               onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                               onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.98)'; }}
                               onMouseUp={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                            >
                               <div style={{ width: '40px', height: '40px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 700, fontSize: '1.2rem' }}>{'ABCD'[i]}</div>
                               <div style={{ lineHeight: 1.4 }}>{opt}</div>
                            </button>
                         )})}
                      </div>
                   )}
                </div>
             )}

          </div>

          <style>{`
             @keyframes scaleIn { 0% { transform: scale(0.5); opacity: 0; } 70% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
             @keyframes scaleSoft { 0% { transform: scale(0.9); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
             @keyframes fadeInContent { 0% { opacity: 0; } 100% { opacity: 1; } }
             @keyframes slideUp { 0% { transform: translateY(40px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
             @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.02); } 100% { transform: scale(1); } }
             @keyframes shrink { from { width: 100%; } to { width: 0%; } }
             @keyframes spin { 100% { transform: rotate(360deg); } }
          `}</style>
       </div>
     );
  }

  // Board Styling Engines (Sync with Teacher)
  let boardContainerStyle = { background: 'transparent' };
  let boardInnerStyle = { background: '#ffffff', boxShadow: 'var(--shadow-md)', borderRadius: '4px' };

  if (slide?.theme === 'blackboard') {
    boardContainerStyle = { background: '#1c1c1c' };
    boardInnerStyle = { 
      background: '#23372b',
      border: '18px solid #6b4423',
      borderRadius: '6px',
      boxShadow: 'inset 0 0 40px rgba(0,0,0,0.6), 0 10px 30px rgba(0,0,0,0.5)',
      backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.2) 100%)'
    };
  } else if (slide?.theme === 'whiteboard') {
    boardContainerStyle = { background: '#e5e7eb' };
    boardInnerStyle = {
      background: '#ffffff',
      border: '12px solid #cbd5e1',
      borderRadius: '8px',
      borderColor: '#f1f5f9 #94a3b8 #94a3b8 #f1f5f9',
      boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
    };
  } else if (slide?.theme === 'white') {
     boardContainerStyle = { background: '#e2e8f0' };
     boardInnerStyle = { background: '#ffffff' };
  }

  // ─── Render Live View (Student Phone Screen) ───
  return (
    <div style={{ position: 'relative', width: '100vw', height: 'calc(100vh - 56px)', overflow: 'hidden', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Banner (Status) */}
      <div style={{ padding: '0.75rem 1rem', background: 'var(--fg)', color: 'var(--bg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: 8, height: 8, background: 'red', borderRadius: '50%' }}></span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em' }}>CANLI DERS</span>
         </div>
         <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{name}</span>
      </div>

      {/* Main Slide & Canvas Container */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: slide?.theme === 'white' ? '0' : '1rem', ...boardContainerStyle }}>
         
         {/* Underlying Slide Context & Board Skin */}
         <div style={{ flex: 1, width: '100%', maxWidth: slide?.theme === 'white' ? '100%' : '800px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', ...boardInnerStyle }}>
            
            <div style={{ width: '100%', textAlign: 'center', zIndex: 1, opacity: quizMode ? 0.1 : 1, transition: 'opacity 0.3s', padding: '1rem' }}>
           {slide?.type === 'presentation' && slide?.pdfPages?.length > 0 ? (
             <img src={slide.pdfPages[slide.currentPdfPage || 0]} style={{ width: '100%', maxHeight: '60vh', objectFit: 'contain', borderRadius: '8px', boxShadow: 'var(--shadow-md)' }} alt="Sunum" />
           ) : (
             <>
               <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 'clamp(2rem, 6vw, 3rem)', marginBottom: '1rem' }}>{slide?.title}</h1>
               <p style={{ fontSize: '1.1rem', lineHeight: '1.7', color: 'var(--fg-subtle)' }}>{slide?.body}</p>
             </>
           )}
         </div>

         {/* Multi-Choice Quiz Overlay */}
         {quizMode && (slide?.type === 'quiz' || slide?.type === 'tf_quiz') && (
           <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 5, display: 'flex', flexDirection: 'column', padding: '1rem', background: 'var(--bg-surface)' }}>
             <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.8rem', textAlign: 'center', margin: '2rem 0' }}>{slide.title || 'Soru'}</h2>
             
             {selectedAnswer ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--fg)', color: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem', textAlign: 'center' }}>
                    {selectedAnswer === 'TRUE' ? '✓ Doğru' : selectedAnswer === 'FALSE' ? '✗ Yanlış' : selectedAnswer}
                  </div>
                  <h3 style={{ fontSize: '1.25rem' }}>Cevabınız kaydedildi.</h3>
                  <p className="text-subtle text-sm">Öğretmenin diğer aşamaya geçmesi bekleniyor...</p>
                </div>
             ) : (
                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: slide.type === 'tf_quiz' ? '1fr' : '1fr 1fr', gridTemplateRows: slide.type === 'tf_quiz' ? '1fr 1fr' : '1fr 1fr', gap: '0.75rem' }}>
                  {slide.type === 'quiz' ? (
                     SLIDE_COLORS.map((clr, j) => (
                       <button 
                         key={j}
                         onClick={() => handleAnswer(OPTION_LABELS[j])}
                         style={{ background: clr, color: 'white', border: 'none', borderRadius: '12px', fontSize: '2.5rem', fontWeight: 800, boxShadow: '0 4px 14px rgba(0,0,0,0.1)' }}
                       >
                         {OPTION_LABELS[j]}
                       </button>
                     ))
                  ) : (
                     <>
                       <button onClick={() => handleAnswer('TRUE')} style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '12px', fontSize: '2.5rem', fontWeight: 800, boxShadow: '0 4px 14px rgba(0,0,0,0.1)' }}>DOĞRU</button>
                       <button onClick={() => handleAnswer('FALSE')} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '12px', fontSize: '2.5rem', fontWeight: 800, boxShadow: '0 4px 14px rgba(0,0,0,0.1)' }}>YANLIŞ</button>
                     </>
                  )}
                </div>
             )}
           </div>
         )}
         
         {/* Leaderboard Overlay on Student Phone */}
         {showLeaderboard && (
           <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'var(--accent)', color: 'var(--bg)' }}>
             <span style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏆</span>
             <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '2rem', textAlign: 'center', marginBottom: '0.5rem' }}>Süre Bitti!</h2>
             <p style={{ fontSize: '1.1rem', textAlign: 'center', opacity: 0.9 }}>Sonuç tablosuna (Ana Ekrana) bakın.</p>
           </div>
         )}

         {/* Canvas (receives strokes, pointer-events none so it doesn't block quiz buttons) */}
         <canvas 
            ref={canvasRef}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 3, pointerEvents: 'none' }}
         />
         </div>
      </div>

      {/* Floating Notes Button (shows if quiz mode is false or notes drawer is hidden) */}
      {!isNotesOpen && !quizMode && !showLeaderboard && (
        <button 
           onClick={() => setIsNotesOpen(true)}
           style={{ position: 'absolute', bottom: '2rem', right: '1.5rem', width: '56px', height: '56px', borderRadius: '50%', background: 'var(--fg)', color: 'var(--bg)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-lg)', zIndex: 10, cursor: 'pointer' }}
        >
          <Edit3 size={24} />
        </button>
      )}

      {/* Notes Bottom Drawer */}
      <div 
        style={{ 
          position: 'absolute', left: 0, right: 0, bottom: isNotesOpen ? 0 : '-100%', 
          height: '60vh', background: 'var(--bg-surface)', borderTop: '2px solid var(--border-strong)', 
          boxShadow: '0 -10px 40px rgba(0,0,0,0.1)', transition: 'bottom 0.3s cubic-bezier(0.16, 1, 0.3, 1)', 
          zIndex: 20, display: 'flex', flexDirection: 'column' 
        }}
      >
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg)' }}>
           <h3 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}><BookOpen size={18}/> Kendi Notlarım</h3>
           <button style={{ background: 'transparent', border: 'none', color: 'var(--fg)', display: 'flex' }} onClick={() => setIsNotesOpen(false)}><X size={20}/></button>
        </div>
        <textarea 
           value={notes}
           onChange={e => setNotes(e.target.value)}
           placeholder="Bu ders için hızlı notlar alabilirsiniz... Öğretmen görselleri de değiştirdikçe buraya dilediğinizi yazın."
           style={{ flex: 1, border: 'none', padding: '1.5rem', fontSize: '1rem', background: 'transparent', color: 'var(--fg)', outline: 'none', resize: 'none', lineHeight: '1.6' }}
        />
      </div>

    </div>
  );
}
