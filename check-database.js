// =============================================
// 检查现有数据库
// =============================================
import mysql from 'mysql2/promise';

const DB_CONFIG = {
  host: 'mysql6.sqlpub.com',
  port: 3311,
  user: 'xiaott',
  password: 'b1y6ukxRrVGopQH7'
};

async function checkDatabase() {
  console.log('========================================');
  console.log('检查数据库...');
  console.log('========================================');

  let connection;
  try {
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ 数据库连接成功！');

    // 查询所有数据库
    const [databases] = await connection.query('SHOW DATABASES');
    console.log('\n📋 现有数据库：');
    databases.forEach(db => {
      console.log(`   - ${db.Database}`);
    });

    console.log('\n========================================');
    console.log('💡 提示：');
    console.log('   你需要在 SQLPub 界面上创建数据库 "shtang_calendar"');
    console.log('   或者告诉我你想用哪个现有数据库');
    console.log('========================================');

  } catch (error) {
    console.error('\n❌ 失败：');
    console.error(error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkDatabase();
