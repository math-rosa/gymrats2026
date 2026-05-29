import { useState, useRef } from 'react';
import ReactDOM from 'react-dom';

export function TeamTooltip({ team, accentColor, children, style }) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const triggerRef = useRef(null);

  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPos({ x: rect.left + rect.width / 2, y: rect.top });
    }
    setShow(true);
  };

  const d = team.details || {};
  const weeksStats = [
    { label: 'Sem 1', value: d.s1 },
    { label: 'Sem 2', value: d.s2 },
    { label: 'Sem 3', value: d.s3 },
    { label: 'Sem 4', value: d.s4 },
    { label: 'Sem 5', value: d.s5 },
    { label: 'Sem 6', value: d.s6 },
    { label: 'Sem 7', value: d.s7 },
  ];

  const challengesStats = [
    { label: 'D1 - 100km', value: d.d1 },
    { label: 'D2 - Conv.', value: d.d2 },
    { label: 'D3 - Equipe', value: d.d3 },
    { label: 'D4 - Mãe', value: d.d4 },
    { label: 'D5 - Extra', value: d.d5 },
    { label: 'D. Relâm.', value: d.dr },
    { label: 'Gincana', value: d.gincana },
  ];

  const sumWeeks = weeksStats.reduce((acc, curr) => acc + (parseFloat(curr.value?.toString().replace(',', '.')) || 0), 0);
  const sumChallenges = challengesStats.reduce((acc, curr) => acc + (parseFloat(curr.value?.toString().replace(',', '.')) || 0), 0);

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setShow(false)}
        style={style}
        className="w-full flex justify-center"
      >
        {children}
      </div>
      {show && ReactDOM.createPortal(
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{
            left: pos.x,
            top: pos.y,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div
            className="relative mb-2 px-4 py-3 rounded-xl border shadow-2xl min-w-[300px]"
            style={{
              background: 'rgba(12,12,20,0.95)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderColor: `${accentColor}50`,
              boxShadow: `0 0 30px ${accentColor}20, 0 20px 40px rgba(0,0,0,0.6)`,
            }}
          >
            <div className="flex items-center gap-2 mb-2.5 pb-2 border-b border-white/[0.08]">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: accentColor }} />
              <span className="font-bold text-white text-[13px] uppercase tracking-wider truncate">DETALHES - {team.name}</span>
            </div>

            <div className="flex gap-x-6">
              <div className="flex flex-col gap-y-1.5 flex-1">
                {weeksStats.map((s, idx) => (
                  <div key={idx} className="flex items-baseline justify-between gap-2">
                    <span className="text-[9px] uppercase tracking-wider text-gray-500 font-bold truncate" title={s.label}>{s.label}</span>
                    <span className="text-[12px] font-black" style={{ color: (s.value && s.value !== '0' && s.value !== '') ? accentColor : '#4B5563' }}>
                      {s.value || '0'}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-y-1.5 flex-1">
                {challengesStats.map((s, idx) => (
                  <div key={idx} className="flex items-baseline justify-between gap-2">
                    <span className="text-[9px] uppercase tracking-wider text-gray-500 font-bold truncate" title={s.label}>{s.label}</span>
                    <span className="text-[12px] font-black" style={{ color: (s.value && s.value !== '0' && s.value !== '') ? accentColor : '#4B5563' }}>
                      {s.value || '0'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-white/[0.08] flex flex-col gap-2.5">
              <div className="flex gap-x-6">
                <div className="flex items-baseline justify-between gap-2 flex-1">
                  <span className="text-[9px] uppercase tracking-wider text-gray-500 font-bold">Total Semanas</span>
                  <span className="text-[13px] font-black text-white">{sumWeeks}</span>
                </div>
                <div className="flex items-baseline justify-between gap-2 flex-1">
                  <span className="text-[9px] uppercase tracking-wider text-gray-500 font-bold">Total Desafios</span>
                  <span className="text-[13px] font-black text-white">{sumChallenges}</span>
                </div>
              </div>

              <div className="flex items-center justify-center pt-2 border-t border-white/[0.04]">
                <div className="flex items-baseline gap-1.5 bg-white/[0.03] px-4 py-1.5 rounded-lg border border-white/[0.05]">
                  <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Check-in Final</span>
                  <span className="text-[16px] font-black" style={{ color: accentColor }}>{team.total}</span>
                </div>
              </div>
            </div>

            <div className="absolute left-1/2 -translate-x-1/2 -bottom-[6px] w-3 h-3 rotate-45" style={{ background: 'rgba(12,12,20,0.95)', borderRight: `1px solid ${accentColor}50`, borderBottom: `1px solid ${accentColor}50` }} />
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
