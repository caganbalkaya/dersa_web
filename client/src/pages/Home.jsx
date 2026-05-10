import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Trophy, Zap } from 'lucide-react';

const featured = [
  {
    tag: 'Yarışma',
    title: 'Osmanlı Kuruluş Dönemi',
    author: 'Ahmet Yılmaz',
    subject: 'Tarih · 9. Sınıf',
    plays: '1.2B',
  },
  {
    tag: 'Slayt + Soru',
    title: 'İklim Tipleri ve Özellikleri',
    author: 'Zeynep Kaya',
    subject: 'Coğrafya · 10. Sınıf',
    plays: '874',
  },
  {
    tag: 'Soru Seti',
    title: 'Olasılık ve İstatistik',
    author: 'Mustafa Can',
    subject: 'Matematik · 11. Sınıf',
    plays: '3.2B',
  },
  {
    tag: 'Yarışma',
    title: 'Hücre ve Organeller',
    author: 'Selin Akın',
    subject: 'Biyoloji · 9. Sınıf',
    plays: '450',
  },
];

const leaders = [
  { initials: 'SA', name: 'Dr. Selin Akın',  subject: 'Biyoloji', pts: '14.500' },
  { initials: 'KY', name: 'Kerem Yücel',     subject: 'Tarih',    pts: '12.200' },
  { initials: 'FG', name: 'Fatma Gül',       subject: 'Matematik',pts: '10.950' },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div>
      {/* ── Hero ──────────────────────────────── */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          alignItems: 'end',
          gap: '2rem',
          borderBottom: '1px solid var(--border)',
          paddingBottom: '2rem',
          marginBottom: '2.5rem',
        }}
      >
        <div>
          <div
            className="tag tag-filled mb-4"
            style={{ display: 'inline-flex' }}
          >
            Öğretmenlerin Platformu
          </div>

          <h1 style={{ marginBottom: '0.75rem', maxWidth: '600px' }}>
            Sınıfı canlı tutan<br />
            <em style={{ fontStyle: 'italic' }}>tek</em> platform.
          </h1>

          <p style={{ maxWidth: '500px', fontSize: '1.05rem', marginBottom: '1.75rem' }}>
            Binlerce hazır ders, slayt ve yarışma — hiç hazırlık gerektirmeden.
            Öğretmenler üretir, topluluk büyür.
          </p>

          <div className="flex gap-3">
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/explore')}>
              İçerikleri Keşfet <ArrowRight size={16} />
            </button>
            <button className="btn btn-ghost btn-lg" onClick={() => navigate('/studio')}>
              Ders Oluştur
            </button>
          </div>
        </div>

        {/* Quick stats column */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1px',
            minWidth: '180px',
            border: '1px solid var(--border)',
          }}
        >
          {[
            { icon: <BookOpen size={14} />, label: 'İçerik', value: '24.000+' },
            { icon: <Zap size={14} />,      label: 'Aktif Öğretmen', value: '8.400+' },
            { icon: <Trophy size={14} />,   label: 'Oturum',  value: '1,2M' },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                padding: '0.9rem 1.1rem',
                background: 'var(--bg-surface)',
                borderBottom: i < 2 ? '1px solid var(--border)' : 'none',
              }}
            >
              <div className="flex items-center gap-2 text-subtle mb-1" style={{ fontSize: '0.72rem', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>
                {s.icon} {s.label}
              </div>
              <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.6rem', color: 'var(--fg)', lineHeight: 1 }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Body: two-column ─────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: '2rem', alignItems: 'start' }}>

        {/* Left: Featured */}
        <div>
          <div className="section-title">
            <h3>Öne Çıkan İçerikler</h3>
            <a href="/explore">Tümünü gör →</a>
          </div>

          <div className="grid grid-2" style={{ gap: '1px', outline: '1px solid var(--border)' }}>
            {featured.map((item, i) => (
              <div
                key={i}
                className="card-hover"
                style={{
                  background: 'var(--bg-surface)',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  cursor: 'pointer',
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="tag">{item.tag}</span>
                  <span
                    className="text-subtle text-xs"
                    style={{ fontWeight: 500 }}
                  >
                    ▶ {item.plays} oynanma
                  </span>
                </div>

                <div>
                  <h3 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.1rem', marginBottom: '0.2rem' }}>
                    {item.title}
                  </h3>
                  <p className="text-subtle text-sm" style={{ margin: 0 }}>{item.subject}</p>
                </div>

                <div
                  className="flex items-center justify-between"
                  style={{
                    paddingTop: '0.75rem',
                    borderTop: '1px solid var(--border)',
                  }}
                >
                  <span className="text-xs text-muted">{item.author}</span>
                  <button className="btn btn-primary btn-sm">Başlat</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Leaderboard */}
        <div>
          <div className="section-title">
            <h3>Haftalık Liderler</h3>
            <a href="/explore">Tümü →</a>
          </div>

          <div className="card">
            {leaders.map((l, i) => (
              <div
                key={i}
                className="flex items-center gap-3"
                style={{
                  padding: '0.9rem 1rem',
                  borderBottom: i < leaders.length - 1 ? '1px solid var(--border)' : 'none',
                }}
              >
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    background: 'var(--bg-raised)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {l.initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="font-semibold text-sm" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {l.name}
                  </div>
                  <div className="text-xs text-subtle">{l.subject}</div>
                </div>
                <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1rem', fontWeight: 400, flexShrink: 0 }}>
                  {l.pts}
                </div>
              </div>
            ))}

            <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border)' }}>
              <button className="btn btn-ghost btn-sm btn-block">
                Tam Sıralama
              </button>
            </div>
          </div>

          {/* CTA Block */}
          <div
            className="card mt-4"
            style={{
              padding: '1.25rem',
              borderLeft: '3px solid var(--fg)',
            }}
          >
            <h4 className="mb-2" style={{ fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Öğretmen misiniz?
            </h4>
            <p className="text-sm" style={{ margin: '0 0 1rem' }}>
              İçerik oluşturun, puan kazanın ve binlerce öğrenciye ulaşın.
            </p>
            <button className="btn btn-primary btn-sm btn-block" onClick={() => window.location.href = '/studio'}>
              Stüdyoyu Aç <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
