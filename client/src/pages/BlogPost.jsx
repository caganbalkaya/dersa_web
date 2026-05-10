import React, { useState, useEffect, useContext } from 'react';
import { API_URL } from '../config';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import PublicNavbar from '../components/PublicNavbar';
import { ArrowLeft, BookOpen, Clock, Eye, MessageSquare, Share2, Link as LinkIcon } from 'lucide-react';
import 'react-quill-new/dist/quill.snow.css';

export default function BlogPost({ theme, toggleTheme }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [commentContent, setCommentContent] = useState('');
  const [commentName, setCommentName] = useState(user?.name || '');
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    fetch(`${API_URL}/api/blog/${slug}`)
      .then(r => r.json())
      .then(data => {
        if(data.error) throw new Error(data.error);
        setPost(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [slug]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPx = document.documentElement.scrollTop;
      const winHeightPx = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (winHeightPx > 0) {
        setScrollProgress((scrollPx / winHeightPx) * 100);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentContent.trim() || !commentName.trim()) return;

    try {
      const res = await fetch(`${API_URL}/api/blog/${post.id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: commentContent,
          authorName: commentName,
          authorId: user?.id || null
        })
      });
      const data = await res.json();
      if(data.success) {
        setPost(prev => ({ ...prev, comments: [data.comment, ...prev.comments] }));
        setCommentContent('');
      }
    } catch(err) {
      console.error(err);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Bağlantı kopyalandı!');
  };

  if (loading) {
    return <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Yükleniyor...</div>;
  }

  if (!post) {
    return <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Makale Bulunamadı.</div>;
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg)' }}>
      <PublicNavbar theme={theme} toggleTheme={toggleTheme} />
      
      {/* Scroll Progress Bar */}
      <div style={{ position: 'fixed', top: '88px', left: 0, height: '4px', background: 'var(--accent)', width: `${scrollProgress}%`, zIndex: 51, transition: 'width 0.1s ease-out' }} />

      {/* Hero Image Block */}
      {post.coverImage && (
         <div style={{ width: '100%', height: '50vh', minHeight: '400px', marginTop: '88px', background: 'var(--border)', position: 'relative' }}>
            <img src={post.coverImage} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(to top, var(--bg), transparent)' }}></div>
         </div>
      )}

      <div className="animate-in" style={{ padding: '2rem 5%', maxWidth: '750px', margin: post.coverImage ? '-100px auto 0 auto' : '80px auto 0 auto', flex: 1, display: 'flex', flexDirection: 'column', width: '100%', position: 'relative', zIndex: 10 }}>
        
        <button onClick={() => navigate('/blog')} className="btn btn-ghost" style={{ alignSelf: 'flex-start', marginBottom: '2rem', fontSize: '0.9rem', padding: '0.25rem 0', border: 'none', color: 'var(--fg-subtle)' }}>
          <ArrowLeft size={16} style={{ marginRight: '0.4rem' }}/> Akademiye Dön
        </button>

        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontFamily: 'DM Serif Display, serif', marginBottom: '1.5rem', lineHeight: '1.05', letterSpacing: '-0.02em', color: 'var(--fg)' }}>
          {post.title}
        </h1>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '2rem', borderBottom: '1px solid var(--border)', marginBottom: '3rem', gap: '1rem' }}>
           <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
             <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--border)', overflow: 'hidden' }}>
               {post.author?.avatar ? <img src={post.author.avatar} alt="avatar" style={{width:'100%', height:'100%', objectFit: 'cover'}}/> : null}
             </div>
             <div>
               <h4 style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.2rem' }}>{post.author?.name || 'Yazar'}</h4>
               <span className="text-sm text-subtle" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                 <span>{new Date(post.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                 <span>·</span>
                 <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Clock size={14} /> {Math.ceil(post.content.length / 800)} dk okuma</span>
               </span>
             </div>
           </div>
           
           <div style={{ display: 'flex', gap: '1rem', color: 'var(--fg-subtle)', alignItems: 'center' }}>
             <button title="Görüntülenme" className="btn btn-ghost btn-sm" style={{ pointerEvents: 'none', padding: '0.5rem' }}><Eye size={18} /> <span style={{ marginLeft: '0.3rem' }}>{post.views}</span></button>
             <a href="#comments" title="Yorumlar" className="btn btn-ghost btn-sm" style={{ padding: '0.5rem' }}><MessageSquare size={18} /> <span style={{ marginLeft: '0.3rem' }}>{post.comments?.length || 0}</span></a>
             <div style={{ width: '1px', height: '24px', background: 'var(--border)', margin: '0 0.5rem' }}></div>
             <button title="Bağlantıyı Kopyala" onClick={copyLink} className="btn btn-ghost btn-sm" style={{ padding: '0.5rem' }}><LinkIcon size={18}/></button>
             <button title="Paylaş" onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`, '_blank')} className="btn btn-ghost btn-sm" style={{ padding: '0.5rem' }}><Share2 size={18}/></button>
           </div>
        </div>

        {/* Content Body */}
        <div className="ql-editor" style={{ 
          fontSize: '1.25rem', 
          lineHeight: '1.9', 
          color: 'var(--fg)', 
          fontFamily: 'Charter, Georgia, serif', 
          marginBottom: '5rem',
          padding: 0 // Reset quill editor padding for this specific container
        }} dangerouslySetInnerHTML={{ __html: post.content }} />

        {/* Comments Section */}
        <div id="comments" style={{ borderTop: '1px solid var(--border)', paddingTop: '4rem', marginBottom: '6rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            Yanıtlar ({post.comments?.length || 0})
          </h2>

          <div style={{ marginBottom: '3rem', background: 'var(--bg-surface)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <form onSubmit={handleComment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
               {!user && (
                 <div>
                    <input className="field" required placeholder="Görünecek adınız" value={commentName} onChange={e=>setCommentName(e.target.value)} style={{ padding: '0.75rem' }} />
                 </div>
               )}
               <div>
                  <textarea className="field" rows={3} required placeholder="Ne düşünüyorsunuz?" value={commentContent} onChange={e=>setCommentContent(e.target.value)} style={{ padding: '0.75rem', resize: 'vertical' }}></textarea>
               </div>
               <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end', padding: '0.5rem 1.5rem', borderRadius: '30px' }}>
                 Yanıtla
               </button>
            </form>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
             {post.comments?.map(cmt => (
               <div key={cmt.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border) '}}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--border)', overflow: 'hidden' }}>
                      <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${cmt.authorName}`} alt="avatar" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{cmt.authorName}</div>
                      <div className="text-xs text-muted">{new Date(cmt.createdAt).toLocaleString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                    </div>
                 </div>
                 <p style={{ lineHeight: '1.6', fontSize: '1.05rem', marginTop: '0.5rem' }}>{cmt.content}</p>
               </div>
             ))}
          </div>
        </div>

      </div>
    </div>
  );
}
