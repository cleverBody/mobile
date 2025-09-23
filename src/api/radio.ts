import axios from 'axios'
import { getApiBaseURL } from '@/utils/api'

// API基础配置
const api = axios.create({
  baseURL: getApiBaseURL(),
  timeout: 15000,
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    if (config.params) {
      config.params.timestamp = Date.now()
    } else {
      config.params = { timestamp: Date.now() }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    if (response.data.success && response.data.data) {
      return response.data.data
    }
    return response.data
  },
  (error) => {
    console.error('电台API请求失败:', error)
    throw error
  }
)

// 电台数据类型定义
export interface RadioType {
  id: number
  name: string
}

export interface RadioProgram {
  id: number
  name: string
  description: string
  picUrl: string
  duration: number
  createTime: number
  playCount?: number
  likedCount?: number
  commentCount?: number
  url?: string
}

export interface RadioStation {
  id: number
  name: string
  picUrl: string
  description: string
  category?: string
  categoryId?: number
  subCount?: number
  programCount?: number
  createTime?: number
  dj?: {
    nickname: string
    avatarUrl: string
  }
  lastProgramCreateTime?: number
  lastProgramId?: number
  lastProgramName?: string
}

export interface RadioCategory {
  id: number
  name: string
  stations?: RadioStation[]
}

// 电台相关API
export const radioApi = {
  /**
   * 获取电台分类列表
   */
  getCategoryList(): Promise<{ categories: RadioType[] }> {
    return api.get('/dj_catelist')
  },

  /**
   * 获取电台推荐
   */
  getRecommend(): Promise<{ djRadios: RadioStation[] }> {
    return api.get('/dj_recommend')
  },

  /**
   * 获取电台榜单
   * @param type "new" | "hot" - new: 新晋电台榜 / hot: 热门电台榜
   * @param limit 返回数量
   * @param offset 偏移数量
   */
  getToplist(type: 'new' | 'hot', limit = 20, offset = 0): Promise<{ toplist: RadioStation[] }> {
    return api.get('/dj_toplist', {
      params: { type, limit, offset }
    })
  },

  /**
   * 获取电台个性推荐
   */
  getPersonalized(): Promise<{ djRadios: RadioStation[] }> {
    return api.get('/dj_personalize_recommend')
  },

  /**
   * 获取推荐电台类型
   */
  getRecommendTypes(): Promise<{ data: RadioCategory[] }> {
    return api.get('/dj_category_recommend')
  },

  /**
   * 获取分类热门电台
   * @param cateId 类别ID
   * @param limit 返回数量
   * @param offset 偏移数量
   */
  getCategoryHot(cateId: number, limit = 50, offset = 0): Promise<{ djRadios: RadioStation[] }> {
    return api.get('/dj_radio_hot', {
      params: { cateId, limit, offset }
    })
  },

  /**
   * 获取分类推荐电台
   * @param type 电台类型
   */
  getCategoryRecommend(type: number): Promise<{ djRadios: RadioStation[] }> {
    return api.get('/dj_recommend_type', {
      params: { type }
    })
  },

  /**
   * 获取电台详情
   * @param rid 电台ID
   */
  getDetail(rid: number): Promise<{ data: RadioStation }> {
    return api.get('/dj_detail', {
      params: { rid }
    })
  },

  /**
   * 获取电台节目列表
   * @param rid 电台ID
   * @param limit 返回数量
   * @param offset 偏移数量
   */
  getPrograms(rid: number, limit = 50, offset = 0): Promise<{ programs: RadioProgram[] }> {
    return api.get('/dj_program', {
      params: { rid, limit, offset }
    })
  },

  /**
   * 获取节目详情
   * @param id 节目ID
   */
  getProgramDetail(id: number): Promise<{ program: RadioProgram }> {
    return api.get('/dj_program_detail', {
      params: { id }
    })
  },

  /**
   * 订阅/取消订阅电台
   * @param rid 电台ID
   * @param t 1:订阅 0:取消订阅
   */
  subscribe(rid: number, t = 1): Promise<any> {
    return api.get('/dj_sub', {
      params: { rid, t, timestamp: Date.now() }
    })
  }
}

// 工具函数：格式化电台数据
export const formatRadioStation = (station: any): RadioStation => {
  return {
    id: station.id,
    name: station.name,
    picUrl: station.picUrl,
    description: station.desc || station.description || '',
    category: station.category,
    categoryId: station.categoryId,
    subCount: station.subCount,
    programCount: station.programCount,
    createTime: station.createTime,
    dj: station.dj ? {
      nickname: station.dj.nickname,
      avatarUrl: station.dj.avatarUrl
    } : undefined,
    lastProgramCreateTime: station.lastProgramCreateTime,
    lastProgramId: station.lastProgramId,
    lastProgramName: station.lastProgramName
  }
}

// 工具函数：格式化节目数据
export const formatRadioProgram = (program: any): RadioProgram => {
  return {
    id: program.id,
    name: program.name,
    description: program.description || '',
    picUrl: program.coverUrl || program.picUrl || program.radio?.picUrl || '',
    duration: program.duration,
    createTime: program.createTime,
    playCount: program.listenerCount || program.playCount,
    likedCount: program.likedCount,
    commentCount: program.commentCount,
    url: program.url || program.mainSong?.url
  }
}

// 工具函数：格式化电台分类
export const formatRadioCategory = (category: any): RadioCategory => {
  return {
    id: category.id,
    name: category.name,
    stations: category.djRadios ? category.djRadios.map(formatRadioStation) : []
  }
}