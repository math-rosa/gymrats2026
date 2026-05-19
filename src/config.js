const FALLBACK_RANKING_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vR3nqk-0k8VUtIgaR77357dukIvWCBwRs8wY4wIju32ricmg3LIEGyGMlhruMtGBJEE3CeEm8nr6PJO/pub?gid=196084497&single=true&output=csv";

const FALLBACK_FEED_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vR3nqk-0k8VUtIgaR77357dukIvWCBwRs8wY4wIju32ricmg3LIEGyGMlhruMtGBJEE3CeEm8nr6PJO/pub?gid=1279537034&single=true&output=csv";

export const CSV_URL = import.meta.env.VITE_RANKING_CSV_URL || FALLBACK_RANKING_CSV_URL;
export const FEED_CSV_URL = import.meta.env.VITE_FEED_CSV_URL || FALLBACK_FEED_CSV_URL;

export const REFRESH_INTERVAL_MS =
  Number(import.meta.env.VITE_REFRESH_INTERVAL_MS) || 120_000;

export const CHALLENGE_START = new Date('2026-04-15T00:00:00');
export const CHALLENGE_END = new Date('2026-05-29T23:59:59');
