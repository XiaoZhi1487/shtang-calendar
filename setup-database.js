// =============================================
// 数据库初始化脚本 (ES Module)
// =============================================
import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 数据库配置
const DB_CONFIG = {
  host: 'mysql6.sqlpub.com',
  port: 3311,
  user: 'xiaott',
  password: 'b1y6ukxRrVGopQH7',
  multipleStatements: true
};

const DB_NAME = 'shatang_userdata';

async function setupDatabase() {
  console.log('========================================');
  console.log('开始初始化数据库...');
  console.log('========================================');

  let connection;
  try {
    // 1. 连接数据库
    console.log('\n1. 连接数据库...');
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('   ✅ 数据库连接成功！');

    // 2. 读取并执行 SQL 脚本
    console.log('\n2. 执行数据库初始化脚本...');
    const sqlPath = path.join(__dirname, 'init.sql');
    const sqlScript = await fs.readFile(sqlPath, 'utf8');
    
    await connection.query(sqlScript);
    console.log('   ✅ 数据库表创建成功！');

    // 3. 验证
    console.log('\n3. 验证数据库结构...');
    const [tables] = await connection.query(`
      SELECT TABLE_NAME FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ?
    `, [DB_NAME]);
    
    console.log('   ✅ 数据库表：');
    tables.forEach(table => {
      console.log(`     - ${table.TABLE_NAME}`);
    });

    // 4. 查询版本数据
    const [versions] = await connection.query(`SELECT * FROM ${DB_NAME}.app_version`);
    console.log('\n4. 版本数据：');
    versions.forEach(v => {
      console.log(`     - v${v.version}`);
      console.log(`       更新说明：${v.release_note}`);
    });

    console.log('\n========================================');
    console.log('✅ 数据库初始化完成！');
    console.log('========================================');
    console.log('\n📋 数据库信息：');
    console.log('   主机：mysql6.sqlpub.com:3311');
    console.log('   数据库：shatang_userdata');
    console.log('   用户名：xiaott');
    console.log('\n📋 已创建的表：');
    console.log('   - users（用户表）');
    console.log('   - accounts（记账表）');
    console.log('   - diaries（日记表）');
    console.log('   - app_version（版本表）');

  } catch (error) {
    console.error('\n❌ 数据库初始化失败：');
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase();
