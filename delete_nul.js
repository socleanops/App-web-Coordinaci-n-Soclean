const fs = require('fs');
const path = '\\\\?\\c:\\Users\\leoma\\OneDrive\\Desktop\\Apps\\Soclean Coordinación\\nul';
try {
  fs.unlinkSync(path);
  console.log('Successfully deleted nul file');
} catch (err) {
  console.error('Failed to delete nul file:', err.message);
  // Try without the prefix just in case
  try {
    fs.unlinkSync('c:\\Users\\leoma\\OneDrive\\Desktop\\Apps\\Soclean Coordinación\\nul');
    console.log('Successfully deleted nul file without prefix');
  } catch (err2) {
    console.error('Failed again:', err2.message);
  }
}
