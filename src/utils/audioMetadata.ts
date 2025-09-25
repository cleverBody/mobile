import type { AudioMetadata } from '@/types/localMusic'

/**
 * 解析音频文件元数据 - 简化版本，兼容所有环境
 */
export const parseAudioMetadata = async (file: File): Promise<AudioMetadata> => {
  // 使用简单的文件名解析，避免复杂的库依赖
  const fileName = file.name.replace(/\.[^/.]+$/, '')
  const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'mp3'

  // 尝试从文件名中提取信息 (格式: 艺术家 - 歌曲名)
  let title = fileName
  let artist = '未知艺术家'

  if (fileName.includes(' - ')) {
    const parts = fileName.split(' - ')
    if (parts.length >= 2) {
      artist = parts[0].trim()
      title = parts.slice(1).join(' - ').trim()
    }
  }

  console.log(`🎵 解析文件: ${file.name} -> 艺术家: ${artist}, 标题: ${title}`)

  return {
    title,
    artist,
    album: '未知专辑',
    duration: 0,
    bitrate: undefined,
    sampleRate: undefined,
    format: fileExtension,
    picture: undefined
  }
}

/**
 * 提取封面图片
 */
export const extractCoverArt = (metadata: AudioMetadata): string | undefined => {
  if (!metadata.picture) {
    return undefined
  }

  try {
    // jsmediatags 格式的图片数据
    const picture = metadata.picture
    const uint8Array = new Uint8Array(picture.data)
    const blob = new Blob([uint8Array], { type: picture.format })
    return URL.createObjectURL(blob)
  } catch (error) {
    console.warn('提取封面失败:', error)
    return undefined
  }
}

/**
 * 生成唯一ID
 */
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/**
 * 格式化文件大小
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 格式化时长
 */
export const formatDuration = (seconds: number): string => {
  if (!seconds || seconds < 0) return '00:00'

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)

  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

/**
 * 检查是否为支持的音频格式
 */
export const isSupportedAudioFormat = (filename: string): boolean => {
  const supportedFormats = ['.mp3', '.m4a', '.aac', '.flac', '.wav', '.ogg', '.wma']
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'))
  return supportedFormats.includes(extension)
}
