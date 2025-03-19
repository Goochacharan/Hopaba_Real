
import { Recommendation, AppEvent } from '../types/recommendation';

export const yogaAndFitnessMockData: Recommendation[] = [
  {
    id: 'yoga1',
    name: 'Serenity Yoga Studio',
    category: 'Fitness',
    tags: ['Yoga', 'Beginners', 'Meditation'],
    rating: 4.8,
    address: '123 Zen Street, Indiranagar, Bangalore',
    distance: '0.6 miles away',
    image: 'https://images.unsplash.com/photo-1570655652364-2e0a67455ac6',
    images: ['https://images.unsplash.com/photo-1570655652364-2e0a67455ac6'],
    description: 'Peaceful yoga studio offering classes for all levels with focus on proper alignment and mindful practice.',
    phone: '+919876543230',
    openNow: true,
    hours: 'Until 9:00 PM',
    priceLevel: '$$',
    reviewCount: 89
  },
  {
    id: 'yoga2',
    name: 'Namaste Yoga Center',
    category: 'Fitness',
    tags: ['Yoga', 'Hatha', 'Vinyasa'],
    rating: 4.7,
    address: '456 Harmony Road, Koramangala, Bangalore',
    distance: '1.2 miles away',
    image: 'https://images.unsplash.com/photo-1588286840104-8957b019727f',
    images: ['https://images.unsplash.com/photo-1588286840104-8957b019727f'],
    description: 'Traditional yoga center offering Hatha and Vinyasa classes with experienced instructors in a calming environment.',
    phone: '+919876543231',
    openNow: true,
    hours: 'Until 8:30 PM',
    priceLevel: '$$',
    reviewCount: 67
  },
  {
    id: 'yoga3',
    name: 'Flow Yoga & Wellness',
    category: 'Fitness',
    tags: ['Yoga', 'Beginners', 'Workshops'],
    rating: 4.9,
    address: '789 Peaceful Lane, Jayanagar, Bangalore',
    distance: '0.8 miles away',
    image: 'https://images.unsplash.com/photo-1599447421416-3414500d18a5',
    images: ['https://images.unsplash.com/photo-1599447421416-3414500d18a5'],
    description: 'Wellness-focused yoga studio with special workshops for beginners and programs for stress relief and flexibility.',
    phone: '+919876543232',
    openNow: false,
    hours: 'Opens tomorrow at 6:00 AM',
    priceLevel: '$$$',
    reviewCount: 102
  }
];

export const sampleEvents: AppEvent[] = [
  {
    id: 'event1',
    title: 'Summer Food Festival',
    date: 'July 15, 2023',
    time: '11:00 AM - 8:00 PM',
    location: 'Central Park, San Francisco',
    description: 'A culinary celebration featuring over 30 local restaurants, live cooking demonstrations, and music performances.',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1',
    attendees: 215
  },
  {
    id: 'event2',
    title: 'Weekend Art Exhibition',
    date: 'July 22-23, 2023',
    time: '10:00 AM - 6:00 PM',
    location: 'Modern Art Gallery, Indiranagar',
    description: 'Showcasing works from emerging local artists with interactive sessions and workshops throughout the weekend.',
    image: 'https://images.unsplash.com/photo-1591115765373-5207764f72e4',
    attendees: 98
  },
  {
    id: 'event3',
    title: 'Wellness & Yoga Retreat',
    date: 'August 5, 2023',
    time: '7:00 AM - 4:00 PM',
    location: 'Sunset Beach, Koramangala',
    description: 'A day-long retreat with yoga sessions, meditation workshops, and healthy living seminars led by certified instructors.',
    image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0',
    attendees: 42
  },
  {
    id: 'event4',
    title: 'Yoga for Beginners Workshop',
    date: 'August 20, 2023',
    time: '9:00 AM - 12:00 PM',
    location: 'Serenity Yoga Studio, Indiranagar',
    description: 'A beginner-friendly workshop introducing fundamental yoga poses, breathing techniques, and mindfulness practices for newcomers.',
    image: 'https://images.unsplash.com/photo-1599447421416-3414500d18a5',
    attendees: 32
  }
];
