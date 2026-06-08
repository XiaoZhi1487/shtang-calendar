// =============================================
// 添加新版本到数据库
// 使用方法：node add-version.js <版本号> <下载链接> [更新说明]
// =============================================
import mysql from 'mysql2/promise';

const DB_CONFIG = {
  host: 'mysql6.sqlpub.com',
  port: 3311,
  user: 'xiaott',
  password: 'b1y6ukxRrVGopQH7',
  database: 'shatang_userdata',
};

async function addVersion() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('使用方法：');
    console.log('  node add-version.js <版本号> <下载链接> [更新说明]');
    console.log('');
    console.log('示例：');
    console.log('  node add-version.js 1.0.1 https://your-domain.com/app.apk "修复了一些问题"');
    console.log('');
    process.exit(1);
  }

  const version = args[0];
  const downloadUrl = args[1];
  const releaseNote = args[2] || '新版本发布';

  let connection;
  try {
    connection = await mysql.createConnection(DB_CONFIG);
    
    console.log('正在添加版本...');
    console.log(`版本号：${version}`);
    console.log(`下载链接：${downloadUrl}`);
    console.log(`更新说明：${releaseNote}`);
    console.log('');

    await connection.query(
      `INSERT INTO app_version (version, release_note, download_url) VALUES (?, ?, ?)`,
      [version, releaseNote, downloadUrl]
    );

    console.log('✅ 版本添加成功！');

    // 显示当前版本列表
    const [versions] = await connection.query(
      'SELECT * FROM app_version ORDER BY created_at DESC'
    );

    console.log('');
    console.log('当前所有版本：');
    versions.forEach((v, i) => {
      console.log(`  ${i + 1}. v${v.version}`);
      console.log(`     更新时间：${v.created_at}`);
    });

  } catch (error) {
    console.error('❌ 失败：', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

addVersion();
