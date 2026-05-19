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

export const validateColumns = (headers, required, source = 'CSV') => {
  const missing = required.filter((col) => !headers.includes(col));
  if (missing.length > 0) {
    console.warn(
      `[${source}] Colunas obrigatorias ausentes: ${missing.join(', ')}. ` +
      `Colunas encontradas: ${headers.join(', ')}`
    );
  }
  return missing;
};
