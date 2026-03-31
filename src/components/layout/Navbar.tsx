"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Eye, Menu, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import SearchBar from "@/components/SearchBar";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/compare", label: "Compare" },
  { href: "/submit", label: "Submit Your Story" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-colors">
            <Eye className="h-5 w-5 text-indigo-400" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            College{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Sach
            </span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "bg-indigo-500/10 text-indigo-400"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Search */}
        <div className="hidden md:block w-72">
          <SearchBar compact />
        </div>

        {/* Mobile Menu */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-zinc-400 hover:text-white"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="right" className="w-80 bg-[#0f0f18] border-white/5 p-0">
            <div className="flex flex-col h-full">
              {/* Mobile Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/5">
                <Link
                  href="/"
                  className="flex items-center gap-2"
                  onClick={() => setMobileOpen(false)}
                >
                  <Eye className="h-5 w-5 text-indigo-400" />
                  <span className="text-lg font-bold">
                    College{" "}
                    <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                      Sach
                    </span>
                  </span>
                </Link>
              </div>

              {/* Mobile Search */}
              <div className="p-4 border-b border-white/5">
                <SearchBar />
              </div>

              {/* Mobile Nav Links */}
              <nav className="flex flex-col p-4 gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      pathname === link.href
                        ? "bg-indigo-500/10 text-indigo-400"
                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
