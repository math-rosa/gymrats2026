import { Instagram } from 'lucide-react';
import { MediaItem } from './MediaItem';

export function MediaFeed({ feedData }) {
  if (!feedData || feedData.length === 0) return null;

  return (
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
  );
}
