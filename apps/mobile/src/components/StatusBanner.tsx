/**
 * Status Banner Component
 *
 * Shows connection status and SMS listener state.
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useConnectionStatus, usePendingCount } from '@/hooks/useStore';

interface StatusBannerProps {
  isListening: boolean;
}

function StatusBannerComponent({ isListening }: StatusBannerProps) {
  const status = useConnectionStatus();
  const pendingCount = usePendingCount();

  const getStatusColor = () => {
    if (!status.isConnected) return '#ef4444'; // Red
    if (!isListening) return '#f59e0b'; // Yellow
    return '#22c55e'; // Green
  };

  const getStatusText = () => {
    if (!status.isConnected) return 'Disconnected';
    if (!isListening) return 'SMS Listener Off';
    return 'Listening for OTPs';
  };

  return (
    <View style={styles.container}>
      {/* Status indicator */}
      <View style={styles.statusRow}>
        <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
        <Text style={styles.statusText}>{getStatusText()}</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{pendingCount}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {status.lastSync
              ? formatTime(status.lastSync)
              : '--'}
          </Text>
          <Text style={styles.statLabel}>Last Sync</Text>
        </View>
      </View>
    </View>
  );
}

function formatTime(date: Date): string {
  const now = new Date();
  const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSeconds < 60) return 'Just now';
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
  return `${Math.floor(diffSeconds / 86400)}d ago`;
}

export const StatusBanner = memo(StatusBannerComponent);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1f2937',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#374151',
  },
});
