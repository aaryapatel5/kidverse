const testimonials = [
  {
    quote: "My daughter absolutely loves the Creative Arts Kit! It keeps her engaged for hours and I've seen such growth in her creativity.",
    author: "Sarah M.",
    role: "Parent of 4-year-old"
  },
  {
    quote: "As an educator, I'm impressed by the quality and thoughtfulness of these kits. They truly support holistic child development.",
    author: "Dr. James Chen",
    role: "Early Childhood Educator"
  },
  {
    quote: "KidVerse has made learning fun again! My son used to struggle with math, but the Math Adventure Kit changed everything.",
    author: "Michael T.",
    role: "Parent of 8-year-old"
  }
];

export function Testimonials() {
  return (
    <section className="py-20 px-8 md:px-16 lg:px-24 bg-[#0a0e27]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-white mb-4" style={{ fontSize: '48px', fontWeight: '700' }}>
            What Parents Say
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto" style={{ fontSize: '20px' }}>
            Join thousands of families who have discovered the joy of learning with KidVerse.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <div className="mb-6">
                <svg className="w-10 h-10 text-[#8b7bd8]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>
              <p className="text-white mb-6" style={{ fontSize: '18px', lineHeight: '1.6' }}>
                {testimonial.quote}
              </p>
              <div>
                <p className="text-white" style={{ fontSize: '16px', fontWeight: '600' }}>
                  {testimonial.author}
                </p>
                <p className="text-gray-400" style={{ fontSize: '14px' }}>
                  {testimonial.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
