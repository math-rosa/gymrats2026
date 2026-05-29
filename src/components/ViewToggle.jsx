import { Trophy, Users } from 'lucide-react';

export function ViewToggle({ view, onChange }) {
  const options = [
    { id: 'podium', label: 'Pódio', Icon: Trophy },
    { id: 'individual', label: 'Individual', Icon: Users },
  ];

  return (
    <div className="inline-flex items-center bg-[#12121a]/80 border border-white/[0.06] rounded-xl p-1 gap-1 shadow-md">
      {options.map(({ id, label, Icon }) => {
        const active = view === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${
              active
                ? 'bg-white/[0.08] text-white shadow-inner'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
