/* eslint-disable no-console */
import { ref } from 'vue'

export const useServiceWorker = (forceUpdate = false) => {
  let registration = null
  const updateExists = ref(false)
  const refreshing = ref(false)

  const reloadApp = () => {
    if (refreshing.value) {
      console.log('useServiceWorker: Service Worker already refreshing')
      return
    }

    refreshing.value = true
    window.location.reload()
  }

  const refreshApp = () => {
    console.log('useServiceWorker: refreshApp called.')
    updateExists.value = false
    if (registration) {
      const swState = registration.waiting.state
      if (swState === 'waiting' || swState === 'installed') {
        navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' })
        console.log('useServiceWorker: Posted SKIP_WAITING message.')
      }
    }
  }

  const updateAvailable = (event) => {
    console.log('useServiceWorker: Service worker update available.')
    if (event && event.detail) {
      registration = event.detail
      updateExists.value = true
      if (forceUpdate) {
        console.log('useServiceWorker: Forcing service worker update.')
        refreshApp()
      }
    }
  }

  // listen for service worker updates.
  document.addEventListener('swUpdated', updateAvailable, { once: true })

  if (navigator.serviceWorker) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('useServiceWorker: controllerchange called')
      reloadApp()
    })
  }

  return {
    refreshApp,
    updateExists
  }
}
