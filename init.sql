-- =============================================
-- 沙塘圩日历 - 数据库初始化脚本
-- 版本：1.0.0
-- 创建日期：2024
-- =============================================

-- 使用现有数据库
USE shatang_userdata;

-- =============================================
-- 1. 用户表
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
    phone VARCHAR(20) NOT NULL UNIQUE COMMENT '手机号',
    password VARCHAR(255) NOT NULL COMMENT '密码（加密）',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- =============================================
-- 2. 记账表
-- =============================================
CREATE TABLE IF NOT EXISTS accounts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '记账ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    type VARCHAR(20) NOT NULL COMMENT '类型：income/expense',
    category VARCHAR(50) NOT NULL COMMENT '分类',
    sub_category VARCHAR(50) COMMENT '子分类',
    amount DECIMAL(10,2) NOT NULL COMMENT '金额',
    unit VARCHAR(20) COMMENT '单位',
    quantity DECIMAL(10,2) COMMENT '数量',
    note TEXT COMMENT '备注',
    record_date DATE NOT NULL COMMENT '记账日期',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_user_id (user_id),
    INDEX idx_record_date (record_date),
    INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='记账表';

-- =============================================
-- 3. 日记表
-- =============================================
CREATE TABLE IF NOT EXISTS diaries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '日记ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    title VARCHAR(200) COMMENT '标题',
    content TEXT COMMENT '内容',
    record_date DATE NOT NULL COMMENT '日记日期',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_user_id (user_id),
    INDEX idx_record_date (record_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='日记表';

-- =============================================
-- 4. 版本表
-- =============================================
CREATE TABLE IF NOT EXISTS app_version (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '版本ID',
    version VARCHAR(20) NOT NULL COMMENT '版本号，如 1.0.1',
    min_version VARCHAR(20) COMMENT '最低兼容版本',
    release_note TEXT COMMENT '更新说明',
    download_url VARCHAR(500) NOT NULL COMMENT 'APK下载链接',
    is_force_update TINYINT DEFAULT 0 COMMENT '是否强制更新：0-否，1-是',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_version (version)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='App版本表';

-- =============================================
-- 5. 插入初始版本数据
-- =============================================
INSERT IGNORE INTO app_version (version, release_note, download_url) VALUES 
('1.0.0', '沙塘圩日历正式上线！\n- 圩日历功能\n- 记账本功能\n- 日记功能\n- 主题切换', 'https://your-domain.com/apk/shtang-calendar-1.0.0.apk');

-- =============================================
-- 初始化完成
-- =============================================
SELECT '数据库初始化成功！' AS message;
