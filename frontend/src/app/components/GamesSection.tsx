import { useState } from 'react';
import { MemoryGame } from './MemoryGame';
import { DrawingCanvas } from './DrawingCanvas';
import { ColorMatchGame } from './ColorMatchGame';
import { MathQuiz } from './MathQuiz';
import { Gamepad2, Paintbrush, Palette, Calculator } from 'lucide-react';

type GameType = 'memory' | 'drawing' | 'colors' | 'math';

export function GamesSection() {
  const [activeGame, setActiveGame] = useState<GameType>('memory');

  const games = [
    { id: 'memory' as GameType, name: 'Memory Match', icon: Gamepad2, color: 'bg-[#8b7bd8]' },
    { id: 'drawing' as GameType, name: 'Drawing', icon: Paintbrush, color: 'bg-[#ff8fa3]' },
    { id: 'colors' as GameType, name: 'Color Match', icon: Palette, color: 'bg-[#6ec4db]' },
    { id: 'math' as GameType, name: 'Math Quiz', icon: Calculator, color: 'bg-[#ffd166]' },
  ];

  return (
    <section className="py-20 px-8 md:px-16 lg:px-24 bg-gradient-to-b from-[#0a0e27] to-[#1a1e3f]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-white mb-4" style={{ fontSize: '48px', fontWeight: '700' }}>
            Fun Games & Activities
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto" style={{ fontSize: '20px' }}>
            Play, learn, and have fun with our interactive games!
          </p>
        </div>

        {/* Game selector */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {games.map((game) => (
            <button
              key={game.id}
              onClick={() => setActiveGame(game.id)}
              className={`px-6 py-3 rounded-full transition-all transform hover:scale-105 flex items-center gap-2 ${
                activeGame === game.id
                  ? `${game.color} text-white shadow-lg`
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              style={{ fontSize: '18px', fontWeight: '600' }}
            >
              <game.icon className="w-5 h-5" />
              {game.name}
            </button>
          ))}
        </div>

        {/* Active game */}
        <div className="max-w-4xl mx-auto">
          {activeGame === 'memory' && <MemoryGame />}
          {activeGame === 'drawing' && <DrawingCanvas />}
          {activeGame === 'colors' && <ColorMatchGame />}
          {activeGame === 'math' && <MathQuiz />}
        </div>
      </div>
    </section>
  );
}
