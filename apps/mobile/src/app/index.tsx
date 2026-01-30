/**
 * Home Screen
 *
 * Main screen showing pending OTP requests and status.
 * Uses FlashList for optimized list rendering.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { StatusBanner } from '@/components/StatusBanner';
import { RequestCard } from '@/components/RequestCard';
import { EmptyState } from '@/components/EmptyState';
import {
  useIsLinked,
  usePendingRequests,
  useStore,
} from '@/hooks/useStore';
import { fetchPendingRequests } from '@/services/api';
import { MockSMSListener, matchSMSToRequest } from '@/services/sms';
import type { OTPRequest } from '@/types';

// Mock SMS listener for development
const smsListener = new MockSMSListener();

export default function HomeScreen() {
  const router = useRouter();
  const isLinked = useIsLinked();
  const pendingRequests = usePendingRequests();
  const setPendingRequests = useStore((state) => state.setPendingRequests);
  const addSMS = useStore((state) => state.addSMS);
  const setError = useStore((state) => state.setError);

  const [refreshing, setRefreshing] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Fetch pending requests
  const fetchRequests = useCallback(async () => {
    if (!isLinked) return;

    try {
      const requests = await fetchPendingRequests();
      setPendingRequests(requests);
    } catch (error) {
      console.error('[HomeScreen] Failed to fetch requests:', error);
      setError('Failed to fetch pending requests');
    }
  }, [isLinked, setPendingRequests, setError]);

  // Pull to refresh handler
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRequests();
    setRefreshing(false);
  }, [fetchRequests]);

  // Navigate to request details
  const handleRequestPress = useCallback(
    (request: OTPRequest) => {
      router.push(`/request/${request.id}`);
    },
    [router]
  );

  // Navigate to link screen
  const handleLinkDevice = useCallback(() => {
    router.push('/link');
  }, [router]);

  // Navigate to settings
  const handleSettings = useCallback(() => {
    router.push('/settings');
  }, [router]);

  // Initialize SMS listener
  useEffect(() => {
    if (!isLinked) return;

    // Start listening for SMS
    smsListener.start((sms) => {
      addSMS(sms);

      // Check if SMS matches any pending request
      const match = matchSMSToRequest(sms, pendingRequests);
      if (match) {
        console.log('[HomeScreen] SMS matched request:', match.request.id);
        // TODO: Handle matched OTP (encrypt and send to API)
      }
    });

    setIsListening(true);

    return () => {
      smsListener.stop();
      setIsListening(false);
    };
  }, [isLinked, pendingRequests, addSMS]);

  // Fetch requests on mount and periodically
  useEffect(() => {
    if (!isLinked) return;

    fetchRequests();

    // Poll for new requests every 30 seconds
    const interval = setInterval(fetchRequests, 30000);
    return () => clearInterval(interval);
  }, [isLinked, fetchRequests]);

  // Render list item
  const renderItem = useCallback(
    ({ item }: { item: OTPRequest }) => (
      <RequestCard request={item} onPress={handleRequestPress} />
    ),
    [handleRequestPress]
  );

  // Key extractor for FlashList
  const keyExtractor = useCallback((item: OTPRequest) => item.id, []);

  // Render empty state
  const renderEmptyComponent = useCallback(
    () => (
      <EmptyState
        title={isLinked ? 'No Pending Requests' : 'Device Not Linked'}
        description={
          isLinked
            ? 'When AI agents request OTP codes, they will appear here.'
            : 'Link your device to start receiving OTP requests from AI agents.'
        }
        actionLabel={isLinked ? undefined : 'Link Device'}
        onAction={isLinked ? undefined : handleLinkDevice}
      />
    ),
    [isLinked, handleLinkDevice]
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header actions */}
      <View style={styles.header}>
        <Pressable
          style={styles.headerButton}
          onPress={handleSettings}
          accessibilityRole="button"
          accessibilityLabel="Settings"
        >
          <Text style={styles.headerButtonText}>⚙️</Text>
        </Pressable>
      </View>

      {/* Status banner */}
      <StatusBanner isListening={isListening} />

      {/* Request list */}
      <View style={styles.listContainer}>
        <FlashList
          data={pendingRequests}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          estimatedItemSize={120}
          ListEmptyComponent={renderEmptyComponent}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#6366f1"
              colors={['#6366f1']}
            />
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: '#1f2937',
  },
  headerButtonText: {
    fontSize: 20,
  },
  listContainer: {
    flex: 1,
    marginTop: 8,
  },
  listContent: {
    paddingBottom: 24,
  },
});
