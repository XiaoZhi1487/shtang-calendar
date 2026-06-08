-- ==============================================
-- 沙塘圩日历 - 数据库初始化脚本
-- ==============================================

-- 设置字符集
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ==============================================
-- 1. 用户表 - 存储用户登录信息
-- ==============================================
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
    `phone` VARCHAR(20) NOT NULL UNIQUE COMMENT '手机号',
    `password` VARCHAR(255) NOT NULL COMMENT '密码（加密存储）',
    `nickname` VARCHAR(50) COMMENT '昵称',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_phone (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- ==============================================
-- 2. 应用版本表 - 存储版本更新信息
-- ==============================================
CREATE TABLE IF NOT EXISTS `app_version` (
    `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '版本ID',
    `version` VARCHAR(20) NOT NULL COMMENT '版本号，如 1.0.1',
    `min_version` VARCHAR(20) COMMENT '最低兼容版本',
    `release_note` TEXT COMMENT '更新说明',
    `download_url` VARCHAR(500) NOT NULL COMMENT 'APK下载链接',
    `is_force_update` TINYINT DEFAULT 0 COMMENT '是否强制更新 0=否 1=是',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '发布时间',
    INDEX idx_version (`version`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='应用版本表';

-- ==============================================
-- 3. 记账记录表 - 存储用户的记账数据
-- ==============================================
CREATE TABLE IF NOT EXISTS `account_records` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '记录ID',
    `user_id` INT NOT NULL COMMENT '用户ID',
    `type` TINYINT NOT NULL COMMENT '类型 1=收入 2=支出',
    `category` VARCHAR(50) NOT NULL COMMENT '分类',
    `sub_category` VARCHAR(50) COMMENT '子分类',
    `amount` DECIMAL(10, 2) NOT NULL COMMENT '金额',
    `quantity` DECIMAL(10, 2) COMMENT '数量',
    `unit` VARCHAR(20) COMMENT '单位',
    `date` DATE NOT NULL COMMENT '日期',
    `note` VARCHAR(500) COMMENT '备注',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_user_date (`user_id`, `date`),
    INDEX idx_type_date (`type`, `date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='记账记录表';

-- ==============================================
-- 4. 日记表 - 存储用户的日记数据
-- ==============================================
CREATE TABLE IF NOT EXISTS `diary_records` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '日记ID',
    `user_id` INT NOT NULL COMMENT '用户ID',
    `date` DATE NOT NULL COMMENT '日期',
    `title` VARCHAR(200) COMMENT '标题',
    `content` TEXT COMMENT '内容',
    `mood