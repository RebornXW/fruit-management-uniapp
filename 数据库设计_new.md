# 水果档口管理系统数据库设计

## 1. 用户表 (users)
| 字段名 | 类型 | 描述 | 约束 |
|--------|------|------|------|
| id | INT | 用户ID | 主键, 自增 |
| username | VARCHAR(50) | 用户名 | 非空, 唯一 |
| password | VARCHAR(255) | 密码(加密存储) | 非空 |
| name | VARCHAR(50) | 真实姓名 | 非空 |
| phone | VARCHAR(20) | 联系电话 | |
| role | VARCHAR(20) | 角色(admin/manager/staff) | 非空, 默认'staff' |
| avatar | VARCHAR(255) | 头像URL | |
| last_login | DATETIME | 最后登录时间 | |
| created_at | DATETIME | 创建时间 | 非空 |
| updated_at | DATETIME | 更新时间 | 非空 |
| status | TINYINT | 状态(1:启用 0:禁用) | 非空, 默认1 |

## 2. 水果表 (fruits)
| 字段名 | 类型 | 描述 | 约束 |
|--------|------|------|------|
| id | INT | 水果ID | 主键, 自增 |
| brand | VARCHAR(50) | 品牌 | 非空 |
| name | VARCHAR(100) | 水果名称 | 非空 |
| category | VARCHAR(50) | 水果类别 | 非空 |
| variety | VARCHAR(100) | 品种 | 非空 |
| spec | VARCHAR(100) | 规格 | 非空 |
| package_type | VARCHAR(50) | 包装类型(箱装、框装、其他) | |
| weight | DECIMAL(10,2) | 重量(斤) | 非空 |
| min_price | DECIMAL(10,2) | 最低价格 | 非空 |
| max_price | DECIMAL(10,2) | 最高价格 | 非空 |
| image | VARCHAR(255) | 图片URL | |
| created_at | DATETIME | 创建时间 | 非空 |
| updated_at | DATETIME | 更新时间 | 非空 |
| status | TINYINT | 状态(1:上架 0:下架) | 非空, 默认1 |
| deleted | TINYINT | 软删除(1:已删 0:正常) | 默认0 |

## 3. 客户表 (customers)
| 字段名 | 类型 | 描述 | 约束 |
|--------|------|------|------|
| id | INT | 客户ID | 主键, 自增 |
| name | VARCHAR(100) | 客户名称 | 非空 |
| phone | VARCHAR(20) | 联系电话 | |
| address | VARCHAR(255) | 地址 | |
| total_sales | DECIMAL(12,2) | 总销售额 | 默认0 |
| paid_amount | DECIMAL(12,2) | 已付款金额 | 默认0 |
| unpaid_amount | DECIMAL(12,2) | 未付款金额 | 默认0 |
| remark | TEXT | 备注 | |
| created_at | DATETIME | 创建时间 | 非空 |
| updated_at | DATETIME | 更新时间 | 非空 |
| status | TINYINT | 状态(1:启用 0:禁用) | 非空, 默认1 |
| deleted | TINYINT | 软删除(1:已删 0:正常) | 默认0 |

## 4. 销售记录表 (sales_records)
| 字段名 | 类型 | 描述 | 约束 |
|--------|------|------|------|
| id | INT | 记录ID | 主键, 自增 |
| record_id | VARCHAR(50) | 记录编号 | 非空, 唯一 |
| user_id | INT | 销售员ID | 外键(users.id) |
| customer_id | INT | 客户ID | 外键(customers.id) |
| fruit_id | INT | 水果ID | 外键(fruits.id), 非空 |
| sale_datetime | DATETIME | 销售时间 | 非空 |
| unit_price | DECIMAL(10,2) | 单价 | 非空 |
| quantity | INT | 数量(箱) | 非空 |
| amount | DECIMAL(12,2) | 金额 | 非空 |
| payment_status | VARCHAR(20) | 付款状态(已付款/未付款/部分付款) | 非空, 默认'未付款' |
| payment_method | VARCHAR(20) | 付款方式(现金/微信/支付宝/其他) | |
| payment_time | DATETIME | 付款时间 | |
| remark | TEXT | 备注 | |
| created_at | DATETIME | 创建时间 | 非空 |
| updated_at | DATETIME | 更新时间 | 非空 |
| deleted | TINYINT | 软删除(1:已删 0:正常) | 默认0 |

## 5. 付款记录表 (payment_records)
| 字段名 | 类型 | 描述 | 约束 |
|--------|------|------|------|
| id | INT | 付款记录ID | 主键, 自增 |
| payment_id | VARCHAR(50) | 付款编号 | 非空, 唯一 |
| customer_id | INT | 客户ID | 外键(customers.id), 非空 |
| amount | DECIMAL(12,2) | 付款金额 | 非空 |
| payment_method | VARCHAR(20) | 付款方式(现金/微信/支付宝/其他) | 非空 |
| payment_datetime | DATETIME | 付款时间 | 非空 |
| operator_id | INT | 操作员ID | 外键(users.id), 非空 |
| remark | TEXT | 备注 | |
| created_at | DATETIME | 创建时间 | 非空 |
| updated_at | DATETIME | 更新时间 | 非空 |

## 6. 付款销售关系表 (payment_sales_relation)
| 字段名 | 类型 | 描述 | 约束 |
|--------|------|------|------|
| id | INT | 关系ID | 主键, 自增 |
| payment_id | INT | 付款记录ID | 外键(payment_records.id), 非空 |
| sales_id | INT | 销售记录ID | 外键(sales_records.id), 非空 |
| amount | DECIMAL(12,2) | 分配到该销售记录的付款金额 | 非空 |
| created_at | DATETIME | 创建时间 | 非空 |
| updated_at | DATETIME | 更新时间 | 非空 |

## 7. 库存记录表 (inventory_records)
| 字段名 | 类型 | 描述 | 约束 |
|--------|------|------|------|
| id | INT | 记录ID | 主键, 自增 |
| record_id | VARCHAR(50) | 记录编号 | 非空, 唯一 |
| fruit_id | INT | 水果ID | 外键(fruits.id), 非空 |
| operation_type | VARCHAR(20) | 操作类型(入库、出库、盘库) | 非空 |
| quantity | INT | 数量(正数为入库/增加,负数为出库/减少) | 非空 |
| operator_id | INT | 操作员ID | 外键(users.id), 非空 |
| operation_datetime | DATETIME | 操作时间 | 非空 |
| source | VARCHAR(100) | 来源/去向 | |
| remark | TEXT | 备注 | |
| created_at | DATETIME | 创建时间 | 非空 |
| updated_at | DATETIME | 更新时间 | 非空 |

## 8. 操作记录表 (operation_records)
| 字段名 | 类型 | 描述 | 约束 |
|--------|------|------|------|
| id | INT | 记录ID | 主键, 自增 |
| record_id | VARCHAR(50) | 记录编号 | 非空, 唯一 |
| operation_type | VARCHAR(20) | 操作类型(新增/修改/删除/调价) | 非空 |
| target_type | VARCHAR(20) | 目标类型(水果/客户/用户/其他) | 非空 |
| target_id | INT | 目标ID | 非空 |
| before_data | TEXT | 操作前数据(JSON) | |
| after_data | TEXT | 操作后数据(JSON) | |
| operator_id | INT | 操作员ID | 外键(users.id), 非空 |
| operation_datetime | DATETIME | 操作时间 | 非空 |
| remark | TEXT | 备注 | |
| deleted | TINYINT | 软删除(1:已删 0:正常) | 默认0 |
| created_at | DATETIME | 创建时间 | 非空 |
| updated_at | DATETIME | 更新时间 | 非空 |

## 9. 系统日志表 (system_logs)
| 字段名 | 类型 | 描述 | 约束 |
|--------|------|------|------|
| id | INT | 日志ID | 主键, 自增 |
| log_type | VARCHAR(50) | 日志类型(登录/登出/操作/错误/警告) | 非空 |
| module | VARCHAR(50) | 模块(用户/水果/客户/销售/库存/财务) | 非空 |
| action | VARCHAR(50) | 动作(创建/更新/删除/查询/导出) | 非空 |
| user_id | INT | 用户ID | 外键(users.id) |
| ip_address | VARCHAR(50) | IP地址 | |
| user_agent | VARCHAR(255) | 用户代理 | |
| request_url | VARCHAR(255) | 请求URL | |
| request_method | VARCHAR(10) | 请求方法(GET/POST/PUT/DELETE) | |
| request_params | TEXT | 请求参数(JSON) | |
| response_code | INT | 响应状态码 | |
| response_data | TEXT | 响应数据(JSON) | |
| execution_time | INT | 执行时间(毫秒) | |
| log_datetime | DATETIME | 日志时间 | 非空 |
| created_at | DATETIME | 创建时间 | 非空 |

## 10. 销售统计表 (sales_statistics)
| 字段名 | 类型 | 描述 | 约束 |
|--------|------|------|------|
| id | INT | 统计ID | 主键, 自增 |
| statistic_type | VARCHAR(20) | 统计类型(日/周/月/年) | 非空 |
| statistic_date | DATE | 统计日期 | 非空 |
| fruit_id | INT | 水果ID | 外键(fruits.id) |
| customer_id | INT | 客户ID | 外键(customers.id) |
| sales_count | INT | 销售笔数 | 非空, 默认0 |
| sales_quantity | INT | 销售数量 | 非空, 默认0 |
| sales_amount | DECIMAL(12,2) | 销售金额 | 非空, 默认0 |
| paid_amount | DECIMAL(12,2) | 已付款金额 | 非空, 默认0 |
| unpaid_amount | DECIMAL(12,2) | 未付款金额 | 非空, 默认0 |
| created_at | DATETIME | 创建时间 | 非空 |
| updated_at | DATETIME | 更新时间 | 非空 |