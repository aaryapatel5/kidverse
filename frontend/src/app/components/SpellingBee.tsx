import { useState } from 'react';
import { Volume2, Check, X, Award } from 'lucide-react';

interface Word {
  word: string;
  hint: string;
}

const words: Word[] = [
  { word: 'apple', hint: 'A red fruit 🍎' },
  { word: 'house', hint: 'Where you live 🏠' },
  { word: 'book', hint: 'You read this 📚' },
  { word: 'water', hint: 'You drink this 💧' },
  { word: 'happy', hint: 'A good feeling 😊' },
  { word: 'friend', hint: 'Someone you play with 👫' },
  { word: 'school', hint: 'Where you learn 🏫' },
  { word: 'sunny', hint: 'A bright day ☀️' },
];

export function SpellingBee() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [score, setScore] = useState(0);

  const current = words[currentIndex];

  const speakWord = () => {
    const utterance = new SpeechSynthesisUtterance(current.word);
    utterance.rate = 0.7;
    window.speechSynthesis.speak(utterance);
  };

  const handleSubmit = () => {
    if (userAnswer.toLowerCase().trim() === current.word.toLowerCase()) {
      setFeedback('correct');
      setScore(score + 1);
    } else {
      setFeedback('wrong');
    }

    setTimeout(() => {
      if (currentIndex < words.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setCurrentIndex(0);
      }
      setUserAnswer('');
      setFeedback(null);
    }, 2000);
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-xl">
      <div className="text-center mb-8">
        <h2 className="text-[#0a0e27] mb-2" style={{ fontSize: '36px', fontWeight: '700' }}>
          Spelling Bee
        </h2>
        <p className="text-gray-600" style={{ fontSize: '18px' }}>
          Listen and spell the word correctly! 🐝
        </p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <Award className="w-6 h-6 text-[#ffd166]" />
          <span className="text-[#8b7bd8]" style={{ fontSize: '24px', fontWeight: '700' }}>
            Score: {score}/{words.length}
          </span>
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#ffd166] to-[#ff8fa3] rounded-2xl p-12 mb-8 text-center">
        <p className="text-white mb-6" style={{ fontSize: '24px', fontWeight: '600' }}>
          {current.hint}
        </p>
        <button
          onClick={speakWord}
          className="px-8 py-4 bg-white text-[#ff8fa3] rounded-full hover:bg-gray-100 transition-colors flex items-center gap-3 mx-auto"
          style={{ fontSize: '24px', fontWeight: '700' }}
        >
          <Volume2 className="w-8 h-8" />
          Play Word
        </button>
      </div>

      {!feedback && (
        <div className="max-w-md mx-auto">
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && userAnswer && handleSubmit()}
            placeholder="Type the word here..."
            className="w-full px-6 py-4 text-center rounded-2xl border-4 border-[#8b7bd8] focus:outline-none focus:border-[#ff8fa3] transition-colors mb-6"
            style={{ fontSize: '28px', fontWeight: '600' }}
            autoFocus
          />
          <button
            onClick={handleSubmit}
            disabled={!userAnswer}
            className="w-full py-4 bg-[#8b7bd8] text-white rounded-2xl hover:bg-[#7a6ac7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontSize: '24px', fontWeight: '700' }}
          >
            Check Spelling
          </button>
        </div>
      )}

      {feedback && (
        <div className={`max-w-md mx-auto p-8 rounded-2xl text-center ${
          feedback === 'correct' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          <div className="flex items-center justify-center gap-3 mb-4">
            {feedback === 'correct' ? (
              <Check className="w-12 h-12" />
            ) : (
              <X className="w-12 h-12" />
            )}
            <span style={{ fontSize: '32px', fontWeight: '700' }}>
              {feedback === 'correct' ? 'Perfect! 🎉' : 'Not quite!'}
            </span>
          </div>
          <p style={{ fontSize: '24px', fontWeight: '600' }}>
            The word is: <span className="font-bold">{current.word}</span>
          </p>
        </div>
      )}
    </div>
  );
}
