const { getDefaultConfig } = require('expo/metro-config');
const fs = require('fs');
const path = require('path');

const config = getDefaultConfig(__dirname);

const lucent = fs.realpathSync(path.resolve(__dirname, 'node_modules/expo-lucent'));
const lucentSource = path.join(lucent, 'src');
const appOrigin = path.resolve(__dirname, 'package.json');

config.watchFolders = [...(config.watchFolders ?? []), lucent];
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const fromLucent = context.originModulePath.startsWith(lucentSource) && !moduleName.startsWith('.');
  return context.resolveRequest(fromLucent ? { ...context, originModulePath: appOrigin } : context, moduleName, platform);
};

module.exports = config;
