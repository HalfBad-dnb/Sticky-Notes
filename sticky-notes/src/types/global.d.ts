/// <reference types="vite/client" />

declare module '*.svg' {
  import React = require('react')
  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >
  const src: string
  export default src
}

declare module '*.module.css' {
  const classes: { readonly [key: string]: string }
  export default classes
}

declare module '*.module.scss' {
  const classes: { readonly [key: string]: string }
  export default classes
}

declare module '*.css' {
  const classes: { readonly [key: string]: string }
  export default classes
}

declare module '*.jpg' {
  const content: string
  export default content
}

declare module '*.jpeg' {
  const content: string
  export default content
}

declare module '*.png' {
  const content: string
  export default content
}

declare module '*.gif' {
  const content: string
  export default content
}

declare module '*.webp' {
  const content: string
  export default content
}

declare module '*.ico' {
  const content: string
  export default content
}

declare module '*.bmp' {
  const content: string
  export default content
}

declare module '*.avif' {
  const content: string
  export default content
}

declare module '*.jsx' {
  import React = require('react')
  const Component: React.FunctionComponent<any>
  export default Component
}

declare module '*.js' {
  const content: any
  export default content
  export const useWebSocket: any
}

// Environment variables
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_API_URL: string
  readonly VITE_WS_URL: string
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string
  readonly VITE_ENVIRONMENT: 'development' | 'production' | 'test'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
