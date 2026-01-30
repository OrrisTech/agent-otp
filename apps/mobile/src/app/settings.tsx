/**
 * Settings Screen
 *
 * App settings and device management.
 */

import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  useConfig,
  useIsLinked,
  useConnectionStatus,
  useStore,
} from '@/hooks/useStore';
import { clearConfig, saveConfig, loadConfig } from '@/services/storage';

export default function SettingsScreen() {
  const router = useRouter();
  const config = useConfig();
  const isLinked = useIsLinked();
  const connectionStatus = useConnectionStatus();
  const setConfig = useStore((state) => state.setConfig);

  const [autoApprove, setAutoApprove] = useState(config?.autoApprove ?? false);

  // Handle auto-approve toggle
  const handleAutoApproveChange = useCallback(
    async (value: boolean) => {
      setAutoApprove(value);
      try {
        const existingConfig = await loadConfig();
        if (existingConfig) {
          const newConfig = { ...existingConfig, autoApprove: value };
          await saveConfig(newConfig);
          setConfig(newConfig);
        }
      } catch (error) {
        console.error('[Settings] Failed to save auto-approve:', error);
        setAutoApprove(!value); // Revert on error
      }
    },
    [setConfig]
  );

  // Handle unlink device
  const handleUnlink = useCallback(() => {
    Alert.alert(
      'Unlink Device',
      'Are you sure you want to unlink this device? You will stop receiving OTP requests.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unlink',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearConfig();
              setConfig(null);
              router.replace('/');
            } catch (error) {
              console.error('[Settings] Failed to unlink:', error);
              Alert.alert('Error', 'Failed to unlink device. Please try again.');
            }
          },
        },
      ]
    );
  }, [setConfig, router]);

  // Format last sync time
  const formatLastSync = useCallback(() => {
    if (!connectionStatus.lastSync) return 'Never';
    const date = connectionStatus.lastSync;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [connectionStatus.lastSync]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Device Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Device Status</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Linked</Text>
              <View style={styles.valueRow}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: isLinked ? '#22c55e' : '#ef4444' },
                  ]}
                />
                <Text style={styles.value}>{isLinked ? 'Yes' : 'No'}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.label}>Connected</Text>
              <View style={styles.valueRow}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: connectionStatus.isConnected ? '#22c55e' : '#ef4444' },
                  ]}
                />
                <Text style={styles.value}>
                  {connectionStatus.isConnected ? 'Yes' : 'No'}
                </Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.label}>Last Sync</Text>
              <Text style={styles.value}>{formatLastSync()}</Text>
            </View>
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.labelContainer}>
                <Text style={styles.label}>Auto-Approve Known Agents</Text>
                <Text style={styles.labelDescription}>
                  Automatically approve OTP requests from agents you've approved before.
                </Text>
              </View>
              <Switch
                value={autoApprove}
                onValueChange={handleAutoApproveChange}
                trackColor={{ false: '#374151', true: '#6366f1' }}
                thumbColor="#ffffff"
              />
            </View>
          </View>
        </View>

        {/* API Key Info */}
        {isLinked && config?.apiKey && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>API Key</Text>
            <View style={styles.card}>
              <Text style={styles.apiKey}>
                {config.apiKey.substring(0, 8)}...{config.apiKey.substring(config.apiKey.length - 4)}
              </Text>
              <Text style={styles.apiKeyHint}>
                Linked on {config.linkedAt?.toLocaleDateString() ?? 'Unknown'}
              </Text>
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          {isLinked ? (
            <Pressable style={styles.unlinkButton} onPress={handleUnlink}>
              <Text style={styles.unlinkButtonText}>Unlink Device</Text>
            </Pressable>
          ) : (
            <Pressable
              style={styles.linkButton}
              onPress={() => router.push('/link')}
            >
              <Text style={styles.linkButtonText}>Link Device</Text>
            </Pressable>
          )}
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Version</Text>
              <Text style={styles.value}>0.2.0</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.label}>Build</Text>
              <Text style={styles.value}>1</Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelContainer: {
    flex: 1,
    marginRight: 16,
  },
  label: {
    fontSize: 16,
    color: '#ffffff',
  },
  labelDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    lineHeight: 16,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  value: {
    fontSize: 16,
    color: '#9ca3af',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#374151',
    marginVertical: 12,
  },
  apiKey: {
    fontSize: 14,
    color: '#9ca3af',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  apiKeyHint: {
    fontSize: 12,
    color: '#6b7280',
  },
  unlinkButton: {
    backgroundColor: '#374151',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  unlinkButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
  linkButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  linkButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
