// src/utils/auth.js - Updated for Amplify v6
import { fetchAuthSession } from '@aws-amplify/auth';

// Get JWT token from Cognito
export const getAuthToken = async () => {
  try {
    const session = await fetchAuthSession();
    return session.tokens?.idToken?.toString();
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Create authenticated axios headers
export const getAuthHeaders = async () => {
  const token = await getAuthToken();
  return token ? {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  } : {
    'Content-Type': 'application/json'
  };
};

// Handle authentication errors
export const handleAuthError = (error) => {
  if (error.response?.status === 401 || error.response?.status === 403) {
    alert('Session expired. Please log in again.');
    window.location.reload();
  }
};