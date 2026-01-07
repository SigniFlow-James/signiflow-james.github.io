export default defineNuxtPlugin(() => {
  console.log('🔌 Procore message bridge initialized')

  window.addEventListener('message', (event: MessageEvent) => {
    // Always log during development
    console.log('📨 Raw postMessage received:', event.data)

    // Forward Procore messages into Nuxt app
    window.dispatchEvent(
      new CustomEvent('procore-message', {
        detail: event
      })
    )
  })
})
