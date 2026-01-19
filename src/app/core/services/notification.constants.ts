/**
 * Notification timing constants.
 * Centralized configuration for toast notification durations.
 */

/** Default notification duration in milliseconds (3 seconds) */
export const NOTIFICATION_DEFAULT_LIFE = 3000;

/** Extended notification duration for validation/network errors (7 seconds) */
export const NOTIFICATION_EXTENDED_LIFE = 7000;

/** Medium notification duration for operation errors (5 seconds) */
export const NOTIFICATION_MEDIUM_LIFE = 5000;

/** Notification timing configuration object */
export const NOTIFICATION_TIMINGS = {
    default: NOTIFICATION_DEFAULT_LIFE,
    medium: NOTIFICATION_MEDIUM_LIFE,
    extended: NOTIFICATION_EXTENDED_LIFE
} as const;
