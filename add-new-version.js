
// =============================================
// 通过 API 添加新版本（最简单的方式）
// 使用方法：node add-new-version.js <版本号> <下载链接> [更新说明]
// =============================================

const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('使用方法：');
  console.log('  node add-new-version.js <版本号> <下载链接> [更新说明]');
  console.log('');
  console.log('示例：');
  console.log('  node add-new-version.js 1.0.1 "https://xxx.apk" "修复已知问题"');
  console.log('');
  process.exit(1);
}

const version = args[0];
const downloadUrl = args[1];
const releaseNote = args[2] || '新版本发布';

// 使用 Render 部署的后端
const API_URL = 'https://shtang-calendar.onrender.com/api/version/add';

async function addVersion() {
  console.log('🚀 添加新版本...');
  console.log(`版本号：${version}`);
  console.log(`下载链接：${downloadUrl}`);
  console.log(`更新说明：${releaseNote}`);
  console.log(`API 地址：${API_URL}`);
  console.log('');
  
  try {
    console.log('⏳ 发送请求到后端...');
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: version,
        releaseNote: releaseNote,
        downloadUrl: downloadUrl,
        secret: 'shtang123'
      })
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ ' + data.message);
      console.log('');
      
      // 检查最新版本
      console.log('🔍 验证新版本...');
      const latestRes = await fetch('https://shtang-calendar.onrender.com/api/version/latest');
      const latestData = await latestRes.json();
      
      if (latestData.hasUpdate) {
        console.log('✅ 最新版本：v' + latestData.version);
        console.log('✅ 下载链接：' + latestData.downloadUrl);
        console.log('✅ 更新说明：' + latestData.releaseNote);
      }
      console.log('');
      console.log('🎉 完成！现在用户打开应用时会收到更新提示');
    } else {
      console.log('❌ 添加失败：' + data.error);
    }
    
  } catch (error) {
    console.error('❌ 网络错误：', error.message);
    console.log('');
    console.log('提示：确保后端已部署并且包含新版本管理功能');
  }
}

addVersion();

