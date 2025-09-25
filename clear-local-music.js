/**
 * 本地音乐清理脚本
 * 在浏览器控制台中运行此脚本来查看和删除本地音乐
 */

// 查看当前本地音乐列表
function viewLocalMusic() {
  const stored = localStorage.getItem('local-songs')
  if (!stored) {
    console.log('没有找到本地音乐数据')
    return []
  }
  
  const songs = JSON.parse(stored)
  console.log('当前本地音乐列表:')
  songs.forEach((song, index) => {
    console.log(`${index + 1}. ${song.name} - ${song.artist} (${song.format})`)
    console.log(`   ID: ${song.id}`)
    console.log(`   文件: ${song.filePath}`)
    console.log(`   大小: ${(song.size / 1024 / 1024).toFixed(2)}MB`)
    console.log('---')
  })
  
  return songs
}

// 删除指定ID的歌曲
function deleteLocalSong(songId) {
  const stored = localStorage.getItem('local-songs')
  if (!stored) {
    console.log('没有找到本地音乐数据')
    return
  }
  
  const songs = JSON.parse(stored)
  const filteredSongs = songs.filter(song => song.id !== songId)
  
  if (songs.length === filteredSongs.length) {
    console.log('未找到指定ID的歌曲')
    return
  }
  
  localStorage.setItem('local-songs', JSON.stringify(filteredSongs))
  console.log(`已删除歌曲 ID: ${songId}`)
  console.log(`剩余歌曲数量: ${filteredSongs.length}`)
}

// 清空所有本地音乐
function clearAllLocalMusic() {
  localStorage.removeItem('local-songs')
  console.log('已清空所有本地音乐数据')
}

// 删除最后导入的歌曲
function deleteLastImported() {
  const stored = localStorage.getItem('local-songs')
  if (!stored) {
    console.log('没有找到本地音乐数据')
    return
  }
  
  const songs = JSON.parse(stored)
  if (songs.length === 0) {
    console.log('没有歌曲可删除')
    return
  }
  
  // 按添加时间排序，删除最新的
  songs.sort((a, b) => b.dateAdded - a.dateAdded)
  const lastSong = songs[0]
  
  console.log(`准备删除最后导入的歌曲: ${lastSong.name}`)
  deleteLocalSong(lastSong.id)
}

// 使用说明
console.log('本地音乐管理脚本已加载')
console.log('可用命令:')
console.log('- viewLocalMusic() : 查看所有本地音乐')
console.log('- deleteLocalSong("歌曲ID") : 删除指定歌曲')
console.log('- deleteLastImported() : 删除最后导入的歌曲')
console.log('- clearAllLocalMusic() : 清空所有本地音乐')

// 自动显示当前音乐列表
viewLocalMusic()
