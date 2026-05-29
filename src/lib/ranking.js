export const toTitleCase = (str) => {
  if (!str) return "";
  const words = str.toLowerCase().split(' ').filter(w => w.length > 0);
  return words.slice(0, 2).map(word => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
};

const parseWeekValue = (v) => parseFloat(v?.toString().replace(',', '.')) || 0;

const WEEK_KEYS = ['s1', 's2', 's3', 's4', 's5', 's6', 's7'];

const findCurrentWeekIdx = (details) => {
  if (!details) return 0;
  for (let i = WEEK_KEYS.length - 1; i >= 0; i--) {
    if (parseWeekValue(details[WEEK_KEYS[i]]) > 0) return i + 1;
  }
  return 0;
};

const computeMemberTrend = (weeks, currentWeekIdx) => {
  if (!weeks || currentWeekIdx < 2) return null;
  const curr = parseWeekValue(weeks[`s${currentWeekIdx}`]);
  const prev = parseWeekValue(weeks[`s${currentWeekIdx - 1}`]);
  if (curr === 0 && prev === 0) return null;
  if (curr > prev) return 'up';
  if (curr < prev) return 'down';
  return 'flat';
};

export const computeRanking = (data) => {
  if (!data || data.length === 0) {
    return { rankingData: [], totalKm: 0, totalMembers: 0, lastUpdate: "" };
  }

  const scores = {};
  let globalKm = 0;
  let updateTime = "";

  data.forEach(item => {
    const teamCol = item['TIME']?.trim();
    const memberName = item['NOME']?.trim();
    if (item['DATA'] && !updateTime) updateTime = item['DATA'];

    if (!teamCol) return;

    const teamColUpper = teamCol.toUpperCase();
    const isTotalRow = teamColUpper.startsWith('TOTAL ');

    const teamKey = isTotalRow ? teamColUpper.replace('TOTAL ', '').trim() : teamColUpper;
    const displayTeamName = isTotalRow ? teamKey : teamCol;

    if (!scores[teamKey]) {
      scores[teamKey] = { id: teamKey, name: displayTeamName, members: [], total: 0, totalKm: 0 };
    } else if (!isTotalRow) {
      scores[teamKey].name = displayTeamName;
    }

    if (isTotalRow) {
      const rawPoints = item['CHECK-IN'] || "0";
      scores[teamKey].total = parseFloat(rawPoints.toString().replace(',', '.')) || 0;
      scores[teamKey].details = {
        s1: item['SEMANA 1']?.trim() || '0',
        s2: item['SEMANA 2']?.trim() || '0',
        s3: item['SEMANA 3']?.trim() || '0',
        s4: item['SEMANA 4']?.trim() || '0',
        s5: item['SEMANA 5']?.trim() || '0',
        s6: item['SEMANA 6']?.trim() || '0',
        s7: item['SEMANA 7']?.trim() || '0',
        d1: item['DESAFIO 1 - 100KM']?.trim() || '0',
        d2: item['DESAFIO 2 - CONVIDADO']?.trim() || '0',
        d3: item['DESAFIO 3 - TREINO EM EQUIPE']?.trim() || '0',
        d4: item['DESAFIO 4 - MÃE']?.trim() || '0',
        d5: item['DESAFIO 5 - EXTRA']?.trim() || '0',
        d6: item['DESAFIO 6']?.trim() || '0',
        dr: item['DESAFIO RELAMPAGO - POSE']?.trim() || '0',
        gincana: item['GINCANA']?.trim() || '0',
        ptsExtras: item['PTS EXTRAS']?.trim() || '0'
      };
      return;
    }

    if (!memberName || memberName.toUpperCase() === 'TOTAL') {
      return;
    }

    const rawPoints = item['CHECK-IN'] || "0";
    const points = parseFloat(rawPoints.toString().replace(',', '.')) || 0;
    const rawKm = item['KM'] || "0";
    const km = parseFloat(rawKm.toString().replace(',', '.')) || 0;

    globalKm += km;
    const extraPoints = item['PTS EXTRAS'] || "0";

    const weeks = {
      s1: item['SEMANA 1'] || '0',
      s2: item['SEMANA 2'] || '0',
      s3: item['SEMANA 3'] || '0',
      s4: item['SEMANA 4'] || '0',
      s5: item['SEMANA 5'] || '0',
      s6: item['SEMANA 6'] || '0',
      s7: item['SEMANA 7'] || '0',
    };

    const challenges = {
      d1: item['DESAFIO 1 - 100KM'] || '0',
      d2: item['DESAFIO 2 - CONVIDADO'] || '0',
      d3: item['DESAFIO 3 - TREINO EM EQUIPE'] || '0',
      d4: item['DESAFIO 4 - MÃE'] || '0',
      d5: item['DESAFIO 5 - EXTRA'] || '0',
      d6: item['DESAFIO 6'] || '0',
      dr: item['DESAFIO RELAMPAGO - POSE'] || '0',
      gincana: item['GINCANA'] || '0',
    };

    scores[teamKey].totalKm += km;

    const memberKey = memberName.toLowerCase();
    let existingMember = scores[teamKey].members.find(m => m.memberKey === memberKey);
    if (existingMember) {
      existingMember.points += points;
      existingMember.km += km;
      if (extraPoints !== "0") existingMember.extraPoints = extraPoints;
      existingMember.weeks = weeks;
      existingMember.challenges = challenges;
    } else {
      scores[teamKey].members.push({
        memberKey,
        name: memberName,
        formattedName: toTitleCase(memberName),
        points: points,
        km: km,
        extraPoints: extraPoints,
        weeks: weeks,
        challenges: challenges
      });
    }
  });

  const sortedList = Object.values(scores)
    .map(team => {
      const currentWeekIdx = findCurrentWeekIdx(team.details);
      team.currentWeekIdx = currentWeekIdx;
      team.weeklySeries = WEEK_KEYS.map(k => parseWeekValue(team.details?.[k]));
      team.members.forEach(m => {
        m.trend = computeMemberTrend(m.weeks, currentWeekIdx);
      });
      team.members.sort((a, b) => b.points - a.points);
      return team;
    })
    .sort((a, b) => b.total - a.total);

  let currentRank = 1;
  for (let i = 0; i < sortedList.length; i++) {
    if (i > 0 && sortedList[i].total < sortedList[i - 1].total) {
      currentRank = i + 1;
    }
    sortedList[i].rank = currentRank;
  }

  const totalMembersCount = sortedList.reduce((sum, t) => sum + t.members.length, 0);

  return {
    rankingData: sortedList,
    totalKm: Math.round(globalKm),
    totalMembers: totalMembersCount,
    lastUpdate: updateTime
  };
};
