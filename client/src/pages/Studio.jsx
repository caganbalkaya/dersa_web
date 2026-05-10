import React, { useState, useEffect, useRef } from 'react';
import { API_URL } from '../config';
import { Type, HelpCircle, Plus, Play, Image as ImageIcon, Edit3, Square, Circle, CheckCircle, Trash2, X, Upload, Minus, MousePointer2, Maximize, ChevronLeft, ChevronRight, Menu, Users } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import * as pdfjsLib from 'pdfjs-dist';

// Avoid worker issues by using the CDN worker matching the installed version
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const defaultSlides = [
  { id: 1, type: 'content', title: '', body: '', bgImage: null, theme: 'blackboard', pdfPages: [], currentPdfPage: 0 },
];

const SLIDE_COLORS = ['#ef4444', '#3b82f6', '#f59e0b', '#10b981'];
const OPTION_LABELS = ['A', 'B', 'C', 'D'];

export default function Studio({ socket }) {
  const [mode, setMode] = useState('EDIT'); 
  const [pin, setPin] = useState(null);
  const [slides, setSlides] = useState(defaultSlides);
  const [active, setActive] = useState(0);

  const { user } = React.useContext(AuthContext);
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClass, setSelectedClass] = useState('RANDOM');
  
  // Live State
  const [students, setStudents] = useState([]);
  const [answers, setAnswers] = useState({});
  const [quizActive, setQuizActive] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [processingPdf, setProcessingPdf] = useState(false);

  // Responsive State
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false);

  // Drawing & Tools State
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState([]); // for smoothing
  
  const [penColor, setPenColor] = useState('#ffffff');
  const [penTool, setPenTool] = useState('chalk'); // 'marker' | 'chalk' | 'eraser'
  const [drawingMode, setDrawingMode] = useState('freehand'); // 'freehand' | 'line' | 'rect' | 'circle'
  const [startPos, setStartPos] = useState(null); // tracking shape start

  const fileInputRef = useRef(null);
  const touchStartX = useRef(null);
  const boardRef = useRef(null);

  // Responsive Hook
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Reusable mid-point for quadratic bezier smoothing
  const midPointBtw = (p1, p2) => {
    return {
      x: p1.x + (p2.x - p1.x) / 2,
      y: p1.y + (p2.y - p1.y) / 2
    };
  };

  useEffect(() => {
    if(user?.id) {
       fetch(`${API_URL}/api/classrooms/teacher/${user.id}`)
         .then(r => r.json())
         .then(data => {
            if(data.success && data.classrooms) {
              setClassrooms(data.classrooms);
            }
         });
    }
  }, [user]);

  useEffect(() => {
    if (mode === 'LIVE') {
      socket.on('attendance_update', (list) => setStudents(list));
      socket.on('live_answers', (ans) => setAnswers(ans));
      socket.emit('change_slide', { pin, slide: slides[active] });
    }
    return () => {
      socket.off('attendance_update');
      socket.off('live_answers');
    };
  }, [mode, pin, socket]);

  useEffect(() => {
    if (mode === 'LIVE' && pin) {
      socket.emit('change_slide', { pin, slide: slides[active] });
      setQuizActive(false);
      setShowLeaderboard(false);
      clearCanvas(false); 
      
      const t = slides[active]?.theme;
      setPenColor(t === 'blackboard' ? '#ffffff' : '#000000');
      setPenTool(t === 'blackboard' ? 'chalk' : 'marker');
    }
  }, [active, mode, pin, socket]);

  const update = (field, value) => {
    setSlides(prev => {
      const next = [...prev];
      next[active] = { ...next[active], [field]: value };
      return next;
    });
  };

  const addSlide = type => {
    const next = [...slides, { id: Date.now(), type, title: type === 'quiz' ? 'Matematik Sorusu' : '', body: '', bgImage: null, theme: slides[active]?.theme || 'blackboard', pdfPages: [], currentPdfPage: 0 }];
    setSlides(next);
    setActive(next.length - 1);
  };

  const publishAndPlay = () => {
    let payload = {};
    if (selectedClass !== 'RANDOM') {
      payload.pin = selectedClass;
    }
    socket.emit('create_session', payload, res => {
      if (res.success) {
        setPin(res.pin);
        setMode('LIVE');
      }
    });
  };

  const clearCanvas = (emit = true) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
    }
    if (emit && pin) socket.emit('clear_canvas', { pin });
  };

  const toggleFullscreen = () => {
    const el = document.getElementById('board-container');
    if (el) {
       if (!document.fullscreenElement) {
         el.requestFullscreen().catch(err => console.log(err));
       } else {
         if (document.exitFullscreen) document.exitFullscreen();
       }
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if(!file) return;

    if (file.type === 'application/pdf') {
       setProcessingPdf(true);
       try {
         const reader = new FileReader();
         reader.onload = async (ev) => {
            const typedarray = new Uint8Array(ev.target.result);
            const pdf = await pdfjsLib.getDocument(typedarray).promise;
            const images = [];
            for (let i = 1; i <= pdf.numPages; i++) {
               const page = await pdf.getPage(i);
               // Increase scale slightly for crispness
               const viewport = page.getViewport({ scale: 2.0 });
               const cvs = document.createElement('canvas');
               cvs.width = viewport.width;
               cvs.height = viewport.height;
               await page.render({ canvasContext: cvs.getContext('2d'), viewport }).promise;
               images.push(cvs.toDataURL('image/jpeg', 0.8));
            }
            
            setSlides(prev => {
               const newSlide = {
                  id: Date.now(),
                  type: 'presentation',
                  title: file.name.replace('.pdf', ''),
                  body: '',
                  theme: 'white',
                  bgImage: null,
                  pdfPages: images,
                  currentPdfPage: 0
                };
                return [...prev, newSlide];
            });
            setProcessingPdf(false);
         };
         reader.readAsArrayBuffer(file);
       } catch (err) {
         console.error('PDF parsing error', err);
         alert('PDF okunamadı.');
         setProcessingPdf(false);
       }
    } else {
       const reader = new FileReader();
       reader.onload = (ev) => {
          update('bgImage', ev.target.result);
       };
       reader.readAsDataURL(file);
    }
  };

  // ─── Drawing Engine (Shapes & Freehand Smoothing) ───
  const startDrawing = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX || e.touches?.[0].clientX) - rect.left) / rect.width;
    const y = ((e.clientY || e.touches?.[0].clientY) - rect.top) / rect.height;
    
    setIsDrawing(true);
    setCurrentPath([{ x, y }]);
    setStartPos({ x, y });
  };
  
  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    // x and y are normalized to [0, 1] relative to the visible bounding rect
    const x = ((e.clientX || e.touches?.[0].clientX) - rect.left) / rect.width;
    const y = ((e.clientY || e.touches?.[0].clientY) - rect.top) / rect.height;

    if (drawingMode === 'freehand' || penTool === 'eraser') {
      const newPath = [...currentPath, { x, y }];
      setCurrentPath(newPath);

      const p1 = newPath[newPath.length - 2] || newPath[newPath.length - 1];
      const p2 = newPath[newPath.length - 1];

      const strokeData = { type: 'path', p1, p2, color: penTool === 'eraser' ? 'ERASER' : penColor, tool: penTool, width: penTool === 'chalk' ? 6 : 3 };
      
      ctx.globalCompositeOperation = penTool === 'eraser' ? 'destination-out' : 'source-over';
      ctx.strokeStyle = penColor;
      ctx.lineWidth = strokeData.width || 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = penTool === 'chalk' ? 0.7 : 1.0;
      if (penTool === 'eraser') { ctx.lineWidth = 25; ctx.globalAlpha = 1; }

      const w = canvas.width;
      const h = canvas.height;

      ctx.beginPath();
      ctx.moveTo(p1.x * w, p1.y * h);
      const mid = midPointBtw(p1, p2);
      ctx.quadraticCurveTo(p1.x * w, p1.y * h, mid.x * w, mid.y * h);
      ctx.lineTo(p2.x * w, p2.y * h);
      ctx.stroke();

      socket.emit('draw_stroke', { pin, stroke: strokeData });
    }
  };

  const endDrawing = (e) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    if (drawingMode !== 'freehand' && startPos) {
       const canvas = canvasRef.current;
       const rect = canvas.getBoundingClientRect();
       const x = ((e.clientX || e.changedTouches?.[0].clientX) - rect.left) / rect.width;
       const y = ((e.clientY || e.changedTouches?.[0].clientY) - rect.top) / rect.height;

       const strokeData = { type: drawingMode, start: startPos, end: { x, y }, color: penColor, tool: penTool, width: penTool === 'chalk' ? 6 : 3 };
       
       drawShapeLocally(canvas.getContext('2d'), canvas.width, canvas.height, strokeData);
       socket.emit('draw_stroke', { pin, stroke: strokeData });
    }
    
    setCurrentPath([]);
    setStartPos(null);
  };

  const drawShapeLocally = (ctx, w, h, stroke) => {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.lineCap = 'round';
    ctx.globalAlpha = stroke.tool === 'chalk' ? 0.7 : 1.0;

    const sx = stroke.start.x * w;
    const sy = stroke.start.y * h;
    const ex = stroke.end.x * w;
    const ey = stroke.end.y * h;

    ctx.beginPath();
    if (stroke.type === 'line') {
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
    } else if (stroke.type === 'rect') {
      ctx.rect(sx, sy, ex - sx, ey - sy);
    } else if (stroke.type === 'circle') {
      const radius = Math.sqrt(Math.pow(ex - sx, 2) + Math.pow(ey - sy, 2));
      ctx.arc(sx, sy, radius, 0, 2 * Math.PI);
    }
    ctx.stroke();
  };

  useEffect(() => {
    if ((mode === 'LIVE' || mode === 'EDIT') && canvasRef.current) {
       const canvas = canvasRef.current;
       canvas.width = canvas.parentElement.clientWidth;
       canvas.height = canvas.parentElement.clientHeight;
    }
  }, [mode, active, slides[active]?.bgImage]);

  // Keyboard navigation for PDF presentation slides
  useEffect(() => {
    const handleKeyDown = (e) => {
      const cur = slides[active];
      if (cur?.type !== 'presentation') return;
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        e.preventDefault();
        const next = Math.min(cur.currentPdfPage + 1, cur.pdfPages.length - 1);
        if (next !== cur.currentPdfPage) update('currentPdfPage', next);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const prev = Math.max(cur.currentPdfPage - 1, 0);
        if (prev !== cur.currentPdfPage) update('currentPdfPage', prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [active, slides]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEndSwipe = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    const cur = slides[active];
    if (cur?.type !== 'presentation') return;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // swiped left → next
        const next = Math.min(cur.currentPdfPage + 1, cur.pdfPages.length - 1);
        if (next !== cur.currentPdfPage) update('currentPdfPage', next);
      } else {
        // swiped right → prev
        const prev = Math.max(cur.currentPdfPage - 1, 0);
        if (prev !== cur.currentPdfPage) update('currentPdfPage', prev);
      }
    }
    touchStartX.current = null;
  };


  const cur = slides[active];
  
  // Board Styling Engines
  let boardContainerStyle = { background: 'transparent' };
  let boardInnerStyle = { background: '#ffffff', boxShadow: 'var(--shadow-md)', borderRadius: '4px' };

  if (cur?.theme === 'blackboard') {
    boardContainerStyle = { background: '#1c1c1c' };
    boardInnerStyle = { 
      background: '#23372b',
      border: '18px solid #6b4423',
      borderRadius: '6px',
      boxShadow: 'inset 0 0 40px rgba(0,0,0,0.6), 0 10px 30px rgba(0,0,0,0.5)',
      backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.2) 100%)'
    };
  } else if (cur?.theme === 'whiteboard') {
    boardContainerStyle = { background: '#e5e7eb' };
    boardInnerStyle = {
      background: '#ffffff',
      border: '12px solid #cbd5e1',
      borderRadius: '8px',
      borderColor: '#f1f5f9 #94a3b8 #94a3b8 #f1f5f9',
      boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
    };
  } else if (cur?.theme === 'white') {
     boardContainerStyle = { background: '#e2e8f0' };
     boardInnerStyle = { background: '#ffffff' };
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '260px 1fr 300px', height: 'calc(100vh - 56px - 2rem)', border: '1px solid var(--border)', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>
      
      {/* ─── LEFT: Slides Control ─── */}
      <div style={{ 
         borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', background: 'var(--bg-surface)',
         ...(isMobile ? { position: 'absolute', zIndex: 50, top: 0, bottom: 0, left: leftDrawerOpen ? 0 : '-300px', width: '260px', transition: 'left 0.3s', boxShadow: '5px 0 20px rgba(0,0,0,0.1)' } : {})
      }}>
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
             {mode === 'LIVE' && <span className="badge" style={{ background: '#ef4444', color: 'white', border: 'none', marginBottom: '0.5rem' }}><span style={{display:'inline-block', width:6, height:6, background:'white', borderRadius:'50%', marginRight:4}}/>CANLI YAYIN</span>}
             <h3 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.4rem', marginBottom: '0.25rem', color: 'var(--fg)' }}>Oturum Slaytları</h3>
             {mode === 'LIVE' && <span style={{ fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.05em', color: 'var(--fg-subtle)' }}>KATILIM PIN: <strong style={{ color: 'var(--accent)'}}>{pin}</strong></span>}
          </div>
          {isMobile && <button className="btn btn-ghost btn-sm" onClick={() => setLeftDrawerOpen(false)}><X size={20}/></button>}
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {slides.map((s, i) => (
            <div key={s.id} onClick={() => { setActive(i); if(isMobile) setLeftDrawerOpen(false); }} style={{ padding: '1rem', borderBottom: '1px solid var(--border)', cursor: 'pointer', background: active === i ? (mode==='LIVE' ? 'var(--bg)' : 'var(--bg-raised)') : 'transparent', borderLeft: active === i ? '4px solid var(--accent)' : '4px solid transparent', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '28px', height: '28px', background: active===i?'var(--fg)':'var(--border)', color: active===i?'var(--bg)':'var(--fg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700 }}>{i + 1}</div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                 <div style={{ fontSize: '0.95rem', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{s.title || 'Boş Tahta'}</div>
                 <div className="text-xs text-subtle">{s.type === 'quiz' ? 'İnteraktif Süreli Soru' : (s.theme === 'blackboard' ? 'Kara Tahta' : 'Beyaz Tahta')}</div>
              </div>
            </div>
          ))}
        </div>
        
        {mode === 'EDIT' ? (
           <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button className="btn btn-ghost btn-sm btn-block" onClick={() => addSlide('content')} style={{ justifyContent: 'flex-start', padding: '0.75rem' }}><Plus size={14} /> Yeni Boş Tahta</button>
              <button className="btn btn-ghost btn-sm btn-block" onClick={() => addSlide('quiz')} style={{ justifyContent: 'flex-start', padding: '0.75rem' }}><HelpCircle size={14} /> Yeni Test (4 Şık)</button>
              <button className="btn btn-ghost btn-sm btn-block" onClick={() => addSlide('tf_quiz')} style={{ justifyContent: 'flex-start', padding: '0.75rem' }}><CheckCircle size={14} /> Doğru / Yanlış Oyunu</button>
              
              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--fg-subtle)' }}>Öğrenci Katılım Modu</label>
                <select className="field btn-sm" value={selectedClass} onChange={e => setSelectedClass(e.target.value)} style={{ width: '100%', padding: '0.5rem', background: 'var(--bg)' }}>
                  <option value="RANDOM">Hızlı Sınıf (Rastgele PIN - Geçici)</option>
                  {classrooms.map(c => (
                    <option key={c.id} value={c.code}>{c.name} ({c.code})</option>
                  ))}
                </select>
              </div>

              <button className="btn btn-primary btn-block" onClick={publishAndPlay} style={{ marginTop: '0.5rem' }}><Play size={16} /> Ders Yayınını Başlat</button>
           </div>
        ) : (
           <button className="btn btn-ghost" style={{ margin: '1rem', border: '1px solid var(--border)' }} onClick={() => { setMode('EDIT'); setPin(null); }}>Yayını Bitir / Çık</button>
        )}
      </div>

      {isMobile && leftDrawerOpen && <div onClick={() => setLeftDrawerOpen(false)} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 45 }}></div>}

      {/* ─── CENTER: Real Workspace ─── */}
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden', ...boardContainerStyle }}>
        
        {/* Top Board Toolbar */}
        <div style={{ padding: '0.5rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg)', zIndex: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', borderBottom: '1px solid var(--border)' }}>
           
           <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              {isMobile && <button className="btn btn-ghost btn-sm" onClick={() => setLeftDrawerOpen(true)}><Menu size={20}/></button>}
              <button className="btn btn-ghost btn-sm" onClick={toggleFullscreen} title="Tam Ekran Çizim"><Maximize size={16}/></button>
              <div style={{ width: '1px', height: '20px', background: 'var(--border)', margin: '0 0.5rem' }}></div>
              
              <span className="text-xs text-subtle font-semibold uppercase tracking-wider mr-2 hide-on-mobile">Araçlar</span>
              <button className={`btn btn-sm ${drawingMode === 'freehand' && penTool !== 'eraser' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => {setDrawingMode('freehand'); setPenTool(cur?.theme === 'blackboard' ? 'chalk' : 'marker');}} title="Serbest Çizim"><Edit3 size={14}/></button>
              <button className={`btn btn-sm ${drawingMode === 'line' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setDrawingMode('line')} title="Doğru Çiz"><Minus size={14}/></button>
              <button className={`btn btn-sm ${drawingMode === 'rect' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setDrawingMode('rect')} title="Kare Çiz"><Square size={14}/></button>
              <button className={`btn btn-sm ${drawingMode === 'circle' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setDrawingMode('circle')} title="Çember Çiz"><Circle size={14}/></button>

              <div style={{ width: '1px', height: '20px', background: 'var(--border)', margin: '0 0.5rem' }}></div>
              
              {/* Colors */}
              {['#ffffff', '#000000', '#ef4444', '#3b82f6', '#10b981', '#f59e0b'].map(c => (
                <button key={c} onClick={() => {setPenColor(c); setPenTool(cur?.theme==='blackboard'?'chalk':'marker'); setDrawingMode('freehand');}} style={{ width: 22, height: 22, borderRadius: '50%', background: c, border: penColor === c && penTool !== 'eraser' ? '2px solid var(--accent)' : '1px solid rgba(0,0,0,0.1)', cursor: 'pointer', outline: penColor===c ? '2px solid var(--bg)' : 'none', flexShrink: 0 }} />
              ))}

              <div style={{ width: '1px', height: '20px', background: 'var(--border)', margin: '0 0.5rem' }}></div>
              <button className={`btn btn-sm ${penTool === 'eraser' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setPenTool('eraser')} title="Silgi"><X size={14}/></button>
              <button className="btn btn-ghost btn-sm text-subtle hover:text-red-500" onClick={() => clearCanvas(true)} title="Tahtayı Tamamen Sil"><Trash2 size={14}/></button>
           </div>

           {/* Slide Actions / Customization */}
           <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              {mode === 'EDIT' && (
                <>
                  <select className="field hide-on-mobile" style={{ width: 'auto', padding: '0.3rem 0.5rem', background: 'var(--bg-surface)', fontSize: '0.85rem' }} value={cur?.theme || 'blackboard'} onChange={(e) => update('theme', e.target.value)}>
                    <option value="blackboard">Kara Tahta</option>
                    <option value="whiteboard">Beyaz Tahta</option>
                    <option value="white">Sade</option>
                  </select>
                  <button className="btn btn-ghost btn-sm" disabled={processingPdf} onClick={() => fileInputRef.current.click()}><Upload size={14} /> <span className="hide-on-mobile" style={{ marginLeft: 4 }}>{processingPdf ? 'Ayıklanıyor...' : 'Arka Plan / PDF'}</span></button>
                  <input type="file" accept="image/*,.pdf" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />
                </>
              )}

              {mode === 'LIVE' && (cur?.type === 'quiz' || cur?.type === 'tf_quiz') && !showLeaderboard && (
                <>
                  <button className={`btn btn-sm ${quizActive ? 'btn-primary' : 'btn-ghost'}`} style={{ border: '1px solid var(--border)' }} onClick={() => { setQuizActive(!quizActive); socket.emit('toggle_quiz', { pin, isActive: !quizActive }); }}>
                    {quizActive ? 'Durdur' : 'Soruyu Aç'}
                  </button>
                  {quizActive && <button className="btn btn-primary btn-sm" onClick={() => {setQuizActive(false); setShowLeaderboard(true); socket.emit('show_results', {pin});}}><CheckCircle size={14}/></button>}
                </>
              )}
              {isMobile && mode === 'LIVE' && <button className="btn btn-ghost btn-sm" onClick={() => setRightDrawerOpen(true)}><Users size={20}/></button>}
           </div>
        </div>

        {/* WORKSPACE AREA */}
        <div style={{ flex: 1, padding: cur?.theme === 'white' ? '0' : (isMobile ? '0.5rem' : '2.5rem'), display: 'flex' }}>
           
           <div id="board-container" ref={boardRef} tabIndex={0} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEndSwipe} style={{ flex: 1, position: 'relative', overflow: 'hidden', outline: 'none', ...boardInnerStyle, transition: 'background-image 0.4s ease' }}>
             
             {cur?.type === 'presentation' ? (
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-surface)' }}>
                   {/* Presentation UI */}
                   <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                      <img className="animate-in" key={cur.currentPdfPage} src={cur.pdfPages[cur.currentPdfPage]} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', boxShadow: 'var(--shadow-md)', borderRadius: '4px' }} alt="PDF Slide" />
                   </div>
                   {/* Navigation Player */}
                   {mode === 'EDIT' && (
                     <div style={{ height: '60px', background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '0 2rem' }}>
                         <button className="btn btn-ghost btn-sm" disabled={cur.currentPdfPage === 0} onClick={() => update('currentPdfPage', cur.currentPdfPage - 1)}><ChevronLeft size={18}/> Önceki</button>
                         <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--fg)', minWidth: '60px', textAlign: 'center' }}>{cur.currentPdfPage + 1} / {cur.pdfPages.length}</span>
                         <input type="range" min={0} max={cur.pdfPages.length - 1} value={cur.currentPdfPage} onChange={(e) => update('currentPdfPage', parseInt(e.target.value))} style={{ flex: 1, maxWidth: '300px' }} />
                         <button className="btn btn-ghost btn-sm" disabled={cur.currentPdfPage === cur.pdfPages.length - 1} onClick={() => update('currentPdfPage', cur.currentPdfPage + 1)}>Sonraki <ChevronRight size={18}/></button>
                     </div>
                   )}
                </div>
             ) : (
                <>
                   {cur?.bgImage && (
                      <img key={cur.bgImage} className="animate-in" src={cur.bgImage} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain', zIndex: 0, pointerEvents: 'none' }} alt="Presentation"/>
                   )}

                   {cur?.type === 'quiz' && !showLeaderboard && mode === 'EDIT' && (
                       <div style={{ position: 'absolute', bottom: '2rem', left: '2rem', right: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem', zIndex: 5 }}>
                         {SLIDE_COLORS.map((c, j) => <div key={j} style={{ background: c, padding: '1rem', color: 'white', fontWeight: 800, fontSize: '1.5rem', borderRadius: '8px', textAlign: 'center', opacity: 0.8 }}>{OPTION_LABELS[j]}</div>)}
                       </div>
                   )}
                   {cur?.type === 'tf_quiz' && !showLeaderboard && mode === 'EDIT' && (
                       <div style={{ position: 'absolute', bottom: '2rem', left: '2rem', right: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', zIndex: 5 }}>
                         <div style={{ background: '#10b981', padding: '1.5rem', color: 'white', fontWeight: 800, fontSize: '2rem', borderRadius: '12px', textAlign: 'center', opacity: 0.8 }}>DOĞRU</div>
                         <div style={{ background: '#ef4444', padding: '1.5rem', color: 'white', fontWeight: 800, fontSize: '2rem', borderRadius: '12px', textAlign: 'center', opacity: 0.8 }}>YANLIŞ</div>
                       </div>
                   )}

                   {showLeaderboard && (
                     <div style={{ position: 'absolute', zIndex: 15, background: 'var(--bg-surface)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', padding: '3rem', borderRadius: '12px', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)', textAlign: 'center', minWidth: isMobile ? '90%' : '400px', color: 'var(--fg)' }}>
                        <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '2.5rem', marginBottom: '2rem' }}>Podyum İlk 5</h2>
                        {students.slice(0, 5).map((s, idx) => (
                          <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid var(--border)', fontSize: '1.2rem', fontWeight: idx === 0 ? 800 : 500, color: idx === 0 ? 'var(--accent)' : 'var(--fg)' }}>
                             <span>{idx + 1}. {s.name}</span>
                             <span>{Math.floor(Math.random() * 50) + 10} Puan</span>
                          </div>
                        ))}
                        <button className="btn btn-ghost mt-4" onClick={() => setShowLeaderboard(false)}>Kapat</button>
                     </div>
                   )}

                   <canvas 
                      ref={canvasRef}
                      onMouseDown={startDrawing}
                      onMouseUp={endDrawing}
                      onMouseMove={draw}
                      onMouseLeave={endDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={endDrawing}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10, cursor: penTool === 'eraser' ? 'cell' : 'crosshair' }}
                   />
                </>
             )}

           </div>

        </div>
      </div>

      {isMobile && rightDrawerOpen && <div onClick={() => setRightDrawerOpen(false)} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 45 }}></div>}

      {/* ─── RIGHT: Attendance ─── */}
      <div style={{ 
         borderLeft: '1px solid var(--border)', background: 'var(--bg-surface)', display: mode === 'LIVE' ? 'flex' : 'none', flexDirection: 'column',
         ...(isMobile ? { position: 'absolute', zIndex: 50, top: 0, bottom: 0, right: rightDrawerOpen ? 0 : '-300px', width: '260px', transition: 'right 0.3s', boxShadow: '-5px 0 20px rgba(0,0,0,0.1)' } : {})
      }}>
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'space-between', flex: 1 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>Yoklama</span>
            <span className="badge" style={{ fontSize: '1rem' }}>{students.length}</span>
          </h4>
          {isMobile && <button className="btn btn-ghost btn-sm ml-2" onClick={() => setRightDrawerOpen(false)}><X size={16}/></button>}
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
           {students.length === 0 ? (
             <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--fg-subtle)' }}>
               <p className="text-sm">Sınıf boş.</p>
               <p className="text-xs mt-2">Öğrenciler PIN: <strong>{pin}</strong> ile katılabilir.</p>
             </div>
           ) : (
             students.map(s => {
               const gaveAnswer = answers[s.id];
               return (
                 <div key={s.id} style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '10px', height: '10px', background: 'var(--accent)', borderRadius: '50%' }}></div>
                      <span style={{ fontSize: '1rem', fontWeight: 500 }}>{s.name}</span>
                   </div>
                   {gaveAnswer && quizActive && <CheckCircle size={16} color="var(--accent)"/>}
                 </div>
               )
             })
           )}
        </div>
      </div>
      
      {mode === 'EDIT' && !isMobile && (
        <div style={{ borderLeft: '1px solid var(--border)', background: 'var(--bg-surface)', padding: '2rem 1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-subtle)' }}>
           <MousePointer2 size={32} opacity={0.3} style={{ marginBottom: '1rem' }} />
           <p className="text-sm">Derse başlamadan önce test tahtanızda çizim yapabilirsiniz.</p>
           <p className="text-xs mt-4 opacity-70">Sağlama aracı, otomatik düzleştirici ile yumuşak el yazısı sunar.</p>
        </div>
      )}

    </div>
  );
}
