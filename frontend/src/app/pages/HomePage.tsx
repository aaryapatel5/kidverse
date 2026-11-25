import { useNavigate } from 'react-router';
import { Logo } from '../components/Logo';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export function HomePage() {
  const navigate = useNavigate();

  const kidImages = [
    {
      url: 'https://images.unsplash.com/photo-1758598738113-86c0f874c85a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
      alt: 'Children building with colorful blocks'
    },
    {
      url: 'https://images.unsplash.com/photo-1758687126165-15540f06288b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
      alt: 'Father and son building together'
    },
    {
      url: 'https://images.unsplash.com/photo-1586503452950-997923af27f9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
      alt: 'Child with coloring pencils'
    },
    {
      url: 'https://images.unsplash.com/photo-1758687126231-f9db9bf7b0b2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
      alt: 'Playing with building blocks'
    },
    {
      url: 'https://images.unsplash.com/photo-1758598737977-094cb3ca9ce8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
      alt: 'Learning with colorful blocks'
    }
  ];

  return (
    <div className="size-full min-h-screen bg-gradient-to-br from-[#ffebee] via-[#fff3e0] to-[#e8f5e9] flex flex-col items-center justify-center p-8">
      {/* Login Button - Top Right */}
      <button
        onClick={() => navigate('/login')}
        className="absolute top-6 right-6 px-6 py-3 bg-[#8b7bd8] hover:bg-[#7a6ac7] text-white rounded-full transition-colors shadow-lg"
        style={{ fontSize: '16px', fontWeight: '600' }}
      >
        Login
      </button>

      {/* Logo and Name */}
      <div className="flex flex-col items-center mb-16 animate-[bounce_2s_ease-in-out_infinite]">
        <Logo className="mb-6" />
        <h1
          className="text-[#ff8fa3]"
          style={{
            fontSize: '96px',
            fontWeight: '900',
            textShadow: '4px 4px 0px rgba(139, 123, 216, 0.3)',
            letterSpacing: '0.05em'
          }}
        >
          KidVerse
        </h1>
        <p
          className="text-[#8b7bd8] mt-2"
          style={{ fontSize: '24px', fontWeight: '600' }}
        >
          Learning Through Play
        </p>
      </div>

      {/* Kid Images Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-7xl">
        {kidImages.map((image, index) => (
          <div
            key={index}
            className="relative aspect-square rounded-3xl overflow-hidden shadow-xl transform hover:scale-105 transition-transform duration-300 bg-white"
            style={{
              animation: `float ${3 + index * 0.5}s ease-in-out infinite`,
              animationDelay: `${index * 0.2}s`
            }}
          >
            <ImageWithFallback
              src={image.url}
              alt={image.alt}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
          </div>
        ))}
      </div>

      {/* Floating Shapes Decoration */}
      <div className="absolute top-20 left-10 w-16 h-16 bg-[#ffeb3b] rounded-full opacity-30 animate-[bounce_3s_ease-in-out_infinite]" />
      <div className="absolute bottom-32 right-20 w-20 h-20 bg-[#ff8fa3] rounded-full opacity-30 animate-[bounce_4s_ease-in-out_infinite]" />
      <div className="absolute top-40 right-32 w-12 h-12 bg-[#8b7bd8] rounded-full opacity-30 animate-[bounce_3.5s_ease-in-out_infinite]" />
      <div className="absolute bottom-20 left-32 w-16 h-16 bg-[#4fc3f7] rounded-full opacity-30 animate-[bounce_4.5s_ease-in-out_infinite]" />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
}