const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Watch the entire monorepo so Metro can resolve packages and hoisted deps
config.watchFolders = [monorepoRoot];

// Resolve modules from mobile's node_modules first, then root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

// Force bare react/react-dom/react-native imports to resolve to mobile's copies.
// This prevents duplicate React instances caused by the monorepo hoisting
// a different React version (e.g. from @repo/ui).
// Subpath imports (e.g. react-native/Libraries/...) resolve naturally via nodeModulesPaths.
config.resolver.extraNodeModules = {
  react: path.resolve(projectRoot, "node_modules/react"),
  "react-dom": path.resolve(projectRoot, "node_modules/react-dom"),
  "react-native": path.resolve(projectRoot, "node_modules/react-native"),
};

// Block Metro from ever resolving react from the root node_modules
// to guarantee a single copy at runtime
const rootReact = path.resolve(monorepoRoot, "node_modules/react");
const rootReactDom = path.resolve(monorepoRoot, "node_modules/react-dom");
config.resolver.blockList = [
  new RegExp(rootReact.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(/.*)?$"),
  new RegExp(rootReactDom.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(/.*)?$"),
];

module.exports = config;
