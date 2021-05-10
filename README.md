# vue-cli-plugin-workbox-pwa
**ALPA**
A Vue CLI Plugin with advanced support for workbox 6.x and Vue 3. Includes the ability to debug the service worker locally.

How is this different from the vue-cli-plugin-pwa?
- vue-cli-plugin-pwa depends on register-service-worker but this does not. The register-service-worker makes several assumptions about how the PWA should work, but this does not meet advanced use cases like cached apis, cache first, etc.
- vue-cli-plugin-pwa does not provide a way to easily debug the service worker. This plugin does. It makes use of a new environment variable to enable NODE_ENV=development and injecting the manifest with customizations.
- We started with some of the manifest features of vue-cli-plugin-pwa. Because this is a more fully featured pwa, we start with the assumption that InjectManifest mode of Workbox is needed.

## Set up
The scripts commands expects a global install of `npm serve`.

Run: `npm install -g serve`.

## Configuration

Configuration is handled via the `pwa` property of either the `vue.config.js`
file, or the `"vue"` field in `package.json`.

- **pwa.workboxPluginMode**

  This allows you to choose between the two modes supported by the underlying
  [`workbox-webpack-plugin`](https://developers.google.com/web/tools/workbox/modules/workbox-webpack-plugin).

  - `'InjectManifest'` (default), allows you to start with an existing service worker file,
  and creates a copy of that file with a "precache manifest" injected into it.

  - `'GenerateSW'` will lead to a new service worker file being created
  each time you rebuild your web app.

  The "[Which Plugin to Use?](https://developers.google.com/web/tools/workbox/modules/workbox-webpack-plugin#which_plugin_to_use)"
  guide can help you choose between the two modes.

- **pwa.workboxOptions**

  These options are passed on through to the underlying `workbox-webpack-plugin`.

  For more information on what values are supported, please see the guide for
  [`GenerateSW`](https://developers.google.com/web/tools/workbox/modules/workbox-webpack-plugin#full_generatesw_config)
  or for [`InjectManifest`](https://developers.google.com/web/tools/workbox/modules/workbox-webpack-plugin#full_injectmanifest_config).

- **pwa.name**

  - Default: "name" field in `package.json`

    Used as the value for the `apple-mobile-web-app-title` meta tag in the generated HTML. Note you will need to edit `public/manifest.json` to match this.

- **pwa.themeColor**

  - Default: `'#4DBA87'`

- **pwa.msTileColor**

  - Default: `'#000000'`

- **pwa.appleMobileWebAppCapable**

  - Default: `'no'`

    This defaults to `'no'` because iOS before 11.3 does not have proper PWA support. See [this article](https://medium.com/@firt/dont-use-ios-web-app-meta-tag-irresponsibly-in-your-progressive-web-apps-85d70f4438cb) for more details.

- **pwa.appleMobileWebAppStatusBarStyle**

  - Default: `'default'`

- **pwa.assetsVersion**

  - Default: `''`

    This option is used if you need to add a version to your icons and manifest, against browser’s cache. This will append `?v=<pwa.assetsVersion>` to the URLs of the icons and manifest.

- **pwa.manifestPath**

  - Default: `'manifest.json'`

    The path of app’s manifest. If the path is an URL, the plugin won't generate a manifest.json in the dist directory during the build.

- **pwa.manifestOptions**

  - Default: `{}`

    The object will be used to generate the `manifest.json`

    If the following attributes are not defined in the object, the options of `pwa` or default options will be used instead.
      - name: `pwa.name`
      - short_name: `pwa.name`
      - display: `'standalone'`
      - theme_color: `pwa.themeColor`
      - start_url: `'/'`

        By default, the start url is set to '/'. If it is set to '.', it will work fine in a web browser or when installed on Windows, but will result in a blank when installed on iOS or Android.

        The router will alse need to have an entry for `path: '/'`. This will meet the requirements for a good `start_url` in Lighthouse.

- **pwa.manifestCrossorigin**

  - Default: `undefined`

    Value for `crossorigin` attribute in manifest link tag in the generated HTML. You may need to set this if your PWA is behind an authenticated proxy. See [cross-origin values](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-crossorigin) for more details.

- **pwa.iconPaths**

  - Defaults:

    ```js
    {
      faviconSVG: 'img/icons/favicon.svg',
      favicon32: 'img/icons/favicon-32x32.png',
      favicon16: 'img/icons/favicon-16x16.png',
      appleTouchIcon: 'img/icons/apple-touch-icon-152x152.png',
      maskIcon: 'img/icons/safari-pinned-tab.svg',
      msTileImage: 'img/icons/msapplication-icon-144x144.png'
    }
    ```

    Change these values to use different paths for your icons. You can use `null` as a value and that icon will not be included.

### Example Configuration

```js
// Inside vue.config.js
module.exports = {
  // ...other vue-cli plugin options...
  pwa: {
    name: 'My App',
    themeColor: '#4DBA87',
    msTileColor: '#000000',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'black',

    manifestOptions: {
      start_url: '/'
    },
    // configure the workbox plugin
    workboxPluginMode: 'InjectManifest',
    workboxOptions: {
      // swSrc is required in InjectManifest mode.
      swSrc: './src/sw.js',
      swDest: 'service-worker.js',
      // ...other workbox options
    }
  }
}
```

## Installing in an Already Created Project

``` sh
vue add workbox-pwa
```

## Injected dependencies and devDependencies

```
"dependencies": {
  "workbox-cacheable-response": "^6.1.5",
  "workbox-core": "^6.1.5",
  "workbox-expiration": "^6.1.5",
  "workbox-routing": "^6.1.5",
  "workbox-strategies": "^6.1.5",
  "workbox-window": "^6.1.5"
},
"devDependencies": {
  "workbox-webpack-plugin": "^6.1.5"
}
```

## Injected webpack-chain Rules

- `config.plugin('workbox')`
- `config.plugin('html')` title attribute is added to match the pwa.name

## Injected files

- **public/img/**
    Default app icons are added.
- **public/**
    Default robots.txt is added.
- **src/sw.js**
    Default service worker file is added with:
    - common caching scenarios for index.html, css, js, images.
    - Workbox's syntax for injecting the manifest. `precacheAndRoute(self.__WB_MANIFEST)`
    - Workbox clear cache for outdated versions of Workbox. `cleanupOutdatedCaches()`
-



## License
MIT
