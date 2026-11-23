import { Sparkles, Heart, Utensils, Users } from 'lucide-react';

// Event facts live in one place so they are easy to update later.
// Date, time and venue are placeholders until the dojo confirms them.
export const EVENT = {
  name: 'Aikido Shinju-Kai Family Day',
  label: 'Annual Community Event',
  tagline: 'Celebrate Aikido, Family and Community',
  intro:
    'Join us for a special community event where parents and family members can watch their children demonstrate their Aikido skills, confidence and training progress.',
  date: 'To Be Announced',
  time: 'To Be Announced',
  venue: 'To Be Announced',
  shortPlaceholder: 'TBA',
  contactEmail: 'hq@aikidoshinjukai.com.sg',
  contactPhone: '+65 6513 1588',
};

export const EXPECTATIONS = [
  {
    icon: Sparkles,
    title: 'Live Aikido Demonstrations',
    text: 'Watch younger students showcase their skills and training progress on the mat.',
  },
  {
    icon: Heart,
    title: 'Celebrate Your Children',
    text: "An opportunity for parents to support and celebrate their children's progress and growth.",
  },
  {
    icon: Utensils,
    title: 'Complimentary Dinner & Snacks',
    text: 'Enjoy a complimentary dinner and snacks provided for all attendees.',
  },
  {
    icon: Users,
    title: 'Connect with the Community',
    text: 'A fun opportunity to connect with the wider Aikido Shinju-Kai family.',
  },
];
