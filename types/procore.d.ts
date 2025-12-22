export {}

declare global {
  interface Window {
    Procore?: {
      on: (event: string, callback: (payload: any) => void) => void
      off?: (event: string, callback: (payload: any) => void) => void
      emit?: (event: string, payload?: any) => void
    }
  }
}
