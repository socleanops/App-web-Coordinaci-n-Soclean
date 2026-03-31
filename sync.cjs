const {execSync} = require('child_process');
try {
  console.log('Force checkout dev...');
  execSync('git checkout -f dev');
  
  console.log('Force checkout main...');
  execSync('git checkout -f main');
  
  console.log('Resetting main to origin/main...');
  execSync('git reset --hard origin/main');
  
  console.log('Merging dev into main locally...');
  execSync('git merge dev');
  
  console.log('Pushing to GitHub...');
  console.log(execSync('git push origin main').toString());
  
  console.log('Switching back to dev...');
  execSync('git checkout -f dev');
  
  console.log('ALL DONE! Web app will see updates very soon.');
} catch (e) {
  console.error("Error occurred:");
  if (e.stderr) console.error(e.stderr.toString());
}
