import { AnimatedNumber } from './AnimatedNumber';

export function StatCard({ icon: Icon, color, value, label }) {
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
