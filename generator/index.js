module.exports = (api, options, rootOptions) => {
  const fs = require('fs')
  const ext = api.hasPlugin('typescript') ? 'ts' : 'js'
  const fileEncoding = { encoding: 'utf-8' }

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


  // set up pwaconfiguration
  let pwaConfig = {
    name: 'PWA App',
    shorName: 'App',
    themeColor: '#4DBA87',
    msTileColor: '#000000',
    manifestOptions: {
      start_url: '/'
    }
  }

  const manifestType = options.manifestType[0]
  console.log(`manifestType: ${options.manifestType}`)
  pwaConfig.workboxPluginMode = manifestType

  if (manifestType == 'InjectManifest') {
    pwaConfig. workboxOptions = {
      swSrc: './src/sw.js',
      swDest: 'service-worker.js'
    }
  }

  if (options.vue?.pwa) {
    // update existing?
    console.log('has vue pwa')
  } else {
    api.extendPackage({
      vue: {
        pwa: pwaConfig
      }
    })

    console.log('pwa config set up complete')
  }

  // TODO: this is putting it in the root :(
  api.render('./template/public', {
    ...options,
  })

  api.render('./template/src', {
    ...options,
  })

  // TODO: this errors with cwd command. It has to be a path. So I need another way to copy env files?
  // api.render('./template/_env.pwalocalserve')

  // console.log('copying files complete')

  // console.log('starting .env setup')
  // if (fs.existsSync('.env')) {
  //   const envFile = api.resolve('.env')
  //   let envContent = fs.readFileSync(envFile, fileEncoding)
  //   envContent += '\nVUE_APP_PWA_LOCAL_SERVE=false'
  //   fs.writeFileSync(envFile, envContent, fileEncoding)
  // } else {
  //   api.render('./template/_env')
  // }

  // // if there is an .env.development file, copy it to .env.pwalocalserve and add the new setting
  // if (fs.existsSync('.env.development')) {
  //   fs.copyFileSync('.env.development', '.env.pwalocalserve')
  //   let envPwaFile = api.resolve('.env.pwalocalserve')
  //   let envPwaContent = fs.readFileSync(envPwaFile, fileEncoding)
  //   envPwaContent += '\nVUE_APP_PWA_LOCAL_SERVE=true'
  //   fs.writeFileSync(envPwaFile, envPwaContent, fileEncoding)
  // } else {
  //   api.render('./template/_env.pwalocalserve')
  // }

  // console.log('finished .env setup')

  // Inject service worker registration into main.js/.ts
  api.onCreateComplete(() => {
    const importRegister = `\nimport register from './service-worker/register-service-worker'`
    const mainPath = api.resolve(`./src/main.${ext}`)
    // get existing content
    let contentMain = fs.readFileSync(mainPath, fileEncoding)

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
    fs.writeFileSync(mainPath, contentMain, fileEncoding)
  })
}
