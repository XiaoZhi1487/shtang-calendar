// =============================================
// 沙塘圩日历 - API 服务器
// =============================================
import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 配置
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const DB_CONFIG = {
  host: process.env.DB_HOST || 'mysql6.sqlpub.com',
  port: parseInt(process.env.DB_PORT) || 3311,
  user: process.env.DB_USER || 'xiaott',
  password: process.env.DB_PASSWORD || 'b1y6ukxRrVGopQH7',
  database: process.env.DB_NAME || 'shatang_userdata',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const app = express();
const pool = mysql.createPool(DB_CONFIG);

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// =============================================
// 用户认证中间件
// =============================================
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: '未登录' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: '登录已过期，请重新登录' });
  }
};

// =============================================
// API 路由
// =============================================

// 注册
app.post('/api/register', async (req, res) => {
  try {
    const { phone, password } = req.body;

    // 检查手机号是否已注册
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE phone = ?',
      [phone]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: '该手机号已注册' });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const [result] = await pool.query(
      'INSERT INTO users (phone, password) VALUES (?, ?)',
      [phone, hashedPassword]
    );

    // 生成 Token
    const token = jwt.sign({ userId: result.insertId, phone }, JWT_SECRET, { expiresIn: '365d' });

    res.json({ success: true, token, userId: result.insertId, phone });
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 登录
app.post('/api/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    // 查找用户
    const [users] = await pool.query(
      'SELECT id, phone, password FROM users WHERE phone = ?',
      [phone]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: '手机号或密码错误' });
    }

    const user = users[0];

    // 验证密码
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: '手机号或密码错误' });
    }

    // 生成 Token
    const token = jwt.sign({ userId: user.id, phone: user.phone }, JWT_SECRET, { expiresIn: '365d' });

    res.json({ success: true, token, userId: user.id, phone: user.phone });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 检查更新
app.get('/api/version/latest', async (req, res) => {
  try {
    const [versions] = await pool.query(
      'SELECT * FROM app_version ORDER BY created_at DESC LIMIT 1'
    );

    if (versions.length > 0) {
      res.json({
        hasUpdate: true,
        version: versions[0].version,
        releaseNote: versions[0].release_note,
        downloadUrl: versions[0].download_url,
      });
    } else {
      res.json({ hasUpdate: false, version: '', releaseNote: '', downloadUrl: '' });
    }
  } catch (error) {
    console.error('检查更新失败:', error);
    res.status(500).json({ hasUpdate: false, version: '', releaseNote: '', downloadUrl: '', error: '服务器错误' });
  }
});

// 添加新版本（简单密码保护）
app.post('/api/version/add', async (req, res) => {
  try {
    const { version, releaseNote, downloadUrl, secret } = req.body;
    
    // 简单保护（生产环境应该用更安全的方式）
    if (secret !== 'shtang123') {
      return res.status(401).json({ error: '未授权' });
    }
    
    if (!version || !downloadUrl) {
      return res.status(400).json({ error: '参数不完整' });
    }
    
    await pool.query(
      'INSERT INTO app_version (version, release_note, download_url) VALUES (?, ?, ?)',
      [version, releaseNote || '新版本发布', downloadUrl]
    );
    
    res.json({ success: true, message: `版本 ${version} 添加成功` });
  } catch (error) {
    console.error('添加版本失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// =============================================
// 记账 API
// =============================================

// 获取记账列表
app.get('/api/accounts', authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;
    let query = 'SELECT * FROM accounts WHERE user_id = ?';
    const params = [req.user.userId];

    if (startDate && endDate) {
      query += ' AND record_date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    query += ' ORDER BY record_date DESC, created_at DESC';

    const [accounts] = await pool.query(query, params);
    res.json({ accounts });
  } catch (error) {
    console.error('获取记账列表失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 添加记账
app.post('/api/accounts', authMiddleware, async (req, res) => {
  try {
    const { type, category, subCategory, amount, unit, quantity, note, recordDate } = req.body;

    const [result] = await pool.query(
      `INSERT INTO accounts 
       (user_id, type, category, sub_category, amount, unit, quantity, note, record_date) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.userId, type, category, subCategory, amount, unit, quantity, note, recordDate]
    );

    res.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error('添加记账失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// =============================================
// 日记 API
// =============================================

// 获取日记列表
app.get('/api/diaries', authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = 'SELECT * FROM diaries WHERE user_id = ?';
    const params = [req.user.userId];

    if (startDate && endDate) {
      query += ' AND record_date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    query += ' ORDER BY record_date DESC, created_at DESC';

    const [diaries] = await pool.query(query, params);
    res.json({ diaries });
  } catch (error) {
    console.error('获取日记列表失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 添加日记
app.post('/api/diaries', authMiddleware, async (req, res) => {
  try {
    const { title, content, recordDate } = req.body;

    const [result] = await pool.query(
      'INSERT INTO diaries (user_id, title, content, record_date) VALUES (?, ?, ?, ?)',
      [req.user.userId, title, content, recordDate]
    );

    res.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error('添加日记失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// =============================================
// 数据同步
// =============================================

// 上传数据（先清空该用户数据，再整体写入——支持删除操作的同步）
app.post('/api/sync/upload', authMiddleware, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const { accounts, diaries } = req.body;

    // 先清空该用户的现有数据
    await conn.query('DELETE FROM accounts WHERE user_id = ?', [req.user.userId]);
    await conn.query('DELETE FROM diaries WHERE user_id = ?', [req.user.userId]);

    // 写入记账
    if (accounts && accounts.length > 0) {
      for (const account of accounts) {
        await conn.query(
          `INSERT INTO accounts 
           (user_id, type, category, sub_category, amount, unit, quantity, note, record_date) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            req.user.userId,
            account.type,
            account.category,
            account.subCategory ?? null,
            account.amount,
            account.unit ?? null,
            account.quantity ?? null,
            account.note ?? null,
            account.recordDate
          ]
        );
      }
    }

    // 写入日记
    if (diaries && diaries.length > 0) {
      for (const diary of diaries) {
        await conn.query(
          'INSERT INTO diaries (user_id, content, record_date) VALUES (?, ?, ?)',
          [req.user.userId, diary.content, diary.recordDate]
        );
      }
    }

    await conn.commit();
    res.json({ success: true });
  } catch (error) {
    try { await conn.rollback(); } catch {}
    console.error('上传数据失败:', error);
    res.status(500).json({ error: '服务器错误' });
  } finally {
    conn.release();
  }
});

// 下载数据（字段名转为 camelCase，方便前端直接使用）
app.get('/api/sync/download', authMiddleware, async (req, res) => {
  try {
    const [accountsRaw] = await pool.query(
      'SELECT id, type, category, sub_category AS subCategory, amount, unit, quantity, note, record_date AS recordDate FROM accounts WHERE user_id = ? ORDER BY record_date DESC',
      [req.user.userId]
    );

    const [diariesRaw] = await pool.query(
      'SELECT content, record_date AS recordDate FROM diaries WHERE user_id = ? ORDER BY record_date DESC',
      [req.user.userId]
    );

    res.json({ accounts: accountsRaw, diaries: diariesRaw });
  } catch (error) {
    console.error('下载数据失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log('========================================');
  console.log('🚀 服务器已启动！');
  console.log('========================================');
  console.log(`📡 本地访问：http://localhost:${PORT}`);
  console.log(`📡 网络访问：http://0.0.0.0:${PORT}`);
  console.log('');
  console.log('📋 API 端点：');
  console.log('   - GET  /api/health       健康检查');
  console.log('   - POST /api/login        登录');
  console.log('   - POST /api/register     注册');
  console.log('   - GET  /api/version/latest  检查更新');
  console.log('   - GET  /api/accounts     记账列表');
  console.log('   - POST /api/accounts     添加记账');
  console.log('   - GET  /api/diaries      日记列表');
  console.log('   - POST /api/diaries      添加日记');
  console.log('   - POST /api/sync/upload  上传数据');
  console.log('   - GET  /api/sync/download 下载数据');
  console.log('========================================');
});
