import { supabase } from './supabase';

export const authService = {
  // Mock Google Sign-In for testing (replace with real implementation later)
  async signInWithGoogle() {
    try {
      // For now, create a mock user for testing
      const mockUser = {
        id: 'mock-user-id',
        email: 'test@example.com',
        name: 'Test User'
      };
      
      // Simulate successful authentication
      return { 
        data: { user: mockUser }, 
        error: null 
      };
    } catch (error) {
      console.error('Mock Google Sign-In Error:', error);
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
      // Return mock user if no real user
      if (!user) {
        return { 
          user: { 
            id: 'mock-user-id', 
            email: 'test@example.com',
            name: 'Test User'
          }, 
          error: null 
        };
      }
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