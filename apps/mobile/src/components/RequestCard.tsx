/**
 * OTP Request Card Component
 *
 * Displays a pending OTP request with animated interactions.
 * Following React Native performance best practices:
 * - Memoized component
 * - Reanimated for 60fps animations
 * - StyleSheet for optimized styles
 */

import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import type { OTPRequest } from '@/types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface RequestCardProps {
  request: OTPRequest;
  onPress: (request: OTPRequest) => void;
}

function RequestCardComponent({ request, onPress }: RequestCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.97);
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1);
  }, [scale]);

  const handlePress = useCallback(() => {
    onPress(request);
  }, [onPress, request]);

  // Calculate time remaining
  const expiresAt = new Date(request.expiresAt);
  const now = new Date();
  const secondsRemaining = Math.max(
    0,
    Math.floor((expiresAt.getTime() - now.getTime()) / 1000)
  );
  const minutesRemaining = Math.floor(secondsRemaining / 60);

  // Status indicator color
  const statusColor =
    request.status === 'approved'
      ? '#22c55e'
      : request.status === 'pending_approval'
        ? '#f59e0b'
        : '#6b7280';

  return (
    <AnimatedPressable
      style={[styles.card, animatedStyle]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityLabel={`OTP request from ${request.agentName}: ${request.reason}`}
    >
      {/* Status indicator */}
      <View style={[styles.statusDot, { backgroundColor: statusColor }]} />

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.agentName} numberOfLines={1}>
          {request.agentName}
        </Text>
        <Text style={styles.reason} numberOfLines={2}>
          {request.reason}
        </Text>

        {/* Metadata */}
        <View style={styles.metadata}>
          {request.expectedSender && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>
                From: {request.expectedSender}
              </Text>
            </View>
          )}
          <View style={styles.tag}>
            <Text style={styles.tagText}>
              {minutesRemaining}m remaining
            </Text>
          </View>
        </View>
      </View>

      {/* Arrow */}
      <Text style={styles.arrow}>›</Text>
    </AnimatedPressable>
  );
}

export const RequestCard = memo(RequestCardComponent);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  agentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  reason: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  metadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  tag: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#4b5563',
  },
  arrow: {
    fontSize: 24,
    color: '#9ca3af',
    marginLeft: 8,
  },
});
