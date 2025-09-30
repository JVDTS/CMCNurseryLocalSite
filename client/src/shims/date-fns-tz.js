// Minimal shim for date-fns-tz without circular dependencies
import { format as dfFormat } from 'date-fns';

let toZonedTimeFn;
let formatInTimeZoneFn;

try {
  toZonedTimeFn = require('date-fns-tz').toZonedTime;
} catch (e) {
  toZonedTimeFn = undefined;
}

try {
  formatInTimeZoneFn = require('date-fns-tz').formatInTimeZone;
} catch (e) {
  formatInTimeZoneFn = undefined;
}

export function utcToZonedTime(date, timeZone) {
  if (typeof toZonedTimeFn === 'function') return toZonedTimeFn(date, timeZone);
  return new Date(date);
}

export function format(date, fmt, options) {
  if (typeof formatInTimeZoneFn === 'function' && options?.timeZone) {
    return formatInTimeZoneFn(date, options.timeZone, fmt);
  }
  return dfFormat(date, fmt);
}
