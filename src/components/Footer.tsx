import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-transparent mt-auto">
      {/* Top divider using MinimalistDivider style */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

      {/* Fixed height container for consistent footer size */}
      <div className="h-72">
        <div className="max-w-6xl mx-auto px-8 py-8 h-full flex flex-col justify-between">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Brand Section */}
            <div>
              <h3 className="michroma text-white text-lg font-bold mb-3">Sid&apos;s Notes</h3>
              <p className="text-white/70 text-xs leading-relaxed">
                Exploring the intersection of technology, creativity, and innovation.
                Sharing insights on development, design, and digital experiences.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white/90 text-base font-semibold mb-3">Quick Links</h4>
              <ul className="space-y-1">
                <li>
                  <Link href="/" className="text-white/70 hover:text-white transition-colors duration-300 text-xs">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-white/70 hover:text-white transition-colors duration-300 text-xs">
                    About Me
                  </Link>
                </li>
                <li>
                  <Link href="/projects" className="text-white/70 hover:text-white transition-colors duration-300 text-xs">
                    Projects
                  </Link>
                </li>
                <li>
                  <Link href="/notes" className="text-white/70 hover:text-white transition-colors duration-300 text-xs">
                    Notes
                  </Link>
                </li>
                <li>
                  <Link href="/case-studies" className="text-white/70 hover:text-white transition-colors duration-300 text-xs">
                    Case Studies
                  </Link>
                </li>
              </ul>
            </div>

            {/* Social & Contact */}
            <div>
              <h4 className="text-white/90 text-base font-semibold mb-3">Connect</h4>
              <div className="space-y-1">
                <a
                  href="https://www.linkedin.com/in/realsiddhartha/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-white/70 hover:text-white transition-colors duration-300 text-xs"
                >
                  <span>LinkedIn</span>
                </a>
                <a
                  href="https://github.com/sid-2209"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-white/70 hover:text-white transition-colors duration-300 text-xs"
                >
                  <span>GitHub</span>
                </a>
              </div>
            </div>
          </div>

          {/* Copyright - positioned at bottom */}
          <div className="text-center">
            {/* Copyright divider using MinimalistDivider style */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/40 to-transparent mb-4" />
            <p className="text-white/50 text-xs">
              © {new Date().getFullYear()} Sid&apos;s Notes. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}