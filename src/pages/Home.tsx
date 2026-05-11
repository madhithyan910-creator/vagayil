import * as React from "react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Star, Coffee, Wifi, Mountain, Wind, ChevronRight } from "lucide-react";
import ReviewSection from "@/components/ReviewSection";
import { SiteSettings } from "@/types";
import { homeImages } from "@/lib/roomImages";

export default function LandingPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    fetch("/api/settings").then(res => res.json()).then(setSettings);
  }, []);

  return (
    <div className="space-y-32 pb-32 bg-cream dark:bg-stone-950 transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <motion.div 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 z-0"
        >
          <img 
            src={homeImages.hero}
            className="w-full h-full object-cover brightness-50"
            alt="Vagamon Landscape"
          />
        </motion.div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <span className="text-white text-[10px] uppercase font-bold tracking-[0.5em] mb-4 block">Vagamon, Kerala</span>
            <h1 className="text-5xl md:text-8xl font-serif text-white italic leading-tight">
              A Symphony of <br />
              <span className="font-sans not-italic font-bold">Nature & Calm</span>
            </h1>
            <p className="text-white/80 text-sm md:text-lg max-w-xl mx-auto mt-8 font-light tracking-wide leading-relaxed">
              {settings?.bio || "Experience the misty hills and lush valleys of Vagamon at Vagayil Holydays. Your premium homestay for authentic hillside living."}
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8"
          >
            <Button asChild size="lg" className="bg-forest text-white hover:bg-forest/90 h-16 px-10 rounded-sm text-[10px] font-bold uppercase tracking-widest shadow-2xl shadow-forest/40">
              <Link to="/booking">Book Your Stay</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-black bg-black text-white hover:bg-black/90 h-16 px-10 rounded-sm text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">
              <Link to="/rooms">Explore Rooms</Link>
            </Button>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <div className="w-[1px] h-12 bg-white/30" />
          <span className="text-[8px] text-white/50 uppercase tracking-widest font-bold">Scroll</span>
        </motion.div>
      </section>

      {/* Philosophy Section */}
      <section className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          className="space-y-8"
        >
          <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-olive">The Vagayil Way</span>
          <h2 className="text-4xl md:text-5xl font-serif text-forest italic leading-tight">
            Where mist meets <br />
            <span className="font-sans not-italic font-bold text-stone-900 dark:text-cream">hospitality.</span>
          </h2>
          <div className="space-y-6 text-sage leading-relaxed text-sm">
            <p>
              Perched on the scenic elevation of Vagamon, Vagayil Holydays isn't just a place to stay—it's an invitation to slow down. Our property is designed to harmonize with the rolling hills and pine forests that surround us.
            </p>
            <p>
              Whether you're here for B1's mountain view or A2's cozy forest vibes, every room in our homestay speaks of Kerala's natural elegance.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 pt-6">
            <div className="space-y-2">
              <p className="text-3xl font-serif italic text-forest">2020</p>
              <p className="text-[9px] uppercase font-bold tracking-widest text-olive">Established</p>
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-serif italic text-forest">4.9/5</p>
              <p className="text-[9px] uppercase font-bold tracking-widest text-olive">Guest Rating</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 gap-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl relative"
          >
            <img src={homeImages.featureOne} className="w-full h-full object-cover" alt="Vagayil Holydays exterior view" />
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl relative mt-12"
          >
            <img src={homeImages.featureTwo} className="w-full h-full object-cover" alt="Vagayil Holydays room view" />
          </motion.div>
        </div>
      </section>

      {/* Amenities Grid */}
      <section className="bg-forest py-32 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48 blur-3xl" />
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24 space-y-4">
            <span className="text-white/40 text-[10px] uppercase font-bold tracking-[0.4em]">Curated Comforts</span>
            <h2 className="text-4xl font-serif text-white italic">The Details <span className="font-sans not-italic font-bold">Matter</span></h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Wifi, label: "High-speed Wi-Fi", desc: "Stay connected in the clouds" },
              { icon: Coffee, label: "Kerala Breakfast", desc: "Authentic local flavors" },
              { icon: Wind, label: "Hillside Breeze", desc: "No AC needed, just nature" },
              { icon: Mountain, label: "Guided Treks", desc: "Explore hidden valley trails" }
            ].map((item, i) => (
              <Card key={i} className="bg-white/5 border-white/10 backdrop-blur-sm rounded-2xl hover:bg-white/10 transition-colors group">
                <CardContent className="p-10 flex flex-col items-center text-center space-y-4">
                  <item.icon className="h-8 w-8 text-olive group-hover:scale-110 transition-transform" />
                  <h3 className="text-white text-xs font-bold uppercase tracking-widest">{item.label}</h3>
                  <p className="text-white/40 text-[10px] leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Map & Location */}
      <section className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1 space-y-8">
           <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-olive">Our Location</span>
           <h2 className="text-4xl font-serif text-forest italic">Find us in <br /> <span className="font-sans not-italic font-bold text-stone-900 dark:text-cream">Vagamon Heights</span></h2>
           <p className="text-sage text-sm leading-relaxed">
             Conveniently located near the Vagamon Pine Forest and Meadows, yet tucked away for absolute privacy.
           </p>
           <div className="space-y-4 pt-4">
             <div className="flex items-center gap-4 group cursor-pointer">
               <div className="w-10 h-10 bg-forest/10 rounded-full flex items-center justify-center text-forest group-hover:bg-forest group-hover:text-white transition-all">
                 <Phone className="h-4 w-4" />
               </div>
               <div>
                  <p className="text-[8px] uppercase font-bold text-sage">Inquiries</p>
                  <p className="text-sm font-bold text-forest">{settings?.phone || "Loading..."}</p>
               </div>
             </div>
             <div className="flex items-center gap-4 group">
               <div className="w-10 h-10 bg-forest/10 rounded-full flex items-center justify-center text-forest group-hover:bg-forest group-hover:text-white transition-all">
                 <MapPin className="h-4 w-4" />
               </div>
               <div>
                  <p className="text-[8px] uppercase font-bold text-sage">Location</p>
                  <p className="text-sm font-bold text-forest">Vagamon, Idukki, Kerala</p>
               </div>
             </div>
           </div>
        </div>
        <div className="lg:col-span-2 rounded-3xl overflow-hidden shadow-2xl h-[450px] border border-taupe/20">
          <iframe 
            src={settings?.mapLink || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31481.54519961633!2d76.885664!3d9.691234!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b07b5007a5ffc0d%3A0x7a79a2209b337680!2sVagayil%20Holydays!5e0!3m2!1sen!2sin!4v1715410000000!5m2!1sen!2sin"} 
            className="w-full h-full border-0 grayscale hover:grayscale-0 transition-all duration-700" 
            allowFullScreen={true}
            loading="lazy" 
          />
        </div>
      </section>

      {/* Reviews */}
      <section className="bg-cream/50 dark:bg-stone-900/10 py-32">
        <div className="max-w-7xl mx-auto px-4">
          <ReviewSection />
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-stone-900 rounded-[50px] p-2 pr-2 sm:p-2 sm:pr-8 flex flex-col md:flex-row items-center text-center md:text-left gap-8 overflow-hidden relative group">
          <div className="w-full md:w-1/3 aspect-square overflow-hidden rounded-[40px]">
            <img src="https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=600&q=80" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="" />
          </div>
          <div className="flex-1 py-12 px-8">
            <h2 className="text-3xl md:text-5xl font-serif text-white italic">Ready to escape?</h2>
            <p className="text-white/60 text-sm mt-4 mb-10 max-w-md mx-auto md:mx-0">Join over 1,000+ happy guests who have found peace at Vagayil Holydays.</p>
            <Button asChild size="lg" className="bg-forest text-white hover:bg-forest/90 h-14 px-8 rounded-full text-[10px] font-bold uppercase tracking-widest">
              <Link to="/booking" className="flex items-center gap-2">Book Now <ChevronRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
