"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import ModeToggle from "@/components/ModeToggle";
import { Menu } from "lucide-react";
import ClientOnly from "@/components/ClientOnly";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useUser from "@/hooks/useUser";
import { motion } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
const links = [
  { href: "/", label: "Origami-CF" },
  { href: "/contest", label: "Contest" },
  { href: "/history", label: "History" },
  { href: "/upsolve", label: "Upsolve" },
  { href: "/saved", label: "Saved" },
];

const NavBar = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-borderColor/20 bg-surface/70 backdrop-blur-md transition-all duration-300">
      <div className="container-custom flex h-[72px] items-center justify-between">
        {/* Left side - Navigation */}
        <div className="flex items-center">
          <div className="mr-8">
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/favicon.ico" alt="Origami-CF" width={32} height={32} className="w-8 h-8 filter brightness-110" />
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative py-2 text-[15px] transition-colors hover:text-accentPrimary ${pathname === link.href
                  ? "text-accentPrimary font-bold"
                  : "text-textSecondary"
                  }`}
              >
                {link.label}
                {pathname === link.href && (
                  <motion.div
                    layoutId="navbar-underline"
                    className="absolute left-0 -bottom-[1px] h-[2px] w-full bg-accentPrimary"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right side - User Profile & Controls */}
        <div className="flex items-center gap-4">
          {/* User Profile */}
          <ClientOnly>
            {user && (
              <a
                href={`https://codeforces.com/profile/${user.codeforcesHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:flex items-center gap-3 hover:bg-muted/50 rounded-lg px-3 py-2 transition-colors duration-200"
              >
                <Avatar className="w-9 h-9 border-2 border-primary/30">
                  <AvatarImage src={user.avatar} alt={user.codeforcesHandle} />
                  <AvatarFallback className="text-sm bg-muted">
                    {user.codeforcesHandle.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium text-foreground">
                  {user.codeforcesHandle}
                </span>
              </a>
            )}
          </ClientOnly>

          {/* Theme Toggle */}
          <ClientOnly>
            <ModeToggle />
          </ClientOnly>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>
                    <div onClick={() => setIsMenuOpen(false)}>
                      <Link href="/" className="flex items-center space-x-2">
                        <Image
                          src="/favicon.ico"
                          alt="Origami-CF"
                          width={32}
                          height={32}
                          className="w-8 h-8"
                        />
                      </Link>
                    </div>
                  </SheetTitle>
                </SheetHeader>
                <div className="grid gap-4 py-4">
                  {links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`text-xl ${pathname === link.href
                        ? "text-foreground font-medium"
                        : "text-muted-foreground"
                        }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
                {/* Mobile User Profile */}
                {user && (
                  <div className="border-t pt-4 mt-4">
                    <a
                      href={`https://codeforces.com/profile/${user.codeforcesHandle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 hover:bg-muted/50 rounded-lg p-2 transition-colors duration-200"
                    >
                      <Avatar className="w-10 h-10 border-2 border-primary/20">
                        <AvatarImage
                          src={user.avatar}
                          alt={user.codeforcesHandle}
                        />
                        <AvatarFallback>
                          {user.codeforcesHandle.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-lg">
                          {user.codeforcesHandle}
                        </p>
                        <p className="text-muted-foreground">
                          {user.rating} ({user.rank || "Unrated"})
                        </p>
                      </div>
                    </a>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
