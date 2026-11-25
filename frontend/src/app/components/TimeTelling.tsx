import { useState } from 'react';
import { Clock, Check, X } from 'lucide-react';

interface TimeQuestion {
  hour: number;
  minute: number;
  text: string;
}

const questions: TimeQuestion[] = [
  { hour: 3, minute: 0, text: '3:00' },
  { hour: 6, minute: 30, text: '6:30' },
  { hour: 9, minute: 15, text: '9:15' },
  { hour: 12, minute: 0, text: '12:00' },
  { hour: 2, minute: 45, text: '2:45' },
  { hour: 7, minute: 30, text: '7:30' },
];

export function TimeTelling() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedTime, setSelectedTime] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [score, setScore] = useState(0);

  const current = questions[currentIndex];

  const options = [
    current.text,
    `${(current.hour + 1) % 12 || 12}:${current.minute.toString().padStart(2, '0')}`,
    `${current.hour}:${((current.minute + 15) % 60).toString().padStart(2, '0')}`,
  ].sort(() => Math.random() - 0.5);

  const handleAnswer = (answer: string) => {
    setSelectedTime(answer);
    if (answer === current.text) {
      setFeedback('correct');
      setScore(score + 1);
    } else {
      setFeedback('wrong');
    }

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setCurrentIndex(0);
      }
      setSelectedTime('');
      setFeedback(null);
    }, 1500);
  };

  const getClockHandStyle = (value: number, type: 'hour' | 'minute') => {
    const angle = type === 'hour'
      ? ((current.hour % 12) + current.minute / 60) * 30
      : current.minute * 6;

    return {
      transform: `rotate(${angle}deg)`,
      transformOrigin: 'bottom center',
    };
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-xl">
      <div className="text-center mb-8">
        <h2 className="text-[#0a0e27] mb-2" style={{ fontSize: '36px', fontWeight: '700' }}>
          Tell the Time
        </h2>
        <p className="text-gray-600" style={{ fontSize: '18px' }}>
          What time is shown on the clock? 🕐
        </p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <Clock className="w-6 h-6 text-[#ffd166]" />
          <span className="text-[#8b7bd8]" style={{ fontSize: '24px', fontWeight: '700' }}>
            Score: {score}
          </span>
        </div>
      </div>

      <div className="max-w-sm mx-auto mb-8">
        <div className="relative w-64 h-64 mx-auto bg-white rounded-full border-8 border-[#8b7bd8] shadow-lg">
          {/* Clock numbers */}
          {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((num, idx) => {
            const angle = idx * 30;
            const x = Math.sin((angle * Math.PI) / 180) * 90;
            const y = -Math.cos((angle * Math.PI) / 180) * 90;
            return (
              <div
                key={num}
                className="absolute"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `translate(${x}px, ${y}px) translate(-50%, -50%)`,
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#0a0e27',
                }}
              >
                {num}
              </div>
            );
          })}

          {/* Hour hand */}
          <div
            className="absolute bg-[#0a0e27] rounded-full"
            style={{
              width: '6px',
              height: '60px',
              left: '50%',
              top: '50%',
              marginLeft: '-3px',
              marginTop: '-60px',
              ...getClockHandStyle(current.hour, 'hour'),
            }}
          />

          {/* Minute hand */}
          <div
            className="absolute bg-[#8b7bd8] rounded-full"
            style={{
              width: '4px',
              height: '80px',
              left: '50%',
              top: '50%',
              marginLeft: '-2px',
              marginTop: '-80px',
              ...getClockHandStyle(current.minute, 'minute'),
            }}
          />

          {/* Center dot */}
          <div className="absolute w-4 h-4 bg-[#ff8fa3] rounded-full left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => handleAnswer(option)}
            disabled={!!selectedTime}
            className={`py-6 rounded-2xl transition-all ${
              selectedTime === option && feedback === 'correct'
                ? 'bg-green-500 text-white'
                : selectedTime === option && feedback === 'wrong'
                ? 'bg-red-500 text-white'
                : selectedTime
                ? 'bg-gray-200 text-gray-400'
                : 'bg-[#6ec4db] text-white hover:bg-[#5db3ca]'
            } ${selectedTime ? 'cursor-not-allowed' : ''}`}
            style={{ fontSize: '32px', fontWeight: '700' }}
          >
            {option}
          </button>
        ))}
      </div>

      {feedback && (
        <div className={`mt-8 p-6 rounded-2xl text-center ${
          feedback === 'correct' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          <div className="flex items-center justify-center gap-2">
            {feedback === 'correct' ? (
              <Check className="w-8 h-8" />
            ) : (
              <X className="w-8 h-8" />
            )}
            <span style={{ fontSize: '24px', fontWeight: '700' }}>
              {feedback === 'correct' ? 'Correct! 🎉' : `Try again! It's ${current.text}`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
