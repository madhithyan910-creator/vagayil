import * as React from "react";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, Search } from "lucide-react";
import { TouristSpot } from "@/types";

export default function TouristSpots() {
  const [spots, setSpots] = useState<TouristSpot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/spots")
      .then(res => res.json())
      .then(data => {
        setSpots(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="min-h-[40vh] flex items-center justify-center font-serif italic">Discovering spots...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <div className="text-center mb-16">
        <span className="text-[10px] uppercase font-bold tracking-[0.4em] text-olive border-b border-olive/20 pb-2">Adventure Awaits</span>
        <h1 className="text-4xl md:text-6xl font-serif text-forest italic mt-6">Explore <span className="font-sans not-italic font-bold text-stone-900 dark:text-cream">Vagamon</span></h1>
        <p className="mt-4 text-sage max-w-xl mx-auto text-sm">Discover the most breathtaking spots around Vagayil Holydays. From mist-covered meadows to pine forests.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {spots.map((spot, index) => (
          <motion.div
            key={spot.id || index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="overflow-hidden border-none shadow-xl group rounded-2xl bg-cream dark:bg-stone-800">
              <div className="h-64 overflow-hidden relative">
                <img 
                  src={spot.image} 
                  alt={spot.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <CardContent className="p-8">
                <h3 className="text-xl font-bold text-forest mb-2">{spot.name}</h3>
                <p className="text-sage text-sm mb-6 line-clamp-3">{spot.description}</p>
                <div className="flex gap-4">
                   <a 
                    href={`https://www.google.com/search?q=${encodeURIComponent(spot.searchKeyword || spot.name + ' Vagamon')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 h-10 bg-forest text-white rounded-sm flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest hover:bg-forest/90 transition-colors"
                  >
                    <Search className="h-3 w-3" /> Explore Images
                  </a>
                  <a 
                    href={`https://www.google.com/maps/search/${encodeURIComponent(spot.name + ' Vagamon')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-10 h-10 border border-taupe rounded-sm flex items-center justify-center text-forest hover:bg-taupe/10 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {spots.length === 0 && (
        <div className="text-center py-20 bg-cream/50 rounded-3xl border border-dashed border-taupe">
          <p className="text-sage font-serif italic text-lg">No tourist spots listed yet. Check back soon!</p>
        </div>
      )}
    </div>
  );
}
