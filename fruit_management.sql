-- 选择数据库
USE `fruit-management`;

-- 水果档口管理系统数据库建表语句

-- 1. 用户表 (users)
CREATE TABLE `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `name` VARCHAR(50) NOT NULL,
  `phone` VARCHAR(20) NULL,
  `role` VARCHAR(20) NOT NULL DEFAULT 'staff',
  `avatar` VARCHAR(255) NULL,
  `last_login` DATETIME NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  `status` TINYINT NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `username_UNIQUE` (`username`)
);

-- 2. 水果分类表
CREATE TABLE `fruit_categories` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `name_UNIQUE` (`name`)
);

-- 3. 水果品种表
CREATE TABLE `fruit_varieties` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `category_id` INT NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_varieties_category` FOREIGN KEY (`category_id`) REFERENCES `fruit_categories` (`id`)
);

-- 4. 水果表 (fruits)
CREATE TABLE `fruits` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `brand` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `category_id` INT NOT NULL,
  `variety_id` INT NOT NULL,
  `spec` VARCHAR(100) NOT NULL,
  `package_type` VARCHAR(50) NULL,
  `weight` DECIMAL(10,2) NOT NULL,
  `min_price` DECIMAL(10,2) NOT NULL,
  `max_price` DECIMAL(10,2) NOT NULL,
  `image` VARCHAR(255) NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  `status` TINYINT NOT NULL DEFAULT 1,
  `deleted` TINYINT DEFAULT 0,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_fruits_category` FOREIGN KEY (`category_id`) REFERENCES `fruit_categories` (`id`),
  CONSTRAINT `fk_fruits_variety` FOREIGN KEY (`variety_id`) REFERENCES `fruit_varieties` (`id`)
);

-- 5. 客户表 (customers)
CREATE TABLE `customers` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(20) NULL,
  `address` VARCHAR(255) NULL,
  `total_sales` DECIMAL(12,2) DEFAULT 0,
  `paid_amount` DECIMAL(12,2) DEFAULT 0,
  `unpaid_amount` DECIMAL(12,2) DEFAULT 0,
  `remark` TEXT NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  `status` TINYINT NOT NULL DEFAULT 1,
  `deleted` TINYINT DEFAULT 0,
  PRIMARY KEY (`id`)
);

-- 6. 销售记录表 (sales_records)
CREATE TABLE `sales_records` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `record_id` VARCHAR(50) NOT NULL,
  `user_id` INT NULL,
  `customer_id` INT NULL,
  `fruit_id` INT NOT NULL,
  `sale_datetime` DATETIME NOT NULL,
  `unit_price` DECIMAL(10,2) NOT NULL,
  `quantity` INT NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `payment_status` VARCHAR(20) NOT NULL DEFAULT '未付款',
  `payment_method` VARCHAR(20) NULL,
  `payment_time` DATETIME NULL,
  `remark` TEXT NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  `deleted` TINYINT DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `record_id_UNIQUE` (`record_id`),
  CONSTRAINT `fk_sales_records_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_sales_records_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`),
  CONSTRAINT `fk_sales_records_fruit` FOREIGN KEY (`fruit_id`) REFERENCES `fruits` (`id`)
);

-- 7. 付款记录表 (payment_records)
CREATE TABLE `payment_records` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `payment_id` VARCHAR(50) NOT NULL,
  `customer_id` INT NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `payment_method` VARCHAR(20) NOT NULL,
  `payment_datetime` DATETIME NOT NULL,
  `operator_id` INT NOT NULL,
  `remark` TEXT NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `payment_id_UNIQUE` (`payment_id`),
  CONSTRAINT `fk_payment_records_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`),
  CONSTRAINT `fk_payment_records_operator` FOREIGN KEY (`operator_id`) REFERENCES `users` (`id`)
);

-- 8. 付款销售关系表 (payment_sales_relation)
CREATE TABLE `payment_sales_relation` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `payment_id` INT NOT NULL,
  `sales_id` INT NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_payment_sales_relation_payment` FOREIGN KEY (`payment_id`) REFERENCES `payment_records` (`id`),
  CONSTRAINT `fk_payment_sales_relation_sales` FOREIGN KEY (`sales_id`) REFERENCES `sales_records` (`id`)
);

-- 9. 库存记录表 (inventory_records)
CREATE TABLE `inventory_records` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `record_id` VARCHAR(50) NOT NULL,
  `fruit_id` INT NOT NULL,
  `operation_type` VARCHAR(20) NOT NULL,
  `quantity` INT NOT NULL,
  `operator_id` INT NOT NULL,
  `operation_datetime` DATETIME NOT NULL,
  `source` VARCHAR(100) NULL,
  `remark` TEXT NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `record_id_UNIQUE` (`record_id`),
  CONSTRAINT `fk_inventory_records_fruit` FOREIGN KEY (`fruit_id`) REFERENCES `fruits` (`id`),
  CONSTRAINT `fk_inventory_records_operator` FOREIGN KEY (`operator_id`) REFERENCES `users` (`id`)
);

-- 10. 操作记录表 (operation_records)
CREATE TABLE `operation_records` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `record_id` VARCHAR(50) NOT NULL,
  `operation_type` VARCHAR(20) NOT NULL,
  `target_type` VARCHAR(20) NOT NULL,
  `target_id` INT NOT NULL,
  `before_data` TEXT NULL,
  `after_data` TEXT NULL,
  `operator_id` INT NOT NULL,
  `operation_datetime` DATETIME NOT NULL,
  `remark` TEXT NULL,
  `deleted` TINYINT DEFAULT 0,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `record_id_UNIQUE` (`record_id`),
  CONSTRAINT `fk_operation_records_operator` FOREIGN KEY (`operator_id`) REFERENCES `users` (`id`)
);

-- 11. 系统日志表 (system_logs)
CREATE TABLE `system_logs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `log_type` VARCHAR(50) NOT NULL,
  `module` VARCHAR(50) NOT NULL,
  `action` VARCHAR(50) NOT NULL,
  `user_id` INT NULL,
  `ip_address` VARCHAR(50) NULL,
  `user_agent` VARCHAR(255) NULL,
  `request_url` VARCHAR(255) NULL,
  `request_method` VARCHAR(10) NULL,
  `request_params` TEXT NULL,
  `response_code` INT NULL,
  `response_data` TEXT NULL,
  `execution_time` INT NULL,
  `log_datetime` DATETIME NOT NULL,
  `created_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_system_logs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
);

-- 12. 销售统计表 (sales_statistics)
CREATE TABLE `sales_statistics` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `statistic_type` VARCHAR(20) NOT NULL,
  `statistic_date` DATE NOT NULL,
  `fruit_id` INT NULL,
  `customer_id` INT NULL,
  `sales_count` INT NOT NULL DEFAULT 0,
  `sales_quantity` INT NOT NULL DEFAULT 0,
  `sales_amount` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `paid_amount` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `unpaid_amount` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_sales_statistics_fruit` FOREIGN KEY (`fruit_id`) REFERENCES `fruits` (`id`),
  CONSTRAINT `fk_sales_statistics_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`)
);

-- 插入用户数据
INSERT INTO `users` (`username`, `password`, `name`, `role`, `created_at`, `updated_at`) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '管理员', 'admin', NOW(), NOW()),
('sales', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '业务员', 'staff', NOW(), NOW()),
('finance', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '财务', 'manager', NOW(), NOW()),
('owner', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '货主', 'manager', NOW(), NOW());

-- 注意: 密码字段使用了哈希值，实际值为 '123456'
-- 在实际应用中，应该使用适当的密码哈希函数来生成密码哈希值