# GYM RATS 2026.2

Dashboard interativo para exibição do ranking de times em uma competição interna de 45 dias da empresa **TD Business**.

## 🏆 Sobre o Projeto

O **GYM RATS** é um desafio corporativo de 45 dias (15/04/2026 a 29/05/2026) onde colaboradores divididos em equipes acumulam pontos através de check-ins, quilometragem percorrida e pontos extras. Este dashboard apresenta o ranking ao vivo com um pódio visual e feed de mídia.

### Funcionalidades

- **Ranking de times** — Pódio com 5 posições (1º ao 5º lugar), cada equipe com sua cor
- **Lista de membros** — Exibe membros de cada equipe ordenados por pontuação
- **Tooltip semanal** — Ao passar o mouse sobre um membro, mostra seus pontos por semana e total
- **Feed de mídia** — Carrossel horizontal com fotos/vídeos do Instagram (lazy loading)
- **Countdown** — Contagem regressiva do desafio de 45 dias
- **KPIs** — Km total percorrido e total de check-ins
- **Animações** — Números animados, auroras de fundo, efeitos glassmorphism e shimmer
- **Responsivo** — Layout otimizado para desktop e mobile

## 🚀 Stack

| Tecnologia | Versão |
|---|---|
| [React](https://react.dev/) | ^18.3.1 |
| [Vite](https://vitejs.dev/) | ^5.4.2 |
| [Tailwind CSS](https://tailwindcss.com/) | ^3.4.10 |
| [Lucide React](https://lucide.dev/) | ^0.484.0 |
| [Google Fonts (Inter)](https://fonts.google.com/specimen/Inter) | — |

## 📁 Estrutura

```
src/
├── App.jsx              → Componente principal (ranking, pódio, feed, countdown)
├── main.jsx             → Entry point React
├── index.css            → Estilos globais + Tailwind + animações customizadas
└── tdbusiness_logo.jpg  → Logo da empresa
```

## 📊 Dados

Os dados são carregados de **Google Sheets** via CSV público:

| Fonte | Conteúdo |
|---|---|
| **Ranking** | Colunas: TIME, NOME, CHECK-IN, KM, PTS EXTRAS, SEMANA 1–6, DATA |
| **Feed** | URLs de mídia (Instagram/Fotos) |

## 🎨 Cores das Equipes

| Equipe | Cor |
|---|---|
| AZUL | `#3B82F6` |
| ROXO | `#8B5CF6` |
| ROSA | `#EC4899` |
| VERDE | `#10B981` |
| LARANJA | `#F97316` |

## 🧮 Pontuação

- Cada membro acumula **CHECK-IN** + **KM** + **PTS EXTRAS**
- Cada equipe soma os pontos de todos os seus membros + **15 pontos fixos** adicionados ao total exibido

## 🛠️ Comandos

```bash
npm run dev      # Inicia servidor de desenvolvimento (Vite)
npm run build    # Gera build de produção em /dist
npm run preview  # Preview do build de produção
```

## 📄 Licença

Projeto interno — uso corporativo.