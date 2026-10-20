import { GameViewport } from './components/layout/GameViewport';
import { GameProvider } from './context/GameContext';

export function App() {
  return (
    <GameProvider>
      <GameViewport />
    </GameProvider>
  );
}

export default App;
