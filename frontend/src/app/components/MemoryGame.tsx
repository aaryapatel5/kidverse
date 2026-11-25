import { useState, useEffect } from 'react';

const emojis = ['🐶', '🐱', '🦊', '🐻', '🐼', '🐨', '🦁', '🐯'];

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export function MemoryGame() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const gameEmojis = [...emojis, ...emojis];
    const shuffled = gameEmojis
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(shuffled);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
  };

  const handleCardClick = (id: number) => {
    if (flippedCards.length === 2) return;
    if (flippedCards.includes(id)) return;
    if (cards[id].isMatched) return;

    const newCards = [...cards];
    newCards[id].isFlipped = true;
    setCards(newCards);

    const newFlippedCards = [...flippedCards, id];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setMoves(moves + 1);
      const [first, second] = newFlippedCards;
      
      if (cards[first].emoji === cards[second].emoji) {
        // Match found
        setTimeout(() => {
          const matchedCards = [...cards];
          matchedCards[first].isMatched = true;
          matchedCards[second].isMatched = true;
          setCards(matchedCards);
          setFlippedCards([]);
          setMatches(matches + 1);
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          const resetCards = [...cards];
          resetCards[first].isFlipped = false;
          resetCards[second].isFlipped = false;
          setCards(resetCards);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-lg">
      <div className="text-center mb-6">
        <h3 className="text-[#0a0e27] mb-2" style={{ fontSize: '28px', fontWeight: '700' }}>
          Memory Match Game
        </h3>
        <p className="text-gray-600" style={{ fontSize: '16px' }}>
          Find all the matching pairs!
        </p>
        <div className="flex gap-4 justify-center mt-4">
          <div className="bg-[#8b7bd8] text-white px-4 py-2 rounded-full" style={{ fontSize: '14px' }}>
            Moves: {moves}
          </div>
          <div className="bg-[#6ec4db] text-white px-4 py-2 rounded-full" style={{ fontSize: '14px' }}>
            Matches: {matches}/8
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 max-w-md mx-auto mb-6">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            className={`aspect-square rounded-2xl text-4xl flex items-center justify-center transition-all transform hover:scale-105 ${
              card.isFlipped || card.isMatched
                ? 'bg-white border-2 border-[#8b7bd8]'
                : 'bg-gradient-to-br from-[#8b7bd8] to-[#6ec4db]'
            }`}
          >
            {(card.isFlipped || card.isMatched) ? card.emoji : '?'}
          </button>
        ))}
      </div>

      {matches === 8 && (
        <div className="text-center mb-4">
          <p className="text-[#8b7bd8] mb-4" style={{ fontSize: '24px', fontWeight: '700' }}>
            🎉 You Won! Great job!
          </p>
        </div>
      )}

      <div className="text-center">
        <button
          onClick={initializeGame}
          className="px-6 py-3 bg-[#ff8fa3] text-white rounded-full hover:bg-[#ff7a90] transition-colors"
          style={{ fontSize: '16px', fontWeight: '600' }}
        >
          New Game
        </button>
      </div>
    </div>
  );
}
