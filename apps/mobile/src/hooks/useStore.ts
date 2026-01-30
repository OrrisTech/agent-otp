/**
 * Global state store using Zustand
 *
 * Following React Native best practices:
 * - Atomic state for minimal re-renders
 * - Separate selectors for each piece of state
 */

import { create } from 'zustand';
import type { OTPRequest, AppConfig, ConnectionStatus, SMSMessage } from '@/types';

interface AppState {
  // Configuration
  config: AppConfig | null;
  setConfig: (config: AppConfig | null) => void;

  // Connection status
  connectionStatus: ConnectionStatus;
  setConnectionStatus: (status: Partial<ConnectionStatus>) => void;

  // Pending OTP requests
  pendingRequests: OTPRequest[];
  setPendingRequests: (requests: OTPRequest[]) => void;
  addPendingRequest: (request: OTPRequest) => void;
  removePendingRequest: (requestId: string) => void;

  // Recent SMS messages
  recentSMS: SMSMessage[];
  addSMS: (sms: SMSMessage) => void;
  clearSMS: () => void;

  // UI state
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

export const useStore = create<AppState>((set) => ({
  // Configuration
  config: null,
  setConfig: (config) => set({ config }),

  // Connection status
  connectionStatus: {
    isConnected: false,
    lastSync: null,
    pendingRequests: 0,
  },
  setConnectionStatus: (status) =>
    set((state) => ({
      connectionStatus: { ...state.connectionStatus, ...status },
    })),

  // Pending OTP requests
  pendingRequests: [],
  setPendingRequests: (requests) =>
    set({
      pendingRequests: requests,
      connectionStatus: {
        isConnected: true,
        lastSync: new Date(),
        pendingRequests: requests.length,
      },
    }),
  addPendingRequest: (request) =>
    set((state) => ({
      pendingRequests: [...state.pendingRequests, request],
    })),
  removePendingRequest: (requestId) =>
    set((state) => ({
      pendingRequests: state.pendingRequests.filter((r) => r.id !== requestId),
    })),

  // Recent SMS messages
  recentSMS: [],
  addSMS: (sms) =>
    set((state) => ({
      recentSMS: [sms, ...state.recentSMS].slice(0, 50), // Keep last 50
    })),
  clearSMS: () => set({ recentSMS: [] }),

  // UI state
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),
  error: null,
  setError: (error) => set({ error }),
}));

// Selectors for minimal re-renders
export const useConfig = () => useStore((state) => state.config);
export const useIsLinked = () => useStore((state) => state.config?.isLinked ?? false);
export const useConnectionStatus = () => useStore((state) => state.connectionStatus);
export const usePendingRequests = () => useStore((state) => state.pendingRequests);
export const usePendingCount = () => useStore((state) => state.pendingRequests.length);
export const useRecentSMS = () => useStore((state) => state.recentSMS);
export const useIsLoading = () => useStore((state) => state.isLoading);
export const useError = () => useStore((state) => state.error);
