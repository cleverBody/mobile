import type { LocalSong } from '@/types/localMusic'

// 动态导入Capacitor模块，避免在浏览器环境中出错
let Filesystem: any = null
let Directory: any = null
let FilePicker: any = null

// 检测运行环境
const isCapacitorEnvironment = () => {
  return typeof window !== 'undefined' && (window as any).Capacitor
}

// 初始化Capacitor模块
const initCapacitorModules = async () => {
  if (isCapacitorEnvironment() && !Filesystem) {
    try {
      const fsModule = await import('@capacitor/filesystem')
      Filesystem = fsModule.Filesystem
      Directory = fsModule.Directory

      const fpModule = await import('@capawesome/capacitor-file-picker')
      FilePicker = fpModule.FilePicker
    } catch (error) {
      console.warn('Capacitor模块加载失败:', error)
    }
  }
}

/**
 * 本地音乐文件管理器 - 兼容浏览器和移动端
 */
export class LocalMusicFileManager {
  private static readonly MUSIC_DIR = 'local-music'
  private static readonly COVERS_DIR = 'covers'

  /**
   * 初始化本地目录 - 兼容浏览器和移动端
   */
  static async initDirectories(): Promise<void> {
    await initCapacitorModules()

    if (isCapacitorEnvironment() && Filesystem && Directory) {
      // 移动端创建文件系统目录
      try {
        try {
          await Filesystem.mkdir({
            path: this.MUSIC_DIR,
            directory: Directory.Data,
            recursive: true
          })
        } catch (error: any) {
          if (!error.message?.includes('already exist')) {
            throw error
          }
        }

        try {
          await Filesystem.mkdir({
            path: `${this.MUSIC_DIR}/${this.COVERS_DIR}`,
            directory: Directory.Data,
            recursive: true
          })
        } catch (error: any) {
          if (!error.message?.includes('already exist')) {
            throw error
          }
        }
      } catch (error) {
        console.error('移动端目录初始化失败:', error)
      }
    } else {
      // 浏览器环境不需要创建目录，使用IndexedDB
      console.log('浏览器环境：使用IndexedDB存储，无需创建目录')
    }
  }

  /**
   * 选择音乐文件 - 兼容浏览器和移动端
   */
  static async pickMusicFiles(): Promise<File[]> {
    await initCapacitorModules()

    if (isCapacitorEnvironment() && FilePicker) {
      // 移动端使用Capacitor FilePicker
      try {
        const result = await FilePicker.pickFiles({
          types: ['audio/*'],
          multiple: true,
          readData: true
        })

        return result.files.map((file: any) => {
          const blob = new Blob([file.data], { type: file.mimeType })
          return new File([blob], file.name, { type: file.mimeType })
        })
      } catch (error: any) {
        if (error.message && error.message.includes('canceled')) {
          console.log('用户取消了文件选择')
          return []
        }
        console.error('移动端文件选择失败:', error)
        return []
      }
    } else {
      // 浏览器环境使用HTML5 File API
      return new Promise((resolve) => {
        const input = document.createElement('input')
        input.type = 'file'
        input.multiple = true
        input.accept = 'audio/*'

        input.onchange = (event) => {
          const files = Array.from((event.target as HTMLInputElement).files || [])
          resolve(files)
        }

        input.oncancel = () => {
          console.log('用户取消了文件选择')
          resolve([])
        }

        input.click()
      })
    }
  }

  /**
   * 保存音乐文件到本地 - 兼容浏览器和移动端
   */
  static async saveMusicFile(file: File, songId: string): Promise<string> {
    try {
      // 统一使用 IndexedDB 存储，兼容性最好
      await this.storeFileInIndexedDB(songId, file)

      console.log(`文件已保存: ${songId}, 大小: ${file.size} bytes`)

      // 返回 songId，用于后续获取文件
      return songId
    } catch (error) {
      console.error('保存音乐文件失败:', error)
      throw error
    }
  }

  /**
   * 保存封面图片
   */
  static async saveCoverImage(coverUrl: string, songId: string): Promise<string> {
    try {
      const response = await fetch(coverUrl)
      const arrayBuffer = await response.arrayBuffer()
      const base64Data = this.arrayBufferToBase64(arrayBuffer)

      const fileName = `${songId}.jpg`
      const filePath = `${this.MUSIC_DIR}/${this.COVERS_DIR}/${fileName}`

      await Filesystem.writeFile({
        path: filePath,
        data: base64Data,
        directory: Directory.Data
      })

      return filePath
    } catch (error) {
      console.error('保存封面失败:', error)
      return ''
    }
  }

  /**
   * 获取本地文件URL
   */
  static async getLocalFileUrl(songId: string): Promise<string> {
    try {
      // 从 IndexedDB 获取文件并创建 blob URL
      const file = await this.getFileFromIndexedDB(songId)
      if (!file) {
        throw new Error('文件不存在')
      }

      const blob = new Blob([file], { type: file.type })
      const blobUrl = URL.createObjectURL(blob)

      console.log(`获取文件URL: ${blobUrl}`)
      return blobUrl
    } catch (error) {
      console.error('获取文件URL失败:', error)
      throw error
    }
  }

  /**
   * 删除本地文件
   */
  static async deleteLocalFile(songId: string): Promise<void> {
    try {
      await this.deleteFileFromIndexedDB(songId)
      console.log(`文件已从 IndexedDB 删除: ${songId}`)
    } catch (error) {
      console.error('删除文件失败:', error)
    }
  }

  /**
   * 获取文件扩展名
   */
  private static getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || 'mp3'
  }

  /**
   * ArrayBuffer转Base64
   */
  private static arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  /**
   * 存储文件到 IndexedDB
   */
  private static async storeFileInIndexedDB(songId: string, file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('LocalMusicDB', 1)

      request.onerror = () => reject(request.error)

      request.onsuccess = () => {
        const db = request.result
        const transaction = db.transaction(['files'], 'readwrite')
        const store = transaction.objectStore('files')

        store.put({ id: songId, file: file })

        transaction.oncomplete = () => resolve()
        transaction.onerror = () => reject(transaction.error)
      }

      request.onupgradeneeded = () => {
        const db = request.result
        if (!db.objectStoreNames.contains('files')) {
          db.createObjectStore('files', { keyPath: 'id' })
        }
      }
    })
  }

  /**
   * 从 IndexedDB 获取文件
   */
  private static async getFileFromIndexedDB(songId: string): Promise<File | null> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('LocalMusicDB', 1)

      request.onerror = () => reject(request.error)

      request.onsuccess = () => {
        const db = request.result
        const transaction = db.transaction(['files'], 'readonly')
        const store = transaction.objectStore('files')
        const getRequest = store.get(songId)

        getRequest.onsuccess = () => {
          const result = getRequest.result
          resolve(result ? result.file : null)
        }

        getRequest.onerror = () => reject(getRequest.error)
      }

      request.onupgradeneeded = () => {
        const db = request.result
        if (!db.objectStoreNames.contains('files')) {
          db.createObjectStore('files', { keyPath: 'id' })
        }
      }
    })
  }

  /**
   * 从 IndexedDB 删除文件
   */
  private static async deleteFileFromIndexedDB(songId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('LocalMusicDB', 1)

      request.onerror = () => reject(request.error)

      request.onsuccess = () => {
        const db = request.result
        const transaction = db.transaction(['files'], 'readwrite')
        const store = transaction.objectStore('files')

        store.delete(songId)

        transaction.oncomplete = () => resolve()
        transaction.onerror = () => reject(transaction.error)
      }
    })
  }
}
