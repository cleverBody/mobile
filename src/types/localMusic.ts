export interface LocalSong {
  id: string
  name: string
  artist: string
  album: string
  duration: number
  filePath: string
  cover?: string
  size: number
  format: string
  bitrate?: number
  sampleRate?: number
  type: 'local'
  dateAdded: number
  lastPlayed?: number
  playCount: number
}

export interface ImportProgress {
  total: number
  current: number
  currentFile: string
  isImporting: boolean
  errors: string[]
}

export interface LocalMusicStats {
  totalSongs: number
  totalSize: number
  totalDuration: number
  artists: number
  albums: number
}

export interface AudioMetadata {
  title?: string
  artist?: string
  album?: string
  duration?: number
  bitrate?: number
  sampleRate?: number
  format?: string
  picture?: {
    data: number[]
    format: string
    type: string
    description: string
  }
}
