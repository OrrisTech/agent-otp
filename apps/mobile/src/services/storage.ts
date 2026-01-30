/**
 * Secure storage service using expo-secure-store
 *
 * Uses Keychain on iOS and EncryptedSharedPreferences on Android
 * for secure storage of sensitive data.
 */

import * as SecureStore from 'expo-secure-store';
import type { AppConfig } from '@/types';

const KEYS = {
  API_URL: 'agent_otp_api_url',
  API_KEY: 'agent_otp_api_key',
  DEVICE_ID: 'agent_otp_device_id',
  USER_ID: 'agent_otp_user_id',
  IS_LINKED: 'agent_otp_is_linked',
  LINKED_AT: 'agent_otp_linked_at',
  AUTO_APPROVE: 'agent_otp_auto_approve',
} as const;

/**
 * Save a value to secure storage
 */
async function setItem(key: string, value: string): Promise<void> {
  await SecureStore.setItemAsync(key, value);
}

/**
 * Get a value from secure storage
 */
async function getItem(key: string): Promise<string | null> {
  return SecureStore.getItemAsync(key);
}

/**
 * Delete a value from secure storage
 */
async function deleteItem(key: string): Promise<void> {
  await SecureStore.deleteItemAsync(key);
}

/**
 * Save app configuration
 */
export async function saveConfig(config: Partial<AppConfig>): Promise<void> {
  const promises: Promise<void>[] = [];

  if (config.apiUrl !== undefined) {
    promises.push(setItem(KEYS.API_URL, config.apiUrl));
  }
  if (config.apiKey !== undefined) {
    promises.push(setItem(KEYS.API_KEY, config.apiKey));
  }
  if (config.deviceId !== undefined) {
    promises.push(setItem(KEYS.DEVICE_ID, config.deviceId));
  }
  if (config.userId !== undefined) {
    promises.push(setItem(KEYS.USER_ID, config.userId));
  }
  if (config.isLinked !== undefined) {
    promises.push(setItem(KEYS.IS_LINKED, String(config.isLinked)));
  }
  if (config.linkedAt !== undefined) {
    promises.push(setItem(KEYS.LINKED_AT, config.linkedAt.toISOString()));
  }
  if (config.autoApprove !== undefined) {
    promises.push(setItem(KEYS.AUTO_APPROVE, String(config.autoApprove)));
  }

  await Promise.all(promises);
}

/**
 * Load app configuration
 */
export async function loadConfig(): Promise<AppConfig | null> {
  const [apiUrl, apiKey, deviceId, userId, isLinked, linkedAt, autoApprove] = await Promise.all([
    getItem(KEYS.API_URL),
    getItem(KEYS.API_KEY),
    getItem(KEYS.DEVICE_ID),
    getItem(KEYS.USER_ID),
    getItem(KEYS.IS_LINKED),
    getItem(KEYS.LINKED_AT),
    getItem(KEYS.AUTO_APPROVE),
  ]);

  if (!apiUrl || !apiKey || !deviceId) {
    return null;
  }

  return {
    apiUrl,
    apiKey,
    deviceId,
    userId: userId ?? undefined,
    isLinked: isLinked === 'true',
    linkedAt: linkedAt ? new Date(linkedAt) : undefined,
    autoApprove: autoApprove === 'true',
  };
}

/**
 * Clear all stored configuration
 */
export async function clearConfig(): Promise<void> {
  await Promise.all([
    deleteItem(KEYS.API_URL),
    deleteItem(KEYS.API_KEY),
    deleteItem(KEYS.DEVICE_ID),
    deleteItem(KEYS.USER_ID),
    deleteItem(KEYS.IS_LINKED),
    deleteItem(KEYS.LINKED_AT),
    deleteItem(KEYS.AUTO_APPROVE),
  ]);
}

/**
 * Check if the app is configured
 */
export async function isConfigured(): Promise<boolean> {
  const config = await loadConfig();
  return config !== null && config.isLinked;
}
