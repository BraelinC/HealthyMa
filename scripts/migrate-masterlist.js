#!/usr/bin/env node

/**
 * Migration script to upgrade the cultural cuisine masterlist to v2
 * Run with: node scripts/migrate-masterlist.js
 */

const { migrateMasterlistToV2 } = require('../server/cuisineMasterlistMigration.js');

async function runMigration() {
  console.log('🚀 Starting cultural cuisine masterlist migration...');
  
  try {
    await migrateMasterlistToV2();
    console.log('✅ Migration completed successfully!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. Review the enhanced masterlist at client/src/data/cultural_cuisine_masterlist_v2.json');
    console.log('2. Test the NLP parser with the new metadata');
    console.log('3. Update application code to use the v2 format');
    console.log('4. Monitor performance improvements');
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  runMigration();
}

module.exports = { runMigration };