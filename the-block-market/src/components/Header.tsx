import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import LoginModal from './LoginModal';
import { Link } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '../config/supabase';

const NavLink = ({ href, children, onClick = () => {} }) => (
  <Link
    to={href}
    onClick={onClick}
    className="text-sm text-foreground"
  >
    {children}
  </Link>
);

const Header = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setIsSheetOpen(false);
    }
  };

  const navItems = [
    { label: 'Market', href: '/market' },
    { label: 'Trade', href: '/trade' },
    ...(session ? [
      { label: 'Orders', href: '/orders' },
      { label: 'Profile', href: '/profile' }
    ] : []),
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link 
            to="/" 
            className="text-xl font-semibold text-primary"
          >
            The Block Market
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <NavLink key={item.href} href={item.href}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Desktop Auth Button */}
        <div className="hidden md:flex items-center">
          {session ? (
            <Button 
              variant="ghost" 
              onClick={handleSignOut}
              className="text-sm"
            >
              Sign Out
            </Button>
          ) : (
            <Button 
              variant="default" 
              onClick={() => setIsLoginOpen(true)}
              className="text-sm"
            >
              Sign In
            </Button>
          )}
        </div>

        {/* Mobile Menu */}
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent 
            side="right" 
            className="w-full sm:w-80 p-0"
          >
            <div className="flex flex-col h-full">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">Menu</span>
                  <SheetClose className="rounded-sm">
                    <X className="h-5 w-5" />
                    <span className="sr-only">Close</span>
                  </SheetClose>
                </div>
              </div>

              <nav className="flex flex-col px-4 py-6 gap-6">
                {navItems.map((item) => (
                  <NavLink 
                    key={item.href} 
                    href={item.href}
                    onClick={() => setIsSheetOpen(false)}
                  >
                    {item.label}
                  </NavLink>
                ))}
                {session ? (
                  <Button 
                    variant="ghost" 
                    onClick={handleSignOut}
                    className="justify-start px-0"
                  >
                    Sign Out
                  </Button>
                ) : (
                  <Button 
                    variant="default" 
                    onClick={() => {
                      setIsLoginOpen(true);
                      setIsSheetOpen(false);
                    }}
                  >
                    Sign In
                  </Button>
                )}
              </nav>
            </div>
          </SheetContent>
        </Sheet>

        {/* Login Modal */}
        <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      </div>
    </header>
  );
};

export default Header;