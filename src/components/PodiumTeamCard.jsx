import { useState, useEffect, useRef } from 'react';
import { Crown, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { AnimatedNumber } from './AnimatedNumber';
import { MemberTooltip } from './MemberTooltip';
import { TeamTooltip } from './TeamTooltip';

const TrendIcon = ({ trend, size }) => {
  if (!trend) return null;
  const px = size || 10;
  if (trend === 'up') return <TrendingUp className="text-emerald-400 shrink-0" style={{ width: px, height: px }} />;
  if (trend === 'down') return <TrendingDown className="text-rose-400 shrink-0" style={{ width: px, height: px }} />;
  return <Minus className="text-gray-500 shrink-0" style={{ width: px, height: px }} />;
};

export function PodiumTeamCard({ config, team, isMobile }) {
  const listRef = useRef(null);
  const [dynamicStyles, setDynamicStyles] = useState(null);

  useEffect(() => {
    if (isMobile || !listRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const availableHeight = entry.contentRect.height;
        const memberCount = team.members.length || 1;
        const rowHeight = Math.max(16, availableHeight / memberCount);
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

      <div
        className="px-2 py-3 flex flex-col items-center justify-center text-center text-white relative shrink-0 gap-2.5 rounded-t-[20px]"
        style={{
          background: `linear-gradient(160deg, ${config.accentColor}28 0%, ${config.accentColor}0a 100%)`,
          borderBottom: `1px solid ${config.accentColor}35`,
        }}
      >
        <div className="flex items-center gap-2">
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
          <TeamTooltip team={team} accentColor={config.accentColor}>
            <div
              className="px-4 py-1.5 rounded-xl flex items-baseline gap-1.5 cursor-help"
              style={{
                background: `linear-gradient(135deg, ${config.accentColor}26 0%, ${config.accentColor}0d 100%)`,
                border: `1px solid ${config.accentColor}55`,
                boxShadow: `0 0 24px ${config.accentColor}33, inset 0 1px 0 ${config.accentColor}22`,
              }}
            >
              <span
                className="leading-none font-black"
                style={{
                  fontSize: config.rank === 1 ? '30px' : '26px',
                  color: '#FFFFFF',
                  textShadow: `0 0 14px ${config.accentColor}cc, 0 0 4px ${config.accentColor}`,
                }}
              >
                <AnimatedNumber value={team.total} />
              </span>
              <span
                className="text-[10px] uppercase tracking-[0.2em] font-bold"
                style={{ color: config.accentColor }}
              >
                pts
              </span>
            </div>
          </TeamTooltip>
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
                  <TrendIcon trend={m.trend} size={isMobile ? 11 : Math.max(9, ds.fontSize * 0.85)} />
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
