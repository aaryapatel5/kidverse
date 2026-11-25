import { useState } from 'react';
import { Volume2, Award } from 'lucide-react';

const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

export function AlphabetGame() {
  const [currentLetter, setCurrentLetter] = useState(letters[0]);
  const [score, setScore] = useState(0);

  const speakLetter = (letter: string) => {
    const utterance = new SpeechSynthesisUtterance(letter);
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  };

  const handleLetterClick = (letter: string) => {
    speakLetter(letter);
    setCurrentLetter(letter);
    setScore(score + 1);
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-xl">
      <div className="text-center mb-8">
        <h2 className="text-[#0a0e27] mb-2" style={{ fontSize: '36px', fontWeight: '700' }}>
          ABC Learning
        </h2>
        <p className="text-gray-600" style={{ fontSize: '18px' }}>
          Click on letters to hear them! 🔤
        </p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <Award className="w-6 h-6 text-[#ffd166]" />
          <span className="text-[#8b7bd8]" style={{ fontSize: '24px', fontWeight: '700' }}>
            Learned: {score}
          </span>
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#8b7bd8] to-[#ff8fa3] rounded-2xl p-12 mb-8 text-center">
        <div className="bg-white rounded-full w-32 h-32 mx-auto flex items-center justify-center mb-4">
          <span className="text-[#8b7bd8]" style={{ fontSize: '80px', fontWeight: '900' }}>
            {currentLetter}
          </span>
        </div>
        <button
          onClick={() => speakLetter(currentLetter)}
          className="px-6 py-3 bg-white text-[#8b7bd8] rounded-full hover:bg-gray-100 transition-colors flex items-center gap-2 mx-auto"
          style={{ fontSize: '20px', fontWeight: '600' }}
        >
          <Volume2 className="w-6 h-6" />
          Play Sound
        </button>
      </div>

      <div className="grid grid-cols-7 gap-3">
        {letters.map((letter) => (
          <button
            key={letter}
            onClick={() => handleLetterClick(letter)}
            className={`aspect-square rounded-2xl transition-all hover:scale-110 ${
              letter === currentLetter
                ? 'bg-[#8b7bd8] text-white shadow-lg scale-110'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            style={{ fontSize: '24px', fontWeight: '700' }}
          >
            {letter}
          </button>
        ))}
      </div>
    </div>
  );
}
