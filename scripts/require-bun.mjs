const execPath = process.env.npm_execpath ?? '';
if (execPath && !execPath.includes('bun')) {
  console.error('\nERROR: Please use bun instead of npm/yarn.\n  Run: bun install\n');
  process.exit(1);
}