import stableStringify from 'json-stable-stringify';
import { createHash } from 'crypto';

export function hashObject(obj: unknown): string {
  const s = stableStringify(obj);
  if (!s) return '';
  return createHash('sha256').update(s).digest('hex');
}
