import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Room } from "@/types";
import { canonicalRoomTitles, getRoomImage, isCanonicalRoomTitle, moreRoomPics, roomCaptions } from "@/lib/roomImages";

const fallbackRooms: Room[] = [
  {
    id: "A1",
    title: "A1",
    type: "room" as Room["type"],
    pricePerNight: 2500,
    description: "Cottage room A1 with a peaceful private setting.",
    images: ["/images/A1.jpg"],
    amenities: ["Wi-Fi", "Hot Water", "Cottage Stay"],
    availabilityStatus: "available",
  },
  {
    id: "A2",
    title: "A2",
    type: "room" as Room["type"],
    pricePerNight: 2500,
    description: "Cottage room A2 with a cozy and restful atmosphere.",
    images: ["/images/A2.jpg"],
    amenities: ["Wi-Fi", "Hot Water", "Cottage Stay"],
    availabilityStatus: "available",
  },
  {
    id: "B1",
    title: "B1",
    type: "room" as Room["type"],
    pricePerNight: 2500,
    description: "First-floor room B1 with a balcony view.",
    images: ["/images/B1.jpg"],
    amenities: ["Wi-Fi", "Hot Water", "Balcony View"],
    availabilityStatus: "available",
  },
  {
    id: "B2",
    title: "B2",
    type: "room" as Room["type"],
    pricePerNight: 2500,
    description: "First-floor room B2 with an open balcony view.",
    images: ["/images/B2.jpg"],
    amenities: ["Wi-Fi", "Hot Water", "Balcony View"],
    availabilityStatus: "available",
  },
];

export default function Rooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/rooms")
      .then((res) => res.json())
      .then((data) => {
        const filteredRooms = Array.isArray(data) ? data.filter((room) => isCanonicalRoomTitle(room.title)) : [];
        const orderedRooms = canonicalRoomTitles
          .map((title) => filteredRooms.find((room) => room.title === title))
          .filter(Boolean) as Room[];

        setRooms(orderedRooms.length > 0 ? orderedRooms : fallbackRooms);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setRooms(fallbackRooms);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest" />
      </div>
    );
  }

  const visibleRooms = rooms.length > 0 ? rooms : fallbackRooms;

  return (
    <div className="bg-cream min-h-screen py-24 px-4">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="space-y-4 max-w-2xl">
          <span className="text-olive font-bold text-[10px] uppercase tracking-[0.3em] block">Our Collection</span>
          <h1 className="text-4xl font-serif tracking-tight text-forest italic">
            Curated <span className="font-sans not-italic font-bold">Rooms</span>
          </h1>
          <p className="text-sage text-sm font-light leading-relaxed">
            Browse A1, A2, B1, and B2 as separate rooms. Each card is connected to the backend and opens the booking page for that room.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {visibleRooms.map((room, index) => {
            const caption = roomCaptions[room.title];

            return (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
              >
                <Card className="h-full overflow-hidden rounded-[28px] border border-taupe bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <img
                      src={getRoomImage(room.title, room.images?.[0])}
                      alt={room.title}
                      className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/55 via-stone-950/5 to-transparent" />
                    <div className="absolute left-4 right-4 top-4 flex items-start justify-between gap-2">
                      <span className="rounded-full bg-white/90 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.25em] text-forest">
                        {caption?.label || "Room"}
                      </span>
                      <Badge className={`${room.availabilityStatus === "available" ? "bg-forest text-white" : "bg-red-500 text-white"} uppercase text-[9px] tracking-widest font-bold`}>
                        {room.availabilityStatus}
                      </Badge>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h2 className="text-3xl font-serif italic text-white">{room.title}</h2>
                    </div>
                  </div>

                  <CardContent className="flex h-[calc(100%-0px)] flex-col p-6">
                    <div className="space-y-4">
                      <p className="text-sm leading-relaxed text-sage">
                        {caption?.caption || room.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {room.amenities.map((amenity) => (
                          <span
                            key={amenity}
                            className="rounded-full border border-taupe bg-cream px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-olive"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 flex items-end justify-between gap-4 border-t border-taupe pt-5">
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.2em] text-olive">Per Night</p>
                        <p className="text-2xl font-bold text-forest">Rs. {room.pricePerNight}</p>
                      </div>
                      <Button
                        asChild
                        className="rounded-sm bg-forest text-white hover:bg-forest/90 uppercase tracking-widest text-[10px] font-bold"
                        disabled={room.availabilityStatus !== "available"}
                      >
                        <Link to={`/booking?room=${room.id}`}>
                          {room.availabilityStatus === "available" ? `Book ${room.title}` : "Sold Out"}
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="space-y-6">
          <div className="space-y-2 max-w-2xl">
            <span className="text-olive font-bold text-[10px] uppercase tracking-[0.3em] block">More Pics</span>
            <h2 className="text-3xl font-serif tracking-tight text-forest italic">
              A closer look at <span className="font-sans not-italic font-bold">the stay</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {moreRoomPics.map((image, i) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: i * 0.08 }}
                className="overflow-hidden rounded-2xl border border-taupe bg-white shadow-sm"
              >
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
