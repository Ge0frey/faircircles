import { create } from 'zustand';
import type { FairScoreResponse, Circle } from '../types';

interface AppState {
  // FairScore
  fairScore: FairScoreResponse | null;
  fairScoreLoading: boolean;
  fairScoreError: string | null;
  setFairScore: (score: FairScoreResponse | null) => void;
  setFairScoreLoading: (loading: boolean) => void;
  setFairScoreError: (error: string | null) => void;

  // Circles
  circles: Circle[];
  userCircles: Circle[];
  selectedCircle: Circle | null;
  circlesLoading: boolean;
  setCircles: (circles: Circle[]) => void;
  setUserCircles: (circles: Circle[]) => void;
  setSelectedCircle: (circle: Circle | null) => void;
  setCirclesLoading: (loading: boolean) => void;
  addCircle: (circle: Circle) => void;
  updateCircle: (circle: Circle) => void;

  // UI State
  activeTab: 'discover' | 'my-circles' | 'create';
  setActiveTab: (tab: 'discover' | 'my-circles' | 'create') => void;
  
  // Notifications
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

export const useStore = create<AppState>((set) => ({
  // FairScore
  fairScore: null,
  fairScoreLoading: false,
  fairScoreError: null,
  setFairScore: (score) => set({ fairScore: score }),
  setFairScoreLoading: (loading) => set({ fairScoreLoading: loading }),
  setFairScoreError: (error) => set({ fairScoreError: error }),

  // Circles
  circles: [],
  userCircles: [],
  selectedCircle: null,
  circlesLoading: false,
  setCircles: (circles) => set({ circles }),
  setUserCircles: (circles) => set({ userCircles }),
  setSelectedCircle: (circle) => set({ selectedCircle: circle }),
  setCirclesLoading: (loading) => set({ circlesLoading: loading }),
  addCircle: (circle) => set((state) => ({ circles: [...state.circles, circle] })),
  updateCircle: (circle) => set((state) => ({
    circles: state.circles.map((c) => 
      c.address.equals(circle.address) ? circle : c
    ),
    userCircles: state.userCircles.map((c) => 
      c.address.equals(circle.address) ? circle : c
    ),
  })),

  // UI State
  activeTab: 'discover',
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Notifications
  notifications: [],
  addNotification: (notification) => set((state) => ({
    notifications: [
      ...state.notifications,
      { ...notification, id: Date.now().toString() },
    ],
  })),
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter((n) => n.id !== id),
  })),
}));
