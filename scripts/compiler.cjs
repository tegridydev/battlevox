/** Resolve only the installed compiler or an explicitly trusted offline fallback. */
function loadTypeScript() {
  try {
    return require('typescript');
  } catch (error) {
    if (error.code !== 'MODULE_NOT_FOUND') throw error;
    if (process.env.BATTLEVOX_TYPESCRIPT) return require(process.env.BATTLEVOX_TYPESCRIPT);
    throw Error(
      'Install development dependencies, or set BATTLEVOX_TYPESCRIPT to a trusted TypeScript package.',
    );
  }
}
module.exports = { loadTypeScript };
