import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const GIT_ROOT         = 'D:\\PROTOTIPE';
const GIT_CORES_DIR    = path.join(GIT_ROOT, 'Plantillas Core');
const GIT_INSTANCES_DIR= path.join(GIT_ROOT, 'Instancias Clientes');
const GIT_DASHBOARD_DIR= path.join(GIT_ROOT, 'Central PROTOTIPE', 'dev-dashboard');

async function pathExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch (_) {
    return false;
  }
}

async function getGitDirName(dir) {
  if (await pathExists(path.join(dir, '.git'))) return '.git';
  if (await pathExists(path.join(dir, '.git-backup-temp'))) return '.git-backup-temp';
  return null;
}

async function execGitCommand(cmd, dir) {
  const gitFolder = await getGitDirName(dir);
  const env = { ...process.env };
  if (gitFolder) {
    env.GIT_DIR = path.join(dir, gitFolder);
    env.GIT_WORK_TREE = dir;
  }
  try {
    const { stdout, stderr } = await execAsync(cmd, { cwd: dir, env, timeout: 10000 });
    return { stdout, stderr, success: true };
  } catch (err) {
    return { error: err.message, success: false };
  }
}

async function getGitBranch(dir) {
  const res = await execGitCommand('git rev-parse --abbrev-ref HEAD', dir);
  if (res.success) {
    return res.stdout.trim();
  }
  return 'ERROR: ' + res.error;
}

async function isInsideGitRepo(dir) {
  const res = await execGitCommand('git rev-parse --is-inside-work-tree', dir);
  if (res.success) {
    return res.stdout.trim() === 'true';
  }
  return 'ERROR: ' + res.error;
}

async function main() {
  console.log('--- TEST GIT DETECTION ---');
  console.log('GIT_ROOT exists:', await pathExists(GIT_ROOT));
  console.log('GIT_DASHBOARD_DIR exists:', await pathExists(GIT_DASHBOARD_DIR));
  
  console.log('\n--- 1. GIT_ROOT ---');
  console.log('gitFolder:', await getGitDirName(GIT_ROOT));
  console.log('isInsideGitRepo:', await isInsideGitRepo(GIT_ROOT));
  console.log('getGitBranch:', await getGitBranch(GIT_ROOT));

  console.log('\n--- 2. GIT_DASHBOARD_DIR ---');
  console.log('gitFolder:', await getGitDirName(GIT_DASHBOARD_DIR));
  console.log('isInsideGitRepo:', await isInsideGitRepo(GIT_DASHBOARD_DIR));
  console.log('getGitBranch:', await getGitBranch(GIT_DASHBOARD_DIR));

  console.log('\n--- 3. Plantillas Core/App Ventas ---');
  const appVentas = path.join(GIT_CORES_DIR, 'App Ventas');
  console.log('gitFolder:', await getGitDirName(appVentas));
  console.log('isInsideGitRepo:', await isInsideGitRepo(appVentas));
  console.log('getGitBranch:', await getGitBranch(appVentas));
}

main();
