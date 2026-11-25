import { Sparkles, Brain, Heart, Star } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: "Cognitive Development",
    description: "Carefully designed activities that stimulate critical thinking, problem-solving, and creativity in young minds."
  },
  {
    icon: Heart,
    title: "Social & Emotional Growth",
    description: "Encourage teamwork, empathy, and communication through collaborative learning experiences."
  },
  {
    icon: Sparkles,
    title: "Hands-On Learning",
    description: "Interactive kits that make learning fun and engaging through tactile, real-world experiences."
  },
  {
    icon: Star,
    title: "Age-Appropriate",
    description: "Expertly curated content tailored to different developmental stages and learning abilities."
  }
];

export function Features() {
  return (
    <section className="py-20 px-8 md:px-16 lg:px-24 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-[#0a0e27] mb-4" style={{ fontSize: '48px', fontWeight: '700' }}>
            Why Choose KidVerse?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto" style={{ fontSize: '20px' }}>
            KidVerse is designed by educators and child development experts to nurture every aspect of your child's growth.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#8b7bd8] mb-6">
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-[#0a0e27] mb-3" style={{ fontSize: '24px', fontWeight: '600' }}>
                {feature.title}
              </h3>
              <p className="text-gray-600" style={{ fontSize: '16px' }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
