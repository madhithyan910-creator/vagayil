import * as React from "react";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, differenceInDays } from "date-fns";
import { CalendarIcon, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Room } from "@/types";
import { toast } from "sonner";
import { getRoomImage, isCanonicalRoomTitle } from "@/lib/roomImages";

const fallbackRooms: Room[] = [
  { id: "A1", title: "A1", type: "room" as Room["type"], pricePerNight: 2500, description: "Cottage room A1 with a peaceful private setting.", images: ["/images/A1.jpg"], amenities: ["Wi-Fi", "Hot Water", "Cottage Stay"], availabilityStatus: "available" },
  { id: "A2", title: "A2", type: "room" as Room["type"], pricePerNight: 2500, description: "Cottage room A2 with a cozy and restful atmosphere.", images: ["/images/A2.jpg"], amenities: ["Wi-Fi", "Hot Water", "Cottage Stay"], availabilityStatus: "available" },
  { id: "B1", title: "B1", type: "room" as Room["type"], pricePerNight: 2500, description: "First-floor room B1 with a balcony view.", images: ["/images/B1.jpg"], amenities: ["Wi-Fi", "Hot Water", "Balcony View"], availabilityStatus: "available" },
  { id: "B2", title: "B2", type: "room" as Room["type"], pricePerNight: 2500, description: "First-floor room B2 with an open balcony view.", images: ["/images/B2.jpg"], amenities: ["Wi-Fi", "Hot Water", "Balcony View"], availabilityStatus: "available" },
];

export default function Booking() {
  const [searchParams] = useSearchParams();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState(searchParams.get("room") || "A1");
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [maxGuests, setMaxGuests] = useState(30);

  const [formData, setFormData] = useState({
    guestName: "",
    phone: "",
    email: "",
    guestsCount: 1,
  });

  useEffect(() => {
    fetch("/api/rooms")
      .then((res) => res.json())
      .then((data) => {
        const filteredRooms = Array.isArray(data) ? data.filter((room) => isCanonicalRoomTitle(room.title)) : [];
        setRooms(filteredRooms.length > 0 ? filteredRooms : fallbackRooms);
      })
      .catch(() => setRooms(fallbackRooms));

    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.guestLimit) setMaxGuests(data.guestLimit);
      });
  }, []);

  const visibleRooms = rooms.length > 0 ? rooms : fallbackRooms;
  const selectedRoom = visibleRooms.find((room) => room.id === selectedRoomId) || visibleRooms[0];
  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;
  const totalPrice = selectedRoom ? selectedRoom.pricePerNight * Math.max(1, nights) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomId || !checkIn || !checkOut || !formData.guestName || !formData.phone) {
      toast.error("Please fill all required fields");
      return;
    }

    if (nights <= 0) {
      toast.error("Check-out date must be after check-in date");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          roomId: selectedRoomId,
          checkIn: checkIn.toISOString(),
          checkOut: checkOut.toISOString(),
          totalPrice,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setIsSuccess(true);
        toast.success("Booking confirmed!");
      } else {
        toast.error(data.error || "Failed to book");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream dark:bg-stone-950 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-stone-900 p-12 rounded-2xl text-center max-w-md shadow-2xl border border-taupe"
        >
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 bg-forest/5 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-forest" />
            </div>
          </div>
          <h2 className="text-3xl font-serif text-forest mb-4 italic tracking-tight">Booking Requested Successfully!</h2>
          <p className="text-sage dark:text-stone-300 text-sm mb-8 leading-relaxed">
            Thank you, {formData.guestName}. Our team will contact you on {formData.phone} shortly to confirm your stay at {selectedRoom?.title}.
          </p>
          <Button asChild className="w-full rounded-sm bg-forest text-white hover:bg-forest/90 uppercase tracking-widest text-[10px] font-bold">
            <a href="/">Return Home</a>
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream dark:bg-stone-950 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-taupe overflow-hidden"
        >
          <div className="grid grid-cols-1 md:grid-cols-5 h-full">
            <div className="md:col-span-2 bg-forest p-10 text-white space-y-10">
              <div>
                <h2 className="text-3xl font-serif italic mb-2">Reservation <span className="font-sans not-italic font-bold tracking-tighter">Inquiry</span></h2>
                <p className="text-olive text-[10px] uppercase tracking-widest font-bold">Secure your hill escape</p>
              </div>

              {selectedRoom && (
                <div className="space-y-6 pt-6 border-t border-white/10">
                  <div className="overflow-hidden rounded-2xl border border-white/10">
                    <img
                      src={getRoomImage(selectedRoom.title, selectedRoom.images?.[0])}
                      alt={selectedRoom.title}
                      className="h-44 w-full object-cover"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-widest text-olive font-bold">Selected Space</span>
                    <p className="text-lg font-medium tracking-tight">{selectedRoom.title}</p>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white/70 uppercase tracking-widest">Price per night</span>
                    <span className="font-bold">Rs. {selectedRoom.pricePerNight}</span>
                  </div>
                  {nights > 0 && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-white/70 uppercase tracking-widest">Duration</span>
                      <span className="font-bold">{nights} {nights === 1 ? "night" : "nights"}</span>
                    </div>
                  )}
                  <div className="pt-6 border-t border-white/10 flex justify-between items-end">
                    <span className="text-[10px] uppercase tracking-widest text-olive font-bold">Estimated Total</span>
                    <span className="text-3xl font-bold tracking-tighter italic font-serif">Rs. {totalPrice}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="md:col-span-3 p-10">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest text-olive font-bold">Select Room</Label>
                    <Select value={selectedRoomId} onValueChange={setSelectedRoomId}>
                      <SelectTrigger className="w-full h-11 rounded-sm border-taupe focus:ring-forest dark:bg-stone-800 dark:text-stone-100 dark:border-stone-700">
                        <SelectValue placeholder="Choose a space..." />
                      </SelectTrigger>
                      <SelectContent>
                        {visibleRooms.map((room) => (
                          <SelectItem key={room.id} value={room.id}>
                            {room.title} - Rs. {room.pricePerNight}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-widest text-olive font-bold">Check-In</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-11 rounded-sm border-taupe dark:bg-stone-800 dark:text-stone-100 dark:border-stone-700", !checkIn && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4 text-olive" />
                            {checkIn ? format(checkIn, "PP") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={checkIn} onSelect={setCheckIn} disabled={(date) => date < new Date()} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-widest text-olive font-bold">Check-Out</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-11 rounded-sm border-taupe dark:bg-stone-800 dark:text-stone-100 dark:border-stone-700", !checkOut && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4 text-olive" />
                            {checkOut ? format(checkOut, "PP") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={checkOut} onSelect={setCheckOut} disabled={(date) => (checkIn ? date <= checkIn : date < new Date())} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest text-olive font-bold">Full Name</Label>
                    <Input
                      placeholder="Your name"
                      className="h-11 rounded-sm border-taupe focus:ring-forest dark:bg-stone-800 dark:text-stone-100 dark:border-stone-700"
                      value={formData.guestName}
                      onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-widest text-olive font-bold">Phone Number</Label>
                      <Input
                        placeholder="+91"
                        className="h-11 rounded-sm border-taupe focus:ring-forest dark:bg-stone-800 dark:text-stone-100 dark:border-stone-700"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-widest text-olive font-bold">Guests</Label>
                      <Select value={formData.guestsCount.toString()} onValueChange={(v) => setFormData({ ...formData, guestsCount: parseInt(v) })}>
                        <SelectTrigger className="w-full h-11 rounded-sm border-taupe dark:bg-stone-800 dark:text-stone-100 dark:border-stone-700">
                          <SelectValue placeholder="1 Guest" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: maxGuests }, (_, i) => i + 1).map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} {num === 1 ? "Guest" : "Guests"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full h-14 rounded-sm bg-forest text-white hover:bg-forest/90 uppercase tracking-[0.2em] text-[11px] font-bold transition-all duration-300">
                  {isSubmitting ? "Processing..." : "Confirm Booking"}
                </Button>
                <div className="text-center">
                  <a href="https://wa.me/919876543210" className="text-[10px] font-bold text-olive uppercase tracking-widest hover:text-forest flex items-center justify-center gap-2 transition-colors">
                    WhatsApp Booking <span className="w-1.5 h-1.5 bg-olive rounded-full animate-pulse"></span>
                  </a>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
