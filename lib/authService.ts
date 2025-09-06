import * as AuthSession from 'expo-auth-session';
import Constants from 'expo-constants';
import * as Crypto from 'expo-crypto';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from './supabase';

console.log(AuthSession.makeRedirectUri());

// Configure WebBrowser for auth session
WebBrowser.maybeCompleteAuthSession();

// Google OAuth configuration
const GOOGLE_CLIENT_ID = Constants.expoConfig?.extra?.googleWebClientId || process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
const GOOGLE_REDIRECT_URI = AuthSession.makeRedirectUri();

export const authService = {
  // Real Google Sign-In using Expo AuthSession
  async signInWithGoogle() {
    try {
      if (!GOOGLE_CLIENT_ID) {
        throw new Error('Google Client ID not configured');
      }

      // Generate a random code verifier
      const codeVerifier = await Crypto.getRandomBytesAsync(32);
      const codeVerifierString = codeVerifier.toString().replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

      // Create code challenge
      const codeChallenge = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        codeVerifierString,
        { encoding: Crypto.CryptoEncoding.BASE64 }
      );

      // Google OAuth request
      const request = new AuthSession.AuthRequest({
        clientId: GOOGLE_CLIENT_ID,
        scopes: ['openid', 'profile', 'email'],
        redirectUri: GOOGLE_REDIRECT_URI,
        responseType: AuthSession.ResponseType.Code,
        extraParams: {
          code_challenge: codeChallenge,
          code_challenge_method: 'S256',
        },
      });

      // Start the authentication flow
      const result = await request.promptAsync({
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      });

      if (result.type === 'success') {
        // Exchange the authorization code for tokens
        const tokenResponse = await AuthSession.exchangeCodeAsync(
          {
            clientId: GOOGLE_CLIENT_ID,
            code: result.params.code,
            redirectUri: GOOGLE_REDIRECT_URI,
            extraParams: {
              code_verifier: codeVerifierString,
            },
          },
          {
            tokenEndpoint: 'https://oauth2.googleapis.com/token',
          }
        );

        // Get user info from Google
        const userInfoResponse = await fetch(
          `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokenResponse.accessToken}`
        );
        const userInfo = await userInfoResponse.json();

        // Sign in to Supabase with Google
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: tokenResponse.idToken!,
        });

        if (error) {
          throw error;
        }

        return { data, error: null };
      } else {
        throw new Error('Authentication was cancelled or failed');
      }
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      return { data: null, error };
    }
  },

  // Sign up with Google (same as sign in for OAuth)
  async signUpWithGoogle() {
    return this.signInWithGoogle();
  },

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error };
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      return { user, error };
    } catch (error) {
      console.error('Get current user error:', error);
      return { user: null, error };
    }
  },

  // Check if user is signed in
  async isSignedIn() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return !!user;
    } catch (error) {
      console.error('Check sign in status error:', error);
      return false;
    }
  }
};