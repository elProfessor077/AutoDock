/**
 * Archiver Service — packs Dockerfile, docker-compose.yml, .dockerignore,
 * and a README into an in-memory zip stream and pipes it directly into the
 * response. No temp files are written to disk.
 */

const { ZipArchive } = require('archiver');

/**
 * Streams a zip archive containing blueprint files directly into the response.
 *
 * @param {import('stream').Writable} res          Writable response stream (e.g. NextJS Response/Express res)
 * @param {{ dockerfile: string, dockerCompose: string, dockerignore: string, readme: string }} blueprints
 * @returns {Promise<void>}
 */
function streamBlueprint(res, blueprints) {
  return new Promise((resolve, reject) => {
    const archive = new ZipArchive({ zlib: { level: 9 } });

    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') {
        console.warn('[Archiver] Warning:', err);
      } else {
        reject(err);
      }
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.on('end', () => {
      resolve();
    });

    // Pipe the archive data to the output stream
    archive.pipe(res);

    // Append file strings as Buffers
    archive.append(Buffer.from(blueprints.dockerfile), { name: 'Dockerfile' });
    archive.append(Buffer.from(blueprints.dockerCompose), { name: 'docker-compose.yml' });
    archive.append(Buffer.from(blueprints.dockerignore), { name: '.dockerignore' });
    archive.append(Buffer.from(blueprints.readme), { name: 'DOCKERYZE_README.md' });

    // Finalize the archive (tells the stream we are done writing)
    archive.finalize();
  });
}

module.exports = { streamBlueprint };
