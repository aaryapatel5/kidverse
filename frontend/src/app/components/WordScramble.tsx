import { useState, useEffect } from 'react';
import { Shuffle, Check } from 'lucide-react';

const words = [
  { word: 'CAT', hint: 'A furry pet that meows 🐱' },
  { word: 'DOG', hint: 'A furry pet that barks 🐶' },
  { word: 'SUN', hint: 'Bright and yellow in the sky ☀️' },
  { word: 'MOON', hint: 'Shines at night 🌙' },
  { word: 'STAR', hint: 'Twinkles in the sky ⭐' },
  { word: 'TREE', hint: 'Has leaves and branches 🌳' },
  { word: 'FISH', hint: 'Swims in water 🐠' },
  { word: 'BIRD', hint: 'Flies in the sky 🐦' },
  { word: 'BOOK', hint: 'You read this 📚' },
  { word: 'BALL', hint: 'Round toy you can throw ⚽' },
];

export function WordScramble() {
  const [currentWord, setCurrentWord] = useState(words[0]);
  const [scrambled, setScrambled] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  useEffect(() => {
    generateNewWord();
  }, []);

  const scrambleWord = (word: string) => {
    const arr = word.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('');
  };

  const generateNewWord = () => {
    const randomWord = words[Math.floor(Math.random() * words.length)];
    setCurrentWord(randomWord);
    setScrambled(scrambleWord(randomWord.word));
    setUserAnswer('');
    setFeedback(null);
  };

  const checkAnswer = () => {
    if (userAnswer.toUpperCase() === currentWord.word) {
      setFeedback('correct');
      setScore(score + 1);
      setTimeout(() => {
        generateNewWord();
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
          Word Scramble
        </h3>
        <p className="text-gray-600" style={{ fontSize: '16px' }}>
          Unscramble the letters to make a word!
        </p>
        <div className="inline-block bg-[#8b7bd8] text-white px-6 py-2 rounded-full mt-4" style={{ fontSize: '18px', fontWeight: '600' }}>
          Score: {score}
        </div>
      </div>

      <div className="max-w-md mx-auto">
        <div className="bg-gradient-to-br from-[#ff8fa3] to-[#ffd166] rounded-3xl p-8 mb-6 text-white text-center">
          <p className="mb-4" style={{ fontSize: '18px' }}>
            {currentWord.hint}
          </p>
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-4">
            <p style={{ fontSize: '48px', fontWeight: '700', letterSpacing: '8px' }}>
              {scrambled}
            </p>
          </div>
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value.toUpperCase())}
            onKeyPress={handleKeyPress}
            placeholder="Type your answer"
            disabled={feedback !== null}
            className="w-full px-6 py-4 rounded-2xl text-center text-[#0a0e27] border-4 border-white focus:outline-none focus:border-[#8b7bd8]"
            style={{ fontSize: '24px', fontWeight: '700' }}
            maxLength={currentWord.word.length}
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
                  <Check className="w-8 h-8" />
                  Awesome! 🎉
                </>
              ) : (
                '❌ Try Again!'
              )}
            </p>
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={checkAnswer}
            disabled={!userAnswer || feedback !== null}
            className="flex-1 py-4 bg-[#8b7bd8] text-white rounded-full hover:bg-[#7a6ac7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontSize: '18px', fontWeight: '700' }}
          >
            Check Answer
          </button>
          <button
            onClick={generateNewWord}
            className="px-6 py-4 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors"
            style={{ fontSize: '18px', fontWeight: '700' }}
          >
            <Shuffle className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
