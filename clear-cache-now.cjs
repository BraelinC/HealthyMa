// Directly clear cultural cache
const { clearAllCache } = require('./server/cultureCacheManager');

console.log('🧹 Clearing all cultural cache data...');
clearAllCache();
console.log('✅ Cache cleared successfully!');

// Also restart server to ensure fresh state
process.exit(0);