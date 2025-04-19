// Service account configuration for Google Cloud

/**
 * Get the service account configuration from environment variables
 * This can be used in server-side code to initialize Google Cloud services
 */
export function getServiceAccount() {
  // Check if service account is provided in environment variables
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && !process.env.VERTEX_AI_SERVICE_ACCOUNT) {
    throw new Error('Google Cloud service account credentials not found in environment variables');
  }
  
  // If GOOGLE_APPLICATION_CREDENTIALS is set, no need to do anything special
  // Google Cloud libraries will automatically use it
  
  // If VERTEX_AI_SERVICE_ACCOUNT is provided as a JSON string, parse it
  if (process.env.VERTEX_AI_SERVICE_ACCOUNT) {
    try {
      // Parse JSON string to object
      return JSON.parse(process.env.VERTEX_AI_SERVICE_ACCOUNT);
    } catch (error) {
      console.error('Error parsing VERTEX_AI_SERVICE_ACCOUNT:', error);
      throw new Error('Invalid VERTEX_AI_SERVICE_ACCOUNT format. Should be a valid JSON string.');
    }
  }
  
  // Return null if using GOOGLE_APPLICATION_CREDENTIALS file path
  return null;
}

/**
 * Set up Google Cloud authentication for use in API routes
 */
export async function authenticateGoogleCloud() {
  const { GoogleAuth } = await import('google-auth-library');
  
  const serviceAccount = getServiceAccount();
  
  if (serviceAccount) {
    // If we have a service account object, initialize auth with it
    const auth = new GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    
    return auth;
  } else {
    // Otherwise, use the default authentication method
    // This will use GOOGLE_APPLICATION_CREDENTIALS environment variable
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    
    return auth;
  }
}

/**
 * Get Google Cloud project ID
 */
export function getGoogleCloudProjectId(): string {
  if (!process.env.GOOGLE_CLOUD_PROJECT) {
    throw new Error('GOOGLE_CLOUD_PROJECT environment variable is not set');
  }
  
  return process.env.GOOGLE_CLOUD_PROJECT;
}

/**
 * Get Google Cloud location
 */
export function getGoogleCloudLocation(): string {
  return process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
} 