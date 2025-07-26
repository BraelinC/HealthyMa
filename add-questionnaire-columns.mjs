import { db } from './server/db.ts';
import { sql } from 'drizzle-orm';

async function addQuestionnaireColumns() {
  try {
    console.log('🔄 Adding questionnaire columns to profiles table...');
    
    // Add questionnaire_answers column
    await db.execute(sql`
      ALTER TABLE profiles 
      ADD COLUMN IF NOT EXISTS questionnaire_answers JSON DEFAULT '{}'
    `);
    
    // Add questionnaire_selections column  
    await db.execute(sql`
      ALTER TABLE profiles 
      ADD COLUMN IF NOT EXISTS questionnaire_selections JSON DEFAULT '[]'
    `);
    
    console.log('✅ Successfully added questionnaire columns!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding questionnaire columns:', error);
    process.exit(1);
  }
}

addQuestionnaireColumns();