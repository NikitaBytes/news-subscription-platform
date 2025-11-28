/**
 * Browser Fingerprinting для защиты Refresh Token
 * Генерирует уникальный идентификатор браузера на основе его характеристик
 */

/**
 * Генерирует fingerprint браузера
 */
async function generateFingerprint(): Promise<string> {
  const components: string[] = [];

  // User Agent
  components.push(navigator.userAgent);

  // Screen resolution
  components.push(`${screen.width}x${screen.height}x${screen.colorDepth}`);

  // Timezone
  components.push(Intl.DateTimeFormat().resolvedOptions().timeZone);

  // Language
  components.push(navigator.language);

  // Platform
  components.push(navigator.platform);

  // Hardware concurrency (CPU cores)
  components.push(String(navigator.hardwareConcurrency || 0));

  // Canvas fingerprint (простая версия)
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('fingerprint', 2, 2);
      components.push(canvas.toDataURL());
    }
  } catch (e) {
    // Canvas может быть заблокирован
    components.push('canvas-blocked');
  }

  // Объединяем все компоненты
  const fingerprintString = components.join('|');

  // Хешируем с помощью SubtleCrypto API
  const encoder = new TextEncoder();
  const data = encoder.encode(fingerprintString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashBase64 = btoa(String.fromCharCode(...hashArray));

  return hashBase64;
}

/**
 * Получает или создает fingerprint (с кешированием в localStorage)
 */
const FINGERPRINT_KEY = 'device_fingerprint';
let cachedFingerprint: string | null = null;

export async function getOrCreateFingerprint(): Promise<string> {
  // 1. Try memory cache
  if (cachedFingerprint) {
    return cachedFingerprint;
  }

  // 2. Try localStorage
  const storedFingerprint = localStorage.getItem(FINGERPRINT_KEY);
  if (storedFingerprint) {
    cachedFingerprint = storedFingerprint;
    return storedFingerprint;
  }

  // 3. Generate new
  const newFingerprint = await generateFingerprint();
  
  // Save to cache and localStorage
  cachedFingerprint = newFingerprint;
  localStorage.setItem(FINGERPRINT_KEY, newFingerprint);
  
  return newFingerprint;
}
