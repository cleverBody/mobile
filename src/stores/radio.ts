import { defineStore } from 'pinia'
import { ref } from 'vue'
import { radioApi, formatRadioProgram, type RadioStation, type RadioProgram, type RadioCategory, type RadioType } from '@/api/radio'
import { toastController } from '@ionic/vue'

// 显示Toast提示的辅助函数
const showToast = async (message: string, color: 'success' | 'warning' | 'danger' = 'success') => {
  const toast = await toastController.create({
    message,
    duration: 3000,
    position: 'top',
    color
  })
  await toast.present()
}

export const useRadioStore = defineStore('radio', () => {
  // 状态
  const categories = ref<RadioType[]>([])
  const hotStations = ref<RadioStation[]>([])
  const recommendStations = ref<RadioStation[]>([])
  const categoryRecommends = ref<RadioCategory[]>([])
  const currentStation = ref<RadioStation | null>(null)
  const currentPrograms = ref<RadioProgram[]>([])
  const currentProgram = ref<RadioProgram | null>(null)
  const loading = ref(false)
  const loadingMorePrograms = ref(false)
  const hasMorePrograms = ref(true)
  const programsOffset = ref(0)
  const error = ref<string | null>(null)

  // 订阅的电台列表
  const subscribedStations = ref<Set<number>>(new Set())

  // 初始化方法 - 确保持久化恢复后的数据类型正确
  const initializeStore = () => {
    console.log('🔧 [电台Store] 初始化订阅数据:', subscribedStations.value, typeof subscribedStations.value)
    if (!(subscribedStations.value instanceof Set)) {
      console.log('⚠️ [电台Store] 订阅数据不是Set类型，正在转换...')
      const stations = Array.isArray(subscribedStations.value)
        ? subscribedStations.value
        : Object.keys(subscribedStations.value || {}).map(Number)
      subscribedStations.value = new Set(stations)
      console.log('✅ [电台Store] 订阅数据转换完成:', subscribedStations.value)
    }
  }

  // 立即初始化
  initializeStore()

  // 方法

  /**
   * 加载电台首页数据
   */
  const loadHomeData = async () => {
    if (loading.value) return

    loading.value = true
    error.value = null

    try {
      console.log('🎵 [电台Store] 开始加载首页数据')

      // 并行加载多个数据
      const [categoriesResult, hotResult, recommendResult, typesResult] = await Promise.allSettled([
        radioApi.getCategoryList(),
        radioApi.getToplist('hot', 20),
        radioApi.getRecommend(),
        radioApi.getRecommendTypes()
      ])

      // 处理分类数据
      if (categoriesResult.status === 'fulfilled') {
        categories.value = categoriesResult.value.categories || []
        console.log(`✅ [电台Store] 分类加载完成: ${categories.value.length}个`)
      } else {
        console.warn('⚠️ [电台Store] 分类加载失败:', categoriesResult.reason)
      }

      // 处理热门电台
      if (hotResult.status === 'fulfilled') {
        hotStations.value = hotResult.value.toplist || []
        console.log(`✅ [电台Store] 热门电台加载完成: ${hotStations.value.length}个`)
      } else {
        console.warn('⚠️ [电台Store] 热门电台加载失败:', hotResult.reason)
      }

      // 处理推荐电台
      if (recommendResult.status === 'fulfilled') {
        recommendStations.value = recommendResult.value.djRadios || []
        console.log(`✅ [电台Store] 推荐电台加载完成: ${recommendStations.value.length}个`)
      } else {
        console.warn('⚠️ [电台Store] 推荐电台加载失败:', recommendResult.reason)
      }

      // 处理分类推荐
      if (typesResult.status === 'fulfilled') {
        // 将API返回的数据格式转换为我们需要的格式
        // 检查是否有嵌套的data字段
        const apiResponse = typesResult.value
        let apiData = []

        if (apiResponse && apiResponse.data) {
          apiData = apiResponse.data
        } else if (Array.isArray(apiResponse)) {
          apiData = apiResponse
        } else {
          console.warn('⚠️ [电台Store] 分类推荐数据格式异常:', apiResponse)
          apiData = []
        }

        categoryRecommends.value = apiData.map((item: any) => ({
          id: item.categoryId,
          name: item.categoryName,
          stations: item.radios || []
        }))
        console.log(`✅ [电台Store] 分类推荐加载完成: ${categoryRecommends.value.length}个`)
      } else {
        console.warn('⚠️ [电台Store] 分类推荐加载失败:', typesResult.reason)
      }

      console.log('✅ [电台Store] 首页数据加载完成')
      console.log('📊 [电台Store] 数据统计:', {
        categories: categories.value.length,
        hotStations: hotStations.value.length,
        recommendStations: recommendStations.value.length,
        categoryRecommends: categoryRecommends.value.length
      })

    } catch (error) {
      console.error('❌ [电台Store] 首页数据加载失败:', error)
      error.value = '加载电台数据失败'
      showToast('加载电台数据失败，请重试', 'danger')
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取分类热门电台
   */
  const loadCategoryStations = async (categoryId: number, limit = 50, offset = 0) => {
    try {
      console.log(`🎵 [电台Store] 加载分类电台: ${categoryId}, limit: ${limit}, offset: ${offset}`)
      const result = await radioApi.getCategoryHot(categoryId, limit, offset)
      console.log(`✅ [电台Store] 分类电台加载完成: ${result.djRadios?.length || 0}个, hasMore: ${result.hasMore}`)
      return result
    } catch (error) {
      console.error('❌ [电台Store] 分类电台加载失败:', error)
      showToast('加载分类电台失败', 'danger')
      return []
    }
  }

  // 热门电台完整数据缓存
  let allHotStations: any[] = []

  /**
   * 获取热门电台（分页）
   */
  const loadHotStations = async (limit = 50, offset = 0) => {
    try {
      console.log(`🎵 [电台Store] 加载热门电台: limit: ${limit}, offset: ${offset}`)

      // 如果是第一次加载或缓存为空，获取所有数据
      if (offset === 0 || allHotStations.length === 0) {
        const result = await radioApi.getToplist('hot', 100, 0) // 获取足够多的数据
        allHotStations = result.toplist || []
        console.log(`✅ [电台Store] 热门电台全量加载完成: ${allHotStations.length}个`)
      }

      // 客户端分页
      const start = offset
      const end = offset + limit
      const paginatedData = allHotStations.slice(start, end)
      const hasMore = end < allHotStations.length

      console.log(`✅ [电台Store] 热门电台分页完成: 返回${paginatedData.length}个 (${start}-${end-1}), 总计${allHotStations.length}个, hasMore: ${hasMore}`)
      return {
        djRadios: paginatedData,
        hasMore: hasMore
      }
    } catch (error) {
      console.error('❌ [电台Store] 加载热门电台失败:', error)
      throw error
    }
  }

  /**
   * 获取推荐电台（使用个性推荐）
   */
  const loadRecommendStations = async (limit = 50, offset = 0) => {
    try {
      console.log(`🎵 [电台Store] 加载推荐电台: limit: ${limit}, offset: ${offset}`)
      // 推荐电台API不支持分页，使用个性推荐API
      const result = await radioApi.getPersonalized()
      const djRadios = result.djRadios || []

      // 模拟分页
      const start = offset
      const end = offset + limit
      const paginatedData = djRadios.slice(start, end)

      console.log(`✅ [电台Store] 推荐电台加载完成: ${paginatedData.length}个`)
      return {
        djRadios: paginatedData,
        hasMore: end < djRadios.length
      }
    } catch (error) {
      console.error('❌ [电台Store] 加载推荐电台失败:', error)
      throw error
    }
  }

  /**
   * 获取电台详情和节目列表
   */
  const loadStationDetail = async (stationId: number) => {
    loading.value = true

    try {
      console.log(`🎵 [电台Store] 加载电台详情: ${stationId}`)

      // 重置节目分页状态
      programsOffset.value = 0
      hasMorePrograms.value = true
      currentPrograms.value = []

      // 并行加载电台详情和节目列表
      const [detailResult, programsResult] = await Promise.allSettled([
        radioApi.getDetail(stationId),
        radioApi.getPrograms(stationId, 50, 0)
      ])

      // 处理电台详情
      if (detailResult.status === 'fulfilled') {
        // 检查响应数据结构，可能有双层嵌套
        const response = detailResult.value
        if (response && response.data && response.data.data) {
          currentStation.value = response.data.data
        } else if (response && response.data) {
          currentStation.value = response.data
        } else {
          currentStation.value = response
        }
        console.log(`✅ [电台Store] 电台详情加载完成: ${currentStation.value?.name}`)
      } else {
        console.warn('⚠️ [电台Store] 电台详情加载失败:', detailResult.reason)
        throw new Error('电台详情加载失败')
      }

      // 处理节目列表
      if (programsResult.status === 'fulfilled') {
        // 检查响应数据结构，可能有嵌套
        const response = programsResult.value
        let programs = []

        if (response && response.programs) {
          programs = response.programs
        } else if (response && response.data && response.data.programs) {
          programs = response.data.programs
        } else if (Array.isArray(response)) {
          programs = response
        }

        // 格式化节目数据
        currentPrograms.value = programs.map((program: any) => formatRadioProgram(program))
        programsOffset.value = 50
        // 使用 API 返回的 more 字段
        hasMorePrograms.value = response.more === true || response.data?.more === true
        console.log(`✅ [电台Store] 节目列表加载完成: ${currentPrograms.value.length}个, API more: ${response.more || response.data?.more}, hasMore: ${hasMorePrograms.value}`)

        // 调试：检查第一个节目的封面图
        if (currentPrograms.value.length > 0) {
          const firstProgram = currentPrograms.value[0]
          console.log(`🖼️ [电台Store] 第一个节目封面: ${firstProgram.name} -> ${firstProgram.picUrl}`)
        }
      } else {
        console.warn('⚠️ [电台Store] 节目列表加载失败:', programsResult.reason)
        currentPrograms.value = []
        hasMorePrograms.value = false
      }

    } catch (error) {
      console.error('❌ [电台Store] 电台详情加载失败:', error)
      error.value = '加载电台详情失败'
      showToast('加载电台详情失败', 'danger')
    } finally {
      loading.value = false
    }
  }

  /**
   * 加载更多节目
   */
  const loadMorePrograms = async (stationId: number) => {
    if (loadingMorePrograms.value || !hasMorePrograms.value) return

    loadingMorePrograms.value = true

    try {
      console.log(`🎵 [电台Store] 加载更多节目: ${stationId}, offset: ${programsOffset.value}`)
      const result = await radioApi.getPrograms(stationId, 50, programsOffset.value)

      let programs = []
      if (result && result.programs) {
        programs = result.programs
      } else if (result && result.data && result.data.programs) {
        programs = result.data.programs
      } else if (Array.isArray(result)) {
        programs = result
      }

      // 格式化并追加节目数据
      const formattedPrograms = programs.map((program: any) => formatRadioProgram(program))
      currentPrograms.value = [...currentPrograms.value, ...formattedPrograms]

      // 更新分页状态
      programsOffset.value += 50
      // 使用 API 返回的 more 字段
      hasMorePrograms.value = result.more === true || result.data?.more === true

      console.log(`✅ [电台Store] 更多节目加载完成: +${formattedPrograms.length}个, 总计: ${currentPrograms.value.length}个, API more: ${result.more || result.data?.more}, hasMore: ${hasMorePrograms.value}`)

    } catch (error) {
      console.error('❌ [电台Store] 加载更多节目失败:', error)
      showToast('加载更多节目失败', 'danger')
    } finally {
      loadingMorePrograms.value = false
    }
  }

  /**
   * 获取节目详情
   */
  const loadProgramDetail = async (programId: number) => {
    try {
      console.log(`🎵 [电台Store] 加载节目详情: ${programId}`)
      const result = await radioApi.getProgramDetail(programId)
      currentProgram.value = result.program
      console.log(`✅ [电台Store] 节目详情加载完成: ${currentProgram.value?.name}`)
      return result.program
    } catch (error) {
      console.error('❌ [电台Store] 节目详情加载失败:', error)
      showToast('加载节目详情失败', 'danger')
      return null
    }
  }

  /**
   * 订阅/取消订阅电台
   */
  const toggleSubscribe = async (stationId: number) => {
    try {
      // 确保 subscribedStations 是 Set 对象
      if (!(subscribedStations.value instanceof Set)) {
        const stations = Array.isArray(subscribedStations.value)
          ? subscribedStations.value
          : Object.keys(subscribedStations.value || {}).map(Number)
        subscribedStations.value = new Set(stations)
      }

      const isSubscribed = subscribedStations.value.has(stationId)
      const action = isSubscribed ? 0 : 1

      console.log(`🎵 [电台Store] ${isSubscribed ? '取消订阅' : '订阅'}电台: ${stationId}`)

      await radioApi.subscribe(stationId, action)

      if (isSubscribed) {
        subscribedStations.value.delete(stationId)
        showToast('取消订阅成功', 'success')
      } else {
        subscribedStations.value.add(stationId)
        showToast('订阅成功', 'success')
      }

      console.log(`✅ [电台Store] ${isSubscribed ? '取消订阅' : '订阅'}成功`)

    } catch (error) {
      console.error('❌ [电台Store] 订阅操作失败:', error)
      showToast('订阅操作失败', 'danger')
    }
  }

  /**
   * 检查是否已订阅
   */
  const isSubscribed = (stationId: number) => {
    console.log('🔍 [电台Store] 检查订阅状态:', stationId, subscribedStations.value, typeof subscribedStations.value)
    // 确保 subscribedStations 是 Set 对象
    if (!(subscribedStations.value instanceof Set)) {
      console.log('⚠️ [电台Store] isSubscribed: 订阅数据不是Set类型，正在转换...')
      // 如果不是 Set，转换为 Set（处理持久化恢复的情况）
      const stations = Array.isArray(subscribedStations.value)
        ? subscribedStations.value
        : Object.keys(subscribedStations.value || {}).map(Number)
      subscribedStations.value = new Set(stations)
      console.log('✅ [电台Store] isSubscribed: 订阅数据转换完成:', subscribedStations.value)
    }
    const result = subscribedStations.value.has(stationId)
    console.log('📊 [电台Store] 订阅检查结果:', stationId, result)
    return result
  }

  /**
   * 清除当前数据
   */
  const clearCurrentData = () => {
    currentStation.value = null
    currentPrograms.value = []
    currentProgram.value = null
    programsOffset.value = 0
    hasMorePrograms.value = true
    loadingMorePrograms.value = false
    error.value = null
  }

  /**
   * 重新加载数据
   */
  const refresh = async () => {
    await loadHomeData()
  }

  return {
    // 状态
    categories,
    hotStations,
    recommendStations,
    categoryRecommends,
    currentStation,
    currentPrograms,
    currentProgram,
    loading,
    loadingMorePrograms,
    hasMorePrograms,
    programsOffset,
    error,
    subscribedStations,

    // 方法
    initializeStore,
    loadHomeData,
    loadCategoryStations,
    loadHotStations,
    loadRecommendStations,
    loadStationDetail,
    loadMorePrograms,
    loadProgramDetail,
    toggleSubscribe,
    isSubscribed,
    clearCurrentData,
    refresh
  }
}, {
  persist: {
    paths: ['subscribedStations']
  }
})
