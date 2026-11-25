import { useState, useEffect } from 'react';
import { Lightbulb } from 'lucide-react';

const patterns = [
  { sequence: ['🔴', '🔵', '🔴', '🔵'], answer: '🔴', hint: 'Red, Blue, Red, Blue...' },
  { sequence: ['⭐', '⭐', '🌙', '⭐', '⭐'], answer: '🌙', hint: 'Star, Star, Moon...' },
  { sequence: ['🍎', '🍊', '🍎', '🍊'], answer: '🍎', hint: 'Apple, Orange...' },
  { sequence: ['🐶', '🐱', '🐶', '🐱'], answer: '🐶', hint: 'Dog, Cat, Dog...' },
  { sequence: ['🟥', '🟩', '🟦', '🟥', '🟩'], answer: '🟦', hint: 'Red, Green, Blue...' },
  { sequence: ['❤️', '💛', '💚', '❤️', '💛'], answer: '💚', hint: 'Heart colors pattern' },
];

export function PatternGame() {
  const [currentPattern, setCurrentPattern] = useState(patterns[0]);
  const [options, setOptions] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    generateNewRound();
  }, []);

  const generateNewRound = () => {
    const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
    setCurrentPattern(randomPattern);

    // Create unique options
    const allEmojis = ['🔴', '🔵', '⭐', '🌙', '🍎', '🍊', '🐶', '🐱', '🟥', '🟩', '🟦', '❤️', '💛', '💚'];
    const uniqueOptions = new Set<string>();
    uniqueOptions.add(randomPattern.answer);

    while (uniqueOptions.size < 4) {
      const randomEmoji = allEmojis[Math.floor(Math.random() * allEmojis.length)];
      uniqueOptions.add(randomEmoji);
    }

    setOptions(Array.from(uniqueOptions).sort(() => Math.random() - 0.5));
    setFeedback(null);
    setShowHint(false);
  };

  const handleSelect = (emoji: string) => {
    if (emoji === currentPattern.answer) {
      setFeedback('correct');
      setScore(score + 1);
      setTimeout(() => {
        generateNewRound();
      }, 1500);
    } else {
      setFeedback('wrong');
      setTimeout(() => {
        setFeedback(null);
      }, 1000);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-lg">
      <div className="text-center mb-6">
        <h3 className="text-[#0a0e27] mb-2" style={{ fontSize: '28px', fontWeight: '700' }}>
          Pattern Detective
        </h3>
        <p className="text-gray-600" style={{ fontSize: '16px' }}>
          What comes next in the pattern?
        </p>
        <div className="inline-block bg-[#ffd166] text-white px-6 py-2 rounded-full mt-4" style={{ fontSize: '18px', fontWeight: '600' }}>
          Score: {score}
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-gradient-to-br from-[#ff8fa3] to-[#ffd166] rounded-3xl p-8 mb-6">
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-4">
            <div className="flex items-center justify-center gap-4 mb-4">
              {currentPattern.sequence.map((emoji, index) => (
                <div
                  key={index}
                  className="w-20 h-20 bg-white rounded-xl flex items-center justify-center shadow-md"
                >
                  <span style={{ fontSize: '40px' }}>{emoji}</span>
                </div>
              ))}
              <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center shadow-md border-4 border-dashed border-white">
                <span style={{ fontSize: '40px' }}>❓</span>
              </div>
            </div>
          </div>

          {showHint && (
            <div className="bg-white/30 rounded-xl p-3 mb-4 text-center">
              <p className="text-white flex items-center justify-center gap-2" style={{ fontSize: '16px', fontWeight: '600' }}>
                <Lightbulb className="w-5 h-5" />
                {currentPattern.hint}
              </p>
            </div>
          )}

          <button
            onClick={() => setShowHint(!showHint)}
            className="w-full py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-colors mb-4 flex items-center justify-center gap-2"
            style={{ fontSize: '14px', fontWeight: '600' }}
          >
            <Lightbulb className="w-4 h-4" />
            {showHint ? 'Hide Hint' : 'Show Hint'}
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {options.map((emoji, index) => (
            <button
              key={index}
              onClick={() => handleSelect(emoji)}
              disabled={feedback !== null}
              className="aspect-square rounded-2xl bg-white shadow-md hover:shadow-xl transition-all transform hover:scale-110 disabled:opacity-50 border-2 border-gray-200 hover:border-[#ffd166]"
            >
              <span style={{ fontSize: '48px' }}>{emoji}</span>
            </button>
          ))}
        </div>

        {feedback && (
          <div className={`text-center py-4 rounded-2xl ${
            feedback === 'correct' ? 'bg-green-100' : 'bg-red-100'
          }`}>
            <p className={`${
              feedback === 'correct' ? 'text-green-600' : 'text-red-600'
            }`} style={{ fontSize: '24px', fontWeight: '700' }}>
              {feedback === 'correct' ? '🎉 Correct!' : '❌ Try Again!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
