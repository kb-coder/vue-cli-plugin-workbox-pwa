module.exports = (api, options, rootOptions) => {
  api.extendPackage({
    scripts: {
      'pwa-build': 'vue-cli-service build --mode pwalocalserve',
      'pwa-serve': 'npm run pwa-build && serve -s dist -l 8080'
    },
    dependencies: {
      'workbox-cacheable-response': '^6.1.5',
      'workbox-core': '^6.1.5',
      'workbox-expiration': '^6.1.5',
      'workbox-routing': '^6.1.5',
      'workbox-strategies': '^6.1.5',
      'workbox-window': '^6.1.5'
    },
    devDependencies: {
      'workbox-webpack-plugin': '^6.1.5'
    }
  })

  api.render('./template')

  // Inject service worker registration into main.js/.ts
  const importRegister = `import register from './service-worker/register-service-worker'`
  api.onCreateComplete(() => {
    // inject to main.js
    const fs = require('fs')
    const ext = api.hasPlugin('typescript') ? 'ts' : 'js'
    const mainPath = api.resolve(`./src/main.${ext}`)

    // get existing content
    let contentMain = fs.readFileSync(mainPath, { encoding: 'utf-8' })
    const lines = contentMain.split(/\r?\n/g).reverse()

    // inject import
    const lastImportIndex = lines.findIndex(line => line.match(/^import/))
    lines[lastImportIndex] += importRegister

    // modify add to content
    const addedContent = `register()`
    contentMain = lines.reverse().join(`\n${addedContent}\n`)
    fs.writeFileSync(mainPath, contentMain, { encoding: 'utf-8' })
  })
}
