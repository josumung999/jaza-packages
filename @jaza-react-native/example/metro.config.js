const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
/** Parent package folder (`@jaza-react-native/`) — npm sometimes nests deps here */
const packageRoot = path.resolve(projectRoot, '..');
/** Turborepo / npm workspaces root (`packages/`) */
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [monorepoRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(packageRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// Must stay false under npm workspaces: Expo nests packages like
// `expo/node_modules/expo-modules-core`. Hierarchical lookup finds them;
// `disableHierarchicalLookup: true` only checks the roots above and fails.
config.resolver.disableHierarchicalLookup = false;

module.exports = config;
