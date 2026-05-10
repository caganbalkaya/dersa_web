import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Clock } from 'lucide-react';

export default function SessionActive({ socket }) {
  const { pin } = useParams();
  const navigate = useNavigate();
  
  const [question, setQuestion] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [results, setResults] = useState(null);
  const [studentName, setStudentName] = useState(sessionStorage.getItem('studentName') || 'Öğrenci');

  useEffect(() => {
    socket.on('new_question', (questionData) => {
      setQuestion(questionData);
      setAnswered(false);
      setSelectedAnswer(null);
      setResults(null);
    });

    socket.on('show_results', (data) => {
      setResults(data.results);
      setQuestion(null);
    });

    return () => {
      socket.off('new_question');
      socket.off('show_results');
    };
  }, [socket]);

  const submitAnswer = (answer) => {
    if (answered) return;
    
    setSelectedAnswer(answer);
    setAnswered(true);
    
    socket.emit('submit_answer', { pin, answer }, (response) => {
      if (response.success) {
        console.log('Answer submitted successfully');
      }
    });
  };

  return (
    <div className="container min-h-screen animate-fade-in center-flex flex-col">
       <div className="glass-card flex-col" style={{ width: '100%', maxWidth: '600px', textAlign: 'center' }}>
          
         {!question && !results && (
           <div style={{ padding: '3rem 1rem' }}>
             <Clock size={64} className="text-secondary mx-auto mb-4" style={{ display: 'block', animation: 'spin 4s linear infinite' }} />
             <h2 className="text-2xl font-bold mb-2">Öğretmen Bekleniyor</h2>
             <p className="text-muted">Lütfen ekrandan ayrılmayın, soru geldiğinde burada belirecektir.</p>
           </div>
         )}

         {question && !results && (
           <div style={{ padding: '1rem' }}>
             <h2 className="text-2xl font-bold mb-6 text-primary">{question.text}</h2>
             
             {!answered ? (
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                 {question.options.map((opt, i) => (
                   <button 
                     key={i} 
                     className="btn btn-outline btn-lg" 
                     style={{ minHeight: '80px', fontSize: '1.25rem' }}
                     onClick={() => submitAnswer(opt)}
                   >
                     {opt}
                   </button>
                 ))}
               </div>
             ) : (
               <div style={{ padding: '2rem 1rem', background: 'var(--bg-color)', borderRadius: 'var(--radius-lg)' }}>
                 <CheckCircle size={48} className="text-success mx-auto mb-4" style={{ display: 'block' }} />
                 <h3 className="text-xl font-bold text-success mb-2">Cevap Kaydedildi</h3>
                 <p className="text-muted">Seçiminiz: <strong>{selectedAnswer}</strong></p>
                 <p className="text-muted mt-4">Diğer arkadaşlarınızın cevaplaması bekleniyor...</p>
               </div>
             )}
           </div>
         )}

         {results && (
           <div style={{ padding: '1rem' }}>
             <h2 className="text-3xl font-bold mb-4">Sonuçlar</h2>
             
             {results.map((res, i) => {
               if (res.name === studentName) {
                 return (
                   <div key={i} style={{ 
                     background: res.isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                     border: `2px solid ${res.isCorrect ? 'var(--success)' : 'var(--danger)'}`,
                     padding: '1.5rem', 
                     borderRadius: 'var(--radius-lg)',
                     marginBottom: '1rem'
                   }}>
                     <h3 className="text-2xl mb-2" style={{ color: res.isCorrect ? 'var(--success)' : 'var(--danger)' }}>
                       {res.isCorrect ? 'Doğru Bildiniz! 🎉' : 'Yanlış Cevap 😔'}
                     </h3>
                     <div className="text-xl mt-4">Toplam Puan: <strong>{res.score}</strong></div>
                   </div>
                 );
               }
               return null;
             })}

             <div className="mt-8 text-muted">Öğretmen yeni soru gönderdiğinde ekran otomatik yenilenecektir.</div>
           </div>
         )}
         
       </div>
    </div>
  );
}
