-- 水果档口管理系统数据库建表SQL脚本
-- 创建数据库
CREATE DATABASE IF NOT EXISTS `fruit_management` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `fruit_management`;

-- 先删除已存在的表（注意删除顺序，先删除有外键约束的表）
-- 删除销售统计表
DROP TABLE IF EXISTS `sales_statistics`;
-- 删除系统日志表
DROP TABLE IF EXISTS `system_logs`;
-- 删除操作记录表
DROP TABLE IF EXISTS `operation_records`;
-- 删除付款销售关系表
DROP TABLE IF EXISTS `payment_sales_relation`;
-- 删除库存记录表
DROP TABLE IF EXISTS `inventory_records`;
-- 删除付款记录表
DROP TABLE IF EXISTS `payment_records`;
-- 删除销售记录表
DROP TABLE IF EXISTS `sales_records`;
-- 删除水果表
DROP TABLE IF EXISTS `fruits`;
-- 删除水果品种表
DROP TABLE IF EXISTS `fruit_varieties`;
-- 删除水果分类表
DROP TABLE IF EXISTS `fruit_categories`;
-- 删除客户表
DROP TABLE IF EXISTS `customers`;
-- 删除用户表
DROP TABLE IF EXISTS `users`;

-- 用户表 (users)
CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT AUTO_INCREMENT COMMENT '用户ID',
  `username` VARCHAR(50) NOT NULL COMMENT '用户名',
  `password` VARCHAR(255) NOT NULL COMMENT '密码',
  `name` VARCHAR(100) COMMENT '姓名',
  `phone` VARCHAR(20) COMMENT '电话',
  `role` VARCHAR(20) NOT NULL COMMENT '角色',
  `stall_name` VARCHAR(100) COMMENT '档口名称',
  `avatar` VARCHAR(255) COMMENT '头像URL',
  `last_login` DATETIME COMMENT '最后登录时间',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态(1:启用 0:禁用)',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '软删除',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 1. 水果分类表 (fruit_categories)
CREATE TABLE IF NOT EXISTS `fruit_categories` (
  `id` BIGINT AUTO_INCREMENT COMMENT '分类ID',
  `name` VARCHAR(50) NOT NULL COMMENT '分类名称',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='水果分类表';

-- 1.1 水果品种表 (fruit_varieties)
CREATE TABLE IF NOT EXISTS `fruit_varieties` (
  `id` BIGINT AUTO_INCREMENT COMMENT '品种ID',
  `category_id` BIGINT NOT NULL COMMENT '分类ID',
  `name` VARCHAR(100) NOT NULL COMMENT '品种名称',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_category_id` (`category_id`),
  CONSTRAINT `fk_variety_category` FOREIGN KEY (`category_id`) REFERENCES `fruit_categories` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='水果品种表';

-- 2. 水果表 (fruits)
CREATE TABLE IF NOT EXISTS `fruits` (
  `id` BIGINT AUTO_INCREMENT COMMENT '水果ID',
  `brand` VARCHAR(50) NOT NULL COMMENT '品牌',
  `name` VARCHAR(100) NOT NULL COMMENT '名称',
  `category_id` BIGINT NOT NULL COMMENT '水果分类ID',
  `variety_id` BIGINT NOT NULL COMMENT '水果品种ID',
  `spec` VARCHAR(100) NOT NULL COMMENT '规格',
  `package_type` VARCHAR(50) COMMENT '包装类型',
  `weight` DECIMAL(10,2) NOT NULL COMMENT '重量(斤)',
  `min_price` DECIMAL(10,2) NOT NULL COMMENT '最低价格',
  `max_price` DECIMAL(10,2) NOT NULL COMMENT '最高价格',
  `image` VARCHAR(255) COMMENT '图片URL',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态(1:上架 0:下架)',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '软删除',
  PRIMARY KEY (`id`),
  KEY `idx_category_id` (`category_id`),
  KEY `idx_variety_id` (`variety_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_fruit_category` FOREIGN KEY (`category_id`) REFERENCES `fruit_categories` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_fruit_variety` FOREIGN KEY (`variety_id`) REFERENCES `fruit_varieties` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='水果表';

-- 3. 客户表 (customers)
CREATE TABLE IF NOT EXISTS `customers` (
  `id` BIGINT AUTO_INCREMENT COMMENT '客户ID',
  `name` VARCHAR(100) NOT NULL COMMENT '客户名称',
  `phone` VARCHAR(20) COMMENT '联系电话',
  `address` VARCHAR(255) COMMENT '地址',
  `total_sales` DECIMAL(12,2) DEFAULT 0 COMMENT '总销售额 (冗余)',
  `paid_amount` DECIMAL(12,2) DEFAULT 0 COMMENT '已付款金额 (冗余)',
  `unpaid_amount` DECIMAL(12,2) DEFAULT 0 COMMENT '未付款金额 (冗余)',
  `remark` TEXT COMMENT '备注',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态(1:启用 0:禁用)',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '软删除',
  PRIMARY KEY (`id`),
  KEY `idx_name` (`name`),
  KEY `idx_phone` (`phone`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='客户表';

-- 4. 销售记录表 (sales_records)
CREATE TABLE IF NOT EXISTS `sales_records` (
  `id` BIGINT AUTO_INCREMENT COMMENT '记录ID',
  `record_id` VARCHAR(50) NOT NULL COMMENT '记录编号',
  `user_id` BIGINT COMMENT '销售员ID',
  `customer_id` BIGINT COMMENT '客户ID',
  `fruit_id` BIGINT NOT NULL COMMENT '水果ID',
  `sale_datetime` DATETIME NOT NULL COMMENT '销售时间',
  `unit_price` DECIMAL(10,2) NOT NULL COMMENT '单价',
  `quantity` INT NOT NULL COMMENT '数量(箱)',
  `amount` DECIMAL(12,2) NOT NULL COMMENT '金额',
  `payment_status` VARCHAR(20) NOT NULL DEFAULT '未付款' COMMENT '付款状态(已付款/未付款/部分付款)',
  `snapshot` JSON COMMENT '销售记录快照',
  `remark` TEXT COMMENT '备注',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '软删除',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_record_id` (`record_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_customer_id` (`customer_id`),
  KEY `idx_fruit_id` (`fruit_id`),
  KEY `idx_sale_datetime` (`sale_datetime`),
  KEY `idx_payment_status` (`payment_status`),
  CONSTRAINT `fk_sales_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_sales_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_sales_fruit` FOREIGN KEY (`fruit_id`) REFERENCES `fruits` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='销售记录表';

-- 5. 付款记录表 (payment_records)
CREATE TABLE IF NOT EXISTS `payment_records` (
  `id` BIGINT AUTO_INCREMENT COMMENT '付款记录ID',
  `payment_id` VARCHAR(50) NOT NULL COMMENT '付款编号',
  `customer_id` BIGINT NOT NULL COMMENT '客户ID',
  `amount` DECIMAL(12,2) NOT NULL COMMENT '付款金额',
  `payment_method` VARCHAR(20) NOT NULL COMMENT '付款方式(现金/微信/支付宝/其他)',
  `payment_datetime` DATETIME NOT NULL COMMENT '付款时间',
  `operator_id` BIGINT NOT NULL COMMENT '操作员ID',
  `remark` TEXT COMMENT '备注',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '软删除',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_payment_id` (`payment_id`),
  KEY `idx_customer_id` (`customer_id`),
  KEY `idx_operator_id` (`operator_id`),
  KEY `idx_payment_datetime` (`payment_datetime`),
  CONSTRAINT `fk_payment_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_payment_operator` FOREIGN KEY (`operator_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='付款记录表';

-- 6. 付款销售关系表 (payment_sales_relation)
CREATE TABLE IF NOT EXISTS `payment_sales_relation` (
  `id` BIGINT AUTO_INCREMENT COMMENT '关系ID',
  `payment_id` BIGINT NOT NULL COMMENT '付款记录ID',
  `sales_id` BIGINT NOT NULL COMMENT '销售记录ID',
  `amount` DECIMAL(12,2) NOT NULL COMMENT '分配到该销售记录的付款金额',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_payment_sales` (`payment_id`, `sales_id`),
  KEY `idx_sales_id` (`sales_id`),
  CONSTRAINT `fk_relation_payment` FOREIGN KEY (`payment_id`) REFERENCES `payment_records` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_relation_sales` FOREIGN KEY (`sales_id`) REFERENCES `sales_records` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='付款销售关系表';

-- 7. 库存记录表 (inventory_records)
CREATE TABLE IF NOT EXISTS `inventory_records` (
  `id` BIGINT AUTO_INCREMENT COMMENT '记录ID',
  `record_id` VARCHAR(50) NOT NULL COMMENT '记录编号',
  `fruit_id` BIGINT NOT NULL COMMENT '水果ID',
  `operation_type` VARCHAR(20) NOT NULL COMMENT '操作类型(入库、出库、盘库)',
  `quantity` INT NOT NULL COMMENT '数量(正数为入库/增加,负数为出库/减少)',
  `operator_id` BIGINT NOT NULL COMMENT '操作员ID',
  `operation_datetime` DATETIME NOT NULL COMMENT '操作时间',
  `source` VARCHAR(100) COMMENT '来源/去向',
  `snapshot` JSON COMMENT '库存记录快照',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '软删除',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_record_id` (`record_id`),
  KEY `idx_fruit_id` (`fruit_id`),
  KEY `idx_operator_id` (`operator_id`),
  KEY `idx_operation_type` (`operation_type`),
  KEY `idx_operation_datetime` (`operation_datetime`),
  CONSTRAINT `fk_inventory_fruit` FOREIGN KEY (`fruit_id`) REFERENCES `fruits` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_inventory_operator` FOREIGN KEY (`operator_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='库存记录表';

-- 8. 操作记录表 (operation_records)
CREATE TABLE IF NOT EXISTS `operation_records` (
  `id` BIGINT AUTO_INCREMENT COMMENT '记录ID',
  `record_id` VARCHAR(50) NOT NULL COMMENT '记录编号',
  `operation_type` VARCHAR(20) NOT NULL COMMENT '操作类型(新增/修改/删除/调价)',
  `target_type` VARCHAR(20) NOT NULL COMMENT '目标类型(水果/客户/用户/其他)',
  `target_id` BIGINT NOT NULL COMMENT '目标ID',
  `snapshot` JSON COMMENT '操作快照',
  `operator_id` BIGINT NOT NULL COMMENT '操作员ID',
  `operation_datetime` DATETIME NOT NULL COMMENT '操作时间',
  `remark` TEXT COMMENT '备注',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '软删除',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_record_id` (`record_id`),
  KEY `idx_operator_id` (`operator_id`),
  KEY `idx_operation_type` (`operation_type`),
  KEY `idx_target_type` (`target_type`),
  KEY `idx_target_id` (`target_id`),
  KEY `idx_operation_datetime` (`operation_datetime`),
  CONSTRAINT `fk_operation_operator` FOREIGN KEY (`operator_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作记录表';

-- 9. 系统日志表 (system_logs)
CREATE TABLE IF NOT EXISTS `system_logs` (
  `id` BIGINT AUTO_INCREMENT COMMENT '日志ID',
  `log_type` VARCHAR(50) NOT NULL COMMENT '日志类型(登录/登出/操作/错误/警告)',
  `module` VARCHAR(50) NOT NULL COMMENT '模块(用户/水果/客户/销售/库存/财务)',
  `action` VARCHAR(50) NOT NULL COMMENT '动作(创建/更新/删除/查询/导出)',
  `user_id` BIGINT COMMENT '用户ID',
  `ip_address` VARCHAR(50) COMMENT 'IP地址',
  `user_agent` VARCHAR(255) COMMENT '用户代理',
  `request_url` VARCHAR(255) COMMENT '请求URL',
  `request_method` VARCHAR(10) COMMENT '请求方法(GET/POST/PUT/DELETE)',
  `request_params` TEXT COMMENT '请求参数(JSON)',
  `response_code` INT COMMENT '响应状态码',
  `response_data` TEXT COMMENT '响应数据(JSON)',
  `execution_time` INT COMMENT '执行时间(毫秒)',
  `log_datetime` DATETIME NOT NULL COMMENT '日志时间',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_log_type` (`log_type`),
  KEY `idx_module` (`module`),
  KEY `idx_action` (`action`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_log_datetime` (`log_datetime`),
  CONSTRAINT `fk_log_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统日志表';

-- 10. 销售统计表 (sales_statistics)
CREATE TABLE IF NOT EXISTS `sales_statistics` (
  `id` BIGINT AUTO_INCREMENT COMMENT '统计ID',
  `statistic_type` VARCHAR(20) NOT NULL COMMENT '统计类型(日/周/月/年)',
  `statistic_date` DATE NOT NULL COMMENT '统计日期',
  `fruit_id` BIGINT COMMENT '水果ID',
  `customer_id` BIGINT COMMENT '客户ID',
  `sales_count` INT NOT NULL DEFAULT 0 COMMENT '销售笔数',
  `sales_quantity` INT NOT NULL DEFAULT 0 COMMENT '销售数量',
  `sales_amount` DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT '销售金额',
  `paid_amount` DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT '已付款金额',
  `unpaid_amount` DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT '未付款金额',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_statistic_unique` (`statistic_type`, `statistic_date`, `fruit_id`, `customer_id`),
  KEY `idx_statistic_date` (`statistic_date`),
  KEY `idx_fruit_id` (`fruit_id`),
  KEY `idx_customer_id` (`customer_id`),
  CONSTRAINT `fk_statistic_fruit` FOREIGN KEY (`fruit_id`) REFERENCES `fruits` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_statistic_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='销售统计表';

-- 创建初始管理员用户 (密码需要使用BCrypt加密)
INSERT INTO `users` (`username`, `password`, `name`, `role`, `created_at`, `updated_at`, `status`)
VALUES ('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '系统管理员', 'admin', NOW(), NOW(), 1);

-- 创建初始水果分类
INSERT INTO `fruit_categories` (`name`, `created_at`, `updated_at`)
VALUES
('苹果', NOW(), NOW()),
('橙子', NOW(), NOW()),
('香蕉', NOW(), NOW()),
('葡萄', NOW(), NOW()),
('梨', NOW(), NOW());

-- 创建初始水果品种
INSERT INTO `fruit_varieties` (`category_id`, `name`, `created_at`, `updated_at`)
VALUES
(1, '红富士', NOW(), NOW()),
(1, '嘎啦', NOW(), NOW()),
(1, '金帅', NOW(), NOW()),
(2, '脐橙', NOW(), NOW()),
(2, '血橙', NOW(), NOW()),
(3, '小米蕉', NOW(), NOW()),
(3, '大香蕉', NOW(), NOW()),
(4, '巨峰', NOW(), NOW()),
(4, '红提', NOW(), NOW()),
(5, '鸭梨', NOW(), NOW()),
(5, '雪梨', NOW(), NOW());

-- 创建初始水果
INSERT INTO `fruits` (`brand`, `name`, `category_id`, `variety_id`, `spec`, `package_type`, `weight`, `min_price`, `max_price`, `status`, `created_at`, `updated_at`)
VALUES
('烟台', '红富士苹果', 1, 1, '80-85mm', '纸箱', 10.00, 50.00, 60.00, 1, NOW(), NOW()),
('陕西', '嘎啦苹果', 1, 2, '75-80mm', '塑料箱', 10.00, 45.00, 55.00, 1, NOW(), NOW()),
('赣南', '脐橙', 2, 4, '70-75mm', '纸箱', 10.00, 60.00, 70.00, 1, NOW(), NOW()),
('广西', '小米蕉', 3, 6, '标准', '纸箱', 15.00, 35.00, 45.00, 1, NOW(), NOW()),
('新疆', '红提', 4, 9, '特大', '泡沫箱', 5.00, 80.00, 100.00, 1, NOW(), NOW());

-- 创建初始客户
INSERT INTO `customers` (`name`, `phone`, `address`, `status`, `created_at`, `updated_at`)
VALUES
('张三水果店', '13800138001', '北京市朝阳区xx路xx号', 1, NOW(), NOW()),
('李四水果批发', '13900139002', '上海市浦东新区xx路xx号', 1, NOW(), NOW()),
('王五超市', '13700137003', '广州市天河区xx路xx号', 1, NOW(), NOW());
