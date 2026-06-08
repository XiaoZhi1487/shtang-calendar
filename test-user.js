
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

const DB_CONFIG = {
  host: 'mysql6.sqlpub.com',
  port: 3311,
  user: 'xiaott',
  password: 'b1y6ukxRrVGopQH7',
  database: 'shatang_userdata',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const testPhone = '17754570264';
const testPassword = '123456';

async function testUser() {
  console.log('========================================');
  console.log('🔍 测试用户查询');
  console.log('========================================');
  console.log('');

  const pool = mysql.createPool(DB_CONFIG);

  try {
    console.log('1️⃣ 连接数据库...');
    const [users] = await pool.query(
      'SELECT id, phone, password FROM users WHERE phone = ?',
      [testPhone]
    );

    console.log('2️⃣ 查询结果:', users.length > 0 ? '找到用户' : '未找到用户');
    console.log('');

    if (users.length > 0) {
      const user = users[0];
      console.log('✅ 用户信息:');
      console.log('   - ID:', user.id);
      console.log('   - 手机号:', user.phone);
      console.log('');

      console.log('3️⃣ 验证密码...');
      const isValid = await bcrypt.compare(testPassword, user.password);
      console.log('   密码验证结果:', isValid ? '✅ 正确' : '❌ 错误');
      console.log('');

      if (!isValid) {
        console.log('4️⃣ 准备重置密码...');
        const hashedPassword = await bcrypt.hash(testPassword, 10);
        const [result] = await pool.query(
          'UPDATE users SET password = ? WHERE phone = ?',
          [hashedPassword, testPhone]
        );
        console.log('   密码重置成功！影响行数:', result.affectedRows);
        console.log('');

        console.log('5️⃣ 再次验证新密码...');
        const isNewValid = await bcrypt.compare(testPassword, hashedPassword);
        console.log('   新密码验证结果:', isNewValid ? '✅ 正确' : '❌ 错误');
      }
    } else {
      console.log('4️⃣ 用户不存在，准备创建用户...');
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      const [result] = await pool.query(
        'INSERT INTO users (phone, password) VALUES (?, ?)',
        [testPhone, hashedPassword]
      );
      console.log('   用户创建成功！ID:', result.insertId);
    }

    console.log('');
    console.log('🎉 测试完成！现在可以尝试登录了！');
    console.log('');

  } catch (error) {
    console.error('❌ 错误:', error);
  } finally {
    await pool.end();
  }
}

testUser();

