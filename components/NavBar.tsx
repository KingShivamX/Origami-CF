"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import ModeToggle from "@/components/ModeToggle";
import { Menu, X } from "lucide-react";
import ClientOnly from "@/components/ClientOnly";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useUser from "@/hooks/useUser";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const links = [
  { href: "/", label: "Home" },
  { href: "/training", label: "Training" },
  { href: "/statistics", label: "Statistics" },
  { href: "/upsolve", label: "Upsolve" },
];

const NavBar = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="flex h-14 w-full px-6 items-center justify-between">
        {/* Left side - Navigation */}
        <div className="flex items-center">
          <Link href="/" className="mr-8 flex items-center space-x-2 group">
            <span className="font-bold text-lg bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent group-hover:from-primary/80 group-hover:to-primary transition-all duration-200">
              Origami-CF
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors hover:text-foreground/80 ${
                  pathname === link.href
                    ? "text-foreground font-medium"
                    : "text-foreground/60"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right side - User Profile & Controls */}
        <div className="flex items-center gap-4">
          {/* User Profile */}
          <ClientOnly>
            {user && (
              <div className="hidden md:flex items-center gap-3 hover:bg-muted/50 rounded-lg px-3 py-2 transition-colors duration-200">
                <Avatar className="w-8 h-8 border-2 border-primary/30 shadow-sm">
                  <AvatarImage src={user.avatar} alt={user.codeforcesHandle} />
                  <AvatarFallback className="text-xs bg-gradient-to-br from-primary/10 to-primary/20">
                    {user.codeforcesHandle.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-foreground">
                  {user.codeforcesHandle}
                </span>
              </div>
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
                    <Link
                      href="/"
                      className="flex items-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="font-bold">Origami-CF</span>
                    </Link>
                  </SheetTitle>
                </SheetHeader>
                <div className="grid gap-4 py-4">
                  {links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`text-lg ${
                        pathname === link.href
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
                    <div className="flex items-center gap-3">
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
                        <p className="font-medium">{user.codeforcesHandle}</p>
                        <p className="text-sm text-muted-foreground">
                          {user.rating} ({user.rank || "Unrated"})
                        </p>
                      </div>
                    </div>
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
