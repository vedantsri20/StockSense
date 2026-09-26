const { execSync } = require('child_process');

try {
  const pids = execSync('lsof -t -i:5001 -i:5173', { encoding: 'utf-8' }).trim();
  if (pids) {
    const pidList = pids.split(/\s+/).filter(Boolean);
    if (pidList.length > 0) {
      console.log(`[Port Cleaner] Clearing stale processes on ports 5001 & 5173 (PIDs: ${pidList.join(', ')})...`);
      execSync(`kill -9 ${pidList.join(' ')}`);
    }
  }
} catch (e) {
  // Ports are already free, safe to ignore
}
