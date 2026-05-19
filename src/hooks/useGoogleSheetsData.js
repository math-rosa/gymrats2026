import { useState, useEffect } from 'react';
import { parseCsvToJson, validateColumns } from '../lib/csv';

const REQUIRED_RANKING_COLUMNS = ['TIME', 'NOME', 'CHECK-IN', 'KM'];
const REQUIRED_FEED_COLUMNS = []; // feed aceita 'url' OU 'thumbnail_url'

export function useGoogleSheetsData({ rankingUrl, feedUrl, refreshIntervalMs }) {
  const [data, setData] = useState([]);
  const [feedData, setFeedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    let controller = new AbortController();

    const loadData = async (isInitial) => {
      controller = new AbortController();
      const { signal } = controller;
      const ts = Date.now();
      const fetchOpts = { cache: 'no-store', signal };

      const fetchRanking = fetch(`${rankingUrl}&_t=${ts}`, fetchOpts)
        .then(r => { if (!r.ok) throw new Error("Erro Ranking"); return r.text(); })
        .then(text => {
          const { data: jsonData, headers } = parseCsvToJson(text);
          if (jsonData.length === 0) throw new Error("CSV Ranking vazio.");
          validateColumns(headers, REQUIRED_RANKING_COLUMNS, 'Ranking CSV');
          if (!cancelled) setData(jsonData);
        });

      const fetchFeed = fetch(`${feedUrl}&_t=${ts}`, fetchOpts)
        .then(r => { if (!r.ok) throw new Error("Erro Feed"); return r.text(); })
        .then(text => {
          const { data: jsonData, headers } = parseCsvToJson(text);
          validateColumns(headers, REQUIRED_FEED_COLUMNS, 'Feed CSV');
          const media = jsonData
            .map(item => item.thumbnail_url || item.url)
            .filter(url => url && url.length > 5)
            .sort(() => Math.random() - 0.5)
            .slice(0, 15);
          if (!cancelled) setFeedData(media);
        })
        .catch(err => {
          if (err.name !== 'AbortError') console.warn("Erro ao carregar feed:", err);
        });

      try {
        await Promise.all([fetchRanking, fetchFeed]);
        if (!cancelled && isInitial) setLoading(false);
      } catch (err) {
        if (err.name === 'AbortError' || cancelled) return;
        if (isInitial) {
          setError(err.message);
          setLoading(false);
        } else {
          console.warn("Falha no auto-refresh:", err);
        }
      }
    };

    loadData(true);
    const intervalId = setInterval(() => loadData(false), refreshIntervalMs);

    return () => {
      cancelled = true;
      controller.abort();
      clearInterval(intervalId);
    };
  }, [rankingUrl, feedUrl, refreshIntervalMs]);

  return { data, feedData, loading, error };
}
