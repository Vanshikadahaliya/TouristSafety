import { supabase } from './supabase';

export interface SharedLocation {
  id?: string;
  user_email: string;
  latitude: number;
  longitude: number;
  shared_at?: string;
  message?: string;
}

class LocationSharingService {
  private async ensureTableExists(): Promise<boolean> {
    try {
      // Check if table exists by trying a simple query
      const { data, error } = await supabase
        .from('shared_locations')
        .select('id')
        .limit(1);

      if (error && error.message.includes('does not exist')) {
        console.log('⚠️ shared_locations table does not exist.');
        console.log('📋 Please create the table in your Supabase dashboard using the SQL script.');
        console.log('🔗 You can find the SQL script in: database/shared_locations.sql');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error checking table:', error);
      return false;
    }
  }

  async shareLocation(userEmail: string, latitude: number, longitude: number, message?: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Ensure table exists first
      const tableExists = await this.ensureTableExists();
      if (!tableExists) {
        return { success: false, error: 'Location sharing feature is not set up yet. Please check the database configuration.' };
      }

      const { data, error } = await supabase
        .from('shared_locations')
        .insert([
          {
            user_email: userEmail,
            latitude,
            longitude,
            message: message || 'Shared location',
            shared_at: new Date().toISOString()
          }
        ]);

      if (error) {
        console.error('Error sharing location:', error);
        return { success: false, error: error.message };
      }

      console.log('Location shared successfully:', data);
      return { success: true };
    } catch (error) {
      console.error('Unexpected error sharing location:', error);
      return { success: false, error: 'Failed to share location' };
    }
  }

  async getSharedLocations(): Promise<{ success: boolean; data?: SharedLocation[]; error?: string }> {
    try {
      // Ensure table exists first
      const tableExists = await this.ensureTableExists();
      if (!tableExists) {
        return { success: true, data: [] }; // Return empty array if table doesn't exist yet
      }

      const { data, error } = await supabase
        .from('shared_locations')
        .select('*')
        .order('shared_at', { ascending: false })
        .limit(50); // Limit to recent 50 locations

      if (error) {
        console.error('Error fetching shared locations:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Unexpected error fetching shared locations:', error);
      return { success: false, error: 'Failed to fetch shared locations' };
    }
  }

  async deleteSharedLocation(id: string, userEmail: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('shared_locations')
        .delete()
        .eq('id', id)
        .eq('user_email', userEmail); // Only allow users to delete their own locations

      if (error) {
        console.error('Error deleting shared location:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Unexpected error deleting shared location:', error);
      return { success: false, error: 'Failed to delete shared location' };
    }
  }
}

export const locationSharingService = new LocationSharingService();
