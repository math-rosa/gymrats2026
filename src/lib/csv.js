import Papa from 'papaparse';

export const parseCsvToJson = (text) => {
  const result = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
    transform: (value) => (typeof value === 'string' ? value.trim() : value),
  });

  return {
    data: result.data,
    headers: result.meta.fields || [],
  };
};
