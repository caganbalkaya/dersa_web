import React, { useState, useEffect, useContext, useRef } from 'react';
import { API_URL } from '../config';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Send, ImageIcon, AlignLeft, Type, Link, List, Trash2, Eye, FileText, PlusCircle } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
    ['link', 'image', 'video'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'align': [] }],
    ['clean']
  ],
};

export default function WritePost() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('manager'); // 'manager' | 'create'
  
  // Create Post State
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  // Manager State
  const [myPosts, setMyPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  useEffect(() => {
    if (activeTab === 'manager' && user) {
      fetchMyPosts();
    }
  }, [activeTab, user]);

  const fetchMyPosts = async () => {
    setLoadingPosts(true);
    try {
      const res = await fetch(`${API_URL}/api/blog/my-posts/${user.id}`);
      const data = await res.json();
      if (data.success) {
        setMyPosts(data.posts);
      }
    } catch (err) {
      console.error('Error fetching posts', err);
    }
    setLoadingPosts(false);
  };

  const deletePost = async (id) => {
    if(!window.confirm('Bu makaleyi silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`${API_URL}/api/blog/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMyPosts(prev => prev.filter(p => p.id !== id));
      }
    } catch(err) {
      console.error(err);
    }
  };

  const generateSlug = (text) => {
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };

  const handleCoverUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => setCoverImage(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content || !user) return;
    setLoading(true);
    
    try {
      // payload is increased to 50mb on server, large coverImage and big rich text is okay
      const res = await fetch(`${API_URL}/api/blog`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
            title,
            slug: generateSlug(title) + '-' + Math.floor(Math.random() * 1000),
            content,
            excerpt,
            coverImage,
            authorId: user.id
         })
      });

      const data = await res.json();

      if (res.ok) {
         alert('Makale başarıyla yayınlandı!');
         setTitle(''); setContent(''); setExcerpt(''); setCoverImage(null);
         setActiveTab('manager');
      } else {
         alert('Makale yayınlanamadı: ' + (data.error || 'Bilinmeyen hata'));
      }
    } catch (err) {
      console.error(err);
      alert('Sunucuya ulaşılamıyor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', paddingBottom: '4rem' }}>
      
      <div style={{ paddingBottom: '1.5rem', marginBottom: '2.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <span className="badge mb-2">DERSA AKADEMİ YAZAR PANELİ</span>
          <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '2.25rem', marginBottom: '0.2rem' }}>İçerik Stüdyosu</h1>
          <p className="text-subtle">Makalelerinizi ve analizlerinizi yönetin, yeni içerikler yayınlayın.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', background: 'var(--bg-surface)', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
           <button 
             className={`menu-item ${activeTab === 'manager' ? 'active' : ''}`} 
             onClick={() => setActiveTab('manager')}
             style={{ margin: 0, fontWeight: activeTab === 'manager' ? 600 : 500, background: activeTab === 'manager' ? 'var(--bg-raised)' : 'transparent' }}
           >
             <FileText size={16} /> Yazılarım ve İstatistikler
           </button>
           <button 
             className={`menu-item ${activeTab === 'create' ? 'active' : ''}`} 
             onClick={() => setActiveTab('create')}
             style={{ margin: 0, fontWeight: activeTab === 'create' ? 600 : 500, background: activeTab === 'create' ? 'var(--bg-raised)' : 'transparent' }}
           >
             <PlusCircle size={16} /> Yeni Makale Yaz
           </button>
        </div>
      </div>

      {activeTab === 'manager' ? (
        <div>
          {loadingPosts ? (
            <div>Makaleler yükleniyor...</div>
          ) : myPosts.length === 0 ? (
            <div style={{ padding: '4rem', textAlign: 'center', background: 'var(--bg-surface)', borderRadius: '12px', border: '1px dashed var(--border-strong)' }}>
              <p className="text-subtle mb-4">Henüz yayınlanmış bir makaleniz bulunmuyor.</p>
              <button className="btn btn-primary" onClick={() => setActiveTab('create')}>İlk Makalemi Yaz</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {myPosts.map(post => (
                <div key={post.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem', background: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border)', transition: 'transform 0.2s', cursor: 'pointer' }} className="hover:border-accent">
                  <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flex: 1 }}>
                     {post.coverImage ? (
                        <div style={{ width: '120px', height: '80px', borderRadius: '8px', overflow: 'hidden', background: 'var(--border)' }}>
                           <img src={post.coverImage} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                     ) : (
                        <div style={{ width: '120px', height: '80px', borderRadius: '8px', background: 'var(--bg-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-subtle)' }}>
                           <ImageIcon size={24} />
                        </div>
                     )}
                     <div>
                       <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.4rem', fontFamily: 'DM Serif Display, serif' }}>{post.title}</h3>
                       <div className="text-sm text-subtle" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                         <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                         <span style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}><Eye size={14} /> {post.views} Okunma</span>
                         <span style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}><FileText size={14} /> {post._count?.comments || 0} Yorum</span>
                       </div>
                     </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => window.open(`/blog/${post.slug}`, '_blank')}>Görüntüle</button>
                    <button className="btn btn-ghost btn-sm text-red-500 hover:bg-red-50" onClick={(e) => {e.stopPropagation(); deletePost(post.id);}}><Trash2 size={16}/></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
             <button className="btn btn-primary" onClick={handleSubmit} disabled={loading || !title || !content}>
               {loading ? 'Yayınlanıyor...' : <><Send size={16} /> Gönder ve Yayınla</>}
             </button>
          </div>

          <div style={{ position: 'relative' }}>
             {coverImage && (
                <div style={{ width: '100%', height: '300px', borderRadius: '12px', overflow: 'hidden', marginBottom: '2rem', position: 'relative' }}>
                   <img src={coverImage} alt="Cover preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                   <button className="btn btn-sm btn-ghost" style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.5)', color: 'white' }} onClick={() => setCoverImage(null)}><Trash2 size={14}/></button>
                </div>
             )}
             {!coverImage && (
                <div 
                   onClick={() => fileInputRef.current.click()}
                   style={{ width: '100%', height: '200px', borderRadius: '12px', border: '2px dashed var(--border-strong)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--fg-subtle)', marginBottom: '2rem', background: 'var(--bg-surface)' }}
                >
                   <ImageIcon size={32} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                   <span style={{ fontWeight: 600 }}>Kapak Görseli Yükle</span>
                   <span className="text-xs mt-2 opacity-70">1920x1080 yatay format önerilir</span>
                </div>
             )}
             <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleCoverUpload} />
          </div>

          {/* Title Input */}
          <div>
            <input 
              type="text" 
              placeholder="Makale Başlığı"
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={{ 
                width: '100%', 
                background: 'transparent', 
                border: 'none', 
                borderBottom: '2px solid var(--border-strong)', 
                fontSize: '2.5rem', 
                fontFamily: 'DM Serif Display, serif', 
                color: 'var(--fg)', 
                paddingBottom: '0.5rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Excerpt Input */}
          <div>
            <textarea 
              className="field" 
              rows={2} 
              placeholder="Kısa Özet veya Alt Başlık"
              value={excerpt}
              onChange={e => setExcerpt(e.target.value)}
              style={{ fontSize: '1.25rem', resize: 'vertical', border: 'none', background: 'var(--bg-surface)', fontFamily: 'DM Serif Display, serif' }}
            />
          </div>

          {/* Zengin Metin (Rich Text Editor) */}
          <div style={{ background: 'var(--bg-surface)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
            <ReactQuill 
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules}
              style={{ minHeight: '400px', fontSize: '1.15rem', fontFamily: 'Charter, Georgia, serif' }}
              placeholder="Hikayenizi anlatın..."
            />
          </div>
        </div>
      )}
    </div>
  );
}
