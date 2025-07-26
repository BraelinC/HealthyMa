import { db } from './server/db.ts';
import { profiles } from './shared/schema.ts';
import { eq } from 'drizzle-orm';

async function resetUser() {
  try {
    console.log('🔄 Resetting user data...');
    
    // Delete all profiles for user ID 1 (assuming you're user 1)
    const result = await db.delete(profiles).where(eq(profiles.user_id, 1));
    console.log('✅ Profile deleted for user 1');
    
    console.log('✨ ACCOUNT RESET COMPLETE!');
    console.log('You can now create a fresh profile with the questionnaire.');
    console.log('\nNext steps:');
    console.log('1. Refresh the page');
    console.log('2. Go to the Profile page');
    console.log('3. Click "Create Profile"');
    console.log('4. Choose Individual or Family');
    console.log('5. Complete the questionnaire');
    console.log('6. Fill in your profile details');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

resetUser();