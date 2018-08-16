const OfflinePlugin = require('offline-plugin');

module.exports = {
  modify: (config, { target, dev }) => {
    const appConfig = config;

    if (!dev) {
      /*
        This is a hack to disable linting on the production build.
        Linting is the first object in the rules away and this removes it.
        A prod build will fail if the API changes so it is fairly safe.
      */
      appConfig.module.rules.shift();

      // Setup bundle analyser
      if (target === 'web') {
        // setup bundle splitting
        appConfig.output.filename = 'static/js/[name].[hash:8].js';
        appConfig.optimization = {
          splitChunks: {
            chunks: 'initial',
            automaticNameDelimiter: '-',
            minSize: 184320, // 180kb
            maxSize: 245760, // 240kb
            cacheGroups: {
              vendor: {
                test: /[\\/]node_modules[\\/]/,
                name: 'vendor',
              },
            },
          },
        };
      }

      // Setup bundle analyser
      if (target === 'web' && !process.env.CI) {
        // const defined here because it's a dev dep (breaks production build if at top of file)
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer'); // eslint-disable-line import/no-extraneous-dependencies, global-require
        appConfig.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            defaultSizes: 'gzip',
            generateStatsFile: true,
            openAnalyzer: false,
            reportFilename: '../../reports/webpackBundleReport.html',
            statsFilename: '../../reports/webpackBundleReport.json',
          }),
        );
      }
    }

    // This is to override bundle performance test
    if (process.env.CI) {
      appConfig.performance = {
        maxAssetSize: 245760, // 240kb - individual bundles
        maxEntrypointSize: 491520, // 480kb - total bundles
      };
    }

    if (target === 'web') {
      appConfig.plugins.push(
        new OfflinePlugin({
          appShell: '/article/',
          autoUpdate: 1000 * 60 * 2,
          // externals means files not generated by webpack
          // an alternative would be html-webpack-plugin
          externals: ['/'],
          ServiceWorker: {
            events: true,
            // obviously we need a file to match this path
            navigateFallbackURL: './offline.html',
          },
          updateStrategy: 'changed',
        }),
      );
    }

    return appConfig;
  },
};
