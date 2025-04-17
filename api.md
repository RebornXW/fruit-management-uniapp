# 水果档口管理系统API文档

## 目录

- [1. 通用说明](#1-通用说明)
  - [1.1 接口规范](#11-接口规范)
  - [1.2 认证方式](#12-认证方式)
  - [1.3 通用响应格式](#13-通用响应格式)
  - [1.4 分页参数](#14-分页参数)
  - [1.5 RESTful风格规范](#15-restful风格规范)
- [2. 用户认证](#2-用户认证)
  - [2.1 用户登录](#21-用户登录)
  - [2.2 用户登出](#22-用户登出)
  - [2.3 获取当前用户信息](#23-获取当前用户信息)
  - [2.4 修改个人信息](#24-修改个人信息)
  - [2.5 修改密码](#25-修改密码)
  - [2.6 用户管理（仅管理员）](#26-用户管理仅管理员)
- [3. 水果管理](#3-水果管理)
  - [3.1 获取水果列表](#31-获取水果列表)
  - [3.2 获取水果详情](#32-获取水果详情)
  - [3.3 创建水果](#33-创建水果)
  - [3.4 更新水果](#34-更新水果)
  - [3.5 删除水果](#35-删除水果)
  - [3.6 更新水果状态](#36-更新水果状态)
  - [3.7 获取水果类别列表](#37-获取水果类别列表)
- [4. 客户管理](#4-客户管理)
  - [4.1 获取客户列表](#41-获取客户列表)
  - [4.2 获取客户详情](#42-获取客户详情)
  - [4.3 创建客户](#43-创建客户)
  - [4.4 更新客户](#44-更新客户)
  - [4.5 删除客户](#45-删除客户)
  - [4.6 获取客户销售记录](#46-获取客户销售记录)
  - [4.7 获取客户付款记录](#47-获取客户付款记录)
- [5. 销售管理](#5-销售管理)
  - [5.1 获取销售记录列表](#51-获取销售记录列表)
  - [5.2 获取销售记录详情](#52-获取销售记录详情)
  - [5.3 创建销售记录](#53-创建销售记录)
  - [5.4 更新销售记录](#54-更新销售记录)
  - [5.5 删除销售记录](#55-删除销售记录)
  - [5.6 更新销售记录付款状态](#56-更新销售记录付款状态)
  - [5.7 获取销售记录关联的付款记录](#57-获取销售记录关联的付款记录)
- [6. 库存管理](#6-库存管理)
  - [6.1 获取库存记录列表](#61-获取库存记录列表)
  - [6.2 获取库存记录详情](#62-获取库存记录详情)
  - [6.3 创建库存记录](#63-创建库存记录)
  - [6.4 更新库存记录](#64-更新库存记录)
  - [6.5 删除库存记录](#65-删除库存记录)
- [7. 财务管理](#7-财务管理)
  - [7.1 获取付款记录列表](#71-获取付款记录列表)
  - [7.2 获取付款记录详情](#72-获取付款记录详情)
  - [7.3 创建付款记录](#73-创建付款记录)
  - [7.4 更新付款记录](#74-更新付款记录)
  - [7.5 删除付款记录](#75-删除付款记录)
  - [7.6 获取付款记录关联的销售记录](#76-获取付款记录关联的销售记录)
  - [7.7 为付款记录添加关联的销售记录](#77-为付款记录添加关联的销售记录)
  - [7.8 移除付款记录关联的销售记录](#78-移除付款记录关联的销售记录)
- [8. 系统日志](#8-系统日志)
  - [8.1 获取系统日志列表](#81-获取系统日志列表)
  - [8.2 获取系统日志详情](#82-获取系统日志详情)
- [9. 统计分析](#9-统计分析)
  - [9.1 销售统计](#91-销售统计)
  - [9.2 库存统计](#92-库存统计)
  - [9.3 客户统计](#93-客户统计)

## 1. 通用说明

### 1.1 接口规范

- 基础URL: `/api/v1`
- 请求方法: GET, POST, PUT, DELETE
- 数据格式: JSON
- 时间格式: ISO 8601 (YYYY-MM-DDTHH:MM:SSZ)

### 1.2 认证方式

系统采用JWT (JSON Web Token) 认证机制：

- 登录成功后获取token
- 后续请求在Header中添加: `Authorization: Bearer {token}`

### 1.3 通用响应格式

```json
{
  "code": 200,       // 状态码：200成功，400请求错误，401未授权，403禁止访问，404未找到，500服务器错误
  "message": "操作成功", // 响应消息
  "data": {}        // 响应数据
}
```

### 1.4 分页参数

分页接口统一使用以下请求参数：

- `page`: 页码，从1开始
- `limit`: 每页记录数，默认20

分页响应格式：

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "total": 100,      // 总记录数
    "pages": 5,        // 总页数
    "current": 1,      // 当前页码
    "limit": 20,       // 每页记录数
    "items": []        // 当前页数据
  }
}
```

### 1.5 RESTful风格规范

#### 1.5.1 URL路径规范

1. 使用复数名词表示资源集合
   - `/fruits` 而非 `/fruit`
   - `/customers` 而非 `/customer`

2. 保持URL结构一致性
   - 集合资源: `/resources`
   - 单个资源: `/resources/{id}`
   - 子资源集合: `/resources/{id}/sub-resources`
   - 子资源: `/resources/{id}/sub-resources/{sub-id}`

#### 1.5.2 HTTP方法使用规范

- GET: 获取资源
- POST: 创建资源
- PUT: 更新资源
- DELETE: 删除资源

#### 1.5.3 状态码使用规范

- 200 OK: 请求成功
- 201 Created: 资源创建成功
- 204 No Content: 请求成功但无返回内容
- 400 Bad Request: 请求参数错误
- 401 Unauthorized: 未授权
- 403 Forbidden: 禁止访问
- 404 Not Found: 资源不存在
- 500 Internal Server Error: 服务器错误

## 2. 用户认证

### 2.1 用户登录

- **URL**: `/auth/login`
- **方法**: POST
- **描述**: 用户登录获取认证令牌
- **请求参数**:

```json
{
  "username": "admin",  // 用户名
  "password": "123456"  // 密码
}
```

- **响应示例**:

```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires": "2023-12-31T23:59:59Z",
    "user": {
      "id": 1,
      "username": "admin",
      "name": "管理员",
      "role": "admin",
      "avatar": "https://example.com/avatar.jpg"
    }
  }
}
```

### 2.2 用户登出

- **URL**: `/auth/logout`
- **方法**: POST
- **描述**: 用户登出，使当前token失效
- **请求参数**: 无
- **响应示例**:

```json
{
  "code": 200,
  "message": "登出成功",
  "data": null
}
```

### 2.3 获取当前用户信息

- **URL**: `/auth/profile`
- **方法**: GET
- **描述**: 获取当前登录用户的详细信息
- **请求参数**: 无
- **响应示例**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": 1,
    "username": "admin",
    "name": "管理员",
    "phone": "13800138000",
    "role": "admin",
    "avatar": "https://example.com/avatar.jpg",
    "last_login": "2023-06-01T10:30:00Z",
    "created_at": "2023-01-01T00:00:00Z",
    "status": 1
  }
}
```

### 2.4 修改个人信息

- **URL**: `/auth/profile`
- **方法**: PUT
- **描述**: 修改当前登录用户的个人信息
- **请求参数**:

```json
{
  "name": "新名称",
  "phone": "13900139000",
  "avatar": "https://example.com/new-avatar.jpg"
}
```

- **响应示例**:

```json
{
  "code": 200,
  "message": "修改成功",
  "data": {
    "id": 1,
    "username": "admin",
    "name": "新名称",
    "phone": "13900139000",
    "role": "admin",
    "avatar": "https://example.com/new-avatar.jpg",
    "last_login": "2023-06-01T10:30:00Z",
    "created_at": "2023-01-01T00:00:00Z",
    "status": 1
  }
}
```

### 2.5 修改密码

- **URL**: `/auth/password`
- **方法**: PUT
- **描述**: 修改当前登录用户的密码
- **请求参数**:

```json
{
  "old_password": "123456",
  "new_password": "654321",
  "confirm_password": "654321"
}
```

- **响应示例**:

```json
{
  "code": 200,
  "message": "密码修改成功",
  "data": null
}
```

### 2.6 用户管理（仅管理员）

#### 2.6.1 获取用户列表

- **URL**: `/users`
- **方法**: GET
- **描述**: 获取系统用户列表
- **请求参数**: 
  - `page`: 页码
  - `limit`: 每页记录数
  - `keyword`: 搜索关键词（可选）
  - `role`: 角色筛选（可选）
  - `status`: 状态筛选（可选）
- **响应示例**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "total": 50,
    "pages": 3,
    "current": 1,
    "limit": 20,
    "items": [
      {
        "id": 1,
        "username": "admin",
        "name": "管理员",
        "phone": "13800138000",
        "role": "admin",
        "avatar": "https://example.com/avatar.jpg",
        "last_login": "2023-06-01T10:30:00Z",
        "created_at": "2023-01-01T00:00:00Z",
        "status": 1
      }
      // 更多用户...
    ]
  }
}
```

#### 2.6.2 创建用户

- **URL**: `/users`
- **方法**: POST
- **描述**: 创建新用户
- **请求参数**:

```json
{
  "username": "staff1",
  "password": "123456",
  "name": "员工1",
  "phone": "13800138001",
  "role": "staff",
  "avatar": "https://example.com/avatar1.jpg",
  "status": 1
}
```

- **响应示例**:

```json
{
  "code": 200,
  "message": "创建成功",
  "data": {
    "id": 2,
    "username": "staff1",
    "name": "员工1",
    "phone": "13800138001",
    "role": "staff",
    "avatar": "https://example.com/avatar1.jpg",
    "created_at": "2023-06-10T14:30:00Z",
    "status": 1
  }
}
```

#### 2.6.3 更新用户

- **URL**: `/users/{id}`
- **方法**: PUT
- **描述**: 更新指定用户信息
- **请求参数**:

```json
{
  "name": "员工1更新",
  "phone": "13900139001",
  "role": "manager",
  "avatar": "https://example.com/avatar1-new.jpg",
  "status": 1
}
```

- **响应示例**:

```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": 2,
    "username": "staff1",
    "name": "员工1更新",
    "phone": "13900139001",
    "role": "manager",
    "avatar": "https://example.com/avatar1-new.jpg",
    "last_login": "2023-06-01T10:30:00Z",
    "created_at": "2023-06-10T14:30:00Z",
    "updated_at": "2023-06-15T09:20:00Z",
    "status": 1
  }
}
```

#### 2.6.4 删除用户

- **URL**: `/users/{id}`
- **方法**: DELETE
- **描述**: 删除指定用户
- **请求参数**: 无
- **响应示例**:

```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

#### 2.6.5 重置用户密码

- **URL**: `/users/{id}/reset-password`
- **方法**: POST
- **描述**: 重置指定用户的密码
- **请求参数**:

```json
{
  "new_password": "123456"
}
```

- **响应示例**:

```json
{
  "code": 200,
  "message": "密码重置成功",
  "data": null
}
```

## 3. 水果管理

### 3.1 获取水果列表

- **URL**: `/fruits`
- **方法**: GET
- **描述**: 获取水果列表
- **请求参数**: 
  - `page`: 页码
  - `limit`: 每页记录数
  - `keyword`: 搜索关键词（可选）
  - `category`: 类别筛选（可选）
  - `status`: 状态筛选（可选）
- **响应示例**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "total": 100,
    "pages": 5,
    "current": 1,
    "limit": 20,
    "items": [
      {
        "id": 1,
        "brand": "品牌A",
        "name": "苹果",
        "category": "核果类",
        "variety": "红富士",
        "spec": "10kg/箱",
        "package_type": "箱装",
        "weight": 10.0,
        "min_price": 50.0,
        "max_price": 60.0,
        "image": "https://example.com/apple.jpg",
        "created_at": "2023-05-01T00:00:00Z",
        "updated_at": "2023-05-01T00:00:00Z",
        "status": 1
      }
      // 更多水果...
    ]
  }
}
```

### 3.2 获取水果详情

- **URL**: `/fruits/{id}`
- **方法**: GET
- **描述**: 获取指定水果的详细信息
- **请求参数**: 无
- **响应示例**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": 1,
    "brand": "品牌A",
    "name": "苹果",
    "category": "核果类",
    "variety": "红富士",
    "spec": "10kg/箱",
    "package_type": "箱装",
    "weight": 10.0,
    "min_price": 50.0,
    "max_price": 60.0,
    "image": "https://example.com/apple.jpg",
    "created_at": "2023-05-01T00:00:00Z",
    "updated_at": "2023-05-01T00:00:00Z",
    "status": 1,
    "inventory": 100,  // 当前库存数量
    "sales_count": 50  // 销售总量
  }
}
```

### 3.3 创建水果

- **URL**: `/fruits`
- **方法**: POST
- **描述**: 创建新水果
- **请求参数**:

```json
{
  "brand": "品牌B",
  "name": "香蕉",
  "category": "热带水果",
  "variety": "小米蕉",
  "spec": "15kg/箱",
  "package_type": "箱装",
  "weight": 15.0,
  "min_price": 40.0,
  "max_price": 45.0,
  "image": "https://example.com/banana.jpg",
  "status": 1
}
```

- **响应示例**:

```json
{
  "code": 200,
  "message": "创建成功",
  "data": {
    "id": 2,
    "brand": "品牌B",
    "name": "香蕉",
    "category": "热带水果",
    "variety": "小米蕉",
    "spec": "15kg/箱",
    "package_type": "箱装",
    "weight": 15.0,
    "min_price": 40.0,
    "max_price": 45.0,
    "image": "https://example.com/banana.jpg",
    "created_at": "2023-06-10T14:30:00Z",
    "updated_at": "2023-06-10T14:30:00Z",
    "status": 1
  }
}
```

### 3.4 更新水果

- **URL**: `/fruits/{id}`
- **方法**: PUT
- **描述**: 更新指定水果信息
- **请求参数**:

```json
{
  "brand": "品牌B更新",
  "name": "香蕉",
  "category": "热带水果",
  "variety": "小米蕉",
  "spec": "15kg/箱",
  "package_type": "箱装",
  "weight": 15.0,
  "min_price": 42.0,
  "max_price": 48.0,
  "image": "https://example.com/banana-new.jpg",
  "status": 1
}
```

- **响应示例**:

```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": 2,
    "brand": "品牌B更新",
    "name": "香蕉",
    "category": "热带水果",
    "variety": "小米蕉",
    "spec": "15kg/箱",
    "package_type": "箱装",
    "weight": 15.0,
    "min_price": 42.0,
    "max_price": 48.0,
    "image": "https://example.com/banana-new.jpg",
    "created_at": "2023-06-10T14:30:00Z",
    "updated_at": "2023-06-15T09:20:00Z",
    "status": 1
  }
}
```

### 3.5 删除水果

- **URL**: `/fruits/{id}`
- **方法**: DELETE
- **描述**: 删除指定水果（软删除）
- **请求参数**: 无
- **响应示例**:

```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

### 3.6 更新水果状态

- **URL**: `/fruits/{id}/status`
- **方法**: PUT
- **描述**: 更新水果上架/下架状态
- **请求参数**:

```json
{
  "status": 0  // 0:下架 1:上架
}
```

- **响应示例**:

```json
{
  "code": 200,
  "message": "状态更新成功",
  "data": {
    "id": 2,
    "status": 0
  }
}
```

### 3.7 获取水果类别列表

- **URL**: `/fruits/categories`
- **方法**: GET
- **描述**: 获取系统中所有水果类别
- **请求参数**: 无
- **响应示例**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": [
    "核果类",
    "热带水果",
    "柑橘类",
    "浆果类"
    // 更多类别...
  ]
}
```

## 4. 客户管理

### 4.1 获取客户列表

- **URL**: `/customers`
- **方法**: GET
- **描述**: 获取客户列表
- **请求参数**: 
  - `page`: 页码
  - `limit`: 每页记录数
  - `keyword`: 搜索关键词（可选）
  - `status`: 状态筛选（可选）
- **响应示例**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "total": 80,
    "pages": 4,
    "current": 1,
    "limit": 20,
    "items": [
      {
        "id": 1,
        "name": "客户A",
        "phone": "13800138000",
        "address": "北京市朝阳区xxx街道",
        "total_sales": 10000.00,
        "paid_amount": 8000.00,
        "unpaid_amount": 2000.00,
        "remark": "重要客户",
        "created_at": "2023-01-15T00:00:00Z",
        "updated_at": "2023-06-01T00:00:00Z",
        "status": 1
      }
      // 更多客户...
    ]
  }
}
```

### 4.2 获取客户详情

- **URL**: `/customers/{id}`
- **方法**: GET
- **描述**: 获取指定客户的详细信息
- **请求参数**: 无
- **响应示例**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": 1,
    "name": "客户A",
    "phone": "13800138000",
    "address": "北京市朝阳区xxx街道",
    "total_sales": 10000.00,
    "paid_amount": 8000.00,
    "unpaid_amount": 2000.00,
    "remark": "重要客户",
    "created_at": "2023-01-15T00:00:00Z",
    "updated_at": "2023-06-01T00:00:00Z",
    "status": 1,
    "recent_sales": [
      {
        "id": 101,
        "record_id": "S20230601001",
        "sale_date": "2023-06-01",
        "fruit_name": "红富士苹果",
        "quantity": 10,
        "amount": 500.00