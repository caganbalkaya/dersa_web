import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LogIn } from 'lucide-react';

export default function StudentLobby({ socket }) {
  const navigate = useNavigate();
  const { pin: urlPin } = useParams();
  
  const [pin, setPin] = useState(urlPin || '');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const joinSession = (e) => {
    e.preventDefault();
    if (!pin || pin.length !== 6) {
      setError('Lütfen 6 haneli geçerli bir kod girin.');
      return;
    }
    if (!name.trim()) {
      setError('Lütfen isminizi girin.');
      return;
    }

    setLoading(true);
    setError('');
    
    socket.emit('join_session', { pin, studentName: name }, (response) => {
      setLoading(false);
      if (response.success) {
        // save name simply in session storage or state 
        sessionStorage.setItem('studentName', name);
        navigate(`/student/session/${pin}`);
      } else {
        setError(response.message || 'Odaya bağlanılamadı.');
      }
    });
  };

  return (
    <div className="container center-flex min-h-screen animate-fade-in" style={{ marginTop: '-4rem' }}>
      <div className="glass-card flex-col" style={{ width: '100%', maxWidth: '500px' }}>
        <h1 className="text-2xl mb-2 text-center">Derse Katıl</h1>
        <p className="text-muted mb-6 text-center">Öğretmeninizin size verdiği katılım kodunu girin.</p>
        
        {error && <div className="text-danger mb-4 text-center font-bold">{error}</div>}
        
        <form onSubmit={joinSession}>
          <div className="input-group">
            <label className="input-label">Oda Kodu</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="123456"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              maxLength={6}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Adınız Soyadınız</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Örn: Ali Yılmaz"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-lg btn-block mt-4"
            disabled={loading}
          >
            <LogIn size={20} />
            {loading ? 'Bağlanılıyor...' : 'Odaya Gir'}
          </button>
        </form>
      </div>
    </div>
  );
}
