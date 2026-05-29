import { useState, useMemo } from 'react';
import { Search, TrendingUp, TrendingDown, Minus, ArrowUpDown, ArrowUp, ArrowDown, X } from 'lucide-react';

const TEAM_COLORS = {
  AZUL: '#3B82F6',
  ROXO: '#8B5CF6',
  ROSA: '#EC4899',
  VERDE: '#10B981',
  LARANJA: '#F97316',
};

const flattenMembers = (rankingData) => {
  const result = [];
  rankingData.forEach((team) => {
    team.members.forEach((m) => {
      result.push({
        ...m,
        teamName: team.name,
        teamId: team.id,
        teamColor: TEAM_COLORS[team.id] || '#9CA3AF',
      });
    });
  });
  return result;
};

export function IndividualPanel({ rankingData }) {
  const [query, setQuery] = useState('');
  const [excludedTeams, setExcludedTeams] = useState(() => new Set());
  const [sortBy, setSortBy] = useState({ field: 'points', dir: 'desc' });

  const allMembers = useMemo(() => flattenMembers(rankingData), [rankingData]);

  const teams = useMemo(
    () =>
      rankingData.map((t) => ({
        id: t.id,
        name: t.name,
        color: TEAM_COLORS[t.id] || '#9CA3AF',
      })),
    [rankingData]
  );

  const filtered = useMemo(() => {
    let list = allMembers;

    if (query.trim()) {
      const q = query.toLowerCase().trim();
      list = list.filter(
        (m) =>
          m.formattedName.toLowerCase().includes(q) ||
          m.name.toLowerCase().includes(q)
      );
    }

    if (excludedTeams.size > 0) {
      list = list.filter((m) => !excludedTeams.has(m.teamId));
    }

    return [...list].sort((a, b) => {
      const mult = sortBy.dir === 'desc' ? -1 : 1;
      if (sortBy.field === 'name') {
        return a.formattedName.localeCompare(b.formattedName) * mult;
      }
      if (sortBy.field === 'team') {
        return a.teamName.localeCompare(b.teamName) * mult;
      }
      return ((a[sortBy.field] || 0) - (b[sortBy.field] || 0)) * mult;
    });
  }, [allMembers, query, excludedTeams, sortBy]);

  const toggleTeam = (teamId) => {
    setExcludedTeams((prev) => {
      const next = new Set(prev);
      if (next.has(teamId)) next.delete(teamId);
      else next.add(teamId);
      return next;
    });
  };

  const clearFilters = () => {
    setQuery('');
    setExcludedTeams(new Set());
  };

  const setSort = (field) => {
    setSortBy((prev) => {
      if (prev.field === field) {
        return { field, dir: prev.dir === 'desc' ? 'asc' : 'desc' };
      }
      return { field, dir: field === 'name' || field === 'team' ? 'asc' : 'desc' };
    });
  };

  const hasFilters = query.trim() !== '' || excludedTeams.size > 0;

  return (
    <div className="w-full max-w-5xl mx-auto bg-[#0e0e16]/85 backdrop-blur-md border border-white/[0.06] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:max-h-full">
      <div className="p-4 border-b border-white/[0.06] flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar competidor..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/20"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mr-1">
            Times:
          </span>
          {teams.map((t) => {
            const active = !excludedTeams.has(t.id);
            return (
              <button
                key={t.id}
                onClick={() => toggleTeam(t.id)}
                className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all"
                style={{
                  background: active ? `${t.color}26` : 'transparent',
                  border: `1px solid ${active ? t.color : '#ffffff10'}`,
                  color: active ? t.color : '#6B7280',
                  opacity: active ? 1 : 0.55,
                }}
              >
                {t.name}
              </button>
            );
          })}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] uppercase tracking-wider text-gray-500 hover:text-gray-300 transition-colors"
              title="Limpar filtros"
            >
              <X className="w-3 h-3" />
              Limpar
            </button>
          )}
        </div>
      </div>

      <div className="overflow-auto flex-1 min-h-0">
        <table className="w-full min-w-[1400px]">
          <thead className="sticky top-0 bg-[#12121a] z-10">
            <tr className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">
              <th className="px-4 py-3 text-left w-12 sticky left-0 bg-[#12121a] z-20">#</th>
              <SortableHeader field="name" label="Nome" sortBy={sortBy} setSort={setSort} align="left" className="sticky left-12 bg-[#12121a] z-20 min-w-[160px]" />
              <SortableHeader field="team" label="Time" sortBy={sortBy} setSort={setSort} align="center" className="min-w-[90px]" />
              <th className="px-3 py-3 text-center w-16">Sem 1</th>
              <th className="px-3 py-3 text-center w-16">Sem 2</th>
              <th className="px-3 py-3 text-center w-16">Sem 3</th>
              <th className="px-3 py-3 text-center w-16">Sem 4</th>
              <th className="px-3 py-3 text-center w-16">Sem 5</th>
              <th className="px-3 py-3 text-center w-16">Sem 6</th>
              <th className="px-3 py-3 text-center w-16">Sem 7</th>
              <th className="px-3 py-3 text-center w-24">D1 - 100k</th>
              <th className="px-3 py-3 text-center w-24">D2 - Conv</th>
              <th className="px-3 py-3 text-center w-24">D3 - Equipe</th>
              <th className="px-3 py-3 text-center w-24">D4 - Mãe</th>
              <th className="px-3 py-3 text-center w-24">D5 - Extra</th>
              <th className="px-3 py-3 text-center w-16">D6</th>
              <th className="px-3 py-3 text-center w-24">DR - Pose</th>
              <th className="px-3 py-3 text-center w-20">Gincana</th>
              <SortableHeader field="points" label="Check-in" sortBy={sortBy} setSort={setSort} align="center" className="min-w-[90px]" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((m, i) => (
              <tr
                key={`${m.teamId}-${m.memberKey}`}
                className="border-t border-white/[0.03] hover:bg-white/[0.02] transition-colors"
              >
                <td className="px-4 py-2.5 text-gray-500 font-mono text-xs sticky left-0 bg-[#0e0e16] z-10">{i + 1}</td>
                <td className="px-4 py-2.5 text-white text-sm font-semibold sticky left-12 bg-[#0e0e16] z-10 truncate">
                  {m.formattedName}
                  {m.extraPoints && m.extraPoints !== '0' && (
                    <span className="ml-2 text-[10px] font-black text-emerald-400">+{m.extraPoints}</span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-center">
                  <span
                    className="inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider"
                    style={{
                      background: `${m.teamColor}26`,
                      color: m.teamColor,
                      border: `1px solid ${m.teamColor}40`,
                    }}
                  >
                    {m.teamName}
                  </span>
                </td>
                {renderCell(m.weeks?.s1, m.teamColor)}
                {renderCell(m.weeks?.s2, m.teamColor)}
                {renderCell(m.weeks?.s3, m.teamColor)}
                {renderCell(m.weeks?.s4, m.teamColor)}
                {renderCell(m.weeks?.s5, m.teamColor)}
                {renderCell(m.weeks?.s6, m.teamColor)}
                {renderCell(m.weeks?.s7, m.teamColor)}
                {renderCell(m.challenges?.d1, m.teamColor)}
                {renderCell(m.challenges?.d2, m.teamColor)}
                {renderCell(m.challenges?.d3, m.teamColor)}
                {renderCell(m.challenges?.d4, m.teamColor)}
                {renderCell(m.challenges?.d5, m.teamColor)}
                {renderCell(m.challenges?.d6, m.teamColor)}
                {renderCell(m.challenges?.dr, m.teamColor)}
                {renderCell(m.challenges?.gincana, m.teamColor)}
                <td className="px-4 py-2.5 text-center text-white text-sm font-bold">{m.points}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500 text-sm">
            Nenhum competidor encontrado.
          </div>
        )}
      </div>

      <div className="px-4 py-2.5 border-t border-white/[0.06] text-[10px] uppercase tracking-widest text-gray-500 font-bold flex items-center justify-between">
        <span>
          {filtered.length} {filtered.length === 1 ? 'competidor' : 'competidores'}
        </span>
        {hasFilters && <span className="text-gray-600">filtros ativos</span>}
      </div>
    </div>
  );
}

const renderCell = (val, teamColor) => {
  const isZero = !val || val === '0' || val === '0,0' || val === '';
  return (
    <td className="px-3 py-2.5 text-center font-mono text-xs">
      <span 
        className="font-bold" 
        style={{ color: isZero ? '#374151' : teamColor }}
      >
        {val || '0'}
      </span>
    </td>
  );
};

function SortableHeader({ field, label, sortBy, setSort, align, className }) {
  const active = sortBy.field === field;
  const Icon = !active ? ArrowUpDown : sortBy.dir === 'desc' ? ArrowDown : ArrowUp;
  const alignClass = align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start';
  const thAlign = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';

  return (
    <th
      className={`px-4 py-3 ${thAlign} cursor-pointer select-none hover:text-gray-300 transition-colors ${className || ''}`}
      onClick={() => setSort(field)}
    >
      <div className={`flex items-center gap-1.5 ${alignClass}`}>
        {label}
        <Icon className={`w-3 h-3 ${active ? 'text-white' : 'opacity-40'}`} />
      </div>
    </th>
  );
}
