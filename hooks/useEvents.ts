import { Event } from '@/types/event';
import { useEffect, useState } from 'react';

// Mock data for demonstration
const mockEvents: Event[] = [
  {
    $id: '1',
    title: 'Community Potluck Dinner',
    description: 'Join us for a wonderful evening of shared meals and community bonding. Bring a dish to share!',
    organizerId: 'user1',
    organizerName: 'Sarah Johnson',
    location: 'Community Center, Main St',
    eventDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    maxParticipants: 50,
    participantIds: ['user2', 'user3', 'user4'],
    status: 'upcoming',
    imageUri: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800',
    latitude: 40.7128,
    longitude: -74.0060,
    category: 'potluck',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    $id: '2',
    title: 'Cooking Class: Italian Pasta',
    description: 'Learn to make authentic Italian pasta from scratch with Chef Marco. All skill levels welcome!',
    organizerId: 'user2',
    organizerName: 'Marco Rossi',
    location: 'Culinary School Kitchen',
    eventDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    maxParticipants: 15,
    participantIds: ['user1', 'user5', 'user6', 'user7'],
    status: 'upcoming',
    imageUri: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800',
    latitude: 40.7589,
    longitude: -73.9851,
    category: 'cooking-class',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    $id: '3',
    title: 'Food Rescue Mission',
    description: 'Help us collect surplus food from local restaurants and distribute to those in need.',
    organizerId: 'user3',
    organizerName: 'Emma Davis',
    location: 'Downtown Food District',
    eventDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    participantIds: ['user1', 'user2', 'user8'],
    status: 'upcoming',
    latitude: 40.7505,
    longitude: -73.9934,
    category: 'food-rescue',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
];

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setEvents(mockEvents);
      setError(null);
    } catch (err) {
      setError('Failed to fetch events');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refresh = async () => {
    setRefreshing(true);
    await fetchEvents();
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const upcomingEvents = events.filter(event => event.status === 'upcoming');
  const nearbyEvents = events.filter(event => 
    event.latitude && event.longitude && event.status === 'upcoming'
  );

  return {
    events,
    upcomingEvents,
    nearbyEvents,
    loading,
    refreshing,
    error,
    refresh,
  };
}

export function useUserEvents() {
  const [userEvents, setUserEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserEvents = async () => {
    try {
      // Simulate API call for user's events
      await new Promise(resolve => setTimeout(resolve, 800));
      // Return events where user is organizer or participant
      const userEventsData = mockEvents.filter(event => 
        event.organizerId === 'user1' || event.participantIds.includes('user1')
      );
      setUserEvents(userEventsData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch user events');
      console.error('Error fetching user events:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refresh = async () => {
    setRefreshing(true);
    await fetchUserEvents();
  };

  useEffect(() => {
    fetchUserEvents();
  }, []);

  return {
    userEvents,
    loading,
    refreshing,
    error,
    refresh,
  };
}
