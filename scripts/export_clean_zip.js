const { execSync } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

const rootDir = path.resolve(__dirname, '..');
const now = new Date();
const pad = (n) => String(n).padStart(2, '0');
const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
const desktopDir = path.join(os.homedir(), 'Desktop');
const zipFilename = `ecommerce-store-clean-${timestamp}.zip`;
const outputPath = path.join(desktopDir, zipFilename);

let gitCmd = 'git';
const knownGitPath = 'C:\\Users\\pc\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\native\\git\\cmd\\git.exe';
if (fs.existsSync(knownGitPath)) {
  gitCmd = `"${knownGitPath}"`;
}

console.log('📦 Creating clean zip archive via git archive (auto-excluding .env, database, node_modules)...');
try {
  execSync(`${gitCmd} archive -o "${outputPath}" HEAD`, { cwd: rootDir, stdio: 'inherit' });
  console.log('✅ Clean archive successfully created at:');
  console.log('👉', outputPath);
  console.log('🔒 Safe to share: .env, sqlite files, and node_modules are excluded automatically.');
} catch (err) {
  console.error('❌ Failed to create archive:', err.message);
  process.exit(1);
}
