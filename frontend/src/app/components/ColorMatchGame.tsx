import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

const colorPairs = [
  { name: 'Red', hex: '#FF6B6B', emoji: '🍎' },
  { name: 'Blue', hex: '#4ECDC4', emoji: '🌊' },
  { name: 'Yellow', hex: '#F7DC6F', emoji: '🌟' },
  { name: 'Green', hex: '#52C41A', emoji: '🌿' },
  { name: 'Purple', hex: '#BB8FCE', emoji: '🍇' },
  { name: 'Orange', hex: '#FFA07A', emoji: '🍊' },
];

export function ColorMatchGame() {
  const [currentColor, setCurrentColor] = useState(colorPairs[0]);
  const [score, setScore] = useState(0);
  const [options, setOptions] = useState<typeof colorPairs>([]);
  const [showFeedback, setShowFeedback] = useState<'correct' | 'wrong' | null>(null);

  useEffect(() => {
    generateNewRound();
  }, []);

  const generateNewRound = () => {
    const randomIndex = Math.floor(Math.random() * colorPairs.length);
    setCurrentColor(colorPairs[randomIndex]);

    // Create options with the correct answer and 2 random wrong answers
    const wrongOptions = colorPairs.filter((_, i) => i !== randomIndex);
    const shuffledWrong = wrongOptions.sort(() => Math.random() - 0.5).slice(0, 2);
    const allOptions = [...shuffledWrong, colorPairs[randomIndex]].sort(() => Math.random() - 0.5);
    setOptions(allOptions);
    setShowFeedback(null);
  };

  const handleColorSelect = (selectedColor: typeof colorPairs[0]) => {
    if (selectedColor.name === currentColor.name) {
      setShowFeedback('correct');
      setScore(score + 1);
      setTimeout(() => {
        generateNewRound();
      }, 1500);
    } else {
      setShowFeedback('wrong');
      setTimeout(() => {
        setShowFeedback(null);
      }, 1000);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-lg">
      <div className="text-center mb-6">
        <h3 className="text-[#0a0e27] mb-2" style={{ fontSize: '28px', fontWeight: '700' }}>
          Color Match Challenge
        </h3>
        <p className="text-gray-600" style={{ fontSize: '16px' }}>
          Click the matching color!
        </p>
        <div className="inline-block bg-[#8b7bd8] text-white px-6 py-2 rounded-full mt-4" style={{ fontSize: '18px', fontWeight: '600' }}>
          Score: {score}
        </div>
      </div>

      <div className="max-w-md mx-auto">
        {/* Color to match */}
        <div className="text-center mb-8">
          <p className="text-gray-600 mb-4" style={{ fontSize: '20px' }}>
            Find the color:
          </p>
          <div className="inline-flex flex-col items-center gap-3">
            <div 
              className="w-32 h-32 rounded-3xl shadow-lg border-4 border-gray-300 flex items-center justify-center"
              style={{ backgroundColor: currentColor.hex }}
            >
              <span style={{ fontSize: '48px' }}>{currentColor.emoji}</span>
            </div>
            <p className="text-[#0a0e27]" style={{ fontSize: '24px', fontWeight: '700' }}>
              {currentColor.name}
            </p>
          </div>
        </div>

        {/* Options */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {options.map((color) => (
            <button
              key={color.name}
              onClick={() => handleColorSelect(color)}
              disabled={showFeedback !== null}
              className="aspect-square rounded-2xl shadow-md hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 border-4 border-transparent hover:border-gray-300"
              style={{ backgroundColor: color.hex }}
            >
              <span style={{ fontSize: '36px' }}>{color.emoji}</span>
            </button>
          ))}
        </div>

        {/* Feedback */}
        {showFeedback && (
          <div className={`text-center py-4 rounded-2xl ${
            showFeedback === 'correct' ? 'bg-green-100' : 'bg-red-100'
          }`}>
            <p className={`flex items-center justify-center gap-2 ${
              showFeedback === 'correct' ? 'text-green-600' : 'text-red-600'
            }`} style={{ fontSize: '24px', fontWeight: '700' }}>
              {showFeedback === 'correct' ? (
                <>
                  <Sparkles className="w-6 h-6" />
                  Great Job! 🎉
                  <Sparkles className="w-6 h-6" />
                </>
              ) : (
                '❌ Try Again!'
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
