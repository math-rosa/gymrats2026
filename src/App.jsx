import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Loader2, AlertCircle, Trophy, Medal, Crown, Users, Calendar, Timer, Instagram, Dumbbell, Footprints, Zap, Bike, Flame, Swords, Mountain, RotateCw, Waves, Activity, Route } from 'lucide-react';

const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRAQdbRC3Pj39q2uwzwzcIMXHjnebOgEiWCEClH6RTEt_7bG3arvWLjng8MIqz-KrbpM8T_r8PHyYgh/pub?gid=761223336&single=true&output=csv";
const FEED_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR7yHWFR9qtahU0vlYZ_QKi24OUChWc5kW93NvTHIZMG4rdp5ED5iOkHTwFAxVc8TxPUlxGudvdDduE/pub?gid=53383827&single=true&output=csv";
const ACTIVITIES_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRayA8iY_qiK4bRnABlZfFwo2-LyKDoLqiCohKznzi2MH5KG893pinjKnU9NNw-8XxAgn3FCgcTw9De/pub?gid=1519533572&single=true&output=csv";
const TD_LOGO_URL = "https://media.licdn.com/dms/image/v2/D4D0BAQFOeA8IeerkJw/company-logo_200_200/B4DZjN0W.LGkAY-/0/1755799712104/tdbusiness_logo?e=1772064000&v=beta&t=mZSjFsHz9QBV0SfMrZwyA6SAfslEO6lt4HZ2tzmSH1M";

// Mapeamento de atividades: nome em ingles -> nome PT-BR + icone
const ACTIVITY_MAP = {
  strength_training: { label: 'Treino de Força', icon: Dumbbell },
  running: { label: 'Corrida', icon: Zap },
  walking: { label: 'Caminhada', icon: Footprints },
  cycling: { label: 'Ciclismo', icon: Bike },
  hiit: { label: 'HIIT', icon: Flame },
  calisthenics: { label: 'Calistenia', icon: Swords },
  functional_training: { label: 'Funcional', icon: Activity },
  circuit_training: { label: 'Circuito', icon: RotateCw },
  hiking: { label: 'Trilha', icon: Mountain },
  swimming: { label: 'Natação', icon: Waves },
  core_training: { label: 'Core', icon: Activity },
  cross_training: { label: 'Cross Training', icon: Activity },
  soccer: { label: 'Futebol', icon: Activity },
  spinning: { label: 'Spinning', icon: Bike },
  rowing: { label: 'Remo', icon: Waves },
  stairs: { label: 'Escada', icon: Activity },
  stationary_bike: { label: 'Bike Ergométrica', icon: Bike },
  other: { label: 'Outros', icon: Activity },
};

// Cores alternadas para o grafico
const ACTIVITY_COLORS = ['#00FFB6'];

// Configuracoes do Desafio
const CHALLENGE_START = new Date('2026-02-01T00:00:00');
const CHALLENGE_END = new Date('2026-03-17T23:59:59');

// --- Utilitarios ---

const toTitleCase = (str) => {
  if (!str) return "";
  return str.toLowerCase().split(' ').map(word => {
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
  if (csvData.length < 2) return [];
  const headers = csvData[0].map(h => h.trim());
  const result = [];

  for (let i = 1; i < csvData.length; i++) {
    const row = csvData[i];
    if (row.length === headers.length || (row.length === 1 && row[0] === '')) {
      if (row.length === 1 && row[0] === '') continue;
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] ? row[index].trim() : '';
      });
      result.push(obj);
    }
  }
  return { data: result, headers };
};

const guessFieldRoles = (headers) => {
  const roles = {
    title: headers.find(h => /participante|atleta|membro|jogador/i.test(h)) ||
      headers.find(h => /(?<!time\s)(?<!team\s)(nome|name)(?!.*(time|team|equipe|dupla|pair))/i.test(h)) ||
      headers.find(h => /nome|name|title|titulo|modelo|produto/i.test(h)) ||
      headers[0],
    image: headers.find(h => /img|image|foto|pic|url|src|thumbnail/i.test(h)),
    points: headers.find(h => /ponto|point|score|nota|pts|total|dias/i.test(h)),
    pair: headers.find(h => /dupla|pair|equipe|team|time|participante/i.test(h))
  };
  return roles;
};

// Componente de Avatar
const Avatar = ({ src, className, fallbackText = "?" }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className={`${className} flex items-center justify-center bg-[#12121a] text-gray-600 font-bold`}>
        {fallbackText}
      </div>
    );
  }

  return (
    <div className={`${className} relative bg-[#12121a] overflow-hidden`}>
      {!loaded && <div className="absolute inset-0 bg-gray-800 animate-pulse" />}
      <img
        src={src}
        className={`w-full h-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        loading="lazy"
        alt="Avatar"
      />
    </div>
  );
};

// Componente de Midia do Feed
function AnimatedNumber({ value, duration = 1200, locale = 'pt-BR' }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current || value === 0) { setDisplay(value); return; }
    hasAnimated.current = true;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setDisplay(Math.round(ease * value));
      if (p < 1) ref.current = requestAnimationFrame(step);
    };
    ref.current = requestAnimationFrame(step);
    return () => ref.current && cancelAnimationFrame(ref.current);
  }, [value, duration]);

  return <span className="animate-count">{display.toLocaleString(locale)}</span>;
}

function MediaItem({ url }) {
  const [loaded, setLoaded] = useState(false);
  const isVideo = url.match(/\.(mp4|mov|webm)$/i);

  return (
    <div className="relative mx-2 w-40 h-40 rounded-2xl overflow-hidden border border-white/[0.08] bg-[#0e0e16] shrink-0 group transition-all duration-300 hover:scale-105 hover:z-20 hover:border-brand/50 cursor-pointer shadow-lg hover:shadow-brand/20">
      {!loaded && (
        <div className="absolute inset-0 bg-[#12121a] animate-pulse flex items-center justify-center z-0">
          <Loader2 className="w-5 h-5 text-gray-700 animate-spin" />
        </div>
      )}

      {isVideo ? (
        <video
          src={url}
          className={`w-full h-full object-cover transition-opacity duration-700 ${loaded ? 'opacity-80 group-hover:opacity-100' : 'opacity-0'}`}
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
          className={`w-full h-full object-cover transition-opacity duration-700 ${loaded ? 'opacity-80 group-hover:opacity-100' : 'opacity-0'}`}
          onLoad={() => setLoaded(true)}
          loading="lazy"
        />
      )}
    </div>
  );
}

export default function App() {
  const [data, setData] = useState([]);
  const [feedData, setFeedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fields, setFields] = useState({});
  const [progress, setProgress] = useState({ pct: 0, daysLeft: 0, currentDay: 0 });
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [activityStats, setActivityStats] = useState([]);
  const [bigNumbers, setBigNumbers] = useState({ totalCalories: 0, totalDistanceKm: 0, totalWorkouts: 0 });

  useEffect(() => {
    const fetchRanking = fetch(CSV_URL)
      .then(r => { if (!r.ok) throw new Error("Erro Ranking"); return r.text(); })
      .then(text => {
        const rawData = parseCSV(text);
        const { data: jsonData, headers } = csvToJson(rawData);
        if (jsonData.length === 0) throw new Error("CSV Ranking vazio.");
        setData(jsonData);
        setFields(guessFieldRoles(headers));
      });

    const fetchFeed = fetch(FEED_CSV_URL)
      .then(r => { if (!r.ok) throw new Error("Erro Feed"); return r.text(); })
      .then(text => {
        const rawData = parseCSV(text);
        const { data: jsonData } = csvToJson(rawData);
        const media = jsonData
          .map(item => item.url)
          .filter(url => url && url.length > 5);
        setFeedData(media);
      })
      .catch(err => console.warn("Erro ao carregar feed:", err));

    // 3. Carregar CSV de Atividades
    const fetchActivities = fetch(ACTIVITIES_CSV_URL)
      .then(r => { if (!r.ok) throw new Error("Erro Atividades"); return r.text(); })
      .then(text => {
        const rawData = parseCSV(text);
        const { data: jsonData, headers } = csvToJson(rawData);

        // Encontrar a coluna platform_activity
        const activityKey = headers.find(h => /platform_activity/i.test(h)) || 'platform_activity';

        // Contar ocorrencias de cada atividade
        const counts = {};
        let total = 0;
        jsonData.forEach(item => {
          let activity = (item[activityKey] || '').trim().toLowerCase();
          if (!activity) return;
          // Normalizar: remover underscores duplicados, espaços extras
          activity = activity.replace(/\s+/g, '_').replace(/_+/g, '_');
          counts[activity] = (counts[activity] || 0) + 1;
          total++;
        });

        // Converter para array com porcentagens e ordenar
        const statsArray = Object.entries(counts)
          .map(([key, count]) => {
            const mapped = ACTIVITY_MAP[key] || { label: toTitleCase(key.replace(/_/g, ' ')), icon: Activity };
            return {
              key,
              label: mapped.label,
              icon: mapped.icon,
              count,
              pct: total > 0 ? ((count / total) * 100) : 0,
            };
          })
          .sort((a, b) => b.count - a.count)
          .slice(0, 6); // Top 6

        setActivityStats(statsArray);

        // Calcular big numbers: soma de calorias e distancia
        const caloriesKey = headers.find(h => /^calories$/i.test(h.trim())) || 'calories';
        const distanceKey = headers.find(h => /distance_miles/i.test(h)) || 'distance_miles';

        let totalCal = 0;
        let totalMiles = 0;
        jsonData.forEach(item => {
          // Tratar calorias: pode ter virgula como decimal
          const calStr = (item[caloriesKey] || '').trim().replace(',', '.');
          const cal = parseFloat(calStr);
          if (!isNaN(cal) && cal > 0) totalCal += cal;

          // Tratar distancia: pode ter virgula como decimal e aspas
          const distStr = (item[distanceKey] || '').trim().replace(/"/g, '').replace(',', '.');
          const dist = parseFloat(distStr);
          if (!isNaN(dist) && dist > 0) totalMiles += dist;
        });

        const totalKm = totalMiles * 1.60934;
        setBigNumbers({ totalCalories: Math.round(totalCal), totalDistanceKm: Math.round(totalKm), totalWorkouts: total });
      })
      .catch(err => console.warn("Erro ao carregar atividades:", err));

    Promise.all([fetchRanking, fetchFeed, fetchActivities])
      .then(() => setLoading(false))
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });

    const now = new Date();
    const totalDuration = CHALLENGE_END - CHALLENGE_START;
    const elapsed = now - CHALLENGE_START;

    let pct = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
    const daysLeft = Math.ceil((CHALLENGE_END - now) / (1000 * 60 * 60 * 24));
    const currentDay = Math.ceil(elapsed / (1000 * 60 * 60 * 24));

    setProgress({
      pct,
      daysLeft: Math.max(0, daysLeft),
      currentDay: Math.min(45, Math.max(0, currentDay))
    });

  }, []);

  // Live countdown timer
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const diff = Math.max(0, CHALLENGE_END - now);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setCountdown({ days, hours, minutes, seconds });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Calculo do Ranking
  const rankingData = useMemo(() => {
    if (!fields.pair || !fields.points) return [];

    const scores = {};

    data.forEach(item => {
      const pairId = item[fields.pair];
      const memberName = item[fields.title];
      const memberImage = item[fields.image];
      const rawPoints = item[fields.points] || "0";
      const points = parseFloat(rawPoints.toString().replace(',', '.')) || 0;

      if (pairId) {
        if (!scores[pairId]) {
          scores[pairId] = { id: pairId, members: [], total: 0 };
        }

        scores[pairId].total += points;

        if (memberName) {
          let existingMember = scores[pairId].members.find(m => m.name === memberName);

          if (existingMember) {
            existingMember.points += points;
            if (!existingMember.image && memberImage) existingMember.image = memberImage;
          } else {
            scores[pairId].members.push({
              name: memberName,
              image: memberImage,
              points: points
            });
          }
        }
      }
    });

    const sortedList = Object.values(scores)
      .map(score => {
        const formattedMembers = score.members.map(m => ({
          ...m,
          formattedName: toTitleCase(m.name)
        }));

        const names = formattedMembers.map(m => m.formattedName);

        return {
          name: names.length > 0 ? names.join(' & ') : `Dupla ${score.id}`,
          total: score.total,
          originalId: score.id,
          members: formattedMembers
        };
      })
      .sort((a, b) => b.total - a.total);

    let currentRank = 1;
    for (let i = 0; i < sortedList.length; i++) {
      if (i > 0 && sortedList[i].total < sortedList[i - 1].total) {
        currentRank = i + 1;
      }
      sortedList[i].rank = currentRank;
    }

    return sortedList;
  }, [data, fields]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-brand/20 rounded-full blur-xl animate-pulse" />
            <Loader2 className="relative w-10 h-10 animate-spin text-brand" />
          </div>
          <p className="text-gray-500 font-medium text-sm tracking-widest uppercase">Carregando Gym Rats...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6">
        <div className="bg-[#12121a] p-8 rounded-2xl shadow-2xl border border-red-900/30 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Erro de Conexão</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-gradient-to-r from-brand to-brand-600 hover:from-brand-400 hover:to-brand text-white rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-brand/20 hover:shadow-brand/40"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#06060a] text-gray-200 font-sans overflow-hidden flex items-center justify-center p-4">
      <div className="w-full h-full bg-[#0a0a0f] rounded-2xl border border-white/5 overflow-hidden flex flex-col shadow-2xl">
        {/* Marquee CSS */}
        <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 700s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>

        {/* Background Effects */}
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-15%] left-[15%] w-[600px] h-[600px] bg-brand/8 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-15%] right-[15%] w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px]" />
        </div>
        <div
          className="fixed inset-0 pointer-events-none z-0 opacity-20"
          style={{
            backgroundImage:
              'linear-gradient(rgba(116,44,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(116,44,255,0.03) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />

        {/* ═══ HEADER ═══ */}
        <header className="relative z-10 border-b border-white/[0.06] bg-[#0a0a0f]/90 backdrop-blur-xl">
          {/* Top Row: Logo + Big Numbers + Progress */}
          <div className="mx-auto px-8 py-4 flex items-stretch justify-between">
            <div className="flex items-center gap-4">
              {/* Logo */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-brand to-accent rounded-xl blur opacity-40 group-hover:opacity-70 transition duration-500" />
                <img src={TD_LOGO_URL} alt="TD Business" className="relative w-10 h-10 rounded-xl object-cover border border-white/10 shadow-xl bg-[#12121a]" />
              </div>

              <div className="h-8 w-px bg-white/5" />

              {/* Title */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-brand to-brand-700 rounded-xl shadow-lg shadow-brand/20">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-black text-white tracking-tighter italic uppercase">
                    GYM RATS <span className="text-accent">2026</span>
                  </h1>
                  <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-widest flex items-center gap-1.5">
                    <Users className="w-3 h-3" /> {rankingData.length} Equipes <span className="text-gray-600">•</span> {rankingData.reduce((sum, t) => sum + (t.members?.length || 0), 0)} Participantes
                  </p>
                  <p className="text-[9px] text-gray-600 tracking-wider">
                    Atualizado em {(() => { const y = new Date(); y.setDate(y.getDate() - 1); const d = String(y.getDate()).padStart(2, '0'); const m = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'][y.getMonth()]; return `${d}-${m} às 23h59`; })()}
                  </p>
                </div>
              </div>
            </div>

            {/* Big Numbers + Activity Stats */}
            <div className="flex items-stretch gap-3">
              <div className="relative bg-white/[0.03] px-5 py-2.5 rounded-xl border border-white/[0.06] text-center overflow-hidden flex flex-col justify-center w-[140px]">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#742CFF] to-[#742CFF]/40" />
                <div className="flex items-center gap-2 justify-center">
                  <Flame className="w-4 h-4 text-[#742CFF]" />
                  <span className="text-xl font-black text-white"><AnimatedNumber value={bigNumbers.totalCalories} /></span>
                </div>
                <span className="text-[9px] uppercase tracking-widest text-gray-500 font-semibold">kcal queimadas</span>
              </div>
              <div className="relative bg-white/[0.03] px-2 py-2.5 rounded-xl border border-white/[0.06] text-center overflow-hidden flex flex-col justify-center w-[140px]">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#00FFB6] to-[#00FFB6]/40" />
                <div className="flex items-center justify-center gap-1.5">
                  <Route className="w-6 h-6 text-[#00FFB6] shrink-0" />
                  <span className="text-xl font-black text-white leading-none"><AnimatedNumber value={bigNumbers.totalDistanceKm} /></span>
                  <span className="text-xs text-gray-500 font-semibold self-end mb-0.5">km</span>
                </div>
                <span className="text-[9px] uppercase tracking-widest text-gray-500 font-semibold mt-0.5">percorridos</span>
              </div>


              {/* Separator */}
              {activityStats.length > 0 && <div className="w-px bg-white/[0.06] self-stretch" />}

              {/* Activity Stats - Stacked Card */}
              {activityStats.length > 0 && (
                <div className="relative bg-white/[0.03] px-4 py-2 rounded-xl border border-white/[0.06] overflow-hidden min-w-[200px]">
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#742CFF] to-[#00FFB6]" />
                  <span className="text-[8px] uppercase tracking-widest text-gray-500 font-semibold block mb-1.5">Atividades Mais Praticadas</span>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                    {activityStats.map((stat, idx) => {
                      const IconComp = stat.icon;
                      const color = ACTIVITY_COLORS[idx % ACTIVITY_COLORS.length];
                      return (
                        <div key={stat.key} className="flex items-center gap-2">
                          <IconComp className="w-3 h-3 shrink-0" style={{ color }} />
                          <span className="text-[10px] font-semibold text-gray-300 w-24 truncate">{stat.label}</span>
                          <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${stat.pct}%`, backgroundColor: color }} />
                          </div>
                          <span className="text-[10px] font-bold w-10 text-right" style={{ color: '#00FFB6' }}>{stat.pct.toFixed(1).replace('.', ',')}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {/* Separator */}
              <div className="w-px bg-white/[0.06] self-stretch" />

              {/* Progress Card - Enhanced */}
              <div className="relative bg-white/[0.03] px-5 py-3 rounded-xl border border-white/[0.06] overflow-hidden min-w-[280px] flex flex-col justify-center">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#742CFF] via-[#9B4DFF] to-[#00FFB6]" />
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[8px] uppercase tracking-widest text-gray-500 font-semibold">Desafio 45 Dias</span>
                  <span className="text-[10px] font-bold text-white bg-white/[0.06] px-2 py-0.5 rounded-md">Dia {progress.currentDay}<span className="text-gray-500 font-medium"> / 45</span></span>
                </div>

                {/* Countdown */}
                <div className="flex items-center gap-1.5 mb-2">
                  <Timer className="w-3.5 h-3.5 text-accent shrink-0" strokeWidth={2.5} />
                  <div className="flex items-center gap-1">
                    {[
                      { value: countdown.days, label: 'd' },
                      { value: countdown.hours, label: 'h' },
                      { value: countdown.minutes, label: 'm' },
                      { value: countdown.seconds, label: 's' }
                    ].map((unit, i) => (
                      <div key={unit.label} className="flex items-baseline">
                        {i > 0 && <span className="text-gray-600 mx-0.5 text-[10px]">:</span>}
                        <span className={`text-sm font-black text-white tabular-nums w-5 text-center ${unit.label === 's' ? 'animate-tick' : ''}`}>{String(unit.value).padStart(2, '0')}</span>
                        <span className="text-[8px] text-gray-500 font-semibold">{unit.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="relative w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${progress.pct}%`, background: 'linear-gradient(90deg, #742CFF, #9B4DFF, #00FFB6)', boxShadow: '0 0 14px rgba(116,44,255,0.5), 0 0 6px rgba(0,255,182,0.3)' }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[8px] text-gray-600 font-semibold">0%</span>
                  <span className="text-[8px] font-bold" style={{ color: '#00FFB6' }}>{progress.pct.toFixed(1).replace('.', ',')}%</span>
                  <span className="text-[8px] text-gray-600 font-semibold">100%</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ═══ MEDIA FEED ═══ */}
        {feedData.length > 0 && (
          <div className="relative z-10 border-b border-white/[0.06] bg-[#08080d]/60 py-4 overflow-hidden">
            <div className="flex w-max animate-scroll hover:pause">
              {[...feedData, ...feedData].map((url, idx) => (
                <MediaItem key={`${idx}-${url}`} url={url} />
              ))}
            </div>

            {/* Gradient Overlays */}
            <div className="absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-[#0a0a0f] to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-28 bg-gradient-to-l from-[#0a0a0f] to-transparent pointer-events-none" />

            <div className="absolute top-2 left-8 text-[9px] font-semibold uppercase tracking-widest text-white/40 bg-black/50 px-3 py-1 rounded-lg backdrop-blur-sm pointer-events-none flex items-center gap-1.5 border border-white/5">
              <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span>
              <Instagram className="w-3 h-3" /> Feed dos Participantes
            </div>
          </div>
        )}

        {/* ═══ MAIN CONTENT ═══ */}
        <main className="relative z-10 flex-1 px-8 py-6 overflow-hidden">
          <RankingView data={rankingData} fields={fields} />
        </main>

        {/* ═══ FOOTER ═══ */}
        <footer className="relative z-10 border-t border-white/[0.06] py-2.5 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#742CFF]/30 to-transparent" />
          <div className="flex items-center justify-center gap-4">
            <p className="text-gray-600 text-[10px] uppercase tracking-widest">Painel de Competição <span className="text-[#742CFF]">•</span> Temporada 2026 <span className="text-[#00FFB6]">•</span> Desenvolvido por Math Rosa</p>

          </div>
        </footer>
      </div>
    </div>
  );
}

function RankingView({ data, fields }) {
  if (!fields.pair || !fields.points) {
    return (
      <div className="text-center py-20 bg-white/[0.02] rounded-2xl border border-dashed border-white/10">
        <AlertCircle className="w-10 h-10 text-gray-600 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-300">Dados insuficientes</h3>
        <p className="text-gray-500 text-sm">Verifique as colunas da planilha.</p>
      </div>
    );
  }

  if (data.length === 0) return <div className="text-center p-10 text-gray-500">Sem dados.</div>;

  const maxTotal = data.reduce((max, item) => Math.max(max, item.total), 0);
  const podiumData = data.filter(item => item.total === maxTotal);
  const rest = data.filter(item => item.total < maxTotal);

  return (
    <div className="h-full flex gap-8">
      {/* PODIO */}
      <div className="w-1/2 flex flex-col gap-4 min-h-0">
        <div className="flex items-center justify-between">
          <h2 className="text-xs uppercase tracking-[0.3em] text-gray-400 font-bold flex items-center gap-2.5">
            <div className="w-1.5 h-5 bg-gradient-to-b from-[#742CFF] to-[#00FFB6] rounded-full" />
            Pódio
          </h2>
          <div className="text-[10px] text-gray-500 bg-white/[0.03] px-2.5 py-0.5 rounded-lg border border-white/5 uppercase tracking-widest">{podiumData.length} duplas no pódio</div>
        </div>

        <div className="flex-1 grid grid-cols-1 gap-3 auto-rows-fr overflow-y-auto pr-1 scrollbar-thin">
          {podiumData.map((item, idx) => (
            <PodiumCard key={idx} rank={item.rank} data={item} animDelay={idx * 120} />
          ))}
        </div>
      </div>

      {/* DIVIDER */}
      <div className="w-px animate-divider" />

      {/* TABELA */}
      <div className="w-1/2 flex flex-col gap-4 min-h-0">
        {rest.length > 0 && (
          <div className="flex-1 bg-white/[0.02] rounded-2xl border border-white/[0.06] overflow-hidden backdrop-blur-sm flex flex-col min-h-0">
            <div className="px-6 py-3 border-b border-white/[0.06] flex justify-between items-center bg-white/[0.03] shrink-0">
              <h3 className="font-semibold text-gray-300 text-xs uppercase tracking-wider flex items-center gap-2.5">
                <div className="w-1.5 h-5 bg-gradient-to-b from-[#742CFF] to-[#00FFB6] rounded-full" />
                Classificação Geral
              </h3>
              <span className="text-[10px] text-gray-500 bg-white/[0.04] px-2.5 py-0.5 rounded-lg border border-white/5">{rest.length} equipes</span>
            </div>
            <div className="divide-y divide-white/[0.03] overflow-y-auto flex-1 scrollbar-thin">
              {rest.map((item, idx) => (
                <div key={idx} className="animate-fade-in" style={{ animationDelay: `${(idx + podiumData.length) * 80}ms` }}>
                  <div className="relative flex items-center px-6 py-3 hover:bg-white/[0.03] transition-all duration-200 group">
                    <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#742CFF] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-r" />
                    <span className="w-9 font-mono text-gray-600 font-bold text-sm group-hover:text-[#742CFF] transition-colors">#{item.rank}</span>

                    <div className="flex -space-x-2 mr-4">
                      {item.members?.length > 0 ? (
                        item.members.map((member, i) => (
                          <Avatar key={i} src={member.image} className="w-8 h-8 rounded-full border-2 border-[#0a0a0f]" />
                        ))
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#12121a] border-2 border-[#0a0a0f] flex items-center justify-center text-[9px] text-gray-600">?</div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {item.members?.length > 0 ? (
                          item.members.map((member, i) => (
                            <React.Fragment key={i}>
                              {i > 0 && <Users className="w-3 h-3 text-gray-700 shrink-0" />}
                              <span className="font-semibold text-gray-300 group-hover:text-white transition-colors tracking-tight text-sm">
                                {member.formattedName}
                              </span>
                              <span className="text-[9px] font-bold text-gray-500 bg-white/[0.04] border border-white/[0.06] px-1.5 py-0.5 rounded-md">
                                {member.points}
                              </span>
                            </React.Fragment>
                          ))
                        ) : (
                          <span className="font-semibold text-gray-300 text-sm">{item.name}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="font-mono font-bold text-gray-400 bg-white/[0.03] px-3 py-1 rounded-lg text-xs border border-white/[0.06] group-hover:border-[#742CFF]/30 group-hover:text-[#00FFB6] group-hover:shadow-[0_0_12px_-3px_rgba(116,44,255,0.3)] transition-all duration-300">
                        {item.total} pts
                      </div>
                      {maxTotal - item.total > 0 && (
                        <span className="text-[9px] text-red-400/60 font-mono font-semibold">-{maxTotal - item.total}</span>
                      )}
                    </div>
                  </div>
                  {/* Mini progress bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/[0.02]">
                    <div className="h-full rounded-r-full transition-all duration-1000" style={{ width: `${maxTotal > 0 ? (item.total / maxTotal * 100) : 0}%`, background: 'linear-gradient(90deg, #742CFF, #00FFB6)', opacity: 0.3 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PodiumCard({ rank, data, animDelay = 0 }) {
  const isFirst = rank === 1;
  const isSecond = rank === 2;
  const isThird = rank === 3;

  let styles = {
    card: 'bg-white/[0.02] border-white/5 text-gray-400 hover:border-white/10',
    iconColor: 'text-gray-600',
    badge: 'bg-white/5 text-gray-400 border-white/10',
    glow: '',
    accentText: 'text-gray-400',
  };

  if (isFirst) {
    styles = {
      card: 'bg-gradient-to-r from-brand/10 via-brand/5 to-transparent border-brand/30 text-white ring-1 ring-brand/10',
      iconColor: 'text-accent',
      badge: 'bg-brand/10 text-brand-300 border-brand/20 backdrop-blur-md shadow-[0_0_15px_-3px_rgba(116,44,255,0.3)]',
      glow: 'shadow-[0_0_40px_-10px_rgba(116,44,255,0.25)]',
      accentText: 'text-accent',
    };
  } else if (isSecond) {
    styles = {
      card: 'bg-gradient-to-r from-white/[0.04] to-transparent border-white/10 text-gray-200',
      iconColor: 'text-gray-400',
      badge: 'bg-white/5 text-gray-300 border-white/10 backdrop-blur-md shadow-[0_0_15px_-3px_rgba(255,255,255,0.1)]',
      glow: 'shadow-[0_0_20px_-5px_rgba(255,255,255,0.05)]',
      accentText: 'text-gray-400',
    };
  } else if (isThird) {
    styles = {
      card: 'bg-gradient-to-r from-amber-900/10 to-transparent border-amber-800/30 text-amber-100',
      iconColor: 'text-amber-500',
      badge: 'bg-amber-500/10 text-amber-200 border-amber-500/20 backdrop-blur-md shadow-[0_0_15px_-3px_rgba(245,158,11,0.2)]',
      glow: 'shadow-[0_0_20px_-5px_rgba(245,158,11,0.1)]',
      accentText: 'text-amber-400',
    };
  }

  const Icon = isFirst ? Crown : Medal;

  return (
    <div className={`
      relative flex items-center gap-5 p-5 rounded-2xl border transition-all duration-300 hover:translate-x-1 overflow-hidden h-full animate-fade-in
      ${styles.card} ${styles.glow} ${isFirst ? 'shimmer-overlay' : ''}
    `} style={{ animationDelay: `${animDelay}ms` }}>
      {/* Rank Badge */}
      <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg ${styles.badge}`}>
        {isFirst ? '🥇' : isSecond ? '🥈' : isThird ? '🥉' : `#${rank}`}
      </div>

      {/* Avatares */}
      <div className="flex -space-x-2 shrink-0">
        {data.members?.length > 0 ? (
          data.members.map((member, idx) => (
            <Avatar
              key={idx}
              src={member.image}
              className={`rounded-full border-2 border-[#0a0a0f] ${isFirst ? 'w-12 h-12' : 'w-10 h-10'}`}
              fallbackText="?"
            />
          ))
        ) : (
          <div className={`rounded-full border-2 border-[#0a0a0f] bg-[#12121a] flex items-center justify-center text-gray-600 font-bold ${isFirst ? 'w-12 h-12' : 'w-10 h-10'} text-sm`}>?</div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Icon className={`w-4 h-4 shrink-0 ${styles.iconColor}`} strokeWidth={1.5} />
          {data.members?.length > 0 ? (
            data.members.map((member, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <Users className="w-3.5 h-3.5 text-gray-700 shrink-0" />}
                <span className={`font-bold leading-tight tracking-tight ${isFirst ? 'text-base' : 'text-sm opacity-90'}`}>
                  {member.formattedName}
                </span>
                <span className={`text-[9px] font-bold px-1.5 py-0 rounded-full bg-white/5 border border-white/5 ${styles.accentText}`}>
                  {member.points}
                </span>
              </React.Fragment>
            ))
          ) : (
            <h3 className={`font-bold leading-tight truncate tracking-tight ${isFirst ? 'text-base' : 'text-sm opacity-90'}`}>
              {data.name}
            </h3>
          )}
        </div>
      </div>

      {/* Pontuacao */}
      <div className={`shrink-0 font-mono font-bold tracking-tight ${isFirst ? 'text-2xl' : 'text-lg'}`}>
        {data.total} <span className="text-[10px] font-sans font-normal opacity-50">pts</span>
      </div>


    </div>
  );
}
