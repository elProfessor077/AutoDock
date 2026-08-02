/**
 * Digital Shredder — deletes the uploaded archive and extraction directories
 * once the download is complete.
 */

const fs = require('fs/promises');

/**
 * Schedules async cleanup of all provided files/directories.
 *
 * Each path is removed independently using Promise.allSettled, ensuring that
 * a file-lock failure on one path does not crash the server or block other cleanups.
 *
 * @param {string[]} paths  Array of absolute paths to delete
 */
async function triggerCleanup(paths) {
  console.log('[Cleanup] Triggering cleanup of directories:', paths);

  // Wait a short delay to release any OS file handles
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const results = await Promise.allSettled(
    paths.map((p) => fs.rm(p, { recursive: true, force: true }))
  );

  results.forEach((res, i) => {
    if (res.status === 'rejected') {
      console.warn(`[Cleanup] Failed to delete path: "${paths[i]}". Error:`, res.reason.message);
    } else {
      console.log(`[Cleanup] Cleaned up: "${paths[i]}"`);
    }
  });
}

module.exports = { triggerCleanup };
