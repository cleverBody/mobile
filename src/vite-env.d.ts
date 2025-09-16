/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly BASE_URL: string
  // 可以在这里添加其他环境变量类型
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}