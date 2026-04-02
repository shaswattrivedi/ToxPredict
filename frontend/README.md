# ToxPredict Frontend

React-based web interface for the ToxPredict drug toxicity prediction system.

## Tech Stack

- **React 19** with Vite for fast development and builds
- **Tailwind CSS v4** for utility-first styling
- **React Query** for server state management
- **Recharts** for data visualization (radar charts, bar charts)
- **React Router** for client-side routing

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── AssayGrid.jsx   # Displays toxicity assay results by category
│   ├── Card.jsx        # Base card component
│   ├── CompoundSummary.jsx  # Overall compound analysis
│   ├── Header.jsx      # App header with navigation
│   ├── Hero.jsx        # Landing page hero section
│   ├── InputCard.jsx   # SMILES input wrapper
│   ├── InsightsSection.jsx  # SHAP & radar chart insights
│   ├── MoleculeViewer.jsx   # 2D structure + alerts
│   ├── RadarChart.jsx  # Assay probability radar
│   ├── RiskSummary.jsx # Overall risk assessment
│   ├── SHAPChart.jsx   # Feature importance bar chart
│   ├── SMILESInput.jsx # SMILES text input form
│   ├── TopRiskDrivers.jsx   # Top SHAP features
│   └── ToxicityCard.jsx     # Individual assay result
├── pages/
│   ├── Home.jsx        # Main prediction interface
│   └── About.jsx       # Project information
├── hooks/
│   └── usePrediction.js # React Query hooks for API
├── api/
│   └── toxicity.js     # API client functions
├── assets/             # Static images
├── App.jsx             # Router setup
├── main.jsx            # App entry point
└── index.css           # Global styles + Tailwind
```

## Environment Variables

Create `.env.development` and `.env.production` files:

```env
VITE_API_URL=http://localhost:8000  # Backend API URL
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
