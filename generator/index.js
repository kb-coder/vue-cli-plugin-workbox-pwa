module.exports = (api, options, rootOptions) => {
  if (options.workboxPwa) {
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

    api.render('./template', {
      ...options,
    })

    // Inject service worker registration into main.js/.ts
    const importRegister = `\nimport register from './service-worker/register-service-worker'`
    api.onCreateComplete(() => {
      // inject to main.js
      const fs = require('fs')
      const ext = api.hasPlugin('typescript') ? 'ts' : 'js'
      const mainPath = api.resolve(`./src/main.${ext}`)

      // get existing content
      let contentMain = fs.readFileSync(mainPath, { encoding: 'utf-8' })

      // modify add to content
      let addedContent = '\nregister()\n'
      addedContent += `\nif (process.env.NODE_ENV === 'development' || process.env.VUE_APP_PWA_LOCAL_SERVE === 'true') {`
      addedContent += '\n  console.log(`PWA Local Serve: ${process.env.VUE_APP_PWA_LOCAL_SERVE}`) // eslint-disable no-console'
      addedContent += '\n  console.log(`Node Env: ${process.env.NODE_ENV}`) // eslint-disable no-console'
      addedContent += '\n}\n'

      contentMain += addedContent

      const lines = contentMain.split(/\r?\n/g).reverse()

      // inject import
      const lastImportIndex = lines.findIndex(line => line.match(/^import/))
      lines[lastImportIndex] += importRegister

      // rebuild content
      contentMain = lines.reverse().join(`\n`)
      fs.writeFileSync(mainPath, contentMain, { encoding: 'utf-8' })
    })
  }
}
