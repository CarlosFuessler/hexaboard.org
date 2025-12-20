export default function Footer() {
  return (
    <footer className="py-16 px-6 border-t border-white/10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-bold mb-2">Hexaboard</h3>
            <p className="text-white/50 text-sm">Your companion for everywh.</p>
          </div>
          <div className="text-center">
          <p className="text-white/30 text-sm mono">
            © 2025 Hexaboard. Designed with Love.
          </p>
        </div>

          <div className="flex gap-8">
            <a href="#features" className="text-white/50 hover:text-white transition-colors text-sm">
              Features
            </a>
            <a href="#showcase" className="text-white/50 hover:text-white transition-colors text-sm">
              3D View
            </a>
            <a href="https://github.com" className="text-white/50 hover:text-white transition-colors text-sm">
              GitHub
            </a>
          </div>
        </div>

    
      </div>
    </footer>
  );
}
