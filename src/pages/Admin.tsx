import * as React from "react";
import { useState, useEffect } from "react";
import { Room, Booking, SiteSettings, TouristSpot } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Power, User, Calendar, Phone, MapPin, ImageIcon, Settings, Map as MapIcon, LogOut, Plus, Home as HomeIcon } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { getRoomImage, isCanonicalRoomTitle } from "@/lib/roomImages";

const fallbackRooms: Room[] = [
  { id: "A1", title: "A1", type: "room" as Room["type"], pricePerNight: 2500, description: "Cottage room A1 with a peaceful private setting.", images: ["/images/A1.jpg"], amenities: ["Wi-Fi", "Hot Water", "Cottage Stay"], availabilityStatus: "available" },
  { id: "A2", title: "A2", type: "room" as Room["type"], pricePerNight: 2500, description: "Cottage room A2 with a cozy and restful atmosphere.", images: ["/images/A2.jpg"], amenities: ["Wi-Fi", "Hot Water", "Cottage Stay"], availabilityStatus: "available" },
  { id: "B1", title: "B1", type: "room" as Room["type"], pricePerNight: 2500, description: "First-floor room B1 with a balcony view.", images: ["/images/B1.jpg"], amenities: ["Wi-Fi", "Hot Water", "Balcony View"], availabilityStatus: "available" },
  { id: "B2", title: "B2", type: "room" as Room["type"], pricePerNight: 2500, description: "First-floor room B2 with an open balcony view.", images: ["/images/B2.jpg"], amenities: ["Wi-Fi", "Hot Water", "Balcony View"], availabilityStatus: "available" },
];

export default function Admin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [pass, setPass] = useState("");
  const [username, setUsername] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [spots, setSpots] = useState<TouristSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"bookings" | "rooms" | "settings" | "spots">("bookings");

  useEffect(() => {
    if (isAdmin) fetchData();
  }, [isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [roomsRes, bookingsRes, settingsRes, spotsRes] = await Promise.all([
        fetch("/api/rooms"),
        fetch("/api/bookings"),
        fetch("/api/settings"),
        fetch("/api/spots")
      ]);
      
      const roomsData = await roomsRes.json();
      const bookingsData = await bookingsRes.json();
      const settingsData = await settingsRes.json();
      const spotsData = await spotsRes.json();

      if (Array.isArray(roomsData)) {
        const filteredRooms = roomsData.filter((room) => isCanonicalRoomTitle(room.title));
        setRooms(filteredRooms.length > 0 ? filteredRooms : fallbackRooms);
      } else {
        setRooms(fallbackRooms);
      }
      if (Array.isArray(bookingsData)) setBookings(bookingsData);
      if (settingsData && !settingsData.error) setSettings(settingsData);
      if (Array.isArray(spotsData)) setSpots(spotsData);

      if (roomsData.error || bookingsData.error || settingsData.error || spotsData.error) {
        toast.error("Some data failed to load");
      }
    } catch (error) {
      setRooms(fallbackRooms);
      toast.error("Failed to fetch admin data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password: pass })
    });
    if (res.ok) {
      setIsAdmin(true);
      toast.success("Welcome back, Vagayil Holydays");
    } else {
      toast.error("Invalid username or password");
    }
  };

  const deleteBooking = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await fetch(`/api/booking/${id}`, { method: "DELETE" });
      setBookings(bookings.filter(b => b.id !== id));
      toast.success("Booking deleted");
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const toggleRoom = async (id: string) => {
    try {
      const response = await fetch(`/api/rooms/${id}/toggle`, { method: "POST" });
      if (!response.ok) throw new Error();
      fetchData();
      toast.success("Room status updated");
    } catch (error) {
      toast.error("Toggle failed");
    }
  };

  const updatePrice = async (id: string, newPrice: number) => {
    try {
      const response = await fetch(`/api/admin/rooms/${id}/price`, { 
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pricePerNight: newPrice }) 
      });
      if (!response.ok) throw new Error();
      fetchData();
      toast.success("Price updated");
    } catch(e) { toast.error("Update failed"); }
  }

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });
      if (!response.ok) throw new Error();
      fetchData();
      toast.success("Site settings saved");
    } catch (error) {
      toast.error("Save failed");
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream dark:bg-stone-950 px-4">
        <Card className="max-w-sm w-full border border-taupe shadow-2xl rounded-2xl overflow-hidden bg-white dark:bg-stone-900 border-none">
          <CardHeader className="text-center bg-forest text-white py-10">
            <CardTitle className="text-2xl font-serif italic">Vagayil Holydays</CardTitle>
            <p className="text-[10px] uppercase tracking-widest text-olive mt-1">Management Portal</p>
          </CardHeader>
          <CardContent className="pt-8 pb-10">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <p className="text-[9px] uppercase font-bold text-sage ml-1">Username</p>
                <input 
                  type="text" 
                  placeholder="vagrant.holydays" 
                  className="w-full h-12 px-4 rounded-sm border border-taupe text-stone-900 focus:ring-forest focus:outline-none transition-all dark:bg-stone-800 dark:text-stone-100 dark:border-stone-700"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <p className="text-[9px] uppercase font-bold text-sage ml-1">Password</p>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="w-full h-12 px-4 rounded-sm border border-taupe text-stone-900 focus:ring-forest focus:outline-none transition-all dark:bg-stone-800 dark:text-stone-100 dark:border-stone-700"
                  value={pass}
                  onChange={e => setPass(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full h-12 bg-forest text-white hover:bg-forest/90 rounded-sm uppercase tracking-widest text-[10px] font-bold mt-4 shadow-lg shadow-forest/20">
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream dark:bg-stone-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-stone-900 p-8 rounded-3xl shadow-sm border border-taupe/50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-forest animate-pulse" />
              <span className="text-olive font-bold text-[10px] uppercase tracking-[0.3em] block">Authenticated Session</span>
            </div>
            <h1 className="text-4xl font-serif text-forest italic">Control <span className="font-sans not-italic font-bold text-stone-900 dark:text-cream">Center</span></h1>
            <p className="text-sage text-xs tracking-wide mt-1">Managing Vagayil Holydays Homestay</p>
          </div>
          <div className="flex gap-3">
             <Button 
                variant="outline" 
                onClick={async () => {
                  await fetch("/api/admin/init", { method: "POST" });
                  fetchData();
                  toast.success("Database Reset/Init Complete");
                }}
                className="border-taupe text-forest hover:bg-taupe/20 text-[10px] font-bold uppercase tracking-widest h-10 px-4 rounded-sm"
              >
                Reset DB
              </Button>
            <Button 
              onClick={() => setIsAdmin(false)}
              className="bg-forest text-white hover:bg-forest/90 rounded-sm uppercase tracking-widest text-[10px] font-bold h-10 px-6"
            >
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto pb-2 gap-4">
          {[
            { id: "bookings", label: "Reservations", icon: User },
            { id: "rooms", label: "Rooms", icon: HomeIcon },
            { id: "spots", label: "Tourist Spots", icon: MapIcon },
            { id: "settings", label: "Site Settings", icon: Settings }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? "bg-forest text-white shadow-lg shadow-forest/20" : "bg-white dark:bg-stone-900 text-sage hover:text-forest"}`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-8">
          {activeTab === "bookings" && (
            <div className="space-y-6">
               <div className="flex justify-between items-center bg-forest/5 p-4 rounded-xl border border-forest/10">
                 <p className="text-[10px] font-bold uppercase tracking-widest text-forest">Current Bookings: {bookings.length}</p>
               </div>
               {bookings.length === 0 ? (
                <Card className="border-none shadow-sm py-20 text-center bg-white dark:bg-stone-900 rounded-2xl">
                  <p className="text-sage italic text-sm font-serif">No active reservations found.</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bookings.map(b => (
                    <Card key={b.id} className="border border-taupe shadow-sm hover:shadow-lg transition-all rounded-2xl bg-white dark:bg-stone-900 group">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex gap-4">
                            <div className="h-12 w-12 bg-taupe/30 rounded-full flex items-center justify-center">
                              <User className="h-6 w-6 text-forest" />
                            </div>
                            <div>
                              <p className="font-bold text-sm text-forest dark:text-stone-100 uppercase tracking-tight">{b.guestName}</p>
                              <p className="text-[10px] text-sage">{b.email}</p>
                            </div>
                          </div>
                          <Badge className={`uppercase text-[9px] tracking-tighter ${b.status === "confirmed" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                            {b.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="space-y-1">
                             <div className="flex items-center gap-2 text-[10px] text-forest font-bold uppercase">
                               <Calendar className="h-3 w-3 text-olive" /> Dates
                             </div>
                             <p className="text-xs text-sage ml-5">{format(new Date(b.checkIn), "MMM d")} - {format(new Date(b.checkOut), "MMM d")}</p>
                          </div>
                          <div className="space-y-1">
                             <div className="flex items-center gap-2 text-[10px] text-forest font-bold uppercase">
                               <Phone className="h-3 w-3 text-olive" /> Contact
                             </div>
                             <p className="text-xs text-sage ml-5">{b.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-6 border-t border-taupe/50">
                          <div>
                            <p className="text-[9px] uppercase font-bold text-olive">Total Price</p>
                            <p className="text-lg font-serif italic text-forest dark:text-stone-100">Rs. {b.totalPrice}</p>
                          </div>
                          <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => deleteBooking(b.id!)}>
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "rooms" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {rooms.map(room => (
                <Card key={room.id} className="border border-taupe shadow-sm rounded-3xl overflow-hidden bg-white dark:bg-stone-900">
                  <div className="h-40 overflow-hidden relative">
                    <img src={getRoomImage(room.title, room.images?.[0])} className="w-full h-full object-cover" alt="" />
                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${room.availabilityStatus === "available" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
                      {room.availabilityStatus === "available" ? "Vacancy" : "Full"}
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-forest dark:text-stone-100 mb-2">{room.title}</h3>
                    <div className="flex items-center justify-between mb-4">
                       <p className="text-sm font-bold text-forest dark:text-stone-100">Rs. {room.pricePerNight}</p>
                       <input 
                        type="number" 
                        className="w-24 h-8 border border-taupe rounded bg-cream text-stone-900 dark:bg-stone-800 dark:text-stone-100 dark:border-stone-700 text-[10px] px-2"
                        defaultValue={room.pricePerNight}
                        onBlur={(e) => updatePrice(room.id, parseInt(e.target.value))}
                       />
                    </div>
                    <Button 
                      className={`w-full rounded-sm h-10 uppercase tracking-widest text-[10px] font-bold ${room.availabilityStatus === "available" ? "bg-red-50 text-red-500 hover:bg-red-100" : "bg-forest text-white shadow-lg shadow-forest/20"}`}
                      onClick={() => toggleRoom(room.id)}
                    >
                      <Power className="h-4 w-4 mr-2" /> 
                      {room.availabilityStatus === "available" ? "Mark as Full" : "Mark Available"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {activeTab === "spots" && (
            <div className="space-y-8">
              <Card className="border-none shadow-lg bg-white dark:bg-stone-900 rounded-3xl p-8">
                <h3 className="text-sm font-bold uppercase tracking-widest text-forest mb-6 flex items-center">
                  <Plus className="h-5 w-5 mr-2" /> Add New Tourist Spot
                </h3>
                <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.target as any;
                  const newSpot = {
                    name: form.name.value,
                    description: form.description.value,
                    image: form.image.value,
                    searchKeyword: form.search.value
                  };
                  try {
                    const response = await fetch("/api/admin/spots", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(newSpot)
                    });
                    if (!response.ok) throw new Error();
                    form.reset();
                    fetchData();
                    toast.success("New spot added");
                  } catch (error) {
                    toast.error("Failed to add tourist spot");
                  }
                }}>
                  <input name="name" placeholder="Spot Name" className="h-12 px-4 rounded border border-taupe text-stone-900 dark:bg-stone-800 dark:text-stone-100 dark:border-stone-700" required />
                  <input name="image" placeholder="Image URL" className="h-12 px-4 rounded border border-taupe text-stone-900 dark:bg-stone-800 dark:text-stone-100 dark:border-stone-700" required />
                  <input name="search" placeholder="Google Search Keyword" className="h-12 px-4 rounded border border-taupe text-stone-900 dark:bg-stone-800 dark:text-stone-100 dark:border-stone-700 md:col-span-2" />
                  <textarea name="description" placeholder="Short Description" className="h-24 p-4 rounded border border-taupe text-stone-900 dark:bg-stone-800 dark:text-stone-100 dark:border-stone-700 md:col-span-2" required />
                  <Button type="submit" className="bg-forest text-white rounded-sm h-12 uppercase tracking-widest text-[10px] font-bold">Add Spot</Button>
                </form>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {spots.map(spot => (
                  <Card key={spot.id} className="border border-taupe shadow-sm rounded-2xl overflow-hidden bg-white dark:bg-stone-900">
                    <img src={spot.image} className="h-32 w-full object-cover" alt="" />
                    <CardContent className="p-4">
                      <p className="font-bold text-xs uppercase text-forest dark:text-stone-100">{spot.name}</p>
                      <p className="text-[10px] text-sage line-clamp-2 mt-1">{spot.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === "settings" && settings && (
            <Card className="border-none shadow-lg bg-white dark:bg-stone-900 rounded-3xl p-8 max-w-2xl mx-auto w-full">
              <h3 className="text-sm font-bold uppercase tracking-widest text-forest mb-8 border-b border-taupe pb-4">General Configuration</h3>
              <form onSubmit={saveSettings} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-olive">Owner Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-forest" />
                    <input 
                      type="text" 
                      className="w-full h-12 pl-12 pr-4 rounded border border-taupe text-stone-900 dark:bg-stone-800 dark:text-stone-100 dark:border-stone-700"
                      value={settings.phone}
                      onChange={e => setSettings({...settings, phone: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-olive">Homestay Bio</label>
                  <textarea 
                    className="w-full h-32 p-4 rounded border border-taupe text-stone-900 dark:bg-stone-800 dark:text-stone-100 dark:border-stone-700"
                    value={settings.bio}
                    onChange={e => setSettings({...settings, bio: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-olive">Google Map Embed Link</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-forest" />
                    <input 
                      type="text" 
                      className="w-full h-12 pl-12 pr-4 rounded border border-taupe text-stone-900 dark:bg-stone-800 dark:text-stone-100 dark:border-stone-700"
                      value={settings.mapLink}
                      onChange={e => setSettings({...settings, mapLink: e.target.value})}
                    />
                  </div>
                  <p className="text-[8px] text-sage italic">Paste the 'src' link from the Share &gt; Embed Map option on Google Maps.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-olive">Max Online Booking Guest Limit</label>
                  <input 
                    type="number" 
                    max={30}
                    className="w-full h-12 px-4 rounded border border-taupe text-stone-900 dark:bg-stone-800 dark:text-stone-100 dark:border-stone-700"
                    value={settings.guestLimit}
                    onChange={e => setSettings({...settings, guestLimit: parseInt(e.target.value)})}
                  />
                </div>

                <Button type="submit" className="w-full h-14 bg-forest text-white rounded-sm font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-forest/20 mt-4">
                  Save All Changes
                </Button>
              </form>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
