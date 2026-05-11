import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";
import cors from "cors";
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, where, getDoc } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

// Initialize Firebase for Backend (using client SDK for convenience in this environment)
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);
const dataDir = path.join(process.cwd(), "data");
const roomOverridesPath = path.join(dataDir, "room-overrides.json");
const localSpotsPath = path.join(dataDir, "tourist-spots.json");
const localSettingsPath = path.join(dataDir, "settings.json");
const localBookingsPath = path.join(dataDir, "bookings.json");

type CanonicalRoom = {
  title: string;
  type: string;
  pricePerNight: number;
  description: string;
  availabilityStatus: "available" | "unavailable";
  amenities: string[];
  images: string[];
};

type StoredRoom = {
  id: string;
  title?: string;
  pricePerNight?: number;
  description?: string;
  availabilityStatus?: "available" | "unavailable";
  amenities?: string[];
};

const canonicalRooms: CanonicalRoom[] = [
  { title: "A1", type: "room", pricePerNight: 2500, description: "Cottage room A1 with a peaceful private setting.", availabilityStatus: "available", amenities: ["Wi-Fi", "Hot Water", "Cottage Stay"], images: ["/images/A1.jpg"] },
  { title: "A2", type: "room", pricePerNight: 2500, description: "Cottage room A2 with a cozy and restful atmosphere.", availabilityStatus: "available", amenities: ["Wi-Fi", "Hot Water", "Cottage Stay"], images: ["/images/A2.jpg"] },
  { title: "B1", type: "room", pricePerNight: 2500, description: "First-floor room B1 with a balcony view.", availabilityStatus: "available", amenities: ["Wi-Fi", "Hot Water", "Balcony View"], images: ["/images/B1.jpg"] },
  { title: "B2", type: "room", pricePerNight: 2500, description: "First-floor room B2 with an open balcony view.", availabilityStatus: "available", amenities: ["Wi-Fi", "Hot Water", "Balcony View"], images: ["/images/B2.jpg"] }
];

type RoomOverride = {
  pricePerNight?: number;
  availabilityStatus?: "available" | "unavailable";
};

const defaultSettings = {
  id: "main",
  phone: "+91 9876543210",
  bio: "Vagayil Holydays offers a serene escape in the heart of Vagamon's lush greenery. Experience nature like never before.",
  mapLink: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31481.54519961633!2d76.885664!3d9.691234!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b07b5007a5ffc0d%3A0x7a79a2209b337680!2sVagayil%20Holydays!5e0!3m2!1sen!2sin!4v1715410000000!5m2!1sen!2sin",
  images: [
    "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80"
  ],
  guestLimit: 30
};

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
  } catch {
    return fallback;
  }
}

function writeJsonFile<T>(filePath: string, data: T) {
  ensureDataDir();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

function readRoomOverrides(): Record<string, RoomOverride> {
  return readJsonFile<Record<string, RoomOverride>>(roomOverridesPath, {});
}

function writeRoomOverrides(overrides: Record<string, RoomOverride>) {
  writeJsonFile(roomOverridesPath, overrides);
}

function readLocalSpots(): any[] {
  return readJsonFile<any[]>(localSpotsPath, []);
}

function writeLocalSpots(spots: any[]) {
  writeJsonFile(localSpotsPath, spots);
}

function readLocalSettings() {
  return readJsonFile(localSettingsPath, defaultSettings);
}

function writeLocalSettings(settings: any) {
  writeJsonFile(localSettingsPath, settings);
}

function readLocalBookings(): any[] {
  return readJsonFile<any[]>(localBookingsPath, []);
}

function writeLocalBookings(bookings: any[]) {
  writeJsonFile(localBookingsPath, bookings);
}

function ensureLocalDataFiles() {
  ensureDataDir();
  if (!fs.existsSync(localSettingsPath)) {
    writeLocalSettings(defaultSettings);
  }
  if (!fs.existsSync(localBookingsPath)) {
    writeLocalBookings([]);
  }
  if (!fs.existsSync(localSpotsPath)) {
    writeLocalSpots([]);
  }
  if (!fs.existsSync(roomOverridesPath)) {
    writeRoomOverrides({});
  }
}

async function getCanonicalRooms() {
  const roomOverrides = readRoomOverrides();

  return canonicalRooms
    .map((canonicalRoom) => {
      const override = roomOverrides[canonicalRoom.title] || {};
      return {
        id: canonicalRoom.title,
        ...canonicalRoom,
        pricePerNight: override.pricePerNight ?? canonicalRoom.pricePerNight,
        description: canonicalRoom.description,
        amenities: canonicalRoom.amenities,
        availabilityStatus: override.availabilityStatus ?? canonicalRoom.availabilityStatus,
        images: canonicalRoom.images
      };
    });
}

async function startServer() {
  const app = express();
  const PORT = 3000;
  ensureLocalDataFiles();

  app.use(cors());
  app.use(express.json());

  app.get("/favicon.ico", (_req, res) => {
    res.status(204).end();
  });

  // --- API Routes ---

  // Admin Login
  app.post("/api/admin/login", (req, res) => {
    const { username, password } = req.body;
    if (username === "vagayil.holydays" && password === "vagayil3011") {
      res.json({ success: true, token: "fake-admin-token" }); // Simple token for demo
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  // Init Data (Run once or manually)
  app.post("/api/admin/init", async (req, res) => {
    try {
      ensureLocalDataFiles();

      res.json({ message: "Database initialized" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Init failed" });
    }
  });

  // Update Settings
  app.post("/api/admin/settings", async (req, res) => {
    try {
      const settings = req.body;
      writeLocalSettings({
        ...defaultSettings,
        ...settings
      });
      res.json({ message: "Settings updated" });
    } catch (error) {
      res.status(500).json({ error: "Update failed" });
    }
  });

  app.get("/api/settings", async (req, res) => {
    try {
      res.json(readLocalSettings());
    } catch (error) {
      res.status(500).json({ error: "Fetch failed" });
    }
  });

  // Tourist Spots
  app.get("/api/spots", async (req, res) => {
    try {
      const snap = await getDocs(collection(db, "touristSpots"));
      const firestoreSpots = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const localSpots = readLocalSpots();
      res.json([...firestoreSpots, ...localSpots]);
    } catch (error) {
      res.json(readLocalSpots());
    }
  });

  app.post("/api/admin/spots", async (req, res) => {
    try {
      const localSpots = readLocalSpots();
      const newSpot = {
        id: `local-${Date.now()}`,
        ...req.body
      };
      localSpots.unshift(newSpot);
      writeLocalSpots(localSpots);
      res.status(201).json({ message: "Spot added" });
    } catch (error) {
      res.status(500).json({ error: "Add failed" });
    }
  });

  // Reviews
  app.get("/api/reviews", async (req, res) => {
    try {
      const snap = await getDocs(collection(db, "reviews"));
      res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      res.status(500).json({ error: "Fetch failed" });
    }
  });

  app.post("/api/reviews", async (req, res) => {
    try {
      await addDoc(collection(db, "reviews"), req.body);
      res.status(201).json({ message: "Review added" });
    } catch (error) {
      res.status(500).json({ error: "Add failed" });
    }
  });

  // Get all rooms
  app.get("/api/rooms", async (req, res) => {
    try {
      const rooms = await getCanonicalRooms();
      res.json(rooms);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch rooms" });
    }
  });

  // Create booking with double-booking prevention
  app.post("/api/book", async (req, res) => {
    const { guestName, phone, email, checkIn, checkOut, guestsCount, roomId, totalPrice } = req.body;

    try {
      // Basic validation
      if (!guestName || !phone || !checkIn || !checkOut || !roomId) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Check for overlap against locally managed bookings
      const existingBookings = readLocalBookings().filter(
        (booking) => booking.roomId === roomId && ["pending", "confirmed"].includes(booking.status)
      );

      const newIn = new Date(checkIn).getTime();
      const newOut = new Date(checkOut).getTime();

      const isOverlapping = existingBookings.some(b => {
        const bIn = new Date(b.checkIn).getTime();
        const bOut = new Date(b.checkOut).getTime();
        // Overlap logic: (StartA < EndB) and (EndA > StartB)
        return (newIn < bOut) && (newOut > bIn);
      });

      if (isOverlapping) {
        return res.status(409).json({ error: "Room already booked for these dates" });
      }

      // Store booking locally so admin always reflects updates
      const newBooking = {
        id: `local-${Date.now()}`,
        guestName,
        phone,
        email,
        checkIn,
        checkOut,
        guestsCount,
        roomId,
        totalPrice,
        status: "pending",
        createdAt: new Date().toISOString()
      };
      const bookings = readLocalBookings();
      bookings.unshift(newBooking);
      writeLocalBookings(bookings);

      res.status(201).json({ id: newBooking.id, message: "Booking successful!" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create booking" });
    }
  });

  // Admin: Get all bookings
  app.get("/api/bookings", async (req, res) => {
    try {
      res.json(readLocalBookings());
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  // Admin: Delete booking
  app.delete("/api/booking/:id", async (req, res) => {
    try {
      const bookingId = req.params.id;
      const bookings = readLocalBookings().filter((booking) => booking.id !== bookingId);
      writeLocalBookings(bookings);
      res.json({ message: "Booking deleted" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete booking" });
    }
  });

  // Admin: Toggle Room Availability
  app.post("/api/rooms/:id/toggle", async (req, res) => {
    try {
      const roomKey = req.params.id;
      const rooms = await getCanonicalRooms();
      const room = rooms.find((entry: any) => entry.id === roomKey || entry.title === roomKey);
      if (!room) return res.status(404).json({ error: "Room not found" });

      const overrides = readRoomOverrides();
      const nextStatus = room.availabilityStatus === "available" ? "unavailable" : "available";
      overrides[room.title] = {
        ...overrides[room.title],
        availabilityStatus: nextStatus
      };
      writeRoomOverrides(overrides);

      res.json({ message: `Room marked as ${nextStatus}` });
    } catch (error) {
      res.status(500).json({ error: "Failed to update room" });
    }
  });

  app.post("/api/admin/rooms/:id/price", async (req, res) => {
    try {
      const roomKey = req.params.id;
      const pricePerNight = Number(req.body?.pricePerNight);
      if (!Number.isFinite(pricePerNight) || pricePerNight <= 0) {
        return res.status(400).json({ error: "Invalid price" });
      }

      const rooms = await getCanonicalRooms();
      const room = rooms.find((entry: any) => entry.id === roomKey || entry.title === roomKey);
      if (!room) return res.status(404).json({ error: "Room not found" });

      const overrides = readRoomOverrides();
      overrides[room.title] = {
        ...overrides[room.title],
        pricePerNight
      };
      writeRoomOverrides(overrides);

      res.json({ message: "Price updated" });
    } catch (error) {
      res.status(500).json({ error: "Failed to update price" });
    }
  });

  // --- Vite / Frontend Setup ---

  const distPath = path.join(process.cwd(), "dist");
  const hasBuiltClient = fs.existsSync(path.join(distPath, "index.html"));
  const shouldUseProductionBuild = process.env.NODE_ENV === "production" && hasBuiltClient;

  if (!shouldUseProductionBuild) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
