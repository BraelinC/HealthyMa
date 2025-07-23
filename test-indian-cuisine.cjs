const fs = require('fs');

console.log('=== TESTING INDIAN CUISINE SELECTION ===');

// Load the cuisine data
let cuisineData;
try {
  cuisineData = JSON.parse(fs.readFileSync('./client/src/data/cultural_cuisine_masterlist.json', 'utf8'));
  console.log('Total cuisines in database:', cuisineData.length);
} catch (error) {
  console.error('Error loading cuisine data:', error.message);
  process.exit(1);
}

// Test searching for 'indian'
const searchTerm = 'indian';
const searchLower = searchTerm.toLowerCase();

const filtered = cuisineData.filter((cuisine) => {
  // Check if the label matches
  if (cuisine.label.toLowerCase().includes(searchLower)) {
    return true;
  }
  // Check if any alias matches
  return cuisine.aliases.some(alias => 
    alias.toLowerCase().includes(searchLower)
  );
});

console.log('\nFiltered results for "indian":', filtered.length);
filtered.forEach((cuisine, index) => {
  console.log(`${index + 1}. ${cuisine.label} - aliases: [${cuisine.aliases.join(', ')}]`);
});

// Test the specific selection logic
console.log('\n=== TESTING SELECTION LOGIC ===');
const selectedCuisines = []; // Simulating empty selection
const testCuisine = filtered[0]; // First Indian cuisine option

if (testCuisine && !selectedCuisines.includes(testCuisine.label)) {
  selectedCuisines.push(testCuisine.label);
  console.log('Successfully added:', testCuisine.label);
  console.log('Selected cuisines array:', selectedCuisines);
} else {
  console.log('Failed to add cuisine');
  console.log('Test cuisine:', testCuisine);
}

// Test multiple selection
console.log('\n=== TESTING MULTIPLE SELECTIONS ===');
const multipleSelected = ['Italian'];
console.log('Starting with:', multipleSelected);

if (testCuisine && !multipleSelected.includes(testCuisine.label)) {
  multipleSelected.push(testCuisine.label);
  console.log('Added Indian cuisine:', testCuisine.label);
  console.log('Final selection:', multipleSelected);
}