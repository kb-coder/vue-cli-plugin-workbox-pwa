/* eslint-disable no-console */
/**
 * See workbox documentation for details about the lifecyle events of a service worker.
 * https://developers.google.com/web/tools/workbox/modules/workbox-window#important_service_worker_lifecycle_moments
 */
 import { Workbox } from 'workbox-window'

 const autoUpdate = async (registration) => {
   const updateInterval = 1000 * 60 * 60 // 1 hour
   // const updateInterval = 1000 * 60 // 1 min // for debugging
   setInterval(async () => {
     try {
       /* eslint-disable-next-line no-unused-expressions */
       await registration?.update()
       console.log('sw: registration checked for updates')
     } catch (err) {
       console.log(`sw: registration failed to check for updates with errors: ${err}`)
     }
   }, updateInterval)
 }

 const manualUpdateAvailable = (registration) => {
   // Wires up an event that we can listen to in the app. Example: listen for available update and prompt user to update.
   console.log('sw: manualUpdateAvailable dispatching event')
   document.dispatchEvent(
     new CustomEvent('swUpdated', { detail: registration }))
 }

 const register = async () => {
   if ('serviceWorker' in navigator) {
     // Workbox combines the ./src/sw.js file and injected manifest into the servicer-worker.js file in /dist
     // Uses vue.config.js workboxOptions.swSrc for the location of sw.js and swDest for the output location of 'service-worker.js'.
     // You can override the file names and locations by changing the values of workboxOptions in vue.config.js.
     const wb = new Workbox(`${process.env.BASE_URL}service-worker.js`)

     // wire up instance of registration so we can take further action on it.
     const registration = await wb.register()
     console.log('sw: registered')

     autoUpdate(registration)

     wb.addEventListener('activated', async (event) => {
       console.log('sw: activated event listener hit.')
       if (event.isUpdate) {
         // event.isUpdate=true means the service worker was already registered and there is a new version available.
         // this only triggers self.skipWaiting. It still doesn't force the app to update. See /composables/use-service-worker.ts for updating app.
         wb.messageSkipWaiting()
       } else {
         // first time use when event.isUpdate = false
         // service worker should claim the client immediately since its the first install.
         wb.messageSW({ type: 'CLIENTS_CLAIM' })
         console.log('sw: clientsClaim called.')
       }
     })

     wb.addEventListener('installed', (event) => {
       console.log('sw: installed event listener hit.')
     })

     wb.addEventListener('waiting', (event) => {
       console.log('sw: waiting event listener hit.')
       if (event.isUpdate) {
         // Wires up event that is listened to in the use-service-worker composable. The app-manual-update component then
         // prompts the user there is an update available to activate.
         manualUpdateAvailable(registration)
       }
     })

     wb.addEventListener('controlling', (event) => {
       console.log('sw: controlling event listener hit.')
     })

     wb.addEventListener('fetch', (event) => {
       console.log('sw: fetch event listener hit.')
       // wb.messageSkipWaiting() // hack to "unfreeze" stuck service worker
     })
   }
 }

 export default register
