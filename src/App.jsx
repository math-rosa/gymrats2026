import React, { useState, useEffect, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Loader2, AlertCircle, Trophy, Users, Route, Instagram, Timer, Crown, Clock } from 'lucide-react';
import TD_LOGO_URL from './tdbusiness_logo.jpg';

const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR3nqk-0k8VUtIgaR77357dukIvWCBwRs8wY4wIju32ricmg3LIEGyGMlhruMtGBJEE3CeEm8nr6PJO/pub?gid=196084497&single=true&output=csv";
const FEED_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR3nqk-0k8VUtIgaR77357dukIvWCBwRs8wY4wIju32ricmg3LIEGyGMlhruMtGBJEE3CeEm8nr6PJO/pub?gid=1279537034&single=true&output=csv";

const CHALLENGE_START = new Date('2026-04-15T00:00:00');
const CHALLENGE_END = new Date('2026-05-29T23:59:59');

// --- Utilitários ---
const toTitleCase = (str) => {
  if (!str) return "";
  const words = str.toLowerCase().split(' ').filter(w => w.length > 0);
  // Limitar a no máximo 2 nomes (ex: Primeiro e Segundo nome)
  return words.slice(0, 2).map(word => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
};

const parseCSV = (str) => {
  const arr = [];
  let quote = false;
  let col = 0, row = 0;

  for (let c = 0; c < str.length; c++) {
    let cc = str[c], nc = str[c + 1];
    arr[row] = arr[row] || [];
    arr[row][col] = arr[row][col] || '';

    if (cc == '"' && quote && nc == '"') { arr[row][col] += cc; ++c; continue; }
    if (cc == '"') { quote = !quote; continue; }
    if (cc == ',' && !quote) { ++col; continue; }
    if (cc == '\r' && nc == '\n' && !quote) { ++row; col = 0; ++c; continue; }
    if (cc == '\n' && !quote) { ++row; col = 0; continue; }
    if (cc == '\r' && !quote) { ++row; col = 0; continue; }
    arr[row][col] += cc;
  }
  return arr;
};

const csvToJson = (csvData) => {
  if (csvData.length < 2) return { data: [], headers: [] };
  const headers = csvData[0].map(h => h.trim());
  const result = [];

  for (let i = 1; i < csvData.length; i++) {
    const row = csvData[i];
    if (row.length === 1 && row[0] === '') continue;
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index] ? row[index].trim() : '';
    });
    result.push(obj);
  }
  return { data: result, headers };
};



function MediaItem({ url }) {
  const [loaded, setLoaded] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const containerRef = useRef(null);
  const isVideo = url.match(/\.(mp4|mov|webm)$/i);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: '600px' } // Pré-carrega ~12 itens antes de entrarem na tela
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="relative mx-2 w-40 h-40 rounded-2xl overflow-hidden border border-white/[0.08] bg-[#0e0e16] shrink-0 group transition-all duration-300 hover:scale-105 hover:z-20 hover:border-blue-500/50 cursor-pointer shadow-md hover:shadow-xl">
      {!loaded && (
        <div className="absolute inset-0 bg-[#12121a] animate-pulse flex items-center justify-center z-0">
          <Loader2 className="w-5 h-5 text-gray-600 animate-spin" />
        </div>
      )}

      {shouldLoad && (
        isVideo ? (
          <video
            src={url}
            className={`w-full h-full object-cover transition-opacity duration-700 ${loaded ? 'opacity-90 group-hover:opacity-100' : 'opacity-0'}`}
            autoPlay
            muted
            loop
            playsInline
            onLoadedData={() => setLoaded(true)}
          />
        ) : (
          <img
            src={url}
            alt="Feed item"
            className={`w-full h-full object-cover transition-opacity duration-700 ${loaded ? 'opacity-90 group-hover:opacity-100' : 'opacity-0'}`}
            onLoad={() => setLoaded(true)}
            loading="lazy"
          />
        )
      )}
    </div>
  );
}
// ═══ TOOLTIP DO MEMBRO ═══
function MemberTooltip({ member, accentColor, children, style }) {
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

  const weeks = member.weeks || {};
  const weekData = [
    { label: 'Sem 1', value: weeks.s1 },
    { label: 'Sem 2', value: weeks.s2 },
    { label: 'Sem 3', value: weeks.s3 },
    { label: 'Sem 4', value: weeks.s4 },
    { label: 'Sem 5', value: weeks.s5 },
    { label: 'Sem 6', value: weeks.s6 },
  ];

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setShow(false)}
        style={style}
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
            className="relative mb-2 px-4 py-3 rounded-xl border shadow-2xl min-w-[220px]"
            style={{
              background: 'rgba(12,12,20,0.95)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderColor: `${accentColor}50`,
              boxShadow: `0 0 30px ${accentColor}20, 0 20px 40px rgba(0,0,0,0.6)`,
            }}
          >
            {/* Header */}
            <div className="flex items-center gap-2 mb-2.5 pb-2 border-b border-white/[0.08]">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: accentColor }} />
              <span className="font-bold text-white text-[13px] truncate">{member.formattedName}</span>
            </div>

            {/* Grid de semanas */}
            <div className="grid grid-cols-3 gap-x-3 gap-y-1.5">
              {weekData.map((w) => (
                <div key={w.label} className="flex items-baseline justify-between gap-1.5">
                  <span className="text-[9px] uppercase tracking-wider text-gray-500 font-bold">{w.label}</span>
                  <span className="text-[12px] font-black" style={{ color: (w.value && w.value !== '0') ? accentColor : '#4B5563' }}>
                    {w.value || '0'}
                  </span>
                </div>
              ))}
            </div>

            {/* Totais */}
            <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-white/[0.08]">
              {member.extraPoints && member.extraPoints !== '0' && (
                <div className="flex items-baseline gap-1">
                  <span className="text-[9px] uppercase tracking-wider text-gray-500 font-bold">Extras</span>
                  <span className="text-[12px] font-black text-emerald-400">+{member.extraPoints}</span>
                </div>
              )}
              <div className="flex items-baseline gap-1 ml-auto">
                <span className="text-[9px] uppercase tracking-wider text-gray-500 font-bold">Total</span>
                <span className="text-[14px] font-black" style={{ color: accentColor }}>{member.points}</span>
                <span className="text-[9px] text-gray-600 font-bold">pts</span>
              </div>
            </div>

            {/* Seta */}
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-[6px] w-3 h-3 rotate-45" style={{ background: 'rgba(12,12,20,0.95)', borderRight: `1px solid ${accentColor}50`, borderBottom: `1px solid ${accentColor}50` }} />
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

// ═══ COMPONENTE DE NÚMERO ANIMADO ═══
function AnimatedNumber({ value, isFloat = false }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const duration = 2000; // 2 segundos
    const endValue = parseFloat(value);
    
    if (isNaN(endValue)) {
      setCurrent(value);
      return;
    }

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Easing function: easeOutQuart
      const ease = 1 - Math.pow(1 - progress, 4);
      const nextVal = ease * endValue;
      setCurrent(isFloat ? nextVal.toFixed(1) : Math.floor(nextVal));
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCurrent(isFloat ? endValue.toFixed(1) : endValue);
      }
    };
    window.requestAnimationFrame(step);
  }, [value, isFloat]);

  return <>{current}</>;
}

// ═══ COMPONENTE DE COUNTDOWN ═══
function ChallengeCountdown({ startDate, endDate }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [progress, setProgress] = useState({ pct: 0, currentDay: 0 });

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const start = new Date(startDate);
      const end = new Date(endDate);
      const totalDuration = end - start;
      const elapsed = now - start;
      
      let pct = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
      const currentDay = Math.min(45, Math.max(0, Math.ceil(elapsed / (1000 * 60 * 60 * 24))));

      const remaining = end - now;
      if (remaining > 0) {
        setTimeLeft({
          days: Math.floor(remaining / (1000 * 60 * 60 * 24)),
          hours: Math.floor((remaining / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((remaining / 1000 / 60) % 60),
          seconds: Math.floor((remaining / 1000) % 60)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
      setProgress({ pct, currentDay });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [startDate, endDate]);

  const format = (num) => num.toString().padStart(2, '0');

  return (
    <div className="bg-[#12121a] px-5 py-2.5 rounded-2xl border border-white/[0.06] flex flex-col justify-center min-w-[300px] shadow-lg">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">Desafio 45 Dias</span>
        <span className="text-[10px] font-bold text-white bg-white/[0.04] px-2 py-0.5 rounded-lg border border-white/[0.03]">
          Dia {progress.currentDay} <span className="text-gray-500 font-normal">/ 45</span>
        </span>
      </div>
      
      <div className="flex items-center gap-2.5">
        <Timer className="w-4 h-4 text-green-400" />
        <div className="flex items-baseline gap-1 text-white font-black text-xl tracking-tight">
          {format(timeLeft.days)}<span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mr-1">d</span>:
          <span className="ml-1">{format(timeLeft.hours)}</span><span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mr-1">h</span>:
          <span className="ml-1">{format(timeLeft.minutes)}</span><span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mr-1">m</span>:
          <span className="ml-1">{format(timeLeft.seconds)}</span><span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">s</span>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [data, setData] = useState([]);
  const [feedData, setFeedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const noCacheParams = { cache: 'no-store' };
    const ts = Date.now();

    const fetchRanking = fetch(`${CSV_URL}&_t=${ts}`, noCacheParams)
      .then(r => { if (!r.ok) throw new Error("Erro Ranking"); return r.text(); })
      .then(text => {
        const rawData = parseCSV(text);
        const { data: jsonData } = csvToJson(rawData);
        if (jsonData.length === 0) throw new Error("CSV Ranking vazio.");
        setData(jsonData);
      });

    const fetchFeed = fetch(`${FEED_CSV_URL}&_t=${ts}`, noCacheParams)
      .then(r => { if (!r.ok) throw new Error("Erro Feed"); return r.text(); })
      .then(text => {
        const rawData = parseCSV(text);
        const { data: jsonData } = csvToJson(rawData);
        const media = jsonData
          .map(item => item.thumbnail_url || item.url)
          .filter(url => url && url.length > 5)
          .sort(() => Math.random() - 0.5) // Embaralhar os itens
          .slice(0, 15); // Limitar a 15 itens aleatórios no DOM
        setFeedData(media);
      })
      .catch(err => console.warn("Erro ao carregar feed:", err));

    Promise.all([fetchRanking, fetchFeed])
      .then(() => setLoading(false))
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);



  // Novo Cálculo do Ranking e Totais (Times)
  const { rankingData, totalKm, totalMembers, lastUpdate } = useMemo(() => {
    if (!data || data.length === 0) return { rankingData: [], totalKm: 0, totalMembers: 0, lastUpdate: "" };
    
    const scores = {};
    let globalKm = 0;
    let updateTime = "";
    
    data.forEach(item => {
      const teamName = item['TIME']?.trim();
      const memberName = item['NOME']?.trim();
      if (item['DATA'] && !updateTime) updateTime = item['DATA'];
      
      // Ignorar linhas de totalização ou vazias
      if (!teamName || teamName.toUpperCase() === 'TOTAL' || !memberName || memberName.toUpperCase() === 'TOTAL') {
        return;
      }
      // ... (rest of logic remains same)
      const rawPoints = item['CHECK-IN'] || "0";
      const points = parseFloat(rawPoints.toString().replace(',', '.')) || 0;
      const rawKm = item['KM'] || "0";
      const km = parseFloat(rawKm.toString().replace(',', '.')) || 0;

      globalKm += km;
      const extraPoints = item['PTS EXTRAS'] || "0";

      const weeks = {
        s1: item['SEMANA 1'] || '0',
        s2: item['SEMANA 2'] || '0',
        s3: item['SEMANA 3'] || '0',
        s4: item['SEMANA 4'] || '0',
        s5: item['SEMANA 5'] || '0',
        s6: item['SEMANA 6'] || '0',
      };

      if (!scores[teamName]) {
        scores[teamName] = { id: teamName, name: teamName, members: [], total: 0, totalKm: 0 };
      }

      scores[teamName].total += points;
      scores[teamName].totalKm += km;
      
      let existingMember = scores[teamName].members.find(m => m.name === memberName);
      if (existingMember) {
        existingMember.points += points;
        existingMember.km += km;
        if (extraPoints !== "0") existingMember.extraPoints = extraPoints;
        existingMember.weeks = weeks;
      } else {
        scores[teamName].members.push({
          name: memberName,
          formattedName: toTitleCase(memberName),
          points: points,
          km: km,
          extraPoints: extraPoints,
          weeks: weeks
        });
      }
    });

    const sortedList = Object.values(scores)
      .map(team => {
        team.members.sort((a, b) => b.points - a.points);
        return team;
      })
      .sort((a, b) => b.total - a.total);

    let currentRank = 1;
    for (let i = 0; i < sortedList.length; i++) {
      if (i > 0 && sortedList[i].total < sortedList[i - 1].total) {
        currentRank = i + 1;
      }
      sortedList[i].rank = currentRank;
    }

    const totalMembersCount = sortedList.reduce((sum, t) => sum + t.members.length, 0);

    return { 
      rankingData: sortedList, 
      totalKm: Math.round(globalKm), 
      totalMembers: totalMembersCount,
      lastUpdate: updateTime 
    };
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          <p className="text-gray-500 font-medium tracking-widest uppercase">Carregando Gym Rats...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6">
        <div className="bg-[#12121a] p-8 rounded-2xl shadow-xl border border-red-900/30 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Erro de Conexão</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors shadow-md"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#030305] text-gray-200 font-sans flex flex-col relative overflow-hidden">
      {/* ═══ PREMIUM BACKGROUND ═══ */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Animated Aurora Orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full mix-blend-screen filter blur-[120px] opacity-50 animate-pulse" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, rgba(0,0,0,0) 70%)', animationDuration: '10s' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full mix-blend-screen filter blur-[130px] opacity-40 animate-pulse" style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.2) 0%, rgba(0,0,0,0) 70%)', animationDuration: '14s' }} />
        <div className="absolute top-[30%] left-[30%] w-[40vw] h-[40vw] rounded-full mix-blend-screen filter blur-[150px] opacity-30 animate-pulse" style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, rgba(0,0,0,0) 70%)', animationDuration: '18s' }} />
        
        {/* Premium Noise / Dot Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.25]" 
          style={{ 
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)', 
            backgroundSize: '24px 24px',
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.2) 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.2) 100%)'
          }} 
        />
        
        {/* Vignette Overlay for Depth */}
        <div className="absolute inset-0 bg-black/40 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 50%, transparent 20%, rgba(3,3,5,0.8) 100%)' }} />
      </div>

      {/* ═══ HEADER ═══ */}
      <header className="relative z-10 border-b border-white/[0.06] bg-[#0a0a0f]/90 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-3">
              <img src={TD_LOGO_URL} alt="TD Business" className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl object-cover border border-white/10 shadow-sm bg-[#12121a]" />
              <div className="h-7 w-px bg-white/5" />
              <div>
                <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight italic uppercase">
                  GYM RATS <span className="text-blue-500">2026.2</span>
                </h1>
                <p className="text-[10px] sm:text-xs text-gray-500 font-semibold uppercase tracking-widest flex items-center gap-1.5 flex-wrap">
                  <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> {rankingData.length} Equipes
                  <span className="opacity-30">•</span>
                  {totalMembers} Participantes
                  {lastUpdate && (
                    <>
                      <span className="opacity-30">•</span>
                      <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> {lastUpdate}
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-stretch justify-center gap-2 sm:gap-3 pb-0.5 w-full sm:w-auto">
            {/* KPIs — somente desktop */}
            <div className="hidden md:flex items-stretch gap-2">
              <StatCard icon={Route} color="text-green-500" value={totalKm} label="Km Percorridos" />
              <StatCard icon={Trophy} color="text-blue-500" value={rankingData.reduce((sum, t) => sum + t.total, 0)} label="Total Check-Ins" />
            </div>
            <ChallengeCountdown startDate={CHALLENGE_START} endDate={CHALLENGE_END} />
          </div>
        </div>
      </header>

      {/* ═══ MEDIA FEED — oculto em mobile ═══ */}
      {feedData.length > 0 && (
        <div className="hidden md:block relative z-10 border-b border-white/[0.06] bg-[#08080d]/60 py-4 overflow-hidden">
          <style>{`
            @keyframes scroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .animate-scroll {
              animation: scroll 250s linear infinite;
            }
            .animate-scroll:hover {
              animation-play-state: paused;
            }
            @keyframes float {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-12px); }
            }
            .animate-float {
              animation: float 4s ease-in-out infinite;
            }
          `}</style>
          <div className="flex w-max animate-scroll">
            {[...feedData, ...feedData, ...feedData].map((url, idx) => (
              <MediaItem key={`${idx}-${url}`} url={url} />
            ))}
          </div>
          
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#0a0a0f] to-transparent pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#0a0a0f] to-transparent pointer-events-none" />
          
          <div className="absolute top-2 left-6 text-[10px] font-bold uppercase tracking-widest text-white/50 bg-black/50 px-3 py-1.5 rounded-lg border border-white/5 flex items-center gap-2">
            <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span>
            <Instagram className="w-3.5 h-3.5" /> Feed Diário
          </div>
        </div>
      )}

      {/* ═══ MAIN CONTENT: PÓDIO ═══ */}
      <main className="relative z-10 flex-1 overflow-y-auto md:overflow-hidden w-full flex justify-center">
        <div className="w-full max-w-[1600px] px-2 sm:px-6 lg:px-12 pt-4 sm:pt-6 pb-4 md:pb-0 md:h-full">
          <div className="md:min-w-[900px] xl:min-w-[1200px] flex flex-col md:justify-end md:h-full">
            {rankingData.length > 0 ? (
              <Podium rankingData={rankingData} />
            ) : (
              <div className="text-gray-500 w-full text-center py-20">Sem dados suficientes para exibir o pódio.</div>
            )}
          </div>
        </div>
      </main>

    </div>
  );
}

// Subcomponente de Cartão de Estatística
function StatCard({ icon: Icon, color, value, label }) {
  return (
    <div className="bg-white/[0.03] px-4 py-2 rounded-xl border border-white/[0.06] flex flex-col justify-center min-w-[130px]">
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-lg font-black text-white"><AnimatedNumber value={value} /></span>
      </div>
      <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold mt-0.5">{label}</span>
    </div>
  );
}

// ═══ COMPONENTE DE PÓDIO ═══
function Podium({ rankingData }) {
  const positions = [
    { rank: 4, height: '78%', place: '4º' },
    { rank: 2, height: '88%', place: '2º' },
    { rank: 1, height: '100%', place: '1º', isWinner: true },
    { rank: 3, height: '88%', place: '3º' },
    { rank: 5, height: '78%', place: '5º' },
  ];

  // Garante que existam 5 posições, preenchendo com nulos se houver menos
  const paddedData = [...rankingData];
  while (paddedData.length < 5) paddedData.push(null);

  const teamColors = {
    'AZUL': { accentColor: '#3B82F6', glowColor: 'rgba(59,130,246,0.30)' },
    'ROXO': { accentColor: '#8B5CF6', glowColor: 'rgba(139,92,246,0.25)' },
    'ROSA': { accentColor: '#EC4899', glowColor: 'rgba(236,72,153,0.25)' },
    'VERDE': { accentColor: '#10B981', glowColor: 'rgba(16,185,129,0.25)' },
    'LARANJA': { accentColor: '#F97316', glowColor: 'rgba(249,115,22,0.25)' }
  };

  const defaultColors = [
    { accentColor: '#3B82F6', glowColor: 'rgba(59,130,246,0.30)' },
    { accentColor: '#8B5CF6', glowColor: 'rgba(139,92,246,0.25)' },
    { accentColor: '#EC4899', glowColor: 'rgba(236,72,153,0.25)' },
    { accentColor: '#F97316', glowColor: 'rgba(249,115,22,0.25)' },
    { accentColor: '#10B981', glowColor: 'rgba(16,185,129,0.25)' },
  ];

  const podiumRender = positions.map((pos) => {
    // Usa o índice do array (rank - 1) para garantir que as 5 posições sejam preenchidas na ordem correta,
    // independente de haver pontuações empatadas pulando números de rank.
    const team = paddedData[pos.rank - 1];
    let colors = defaultColors[pos.rank - 1];
    
    if (team && team.name) {
      const teamName = team.name.toUpperCase();
      if (teamColors[teamName]) {
        colors = teamColors[teamName];
      }
    }

    return { ...pos, accentColor: colors.accentColor, glowColor: colors.glowColor, team };
  });

  // Ordem no mobile: 1º, 2º, 3º, 4º, 5º (sequencial)
  const mobilePodiumRender = [...podiumRender].sort((a, b) => a.rank - b.rank);

  return (
    <div className="flex flex-col items-center md:justify-end w-full md:h-full max-w-[1600px] mx-auto relative">
      {/* SPOTLIGHT BEHIND 1ST PLACE */}
      <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-blue-500/15 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* ── DESKTOP: layout horizontal em coluna de arena ── */}
      <div className="hidden md:flex items-end justify-center gap-1.5 sm:gap-2 md:gap-3 lg:gap-5 w-full h-full px-2 sm:px-6 pt-6 z-10 relative">
        {podiumRender.map((item, idx) => {
          if (!item.team) return <div key={idx} className="w-[20%] min-w-0" />;
          return <PodiumTeamCard key={idx} config={item} team={item.team} isMobile={false} />;
        })}
      </div>

      {/* ── MOBILE: cards empilhados do 1º ao 5º ── */}
      <div className="flex md:hidden flex-col gap-3 w-full px-3 z-10 relative pb-4">
        {mobilePodiumRender.map((item, idx) => {
          if (!item.team) return null;
          return <PodiumTeamCard key={idx} config={item} team={item.team} isMobile={true} />;
        })}
      </div>

    </div>
  );
}

function PodiumTeamCard({ config, team, isMobile }) {
  const listRef = useRef(null);
  const [dynamicStyles, setDynamicStyles] = useState(null);

  useEffect(() => {
    if (isMobile || !listRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const availableHeight = entry.contentRect.height;
        const memberCount = team.members.length || 1;
        // Each row gets an equal share of the full available height
        const rowHeight = Math.max(16, availableHeight / memberCount);
        // Dynamic font: scale between 9px and 14px based on row height
        const fontSize = Math.min(14, Math.max(9, rowHeight * 0.45));
        const pointsFontSize = Math.min(15, Math.max(10, rowHeight * 0.48));
        const paddingY = Math.max(0, (rowHeight - fontSize - 2) / 2);
        const gap = Math.max(0, Math.min(4, (rowHeight - fontSize) * 0.15));

        setDynamicStyles({ fontSize, pointsFontSize, paddingY, gap });
      }
    });

    observer.observe(listRef.current);
    return () => observer.disconnect();
  }, [isMobile, team.members.length]);

  const ds = dynamicStyles || { fontSize: 13, pointsFontSize: 14, paddingY: 6, gap: config.rank >= 4 ? 0.5 : 4 };

  return (
    <div
      className={isMobile
        ? "w-full flex flex-col relative z-10 rounded-t-2xl"
        : "w-[20%] min-w-0 flex flex-col relative z-20 overflow-visible"
      }
      style={isMobile ? {} : { height: config.height }}
    >
      {/* BACKGROUND COM EFEITO DE VIDRO */}
      <div 
        className={isMobile ? "absolute inset-0 rounded-t-2xl pointer-events-none -z-10" : "absolute inset-0 rounded-t-3xl pointer-events-none -z-10"}
        style={{
          background: 'rgba(14,14,22,0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: `1px solid ${config.accentColor}40`,
          borderTop: `4px solid ${config.accentColor}`,
          borderBottom: 'none',
          boxShadow: `0 0 40px ${config.glowColor}, 0 20px 40px rgba(0,0,0,0.5)`,
        }}
      />

      {/* HEADER DO CARD */}
      <div
        className="px-2 py-3 flex flex-col items-center justify-center text-center text-white relative shrink-0 gap-2.5 rounded-t-[20px]"
        style={{
          background: `linear-gradient(160deg, ${config.accentColor}28 0%, ${config.accentColor}0a 100%)`,
          borderBottom: `1px solid ${config.accentColor}35`,
        }}
      >
        {/* ROW: Medalha + Nome do Time */}
        <div className="flex items-center gap-2">
          {/* Badge de posição */}
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center font-black text-[11px] shadow-xl relative shrink-0"
            style={{
              background: config.rank === 1
                ? 'linear-gradient(135deg, #FDE047 0%, #F59E0B 100%)'
                : config.rank === 2
                  ? 'linear-gradient(135deg, #F3F4F6 0%, #9CA3AF 100%)'
                  : config.rank === 3
                    ? 'linear-gradient(135deg, #FDBA74 0%, #B45309 100%)'
                    : `${config.accentColor}1a`,
              border: config.rank === 1
                ? '2px solid #FEF08A'
                : config.rank === 2
                  ? '2px solid #FFFFFF'
                  : config.rank === 3
                    ? '2px solid #FED7AA'
                    : `2px solid ${config.accentColor}55`,
              color: config.rank <= 3 ? '#000000' : config.accentColor,
              boxShadow: config.rank === 1 ? '0 0 25px rgba(245,158,11,0.7)' 
                       : config.rank === 2 ? '0 0 15px rgba(156,163,175,0.4)'
                       : config.rank === 3 ? '0 0 15px rgba(180,83,9,0.4)'
                       : 'none',
            }}
          >
            {config.isWinner && (
              <Crown className="absolute -top-[18px] z-50 w-5 h-5 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]" />
            )}
            {config.place}
          </div>

          <h3 
            className="font-black text-[15px] uppercase tracking-wider leading-tight"
            style={{
              color: '#FFFFFF',
              textShadow: `0 0 15px ${config.accentColor}90, 0 0 5px ${config.accentColor}`
            }}
          >
            {team.name}
          </h3>
        </div>

        <div className="flex items-center justify-center w-full">
          {/* Badge Pontos com Fórmula */}
          <div
            className="px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5"
            style={{
              background: `${config.accentColor}1a`,
              border: `1px solid ${config.accentColor}40`,
              color: config.accentColor,
            }}
          >
            <span className="text-[13px] leading-none font-black"><AnimatedNumber value={team.total} /></span>
            <span className="text-[11px] opacity-70 font-bold">+</span>
            <span className="text-[11px] font-black text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]">15</span>
            <span className="text-[11px] opacity-70 font-bold">=</span>
            <div className="flex items-baseline gap-0.5 ml-0.5">
              <span className="text-[14px] leading-none font-black text-white">
                <AnimatedNumber value={team.total + 15} />
              </span>
              <span className="text-[9px] uppercase tracking-widest opacity-60 text-white">pts</span>
            </div>
          </div>
        </div>
      </div>

      <div
        ref={listRef}
        className={isMobile ? "px-2 py-2" : "flex-1 min-h-0 overflow-hidden px-1 sm:px-2 pb-3"}
      >
        <div
          className={isMobile ? "flex flex-col gap-1.5" : "flex flex-col h-full"}
        >
          {team.members.map((m, i) => (
            <MemberTooltip key={i} member={m} accentColor={config.accentColor} style={isMobile ? {} : { flex: '1 1 0', minHeight: 0 }}>
              <div
                className={isMobile
                  ? "flex items-center justify-between px-3 py-1.5 rounded-lg"
                  : "flex items-center justify-between px-3 rounded-lg transition-all duration-200 cursor-default h-full"
                }
                style={{ background: 'transparent' }}
                onMouseEnter={e => e.currentTarget.style.background = `${config.accentColor}12`}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className="font-mono font-bold w-4 text-right shrink-0"
                    style={{ color: `${config.accentColor}88`, fontSize: isMobile ? 11 : `${Math.max(9, ds.fontSize * 0.8)}px` }}
                  >
                    {i + 1}.
                  </span>
                  <span
                    className="font-semibold text-gray-200 truncate"
                    style={{ fontSize: isMobile ? 13 : `${ds.fontSize}px` }}
                  >
                    {m.formattedName}
                  </span>
                  {m.extraPoints && m.extraPoints !== "0" && (
                    <span
                      className="ml-1.5 font-black text-emerald-400 shrink-0"
                      style={{ fontSize: isMobile ? 10 : `${Math.max(8, ds.fontSize * 0.75)}px` }}
                    >
                      +{m.extraPoints}
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-0.5 shrink-0 justify-end" style={{ minWidth: 36 }}>
                  <span
                    className="font-bold"
                    style={{ color: config.accentColor, fontSize: isMobile ? 14 : `${ds.pointsFontSize}px` }}
                  >
                    {m.points}
                  </span>
                  <span
                    className="text-gray-600 font-bold"
                    style={{ fontSize: isMobile ? 9 : `${Math.max(7, ds.fontSize * 0.65)}px` }}
                  >
                    pts
                  </span>
                </div>
              </div>
            </MemberTooltip>
          ))}
        </div>
      </div>

    </div>
  );
}

