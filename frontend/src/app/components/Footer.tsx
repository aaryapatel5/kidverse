export function Footer() {
  return (
    <footer className="bg-[#0a0e27] text-white py-12 px-8 md:px-16 lg:px-24">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="mb-4" style={{ fontSize: '24px', fontWeight: '700' }}>KidVerse</h3>
            <p className="text-gray-400" style={{ fontSize: '14px' }}>
              Empowering young minds through play-based learning and exploration.
            </p>
          </div>
          
          <div>
            <h4 className="mb-4" style={{ fontSize: '16px', fontWeight: '600' }}>Products</h4>
            <ul className="space-y-2 text-gray-400" style={{ fontSize: '14px' }}>
              <li><a href="#" className="hover:text-white transition-colors">Creative Arts Kit</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Science Explorer Kit</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Math Adventure Kit</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Reading & Writing Kit</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="mb-4" style={{ fontSize: '16px', fontWeight: '600' }}>Company</h4>
            <ul className="space-y-2 text-gray-400" style={{ fontSize: '14px' }}>
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Our Team</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="mb-4" style={{ fontSize: '16px', fontWeight: '600' }}>Resources</h4>
            <ul className="space-y-2 text-gray-400" style={{ fontSize: '14px' }}>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Parent Guides</a></li>
              <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400" style={{ fontSize: '14px' }}>
            © 2026 KidVerse. JG University. All rights reserved.
          </p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white transition-colors" style={{ fontSize: '14px' }}>
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors" style={{ fontSize: '14px' }}>
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
