// ========================================
// FILE: scripts/useProcoreContext.ts
// ========================================
import { ref } from 'vue'
import type { ProcoreContext } from './models'

export function useProcoreContext() {
  const procoreContext = ref<ProcoreContext | null>(null)

  function initializeProcoreListener() {
    if (!document.referrer) {
      // console.warn('No document.referrer; cannot open message listener')
      procoreContext.value = null
      return
    }

    window.addEventListener('message', (event) => {
      if (event.source === window.self) {
        return
      }
      
      // console.group('📨 postMessage received')
      // console.log('origin:', event.origin)
      // console.log('source === window.parent:', event.source === window.parent)
      // console.log('raw data:', event.data)
      // console.groupEnd()

      if (
        event.data?.type === 'context' ||
        event.data?.type === 'setup'
      ) {
        // console.log('✅ Procore context detected')
        procoreContext.value = event.data.context ?? event.data.payload ?? event.data
      }
    })
    
    // console.log('--- message listener attached ---')
    // console.log(`--- sending initialiser to ${document.referrer} ---`)
    
    window.parent.postMessage(
      { type: 'initialize' },
      document.referrer
    )
  }

  return {
    procoreContext,
    initializeProcoreListener
  }
}

// ========================================
// END FILE: scripts/useProcoreContext.ts
// ========================================