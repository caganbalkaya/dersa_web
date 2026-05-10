import React, { useState, useEffect, useContext } from 'react';
import * as ReactJoyride from 'react-joyride';
const Joyride = ReactJoyride.default || ReactJoyride.Joyride;
const STATUS = ReactJoyride.STATUS;
import { AuthContext } from '../context/AuthContext';

const steps = [
      {
         target: '.hero-padding h1',
         content: (
            <div>
               <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', fontWeight: 700 }}>Dersa'ya Hoşgeldiniz!</h3>
               <p style={{ color: 'var(--fg-subtle)', lineHeight: 1.5 }}>
                  Eğitmen sistemine hoş geldiniz. Ekosistemimizin ana hatlarına kısaca göz atalım.
               </p>
            </div>
         ),
         placement: 'center',
         disableBeacon: true,
      },
      {
         target: '[data-tour="nav-pricing"]',
         content: (
            <div>
               <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: 700 }}>Ücretlendirme</h3>
               <p style={{ color: 'var(--fg-subtle)', lineHeight: 1.5 }}>
                  Eğitmen paketleri ve premium özellikler hakkında bilgiye buradan ulaşabilirsiniz.
               </p>
            </div>
         ),
         placement: 'bottom',
         disableBeacon: true,
      },
      {
         target: '[data-tour="nav-academy"]',
         content: (
            <div>
               <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: 700 }}>Akademi (Blog)</h3>
               <p style={{ color: 'var(--fg-subtle)', lineHeight: 1.5 }}>
                  Platformdaki diğer eğitmenlerin yazdığı herkese açık makaleleri ve ders notlarını okuyabilirsiniz.
               </p>
            </div>
         ),
         placement: 'bottom',
         disableBeacon: true,
      },
      {
         target: '[data-tour="nav-explore"]',
         content: (
            <div>
               <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: 700 }}>Açık Kütüphane</h3>
               <p style={{ color: 'var(--fg-subtle)', lineHeight: 1.5 }}>
                  Başkalarının ürettiği interaktif videoları (Edpuzzle), oyunları ve sunumları ücretsiz keşfedin.
               </p>
            </div>
         ),
         placement: 'bottom',
         disableBeacon: true,
      },
      {
         target: '[data-tour="panel-link"]',
         content: (
            <div>
               <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: 700 }}>Yönetim Paneli</h3>
               <p style={{ color: 'var(--fg-subtle)', lineHeight: 1.5 }}>
                  Hazırsanız yukarıdaki menüden Eğitmen Panelinize giriş yaparak, Dersa'nın gelişmiş stüdyolarını keşfetmeye başlayabilirsiniz!
               </p>
            </div>
         ),
         placement: 'bottom',
         disableBeacon: true,
      }
   ];

export default function GuidedTour() {
   const { user } = useContext(AuthContext);

   const [run, setRun] = useState(false);

   useEffect(() => {
      if (user?.role !== 'TEACHER') return;

      const timer = setTimeout(() => {
         if (!localStorage.getItem('dersaLandingTourCompleted')) {
            setRun(true);
         }
      }, 1000);
      
      return () => clearTimeout(timer);
   }, [user]);

   const handleJoyrideCallback = (data) => {
      const { status } = data;
      const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];

      if (finishedStatuses.includes(status)) {
         localStorage.setItem('dersaLandingTourCompleted', 'true');
         setRun(false);
      }
   };






   return (
      <Joyride
         steps={steps}
         run={run}
         continuous
         disableBeacon={true}
         disableOverlayClose={true}
         showSkipButton
         showProgress
         callback={handleJoyrideCallback}
         locale={{
            back: 'Geri',
            close: 'Kapat',
            last: 'Bitir',
            next: 'İleri',
            skip: 'Turu Atla'
         }}
         styles={{
            options: {
               primaryColor: '#10b981',
               backgroundColor: '#111',
               textColor: '#fff',
               arrowColor: '#111',
               overlayColor: 'rgba(0, 0, 0, 0.75)',
               zIndex: 9999,
            },
            tooltipContainer: {
               textAlign: 'left'
            },
            buttonSkip: {
               color: '#9ca3af'
            },
            buttonBack: {
               color: '#9ca3af',
               marginRight: 10
            }
         }}
      />
   );
}
