function preserveSettings(existing, defaults) {
  if (Object.keys(existing).length > 0) return existing;
  return defaults;
}
if (typeof module !== 'undefined') module.exports = { preserveSettings };
