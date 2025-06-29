module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          extensions: [
            '.ios.ts',
            '.android.ts',
            '.ts',
            '.ios.tsx',
            '.android.tsx',
            '.tsx',
            '.jsx',
            '.js',
            '.json',
          ],
          alias: {
            '@': './',
            '@components': './src/components',
            '@screens': './src/screens',
            '@services': './src/services',
            '@navigation': './src/navigation',
            '@types': './src/types',
            '@config': './src/config',
            '@utils': './src/utils',
            '@assets': './assets'
          },
        },
      ],
    ],
  };
};