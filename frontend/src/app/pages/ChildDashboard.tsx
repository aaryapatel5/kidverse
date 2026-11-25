import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Header } from '../components/Header';
import { apiGetProgress, apiAddStar } from '../../services/api';
import { MemoryGame } from '../components/MemoryGame';
import { DrawingCanvas } from '../components/DrawingCanvas';
import { ColorMatchGame } from '../components/ColorMatchGame';
import { MathQuiz } from '../components/MathQuiz';
import { WordScramble } from '../components/WordScramble';
import { ShapeMatch } from '../components/ShapeMatch';
import { CountingGame } from '../components/CountingGame';
import { PuzzleGame } from '../components/PuzzleGame';
import { PatternGame } from '../components/PatternGame';
import { AlphabetGame } from '../components/AlphabetGame';
import { AnimalSounds } from '../components/AnimalSounds';
import { SimonSays } from '../components/SimonSays';
import { RhymingGame } from '../components/RhymingGame';
import { TimeTelling } from '../components/TimeTelling';
import { SpellingBee } from '../components/SpellingBee';
import { Gamepad2, Paintbrush, Palette, Calculator, Star, Shapes, Hash, Puzzle, Sparkles, Volume2, Music, Clock, Trophy } from 'lucide-react';

type GameType =
  | 'memory' | 'drawing' | 'colors' | 'math' | 'words' | 'shapes' | 'counting' | 'puzzle' | 'pattern'
  | 'alphabet' | 'animals' | 'simon' | 'rhyming' | 'time' | 'spelling';

export function ChildDashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [activeGame, setActiveGame] = useState<GameType>('alphabet');
  const [selectedAge, setSelectedAge] = useState<'3-5' | '6-8' | '9+'>('3-5');
  const [gameStars, setGameStars] = useState(0);
  const [showStarPop, setShowStarPop] = useState(false);
  const starPopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const storedUserType = localStorage.getItem('userType');
    const storedUserName = localStorage.getItem('userName');

    if (storedUserType !== 'child') {
      navigate('/login?type=child');
      return;
    }

    if (storedUserName) {
      setUserName(storedUserName);
    }

    const savedStars = Number.parseInt(localStorage.getItem('kidverse_game_stars') || '0', 10);
    setGameStars(Number.isFinite(savedStars) ? Math.max(0, savedStars) : 0);

    // Sync stars with MySQL backend
    if (storedUserName) {
      apiGetProgress(storedUserName).then((res) => {
        if (res && typeof res.stars === 'number') {
          setGameStars(res.stars);
          localStorage.setItem('kidverse_game_stars', String(res.stars));
        }
      }).catch(console.warn);
    }

    return () => {
      if (starPopTimer.current) clearTimeout(starPopTimer.current);
    };
  }, [navigate]);

  const startGame = (gameId: GameType) => {
    setActiveGame(gameId);
    const stored = Number.parseInt(localStorage.getItem('kidverse_game_stars') || '0', 10);
    const current = Number.isFinite(stored) ? Math.max(0, stored) : 0;
    const newStars = current + 1;
    localStorage.setItem('kidverse_game_stars', String(newStars));
    localStorage.setItem('kidverse_last_game', gameId);
    setGameStars(newStars);
    setShowStarPop(true);
    if (starPopTimer.current) clearTimeout(starPopTimer.current);
    starPopTimer.current = setTimeout(() => setShowStarPop(false), 1500);

    // Persist star update to MySQL backend
    apiAddStar(userName || localStorage.getItem('userName') || 'Leo', gameId, 1).then((res) => {
      if (res && typeof res.stars === 'number') {
        setGameStars(res.stars);
        localStorage.setItem('kidverse_game_stars', String(res.stars));
      }
    }).catch(console.warn);
  };

  const handleLogout = () => {
    localStorage.removeItem('userType');
    localStorage.removeItem('userName');
    navigate('/');
  };

  const games = [
    // Ages 3-5: Simple, fun, and interactive
    { id: 'alphabet' as GameType, name: 'ABC Learning', icon: Star, color: 'bg-[#ff8fa3]', age: '3-5' },
    { id: 'animals' as GameType, name: 'Animal Sounds', icon: Volume2, color: 'bg-[#52C41A]', age: '3-5' },
    { id: 'colors' as GameType, name: 'Color Match', icon: Palette, color: 'bg-[#6ec4db]', age: '3-5' },
    { id: 'drawing' as GameType, name: 'Drawing', icon: Paintbrush, color: 'bg-[#ff8fa3]', age: '3-5' },
    { id: 'counting' as GameType, name: 'Counting', icon: Hash, color: 'bg-[#ffd166]', age: '3-5' },

    // Ages 6-8: Learning fundamentals
    { id: 'rhyming' as GameType, name: 'Rhyming Words', icon: Music, color: 'bg-[#8b7bd8]', age: '6-8' },
    { id: 'spelling' as GameType, name: 'Spelling Bee', icon: Sparkles, color: 'bg-[#ffd166]', age: '6-8' },
    { id: 'shapes' as GameType, name: 'Shape Match', icon: Shapes, color: 'bg-[#6ec4db]', age: '6-8' },
    { id: 'memory' as GameType, name: 'Memory Match', icon: Gamepad2, color: 'bg-[#8b7bd8]', age: '6-8' },
    { id: 'words' as GameType, name: 'Word Scramble', icon: Sparkles, color: 'bg-[#ff8fa3]', age: '6-8' },

    // Ages 9+: Advanced challenges
    { id: 'math' as GameType, name: 'Math Quiz', icon: Calculator, color: 'bg-[#6ec4db]', age: '9+' },
    { id: 'simon' as GameType, name: 'Simon Says', icon: Trophy, color: 'bg-[#ff8fa3]', age: '9+' },
    { id: 'time' as GameType, name: 'Tell the Time', icon: Clock, color: 'bg-[#52C41A]', age: '9+' },
    { id: 'puzzle' as GameType, name: 'Puzzle', icon: Puzzle, color: 'bg-[#8b7bd8]', age: '9+' },
    { id: 'pattern' as GameType, name: 'Pattern Game', icon: Sparkles, color: 'bg-[#ffd166]', age: '9+' },
  ];

  const filteredGames = games.filter(game => game.age === selectedAge);
  const nextMilestone = gameStars < 10 ? 10 : gameStars < 25 ? 25 : gameStars < 50 ? 50 : 50;
  const milestoneStart = gameStars < 10 ? 0 : gameStars < 25 ? 10 : gameStars < 50 ? 25 : 0;
  const milestoneProgress = gameStars >= 50
    ? 100
    : Math.min(100, ((gameStars - milestoneStart) / (nextMilestone - milestoneStart)) * 100);

  return (
    <div className="min-h-screen bg-[#0a0e27] text-white [background-image:radial-gradient(circle_at_15%_15%,rgba(139,123,216,0.28),transparent_28%),radial-gradient(circle_at_85%_30%,rgba(110,196,219,0.18),transparent_25%),radial-gradient(circle_at_50%_90%,rgba(255,143,163,0.12),transparent_30%)]">
      <Header userType="child" userName={userName} onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        {/* Star pop animation */}
        {showStarPop && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-bounce">
            <div className="bg-[#ffd166] text-[#0a0e27] px-6 py-3 rounded-full flex items-center gap-2 shadow-xl" style={{ fontSize: '22px', fontWeight: '800' }}>
              <Star className="w-6 h-6" fill="currentColor" /> +1 Star Earned!
            </div>
          </div>
        )}

        {/* Welcome Section */}
        <div className="relative mb-10 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 sm:p-9 shadow-2xl shadow-black/20 backdrop-blur-sm">
          <div className="absolute -right-10 -top-12 h-44 w-44 rounded-full bg-[#ffd166]/10 blur-2xl" />
          <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_340px]">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#ff8fa3]/15 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.16em] text-[#ffb7c4]">
                <Sparkles className="h-4 w-4" /> Your learning universe
              </div>
              <h1 className="text-white mb-3 text-4xl sm:text-6xl font-bold leading-[1.05]">
                Hi, {userName || 'Explorer'}!
              </h1>
              <p className="max-w-xl text-lg sm:text-2xl text-white/70">
                Pick a world, play a game, and make your star collection shine.
              </p>
            </div>

            <div className="rounded-3xl border border-[#ffd166]/25 bg-[#ffd166]/10 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#ffd166] text-[#0a0e27] shadow-lg shadow-[#ffd166]/20">
                    <Trophy className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-white/50">Star bank</p>
                    <p className="text-2xl font-extrabold text-[#ffd166]">{gameStars} stars</p>
                  </div>
                </div>
                <Star className="h-8 w-8 rotate-12 text-[#ffd166]" fill="currentColor" />
              </div>
              <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#ffd166] to-[#ff8fa3] transition-all duration-500"
                  style={{ width: `${milestoneProgress}%` }}
                />
              </div>
              <p className="mt-2 text-sm text-white/60">
                {gameStars >= 50 ? 'Champion reward unlocked!' : `${nextMilestone - gameStars} more to unlock the next family reward`}
              </p>
            </div>
          </div>
        </div>

        {/* Age Group Selector */}
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#6ec4db]">Choose your level</p>
            <h2 className="mt-1 text-2xl sm:text-3xl font-bold">Which world shall we visit?</h2>
          </div>
          <span className="hidden sm:block text-sm text-white/50">5 games in every world</span>
        </div>
        <div className="flex flex-wrap gap-3 sm:gap-4 mb-8 rounded-3xl border border-white/10 bg-black/10 p-3" aria-label="Choose an age group">
          {(['3-5', '6-8', '9+'] as const).map((age) => (
            <button
              key={age}
              onClick={() => {
                setSelectedAge(age);
                const firstGameInAge = games.find(g => g.age === age);
                if (firstGameInAge) setActiveGame(firstGameInAge.id);
              }}

              className={`flex-1 min-w-[120px] px-5 sm:px-8 py-3 sm:py-4 rounded-2xl transition-all transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffd166] ${
                selectedAge === age
                  ? 'bg-[#ffd166] text-[#0a0e27] shadow-lg shadow-[#ffd166]/20'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              style={{ fontSize: '20px', fontWeight: '700' }}
            >
              Ages {age}
            </button>
          ))}
        </div>

        {/* Game selector */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 mb-10">
          {filteredGames.map((game) => (
            <button
              key={game.id}
              onClick={() => startGame(game.id)}
              aria-pressed={activeGame === game.id}
              aria-label={`Play ${game.name} and earn one star`}
              className={`group min-h-28 px-4 py-5 rounded-3xl transition-all transform hover:-translate-y-1 flex flex-col items-start justify-between gap-4 text-left ${
                activeGame === game.id
                  ? `${game.color} text-white shadow-xl ring-2 ring-white/70`
                  : 'bg-white/[0.07] border border-white/10 text-white hover:bg-white/[0.13] hover:border-white/20'
              }`}
            >
              <game.icon className="w-7 h-7 transition-transform group-hover:rotate-6 group-hover:scale-110" />
              <span className="text-base sm:text-lg font-bold leading-tight">{game.name}</span>
            </button>
          ))}
        </div>

        {/* Active game */}
        <div className="max-w-4xl mx-auto rounded-[2rem] border border-white/10 bg-white/[0.06] p-2 sm:p-4 shadow-2xl shadow-black/20">
          {activeGame === 'memory' && <MemoryGame />}
          {activeGame === 'drawing' && <DrawingCanvas />}
          {activeGame === 'colors' && <ColorMatchGame />}
          {activeGame === 'math' && <MathQuiz />}
          {activeGame === 'words' && <WordScramble />}
          {activeGame === 'shapes' && <ShapeMatch />}
          {activeGame === 'counting' && <CountingGame />}
          {activeGame === 'puzzle' && <PuzzleGame />}
          {activeGame === 'pattern' && <PatternGame />}
          {activeGame === 'alphabet' && <AlphabetGame />}
          {activeGame === 'animals' && <AnimalSounds />}
          {activeGame === 'simon' && <SimonSays />}
          {activeGame === 'rhyming' && <RhymingGame />}
          {activeGame === 'time' && <TimeTelling />}
          {activeGame === 'spelling' && <SpellingBee />}
        </div>
      </div>
    </div>
  );
}
