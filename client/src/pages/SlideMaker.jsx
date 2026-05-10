import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Trash2, Copy, ChevronLeft, ChevronRight,
  Download, Play, X, Bold, Italic, AlignLeft, AlignCenter, AlignRight,
  Type, ImageIcon, Square, Circle, Maximize2, Minimize2
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// ─────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────
const SLIDE_W = 1280;
const SLIDE_H = 720;

const FONTS = ['DM Serif Display', 'DM Sans', 'Inter', 'Georgia', 'Arial'];

const BG_OPTIONS = [
  { label: 'Beyaz',        value: '#ffffff',   fg: '#111111' },
  { label: 'Koyu',         value: '#111111',   fg: '#ffffff' },
  { label: 'Lacivert',     value: '#1e3a5f',   fg: '#ffffff' },
  { label: 'Koyu Mor',     value: '#2d1b69',   fg: '#ffffff' },
  { label: 'Koyu Yeşil',   value: '#14532d',   fg: '#ffffff' },
  { label: 'Bordo',        value: '#450a0a',   fg: '#ffffff' },
  { label: 'Krem',         value: '#fef9ef',   fg: '#1c1917' },
  { label: 'Açık Gri',     value: '#f8fafc',   fg: '#0f172a' },
  { label: 'Okyanus',      value: 'linear-gradient(135deg,#0c4a6e,#0891b2)', fg: '#ffffff' },
  { label: 'Mor Degrade',  value: 'linear-gradient(135deg,#1e1b4b,#7c3aed)', fg: '#ffffff' },
  { label: 'Gün Batımı',   value: 'linear-gradient(135deg,#7f1d1d,#c2410c)', fg: '#ffffff' },
  { label: 'Orman',        value: 'linear-gradient(135deg,#064e3b,#065f46)', fg: '#ffffff' },
];

// ─────────────────────────────────────────────────────────────────────
// TEMPLATES – ready-made slide layouts
// ─────────────────────────────────────────────────────────────────────
const TEMPLATES = [
  {
    id: 'kapak',
    label: 'Kapak',
    bg: '#1e3a5f',
    elements: [
      { id: 'a', type: 'text', x: 10, y: 30, w: 80, h: 20, content: 'Sunum Başlığı', fontSize: 72, fontWeight: 'bold', fontFamily: 'DM Serif Display', textAlign: 'center', color: '#ffffff' },
      { id: 'b', type: 'text', x: 20, y: 58, w: 60, h: 10, content: 'Alt başlık veya tarih', fontSize: 28, fontWeight: 'normal', fontFamily: 'DM Sans', textAlign: 'center', color: 'rgba(255,255,255,0.7)' },
      { id: 'c', type: 'shape', shapeType: 'rect', x: 40, y: 52, w: 20, h: 0.5, fill: 'rgba(255,255,255,0.4)' },
    ],
  },
  {
    id: 'baslik-icerik',
    label: 'Başlık + İçerik',
    bg: '#ffffff',
    elements: [
      { id: 'a', type: 'shape', shapeType: 'rect', x: 0, y: 0, w: 100, h: 18, fill: '#111111' },
      { id: 'b', type: 'text', x: 5, y: 2, w: 90, h: 14, content: 'Slayt Başlığı', fontSize: 52, fontWeight: 'bold', fontFamily: 'DM Serif Display', textAlign: 'left', color: '#ffffff' },
      { id: 'c', type: 'text', x: 5, y: 22, w: 90, h: 70, content: '• Birinci madde açıklaması\n\n• İkinci önemli nokta\n\n• Üçüncü başlık', fontSize: 30, fontWeight: 'normal', fontFamily: 'DM Sans', textAlign: 'left', color: '#1e293b' },
    ],
  },
  {
    id: 'alinti',
    label: 'Alıntı',
    bg: '#111111',
    elements: [
      { id: 'a', type: 'text', x: 8, y: 15, w: 84, h: 55, content: '"Eğitim, insanların özgür olmasını sağlayan en güçlü silahtır."', fontSize: 44, fontWeight: 'normal', fontFamily: 'DM Serif Display', textAlign: 'center', color: '#ffffff' },
      { id: 'b', type: 'text', x: 20, y: 74, w: 60, h: 10, content: '— Nelson Mandela', fontSize: 24, fontWeight: 'normal', fontFamily: 'DM Sans', textAlign: 'center', color: 'rgba(255,255,255,0.5)' },
      { id: 'c', type: 'shape', shapeType: 'rect', x: 35, y: 70, w: 30, h: 0.4, fill: 'rgba(255,255,255,0.25)' },
    ],
  },
  {
    id: 'iki-sutun',
    label: 'İki Sütun',
    bg: '#f8fafc',
    elements: [
      { id: 'a', type: 'text', x: 4, y: 4, w: 92, h: 14, content: 'Karşılaştırma', fontSize: 50, fontWeight: 'bold', fontFamily: 'DM Serif Display', textAlign: 'left', color: '#0f172a' },
      { id: 'b', type: 'shape', shapeType: 'rect', x: 4, y: 18, w: 92, h: 0.4, fill: '#cbd5e1' },
      { id: 'c', type: 'text', x: 4, y: 22, w: 44, h: 68, content: 'Sol Sütun\n\n• Madde 1\n• Madde 2\n• Madde 3', fontSize: 26, fontFamily: 'DM Sans', textAlign: 'left', color: '#1e293b' },
      { id: 'd', type: 'shape', shapeType: 'rect', x: 49.5, y: 22, w: 0.4, h: 68, fill: '#cbd5e1' },
      { id: 'e', type: 'text', x: 52, y: 22, w: 44, h: 68, content: 'Sağ Sütun\n\n• Madde A\n• Madde B\n• Madde C', fontSize: 26, fontFamily: 'DM Sans', textAlign: 'left', color: '#1e293b' },
    ],
  },
  {
    id: 'bos',
    label: 'Boş',
    bg: '#ffffff',
    elements: [],
  },
];

const idEl = (extra = {}) => ({ id: Date.now() + Math.random(), ...extra });

const makeSlide = (tpl = TEMPLATES[0]) => ({
  id: Date.now() + Math.random(),
  bg: tpl.bg,
  elements: tpl.elements.map(e => ({ ...e, id: Date.now() + Math.random() })),
});

// ─────────────────────────────────────────────────────────────────────
// SLIDE CANVAS – renders a single slide, handles drag
// ─────────────────────────────────────────────────────────────────────
function SlideCanvas({ slide, scale, selected, onSelect, onUpdate, editing, setEditing, exportRef, interactive = true }) {
  const isGrad = s => s?.startsWith('linear') || s?.startsWith('radial');
  const bgStyle = isGrad(slide.bg) ? { backgroundImage: slide.bg } : { backgroundColor: slide.bg || '#fff' };

  const sorted = [...(slide.elements || [])];

  const startDrag = (e, el) => {
    if (!interactive) return;
    if (e.button !== 0) return;
    e.stopPropagation(); e.preventDefault();
    onSelect(el.id);
    const x0 = e.clientX, y0 = e.clientY, ox = el.x, oy = el.y;
    const move = mv => {
      const dx = (mv.clientX - x0) / (SLIDE_W * scale) * 100;
      const dy = (mv.clientY - y0) / (SLIDE_H * scale) * 100;
      onUpdate(el.id, { x: Math.max(0, Math.min(95, ox + dx)), y: Math.max(0, Math.min(95, oy + dy)) });
    };
    const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  const startResize = (e, el) => {
    e.stopPropagation(); e.preventDefault();
    const x0 = e.clientX, y0 = e.clientY, ow = el.w, oh = el.h;
    const move = mv => {
      const dw = (mv.clientX - x0) / (SLIDE_W * scale) * 100;
      const dh = (mv.clientY - y0) / (SLIDE_H * scale) * 100;
      onUpdate(el.id, { w: Math.max(5, ow + dw), h: Math.max(2, oh + dh) });
    };
    const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  return (
    <div
      ref={exportRef}
      onClick={() => interactive && onSelect(null)}
      style={{ width: SLIDE_W * scale, height: SLIDE_H * scale, position: 'relative', overflow: 'hidden', flexShrink: 0, ...bgStyle }}
    >
      {sorted.map(el => {
        const isSel = selected === el.id;
        return (
          <div
            key={el.id}
            onMouseDown={e => startDrag(e, el)}
            onClick={e => { e.stopPropagation(); interactive && onSelect(el.id); }}
            onDoubleClick={() => el.type === 'text' && interactive && setEditing(el.id)}
            style={{
              position: 'absolute',
              left: `${el.x}%`, top: `${el.y}%`,
              width: `${el.w}%`, height: `${el.h}%`,
              cursor: interactive ? 'move' : 'default',
              outline: isSel && interactive ? '2px solid #6366f1' : 'none',
              outlineOffset: 2,
              boxSizing: 'border-box',
              userSelect: 'none',
            }}
          >
            {el.type === 'text' && (
              editing === el.id ? (
                <textarea
                  autoFocus
                  value={el.content}
                  onChange={e => onUpdate(el.id, { content: e.target.value })}
                  onBlur={() => setEditing(null)}
                  onKeyDown={e => e.key === 'Escape' && setEditing(null)}
                  style={{
                    width: '100%', height: '100%', background: 'rgba(255,255,255,0.15)',
                    border: '1px dashed rgba(99,102,241,0.7)', outline: 'none', resize: 'none',
                    color: el.color || '#fff', fontSize: (el.fontSize || 36) * scale,
                    fontFamily: el.fontFamily || 'inherit', fontWeight: el.fontWeight || 'normal',
                    fontStyle: el.fontStyle || 'normal', textAlign: el.textAlign || 'left',
                    lineHeight: 1.3, padding: '4px', boxSizing: 'border-box',
                  }}
                />
              ) : (
                <div style={{
                  width: '100%', height: '100%',
                  color: el.color || '#111',
                  fontSize: (el.fontSize || 36) * scale,
                  fontFamily: el.fontFamily || 'DM Sans',
                  fontWeight: el.fontWeight || 'normal',
                  fontStyle: el.fontStyle || 'normal',
                  textAlign: el.textAlign || 'left',
                  lineHeight: 1.35, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                  pointerEvents: 'none',
                }}>
                  {el.content}
                </div>
              )
            )}
            {el.type === 'shape' && (
              <div style={{
                width: '100%', height: '100%',
                backgroundColor: el.fill || '#3b82f6',
                borderRadius: el.shapeType === 'circle' ? '50%' : `${el.borderRadius || 0}px`,
                clipPath: el.shapeType === 'triangle' ? 'polygon(50% 0%,0% 100%,100% 100%)' : 'none',
              }} />
            )}
            {el.type === 'image' && el.src && (
              <img src={el.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', pointerEvents: 'none' }} />
            )}

            {/* Resize handle */}
            {isSel && interactive && (
              <div
                onMouseDown={e => startResize(e, el)}
                style={{
                  position: 'absolute', right: -5, bottom: -5,
                  width: 10, height: 10, background: '#6366f1',
                  border: '2px solid #fff', borderRadius: 2, cursor: 'nwse-resize', zIndex: 10,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────
export default function SlideMaker() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('choose'); // 'choose' | 'edit'
  const [slides, setSlides] = useState([]);
  const [active, setActive] = useState(0);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [presenting, setPresenting] = useState(false);
  const [presentIdx, setPresentIdx] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [zoom] = useState(0.5);
  const imgInputRef = useRef(null);
  const exportRefs = useRef({});

  const cur = slides[active];
  const selEl = cur?.elements?.find(e => e.id === selected);

  // ── Keyboard shortcuts ───────────────────────────────────────────
  useEffect(() => {
    const h = e => {
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
      if ((e.key === 'Delete' || e.key === 'Backspace') && selected) deleteEl(selected);
      if (e.key === 'Escape') { setSelected(null); setEditing(null); }
      if (presenting) {
        if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); setPresentIdx(i => Math.min(slides.length - 1, i + 1)); }
        if (e.key === 'ArrowLeft') setPresentIdx(i => Math.max(0, i - 1));
        if (e.key === 'Escape') { setPresenting(false); document.exitFullscreen?.(); }
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [selected, presenting, presentIdx, slides.length]);

  // ── Slide ops ────────────────────────────────────────────────────
  const addSlide = () => {
    const ns = makeSlide(TEMPLATES[4]); // blank
    ns.bg = cur?.bg || '#ffffff';
    const next = [...slides]; next.splice(active + 1, 0, ns);
    setSlides(next); setActive(active + 1); setSelected(null);
  };
  const dupSlide = () => {
    const ns = { ...cur, id: Date.now(), elements: cur.elements.map(e => ({ ...e, id: Date.now() + Math.random() })) };
    const next = [...slides]; next.splice(active + 1, 0, ns);
    setSlides(next); setActive(active + 1);
  };
  const delSlide = () => {
    if (slides.length === 1) return;
    const next = slides.filter((_, i) => i !== active);
    setSlides(next); setActive(Math.min(active, next.length - 1)); setSelected(null);
  };
  const updateSlide = (field, val) =>
    setSlides(p => p.map((s, i) => i === active ? { ...s, [field]: val } : s));

  // ── Element ops ──────────────────────────────────────────────────
  const addEl = (extra) => {
    const el = { id: Date.now() + Math.random(), x: 10, y: 20, w: 50, h: 20, opacity: 1, ...extra };
    setSlides(p => p.map((s, i) => i === active ? { ...s, elements: [...s.elements, el] } : s));
    setSelected(el.id);
  };
  const updateEl = useCallback((id, changes) => {
    setSlides(p => p.map((s, i) => i === active ? { ...s, elements: s.elements.map(e => e.id === id ? { ...e, ...changes } : e) } : s));
  }, [active]);
  const deleteEl = useCallback((id) => {
    setSlides(p => p.map((s, i) => i === active ? { ...s, elements: s.elements.filter(e => e.id !== id) } : s));
    setSelected(null);
  }, [active]);
  const dupEl = () => {
    if (!selEl) return;
    const ne = { ...selEl, id: Date.now() + Math.random(), x: selEl.x + 3, y: selEl.y + 3 };
    setSlides(p => p.map((s, i) => i === active ? { ...s, elements: [...s.elements, ne] } : s));
    setSelected(ne.id);
  };

  // ── Image upload ─────────────────────────────────────────────────
  const handleImg = e => {
    const f = e.target.files?.[0]; if (!f) return;
    const reader = new FileReader();
    reader.onload = ev => {
      if (selEl?.type === 'image') updateEl(selEl.id, { src: ev.target.result });
      else addEl({ type: 'image', src: ev.target.result, w: 40, h: 50 });
    };
    reader.readAsDataURL(f);
    e.target.value = '';
  };

  // ── PDF Export ───────────────────────────────────────────────────
  const exportPDF = async () => {
    setExporting(true); setSelected(null); setEditing(null);
    await new Promise(r => setTimeout(r, 300));
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [SLIDE_W, SLIDE_H] });
    for (let i = 0; i < slides.length; i++) {
      const el = exportRefs.current[slides[i].id];
      if (!el) continue;
      const cvs = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: null });
      if (i > 0) pdf.addPage([SLIDE_W, SLIDE_H], 'landscape');
      pdf.addImage(cvs.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, SLIDE_W, SLIDE_H);
    }
    pdf.save('dersa-sunum.pdf');
    setExporting(false);
  };

  // ── Presentation ─────────────────────────────────────────────────
  const startPresent = () => {
    setPresentIdx(active); setPresenting(true);
    document.documentElement.requestFullscreen?.().catch(() => {});
  };

  // ── Template chooser ─────────────────────────────────────────────
  if (phase === 'choose') {
    return (
      <div style={{ minHeight: 'calc(100vh - 56px - 2rem)', background: 'var(--bg)', padding: '3rem 2rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <button className="btn btn-ghost btn-sm" style={{ marginBottom: '2rem' }} onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={16} /> Geri
          </button>
          <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '2.5rem', marginBottom: '0.5rem' }}>Şablon Seç</h1>
          <p className="text-subtle" style={{ marginBottom: '2.5rem', fontSize: '1rem' }}>
            Bir şablonla başlayın ve istediğiniz gibi düzenleyin.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {TEMPLATES.map(tpl => {
              const isGrad = tpl.bg?.startsWith('linear') || tpl.bg?.startsWith('radial');
              const bgS = isGrad ? { backgroundImage: tpl.bg } : { backgroundColor: tpl.bg };
              return (
                <button
                  key={tpl.id}
                  onClick={() => { setSlides([makeSlide(tpl)]); setActive(0); setSelected(null); setPhase('edit'); }}
                  style={{ border: '2px solid var(--border)', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', background: 'var(--bg)', textAlign: 'left', padding: 0, transition: 'border-color 0.2s, transform 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--fg)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div style={{ aspectRatio: '16/9', ...bgS, position: 'relative', overflow: 'hidden' }}>
                    <div style={{ transform: `scale(${220 / SLIDE_W})`, transformOrigin: 'top left', width: SLIDE_W, height: SLIDE_H, pointerEvents: 'none', position: 'absolute' }}>
                      <SlideCanvas slide={{ bg: tpl.bg, elements: tpl.elements.map((e,i) => ({...e, id: i})) }} scale={1} interactive={false} />
                    </div>
                  </div>
                  <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{tpl.label}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── Presentation mode ────────────────────────────────────────────
  if (presenting) {
    const ps = slides[presentIdx];
    const isGrad = ps?.bg?.startsWith('linear') || ps?.bg?.startsWith('radial');
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 9999, cursor: 'pointer' }} onClick={() => setPresentIdx(i => Math.min(slides.length - 1, i + 1))}>
        <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', ...(isGrad ? { backgroundImage: ps.bg } : { backgroundColor: ps.bg }) }}>
          <SlideCanvas slide={ps} scale={window.innerWidth / SLIDE_W} interactive={false} />
        </div>
        <div style={{ position: 'fixed', bottom: 20, right: 20, display: 'flex', gap: 8 }}>
          <button onMouseDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); setPresentIdx(i => Math.max(0, i - 1)); }} style={pBtn}>‹</button>
          <span style={{ ...pBtn, fontSize: '0.8rem', cursor: 'default' }}>{presentIdx + 1}/{slides.length}</span>
          <button onMouseDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); setPresentIdx(i => Math.min(slides.length - 1, i + 1)); }} style={pBtn}>›</button>
          <button onMouseDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); setPresenting(false); document.exitFullscreen?.(); }} style={{ ...pBtn, background: 'rgba(220,38,38,0.8)' }}>✕</button>
        </div>
      </div>
    );
  }

  // ── Editor ───────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 56px - 2rem)', background: 'var(--bg)', overflow: 'hidden' }}>

      {/* TOP BAR */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 1.5rem', height: 56, borderBottom: '1px solid var(--border)', background: 'var(--bg)', gap: '1rem', flexShrink: 0 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => setPhase('choose')}><ArrowLeft size={16} /> Şablonlar</button>
        <div style={{ width: 1, height: 20, background: 'var(--border)' }} />
        <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.1rem', fontWeight: 700, flex: 1 }}>Sunum Hazırla</span>

        {/* Add tools */}
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => addEl({ type: 'text', content: 'Metin', fontSize: 40, fontWeight: 'bold', fontFamily: 'DM Serif Display', color: cur?.bg?.startsWith('#f') || cur?.bg === '#ffffff' ? '#111111' : '#ffffff', w: 60, h: 18 })} title="Metin Ekle">
            <Type size={15} /> Metin
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => imgInputRef.current.click()} title="Görsel Ekle">
            <ImageIcon size={15} /> Görsel
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => addEl({ type: 'shape', shapeType: 'rect', fill: '#3b82f6', w: 25, h: 15 })} title="Dikdörtgen"><Square size={14} /></button>
          <button className="btn btn-ghost btn-sm" onClick={() => addEl({ type: 'shape', shapeType: 'circle', fill: '#8b5cf6', w: 15, h: 22 })} title="Daire"><Circle size={14} /></button>
        </div>

        <div style={{ width: 1, height: 20, background: 'var(--border)' }} />
        <button className="btn btn-ghost btn-sm" onClick={startPresent} title="Sunumu Başlat"><Play size={15} /> Sunum Yap</button>
        <button className="btn btn-primary btn-sm" onClick={exportPDF} disabled={exporting} title="PDF Olarak İndir">
          <Download size={15} /> {exporting ? 'Hazırlanıyor...' : 'PDF İndir'}
        </button>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* LEFT: Slide list */}
        <div style={{ width: 200, borderRight: '1px solid var(--border)', background: 'var(--bg-surface)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {slides.map((s, i) => {
              const isGrad = s.bg?.startsWith('linear') || s.bg?.startsWith('radial');
              return (
                <div key={s.id} onClick={() => { setActive(i); setSelected(null); }}
                  style={{ border: active === i ? '2px solid var(--fg)' : '2px solid var(--border)', borderRadius: 6, overflow: 'hidden', cursor: 'pointer', aspectRatio: '16/9', position: 'relative', background: '#fff' }}>
                  <div style={{ transform: `scale(${(190 - 16) / SLIDE_W})`, transformOrigin: 'top left', width: SLIDE_W, height: SLIDE_H, position: 'absolute', pointerEvents: 'none' }}>
                    <SlideCanvas slide={s} scale={1} interactive={false} />
                  </div>
                  <div style={{ position: 'absolute', bottom: 3, right: 5, fontSize: '0.6rem', fontWeight: 700, color: isGrad ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.3)' }}>{i + 1}</div>
                </div>
              );
            })}
          </div>
          <div style={{ padding: '0.75rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <button className="btn btn-ghost btn-sm btn-block" style={{ justifyContent: 'flex-start' }} onClick={addSlide}><Plus size={13} /> Yeni Slayt</button>
            <button className="btn btn-ghost btn-sm btn-block" style={{ justifyContent: 'flex-start' }} onClick={dupSlide}><Copy size={13} /> Kopyala</button>
            <button className="btn btn-ghost btn-sm btn-block" style={{ justifyContent: 'flex-start', color: slides.length > 1 ? 'var(--fg)' : 'var(--fg-subtle)' }} onClick={delSlide} disabled={slides.length === 1}><Trash2 size={13} /> Slaytı Sil</button>
          </div>
        </div>

        {/* CENTER: Canvas */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-raised)', overflow: 'auto', position: 'relative' }}
          onClick={() => setSelected(null)}>
          {cur && (
            <div style={{ boxShadow: 'var(--shadow-md)', transform: `scale(${zoom})`, transformOrigin: 'center center', overflow: 'hidden', borderRadius: 4 }}>
              <SlideCanvas
                slide={cur}
                scale={1}
                selected={selected}
                onSelect={setSelected}
                onUpdate={updateEl}
                editing={editing}
                setEditing={setEditing}
                interactive
              />
            </div>
          )}
          {/* Page counter */}
          <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', background: 'var(--fg)', color: 'var(--bg)', borderRadius: 20, padding: '3px 12px', fontSize: '0.8rem', fontWeight: 700 }}>
            {active + 1} / {slides.length}
          </div>
        </div>

        {/* Right: Properties */}
        <div style={{ width: 260, borderLeft: '1px solid var(--border)', background: 'var(--bg-surface)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {selEl ? (
            /* ELEMENT PROPERTIES */
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {/* Header */}
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {selEl.type === 'text' ? '📝 Metin' : selEl.type === 'image' ? '🖼 Görsel' : '🔷 Şekil'}
                </span>
                <div style={{ display: 'flex', gap: '0.3rem' }}>
                  <button className="btn btn-ghost btn-sm" onClick={dupEl} title="Kopyala"><Copy size={13} /></button>
                  <button className="btn btn-ghost btn-sm" onClick={() => deleteEl(selEl.id)} title="Sil" style={{ color: 'var(--fg)' }}><Trash2 size={13} /></button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}><X size={13} /></button>
                </div>
              </div>

              <div style={{ padding: '1.25rem 1rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                {selEl.type === 'text' && (
                  <>
                    <section>
                      <PLabel>Metin İçeriği</PLabel>
                      <textarea value={selEl.content} onChange={e => updateEl(selEl.id, { content: e.target.value })} rows={4}
                        className="field" style={{ resize: 'vertical', fontSize: '0.875rem', lineHeight: 1.5 }} />
                      <p style={{ fontSize: '0.72rem', color: 'var(--fg-subtle)', marginTop: '0.3rem' }}>
                        İpucu: Slayt üzerinde çift tıklayarak da düzenleyebilirsiniz.
                      </p>
                    </section>

                    <section>
                      <PLabel>Yazı Tipi</PLabel>
                      <select className="field" style={{ marginBottom: '0.5rem', fontSize: '0.85rem' }} value={selEl.fontFamily || 'DM Sans'} onChange={e => updateEl(selEl.id, { fontFamily: e.target.value })}>
                        {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                          <PLabel>Boyut</PLabel>
                          <input type="range" min={12} max={120} value={selEl.fontSize || 36} onChange={e => updateEl(selEl.id, { fontSize: Number(e.target.value) })} style={{ width: '100%' }} />
                          <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--fg-subtle)' }}>{selEl.fontSize || 36}px</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem' }}>
                        <button className={`btn btn-sm ${selEl.fontWeight === 'bold' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => updateEl(selEl.id, { fontWeight: selEl.fontWeight === 'bold' ? 'normal' : 'bold' })}><Bold size={13} /></button>
                        <button className={`btn btn-sm ${selEl.fontStyle === 'italic' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => updateEl(selEl.id, { fontStyle: selEl.fontStyle === 'italic' ? 'normal' : 'italic' })}><Italic size={13} /></button>
                        <div style={{ width: 1, background: 'var(--border)', margin: '0 2px' }} />
                        {['left', 'center', 'right'].map(a => (
                          <button key={a} className={`btn btn-sm ${selEl.textAlign === a ? 'btn-primary' : 'btn-ghost'}`} onClick={() => updateEl(selEl.id, { textAlign: a })}>
                            {a === 'left' ? <AlignLeft size={13} /> : a === 'center' ? <AlignCenter size={13} /> : <AlignRight size={13} />}
                          </button>
                        ))}
                      </div>
                    </section>

                    <section>
                      <PLabel>Renk</PLabel>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {['#ffffff','#111111','#1e3a5f','#ef4444','#3b82f6','#10b981','#f59e0b','#8b5cf6'].map(c => (
                          <button key={c} onClick={() => updateEl(selEl.id, { color: c })}
                            style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: selEl.color === c ? '3px solid var(--fg)' : '2px solid var(--border)', cursor: 'pointer', outline: selEl.color === c ? '2px solid var(--bg)' : 'none', outlineOffset: 1, padding: 0 }} />
                        ))}
                        <input type="color" value={selEl.color || '#ffffff'} onChange={e => updateEl(selEl.id, { color: e.target.value })}
                          style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid var(--border)', cursor: 'pointer', padding: 2 }} />
                      </div>
                    </section>
                  </>
                )}

                {selEl.type === 'shape' && (
                  <>
                    <section>
                      <PLabel>Şekil Türü</PLabel>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        {[['rect','▬ Dörtgen'],['circle','● Daire'],['triangle','▲ Üçgen']].map(([st, label]) => (
                          <button key={st} className={`btn btn-sm ${selEl.shapeType === st ? 'btn-primary' : 'btn-ghost'}`} style={{ flex: 1, fontSize: '0.72rem' }} onClick={() => updateEl(selEl.id, { shapeType: st })}>{label}</button>
                        ))}
                      </div>
                    </section>
                    <section>
                      <PLabel>Dolgu Rengi</PLabel>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        {['#ef4444','#3b82f6','#10b981','#f59e0b','#8b5cf6','#111111','#ffffff'].map(c => (
                          <button key={c} onClick={() => updateEl(selEl.id, { fill: c })}
                            style={{ width: 28, height: 28, borderRadius: 6, background: c, border: selEl.fill === c ? '3px solid var(--fg)' : '2px solid var(--border)', cursor: 'pointer', padding: 0 }} />
                        ))}
                        <input type="color" value={selEl.fill || '#3b82f6'} onChange={e => updateEl(selEl.id, { fill: e.target.value })}
                          style={{ width: 28, height: 28, borderRadius: 6, border: '2px solid var(--border)', cursor: 'pointer', padding: 2 }} />
                      </div>
                    </section>
                    <section>
                      <PLabel>Opaklık</PLabel>
                      <input type="range" min={10} max={100} value={Math.round((selEl.opacity || 1) * 100)} onChange={e => updateEl(selEl.id, { opacity: Number(e.target.value) / 100 })} style={{ width: '100%' }} />
                      <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--fg-subtle)' }}>{Math.round((selEl.opacity || 1) * 100)}%</div>
                    </section>
                  </>
                )}

                {selEl.type === 'image' && (
                  <section>
                    <PLabel>Görsel</PLabel>
                    <button className="btn btn-ghost btn-block" onClick={() => imgInputRef.current.click()} style={{ height: 60, borderStyle: 'dashed', flexDirection: 'column' }}>
                      <ImageIcon size={18} opacity={0.4} /> Görseli Değiştir
                    </button>
                  </section>
                )}
              </div>
            </div>
          ) : (
            /* SLIDE BACKGROUND when nothing is selected */
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1rem' }}>
              <div style={{ padding: '0 0 1rem', borderBottom: '1px solid var(--border)', marginBottom: '1.25rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem', color: 'var(--fg)' }}>Arka Plan</div>
                <p style={{ fontSize: '0.78rem', color: 'var(--fg-subtle)' }}>Slayt arka plan rengini seçin.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
                {BG_OPTIONS.map(opt => {
                  const isGrad = opt.value.startsWith('linear') || opt.value.startsWith('radial');
                  return (
                    <button key={opt.label} onClick={() => updateSlide('bg', opt.value)}
                      title={opt.label}
                      style={{
                        aspectRatio: '1', borderRadius: 8, border: cur?.bg === opt.value ? '3px solid var(--fg)' : '2px solid var(--border)',
                        cursor: 'pointer', padding: 0, overflow: 'hidden',
                        ...(isGrad ? { backgroundImage: opt.value } : { backgroundColor: opt.value }),
                      }} />
                  );
                })}
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                <PLabel>Özel Renk</PLabel>
                <input type="color" value={cur?.bg?.startsWith('#') ? cur.bg : '#1e3a5f'} onChange={e => updateSlide('bg', e.target.value)}
                  style={{ width: '100%', height: 40, borderRadius: 6, border: '1px solid var(--border)', cursor: 'pointer', padding: 3 }} />
              </div>

              <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                <PLabel>Hızlı Ekle</PLabel>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <button className="btn btn-ghost btn-sm btn-block" style={{ justifyContent: 'flex-start' }} onClick={() => addEl({ type: 'text', content: 'Başlık', fontSize: 56, fontWeight: 'bold', fontFamily: 'DM Serif Display', color: '#ffffff', w: 70, h: 16 })}><Type size={14} /> Büyük Başlık</button>
                  <button className="btn btn-ghost btn-sm btn-block" style={{ justifyContent: 'flex-start' }} onClick={() => addEl({ type: 'text', content: 'İçerik metni buraya gelecek.', fontSize: 26, fontFamily: 'DM Sans', color: '#ffffff', w: 80, h: 30 })}><Type size={12} /> İçerik Metni</button>
                  <button className="btn btn-ghost btn-sm btn-block" style={{ justifyContent: 'flex-start' }} onClick={() => imgInputRef.current.click()}><ImageIcon size={14} /> Görsel Yükle</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hidden export divs */}
      <div style={{ position: 'absolute', left: -9999, top: 0, pointerEvents: 'none' }}>
        {slides.map(s => (
          <div key={s.id} ref={el => { if (el) exportRefs.current[s.id] = el; }} style={{ width: SLIDE_W, height: SLIDE_H, overflow: 'hidden', position: 'relative' }}>
            <SlideCanvas slide={s} scale={1} interactive={false} />
          </div>
        ))}
      </div>

      <input type="file" accept="image/*" ref={imgInputRef} style={{ display: 'none' }} onChange={handleImg} />
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────
function PLabel({ children }) {
  return (
    <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--fg-subtle)', marginBottom: '0.4rem' }}>
      {children}
    </div>
  );
}
const pBtn = { background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: 6, padding: '0.3rem 0.65rem', cursor: 'pointer', fontSize: '1.1rem' };
