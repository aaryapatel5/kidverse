export function CTA() {
  return (
    <section className="py-20 px-8 md:px-16 lg:px-24 bg-gradient-to-r from-[#8b7bd8] to-[#6ec4db]">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-white mb-6" style={{ fontSize: '48px', fontWeight: '700' }}>
          Ready to Inspire Your Child?
        </h2>
        <p className="text-white/90 mb-8 max-w-2xl mx-auto" style={{ fontSize: '20px' }}>
          Start their journey today in KidVerse — a complete universe built just for kids.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-8 py-4 bg-white text-[#0a0e27] rounded-full hover:bg-gray-100 transition-colors" style={{ fontSize: '18px', fontWeight: '600' }}>
            Explore Kits
          </button>
          <button className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full hover:bg-white/10 transition-colors" style={{ fontSize: '18px', fontWeight: '600' }}>
            Learn More
          </button>
        </div>
      </div>
    </section>
  );
}
