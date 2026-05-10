import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';

export default function TeacherDashboard({ socket }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const startSession = () => {
    setLoading(true);
    socket.emit('create_session', (response) => {
      setLoading(false);
      if (response.success) {
        navigate(`/teacher/session/${response.pin}`);
      }
    });
  };

  return (
    <div className="container center-flex min-h-screen animate-fade-in" style={{ marginTop: '-4rem' }}>
      <div className="glass-card flex-col" style={{ width: '100%', maxWidth: '600px', textAlign: 'center' }}>
        <h1 className="text-4xl mb-2">Öğretmen Paneli</h1>
        <p className="text-muted mb-6">Yeni bir interaktif ders oturumu başlatın ve öğrencilerinizi davet edin.</p>
        
        <div style={{ padding: '2rem', background: 'var(--bg-color)', borderRadius: 'var(--radius-md)' }}>
          <button 
            className="btn btn-primary btn-lg" 
            onClick={startSession}
            disabled={loading}
          >
            <Play size={24} />
            {loading ? 'Oluşturuluyor...' : 'Yeni Ders Başlat'}
          </button>
        </div>
      </div>
    </div>
  );
}
