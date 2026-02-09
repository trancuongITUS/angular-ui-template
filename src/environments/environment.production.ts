/**
 * Production environment configuration.
 * This configuration is used when running `ng build --configuration production`.
 */
import { Environment } from './environment.interface';

export const environment: Environment = {
    production: true,
    apiUrl: 'https://api.yourcompany.com/api/v1',
    appName: 'HRM Frontend (Prod)',
    version: '1.0.0',
    enableDebugTools: false,
    logLevel: 'error',
    features: {
        analytics: true,
        errorTracking: true
    }
};
