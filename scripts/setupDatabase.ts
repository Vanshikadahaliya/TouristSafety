import { supabase } from '../lib/supabase';

/**
 * Setup script to create the shared_locations table in Supabase
 * Run this script once to set up the database table for location sharing
 */
async function setupDatabase() {
  console.log('🚀 Setting up Tourist Safety database...');

  try {
    // Create the shared_locations table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS shared_locations (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_email TEXT NOT NULL,
        latitude DOUBLE PRECISION NOT NULL,
        longitude DOUBLE PRECISION NOT NULL,
        message TEXT DEFAULT 'Shared location',
        shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    console.log('📋 Creating shared_locations table...');
    const { error: tableError } = await supabase.rpc('exec_sql', { 
      sql: createTableSQL 
    });

    if (tableError && !tableError.message.includes('already exists')) {
      throw tableError;
    }

    // Create indexes
    console.log('🔍 Creating indexes...');
    const indexSQL = `
      CREATE INDEX IF NOT EXISTS idx_shared_locations_shared_at ON shared_locations(shared_at DESC);
      CREATE INDEX IF NOT EXISTS idx_shared_locations_user_email ON shared_locations(user_email);
    `;

    const { error: indexError } = await supabase.rpc('exec_sql', { 
      sql: indexSQL 
    });

    if (indexError) {
      console.warn('⚠️ Warning: Could not create indexes:', indexError.message);
    }

    // Enable RLS
    console.log('🔒 Setting up Row Level Security...');
    const rlsSQL = `
      ALTER TABLE shared_locations ENABLE ROW LEVEL SECURITY;
      
      DROP POLICY IF EXISTS "Allow read access to all users" ON shared_locations;
      CREATE POLICY "Allow read access to all users" ON shared_locations
        FOR SELECT USING (true);
      
      DROP POLICY IF EXISTS "Allow users to share their own locations" ON shared_locations;
      CREATE POLICY "Allow users to share their own locations" ON shared_locations
        FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = user_email);
      
      DROP POLICY IF EXISTS "Allow users to delete their own locations" ON shared_locations;
      CREATE POLICY "Allow users to delete their own locations" ON shared_locations
        FOR DELETE USING (auth.jwt() ->> 'email' = user_email);
    `;

    const { error: rlsError } = await supabase.rpc('exec_sql', { 
      sql: rlsSQL 
    });

    if (rlsError) {
      console.warn('⚠️ Warning: Could not set up RLS policies:', rlsError.message);
    }

    // Test the table
    console.log('🧪 Testing table access...');
    const { data, error: testError } = await supabase
      .from('shared_locations')
      .select('*')
      .limit(1);

    if (testError) {
      throw testError;
    }

    console.log('✅ Database setup completed successfully!');
    console.log('📊 Table is ready for location sharing.');
    
    return { success: true };

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    console.log('\n📝 Manual Setup Instructions:');
    console.log('1. Go to your Supabase Dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Run the SQL script from: database/shared_locations.sql');
    
    return { success: false, error };
  }
}

// Export for use in app
export { setupDatabase };

// Run if called directly
if (require.main === module) {
  setupDatabase().then(result => {
    process.exit(result.success ? 0 : 1);
  });
}
