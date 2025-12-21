import { Github, FileText, Lock } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-24">
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Brand */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Accessibility Analyzer
          </h3>
          <p className="text-sm text-gray-400">
            Helping developers build inclusive and accessible web experiences.
          </p>
        </div>

        {/* Links */}
        <div>
          <h4 className="text-sm font-semibold text-white mb-3">Links</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <a 
                href="https://github.com/karina-purswani/accessibility-analyzer#readme" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <FileText className="w-4 h-4" /> Documentation
              </a>
            </li>
            <li>
              <a 
                href="https://github.com/karina-purswani/accessibility-analyzer" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <Github className="w-4 h-4" /> GitHub Repository
              </a>
            </li>
            <li>
              <a 
                href="#" 
                className="flex items-center gap-2 hover:text-white transition-colors cursor-not-allowed opacity-70"
                title="Coming Soon"
              >
                <Lock className="w-4 h-4" /> Privacy Policy
              </a>
            </li>
          </ul>
        </div>

        {/* Note */}
        <div>
          <h4 className="text-sm font-semibold text-white mb-3">
            Accessibility Matters
          </h4>
          <p className="text-sm text-gray-400">
            Built with accessibility-first principles and WCAG guidelines in mind.
          </p>
        </div>
      </div>

      <div className="border-t border-gray-800 text-center py-4 text-xs text-gray-500">
        © {new Date().getFullYear()} Karina Purswani & Saburi Yeola. All rights reserved.
      </div>
    </footer>
  );
}