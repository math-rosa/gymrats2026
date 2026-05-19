import { Timer } from 'lucide-react';
import { useCountdown } from '../hooks/useCountdown';

export function ChallengeCountdown({ startDate, endDate }) {
  const { timeLeft, progress } = useCountdown(startDate, endDate);
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
