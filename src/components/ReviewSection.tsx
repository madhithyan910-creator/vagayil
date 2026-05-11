import * as React from "react";
import { useState, useEffect } from "react";
import { auth, signInWithGoogle, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, MessageSquareQuote } from "lucide-react";
import { motion } from "motion/react";
import { format } from "date-fns";
import { Review } from "@/types";
import { toast } from "sonner";

export default function ReviewSection() {
  const [user, setUser] = useState<User | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => setUser(u));
    
    const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"));
    const unsubReviews = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
      setReviews(data);
    }, (error) => {
      console.error("Firestore Error in ReviewSection:", error);
    });

    return () => {
      unsubAuth();
      unsubReviews();
    };
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      if (error.code !== "auth/popup-closed-by-user") {
        toast.error("Authentication failed: " + error.message);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return handleGoogleSignIn();
    if (!comment.trim()) return toast.error("Please add a comment");

    setSubmitting(true);
    try {
      await addDoc(collection(db, "reviews"), {
        userId: user.uid,
        userName: user.displayName || "Anonymous",
        userPhoto: user.photoURL || "",
        rating,
        comment,
        createdAt: new Date().toISOString()
      });
      setComment("");
      setRating(5);
      toast.success("Thank you for your review!");
    } catch (error) {
      toast.error("Failed to post review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-12">
      <div className="text-center">
        <span className="text-[10px] uppercase font-bold tracking-[0.4em] text-olive">Guestbook</span>
        <h2 className="text-3xl font-serif text-forest italic mt-4">Visitor <span className="font-sans not-italic font-bold">Experiences</span></h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Write Review */}
        <Card className="lg:col-span-1 border-taupe shadow-lg rounded-2xl overflow-hidden bg-cream dark:bg-stone-900 border-none">
          <CardContent className="p-8">
            {user ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-center gap-4">
                  <img src={user.photoURL || ""} className="w-10 h-10 rounded-full border border-forest" alt="" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-forest">Hello, {user.displayName?.split(" ")[0]}</p>
                    <p className="text-[10px] text-sage">Share your experience with us</p>
                  </div>
                </div>

                <div className="space-y-2">
                   <p className="text-[10px] font-bold uppercase tracking-widest text-olive">Rating</p>
                   <div className="flex gap-1">
                     {[1, 2, 3, 4, 5].map(s => (
                       <button 
                        key={s} 
                        type="button"
                        onClick={() => setRating(s)}
                        className={`transition-colors ${s <= rating ? "text-yellow-500" : "text-stone-300"}`}
                       >
                         <Star className={`h-5 w-5 ${s <= rating ? "fill-current" : ""}`} />
                       </button>
                     ))}
                   </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-olive">Comment</p>
                  <textarea 
                    className="w-full min-h-[120px] p-4 rounded-xl border border-taupe bg-white dark:bg-stone-800 focus:ring-1 focus:ring-forest outline-none text-sm"
                    placeholder="Tell us about your stay..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full h-12 bg-forest text-white rounded-sm font-bold uppercase tracking-widest text-[10px]"
                >
                  {submitting ? "Posting..." : "Post Review"}
                </Button>
              </form>
            ) : (
              <div className="text-center py-10 space-y-6">
                <div className="w-16 h-16 bg-forest/5 rounded-full flex items-center justify-center mx-auto">
                  <MessageSquareQuote className="h-8 w-8 text-forest" />
                </div>
                <p className="text-sm font-serif italic text-sage px-6">Only verified guests can post reviews. Please sign in with your Google account to share your thoughts.</p>
                <Button 
                  onClick={handleGoogleSignIn}
                  className="w-full bg-forest text-white h-12 rounded-sm font-bold uppercase tracking-widest text-[10px]"
                >
                  Sign in with Google
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Review List */}
        <div className="lg:col-span-2 space-y-6 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
          {reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-60 bg-cream/30 rounded-3xl border border-dashed border-taupe">
              <p className="text-sage font-serif italic">No reviews yet. Be the first to share your experience!</p>
            </div>
          ) : (
            reviews.map((r) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card className="border-none shadow-sm rounded-2xl bg-white dark:bg-stone-800">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <img src={r.userPhoto} className="w-8 h-8 rounded-full" alt="" />
                        <div>
                          <p className="text-xs font-bold text-forest uppercase tracking-tight">{r.userName}</p>
                          <p className="text-[9px] text-sage">{format(new Date(r.createdAt), "MMMM d, yyyy")}</p>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 text-yellow-500 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed italic font-serif">
                      "{r.comment}"
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
