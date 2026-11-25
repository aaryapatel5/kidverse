import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

const emojis = ['🍎', '🍊', '🍌', '🍇', '🍓', '🍒', '🍑', '🥝'];

export function CountingGame() {
  const [items, setItems] = useState<string[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  useEffect(() => {
    generateNewRound();
  }, []);

  const generateNewRound = () => {
    const count = Math.floor(Math.random() * 8) + 3; // 3 to 10 items
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    const itemsArray = Array(count).fill(emoji);
    
    setItems(itemsArray);
    setCorrectCount(count);
    setUserAnswer('');
    setFeedback(null);
  };

  const checkAnswer = () => {
    const answer = parseInt(userAnswer);
    if (answer === correctCount) {
      setFeedback('correct');
      setScore(score + 1);
      setTimeout(() => {
        generateNewRound();
      }, 1500);
    } else {
      setFeedback('wrong');
      setTimeout(() => {
        setFeedback(null);
        setUserAnswer('');
      }, 1000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && userAnswer) {
      checkAnswer();
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-lg">
      <div className="text-center mb-6">
        <h3 className="text-[#0a0e27] mb-2" style={{ fontSize: '28px', fontWeight: '700' }}>
          Counting Game
        </h3>
        <p className="text-gray-600" style={{ fontSize: '16px' }}>
          Count the items!
        </p>
        <div className="inline-block bg-[#52C41A] text-white px-6 py-2 rounded-full mt-4" style={{ fontSize: '18px', fontWeight: '600' }}>
          Score: {score}
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-gradient-to-br from-[#6ec4db] to-[#8b7bd8] rounded-3xl p-8 mb-6">
          <p className="text-white text-center mb-4" style={{ fontSize: '20px', fontWeight: '600' }}>
            How many do you see?
          </p>
          
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-4 flex flex-wrap gap-4 justify-center min-h-[200px] items-center">
            {items.map((emoji, index) => (
              <span 
                key={index} 
                className="animate-bounce"
                style={{ 
                  fontSize: '48px',
                  animationDelay: `${index * 0.1}s`,
                  animationDuration: '2s'
                }}
              >
                {emoji}
              </span>
            ))}
          </div>

          <input
            type="number"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="?"
            disabled={feedback !== null}
            className="w-full px-6 py-4 rounded-2xl text-center text-[#0a0e27] border-4 border-white focus:outline-none focus:border-[#ffd166]"
            style={{ fontSize: '32px', fontWeight: '700' }}
            min="0"
          />
        </div>

        {feedback && (
          <div className={`text-center py-6 rounded-2xl mb-6 ${
            feedback === 'correct' ? 'bg-green-100' : 'bg-red-100'
          }`}>
            <p className={`flex items-center justify-center gap-2 ${
              feedback === 'correct' ? 'text-green-600' : 'text-red-600'
            }`} style={{ fontSize: '28px', fontWeight: '700' }}>
              {feedback === 'correct' ? (
                <>
                  <Sparkles className="w-8 h-8" />
                  Great Counting! 🎉
                  <Sparkles className="w-8 h-8" />
                </>
              ) : (
                '❌ Try Again!'
              )}
            </p>
          </div>
        )}

        <button
          onClick={checkAnswer}
          disabled={!userAnswer || feedback !== null}
          className="w-full py-4 bg-[#52C41A] text-white rounded-full hover:bg-[#45a317] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ fontSize: '20px', fontWeight: '700' }}
        >
          Check Answer
        </button>
      </div>
    </div>
  );
}
