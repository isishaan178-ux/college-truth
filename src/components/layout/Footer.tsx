import Link from "next/link";
import { Eye } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#0a0a0f]/90">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <Eye className="h-5 w-5 text-indigo-400" />
              <span className="text-lg font-bold">
                College{" "}
                <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Sach
                </span>
              </span>
            </Link>
            <p className="text-sm text-zinc-500 leading-relaxed">
              The unfiltered truth about Indian colleges, powered by real student experiences.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-zinc-300 mb-3">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { href: "/", label: "Home" },
                { href: "/compare", label: "Compare Colleges" },
                { href: "/submit", label: "Submit Your Story" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-500 hover:text-indigo-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-zinc-300 mb-3">Legal</h4>
            <ul className="space-y-2">
              {[
                { href: "/about", label: "About Us" },
                { href: "/contact", label: "Contact" },
                { href: "/privacy", label: "Privacy Policy" },
                { href: "/terms", label: "Terms of Service" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-500 hover:text-indigo-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-sm font-semibold text-zinc-300 mb-3">Follow Us</h4>
            <div className="flex gap-3">
              {["Twitter", "Instagram", "Reddit", "YouTube"].map((platform) => (
                <a
                  key={platform}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 border border-white/5 text-zinc-500 hover:text-indigo-400 hover:border-indigo-500/20 transition-colors text-xs font-medium"
                  title={platform}
                >
                  {platform[0]}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-zinc-600 text-center sm:text-left">
              &copy; {new Date().getFullYear()} College Sach. All rights reserved.
            </p>
            <p className="text-xs text-zinc-600 text-center sm:text-right max-w-lg">
              <span className="text-amber-500/80 font-medium">Disclaimer:</span> All content is
              sourced from public forums and student submissions. We do not verify the accuracy of
              any claims made. Views expressed are those of individual contributors.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
