// 测试新API的响应结构
import axios from 'axios';

async function testAPI() {
  try {
    console.log('🔍 测试API调用...');
    const response = await axios.get('https://wyy.331106.xyz/song', {
      params: { id: 1357375695, level: 'exhigh', type: 'url' }
    });

    console.log('📦 完整响应:', JSON.stringify(response.data, null, 2));
    console.log('🎵 URL路径测试:');
    console.log('  response.data.url:', response.data.url);
    console.log('  response.data.data.url:', response.data.data?.url);

    if (response.data.data?.url) {
      console.log('✅ 正确路径: response.data.data.url');
      console.log('🔗 播放链接:', response.data.data.url);
    } else if (response.data.url) {
      console.log('✅ 正确路径: response.data.url');
      console.log('🔗 播放链接:', response.data.url);
    } else {
      console.log('❌ 未找到URL');
    }

  } catch (error) {
    console.error('❌ API调用失败:', error.message);
  }
}

testAPI();
