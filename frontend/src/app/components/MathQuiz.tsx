import { useState, useEffect } from 'react';
import { Calculator, Trophy } from 'lucide-react';

export function MathQuiz() {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [operator, setOperator] = useState('+');
  const [answer, setAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  useEffect(() => {
    generateQuestion();
  }, []);

  const generateQuestion = () => {
    const operators = ['+', '-'];
    const op = operators[Math.floor(Math.random() * operators.length)];
    setOperator(op);

    if (op === '+') {
      const n1 = Math.floor(Math.random() * 20) + 1;
      const n2 = Math.floor(Math.random() * 20) + 1;
      setNum1(n1);
      setNum2(n2);
    } else {
      // For subtraction, ensure result is positive
      const n1 = Math.floor(Math.random() * 20) + 10;
      const n2 = Math.floor(Math.random() * n1);
      setNum1(n1);
      setNum2(n2);
    }
    
    setAnswer('');
    setFeedback(null);
  };

  const checkAnswer = () => {
    const correctAnswer = operator === '+' ? num1 + num2 : num1 - num2;
    const userAnswer = parseInt(answer);

    setTotal(total + 1);

    if (userAnswer === correctAnswer) {
      setFeedback('correct');
      setScore(score + 1);
      setTimeout(() => {
        generateQuestion();
      }, 1500);
    } else {
      setFeedback('wrong');
      setTimeout(() => {
        setFeedback(null);
        setAnswer('');
      }, 1500);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && answer) {
      checkAnswer();
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-lg">
      <div className="text-center mb-6">
        <h3 className="text-[#0a0e27] mb-2 flex items-center justify-center gap-2" style={{ fontSize: '28px', fontWeight: '700' }}>
          <Calculator className="w-8 h-8" />
          Math Quiz
        </h3>
        <p className="text-gray-600" style={{ fontSize: '16px' }}>
          Solve the problems!
        </p>
        <div className="flex gap-4 justify-center mt-4">
          <div className="bg-[#6ec4db] text-white px-4 py-2 rounded-full flex items-center gap-2" style={{ fontSize: '14px' }}>
            <Trophy className="w-4 h-4" />
            Score: {score}/{total}
          </div>
        </div>
      </div>

      <div className="max-w-sm mx-auto">
        <div className="bg-gradient-to-br from-[#8b7bd8] to-[#6ec4db] rounded-3xl p-8 mb-6 text-white">
          <div className="text-center mb-6">
            <p style={{ fontSize: '20px' }}>What is:</p>
          </div>
          
          <div className="flex items-center justify-center gap-4 mb-8">
            <span style={{ fontSize: '64px', fontWeight: '700' }}>{num1}</span>
            <span style={{ fontSize: '48px', fontWeight: '700' }}>{operator}</span>
            <span style={{ fontSize: '64px', fontWeight: '700' }}>{num2}</span>
            <span style={{ fontSize: '48px', fontWeight: '700' }}>=</span>
            <span style={{ fontSize: '64px', fontWeight: '700' }}>?</span>
          </div>

          <input
            type="number"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Your answer"
            disabled={feedback !== null}
            className="w-full px-6 py-4 rounded-2xl text-center text-[#0a0e27] border-4 border-white focus:outline-none focus:border-[#ffd166]"
            style={{ fontSize: '32px', fontWeight: '700' }}
          />
        </div>

        {feedback && (
          <div className={`text-center py-6 rounded-2xl mb-6 ${
            feedback === 'correct' ? 'bg-green-100' : 'bg-red-100'
          }`}>
            <p className={`${
              feedback === 'correct' ? 'text-green-600' : 'text-red-600'
            }`} style={{ fontSize: '32px', fontWeight: '700' }}>
              {feedback === 'correct' ? '🎉 Correct!' : '❌ Try Again!'}
            </p>
            {feedback === 'correct' && (
              <p className="text-green-600 mt-2" style={{ fontSize: '18px' }}>
                {num1} {operator} {num2} = {operator === '+' ? num1 + num2 : num1 - num2}
              </p>
            )}
          </div>
        )}

        <button
          onClick={checkAnswer}
          disabled={!answer || feedback !== null}
          className="w-full px-8 py-4 bg-[#ff8fa3] text-white rounded-full hover:bg-[#ff7a90] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ fontSize: '20px', fontWeight: '700' }}
        >
          Check Answer
        </button>
      </div>
    </div>
  );
}
