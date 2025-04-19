-- migration.sql
-- 将旧设计迁移到新表结构：fruit_categories, fruit_varieties, 更新 fruits

BEGIN;

-- 1. 创建新表
CREATE TABLE IF NOT EXISTS `fruit_categories` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `idx_categories_name` (`name`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `fruit_varieties` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `category_id` INT NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_varieties_category` FOREIGN KEY (`category_id`) REFERENCES `fruit_categories` (`id`)
) ENGINE=InnoDB;

-- 2. 添加 fruits 表新列
ALTER TABLE `fruits`
  ADD COLUMN `category_id` INT NULL,
  ADD COLUMN `variety_id` INT NULL;

-- 3. 插入分类数据
INSERT IGNORE INTO `fruit_categories` (`name`, `created_at`, `updated_at`)
SELECT DISTINCT `category`, NOW(), NOW() FROM `fruits`;

-- 4. 插入品种数据
INSERT IGNORE INTO `fruit_varieties` (`category_id`, `name`, `created_at`, `updated_at`)
SELECT fc.id, f.variety, NOW(), NOW()
FROM (
  SELECT DISTINCT `category`, `variety` FROM `fruits`
) AS f
JOIN `fruit_categories` AS fc ON fc.name = f.category;

-- 5. 更新 fruits 对应外键
UPDATE `fruits` AS f
JOIN `fruit_categories` AS fc ON fc.name = f.category
JOIN `fruit_varieties` AS fv ON fv.name = f.variety AND fv.category_id = fc.id
SET
  f.category_id = fc.id,
  f.variety_id = fv.id;

-- 6. 设置新列为非空并添加外键约束
ALTER TABLE `fruits`
  MODIFY COLUMN `category_id` INT NOT NULL,
  MODIFY COLUMN `variety_id` INT NOT NULL,
  ADD CONSTRAINT `fk_fruits_category` FOREIGN KEY (`category_id`) REFERENCES `fruit_categories` (`id`),
  ADD CONSTRAINT `fk_fruits_variety` FOREIGN KEY (`variety_id`) REFERENCES `fruit_varieties` (`id`);

-- 7. 删除旧列
ALTER TABLE `fruits`
  DROP COLUMN `category`,
  DROP COLUMN `variety`;

COMMIT;
