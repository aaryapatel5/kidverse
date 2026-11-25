import { useState, useEffect } from 'react';
import { Play, Trophy } from 'lucide-react';

const colors = [
  { id: 'red', bg: 'bg-red-500', active: 'bg-red-300' },
  { id: 'blue', bg: 'bg-blue-500', active: 'bg-blue-300' },
  { id: 'green', bg: 'bg-green-500', active: 'bg-green-300' },
  { id: 'yellow', bg: 'bg-yellow-400', active: 'bg-yellow-200' },
];

export function SimonSays() {
  const [sequence, setSequence] = useState<string[]>([]);
  const [userSequence, setUserSequence] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const playSequence = async (seq: string[]) => {
    setIsPlaying(true);
    for (const color of seq) {
      await new Promise(resolve => setTimeout(resolve, 600));
      setActiveColor(color);
      await new Promise(resolve => setTimeout(resolve, 400));
      setActiveColor(null);
    }
    setIsPlaying(false);
  };

  const startGame = () => {
    const firstColor = colors[Math.floor(Math.random() * colors.length)].id;
    setSequence([firstColor]);
    setUserSequence([]);
    setScore(0);
    setGameOver(false);
    playSequence([firstColor]);
  };

  const handleColorClick = (colorId: string) => {
    if (isPlaying || gameOver) return;

    const newUserSequence = [...userSequence, colorId];
    setUserSequence(newUserSequence);

    if (colorId !== sequence[newUserSequence.length - 1]) {
      setGameOver(true);
      return;
    }

    if (newUserSequence.length === sequence.length) {
      const newScore = score + 1;
      setScore(newScore);
      const nextColor = colors[Math.floor(Math.random() * colors.length)].id;
      const newSequence = [...sequence, nextColor];
      setSequence(newSequence);
      setUserSequence([]);
      setTimeout(() => playSequence(newSequence), 1000);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-xl">
      <div className="text-center mb-8">
        <h2 className="text-[#0a0e27] mb-2" style={{ fontSize: '36px', fontWeight: '700' }}>
          Simon Says
        </h2>
        <p className="text-gray-600" style={{ fontSize: '18px' }}>
          Watch and repeat the pattern! 🎯
        </p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <Trophy className="w-6 h-6 text-[#ffd166]" />
          <span className="text-[#8b7bd8]" style={{ fontSize: '24px', fontWeight: '700' }}>
            Level: {score}
          </span>
        </div>
      </div>

      {gameOver && (
        <div className="bg-red-100 text-red-700 rounded-2xl p-6 mb-6 text-center">
          <p style={{ fontSize: '24px', fontWeight: '700' }} className="mb-2">
            Game Over!
          </p>
          <p style={{ fontSize: '18px' }}>You reached level {score}!</p>
        </div>
      )}

      {sequence.length === 0 ? (
        <button
          onClick={startGame}
          className="w-full py-6 bg-gradient-to-r from-[#8b7bd8] to-[#ff8fa3] text-white rounded-2xl hover:opacity-90 transition-opacity flex items-center justify-center gap-3 mb-8"
          style={{ fontSize: '24px', fontWeight: '700' }}
        >
          <Play className="w-8 h-8" />
          Start Game
        </button>
      ) : gameOver ? (
        <button
          onClick={startGame}
          className="w-full py-6 bg-gradient-to-r from-[#8b7bd8] to-[#ff8fa3] text-white rounded-2xl hover:opacity-90 transition-opacity flex items-center justify-center gap-3 mb-8"
          style={{ fontSize: '24px', fontWeight: '700' }}
        >
          <Play className="w-8 h-8" />
          Play Again
        </button>
      ) : null}

      <div className="grid grid-cols-2 gap-6 max-w-md mx-auto">
        {colors.map((color) => (
          <button
            key={color.id}
            onClick={() => handleColorClick(color.id)}
            disabled={isPlaying || sequence.length === 0}
            className={`aspect-square rounded-3xl transition-all ${
              activeColor === color.id ? color.active : color.bg
            } ${
              isPlaying || sequence.length === 0 ? 'cursor-not-allowed opacity-50' : 'hover:scale-105 active:scale-95'
            }`}
          />
        ))}
      </div>

      {isPlaying && (
        <p className="text-center mt-6 text-gray-600" style={{ fontSize: '18px', fontWeight: '600' }}>
          Watch carefully...
        </p>
      )}
      {!isPlaying && sequence.length > 0 && !gameOver && (
        <p className="text-center mt-6 text-[#8b7bd8]" style={{ fontSize: '18px', fontWeight: '600' }}>
          Your turn! Repeat the pattern ({userSequence.length}/{sequence.length})
        </p>
      )}
    </div>
  );
}
