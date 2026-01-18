/**
 * Centralized messages constants for i18n preparation.
 * This file consolidates UI strings for easier localization in the future.
 */

/** Error messages displayed to users */
export const MESSAGES = {
    ERRORS: {
        GENERAL: 'An error occurred. Please try again.',
        NETWORK: 'Network error. Please check your connection.',
        UNAUTHORIZED: 'Session expired. Please log in again.',
        NOT_FOUND: 'The requested resource was not found.',
        SERVER: 'Server error. Please try again later.',
        FORBIDDEN: 'You do not have permission to perform this action.'
    },
    SUCCESS: {
        SAVED: 'Changes saved successfully.',
        DELETED: 'Item deleted successfully.',
        CREATED: 'Item created successfully.',
        UPDATED: 'Item updated successfully.',
        COPIED: 'Copied to clipboard.'
    },
    VALIDATION: {
        REQUIRED: 'This field is required.',
        EMAIL_INVALID: 'Please enter a valid email address.',
        PASSWORD_MIN: 'Password must be at least 8 characters.',
        PASSWORDS_MISMATCH: 'Passwords do not match.',
        INVALID_FORMAT: 'Invalid format. Please check your input.'
    },
    CONFIRMATION: {
        DELETE: 'Are you sure you want to delete this item?',
        UNSAVED_CHANGES: 'You have unsaved changes. Are you sure you want to leave?',
        LOGOUT: 'Are you sure you want to log out?'
    },
    LOADING: {
        DEFAULT: 'Loading...',
        SAVING: 'Saving...',
        PROCESSING: 'Processing...'
    },
    EMPTY_STATE: {
        NO_DATA: 'No data available.',
        NO_RESULTS: 'No results found.',
        NO_ITEMS: 'No items to display.'
    }
} as const;

/** Type helpers for using messages with TypeScript */
export type MessageCategory = keyof typeof MESSAGES;
export type ErrorMessages = typeof MESSAGES.ERRORS;
export type SuccessMessages = typeof MESSAGES.SUCCESS;
export type ValidationMessages = typeof MESSAGES.VALIDATION;
