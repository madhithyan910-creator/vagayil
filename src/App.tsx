import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import LandingPage from "@/pages/Home";
import Rooms from "@/pages/Rooms";
import Booking from "@/pages/Booking";
import Admin from "@/pages/Admin";
import TouristSpots from "@/pages/TouristSpots";
import { Menu, X, Phone, MapPin, Globe, Moon, Sun, User as UserIcon, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ThemeProvider, useTheme } from "next-themes";
import { auth, signInWithGoogle, logout } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

declare global {
  interface Window {
    googleTranslateElementInit: () => void;
  }
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="text-forest rounded-full"
    >
      {theme === "dark" ? <Sun className="h-4 w-4 text-yellow-500" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border-b border-taupe/30 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between h-20 items-center">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-forest rounded-sm flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-forest/20">V</div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-forest leading-none uppercase">VAGAYIL HOLYDAYS</h1>
              <p className="text-[9px] uppercase tracking-[0.2em] text-sage font-medium mt-0.5">Vagamon Hills</p>
            </div>
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-[10px] font-bold uppercase tracking-widest text-sage hover:text-forest transition-colors">Home</Link>
            <Link to="/rooms" className="text-[10px] font-bold uppercase tracking-widest text-sage hover:text-forest transition-colors">Rooms</Link>
            <Link to="/spots" className="text-[10px] font-bold uppercase tracking-widest text-sage hover:text-forest transition-colors">Nearby Spots</Link>
            <Link to="/booking" className="text-[10px] font-bold uppercase tracking-widest text-sage hover:text-forest transition-colors">Booking</Link>
            
            <div className="h-4 w-[1px] bg-taupe/50" />
            
            <div id="google_translate_element" className="scale-75 origin-right" />
            <ThemeToggle />
            
            {user ? (
              <div className="flex items-center gap-3 bg-taupe/10 p-1 px-3 rounded-full border border-taupe/20">
                 <img src={user.photoURL || ""} className="w-6 h-6 rounded-full" alt="" />
                 <span className="text-[10px] font-bold text-forest uppercase truncate max-w-[80px]">{user.displayName?.split(" ")[0]}</span>
                 <button onClick={logout} className="text-red-400 hover:text-red-600"><LogOut className="h-3 w-3" /></button>
              </div>
            ) : (
              <Button 
                onClick={signInWithGoogle}
                variant="ghost" 
                className="text-[10px] font-bold uppercase tracking-widest text-forest"
              >
                Sign In
              </Button>
            )}
            
            <Button asChild className="rounded-sm bg-forest text-white hover:bg-forest/90 uppercase tracking-widest text-[10px] font-bold px-6 shadow-xl shadow-forest/20">
              <Link to="/booking">Reserve Now</Link>
            </Button>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button className="p-2 text-forest" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white dark:bg-stone-900 border-t border-taupe p-6 space-y-6 shadow-2xl absolute w-full left-0 animate-in fade-in slide-in-from-top-4">
          <Link to="/" className="block text-sm font-bold uppercase tracking-widest text-forest" onClick={() => setIsOpen(false)}>Home</Link>
          <Link to="/rooms" className="block text-sm font-bold uppercase tracking-widest text-forest" onClick={() => setIsOpen(false)}>Rooms</Link>
          <Link to="/spots" className="block text-sm font-bold uppercase tracking-widest text-forest" onClick={() => setIsOpen(false)}>Nearby Spots</Link>
          <Link to="/booking" className="block text-sm font-bold uppercase tracking-widest text-forest" onClick={() => setIsOpen(false)}>Booking</Link>
          <div className="border-t border-taupe pt-6">
             {user ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={user.photoURL || ""} className="w-8 h-8 rounded-full" alt="" />
                    <span className="text-xs font-bold text-forest uppercase">{user.displayName}</span>
                  </div>
                  <Button variant="ghost" onClick={logout} className="text-xs font-bold text-red-500">Sign Out</Button>
                </div>
             ) : (
                <Button onClick={signInWithGoogle} className="w-full bg-forest text-white">Google Sign In</Button>
             )}
          </div>
        </div>
      )}
    </nav>
  );
}

function Footer() {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetch("/api/settings").then(res => res.json()).then(setSettings);
  }, []);

  return (
    <footer className="bg-stone-50 dark:bg-stone-950 border-t border-taupe/30 py-20 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-forest rounded-sm flex items-center justify-center text-white font-bold">V</div>
            <h1 className="text-lg font-bold text-forest uppercase tracking-tight">VAGAYIL HOLYDAYS</h1>
          </div>
          <p className="text-sm text-sage leading-relaxed italic font-serif">
            {settings?.bio || "A serene getaway in the heights of Vagamon."}
          </p>
        </div>
        
        <div className="space-y-6">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-forest">Connect</h3>
          <div className="space-y-4 text-sm text-sage">
            <a href={`tel:${settings?.phone || "+91"}`} className="flex items-center gap-3 hover:text-forest transition-colors">
              <Phone className="h-4 w-4" /> {settings?.phone || "Loading..."}
            </a>
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4" /> Vagamon, Idukki, Kerala
            </div>
            <a href="https://wa.me/919876543210" className="flex items-center gap-3 hover:text-forest transition-colors">
               WhatsApp Support
            </a>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-forest">Quick Links</h3>
          <div className="grid grid-cols-1 gap-3 text-xs font-bold uppercase tracking-widest text-forest/70">
            <Link to="/spots" className="hover:text-forest">Nearby Tourist Spots</Link>
            <Link to="/booking" className="hover:text-forest">Reserve Room</Link>
            <Link to="/admin" className="hover:text-forest">Admin Login</Link>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto pt-16 mt-16 border-t border-taupe/20 flex flex-col md:flex-row justify-between items-center gap-6">
         <p className="text-[10px] text-olive uppercase tracking-[0.3em] font-medium text-center">
          © {new Date().getFullYear()} Vagayil Holydays • Curated Experiences
        </p>
        <div className="flex gap-8">
           <Link to="/admin" className="text-[9px] uppercase font-bold text-taupe hover:text-forest">Staff Access</Link>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  useEffect(() => {
    const scriptId = "google-translate-script";
    const translateElementId = "google_translate_element";

    window.googleTranslateElementInit = () => {
      try {
        const googleTranslate = (window as any).google?.translate;
        const container = document.getElementById(translateElementId);

        if (googleTranslate && container && !container.hasChildNodes()) {
          new googleTranslate.TranslateElement(
            { pageLanguage: "en", includedLanguages: "hi,ta,ml,te,kn,en" },
            translateElementId
          );
        }
      } catch (e) {
        console.error("Google Translate Init failed", e);
      }
    };

    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    } else if ((window as any).google?.translate) {
      window.googleTranslateElementInit();
    }
  }, []);

  return (
    // @ts-ignore
    <ThemeProvider attribute="class" defaultTheme="light">
      <Router>
        <div className="min-h-screen bg-white dark:bg-stone-950 font-sans text-stone-900 dark:text-stone-100 transition-colors duration-300">
          <Navbar />
          <main className="pt-20">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/rooms" element={<Rooms />} />
              <Route path="/spots" element={<TouristSpots />} />
              <Route path="/booking" element={<Booking />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </main>
          <Footer />
          <Toaster position="top-center" richColors />
        </div>
      </Router>
    </ThemeProvider>
  );
}
