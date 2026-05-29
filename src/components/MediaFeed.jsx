import { Instagram } from 'lucide-react';
import { MediaItem } from './MediaItem';

export function MediaFeed({ feedData }) {
  if (!feedData || feedData.length === 0) return null;

  return (
    <div className="hidden md:block relative z-10 border-b border-white/[0.04] bg-[#08080d]/40 py-2.5 overflow-hidden">
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 280s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
      <div className="flex w-max animate-scroll">
        {[...feedData, ...feedData, ...feedData].map((url, idx) => (
          <MediaItem key={`${idx}-${url}`} url={url} />
        ))}
      </div>

      <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#030305] to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#030305] to-transparent pointer-events-none" />

      <div className="absolute top-1.5 left-4 text-[9px] font-medium uppercase tracking-widest text-white/40 flex items-center gap-1.5">
        <Instagram className="w-3 h-3" /> Feed
      </div>
    </div>
  );
}
