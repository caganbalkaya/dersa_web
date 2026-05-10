import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Send, CheckCircle } from 'lucide-react';

export default function TeacherActive({ socket }) {
  const { pin } = useParams();
  const navigate = useNavigate();
  
  const [students, setStudents] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState('multiple'); // multiple or boolean
  const [options, setOptions] = useState(['A', 'B', 'C', 'D']);
  const [correctAnswer, setCorrectAnswer] = useState('A');
  const [questionActive, setQuestionActive] = useState(false);

  useEffect(() => {
    socket.emit('rejoin_teacher', { pin }); // basic logic for reconnect

    socket.on('student_joined', (studentList) => {
      setStudents(studentList);
    });

    socket.on('new_answer', (answerData) => {
      setAnswers(prev => [...prev, answerData]);
    });

    return () => {
      socket.off('student_joined');
      socket.off('new_answer');
    };
  }, [socket, pin]);

  const sendQuestion = () => {
    if (!questionText.trim()) return;

    const questionData = {
      text: questionText,
      type: questionType,
      options: questionType === 'multiple' ? options : ['Doğru', 'Yanlış']
    };

    socket.emit('send_question', { pin, questionData });
    setQuestionActive(true);
    setAnswers([]); // Reset list for new question
  };

  const endQuestion = () => {
    socket.emit('end_question', { pin, correctAnswer });
    setQuestionActive(false);
  };

  return (
    <div className="container animate-fade-in flex-col">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 className="text-secondary text-xl font-bold">Oda Kodu</h2>
          <div className="pin-display mt-4">{pin}</div>
        </div>
        
        <div className="glass-card" style={{ padding: '1rem 2rem', textAlign: 'center' }}>
          <Users size={32} className="text-primary mb-2 mx-auto" style={{ display: 'block' }} />
          <div className="text-2xl font-bold">{students.length}</div>
          <div className="text-muted">Öğrenci</div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-2xl mb-4">Soru Gönder</h3>
        <div className="input-group">
          <label className="input-label">Soru Metni</label>
          <input 
            type="text" 
            className="input-field" 
            placeholder="Sorunuzu buraya yazın..."
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            disabled={questionActive}
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <button 
            className={`btn ${questionType === 'multiple' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setQuestionType('multiple')}
            disabled={questionActive}
          >
            Çoktan Seçmeli (A,B,C,D)
          </button>
          <button 
             className={`btn ${questionType === 'boolean' ? 'btn-primary' : 'btn-outline'}`}
             onClick={() => setQuestionType('boolean')}
             disabled={questionActive}
          >
            Doğru / Yanlış
          </button>
        </div>

        {questionType === 'multiple' && (
          <div className="input-group">
            <label className="input-label">Doğru Cevabı Seçin</label>
            <select 
              className="input-field" 
              value={correctAnswer} 
              onChange={(e) => setCorrectAnswer(e.target.value)}
              disabled={questionActive}
            >
              {options.map(opt => <option key={opt} value={opt}>{opt} Şıkkı</option>)}
            </select>
          </div>
        )}

        {questionType === 'boolean' && (
          <div className="input-group">
            <label className="input-label">Doğru Cevabı Seçin</label>
            <select 
              className="input-field" 
              value={correctAnswer} 
              onChange={(e) => setCorrectAnswer(e.target.value)}
              disabled={questionActive}
            >
              <option value="Doğru">Doğru</option>
              <option value="Yanlış">Yanlış</option>
            </select>
          </div>
        )}

        {!questionActive ? (
          <button className="btn btn-primary btn-lg" onClick={sendQuestion}>
            <Send size={20} /> Soruyu Gönder
          </button>
        ) : (
          <div style={{ background: 'var(--bg-color)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
            <h4 className="text-xl mb-4" style={{ color: 'var(--primary)' }}>Cevaplar Bekleniyor...</h4>
            <div className="mb-4 text-muted">Arayüzde canlı olarak kimlerin cevapladığını görebilirsiniz:</div>
            
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              {answers.map((a, index) => (
                <div key={index} style={{ padding: '0.5rem 1rem', background: 'var(--success)', color: 'white', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={16} /> {a.studentName}
                </div>
              ))}
            </div>

            <button className="btn btn-danger btn-lg" onClick={endQuestion}>
               Soruyu Bitir ve Sonuçları Göster
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
