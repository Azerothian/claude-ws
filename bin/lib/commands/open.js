/**
 * `claude-ws open` — Open browser to the running instance.
 */

const { spawn } = require('child_process');
const config = require('../config');
const daemon = require('../daemon');

/**
 * Validate hostname to prevent command injection.
 * @param {string} host
 * @returns {boolean}
 */
function isValidHost(host) {
  // Allow: localhost, valid hostnames, and IP addresses
  const hostnameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const localhostRegex = /^localhost$/i;
  return hostnameRegex.test(host) || ipv4Regex.test(host) || localhostRegex.test(host);
}

/**
 * Open a URL in the default browser (cross-platform).
 * Uses spawn instead of exec to prevent command injection.
 * @param {string} url
 */
function openUrl(url) {
  const platform = process.platform;
  let command, args;

  if (platform === 'darwin') {
    command = 'open';
    args = [url];
  } else if (platform === 'win32') {
    command = 'cmd';
    args = ['/c', 'start', '', url];
  } else {
    command = 'xdg-open';
    args = [url];
  }

  spawn(command, args, {
    detached: true,
    stdio: 'ignore',
  }).unref();
}

async function run(_argv) {
  const { running, pid } = daemon.checkRunning();

  if (!running) {
    console.log('[claude-ws] No running daemon found.');
    console.log('[claude-ws] Start one first: claude-ws start');
    process.exit(1);
  }

  const conf = config.resolve({});

  // Validate host to prevent command injection
  if (!isValidHost(conf.host)) {
    console.error(`[claude-ws] Error: Invalid host '${conf.host}'`);
    console.error('[claude-ws] Host must be a valid hostname or IP address');
    process.exit(1);
  }

  // Validate port range
  if (conf.port < 1 || conf.port > 65535) {
    console.error(`[claude-ws] Error: Invalid port '${conf.port}'`);
    console.error('[claude-ws] Port must be between 1 and 65535');
    process.exit(1);
  }

  const url = `http://${conf.host}:${conf.port}`;

  console.log(`[claude-ws] Opening ${url} (PID ${pid})`);
  openUrl(url);

  process.exit(0);
}

module.exports = { run, openUrl };
