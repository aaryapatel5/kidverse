import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

const shapes = [
  { name: 'Circle', emoji: '⭕', color: '#FF6B6B' },
  { name: 'Square', emoji: '🟦', color: '#4ECDC4' },
  { name: 'Triangle', emoji: '🔺', color: '#F7DC6F' },
  { name: 'Star', emoji: '⭐', color: '#BB8FCE' },
  { name: 'Heart', emoji: '❤️', color: '#FF8FA3' },
  { name: 'Diamond', emoji: '💎', color: '#6EC4DB' },
];

export function ShapeMatch() {
  const [currentShape, setCurrentShape] = useState(shapes[0]);
  const [options, setOptions] = useState<typeof shapes>([]);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  useEffect(() => {
    generateNewRound();
  }, []);

  const generateNewRound = () => {
    const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
    setCurrentShape(randomShape);

    // Create 3 options including the correct one
    const wrongOptions = shapes.filter(s => s.name !== randomShape.name);
    const shuffledWrong = wrongOptions.sort(() => Math.random() - 0.5).slice(0, 2);
    const allOptions = [...shuffledWrong, randomShape].sort(() => Math.random() - 0.5);
    setOptions(allOptions);
    setFeedback(null);
  };

  const handleShapeSelect = (shape: typeof shapes[0]) => {
    if (shape.name === currentShape.name) {
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
          Shape Match Game
        </h3>
        <p className="text-gray-600" style={{ fontSize: '16px' }}>
          Find the matching shape!
        </p>
        <div className="inline-block bg-[#6ec4db] text-white px-6 py-2 rounded-full mt-4" style={{ fontSize: '18px', fontWeight: '600' }}>
          Score: {score}
        </div>
      </div>

      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <p className="text-gray-600 mb-4" style={{ fontSize: '20px' }}>
            Find the:
          </p>
          <div className="inline-flex flex-col items-center gap-3">
            <div 
              className="w-40 h-40 rounded-3xl shadow-lg flex items-center justify-center"
              style={{ backgroundColor: currentShape.color }}
            >
              <span style={{ fontSize: '80px' }}>{currentShape.emoji}</span>
            </div>
            <p className="text-[#0a0e27]" style={{ fontSize: '32px', fontWeight: '700' }}>
              {currentShape.name}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {options.map((shape) => (
            <button
              key={shape.name}
              onClick={() => handleShapeSelect(shape)}
              disabled={feedback !== null}
              className="aspect-square rounded-2xl shadow-md hover:shadow-xl transition-all transform hover:scale-110 disabled:opacity-50 flex items-center justify-center"
              style={{ backgroundColor: shape.color }}
            >
              <span style={{ fontSize: '64px' }}>{shape.emoji}</span>
            </button>
          ))}
        </div>

        {feedback && (
          <div className={`text-center py-4 rounded-2xl ${
            feedback === 'correct' ? 'bg-green-100' : 'bg-red-100'
          }`}>
            <p className={`flex items-center justify-center gap-2 ${
              feedback === 'correct' ? 'text-green-600' : 'text-red-600'
            }`} style={{ fontSize: '24px', fontWeight: '700' }}>
              {feedback === 'correct' ? (
                <>
                  <Sparkles className="w-6 h-6" />
                  Perfect! 🎉
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
