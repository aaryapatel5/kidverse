import { useState } from 'react';
import { Volume2, Star } from 'lucide-react';

interface Animal {
  name: string;
  emoji: string;
  sound: string;
  color: string;
}

const animals: Animal[] = [
  { name: 'Dog', emoji: '🐕', sound: 'Woof Woof!', color: 'bg-[#ff8fa3]' },
  { name: 'Cat', emoji: '🐈', sound: 'Meow Meow!', color: 'bg-[#8b7bd8]' },
  { name: 'Cow', emoji: '🐄', sound: 'Moo Moo!', color: 'bg-[#6ec4db]' },
  { name: 'Lion', emoji: '🦁', sound: 'Roar!', color: 'bg-[#ffd166]' },
  { name: 'Duck', emoji: '🦆', sound: 'Quack Quack!', color: 'bg-[#52C41A]' },
  { name: 'Pig', emoji: '🐷', sound: 'Oink Oink!', color: 'bg-[#ff8fa3]' },
  { name: 'Sheep', emoji: '🐑', sound: 'Baa Baa!', color: 'bg-[#8b7bd8]' },
  { name: 'Horse', emoji: '🐴', sound: 'Neigh!', color: 'bg-[#6ec4db]' },
];

export function AnimalSounds() {
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [score, setScore] = useState(0);

  const playSound = (animal: Animal) => {
    setSelectedAnimal(animal);
    setScore(score + 1);
    const utterance = new SpeechSynthesisUtterance(animal.sound);
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-xl">
      <div className="text-center mb-8">
        <h2 className="text-[#0a0e27] mb-2" style={{ fontSize: '36px', fontWeight: '700' }}>
          Animal Sounds
        </h2>
        <p className="text-gray-600" style={{ fontSize: '18px' }}>
          Click on animals to hear their sounds! 🦁
        </p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <Star className="w-6 h-6 text-[#ffd166]" />
          <span className="text-[#8b7bd8]" style={{ fontSize: '24px', fontWeight: '700' }}>
            Played: {score}
          </span>
        </div>
      </div>

      {selectedAnimal && (
        <div className={`${selectedAnimal.color} rounded-2xl p-8 mb-8 text-center text-white animate-[bounce_0.5s_ease-in-out]`}>
          <div style={{ fontSize: '80px' }}>{selectedAnimal.emoji}</div>
          <p style={{ fontSize: '32px', fontWeight: '700' }}>{selectedAnimal.name}</p>
          <p style={{ fontSize: '28px', fontWeight: '600' }} className="opacity-90">
            {selectedAnimal.sound}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {animals.map((animal) => (
          <button
            key={animal.name}
            onClick={() => playSound(animal)}
            className={`${animal.color} text-white rounded-3xl p-6 hover:scale-105 transition-transform shadow-lg`}
          >
            <div style={{ fontSize: '64px' }} className="mb-2">
              {animal.emoji}
            </div>
            <p style={{ fontSize: '20px', fontWeight: '700' }}>{animal.name}</p>
            <Volume2 className="w-5 h-5 mx-auto mt-2" />
          </button>
        ))}
      </div>
    </div>
  );
}
