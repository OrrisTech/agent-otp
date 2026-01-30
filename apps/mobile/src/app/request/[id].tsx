/**
 * Request Details Screen
 *
 * Shows detailed information about an OTP request
 * and allows user to approve/deny the request.
 */

import React, { useCallback, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { usePendingRequests, useStore } from '@/hooks/useStore';
import { approveRequest, denyRequest } from '@/services/api';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function RequestDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const pendingRequests = usePendingRequests();
  const removePendingRequest = useStore((state) => state.removePendingRequest);

  const [isApproving, setIsApproving] = useState(false);
  const [isDenying, setIsDenying] = useState(false);

  // Animation values for buttons
  const approveScale = useSharedValue(1);
  const denyScale = useSharedValue(1);

  // Find the request
  const request = useMemo(
    () => pendingRequests.find((r) => r.id === id),
    [pendingRequests, id]
  );

  // Calculate time remaining
  const timeRemaining = useMemo(() => {
    if (!request) return null;
    const expiresAt = new Date(request.expiresAt);
    const now = new Date();
    const seconds = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, [request]);

  // Animated styles for buttons
  const approveAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: approveScale.value }],
  }));

  const denyAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: denyScale.value }],
  }));

  // Handle approve
  const handleApprove = useCallback(async () => {
    if (!request) return;

    setIsApproving(true);
    try {
      await approveRequest(request.id);
      removePendingRequest(request.id);
      Alert.alert('Approved', 'OTP request approved. Waiting for OTP...', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('[RequestDetails] Failed to approve:', error);
      Alert.alert('Error', 'Failed to approve request. Please try again.');
    } finally {
      setIsApproving(false);
    }
  }, [request, removePendingRequest, router]);

  // Handle deny
  const handleDeny = useCallback(async () => {
    if (!request) return;

    Alert.alert(
      'Deny Request',
      'Are you sure you want to deny this OTP request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deny',
          style: 'destructive',
          onPress: async () => {
            setIsDenying(true);
            try {
              await denyRequest(request.id);
              removePendingRequest(request.id);
              router.back();
            } catch (error) {
              console.error('[RequestDetails] Failed to deny:', error);
              Alert.alert('Error', 'Failed to deny request. Please try again.');
            } finally {
              setIsDenying(false);
            }
          },
        },
      ]
    );
  }, [request, removePendingRequest, router]);

  // Button press handlers
  const handleApprovePressIn = useCallback(() => {
    approveScale.value = withSpring(0.95);
  }, [approveScale]);

  const handleApprovePressOut = useCallback(() => {
    approveScale.value = withSpring(1);
  }, [approveScale]);

  const handleDenyPressIn = useCallback(() => {
    denyScale.value = withSpring(0.95);
  }, [denyScale]);

  const handleDenyPressOut = useCallback(() => {
    denyScale.value = withSpring(1);
  }, [denyScale]);

  // Handle request not found
  if (!request) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Request not found</Text>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Status color
  const statusColor =
    request.status === 'approved'
      ? '#22c55e'
      : request.status === 'pending_approval'
        ? '#f59e0b'
        : '#6b7280';

  const isLoading = isApproving || isDenying;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Agent info */}
        <View style={styles.section}>
          <Text style={styles.agentName}>{request.agentName}</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={styles.statusText}>{request.status.replace('_', ' ')}</Text>
          </View>
        </View>

        {/* Reason */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Reason</Text>
          <Text style={styles.sectionValue}>{request.reason}</Text>
        </View>

        {/* Expected sender */}
        {request.expectedSender && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Expected From</Text>
            <Text style={styles.sectionValue}>{request.expectedSender}</Text>
          </View>
        )}

        {/* Filter info */}
        {request.filter && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Source Filter</Text>
            <View style={styles.filterTags}>
              {request.filter.sources?.map((source) => (
                <View key={source} style={styles.tag}>
                  <Text style={styles.tagText}>{source.toUpperCase()}</Text>
                </View>
              ))}
              {request.filter.senderPattern && (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{request.filter.senderPattern}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Time remaining */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Time Remaining</Text>
          <Text style={[styles.sectionValue, styles.timeValue]}>{timeRemaining}</Text>
        </View>

        {/* Request ID */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Request ID</Text>
          <Text style={[styles.sectionValue, styles.monoText]}>{request.id}</Text>
        </View>
      </ScrollView>

      {/* Action buttons */}
      {request.status === 'pending_approval' && (
        <View style={styles.actions}>
          <AnimatedPressable
            style={[styles.button, styles.denyButton, denyAnimatedStyle]}
            onPress={handleDeny}
            onPressIn={handleDenyPressIn}
            onPressOut={handleDenyPressOut}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel="Deny request"
          >
            {isDenying ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Deny</Text>
            )}
          </AnimatedPressable>

          <AnimatedPressable
            style={[styles.button, styles.approveButton, approveAnimatedStyle]}
            onPress={handleApprove}
            onPressIn={handleApprovePressIn}
            onPressOut={handleApprovePressOut}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel="Approve request"
          >
            {isApproving ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Approve</Text>
            )}
          </AnimatedPressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  section: {
    marginBottom: 24,
  },
  agentName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#9ca3af',
    textTransform: 'capitalize',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  sectionValue: {
    fontSize: 16,
    color: '#ffffff',
    lineHeight: 24,
  },
  timeValue: {
    fontSize: 24,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  monoText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
  },
  filterTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#374151',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: {
    fontSize: 12,
    color: '#d1d5db',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    padding: 24,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#1f2937',
  },
  button: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  approveButton: {
    backgroundColor: '#22c55e',
  },
  denyButton: {
    backgroundColor: '#ef4444',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    fontSize: 18,
    color: '#9ca3af',
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#374151',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backButtonText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
});
