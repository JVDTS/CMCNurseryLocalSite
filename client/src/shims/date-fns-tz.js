// Minimal shim for date-fns-tz
import { format as dfFormat } from 'date-fns';

let toZonedTimeFn = null;
let formatInTimeZoneFn = null;

try {
  // prefer the package's ESM entrypoints if available
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  toZonedTimeFn = require('date-fns-tz/dist/esm/toZonedTime/index.js').toZonedTime;
} catch (e) {
  try {
    toZonedTimeFn = require('date-fns-tz').toZonedTime;
  } catch (e) {
    // leave null
  }
}

try {
  formatInTimeZoneFn = require('date-fns-tz/dist/esm/formatInTimeZone/index.js').formatInTimeZone;
} catch (e) {
  try {
    formatInTimeZoneFn = require('date-fns-tz').formatInTimeZone;
  } catch (e) {
    // leave null
  }
}

export function utcToZonedTime(date, timeZone) {
  if (toZonedTimeFn) return toZonedTimeFn(date, timeZone);
  // best-effort fallback: return Date (no TZ conversion)
  return new Date(date);
}

export function format(date, fmt, options) {
  if (formatInTimeZoneFn) return formatInTimeZoneFn(date, options?.timeZone || 'UTC', fmt);
  return dfFormat(date, fmt);
}
