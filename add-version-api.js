
// =============================================
// 通过 API 添加新版本（使用 Render 部署的后端）
// 使用方法：node add-version-api.js <版本号> <下载链接> [更新说明]
// =============================================

const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('使用方法：');
  console.log('  node add-version-api.js <版本号> <下载链接> [更新说明]');
  console.log('');
  process.exit(1);
}

const version = args[0];
const downloadUrl = args[1];
const releaseNote = args[2] || '新版本发布';

// 使用 Render 部署的后端
const API_BASE = 'https://shtang-calendar.onrender.com';

console.log('正在添加版本...');
console.log(`版本号：${version}`);
console.log(`下载链接：${downloadUrl}`);
console.log(`更新说明：${releaseNote}`);
console.log(`API 地址：${API_BASE}`);
console.log('');

// 先登录获取 token（使用一个测试账号）
async function addVersion() {
  try {
    // 1. 先检查是否有版本管理接口
    console.log('🔍 检查当前最新版本...');
    const versionRes = await fetch(`${API_BASE}/api/version/latest`);
    const versionData = await versionRes.json();
    
    if (versionRes.ok) {
      console.log('✅ 后端版本接口正常');
      console.log(`   当前最新版本：${versionData.version || '无'}`);
      console.log('');
    }
    
    // 2. 使用简单的 SQL 查询（通过 API 如果有）或者直接操作
    // 由于后端没有添加版本的 API，我们直接通过 MySQL 添加
    // 先尝试连接 MySQL
    console.log('📡 尝试连接数据库...');
    
    const mysql = await import('mysql2/promise');
    
    const DB_CONFIG = {
      host: 'mysql6.sqlpub.com',
      port: 3311,
      user: 'xiaott',
      password: 'b1y6ukxRrVGopQH7',
      database: 'shatang_userdata',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 30000
    };
    
    const pool = mysql.createPool(DB_CONFIG);
    const connection = await pool.getConnection();
    
    console.log('✅ 数据库连接成功');
    console.log('');
    console.log('📝 添加新版本...');
    
    await connection.query(
      `INSERT INTO app_version (version, release_note, download_url) VALUES (?, ?, ?)`,
      [version, releaseNote, downloadUrl]
    );
    
    console.log('✅ 版本添加成功！');
    console.log('');
    
    // 显示当前版本列表
    console.log('📋 当前所有版本：');
    const [versions] = await connection.query(
      'SELECT * FROM app_version ORDER BY created_at DESC'
    );
    
    versions.forEach((v, i) => {
      console.log(`  ${i + 1}. v${v.version}`);
      console.log(`     更新时间：${v.created_at}`);
      console.log(`     下载链接：${v.download_url}`);
      console.log(`     更新说明：${v.release_note}`);
      console.log('');
    });
    
    await connection.release();
    await pool.end();
    
    console.log('🎉 完成！');
    
  } catch (error) {
    console.error('❌ 失败：', error.message);
    console.log('');
    console.log('提示：请确保数据库可访问，或手动在数据库中执行：');
    console.log(`  INSERT INTO app_version (version, release_note, download_url) VALUES ('${version}', '${releaseNote}', '${downloadUrl}');`);
    process.exit(1);
  }
}

addVersion();

