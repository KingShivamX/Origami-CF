"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import ModeToggle from "@/components/ModeToggle";
import { Menu } from "lucide-react";
import ClientOnly from "@/components/ClientOnly";

const links = [
  { href: "/", label: "Home" },
  { href: "/training", label: "Training" },
  { href: "/statistics", label: "Statistics" },
  { href: "/upsolve", label: "Upsolve" },
];

const NavBar = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold">
            Training Tracker
          </Link>
          <div className="hidden sm:flex items-center space-x-4">
            {links.map((link) => (
              <Button
                key={link.href}
                variant={pathname === link.href ? "default" : "ghost"}
                asChild
              >
                <Link href={link.href}>{link.label}</Link>
              </Button>
            ))}
            <ClientOnly>
              <ModeToggle />
            </ClientOnly>
          </div>
          <div className="sm:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>
        {isMenuOpen && (
          <div className="sm:hidden pt-2 pb-4 space-y-2">
            {links.map((link) => (
              <Button
                key={link.href}
                variant={pathname === link.href ? "default" : "ghost"}
                className="w-full justify-start"
                asChild
              >
                <Link href={link.href}>{link.label}</Link>
              </Button>
            ))}
            <ClientOnly>
              <ModeToggle />
            </ClientOnly>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
