import { useState } from 'react';
import { Check, X, Star } from 'lucide-react';

interface RhymePair {
  word: string;
  options: string[];
  correctAnswer: string;
}

const rhymes: RhymePair[] = [
  { word: 'Cat', options: ['Hat', 'Dog', 'Bird'], correctAnswer: 'Hat' },
  { word: 'Sun', options: ['Moon', 'Run', 'Star'], correctAnswer: 'Run' },
  { word: 'Tree', options: ['Bee', 'Flower', 'Grass'], correctAnswer: 'Bee' },
  { word: 'Dog', options: ['Cat', 'Frog', 'Bird'], correctAnswer: 'Frog' },
  { word: 'Ball', options: ['Toy', 'Wall', 'Book'], correctAnswer: 'Wall' },
  { word: 'Moon', options: ['Sun', 'Spoon', 'Star'], correctAnswer: 'Spoon' },
];

export function RhymingGame() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [answered, setAnswered] = useState(false);

  const current = rhymes[currentIndex];

  const handleAnswer = (answer: string) => {
    if (answered) return;

    setAnswered(true);
    if (answer === current.correctAnswer) {
      setFeedback('correct');
      setScore(score + 1);
    } else {
      setFeedback('wrong');
    }

    setTimeout(() => {
      if (currentIndex < rhymes.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setCurrentIndex(0);
      }
      setFeedback(null);
      setAnswered(false);
    }, 1500);
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-xl">
      <div className="text-center mb-8">
        <h2 className="text-[#0a0e27] mb-2" style={{ fontSize: '36px', fontWeight: '700' }}>
          Rhyming Words
        </h2>
        <p className="text-gray-600" style={{ fontSize: '18px' }}>
          Find the word that rhymes! 🎵
        </p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <Star className="w-6 h-6 text-[#ffd166]" />
          <span className="text-[#8b7bd8]" style={{ fontSize: '24px', fontWeight: '700' }}>
            Score: {score}
          </span>
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#ff8fa3] to-[#ffd166] rounded-2xl p-12 mb-8 text-center">
        <p className="text-white mb-4" style={{ fontSize: '20px', fontWeight: '600' }}>
          Which word rhymes with:
        </p>
        <div className="bg-white rounded-full px-12 py-6 inline-block">
          <span className="text-[#ff8fa3]" style={{ fontSize: '56px', fontWeight: '900' }}>
            {current.word}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
        {current.options.map((option) => (
          <button
            key={option}
            onClick={() => handleAnswer(option)}
            disabled={answered}
            className={`py-6 rounded-2xl transition-all ${
              answered && option === current.correctAnswer
                ? 'bg-green-500 text-white'
                : answered && feedback === 'wrong' && option !== current.correctAnswer
                ? 'bg-gray-200 text-gray-400'
                : 'bg-[#8b7bd8] text-white hover:bg-[#7a6ac7]'
            } ${answered ? 'cursor-not-allowed' : ''}`}
            style={{ fontSize: '24px', fontWeight: '700' }}
          >
            {option}
          </button>
        ))}
      </div>

      {feedback && (
        <div className={`mt-8 p-6 rounded-2xl text-center ${
          feedback === 'correct' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          <div className="flex items-center justify-center gap-2 mb-2">
            {feedback === 'correct' ? (
              <Check className="w-8 h-8" />
            ) : (
              <X className="w-8 h-8" />
            )}
            <span style={{ fontSize: '24px', fontWeight: '700' }}>
              {feedback === 'correct' ? 'Correct! 🎉' : 'Try again!'}
            </span>
          </div>
          {feedback === 'correct' && (
            <p style={{ fontSize: '18px' }}>
              {current.word} and {current.correctAnswer} rhyme!
            </p>
          )}
        </div>
      )}
    </div>
  );
}
