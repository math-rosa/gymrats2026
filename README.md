# GYM RATS 2026.2

Dashboard interativo para exibição do ranking de times no desafio fitness interno de 45 dias da **TD Business**.

## 🏆 Sobre o Projeto

Desafio corporativo de 45 dias (**15/04/2026 → 29/05/2026**) com colaboradores divididos em 5 equipes acumulando pontos via check-ins, quilometragem e desafios semanais. O dashboard apresenta o ranking ao vivo, consumindo planilha do Google Sheets e exibindo o pódio em telão / desktop / mobile.

### Funcionalidades

- **Pódio** — 5 posições (4-2-1-3-5 no desktop, sequencial no mobile), com coroa flutuante no 1º lugar
- **Lista de membros** — ordenada por pontuação, com indicador de tendência (🔼 / 🔽 / —) vs. semana anterior
- **Tooltip do time** — semanas, desafios e **sparkline** mostrando a evolução semanal
- **Tooltip do membro** — pontos por semana e extras
- **Feed de mídia** — carrossel infinito com fotos/vídeos do Instagram (lazy load, IntersectionObserver)
- **Countdown** — dia atual + tempo restante (DD:HH:MM:SS)
- **KPIs** — Km percorridos + total de check-ins (números animados)
- **Auto-refresh** — busca a planilha a cada 2 min sem recarregar a página (com `AbortController`)
- **Modo TV** (`?tv=1`) — esconde subtítulo e feed para projeção em telão
- **Reduced motion** — respeita `prefers-reduced-motion: reduce` (desliga auroras, scroll do feed, contadores)
- **Error Boundary** — captura crashes de runtime e mostra tela amigável de fallback
- **Schema validation** — avisa no console se colunas críticas (TIME, NOME, CHECK-IN, KM) sumirem da planilha

## 🚀 Stack

| Tecnologia | Versão | Uso |
|---|---|---|
| [React](https://react.dev/) | ^18.3.1 | UI |
| [Vite](https://vitejs.dev/) | ^5.4.2 | Build / dev server |
| [Tailwind CSS](https://tailwindcss.com/) | ^3.4.10 | Estilos |
| [PapaParse](https://www.papaparse.com/) | ^5.5.3 | Parser CSV |
| [Lucide React](https://lucide.dev/) | ^0.484.0 | Ícones |
| Inter (Google Fonts) | — | Tipografia |

## 📁 Estrutura

```
src/
├── App.jsx                 → composição (header + feed + pódio)
├── main.jsx                → entry point + ErrorBoundary
├── config.js               → URLs e constantes (env-aware)
├── index.css               → Tailwind + animações + reduced-motion
├── tdbusiness_logo.jpg
│
├── components/
│   ├── Podium.jsx          → arena 4-2-1-3-5
│   ├── PodiumTeamCard.jsx  → card de equipe com fonts dinâmicas (ResizeObserver)
│   ├── MemberTooltip.jsx
│   ├── TeamTooltip.jsx     → semanas, desafios, sparkline, totais
│   ├── ChallengeCountdown.jsx
│   ├── MediaFeed.jsx       → faixa de mídias
│   ├── MediaItem.jsx       → lazy-load via IntersectionObserver
│   ├── AnimatedNumber.jsx
│   ├── StatCard.jsx
│   ├── Sparkline.jsx       → SVG inline, sem dep externa
│   └── ErrorBoundary.jsx
│
├── hooks/
│   ├── useGoogleSheetsData.js  → fetch + auto-refresh + abort
│   └── useCountdown.js
│
└── lib/
    ├── csv.js              → parseCsvToJson (papaparse) + validateColumns
    └── ranking.js          → computeRanking, trend, currentWeekIdx, weeklySeries
```

## ⚙️ Configuração (`.env`)

Variáveis (todas opcionais — há fallback para URLs do projeto original em [src/config.js](src/config.js)):

```
VITE_RANKING_CSV_URL=https://docs.google.com/spreadsheets/.../pub?gid=...&single=true&output=csv
VITE_FEED_CSV_URL=https://docs.google.com/spreadsheets/.../pub?gid=...&single=true&output=csv
VITE_REFRESH_INTERVAL_MS=120000
```

Veja [.env.example](.env.example).

## 📊 Dados

Carregados de **Google Sheets** via CSV público (parseados com PapaParse):

| Fonte | Colunas |
|---|---|
| **Ranking** | `TIME`, `NOME`, `CHECK-IN`, `KM`, `PTS EXTRAS`, `SEMANA 1`..`SEMANA 6`, `DESAFIO 1 - 100KM`, `DESAFIO 2 - CONVIDADO`, `DESAFIO 3 - TREINO EM EQUIPE`, `DESAFIO 4 - MÃE`, `DESAFIO 5 - EXTRA`, `DESAFIO RELAMPAGO - POSE`, `DATA` |
| **Feed** | `url` ou `thumbnail_url` |

**Linha de total**: linhas em que `TIME` começa com `TOTAL ` (ex: `TOTAL ROXO`) contêm o check-in oficial e os totais por desafio do time — usadas para o display de pontos e detalhes no tooltip. Demais linhas são membros individuais.

## 🎨 Cores das Equipes

| Equipe | Cor |
|---|---|
| AZUL | `#3B82F6` |
| ROXO | `#8B5CF6` |
| ROSA | `#EC4899` |
| VERDE | `#10B981` |
| LARANJA | `#F97316` |

## 🧮 Pontuação

- Cada **membro** acumula `CHECK-IN` (pontos) + `KM` (separadamente). Pontuação do membro = `CHECK-IN`
- O **total da equipe** exibido vem da linha `TOTAL <COR>` (já calculada na planilha, inclui semanas + desafios)
- A **tendência** do membro compara `SEMANA N` vs `SEMANA N-1` (N = última semana com dados no time)

## 🛠️ Comandos

```bash
npm install            # Instala dependências
npm run dev            # Inicia servidor Vite (http://localhost:5173)
npm run build          # Gera build de produção em /dist
npm run preview        # Preview do build de produção
```

## 🖥️ Modos de uso

| URL | Comportamento |
|---|---|
| `/` | Dashboard normal |
| `/?tv=1` | Modo TV: sem subtítulo, sem feed, foco no pódio |

## 📄 Licença

Projeto interno — uso corporativo da TD Business.
