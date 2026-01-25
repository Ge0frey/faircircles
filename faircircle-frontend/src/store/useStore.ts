import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FairScoreResponse, Circle } from '../types';

// Cache TTL in milliseconds (5 minutes)
const FAIRSCORE_CACHE_TTL = 5 * 60 * 1000;

interface AppState {
  // FairScore with caching
  fairScore: FairScoreResponse | null;
  fairScoreLoading: boolean;
  fairScoreError: string | null;
  fairScoreLastFetched: number | null; // Timestamp of last successful fetch
  fairScoreWallet: string | null; // Wallet address the score belongs to
  setFairScore: (score: FairScoreResponse | null, wallet?: string) => void;
  setFairScoreLoading: (loading: boolean) => void;
  setFairScoreError: (error: string | null) => void;
  clearFairScoreError: () => void;
  isFairScoreCacheValid: (wallet: string) => boolean;

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

  // Hidden/dismissed completed circles (persisted)
  hiddenCircles: string[]; // Array of circle addresses (base58)
  hideCircle: (address: string) => void;
  unhideCircle: (address: string) => void;
  isCircleHidden: (address: string) => boolean;

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

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // FairScore with caching
      fairScore: null,
      fairScoreLoading: false,
      fairScoreError: null,
      fairScoreLastFetched: null,
      fairScoreWallet: null,
      setFairScore: (score, wallet) => set({ 
        fairScore: score,
        fairScoreLastFetched: score ? Date.now() : null,
        fairScoreWallet: wallet || null,
        fairScoreError: null, // Clear error on successful fetch
      }),
      setFairScoreLoading: (loading) => set({ fairScoreLoading: loading }),
      setFairScoreError: (error) => set({ fairScoreError: error }),
      clearFairScoreError: () => set({ fairScoreError: null }),
      isFairScoreCacheValid: (wallet: string) => {
        const state = get();
        // Cache is valid if:
        // 1. We have a score
        // 2. The wallet matches
        // 3. The cache hasn't expired
        if (!state.fairScore || !state.fairScoreLastFetched) return false;
        if (state.fairScoreWallet !== wallet) return false;
        return Date.now() - state.fairScoreLastFetched < FAIRSCORE_CACHE_TTL;
      },

      // Circles
      circles: [],
      userCircles: [],
      selectedCircle: null,
      circlesLoading: false,
      setCircles: (circles) => set({ circles }),
      setUserCircles: (userCircles) => set({ userCircles }),
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

      // Hidden/dismissed completed circles
      hiddenCircles: [],
      hideCircle: (address) => set((state) => ({
        hiddenCircles: [...new Set([...state.hiddenCircles, address])],
      })),
      unhideCircle: (address) => set((state) => ({
        hiddenCircles: state.hiddenCircles.filter((a) => a !== address),
      })),
      isCircleHidden: (address) => get().hiddenCircles.includes(address),

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
    }),
    {
      name: 'faircircles-storage',
      // Only persist hidden circles to localStorage
      partialize: (state) => ({ hiddenCircles: state.hiddenCircles }),
    }
  )
);
