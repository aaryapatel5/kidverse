import heroImage from "figma:asset/ddf67f8344bfa7909c886c16b0981b2592057ff9.png";
import { Logo } from './Logo';

export function Hero() {
  return (
    <section className="min-h-screen grid md:grid-cols-2 bg-[#0a0e27]">
      {/* Left Content */}
      <div className="flex flex-col justify-center px-8 md:px-16 lg:px-24 py-16">
        <div className="max-w-xl">
          <Logo className="mb-12" />
          <h2 className="text-white mb-8" style={{ fontSize: '64px', fontWeight: '700', lineHeight: '1.2' }}>
            A Complete Universe for Kids to Grow
          </h2>
          <p className="text-gray-300" style={{ fontSize: '18px' }}>
            Team KidVerse • JG University • March 2026
          </p>
        </div>
      </div>

      {/* Right Image */}
      <div className="relative h-full min-h-[600px] md:min-h-screen">
        <img 
          src={heroImage} 
          alt="Children learning together under moonlight"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    </section>
  );
}