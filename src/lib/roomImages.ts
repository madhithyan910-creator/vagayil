import A1Image from "../../images/A1.jpg";
import A2Image from "../../images/A2.jpg";
import B1Image from "../../images/B1.jpg";
import B2Image from "../../images/B2.jpg";
import Main1Image from "../../images/main 1.jpeg";
import Main2Image from "../../images/main 2.jpeg";
import Main3Image from "../../images/main 3.jpeg";
import Other1Image from "../../images/Other1.jpeg";
import Other2Image from "../../images/Other2.jpeg";
import Other3Image from "../../images/Other3.jpeg";
import Other4Image from "../../images/Other4.jpeg";
import Other5Image from "../../images/Other5.jpeg";

export const roomImages: Record<string, string> = {
  A1: A1Image,
  A2: A2Image,
  B1: B1Image,
  B2: B2Image,
};

export const canonicalRoomTitles = ["A1", "A2", "B1", "B2"] as const;

export const roomCaptions: Record<string, { label: string; caption: string }> = {
  A1: {
    label: "Cottage",
    caption: "A1 is a private cottage stay with a peaceful and cozy setting."
  },
  A2: {
    label: "Cottage",
    caption: "A2 is a cottage room made for a calm and comfortable hillside break."
  },
  B1: {
    label: "1st Floor",
    caption: "B1 is a first-floor room with a balcony view facing the greenery."
  },
  B2: {
    label: "1st Floor",
    caption: "B2 is a first-floor room with a balcony view and open-air feel."
  }
};

export function getRoomImage(title: string, fallback?: string) {
  return roomImages[title] || fallback || A1Image;
}

export function isCanonicalRoomTitle(title: string) {
  return canonicalRoomTitles.includes(title as (typeof canonicalRoomTitles)[number]);
}

export const homeImages = {
  hero: Main1Image,
  featureOne: Main2Image,
  featureTwo: Main3Image,
};

export const moreRoomPics = [
  { id: "other-1", src: Other1Image, alt: "Vagayil room view 1" },
  { id: "other-2", src: Other2Image, alt: "Vagayil room view 2" },
  { id: "other-3", src: Other3Image, alt: "Vagayil room view 3" },
  { id: "other-4", src: Other4Image, alt: "Vagayil room view 4" },
  { id: "other-5", src: Other5Image, alt: "Vagayil room view 5" },
];
