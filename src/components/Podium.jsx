import { PodiumTeamCard } from './PodiumTeamCard';

const TEAM_COLORS = {
  'AZUL':    { accentColor: '#3B82F6', glowColor: 'rgba(59,130,246,0.30)' },
  'ROXO':    { accentColor: '#8B5CF6', glowColor: 'rgba(139,92,246,0.25)' },
  'ROSA':    { accentColor: '#EC4899', glowColor: 'rgba(236,72,153,0.25)' },
  'VERDE':   { accentColor: '#10B981', glowColor: 'rgba(16,185,129,0.25)' },
  'LARANJA': { accentColor: '#F97316', glowColor: 'rgba(249,115,22,0.25)' },
};

const DEFAULT_COLORS = [
  { accentColor: '#3B82F6', glowColor: 'rgba(59,130,246,0.30)' },
  { accentColor: '#8B5CF6', glowColor: 'rgba(139,92,246,0.25)' },
  { accentColor: '#EC4899', glowColor: 'rgba(236,72,153,0.25)' },
  { accentColor: '#F97316', glowColor: 'rgba(249,115,22,0.25)' },
  { accentColor: '#10B981', glowColor: 'rgba(16,185,129,0.25)' },
];

const POSITIONS = [
  { rank: 4, height: '78%', place: '4º' },
  { rank: 2, height: '88%', place: '2º' },
  { rank: 1, height: '100%', place: '1º', isWinner: true },
  { rank: 3, height: '88%', place: '3º' },
  { rank: 5, height: '78%', place: '5º' },
];

export function Podium({ rankingData }) {
  const paddedData = [...rankingData];
  while (paddedData.length < 5) paddedData.push(null);

  const podiumRender = POSITIONS.map((pos) => {
    const team = paddedData[pos.rank - 1];
    let colors = DEFAULT_COLORS[pos.rank - 1];

    if (team && team.name) {
      const teamName = team.name.toUpperCase();
      if (TEAM_COLORS[teamName]) {
        colors = TEAM_COLORS[teamName];
      }
    }

    return { ...pos, accentColor: colors.accentColor, glowColor: colors.glowColor, team };
  });

  const mobilePodiumRender = [...podiumRender].sort((a, b) => a.rank - b.rank);

  return (
    <div className="flex flex-col items-center md:justify-end w-full md:h-full max-w-[1600px] mx-auto relative">

      <div className="hidden md:flex items-end justify-center gap-1.5 sm:gap-2 md:gap-3 lg:gap-5 w-full h-full px-2 sm:px-6 pt-6 z-10 relative">
        {podiumRender.map((item, idx) => {
          if (!item.team) return <div key={idx} className="w-[20%] min-w-0" />;
          return <PodiumTeamCard key={idx} config={item} team={item.team} isMobile={false} />;
        })}
      </div>

      <div className="flex md:hidden flex-col gap-3 w-full px-3 z-10 relative pb-4">
        {mobilePodiumRender.map((item, idx) => {
          if (!item.team) return null;
          return <PodiumTeamCard key={idx} config={item} team={item.team} isMobile={true} />;
        })}
      </div>
    </div>
  );
}
