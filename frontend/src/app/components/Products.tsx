import { ImageWithFallback } from './figma/ImageWithFallback';

const products = [
  {
    title: "Creative Arts Kit",
    age: "Ages 3-5",
    description: "Explore colors, shapes, and textures through painting, drawing, and crafting activities.",
    color: "bg-[#ff8fa3]"
  },
  {
    title: "Science Explorer Kit",
    age: "Ages 6-8",
    description: "Discover the wonders of science with fun experiments and hands-on exploration.",
    color: "bg-[#8b7bd8]"
  },
  {
    title: "Math Adventure Kit",
    age: "Ages 7-10",
    description: "Make math exciting with games, puzzles, and real-world problem-solving challenges.",
    color: "bg-[#6ec4db]"
  },
  {
    title: "Reading & Writing Kit",
    age: "Ages 5-7",
    description: "Build literacy skills through storytelling, creative writing, and reading activities.",
    color: "bg-[#ffd166]"
  }
];

export function Products() {
  return (
    <section className="py-20 px-8 md:px-16 lg:px-24 bg-gradient-to-b from-white to-blue-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-[#0a0e27] mb-4" style={{ fontSize: '48px', fontWeight: '700' }}>
            Explore the KidVerse
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto" style={{ fontSize: '20px' }}>
            Each kit is a complete learning journey, packed with activities, materials, and guides to inspire young learners.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product, index) => (
            <div key={index} className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <div className={`${product.color} h-48 flex items-center justify-center`}>
                <ImageWithFallback 
                  src={`https://images.unsplash.com/photo-${1500000000000 + index * 100000000}?auto=format&fit=crop&w=400&h=300`}
                  alt={product.title}
                  className="w-full h-full object-cover opacity-80"
                />
              </div>
              <div className="p-6">
                <div className="inline-block px-3 py-1 rounded-full bg-gray-100 text-gray-700 mb-3" style={{ fontSize: '14px' }}>
                  {product.age}
                </div>
                <h3 className="text-[#0a0e27] mb-3" style={{ fontSize: '24px', fontWeight: '600' }}>
                  {product.title}
                </h3>
                <p className="text-gray-600" style={{ fontSize: '16px' }}>
                  {product.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
