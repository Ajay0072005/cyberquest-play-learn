import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, User, LogOut, Settings, Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/useUserProfile";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export const Navigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { profile } = useUserProfile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You've been successfully signed out.",
    });
    navigate("/");
    setMobileMenuOpen(false);
  };

  const getUserInitials = () => {
    if (profile?.username) {
      return profile.username.slice(0, 2).toUpperCase();
    }
    if (!user?.email) return "U";
    return user.email.charAt(0).toUpperCase();
  };

  const getDisplayName = () => {
    return profile?.username || user?.email || "User";
  };

  const navLinks = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/path/script-kiddie", label: "Career Path" },
  ];

  const handleMobileNavClick = (to: string) => {
    navigate(to);
    setMobileMenuOpen(false);
  };
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary cyber-glow" />
          <h1 className="text-xl md:text-2xl font-cyber font-bold cyber-glow">
            CyberQuest
          </h1>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link 
              key={link.to}
              to={link.to} 
              className={`transition-colors ${
                location.pathname === link.to 
                  ? 'text-primary cyber-glow' 
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          {user ? (
            <>
              {/* Desktop Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10 border-2 border-primary">
                      {profile?.avatar_url && (
                        <AvatarImage 
                          src={profile.avatar_url} 
                          alt={getDisplayName()}
                          key={profile.avatar_url}
                        />
                      )}
                      <AvatarFallback className="bg-primary/20 text-primary font-bold">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <Avatar className="h-8 w-8">
                      {profile?.avatar_url && (
                        <AvatarImage src={profile.avatar_url} alt={getDisplayName()} />
                      )}
                      <AvatarFallback className="bg-primary/20 text-primary text-sm">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium text-sm">{getDisplayName()}</p>
                      <p className="text-xs text-muted-foreground">Welcome back!</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Profile Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Hamburger Menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] bg-background border-border">
                  <SheetHeader className="border-b border-border pb-4">
                    <SheetTitle className="flex items-center gap-2">
                      <Shield className="h-6 w-6 text-primary" />
                      <span className="font-cyber">CyberQuest</span>
                    </SheetTitle>
                  </SheetHeader>
                  
                  {/* Mobile User Info */}
                  <div className="flex items-center gap-3 py-4 border-b border-border">
                    <Avatar className="h-12 w-12 border-2 border-primary">
                      {profile?.avatar_url && (
                        <AvatarImage src={profile.avatar_url} alt={getDisplayName()} />
                      )}
                      <AvatarFallback className="bg-primary/20 text-primary font-bold">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{getDisplayName()}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>

                  {/* Mobile Navigation Links */}
                  <div className="flex flex-col gap-1 py-4">
                    {navLinks.map((link) => (
                      <button
                        key={link.to}
                        onClick={() => handleMobileNavClick(link.to)}
                        className={`flex items-center px-3 py-3 rounded-lg text-left transition-colors ${
                          location.pathname === link.to 
                            ? 'bg-primary/10 text-primary' 
                            : 'text-foreground hover:bg-muted'
                        }`}
                      >
                        {link.label}
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-border pt-4 space-y-1">
                    <button
                      onClick={() => handleMobileNavClick('/profile')}
                      className="flex items-center gap-2 px-3 py-3 rounded-lg text-left w-full hover:bg-muted transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                      Profile Settings
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 px-3 py-3 rounded-lg text-left w-full text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </SheetContent>
              </Sheet>
            </>
          ) : (
            <>
              <Link to="/login" className="hidden sm:block">
                <Button variant="ghost">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="cyber" className="text-sm">
                  Get Started
                </Button>
              </Link>
              
              {/* Mobile Menu for Non-Logged Users */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] bg-background border-border">
                  <SheetHeader className="border-b border-border pb-4">
                    <SheetTitle className="flex items-center gap-2">
                      <Shield className="h-6 w-6 text-primary" />
                      <span className="font-cyber">CyberQuest</span>
                    </SheetTitle>
                  </SheetHeader>
                  
                  <div className="flex flex-col gap-1 py-4">
                    {navLinks.map((link) => (
                      <button
                        key={link.to}
                        onClick={() => handleMobileNavClick(link.to)}
                        className={`flex items-center px-3 py-3 rounded-lg text-left transition-colors ${
                          location.pathname === link.to 
                            ? 'bg-primary/10 text-primary' 
                            : 'text-foreground hover:bg-muted'
                        }`}
                      >
                        {link.label}
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-border pt-4 space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleMobileNavClick('/login')}
                    >
                      Sign In
                    </Button>
                    <Button 
                      variant="cyber" 
                      className="w-full"
                      onClick={() => handleMobileNavClick('/register')}
                    >
                      Get Started
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
