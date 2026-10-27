// Build-time settings. The API runs on the home server; set EXPO_PUBLIC_API_URL in apps/mobile/.env.local.
// 10.0.2.2 is the host machine as seen from the Android emulator.
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8080';
