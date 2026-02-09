import React, { useState, useEffect, useMemo } from 'react';
import { Loader2, AlertCircle, Trophy, Medal, Crown, Users, Calendar, Timer, Instagram } from 'lucide-react';

const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRAQdbRC3Pj39q2uwzwzcIMXHjnebOgEiWCEClH6RTEt_7bG3arvWLjng8MIqz-KrbpM8T_r8PHyYgh/pub?gid=761223336&single=true&output=csv";
const FEED_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR7yHWFR9qtahU0vlYZ_QKi24OUChWc5kW93NvTHIZMG4rdp5ED5iOkHTwFAxVc8TxPUlxGudvdDduE/pub?gid=53383827&single=true&output=csv";
const TD_LOGO_URL = "https://media.licdn.com/dms/image/v2/D4D0BAQFOeA8IeerkJw/company-logo_200_200/B4DZjN0W.LGkAY-/0/1755799712104/tdbusiness_logo?e=1772064000&v=beta&t=mZSjFsHz9QBV0SfMrZwyA6SAfslEO6lt4HZ2tzmSH1M";

// Configuracoes do Desafio
const CHALLENGE_START = new Date('2026-02-01T00:00:00');
const CHALLENGE_END = new Date('2026-03-17T23:59:59');

// --- Utilitarios ---

// Funcao para converter texto para Title Case (Iniciais Maiusculas)
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
    title: headers.find(h => /nome|name|title|titulo|modelo|produto/i.test(h)) || headers[0],
    image: headers.find(h => /img|image|foto|pic|url|src|thumbnail/i.test(h)),
    points: headers.find(h => /ponto|point|score|nota|pts|total|dias/i.test(h)),
    pair: headers.find(h => /dupla|pair|equipe|team|time|participante/i.test(h))
  };
  return roles;
};

// Componente de Avatar Otimizado
const Avatar = ({ src, className, fallbackText = "?" }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
        <div className={`${className} flex items-center justify-center bg-slate-800 text-slate-500 font-bold`}>
            {fallbackText}
        </div>
    );
  }

  return (
    <div className={`${className} relative bg-slate-800 overflow-hidden`}>
      {!loaded && <div className="absolute inset-0 bg-slate-700 animate-pulse" />}
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

// Componente de Midia do Feed Otimizado
function MediaItem({ url }) {
    const [loaded, setLoaded] = useState(false);
    const isVideo = url.match(/\.(mp4|mov|webm)$/i);

    return (
        <div className="relative mx-2 w-48 h-32 md:w-64 md:h-40 rounded-lg overflow-hidden border border-slate-800 bg-slate-900 shrink-0 group transition-transform hover:scale-105 hover:z-20 hover:border-slate-600 cursor-pointer shadow-lg">
            {/* Loading State */}
            {!loaded && (
                <div className="absolute inset-0 bg-slate-800 animate-pulse flex items-center justify-center z-0">
                    <Loader2 className="w-6 h-6 text-slate-600 animate-spin" />
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

  useEffect(() => {
    // 1. Carregar CSV do Ranking
    const fetchRanking = fetch(CSV_URL)
      .then(r => { if (!r.ok) throw new Error("Erro Ranking"); return r.text(); })
      .then(text => {
        const rawData = parseCSV(text);
        const { data: jsonData, headers } = csvToJson(rawData);
        if (jsonData.length === 0) throw new Error("CSV Ranking vazio.");
        setData(jsonData);
        setFields(guessFieldRoles(headers));
      });

    // 2. Carregar CSV do Feed
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

    Promise.all([fetchRanking, fetchFeed])
      .then(() => setLoading(false))
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });

    // Calcular Progresso
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
        
        // Adiciona pontos ao total da dupla
        scores[pairId].total += points;
        
        // Logica para pontos individuais
        if (memberName) {
            // Procura se o membro ja existe na lista desta dupla
            let existingMember = scores[pairId].members.find(m => m.name === memberName);
            
            if (existingMember) {
                existingMember.points += points;
                // Atualiza imagem se nao tiver e agora veio
                if (!existingMember.image && memberImage) existingMember.image = memberImage;
            } else {
                // Cria novo membro
                scores[pairId].members.push({
                    name: memberName, // Mantem original aqui para busca, formata na exibicao
                    image: memberImage,
                    points: points
                });
            }
        }
      }
    });

    const sortedList = Object.values(scores)
      .map(score => {
        // Formata nomes para Title Case
        const formattedMembers = score.members.map(m => ({
            ...m,
            formattedName: toTitleCase(m.name)
        }));

        const names = formattedMembers.map(m => m.formattedName).join(' & ');

        return {
            name: names.length > 0 ? names : `Dupla ${score.id}`,
            total: score.total,
            originalId: score.id,
            members: formattedMembers // Passamos a lista completa de membros com pontos
        };
      })
      .sort((a, b) => b.total - a.total);
      
    let currentRank = 1;
    for (let i = 0; i < sortedList.length; i++) {
        if (i > 0 && sortedList[i].total < sortedList[i-1].total) {
            currentRank = i + 1;
        }
        sortedList[i].rank = currentRank;
    }
    
    return sortedList;
  }, [data, fields]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
          <p className="text-slate-500 font-medium text-sm tracking-wide">CARREGANDO GYM RATS...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 p-8 rounded-2xl shadow-2xl border border-red-900/50 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Erro de Conexao</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors">
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-yellow-500/30 overflow-x-hidden">
      {/* Styles for Marquee Animation */}
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 420s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Background Glow Effect */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-yellow-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[20%] w-[400px] h-[400px] bg-indigo-900/20 rounded-full blur-[100px]" />
      </div>
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-30"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '36px 36px'
        }}
      />

      <header className="relative z-10 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 md:gap-6">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-600 to-indigo-600 rounded-lg blur opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <img src={TD_LOGO_URL} alt="TD Business" className="relative w-14 h-14 md:w-16 md:h-16 rounded-lg object-cover border border-slate-800 shadow-xl bg-slate-900" />
            </div>
            
            <div className="h-10 w-px bg-slate-800 hidden sm:block"></div>

            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-xl shadow-lg shadow-yellow-900/20 hidden sm:block">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter italic uppercase">
                  GYM RATS <span className="text-yellow-500">2026</span>
                </h1>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2 mt-1">
                  <Users className="w-3 h-3" /> {rankingData.length} Equipes Competindo
                </p>
              </div>
            </div>
          </div>

          <div className="w-full md:w-96 bg-slate-900/50 p-4 rounded-xl border border-slate-800/60">
            <div className="flex justify-between items-end mb-2">
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-0.5">Desafio 45 Dias</span>
                    <span className="text-sm font-bold text-white flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-yellow-500" /> 
                        Dia {progress.currentDay} <span className="text-slate-600">/ 45</span>
                    </span>
                </div>
                <div className="text-right">
                    <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Faltam</span>
                    <div className="text-sm font-bold text-white flex items-center justify-end gap-1.5">
                        <Timer className="w-3.5 h-3.5 text-indigo-400" />
                        {progress.daysLeft} dias
                    </div>
                </div>
            </div>
            <div className="relative w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-600 to-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.5)] transition-all duration-1000 ease-out"
                    style={{ width: `${progress.pct}%` }}
                />
            </div>
          </div>
        </div>
      </header>

      {/* MEDIA TICKER FEED */}
      {feedData.length > 0 && (
        <div className="relative z-10 border-y border-slate-800 bg-black/40 py-4 overflow-hidden">
            <div className="flex w-max animate-scroll hover:pause">
                {[...feedData, ...feedData].map((url, idx) => (
                    <MediaItem key={`${idx}-${url}`} url={url} />
                ))}
            </div>
            
            {/* Gradient Overlays */}
            <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-slate-950 to-transparent pointer-events-none"></div>
            <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-slate-950 to-transparent pointer-events-none"></div>
            
            <div className="absolute top-2 left-6 text-[10px] font-bold uppercase tracking-widest text-white/50 bg-black/50 px-2 py-1 rounded backdrop-blur-sm pointer-events-none flex items-center gap-1">
                 <Instagram className="w-3 h-3" /> Feed dos Participantes
            </div>
        </div>
      )}

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <RankingView data={rankingData} fields={fields} />
      </main>

       <footer className="relative z-10 border-t border-slate-900 py-8 mt-12 text-center">
         <p className="text-slate-600 text-xs uppercase tracking-widest">Painel de Competicao • Temporada 2026</p>
         <p className="text-slate-600 text-xs uppercase tracking-widest mt-2">Desenvolvido por Math Rosa</p>
       </footer>
    </div>
  );
}

function RankingView({ data, fields }) {
  if (!fields.pair || !fields.points) {
    return (
      <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-dashed border-slate-800">
        <AlertCircle className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-slate-300">Dados insuficientes</h3>
        <p className="text-slate-500 text-sm">Verifique as colunas da planilha.</p>
      </div>
    );
  }

  if (data.length === 0) return <div className="text-center p-10 text-slate-500">Sem dados.</div>;

  const maxTotal = data.reduce((max, item) => Math.max(max, item.total), 0);
  const podiumData = data.filter(item => item.total === maxTotal);
  const rest = data.filter(item => item.total < maxTotal);

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <h2 className="text-sm uppercase tracking-[0.35em] text-slate-400 font-bold">Podio</h2>
        <div className="text-xs text-slate-500 uppercase tracking-widest">Empate maximo</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center items-stretch auto-rows-fr">
        {podiumData.map((item, idx) => (
            <PodiumCard key={idx} rank={item.rank} data={item} />
        ))}
      </div>

      {rest.length > 0 && (
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
          <span className="text-[10px] uppercase tracking-[0.35em] text-slate-500">Restante</span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
        </div>
      )}

      {rest.length > 0 && (
        <div className="bg-slate-900/50 rounded-2xl border border-slate-800/60 overflow-hidden backdrop-blur-sm">
          <div className="px-6 py-4 border-b border-slate-800/60 flex justify-between items-center bg-slate-900/80">
            <h3 className="font-semibold text-slate-300 text-sm uppercase tracking-wider">Classificacao Geral</h3>
          </div>
          <div className="divide-y divide-slate-800/60">
            {rest.map((item, idx) => (
              <div key={idx} className="flex items-center px-6 py-4 hover:bg-slate-800/40 transition-colors group">
                <span className="w-12 font-mono text-slate-500 font-bold text-lg group-hover:text-yellow-500 transition-colors">#{item.rank}</span>
                
                <div className="flex -space-x-2 mr-6">
                    {item.members?.length > 0 ? (
                        item.members.map((member, i) => (
                            <Avatar key={i} src={member.image} className="w-8 h-8 rounded-full border-2 border-slate-900" />
                        ))
                    ) : (
                         <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[10px] text-slate-500">?</div>
                    )}
                </div>

                <div className="flex-1">
                  <div className="font-medium text-slate-300 group-hover:text-white transition-colors tracking-tight">
                      {item.name}
                  </div>
                  {item.members?.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-2">
                      {item.members.map((member, i) => (
                        <span
                          key={i}
                          className="text-[10px] uppercase tracking-wide text-slate-400 bg-slate-900/70 border border-slate-800 px-2 py-0.5 rounded-full"
                        >
                          {member.formattedName}: {member.points} pts
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="font-mono font-bold text-slate-400 bg-slate-950 px-3 py-1 rounded-md text-sm border border-slate-800 group-hover:border-yellow-900/30 group-hover:text-yellow-500 transition-all">
                  {item.total} pts
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PodiumCard({ rank, data }) {
  const isFirst = rank === 1;
  const isSecond = rank === 2;
  const isThird = rank === 3;
  
  let styles = {
    card: 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700',
    iconColor: 'text-slate-600',
    badge: 'bg-slate-800 text-slate-400 border-slate-700',
    glow: '',
    height: 'min-h-[220px]'
  };

  if (isFirst) {
    styles = {
      card: 'bg-gradient-to-b from-yellow-900/20 to-slate-900 border-yellow-600/50 text-yellow-100 ring-1 ring-yellow-500/20',
      iconColor: 'text-yellow-500',
      badge: 'bg-yellow-500 text-yellow-950 border-yellow-400 font-bold',
      glow: 'shadow-[0_0_40px_-10px_rgba(234,179,8,0.2)]',
      height: 'min-h-[280px]'
    };
  } else if (isSecond) {
    styles = {
      card: 'bg-gradient-to-b from-slate-800/40 to-slate-900 border-slate-600/50 text-slate-200',
      iconColor: 'text-slate-400',
      badge: 'bg-slate-300 text-slate-900 border-slate-200 font-bold',
      glow: 'shadow-[0_0_20px_-5px_rgba(148,163,184,0.1)]',
      height: 'min-h-[250px]'
    };
  } else if (isThird) {
    styles = {
      card: 'bg-gradient-to-b from-orange-900/20 to-slate-900 border-orange-800/50 text-orange-100',
      iconColor: 'text-orange-500',
      badge: 'bg-orange-600 text-orange-100 border-orange-500 font-bold',
      glow: 'shadow-[0_0_20px_-5px_rgba(249,115,22,0.1)]',
      height: 'min-h-[250px]'
    };
  }

  const Icon = isFirst ? Crown : Medal;

  return (
    <div className={`
      relative flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 h-full
      ${styles.card} ${styles.height} ${styles.glow}
    `}>
      <div className="absolute top-4 right-4 text-[10px] font-bold opacity-40 uppercase tracking-widest border border-current px-2 py-0.5 rounded-full">
         Time {data.originalId}
      </div>

      <div className="flex flex-col items-center w-full z-10">
        <Icon className={`w-8 h-8 mb-4 ${styles.iconColor}`} strokeWidth={1.5} />
        
        {/* Avatares e Pontos Individuais */}
        <div className="flex justify-center gap-4 mb-5">
            {data.members?.length > 0 ? (
                data.members.map((member, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                        <Avatar 
                            src={member.image} 
                            className={`rounded-full border-4 border-slate-900 ${isFirst ? 'w-20 h-20' : 'w-16 h-16'} mb-2`}
                            fallbackText="?"
                        />
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700 ${isFirst ? 'text-yellow-400' : 'text-slate-400'}`}>
                            {member.points} pts
                        </span>
                    </div>
                ))
            ) : (
                <div className={`rounded-full border-4 border-slate-900 bg-slate-800 flex items-center justify-center text-slate-600 font-bold ${isFirst ? 'w-20 h-20 text-2xl' : 'w-16 h-16 text-xl'}`}>?</div>
            )}
        </div>

        <h3 className={`font-bold text-center leading-tight line-clamp-2 px-2 tracking-tight ${isFirst ? 'text-xl' : 'text-base opacity-90'}`}>
          {data.name}
        </h3>
        
        <div className={`mt-3 font-mono font-bold tracking-tight opacity-90 ${isFirst ? 'text-4xl' : 'text-2xl'}`}>
          {data.total} <span className="text-sm font-sans font-normal opacity-60">pts</span>
        </div>
      </div>

      <div className={`absolute -bottom-3 px-4 py-1 rounded-full border text-sm shadow-lg z-20 ${styles.badge}`}>
        #{rank}
      </div>
    </div>
  );
}
