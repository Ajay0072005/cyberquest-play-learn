import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { GameProvider } from './context/GameContext.tsx'
import { AchievementNotificationProvider } from './components/AchievementNotificationContainer.tsx'

createRoot(document.getElementById("root")!).render(
  <AchievementNotificationProvider>
    <GameProvider>
      <App />
    </GameProvider>
  </AchievementNotificationProvider>
);
