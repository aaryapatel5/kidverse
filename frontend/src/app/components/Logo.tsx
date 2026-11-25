export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg className="h-11 w-11 sm:h-[54px] sm:w-[54px]" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Colorful circles representing kids/learning */}
        <circle cx="30" cy="30" r="28" fill="url(#gradient1)" />
        
        {/* Book pages */}
        <path d="M20 25 L20 40 L30 38 L40 40 L40 25 L30 27 Z" fill="white" opacity="0.9"/>
        <line x1="30" y1="27" x2="30" y2="38" stroke="#8b7bd8" strokeWidth="2"/>
        
        {/* Playful stars */}
        <circle cx="18" cy="18" r="3" fill="#FFD166"/>
        <circle cx="42" cy="18" r="3" fill="#FF8FA3"/>
        <circle cx="18" cy="42" r="3" fill="#6EC4DB"/>
        <circle cx="42" cy="42" r="3" fill="#52C41A"/>
        
        <defs>
          <linearGradient id="gradient1" x1="0" y1="0" x2="60" y2="60" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#8b7bd8"/>
            <stop offset="50%" stopColor="#6ec4db"/>
            <stop offset="100%" stopColor="#ff8fa3"/>
          </linearGradient>
        </defs>
      </svg>
      
      <div className="flex flex-col">
        <span className="text-white tracking-wide text-2xl sm:text-[30px] font-extrabold leading-none">
          KidVerse
        </span>
        <span className="hidden sm:block text-white/70 text-[10px] font-bold tracking-[0.16em] mt-1">
          A COMPLETE UNIVERSE FOR KIDS
        </span>
      </div>
    </div>
  );
}
