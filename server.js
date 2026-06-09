// ============================================================
// 沙塘圩日历 - API 服务器（MySQL 8.4.3）
// 最简实现：注册/登录 + 记账查增删，每次操作直连 MySQL
// ============================================================
import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---- 配置 ----
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'shtang-calendar-secret';

const DB_CONFIG = {
  host: 'mysql6.sqlpub.com',
  port: 3311,
  user: 'xiaott',
  password: 'b1y6ukxRrVGopQH7',
  database: 'shatang_userdata',
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  connectTimeout: 15000,
};

const pool = mysql.createPool(DB_CONFIG);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// ============================================================
// 启动：先检查表/建表
// ============================================================
async function init() {
  try {
    const [tables] = await pool.query('SHOW TABLES');
    const existing = tables.map(r => Object.values(r)[0]);
    console.log('已有表:', existing.join(', ') || '(空)');

    // users 表
    if (!existing.includes('users')) {
      await pool.query(`
        CREATE TABLE users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          phone VARCHAR(64) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ 已创建 users 表');
    }

    // accounts 表（记账）
    if (!existing.includes('accounts')) {
      await pool.query(`
        CREATE TABLE accounts (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          type VARCHAR(16) NOT NULL,
          category VARCHAR(64) NOT NULL,
          sub_category VARCHAR(64),
          amount DECIMAL(10,2) NOT NULL,
          unit VARCHAR(16),
          quantity DECIMAL(10,2),
          note VARCHAR(512),
          record_date DATE NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_user_id (user_id)
        )
      `);
      console.log('✅ 已创建 accounts 表');
    }

    // app_version 表（版本检查）
    if (!existing.includes('app_version')) {
      await pool.query(`
        CREATE TABLE app_version (
          id INT AUTO_INCREMENT PRIMARY KEY,
          version VARCHAR(32) NOT NULL,
          release_note VARCHAR(512),
          download_url VARCHAR(512),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ 已创建 app_version 表');
    }

    // feedback 表（意见反馈）
    if (!existing.includes('feedback')) {
      await pool.query(`
        CREATE TABLE feedback (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT,
          phone VARCHAR(64),
          content TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_user_id (user_id),
          INDEX idx_created_at (created_at)
        )
      `);
      console.log('✅ 已创建 feedback 表');
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log('========================================');
      console.log('🚀 服务器已启动 端口', PORT);
      console.log('========================================');
      console.log('   POST /api/register           注册');
      console.log('   POST /api/login              登录');
      console.log('   GET  /api/accounts           查询记账');
      console.log('   POST /api/accounts           新增记账');
      console.log('   DELETE /api/accounts/:id     删除记账');
      console.log('   POST /api/feedback           提交意见反馈');
      console.log('   POST /api/version/add        发布新版本');
      console.log('   GET  /api/version/latest     获取最新版本');
      console.log('   GET  /api/health             健康检查');
      console.log('========================================');
    });
  } catch (err) {
    console.error('❌ 初始化失败:', err.message);
    process.exit(1);
  }
}

// ============================================================
// Token 认证中间件：从 Authorization: Bearer <token> 解析 userId
// ============================================================
function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  console.log('[auth] Authorization header:', header.substring(0, 80) + (header.length > 80 ? '...' : ''));
  if (!token) return res.status(401).json({ error: '未登录' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('[auth] 解析成功 userId:', decoded.userId);
    req.userId = decoded.userId;
    next();
  } catch (e) {
    console.error('[auth] 解析失败:', e.message);
    res.status(401).json({ error: '登录已过期' });
  }
}

// ============================================================
// API 路由
// ============================================================

// --- 注册 ---
app.post('/api/register', async (req, res) => {
  try {
    const { phone, password } = req.body;
    console.log('[注册] phone:', phone);
    if (!phone || !password) return res.status(400).json({ error: '手机号和密码必填' });

    const [exist] = await pool.query('SELECT id FROM users WHERE phone = ?', [phone]);
    if (exist.length > 0) return res.status(400).json({ error: '手机号已注册' });

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (phone, password) VALUES (?, ?)',
      [phone, hashed]
    );
    const userId = result.insertId;
    const token = jwt.sign({ userId, phone }, JWT_SECRET, { expiresIn: '3650d' });
    console.log('[注册成功] userId:', userId);
    res.json({ success: true, token, userId, phone });
  } catch (e) {
    console.error('[注册失败]:', e.message);
    res.status(500).json({ error: '服务器错误', detail: e.message });
  }
});

// --- 登录 ---
app.post('/api/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    console.log('[登录] phone:', phone);
    if (!phone || !password) return res.status(400).json({ error: '手机号和密码必填' });

    const [rows] = await pool.query('SELECT id, phone, password FROM users WHERE phone = ?', [phone]);
    if (rows.length === 0) return res.status(401).json({ error: '手机号或密码错误' });

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: '手机号或密码错误' });

    const token = jwt.sign({ userId: user.id, phone: user.phone }, JWT_SECRET, { expiresIn: '3650d' });
    console.log('[登录成功] userId:', user.id);
    res.json({ success: true, token, userId: user.id, phone: user.phone });
  } catch (e) {
    console.error('[登录失败]:', e.message);
    res.status(500).json({ error: '服务器错误', detail: e.message });
  }
});

// --- 查询记账（查该用户全部） ---
app.get('/api/accounts', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, type, category, 
              sub_category AS subCategory, 
              amount, unit, quantity, note, 
              DATE_FORMAT(record_date, '%Y-%m-%d') AS recordDate
       FROM accounts WHERE user_id = ? ORDER BY record_date DESC, id DESC`,
      [req.userId]
    );
    // 打印第一条样本以便排查
    if (rows.length > 0) {
      console.log(`[查询记账] userId ${req.userId}: ${rows.length} 条, 第一条 recordDate=${JSON.stringify(rows[0].recordDate)} (type=${typeof rows[0].recordDate})`);
    } else {
      console.log(`[查询记账] userId ${req.userId}: 0 条`);
    }
    res.json({ accounts: rows });
  } catch (e) {
    console.error('[查询记账失败]:', e.message);
    res.status(500).json({ error: '服务器错误', detail: e.message });
  }
});

// --- 新增记账 ---
app.post('/api/accounts', auth, async (req, res) => {
  try {
    const { type, category, subCategory, amount, unit, quantity, note, recordDate } = req.body;
    if (!type || !category || !amount || !recordDate) {
      return res.status(400).json({ error: '参数不完整' });
    }
    const [result] = await pool.query(
      `INSERT INTO accounts (user_id, type, category, sub_category, amount, unit, quantity, note, record_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.userId, type, category, subCategory || null, Number(amount), unit || null, quantity || null, note || null, recordDate]
    );
    console.log(`[新增记账] userId ${req.userId}, id ${result.insertId}`);
    res.json({ success: true, id: result.insertId });
  } catch (e) {
    console.error('[新增记账失败]:', e.message);
    res.status(500).json({ error: '服务器错误', detail: e.message });
  }
});

// --- 删除记账（必须是该用户自己的） ---
app.delete('/api/accounts/:id', auth, async (req, res) => {
  try {
    const id = req.params.id;
    const [result] = await pool.query(
      'DELETE FROM accounts WHERE id = ? AND user_id = ?',
      [id, req.userId]
    );
    console.log(`[删除记账] userId ${req.userId}, id ${id}, 影响行 ${result.affectedRows}`);
    res.json({ success: result.affectedRows > 0 });
  } catch (e) {
    console.error('[删除记账失败]:', e.message);
    res.status(500).json({ error: '服务器错误', detail: e.message });
  }
});

// --- 提交意见反馈（允许登录/未登录用户提交）---
app.post('/api/feedback', async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: '反馈内容不能为空' });
    }
    if (content.length > 2000) {
      return res.status(400).json({ error: '反馈内容过长（最多 2000 字）' });
    }

    // 尝试解析 token（有则记录用户信息，没有也允许提交）
    let userId = null;
    let phone = null;
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.userId;
        phone = decoded.phone || null;
      } catch (e) { /* token 无效也不拒绝提交 */ }
    }

    const [result] = await pool.query(
      'INSERT INTO feedback (user_id, phone, content) VALUES (?, ?, ?)',
      [userId, phone, content.trim()]
    );
    console.log(`[反馈提交] id=${result.insertId}, user_id=${userId}, phone=${phone}, 长度=${content.length}`);
    res.json({ success: true, id: result.insertId });
  } catch (e) {
    console.error('[反馈提交失败]:', e.message);
    res.status(500).json({ error: '服务器错误', detail: e.message });
  }
});

// --- 健康检查 ---
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- 发布新版本（需要秘钥验证）---
app.post('/api/version/add', async (req, res) => {
  try {
    const { version, releaseNote, downloadUrl, secret } = req.body;
    
    // 验证必填字段
    if (!version || !downloadUrl || !secret) {
      return res.status(400).json({ error: '版本号、下载链接和发布秘钥必填' });
    }
    
    // 验证发布秘钥（从环境变量读取，默认为 shtang2024）
    const PUBLISH_SECRET = process.env.PUBLISH_SECRET || 'shtang2024';
    if (secret !== PUBLISH_SECRET) {
      return res.status(403).json({ error: '发布秘钥错误' });
    }
    
    // 插入新版本
    const [result] = await pool.query(
      'INSERT INTO app_version (version, release_note, download_url) VALUES (?, ?, ?)',
      [version, releaseNote || '新版本发布', downloadUrl]
    );
    
    console.log(`[发布新版本] version=${version}, id=${result.insertId}`);
    res.json({ success: true, message: `版本 ${version} 发布成功`, id: result.insertId });
  } catch (e) {
    console.error('[发布新版本失败]:', e.message);
    res.status(500).json({ error: '服务器错误', detail: e.message });
  }
});

// --- 获取最新版本（供 App 检查更新）---
app.get('/api/version/latest', async (_req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT version, release_note AS releaseNote, download_url AS downloadUrl, created_at AS createdAt FROM app_version ORDER BY created_at DESC LIMIT 1'
    );
    
    if (rows.length === 0) {
      return res.json({ hasUpdate: false, message: '暂无版本信息' });
    }
    
    res.json({ 
      success: true, 
      version: rows[0]
    });
  } catch (e) {
    console.error('[获取最新版本失败]:', e.message);
    res.status(500).json({ error: '服务器错误', detail: e.message });
  }
});

init();
