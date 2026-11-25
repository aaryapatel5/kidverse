import { Logo } from './Logo';
import { useNavigate } from 'react-router';
import { LogOut, User } from 'lucide-react';

interface HeaderProps {
  userType?: 'parent' | 'child' | null;
  userName?: string;
  onLogout?: () => void;
}

export function Header({ userType, userName, onLogout }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0e27]/95 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
        <button
          onClick={() => navigate('/')}
          className="rounded-2xl transition-transform hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffd166]"
          aria-label="Go to KidVerse home"
        >
          <Logo />
        </button>

        {userType && (
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:flex items-center gap-2 text-white">
              <div className={`grid h-9 w-9 place-items-center rounded-full ${
                userType === 'parent' ? 'bg-[#8b7bd8]' : 'bg-[#ff8fa3]'
              }`}>
                <User className="w-4 h-4" />
              </div>
              <span className="font-bold">
                {userName || (userType === 'parent' ? 'Parent' : 'Child')}
              </span>
              <span className={`ml-1 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${
                userType === 'parent' ? 'bg-[#8b7bd8]/20 text-[#c9c0ff]' : 'bg-[#ff8fa3]/20 text-[#ffb7c4]'
              }`}>
                {userType === 'parent' ? 'Parent' : 'Kids Zone'}
              </span>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors text-sm font-bold"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
