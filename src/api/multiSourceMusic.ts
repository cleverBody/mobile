import type { Song } from '@/stores/music'

// GD Studio API 配置
const GD_STUDIO_API = {
  baseUrl: 'https://music-api.gdstudio.xyz/api.php',
  
  generateSignature: () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  },

  // JSONP请求函数
  jsonpRequest: (url: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      const callbackName = 'jsonp_callback_' + Math.random().toString(36).substr(2, 9)
      const timestamp = Date.now()
      const script = document.createElement('script')
      
      ;(window as any)[callbackName] = function(data: any) {
        resolve(data)
        document.head.removeChild(script)
        delete (window as any)[callbackName]
      }
      
      const separator = url.includes('?') ? '&' : '?'
      const finalUrl = `${url}${separator}callback=${callbackName}&_=${timestamp}`
      
      script.src = finalUrl
      script.onerror = () => {
        reject(new Error('JSONP request failed'))
        document.head.removeChild(script)
        delete (window as any)[callbackName]
      }
      
      document.head.appendChild(script)
      
      // 15秒超时
      setTimeout(() => {
        if (document.head.contains(script)) {
          document.head.removeChild(script)
          delete (window as any)[callbackName]
          reject(new Error('JSONP request timeout'))
        }
      }, 15000)
    })
  }
}

// 音源接口定义
export interface MusicSource {
  name: string
  search(keyword: string, limit?: number): Promise<Song[]>
  getSongUrl(song: Song | any, quality?: string): Promise<string | null>
  getLyric?(song: Song | any): Promise<string | null>
}

// GD Studio 音源实现
export class GDStudioSource implements MusicSource {
  name: string
  private source: string

  constructor(source: 'netease' | 'kuwo' | 'joox' = 'netease') {
    this.source = source
    this.name = `GD Studio ${source}`
  }

  async search(keyword: string, limit = 20): Promise<Song[]> {
    try {
      const signature = GD_STUDIO_API.generateSignature()
      const url = `${GD_STUDIO_API.baseUrl}?types=search&source=${this.source}&name=${encodeURIComponent(keyword)}&count=${limit}&pages=1&s=${signature}`
      
      console.log(`🔍 [${this.name}] 搜索关键词: ${keyword}`)
      const data = await GD_STUDIO_API.jsonpRequest(url)
      
      if (!Array.isArray(data)) {
        console.warn(`⚠️ [${this.name}] 搜索结果格式错误`)
        return []
      }
      
      const songs = data.map(this.formatSong).filter(song => song.id && song.name)
      console.log(`✅ [${this.name}] 搜索成功，返回 ${songs.length} 首歌曲`)
      return songs
      
    } catch (error) {
      console.error(`❌ [${this.name}] 搜索失败:`, error)
      return []
    }
  }

  async getSongUrl(song: Song | any, quality = '320000'): Promise<string | null> {
    try {
      const signature = GD_STUDIO_API.generateSignature()
      const songId = song.id || song.url_id
      const source = song.source || this.source
      
      if (!songId) {
        console.warn(`⚠️ [${this.name}] 歌曲ID为空`)
        return null
      }
      
      const url = `${GD_STUDIO_API.baseUrl}?types=url&id=${songId}&source=${source}&br=${quality}&s=${signature}`
      
      console.log(`🎵 [${this.name}] 获取播放链接: ${song.name}`)
      const data = await GD_STUDIO_API.jsonpRequest(url)
      
      if (data && data.url) {
        console.log(`✅ [${this.name}] 获取播放链接成功`)
        return data.url
      } else {
        console.warn(`⚠️ [${this.name}] 播放链接为空`)
        return null
      }
      
    } catch (error) {
      console.error(`❌ [${this.name}] 获取播放链接失败:`, error)
      return null
    }
  }

  async getLyric(song: Song | any): Promise<string | null> {
    try {
      const signature = GD_STUDIO_API.generateSignature()
      const lyricId = song.lyric_id || song.id
      const source = song.source || this.source
      
      if (!lyricId) return null
      
      const url = `${GD_STUDIO_API.baseUrl}?types=lyric&id=${lyricId}&source=${source}&s=${signature}`
      
      console.log(`📝 [${this.name}] 获取歌词: ${song.name}`)
      const data = await GD_STUDIO_API.jsonpRequest(url)
      
      if (data && data.lyric) {
        console.log(`✅ [${this.name}] 获取歌词成功`)
        return data.lyric
      } else {
        console.warn(`⚠️ [${this.name}] 歌词为空`)
        return null
      }
      
    } catch (error) {
      console.error(`❌ [${this.name}] 获取歌词失败:`, error)
      return null
    }
  }

  // 格式化歌曲数据，兼容现有Song接口
  private formatSong(rawSong: any): Song {
    return {
      id: rawSong.id || rawSong.url_id,
      name: rawSong.name || '',
      artists: Array.isArray(rawSong.artist) 
        ? rawSong.artist.map((name: string) => ({ id: 0, name }))
        : [{ id: 0, name: rawSong.artist || '未知艺术家' }],
      album: rawSong.album ? { id: 0, name: rawSong.album } : undefined,
      duration: rawSong.duration || 0,
      cover: rawSong.pic_id ? undefined : rawSong.cover, // pic_id 需要单独获取
      
      // 保存原始数据，用于后续获取URL
      source: rawSong.source,
      url_id: rawSong.url_id,
      lyric_id: rawSong.lyric_id,
      pic_id: rawSong.pic_id
    } as Song & {
      source?: string
      url_id?: string  
      lyric_id?: string
      pic_id?: string
    }
  }
}

// 多源音乐服务
export class MultiSourceMusicService {
  private sources: MusicSource[]

  constructor() {
    this.sources = [
      new GDStudioSource('netease'),
      new GDStudioSource('kuwo'),
      new GDStudioSource('joox')
    ]
  }

  // 多源搜索，合并结果
  async searchWithFallback(keyword: string, limit = 20): Promise<Song[]> {
    console.log(`🔍 [多源搜索] 开始搜索: ${keyword}`)
    
    const searchPromises = this.sources.map(async (source) => {
      try {
        return await source.search(keyword, Math.ceil(limit / this.sources.length))
      } catch (error) {
        console.warn(`⚠️ [${source.name}] 搜索异常:`, error)
        return []
      }
    })

    const results = await Promise.allSettled(searchPromises)
    const allSongs: Song[] = []
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        allSongs.push(...result.value)
      } else {
        console.warn(`⚠️ [${this.sources[index].name}] 搜索失败:`, result.reason)
      }
    })

    // 去重（基于歌曲名和艺术家）
    const uniqueSongs = this.deduplicateSongs(allSongs)
    console.log(`✅ [多源搜索] 搜索完成，去重后返回 ${uniqueSongs.length} 首歌曲`)
    
    return uniqueSongs.slice(0, limit)
  }

  // 智能获取可播放URL
  async getPlayableUrl(song: Song | any): Promise<{ url: string; source: string } | null> {
    console.log(`🎵 [多源播放] 尝试获取播放链接: ${song.name}`)

    // 优先尝试原始来源
    if (song.source) {
      const originalSource = this.sources.find(s => s.name.toLowerCase().includes(song.source))
      if (originalSource) {
        const url = await originalSource.getSongUrl(song)
        if (url && await this.validateAudioUrl(url)) {
          console.log(`✅ [多源播放] 原始来源播放链接有效: ${originalSource.name}`)
          return { url, source: originalSource.name }
        }
      }
    }

    // 尝试所有其他音源
    for (const source of this.sources) {
      try {
        console.log(`🔄 [多源播放] 尝试音源: ${source.name}`)
        
        // 如果是GD Studio源，需要先搜索获取歌曲信息
        let targetSong = song
        if (source instanceof GDStudioSource && !song.source) {
          const searchResults = await source.search(`${song.name} ${song.artists?.[0]?.name || ''}`, 1)
          if (searchResults.length > 0) {
            targetSong = searchResults[0]
          }
        }
        
        const url = await source.getSongUrl(targetSong)
        if (url && await this.validateAudioUrl(url)) {
          console.log(`✅ [多源播放] 找到有效播放链接: ${source.name}`)
          return { url, source: source.name }
        }
      } catch (error) {
        console.warn(`⚠️ [${source.name}] 获取播放链接异常:`, error)
      }
    }

    console.error(`❌ [多源播放] 所有音源都无法获取播放链接: ${song.name}`)
    return null
  }

  // 验证音频URL是否有效
  private async validateAudioUrl(url: string): Promise<boolean> {
    try {
      // 简单的HEAD请求检查
      const response = await fetch(url, { 
        method: 'HEAD',
        timeout: 5000 
      } as any)
      return response.ok && response.headers.get('content-type')?.startsWith('audio/')
    } catch (error) {
      // 如果HEAD请求失败，假设URL有效（某些服务器不支持HEAD）
      return true
    }
  }

  // 歌曲去重
  private deduplicateSongs(songs: Song[]): Song[] {
    const seen = new Set<string>()
    return songs.filter(song => {
      const key = `${song.name}-${song.artists?.[0]?.name || ''}`
        .toLowerCase()
        .replace(/\s+/g, '')
      
      if (seen.has(key)) {
        return false
      }
      seen.add(key)
      return true
    })
  }
}

// 导出单例实例
export const multiSourceMusicService = new MultiSourceMusicService()