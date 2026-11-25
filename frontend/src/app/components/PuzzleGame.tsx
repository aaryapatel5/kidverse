import { useState, useEffect } from 'react';
import { Shuffle, Trophy } from 'lucide-react';

const emojis = ['🐶', '🐱', '🐻', '🦊', '🦁', '🐼', '🐨', '🐯', '🦒', '🐘', '🦓', '🐧'];

export function PuzzleGame() {
  const [gridSize] = useState(3); // 3x3 grid
  const [tiles, setTiles] = useState<(number | null)[]>([]);
  const [moves, setMoves] = useState(0);
  const [solved, setSolved] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState('');

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    setSelectedEmoji(randomEmoji);
    
    // Create tiles array (0 to 8, where 8 is empty)
    let initialTiles = Array.from({ length: gridSize * gridSize }, (_, i) => i);
    
    // Shuffle tiles
    for (let i = 0; i < 100; i++) {
      const emptyIndex = initialTiles.indexOf(gridSize * gridSize - 1);
      const possibleMoves = getPossibleMoves(emptyIndex);
      const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      [initialTiles[emptyIndex], initialTiles[randomMove]] = [initialTiles[randomMove], initialTiles[emptyIndex]];
    }
    
    setTiles(initialTiles.map(t => t === gridSize * gridSize - 1 ? null : t));
    setMoves(0);
    setSolved(false);
  };

  const getPossibleMoves = (emptyIndex: number) => {
    const row = Math.floor(emptyIndex / gridSize);
    const col = emptyIndex % gridSize;
    const moves = [];

    if (row > 0) moves.push(emptyIndex - gridSize); // up
    if (row < gridSize - 1) moves.push(emptyIndex + gridSize); // down
    if (col > 0) moves.push(emptyIndex - 1); // left
    if (col < gridSize - 1) moves.push(emptyIndex + 1); // right

    return moves;
  };

  const handleTileClick = (index: number) => {
    if (solved) return;
    
    const emptyIndex = tiles.indexOf(null);
    const possibleMoves = getPossibleMoves(emptyIndex);

    if (possibleMoves.includes(index)) {
      const newTiles = [...tiles];
      [newTiles[emptyIndex], newTiles[index]] = [newTiles[index], newTiles[emptyIndex]];
      setTiles(newTiles);
      setMoves(moves + 1);

      // Check if solved
      const isSolved = newTiles.every((tile, i) => 
        tile === null ? i === gridSize * gridSize - 1 : tile === i
      );
      if (isSolved) {
        setSolved(true);
      }
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-lg">
      <div className="text-center mb-6">
        <h3 className="text-[#0a0e27] mb-2" style={{ fontSize: '28px', fontWeight: '700' }}>
          Sliding Puzzle
        </h3>
        <p className="text-gray-600" style={{ fontSize: '16px' }}>
          Arrange the tiles in order!
        </p>
        <div className="flex gap-4 justify-center mt-4">
          <div className="bg-[#8b7bd8] text-white px-4 py-2 rounded-full" style={{ fontSize: '14px' }}>
            Moves: {moves}
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto mb-6">
        <div className="grid grid-cols-3 gap-2 bg-gradient-to-br from-[#8b7bd8] to-[#6ec4db] p-4 rounded-3xl">
          {tiles.map((tile, index) => (
            <button
              key={index}
              onClick={() => handleTileClick(index)}
              disabled={tile === null || solved}
              className={`aspect-square rounded-xl text-5xl flex items-center justify-center transition-all ${
                tile === null 
                  ? 'bg-transparent cursor-default' 
                  : 'bg-white hover:scale-105 shadow-md'
              }`}
            >
              {tile !== null && (
                <div className="flex flex-col items-center">
                  <span>{selectedEmoji}</span>
                  <span className="text-sm text-gray-600 font-bold">{tile + 1}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {solved && (
        <div className="text-center mb-4 py-6 bg-green-100 rounded-2xl">
          <p className="text-green-600 flex items-center justify-center gap-2" style={{ fontSize: '28px', fontWeight: '700' }}>
            <Trophy className="w-8 h-8" />
            You Solved It! 🎉
          </p>
          <p className="text-green-600 mt-2" style={{ fontSize: '18px' }}>
            In {moves} moves!
          </p>
        </div>
      )}

      <div className="text-center">
        <button
          onClick={initializeGame}
          className="px-6 py-3 bg-[#ff8fa3] text-white rounded-full hover:bg-[#ff7a90] transition-colors flex items-center gap-2 mx-auto"
          style={{ fontSize: '16px', fontWeight: '600' }}
        >
          <Shuffle className="w-5 h-5" />
          New Puzzle
        </button>
      </div>
    </div>
  );
}
