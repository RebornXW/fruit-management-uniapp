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
-- 删除系统码表
DROP TABLE IF EXISTS `system_codes`;
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

-- 系统码表 (system_codes)
CREATE TABLE IF NOT EXISTS `system_codes` (
  `id` BIGINT AUTO_INCREMENT COMMENT '主键ID',
  `code_type` VARCHAR(50) NOT NULL COMMENT '码值类型',
  `code_value` VARCHAR(50) NOT NULL COMMENT '码值',
  `code_name` VARCHAR(100) NOT NULL COMMENT '码值名称',
  `sort_order` INT DEFAULT 0 COMMENT '排序顺序',
  `parent_id` BIGINT DEFAULT NULL COMMENT '父级ID（可选，用于树形结构）',
  `description` VARCHAR(255) DEFAULT NULL COMMENT '描述',
  `status` TINYINT DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '软删除',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_type_value` (`code_type`, `code_value`),
  KEY `idx_code_type` (`code_type`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统码表';

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
  `inventory_quantity` INT NOT NULL DEFAULT 0 COMMENT '当前库存数量',
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
  `user_name` VARCHAR(100) COMMENT '销售员名称',
  `customer_id` BIGINT COMMENT '客户ID',
  `customer_name` VARCHAR(100) COMMENT '客户名称',
  `fruit_id` BIGINT NOT NULL COMMENT '水果ID',
  `fruit_name` VARCHAR(100) COMMENT '水果名称',
  `spec` VARCHAR(100) COMMENT '水果规格',
  `sale_datetime` DATETIME NOT NULL COMMENT '销售时间',
  `sale_date` DATE GENERATED ALWAYS AS (DATE(sale_datetime)) STORED COMMENT '销售日期',
  `unit_price` DECIMAL(10,2) NOT NULL COMMENT '单价',
  `quantity` INT NOT NULL COMMENT '数量(箱)',
  `amount` DECIMAL(12,2) NOT NULL COMMENT '金额',
  `paid_amount` DECIMAL(12,2) DEFAULT 0 COMMENT '已付款金额',
  `payment_status` VARCHAR(20) NOT NULL DEFAULT '0' COMMENT '付款状态(0:未付款, 1:已付款, 2:部分付款)',
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
  `fruit_name` VARCHAR(100) COMMENT '水果名称',
  `spec` VARCHAR(100) COMMENT '水果规格',
  `operation_type` VARCHAR(20) NOT NULL COMMENT '操作类型(入库、出库、盘库)',
  `quantity` INT NOT NULL COMMENT '数量(正数为入库/增加,负数为出库/减少)',
  `operator_id` BIGINT NOT NULL COMMENT '操作员ID',
  `operator_name` VARCHAR(100) COMMENT '操作员名称',
  `operation_datetime` DATETIME NOT NULL COMMENT '操作时间',
  `operation_date` DATE GENERATED ALWAYS AS (DATE(operation_datetime)) STORED COMMENT '操作日期',
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

-- 8. 操作记录表已删除，合并到系统日志表

-- 9. 系统日志表 (system_logs)
CREATE TABLE IF NOT EXISTS `system_logs` (
  `id` BIGINT AUTO_INCREMENT COMMENT '日志ID',
  `log_type` VARCHAR(50) NOT NULL COMMENT '日志类型(BUSINESS_OPERATION/SYSTEM_TECHNICAL/SECURITY_AUDIT)',
  `module` VARCHAR(50) NOT NULL COMMENT '模块(用户/水果/客户/销售/库存/财务)',
  `action` VARCHAR(50) NOT NULL COMMENT '动作(创建/更新/删除/查询/导出)',
  `user_id` BIGINT COMMENT '用户ID',
  `target_type` VARCHAR(50) COMMENT '目标类型(水果/客户/用户/销售记录/库存记录/付款记录)',
  `target_id` BIGINT COMMENT '目标ID',
  `record_id` VARCHAR(50) COMMENT '目标记录编号',
  `business_description` VARCHAR(500) COMMENT '业务描述',
  `data_before` TEXT COMMENT '操作前数据(JSON)',
  `data_after` TEXT COMMENT '操作后数据(JSON)',
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
  KEY `idx_target_type` (`target_type`),
  KEY `idx_target_id` (`target_id`),
  KEY `idx_record_id` (`record_id`),
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
INSERT INTO `users` (`username`, `password`, `phone`, `name`, `role`, `stall_name` , `created_at`, `updated_at`, `status`)
VALUES ('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '13188888888','系统管理员', 'admin', '果具果业二部', NOW(), NOW(), 1);

-- 创建初始水果分类
INSERT INTO `fruit_categories` (`name`, `created_at`, `updated_at`)
VALUES
('苹果', NOW(), NOW()),
('橙子', NOW(), NOW()),
('枣', NOW(), NOW()),
('葡萄', NOW(), NOW()),
('梨', NOW(), NOW());

-- 创建初始水果品种
INSERT INTO `fruit_varieties` (`category_id`, `name`, `created_at`, `updated_at`)
VALUES
(1, '阿克苏冰糖心', NOW(), NOW()),
(1, '红富士', NOW(), NOW()),
(1, '王林苹果', NOW(), NOW()),
(2, '脐橙', NOW(), NOW()),
(2, '血橙', NOW(), NOW()),
(3, '冬枣', NOW(), NOW()),
(3, '巨大冬枣', NOW(), NOW()),
(4, '巨峰葡萄', NOW(), NOW()),
(4, '红提', NOW(), NOW()),
(5, '库尔勒香梨', NOW(), NOW()),
(5, '红香酥', NOW(), NOW());

-- 创建初始水果
INSERT INTO `fruits` (`brand`, `name`, `category_id`, `variety_id`, `spec`, `package_type`, `weight`, `min_price`, `max_price`, `status`, `created_at`, `updated_at`)
VALUES
('明牌', '明牌 阿克苏冰糖心', 1, 1, '80-85mm光果', '纸箱', 10.00, 50.00, 60.00, 1, NOW(), NOW()),
('果之篮', '果之篮 红香酥', 5, 11, '75-80mm', '塑料箱', 10.00, 45.00, 55.00, 1, NOW(), NOW()),
('明牌', '明牌 阿克苏冰糖心', 1, 1, '90-95mm', '纸箱', 30.00, 180.00, 200.00, 1, NOW(), NOW()),
('果之篮', '果之篮 库尔勒香梨', 5, 10, '特级果', '纸箱', 30.00, 120.00, 150.00, 1, NOW(), NOW()),
('大荔', '大荔冬枣', 3, 7, '特大', '泡沫箱', 5.00, 80.00, 100.00, 1, NOW(), NOW());

-- 创建初始客户
INSERT INTO `customers` (`name`, `phone`, `address`, `status`, `created_at`, `updated_at`)
VALUES
('测试-张三水果店', '13800138001', '嘉兴市张三水果店', 1, NOW(), NOW()),
('测试-李四水果批发', '13900139002', '嘉兴水果市场李四水果批发', 1, NOW(), NOW()),
('测试-南湖王五超市', '13055555555', '嘉兴市南湖区王五超市', 1, NOW(), NOW());

-- 初始化系统码表数据

-- 操作类型码值
INSERT INTO `system_codes` (`code_type`, `code_value`, `code_name`, `sort_order`, `description`, `status`, `created_at`, `updated_at`)
VALUES
('operation_type', 'in', '入库', 1, '水果入库操作', 1, NOW(), NOW()),
('operation_type', 'out', '出库', 2, '水果出库操作', 1, NOW(), NOW()),
('operation_type', 'sale', '销售', 3, '水果销售操作', 1, NOW(), NOW()),
('operation_type', 'inventory', '盘库', 3, '水果盘点操作', 1, NOW(), NOW());

-- 支付方式码值
INSERT INTO `system_codes` (`code_type`, `code_value`, `code_name`, `sort_order`, `description`, `status`, `created_at`, `updated_at`)
VALUES
('payment_method', 'cash', '现金', 1, '现金支付', 1, NOW(), NOW()),
('payment_method', 'wechat', '微信支付', 2, '微信扫码支付', 1, NOW(), NOW()),
('payment_method', 'alipay', '支付宝', 3, '支付宝扫码支付', 1, NOW(), NOW()),
('payment_method', 'bank_transfer', '银行转账', 4, '银行转账支付', 1, NOW(), NOW()),
('payment_method', 'other', '其他', 5, '其他支付方式', 1, NOW(), NOW());

-- 付款状态码值
INSERT INTO `system_codes` (`code_type`, `code_value`, `code_name`, `sort_order`, `description`, `status`, `created_at`, `updated_at`)
VALUES
('payment_status', 'unpaid', '未付款', 1, '订单未付款', 1, NOW(), NOW()),
('payment_status', 'partial_paid', '部分付款', 2, '订单部分付款', 1, NOW(), NOW()),
('payment_status', 'paid', '已付款', 3, '订单已全额付款', 1, NOW(), NOW());

-- 包装类型码值
INSERT INTO `system_codes` (`code_type`, `code_value`, `code_name`, `sort_order`, `description`, `status`, `created_at`, `updated_at`)
VALUES
('package_type', 'carton', '纸箱', 1, '纸质包装箱', 1, NOW(), NOW()),
('package_type', 'plastic', '塑料箱', 2, '塑料包装箱', 1, NOW(), NOW()),
('package_type', 'foam', '泡沙箱', 3, '泡沙保温箱', 1, NOW(), NOW()),
('package_type', 'wooden', '木箱', 4, '木质包装箱', 1, NOW(), NOW()),
('package_type', 'bag', '袋装', 5, '袋子包装', 1, NOW(), NOW());

-- 日志类型码值
INSERT INTO `system_codes` (`code_type`, `code_value`, `code_name`, `sort_order`, `description`, `status`, `created_at`, `updated_at`)
VALUES
('log_type', 'login', '登录', 1, '用户登录日志', 1, NOW(), NOW()),
('log_type', 'logout', '登出', 2, '用户登出日志', 1, NOW(), NOW()),
('log_type', 'operation', '操作', 3, '用户操作日志', 1, NOW(), NOW()),
('log_type', 'error', '错误', 4, '系统错误日志', 1, NOW(), NOW()),
('log_type', 'warning', '警告', 5, '系统警告日志', 1, NOW(), NOW());

-- 系统模块码值
INSERT INTO `system_codes` (`code_type`, `code_value`, `code_name`, `sort_order`, `description`, `status`, `created_at`, `updated_at`)
VALUES
('module', 'user', '用户管理', 1, '用户管理模块', 1, NOW(), NOW()),
('module', 'fruit', '水果管理', 2, '水果管理模块', 1, NOW(), NOW()),
('module', 'customer', '客户管理', 3, '客户管理模块', 1, NOW(), NOW()),
('module', 'sales', '销售管理', 4, '销售管理模块', 1, NOW(), NOW()),
('module', 'inventory', '库存管理', 5, '库存管理模块', 1, NOW(), NOW()),
('module', 'finance', '财务管理', 6, '财务管理模块', 1, NOW(), NOW()),
('module', 'system', '系统管理', 7, '系统管理模块', 1, NOW(), NOW());

-- 操作动作码值
INSERT INTO `system_codes` (`code_type`, `code_value`, `code_name`, `sort_order`, `description`, `status`, `created_at`, `updated_at`)
VALUES
('action', 'create', '创建', 1, '创建操作', 1, NOW(), NOW()),
('action', 'update', '更新', 2, '更新操作', 1, NOW(), NOW()),
('action', 'delete', '删除', 3, '删除操作', 1, NOW(), NOW()),
('action', 'query', '查询', 4, '查询操作', 1, NOW(), NOW()),
('action', 'export', '导出', 5, '导出操作', 1, NOW(), NOW()),
('action', 'import', '导入', 6, '导入操作', 1, NOW(), NOW()),
('action', 'approve', '审批', 7, '审批操作', 1, NOW(), NOW()),
('action', 'reject', '拒绝', 8, '拒绝操作', 1, NOW(), NOW());

-- 用户角色码值
INSERT INTO `system_codes` (`code_type`, `code_value`, `code_name`, `sort_order`, `description`, `status`, `created_at`, `updated_at`)
VALUES
('role', 'admin', '管理员', 1, '系统管理员', 1, NOW(), NOW()),
('role', 'manager', '经理', 2, '档口经理', 1, NOW(), NOW()),
('role', 'salesperson', '销售员', 3, '销售人员', 1, NOW(), NOW()),
('role', 'warehouse', '仓库员', 4, '仓库管理员', 1, NOW(), NOW()),
('role', 'finance', '财务员', 5, '财务人员', 1, NOW(), NOW());