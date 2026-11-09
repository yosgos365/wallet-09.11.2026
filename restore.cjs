const { execSync } = require('child_process');
try {
  execSync('git checkout src');
  console.log('Restored src');
} catch (e) {
  console.error(e.toString());
}
