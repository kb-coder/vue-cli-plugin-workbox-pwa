module.exports = {
    pwa: {
      name: 'KB Coder PWA App',
      shorName: 'KB Coder',
      themeColor: '#400080',
      msTileColor: '#800080',
      manifestOptions: {
        start_url: '/'
      },
      workboxPluginMode: 'InjectManifest',
      workboxOptions: {
        swSrc: './src/sw.js',
        swDest: 'service-worker.js'
      }
    }
  }
