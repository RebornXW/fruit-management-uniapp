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
  - [3.7 获取水果分类列表](#37-获取水果分类列表)
  - [3.8 获取单个水果分类](#38-获取单个水果分类)
  - [3.9 新增水果分类](#39-新增水果分类)
  - [3.10 更新水果分类](#310-更新水果分类)
  - [3.11 删除水果分类](#311-删除水果分类)
  - [3.12 获取水果品种列表](#312-获取水果品种列表)
  - [3.13 获取单个水果品种](#313-获取单个水果品种)
  - [3.14 新增水果品种](#314-新增水果品种)
  - [3.15 更新水果品种](#315-更新水果品种)
  - [3.16 删除水果品种](#316-删除水果品种)
  - [3.17 获取水果分类及其品种](#317-获取水果分类及其品种)
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
- [10. 系统码表](#10-系统码表)
  - [10.1 获取指定类型的码值](#101-获取指定类型的码值)
  - [10.2 获取所有码值类型](#102-获取所有码值类型)
  - [10.3 批量获取多个类型的码值](#103-批量获取多个类型的码值)


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
    "stall_name": "总部",
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
  "stall_name": "新档口",
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
    "stall_name": "新档口",
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
        "stall_name": "总部",
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
  "stall_name": "水果档口A01",
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
    "stall_name": "水果档口A01",
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
  "stall_name": "水果档口B02",
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
    "stall_name": "水果档口B02",
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
        "category_id": 1,
        "variety_id": 1,
        "spec": "10kg/箱",
        "package_type": "箱装",
        "weight": 10.0,
        "min_price": 50.0,
        "max_price": 60.0,
        "image": "https://example.com/apple.jpg",
        "created_at": "2023-05-01T00:00:00Z",
        "updated_at": "2023-05-01T00:00:00Z",
        "status": 1,
        "inventory": 85  // 当前库存数量
      }
      // 更多水果...
    ]
  }
}
```

> 注意：每个水果项都包含`inventory`字段，表示当前库存数量。

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
    "category_id": 1,
    "variety_id": 1,
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
  "category_id": 3,
  "variety_id": 6,
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
    "category_id": 3,
    "variety_id": 6,
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
  "category_id": 3,
  "variety_id": 6,
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
    "category_id": 3,
    "variety_id": 6,
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

### 3.7 获取水果分类列表

- **URL**: `/fruits/categories`
- **方法**: GET
- **描述**: 获取系统中所有水果分类
- **请求参数**: 无
- **响应示例**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": [
    {
      "id": 1,
      "name": "苹果",
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-01T00:00:00Z"
    },
    {
      "id": 2,
      "name": "橙子",
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-01T00:00:00Z"
    },
    {
      "id": 3,
      "name": "香蕉",
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-01T00:00:00Z"
    }
    // 更多分类...
  ]
}
```

### 3.8 获取单个水果分类

- **URL**: `/fruits/categories/{id}`
- **方法**: GET
- **描述**: 获取单个水果分类详情
- **请求参数**:
  - `id`: 分类ID
- **响应示例**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": 1,
    "name": "苹果",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z"
  }
}
```

### 3.9 新增水果分类

- **URL**: `/fruits/categories`
- **方法**: POST
- **描述**: 新增水果分类
- **请求参数**:

```json
{
  "name": "桃子"
}
```

- **响应示例**:

```json
{
  "code": 200,
  "message": "创建成功",
  "data": {
    "id": 4,
    "name": "桃子",
    "created_at": "2025-04-19T15:45:30Z",
    "updated_at": "2025-04-19T15:45:30Z"
  }
}
```

### 3.10 更新水果分类

- **URL**: `/fruits/categories/{id}`
- **方法**: PUT
- **描述**: 更新水果分类
- **请求参数**:
  - `id`: 分类ID

```json
{
  "name": "水蕉"
}
```

- **响应示例**:

```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": 3,
    "name": "水蕉",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2025-04-19T15:45:30Z"
  }
}
```

### 3.11 删除水果分类

- **URL**: `/fruits/categories/{id}`
- **方法**: DELETE
- **描述**: 删除水果分类
- **请求参数**:
  - `id`: 分类ID
- **响应示例**:

```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

### 3.12 获取水果品种列表

- **URL**: `/fruits/varieties`
- **方法**: GET
- **描述**: 获取水果品种列表
- **请求参数**:
  - `category_id`: 分类ID（可选）
- **响应示例**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": [
    {
      "id": 1,
      "category_id": 1,
      "name": "红富士",
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-01T00:00:00Z"
    },
    {
      "id": 2,
      "category_id": 1,
      "name": "嘎啦",
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-01T00:00:00Z"
    },
    {
      "id": 3,
      "category_id": 1,
      "name": "金帅",
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-01T00:00:00Z"
    }
    // 更多品种...
  ]
}
```

### 3.13 获取单个水果品种

- **URL**: `/fruits/varieties/{id}`
- **方法**: GET
- **描述**: 获取单个水果品种详情
- **请求参数**:
  - `id`: 品种ID
- **响应示例**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": 1,
    "category_id": 1,
    "name": "红富士",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z"
  }
}
```

### 3.14 新增水果品种

- **URL**: `/fruits/varieties`
- **方法**: POST
- **描述**: 新增水果品种
- **请求参数**:

```json
{
  "category_id": 1,
  "name": "青苹果"
}
```

- **响应示例**:

```json
{
  "code": 200,
  "message": "创建成功",
  "data": {
    "id": 4,
    "category_id": 1,
    "name": "青苹果",
    "created_at": "2025-04-19T15:45:30Z",
    "updated_at": "2025-04-19T15:45:30Z"
  }
}
```

### 3.15 更新水果品种

- **URL**: `/fruits/varieties/{id}`
- **方法**: PUT
- **描述**: 更新水果品种
- **请求参数**:
  - `id`: 品种ID

```json
{
  "category_id": 1,
  "name": "红苹果"
}
```

- **响应示例**:

```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": 4,
    "category_id": 1,
    "name": "红苹果",
    "created_at": "2025-04-19T15:45:30Z",
    "updated_at": "2025-04-19T15:46:15Z"
  }
}
```

### 3.16 删除水果品种

- **URL**: `/fruits/varieties/{id}`
- **方法**: DELETE
- **描述**: 删除水果品种
- **请求参数**:
  - `id`: 品种ID
- **响应示例**:

```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

### 3.17 获取水果分类及其品种

- **URL**: `/fruits/categories/with-varieties`
- **方法**: GET
- **描述**: 获取所有水果分类及其对应的品种
- **请求参数**: 无
- **响应示例**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": [
    {
      "id": 1,
      "name": "苹果",
      "varieties": [
        {
          "id": 1,
          "name": "红富士",
          "category_id": 1
        },
        {
          "id": 2,
          "name": "嘉啦",
          "category_id": 1
        },
        {
          "id": 3,
          "name": "金帅",
          "category_id": 1
        }
      ]
    },
    {
      "id": 2,
      "name": "橙子",
      "varieties": [
        {
          "id": 4,
          "name": "脖橙",
          "category_id": 2
        },
        {
          "id": 5,
          "name": "血橙",
          "category_id": 2
        }
      ]
    }
    // 更多分类...
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
        "amount": 500.00,
        "payment_status": 1
      },
      {
        "id": 95,
        "record_id": "S20230520005",
        "sale_date": "2023-05-20",
        "fruit_name": "香蕉",
        "quantity": 5,
        "amount": 200.00,
        "payment_status": 1
      }
      // 更多销售记录...
    ],
    "recent_payments": [
      {
        "id": 56,
        "payment_id": "P20230601002",
        "payment_date": "2023-06-01",
        "amount": 500.00,
        "payment_method": "微信支付"
      },
      {
        "id": 42,
        "payment_id": "P20230520001",
        "payment_date": "2023-05-20",
        "amount": 200.00,
        "payment_method": "现金"
      }
      // 更多付款记录...
    ]
  }
}
```

### 4.3 创建客户

- **URL**: `/customers`
- **方法**: POST
- **描述**: 创建新客户
- **请求参数**:

```json
{
  "name": "客户B",
  "phone": "13900139001",
  "address": "上海市浦东新区xxx路",
  "remark": "新客户",
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
    "name": "客户B",
    "phone": "13900139001",
    "address": "上海市浦东新区xxx路",
    "total_sales": 0.00,
    "paid_amount": 0.00,
    "unpaid_amount": 0.00,
    "remark": "新客户",
    "created_at": "2023-06-10T14:30:00Z",
    "updated_at": "2023-06-10T14:30:00Z",
    "status": 1
  }
}
```

### 4.4 更新客户

- **URL**: `/customers/{id}`
- **方法**: PUT
- **描述**: 更新指定客户信息
- **请求参数**:

```json
{
  "name": "客户B更新",
  "phone": "13900139002",
  "address": "上海市浦东新区yyy路",
  "remark": "重要客户",
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
    "name": "客户B更新",
    "phone": "13900139002",
    "address": "上海市浦东新区yyy路",
    "total_sales": 0.00,
    "paid_amount": 0.00,
    "unpaid_amount": 0.00,
    "remark": "重要客户",
    "created_at": "2023-06-10T14:30:00Z",
    "updated_at": "2023-06-15T09:20:00Z",
    "status": 1
  }
}
```

### 4.5 删除客户

- **URL**: `/customers/{id}`
- **方法**: DELETE
- **描述**: 删除指定客户（软删除）
- **请求参数**: 无
- **响应示例**:

```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

### 4.6 获取客户销售记录

- **URL**: `/customers/{id}/sales`
- **方法**: GET
- **描述**: 获取指定客户的销售记录
- **请求参数**:
  - `page`: 页码
  - `limit`: 每页记录数
  - `start_date`: 开始日期（可选）
  - `end_date`: 结束日期（可选）
  - `payment_status`: 付款状态（可选，0:未付款, 1:已付款, 2:部分付款，可使用逗号分隔多个值如"0,2"表示所有待付款记录）
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
        "id": 101,
        "record_id": "S20230601001",
        "sale_date": "2023-06-01",
        "fruit_name": "红富士苹果",
        "quantity": 10,
        "unit_price": 50.00,
        "amount": 500.00,
        "payment_status": 1,
        "created_at": "2023-06-01T10:30:00Z",
        "updated_at": "2023-06-01T10:30:00Z"
      },
      {
        "id": 95,
        "record_id": "S20230520005",
        "sale_date": "2023-05-20",
        "fruit_name": "香蕉",
        "quantity": 5,
        "unit_price": 40.00,
        "amount": 200.00,
        "payment_status": 1,
        "created_at": "2023-05-20T14:20:00Z",
        "updated_at": "2023-05-20T14:20:00Z"
      }
      // 更多销售记录...
    ]
  }
}
```

### 4.7 获取客户付款记录

- **URL**: `/customers/{id}/payments`
- **方法**: GET
- **描述**: 获取指定客户的付款记录
- **请求参数**:
  - `page`: 页码
  - `limit`: 每页记录数
  - `start_date`: 开始日期（可选）
  - `end_date`: 结束日期（可选）
  - `payment_method`: 付款方式（可选）
- **响应示例**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "total": 30,
    "pages": 2,
    "current": 1,
    "limit": 20,
    "items": [
      {
        "id": 56,
        "payment_id": "P20230601002",
        "payment_date": "2023-06-01",
        "amount": 500.00,
        "payment_method": "微信支付",
        "remark": "6月1日货款",
        "created_at": "2023-06-01T11:00:00Z",
        "updated_at": "2023-06-01T11:00:00Z"
      },
      {
        "id": 42,
        "payment_id": "P20230520001",
        "payment_date": "2023-05-20",
        "amount": 200.00,
        "payment_method": "现金",
        "remark": "5月20日货款",
        "created_at": "2023-05-20T15:00:00Z",
        "updated_at": "2023-05-20T15:00:00Z"
      }
      // 更多付款记录...
    ]
  }
}
```

## 5. 销售管理

### 5.1 获取销售记录列表

- **URL**: `/sales`
- **方法**: GET
- **描述**: 获取销售记录列表
- **权限**: 需要登录认证，销售员只能查看自己的销售记录，管理员、档口老板和财务员可以查看所有销售记录
- **请求参数**:
  - `page`: 页码
  - `limit`: 每页记录数
  - `keyword`: 搜索关键词（可选）
  - `customer_id`: 客户ID筛选（可选）
  - `fruit_id`: 水果ID筛选（可选）
  - `start_date`: 开始日期（可选）
  - `end_date`: 结束日期（可选）
  - `payment_status`: 付款状态筛选（可选）
- **响应示例**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "total": 200,
    "pages": 10,
    "current": 1,
    "limit": 20,
    "items": [
      {
        "id": 101,
        "record_id": "S20230601001",
        "customer_id": 1,
        "customer_name": "客户A",
        "sale_date": "2023-06-01",
        "fruit_id": 1,
        "fruit_name": "红富士苹果",
        "quantity": 10,
        "unit_price": 50.00,
        "amount": 500.00,
        "payment_status": 1,
        "remark": "",
        "created_at": "2023-06-01T10:30:00Z",
        "updated_at": "2023-06-01T10:30:00Z"
      },
      {
        "id": 100,
        "record_id": "S20230531005",
        "customer_id": 2,
        "customer_name": "客户B",
        "sale_date": "2023-05-31",
        "fruit_id": 2,
        "fruit_name": "香蕉",
        "quantity": 8,
        "unit_price": 40.00,
        "amount": 320.00,
        "payment_status": 0,
        "remark": "",
        "created_at": "2023-05-31T16:20:00Z",
        "updated_at": "2023-05-31T16:20:00Z"
      }
      // 更多销售记录...
    ]
  }
}
```

### 5.2 获取销售记录详情

- **URL**: `/sales/{id}`
- **方法**: GET
- **描述**: 获取指定销售记录的详细信息
- **请求参数**: 无
- **响应示例**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": 101,
    "record_id": "S20230601001",
    "customer_id": 1,
    "customer_name": "客户A",
    "customer_phone": "13800138000",
    "sale_date": "2023-06-01",
    "fruit_id": 1,
    "fruit_name": "红富士苹果",
    "fruit_spec": "10kg/箱",
    "quantity": 10,
    "unit_price": 50.00,
    "amount": 500.00,
    "payment_status": 1,
    "remark": "",
    "created_by": "admin",
    "created_at": "2023-06-01T10:30:00Z",
    "updated_at": "2023-06-01T10:30:00Z",
    "related_payments": [
      {
        "id": 56,
        "payment_id": "P20230601002",
        "payment_date": "2023-06-01",
        "amount": 500.00,
        "payment_method": "微信支付"
      }
    ]
  }
}
```

### 5.3 创建销售记录

- **URL**: `/sales`
- **方法**: POST
- **描述**: 创建新销售记录
- **请求参数**:

```json
{
  "user_id": 1,
  "customer_id": 1,
  "fruit_id": 3,
  "unit_price": 45.00,
  "quantity": 15,
  "amount": 675.00,
  "payment_status": "0",
  "remark": "批发订单"
}
```

> 注意：
> 1. `recordId`（销售记录编号）由系统自动生成，格式为"S + 年月日 + 3位序号"，例如"S20230602001"
> 2. `sale_datetime`（销售时间）由系统自动生成为当前时间，不需要在请求中提供

- **响应示例**:

```json
{
  "code": 200,
  "message": "创建成功",
  "data": {
    "id": 102,
    "record_id": "S20230602001",
    "customer_id": 1,
    "customer_name": "客户A",
    "sale_date": "2023-06-02",
    "fruit_id": 3,
    "fruit_name": "橙子",
    "quantity": 15,
    "unit_price": 45.00,
    "amount": 675.00,
    "payment_status": 0,
    "remark": "批发订单",
    "created_at": "2023-06-02T09:15:00Z",
    "updated_at": "2023-06-02T09:15:00Z"
  }
}
```

### 5.4 更新销售记录

- **URL**: `/sales/{id}`
- **方法**: PUT
- **描述**: 更新指定销售记录信息
- **请求参数**:

```json
{
  "customer_id": 1,
  "sale_date": "2023-06-02",
  "fruit_id": 3,
  "quantity": 20,
  "unit_price": 42.00,
  "payment_status": 0,
  "remark": "批发订单-已修改"
}
```

- **响应示例**:

```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": 102,
    "record_id": "S20230602001",
    "customer_id": 1,
    "customer_name": "客户A",
    "sale_date": "2023-06-02",
    "fruit_id": 3,
    "fruit_name": "橙子",
    "quantity": 20,
    "unit_price": 42.00,
    "amount": 840.00,
    "payment_status": 0,
    "remark": "批发订单-已修改",
    "created_at": "2023-06-02T09:15:00Z",
    "updated_at": "2023-06-02T10:30:00Z"
  }
}
```

### 5.5 删除销售记录

- **URL**: `/sales/{id}`
- **方法**: DELETE
- **描述**: 删除指定销售记录
- **请求参数**: 无
- **响应示例**:

```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

### 5.6 更新销售记录付款状态

- **URL**: `/sales/{id}/payment-status`
- **方法**: PUT
- **描述**: 更新销售记录的付款状态
- **请求参数**:

```json
{
  "payment_status": 1  // 0:未付款 1:已付款 2:部分付款
}
```

- **响应示例**:

```json
{
  "code": 200,
  "message": "状态更新成功",
  "data": {
    "id": 102,
    "record_id": "S20230602001",
    "payment_status": 1,
    "updated_at": "2023-06-03T14:20:00Z"
  }
}
```

### 5.7 获取销售记录关联的付款记录

- **URL**: `/sales/{id}/payments`
- **方法**: GET
- **描述**: 获取指定销售记录关联的付款记录
- **请求参数**:
  - `page`: 页码
  - `limit`: 每页记录数
- **响应示例**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "total": 2,
    "pages": 1,
    "current": 1,
    "limit": 20,
    "items": [
      {
        "id": 56,
        "payment_id": "P20230601002",
        "customer_id": 1,
        "customer_name": "客户A",
        "payment_date": "2023-06-01",
        "amount": 300.00,
        "payment_method": "微信支付",
        "remark": "部分付款",
        "created_at": "2023-06-01T11:00:00Z",
        "updated_at": "2023-06-01T11:00:00Z"
      },
      {
        "id": 60,
        "payment_id": "P20230603001",
        "customer_id": 1,
        "customer_name": "客户A",
        "payment_date": "2023-06-03",
        "amount": 540.00,
        "payment_method": "银行转账",
        "remark": "剩余付款",
        "created_at": "2023-06-03T14:20:00Z",
        "updated_at": "2023-06-03T14:20:00Z"
      }
    ]
  }
}
```

## 6. 库存管理

### 6.1 获取库存记录列表

- **URL**: `/inventory`
- **方法**: GET
- **描述**: 获取库存记录列表
- **请求参数**:
  - `page`: 页码
  - `limit`: 每页记录数
  - `keyword`: 搜索关键词（可选）
  - `fruit_id`: 水果ID筛选（可选）
  - `category_id`: 分类ID筛选（可选）
  - `start_date`: 开始日期（可选）
  - `end_date`: 结束日期（可选）
  - `type`: 类型筛选（可选，1:入库 2:出库）
- **响应示例**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "total": 150,
    "pages": 8,
    "current": 1,
    "limit": 20,
    "items": [
      {
        "id": 201,
        "record_id": "I20230605001",
        "fruit_id": 1,
        "fruit_name": "红富士苹果",
        "type": 1,
        "quantity": 100,
        "unit_price": 40.00,
        "amount": 4000.00,
        "operation_date": "2023-06-05",
        "supplier": "供应商A",
        "remark": "批量入库",
        "created_at": "2023-06-05T09:00:00Z",
        "updated_at": "2023-06-05T09:00:00Z"
      },
      {
        "id": 200,
        "record_id": "I20230604002",
        "fruit_id": 2,
        "fruit_name": "香蕉",
        "type": 1,
        "quantity": 50,
        "unit_price": 30.00,
        "amount": 1500.00,
        "operation_date": "2023-06-04",
        "supplier": "供应商B",
        "remark": "常规入库",
        "created_at": "2023-06-04T14:30:00Z",
        "updated_at": "2023-06-04T14:30:00Z"
      }
      // 更多库存记录...
    ]
  }
}
```

### 6.2 获取库存记录详情

- **URL**: `/inventory/{id}`
- **方法**: GET
- **描述**: 获取指定库存记录的详细信息
- **请求参数**: 无
- **响应示例**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": 201,
    "record_id": "I20230605001",
    "fruit_id": 1,
    "fruit_name": "红富士苹果",
    "fruit_spec": "10kg/箱",
    "type": 1,
    "quantity": 100,
    "unit_price": 40.00,
    "amount": 4000.00,
    "operation_date": "2023-06-05",
    "supplier": "供应商A",
    "remark": "批量入库",
    "created_by": "admin",
    "created_at": "2023-06-05T09:00:00Z",
    "updated_at": "2023-06-05T09:00:00Z",
    "related_sales": [],
    "current_stock": 85  // 当前库存数量
  }
}
```

### 6.3 创建库存记录

- **URL**: `/inventory`
- **方法**: POST
- **描述**: 创建新库存记录
- **请求参数**:

```json
{
  "fruit_id": 3,
  "operation_type": "in",
  "quantity": 80,
  "operator_id": 1,
  "source": "供应商C",
  "remark": "批量入库"
}
```

> 注意：`recordId`（库存记录编号）由系统自动生成，格式为“I/O(入库/出库) + 年月日 + 3位序号”，例如“I20230606001”

- **响应示例**:

```json
{
  "code": 200,
  "message": "创建成功",
  "data": {
    "id": 202,
    "record_id": "I20230606001",
    "fruit_id": 3,
    "fruit_name": "橙子",
    "type": 1,
    "quantity": 80,
    "unit_price": 35.00,
    "amount": 2800.00,
    "operation_date": "2023-06-06",
    "supplier": "供应商C",
    "remark": "批量入库",
    "created_at": "2023-06-06T10:15:00Z",
    "updated_at": "2023-06-06T10:15:00Z"
  }
}
```

### 6.4 更新库存记录

- **URL**: `/inventory/{id}`
- **方法**: PUT
- **描述**: 更新指定库存记录信息
- **请求参数**:

```json
{
  "fruit_id": 3,
  "operation_type": 1,
  "quantity": 85,
  "operator_id": 1,
  "unit_price": 34.00,
  "source": "供应商C",
  "remark": "批量入库-已修改"
}
```

> 注意：`record_id`（库存记录编号）和`operation_datetime`（操作时间）由系统自动生成和更新，客户端无需提供。

- **响应示例**:

```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": 202,
    "record_id": "I20230606001",
    "fruit_id": 3,
    "fruit_name": "橙子",
    "type": 1,
    "quantity": 85,
    "unit_price": 34.00,
    "amount": 2890.00,
    "operation_date": "2023-06-06",
    "supplier": "供应商C",
    "remark": "批量入库-已修改",
    "created_at": "2023-06-06T10:15:00Z",
    "updated_at": "2023-06-06T11:30:00Z"
  }
}
```

### 6.5 删除库存记录

- **URL**: `/inventory/{id}`
- **方法**: DELETE
- **描述**: 删除指定库存记录
- **请求参数**: 无
- **响应示例**:

```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

### 6.6 获取当前库存汇总

- **URL**: `/inventory/summary`
- **方法**: GET
- **描述**: 获取当前库存汇总信息
- **请求参数**:
  - `category_id`: 分类ID筛选（可选）
- **响应示例**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "total_items": 10,
    "total_quantity": 1200,
    "total_value": 48000.00,
    "items": [
      {
        "fruit_id": 1,
        "fruit_name": "红富士苹果",
        "category_id": 1,
        "category_name": "苹果",
        "quantity": 85,
        "avg_price": 40.00,
        "value": 3400.00,
        "last_in_date": "2023-06-05"
      },
      {
        "fruit_id": 2,
        "fruit_name": "香蕉",
        "category_id": 3,
        "category_name": "香蕉",
        "quantity": 42,
        "avg_price": 30.00,
        "value": 1260.00,
        "last_in_date": "2023-06-04"
      }
      // 更多水果库存...
    ]
  }
}
```

### 6.7 库存警告设置

- **URL**: `/inventory/alert-settings`
- **方法**: GET
- **描述**: 获取库存警告设置
- **请求参数**: 无
- **响应示例**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "global_min_quantity": 10,
    "global_alert_enabled": true,
    "fruit_settings": [
      {
        "fruit_id": 1,
        "fruit_name": "红富士苹果",
        "min_quantity": 20,
        "alert_enabled": true
      },
      {
        "fruit_id": 3,
        "fruit_name": "橙子",
        "min_quantity": 15,
        "alert_enabled": true
      }
    ]
  }
}
```

- **URL**: `/inventory/alert-settings`
- **方法**: PUT
- **描述**: 更新库存警告设置
- **请求参数**:

```json
{
  "global_min_quantity": 15,
  "global_alert_enabled": true,
  "fruit_settings": [
    {
      "fruit_id": 1,
      "min_quantity": 25,
      "alert_enabled": true
    },
    {
      "fruit_id": 3,
      "min_quantity": 20,
      "alert_enabled": true
    }
  ]
}
```

- **响应示例**:

```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "global_min_quantity": 15,
    "global_alert_enabled": true,
    "fruit_settings": [
      {
        "fruit_id": 1,
        "fruit_name": "红富士苹果",
        "min_quantity": 25,
        "alert_enabled": true
      },
      {
        "fruit_id": 3,
        "fruit_name": "橙子",
        "min_quantity": 20,
        "alert_enabled": true
      }
    ]
  }
}
```

### 6.8 获取库存警告列表

- **URL**: `/inventory/alerts`
- **方法**: GET
- **描述**: 获取当前库存警告列表
- **请求参数**: 无
- **响应示例**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": [
    {
      "fruit_id": 4,
      "fruit_name": "梨",
      "category_name": "梨",
      "current_quantity": 8,
      "min_quantity": 10,
      "alert_level": "warning"
    },
    {
      "fruit_id": 5,
      "fruit_name": "葡萄",
      "category_name": "葡萄",
      "current_quantity": 5,
      "min_quantity": 15,
      "alert_level": "danger"
    }
  ]
}
```

## 7. 财务管理

### 7.1 获取付款记录列表

- **URL**: `/payments`
- **方法**: GET
- **描述**: 获取付款记录列表
- **请求参数**:
  - `page`: 页码
  - `limit`: 每页记录数
  - `keyword`: 搜索关键词（可选）
  - `customer_id`: 客户ID筛选（可选）
  - `payment_method`: 付款方式筛选（可选）
  - `start_date`: 开始日期（可选）
  - `end_date`: 结束日期（可选）
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
        "id": 60,
        "payment_id": "P20230603001",
        "customer_id": 1,
        "customer_name": "客户A",
        "payment_date": "2023-06-03",
        "amount": 540.00,
        "payment_method": "银行转账",
        "remark": "剩余付款",
        "created_at": "2023-06-03T14:20:00Z",
        "updated_at": "2023-06-03T14:20:00Z"
      },
      {
        "id": 56,
        "payment_id": "P20230601002",
        "customer_id": 1,
        "customer_name": "客户A",
        "payment_date": "2023-06-01",
        "amount": 300.00,
        "payment_method": "微信支付",
        "remark": "部分付款",
        "created_at": "2023-06-01T11:00:00Z",
        "updated_at": "2023-06-01T11:00:00Z"
      }
      // 更多付款记录...
    ]
  }
}
```

### 7.2 获取付款记录详情

- **URL**: `/payments/{id}`
- **方法**: GET
- **描述**: 获取指定付款记录的详细信息
- **请求参数**: 无
- **响应示例**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": 60,
    "payment_id": "P20230603001",
    "customer_id": 1,
    "customer_name": "客户A",
    "customer_phone": "13800138000",
    "payment_date": "2023-06-03",
    "amount": 540.00,
    "payment_method": "银行转账",
    "remark": "剩余付款",
    "created_by": "admin",
    "created_at": "2023-06-03T14:20:00Z",
    "updated_at": "2023-06-03T14:20:00Z",
    "related_sales": [
      {
        "id": 102,
        "record_id": "S20230602001",
        "sale_date": "2023-06-02",
        "fruit_name": "橙子",
        "amount": 840.00,
        "applied_amount": 540.00
      }
    ]
  }
}
```

### 7.3 创建付款记录

- **URL**: `/payments`
- **方法**: POST
- **描述**: 创建新付款记录
- **请求参数**:

```json
{
  "customer_id": 2,
  "payment_date": "2023-06-04",
  "amount": 320.00,
  "payment_method": "支付宝",
  "remark": "全额付款",
  "related_sales": [100]  // 关联的销售记录ID数组（可选）
}
```

- **响应示例**:

```json
{
  "code": 200,
  "message": "创建成功",
  "data": {
    "id": 61,
    "payment_id": "P20230604001",
    "customer_id": 2,
    "customer_name": "客户B",
    "payment_date": "2023-06-04",
    "amount": 320.00,
    "payment_method": "支付宝",
    "remark": "全额付款",
    "created_at": "2023-06-04T09:15:00Z",
    "updated_at": "2023-06-04T09:15:00Z",
    "related_sales": [
      {
        "id": 100,
        "record_id": "S20230531005",
        "sale_date": "2023-05-31",
        "fruit_name": "香蕉",
        "amount": 320.00,
        "applied_amount": 320.00
      }
    ]
  }
}
```

### 7.4 更新付款记录

- **URL**: `/payments/{id}`
- **方法**: PUT
- **描述**: 更新指定付款记录信息
- **请求参数**:

```json
{
  "customer_id": 2,
  "payment_date": "2023-06-04",
  "amount": 320.00,
  "payment_method": "微信支付",
  "remark": "全额付款-已修改"
}
```

- **响应示例**:

```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": 61,
    "payment_id": "P20230604001",
    "customer_id": 2,
    "customer_name": "客户B",
    "payment_date": "2023-06-04",
    "amount": 320.00,
    "payment_method": "微信支付",
    "remark": "全额付款-已修改",
    "created_at": "2023-06-04T09:15:00Z",
    "updated_at": "2023-06-04T10:30:00Z"
  }
}
```

### 7.5 删除付款记录

- **URL**: `/payments/{id}`
- **方法**: DELETE
- **描述**: 删除指定付款记录
- **请求参数**: 无
- **响应示例**:

```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

### 7.6 获取付款记录关联的销售记录

- **URL**: `/payments/{id}/sales`
- **方法**: GET
- **描述**: 获取指定付款记录关联的销售记录
- **请求参数**:
  - `page`: 页码
  - `limit`: 每页记录数
- **响应示例**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "total": 1,
    "pages": 1,
    "current": 1,
    "limit": 20,
    "items": [
      {
        "id": 102,
        "record_id": "S20230602001",
        "customer_id": 1,
        "customer_name": "客户A",
        "sale_date": "2023-06-02",
        "fruit_name": "橙子",
        "quantity": 20,
        "unit_price": 42.00,
        "amount": 840.00,
        "applied_amount": 540.00,
        "payment_status": 2,
        "created_at": "2023-06-02T09:15:00Z",
        "updated_at": "2023-06-03T14:20:00Z"
      }
    ]
  }
}
```

### 7.7 为付款记录添加关联的销售记录

- **URL**: `/payments/{id}/sales`
- **方法**: POST
- **描述**: 为付款记录添加关联的销售记录
- **请求参数**:

```json
{
  "sales": [
    {
      "sale_id": 103,
      "amount": 200.00  // 应用到该销售记录的金额
    }
  ]
}
```

- **响应示例**:

```json
{
  "code": 200,
  "message": "添加成功",
  "data": {
    "payment_id": 60,
    "added_sales": [
      {
        "sale_id": 103,
        "amount": 200.00
      }
    ],
    "remaining_amount": 0.00  // 付款记录中剩余未分配金额
  }
}
```

### 7.8 移除付款记录关联的销售记录

- **URL**: `/payments/{id}/sales/{sale_id}`
- **方法**: DELETE
- **描述**: 移除付款记录关联的销售记录
- **请求参数**: 无
- **响应示例**:

```json
{
  "code": 200,
  "message": "移除成功",
  "data": {
    "payment_id": 60,
    "removed_sale_id": 103,
    "remaining_amount": 200.00  // 付款记录中剩余未分配金额
  }
}
```

### 7.9 财务统计

- **URL**: `/finance/statistics`
- **方法**: GET
- **描述**: 获取财务统计信息
- **请求参数**:
  - `start_date`: 开始日期（可选）
  - `end_date`: 结束日期（可选）
  - `period`: 统计周期（day/week/month/year，默认month）
- **响应示例**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "total_sales": 50000.00,
    "total_payments": 45000.00,
    "total_unpaid": 5000.00,
    "total_inventory_in": 40000.00,
    "total_inventory_out": 38000.00,
    "gross_profit": 12000.00,
    "period_data": [
      {
        "period": "2023-05",
        "sales": 25000.00,
        "payments": 22000.00,
        "inventory_in": 20000.00,
        "inventory_out": 19000.00,
        "profit": 6000.00
      },
      {
        "period": "2023-06",
        "sales": 25000.00,
        "payments": 23000.00,
        "inventory_in": 20000.00,
        "inventory_out": 19000.00,
        "profit": 6000.00
      }
    ],
    "top_customers": [
      {
        "customer_id": 1,
        "customer_name": "客户A",
        "sales_amount": 15000.00,
        "payment_amount": 14000.00
      },
      {
        "customer_id": 2,
        "customer_name": "客户B",
        "sales_amount": 10000.00,
        "payment_amount": 9500.00
      }
    ],
    "top_fruits": [
      {
        "fruit_id": 1,
        "fruit_name": "红富士苹果",
        "sales_amount": 12000.00,
        "sales_quantity": 240
      },
      {
        "fruit_id": 3,
        "fruit_name": "橙子",
        "sales_amount": 10000.00,
        "sales_quantity": 220
      }
    ]
  }
}
```

## 8. 系统日志

### 8.1 获取系统日志列表

- **URL**: `/logs`
- **方法**: GET
- **描述**: 获取系统日志列表
- **请求参数**:
  - `page`: 页码
  - `limit`: 每页记录数
  - `keyword`: 搜索关键词（可选）
  - `user_id`: 用户ID筛选（可选）
  - `type`: 日志类型筛选（可选）
  - `start_date`: 开始日期（可选）
  - `end_date`: 结束日期（可选）
- **响应示例**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "total": 500,
    "pages": 25,
    "current": 1,
    "limit": 20,
    "items": [
      {
        "id": 1001,
        "user_id": 1,
        "username": "admin",
        "type": "login",
        "action": "用户登录",
        "ip": "192.168.1.100",
        "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "created_at": "2023-06-10T08:00:00Z"
      },
      {
        "id": 1000,
        "user_id": 1,
        "username": "admin",
        "type": "operation",
        "action": "创建销售记录",
        "details": {
          "record_id": "S20230610001",
          "customer_id": 1,
          "amount": 500.00
        },
        "ip": "192.168.1.100",
        "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "created_at": "2023-06-10T08:15:00Z"
      }
      // 更多日志...
    ]
  }
}
```

### 8.2 获取系统日志详情

- **URL**: `/logs/{id}`
- **方法**: GET
- **描述**: 获取指定系统日志的详细信息
- **请求参数**: 无
- **响应示例**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": 1000,
    "user_id": 1,
    "username": "admin",
    "type": "operation",
    "action": "创建销售记录",
    "details": {
      "record_id": "S20230610001",
      "customer_id": 1,
      "customer_name": "客户A",
      "fruit_id": 1,
      "fruit_name": "红富士苹果",
      "quantity": 10,
      "unit_price": 50.00,
      "amount": 500.00,
      "payment_status": 0
    },
    "ip": "192.168.1.100",
    "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "created_at": "2023-06-10T08:15:00Z"
  }
}
```

### 8.3 导出系统日志

- **URL**: `/logs/export`
- **方法**: GET
- **描述**: 导出系统日志
- **请求参数**:
  - `format`: 导出格式（csv/excel，默认excel）
  - `keyword`: 搜索关键词（可选）
  - `user_id`: 用户ID筛选（可选）
  - `type`: 日志类型筛选（可选）
  - `start_date`: 开始日期（可选）
  - `end_date`: 结束日期（可选）
- **响应**: 文件下载

## 9. 统计分析

> **权限说明**:
> - 系统管理员、档口老板、财务员可以查看所有统计数据
> - 销售员只能查看自己创建的销售记录的统计数据
> - 货主无法访问客户统计功能
> - 热销水果排行榜功能对所有用户开放，显示整个档口的数据

### 9.1 销售统计

- **URL**: `/statistics/sales`
- **方法**: GET
- **描述**: 获取销售统计信息
- **权限**: 需要登录认证，销售员只能查看自己的销售记录
- **请求参数**:
  - `start_date`: 开始日期（可选）
  - `end_date`: 结束日期（可选）
  - `period`: 统计周期（day/week/month/year，默认month）
  - `category_id`: 分类ID筛选（可选）
  - `fruit_id`: 水果ID筛选（可选）
  - `customer_id`: 客户ID筛选（可选）
- **响应示例**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "total_sales": 50000.00,
    "total_quantity": 1000,
    "total_count": 50,
    "total_paid": 45000.00,
    "total_unpaid": 5000.00,
    "period_data": [
      {
        "period": "2023-05",
        "sales_count": 25,
        "quantity": 500,
        "sales": 25000.00,
        "payments": 22000.00,
        "unpaid": 3000.00
      },
      {
        "period": "2023-06",
        "sales_count": 25,
        "quantity": 500,
        "sales": 25000.00,
        "payments": 23000.00,
        "unpaid": 2000.00
      }
    ],
    "category_data": [
      {
        "category_id": 1,
        "category_name": "苹果",
        "sales_count": 15,
        "quantity": 300,
        "sales": 15000.00,
        "percentage": 30
      },
      {
        "category_id": 3,
        "category_name": "香蕉",
        "sales_count": 10,
        "quantity": 250,
        "sales": 10000.00,
        "percentage": 20
      }
    ],
    "fruit_data": [
      {
        "fruit_id": 1,
        "fruit_name": "红富士苹果",
        "category_name": "苹果",
        "sales_count": 12,
        "quantity": 240,
        "sales": 12000.00,
        "percentage": 24
      },
      {
        "fruit_id": 3,
        "fruit_name": "橙子",
        "category_name": "橘子",
        "sales_count": 10,
        "quantity": 220,
        "sales": 10000.00,
        "percentage": 20
      }
    ],
    "customer_data": [
      {
        "customer_id": 1,
        "customer_name": "张三水果店",
        "sales_count": 15,
        "quantity": 300,
        "sales": 15000.00,
        "payments": 14000.00,
        "unpaid": 1000.00,
        "percentage": 30
      },
      {
        "customer_id": 2,
        "customer_name": "李四水果批发",
        "sales_count": 10,
        "quantity": 200,
        "sales": 10000.00,
        "payments": 9000.00,
        "unpaid": 1000.00,
        "percentage": 20
      }
    ]
  }
}
```

### 9.2 库存统计

- **URL**: `/statistics/inventory`
- **方法**: GET
- **描述**: 获取库存统计信息
- **权限**: 需要登录认证
- **请求参数**:
  - `start_date`: 开始日期（可选）
  - `end_date`: 结束日期（可选）
  - `period`: 统计周期（day/week/month/year，默认month）
  - `category_id`: 分类ID筛选（可选）
  - `fruit_id`: 水果ID筛选（可选）
- **响应示例**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "total_items": 5,
    "total_quantity": 2,
    "total_value": 100.00,
    "total_in_quantity": 2,
    "total_out_quantity": 0,
    "period_data": [
      {
        "period": "2024-10",
        "in_quantity": 0,
        "out_quantity": 0
      },
      {
        "period": "2024-11",
        "in_quantity": 0,
        "out_quantity": 0
      },
      {
        "period": "2024-12",
        "in_quantity": 0,
        "out_quantity": 0
      },
      {
        "period": "2025-01",
        "in_quantity": 0,
        "out_quantity": 0
      },
      {
        "period": "2025-02",
        "in_quantity": 0,
        "out_quantity": 0
      },
      {
        "period": "2025-03",
        "in_quantity": 0,
        "out_quantity": 0
      },
      {
        "period": "2025-04",
        "in_quantity": 2,
        "out_quantity": 0
      }
    ],
    "category_data": [
      {
        "category_id": 1,
        "category_name": "苹果",
        "inventory_quantity": 2,
        "inventory_value": 100.00
      },
      {
        "category_id": 2,
        "category_name": "橘子",
        "inventory_quantity": 0,
        "inventory_value": 0
      },
      {
        "category_id": 3,
        "category_name": "香蕉",
        "inventory_quantity": 0,
        "inventory_value": 0
      },
      {
        "category_id": 4,
        "category_name": "葡萄",
        "inventory_quantity": 0,
        "inventory_value": 0
      }
    ],
    "fruit_data": [
      {
        "fruit_id": 1,
        "fruit_name": "红富士苹果",
        "category_name": "苹果",
        "inventory_quantity": 2,
        "inventory_value": 100.00
      },
      {
        "fruit_id": 2,
        "fruit_name": "嘎啦苹果",
        "category_name": "苹果",
        "inventory_quantity": 0,
        "inventory_value": 0
      },
      {
        "fruit_id": 3,
        "fruit_name": "脐橙",
        "category_name": "橘子",
        "inventory_quantity": 0,
        "inventory_value": 0
      },
      {
        "fruit_id": 4,
        "fruit_name": "小米蕉",
        "category_name": "香蕉",
        "inventory_quantity": 0,
        "inventory_value": 0
      },
      {
        "fruit_id": 5,
        "fruit_name": "红提",
        "category_name": "葡萄",
        "inventory_quantity": 0,
        "inventory_value": 0
      }
    ]
  }
}
```

### 9.3 客户统计

- **URL**: `/statistics/customers`
- **方法**: GET
- **描述**: 获取客户统计信息
- **权限**: 需要登录认证，销售员只能查看自己的客户数据，货主无法访问此接口
- **请求参数**:
  - `start_date`: 开始日期（可选）
  - `end_date`: 结束日期（可选）
  - `period`: 统计周期（day/week/month/year，默认month）
  - `customer_id`: 客户ID筛选（可选）
- **响应示例**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "total_customers": 50,
    "active_customers": 30,
    "new_customers": 5,
    "total_sales": 50000.00,
    "total_payments": 45000.00,
    "total_unpaid": 5000.00,
    "period_data": [
      {
        "period": "2023-05",
        "sales_count": 25,
        "quantity": 500,
        "sales": 25000.00,
        "payments": 22000.00,
        "unpaid": 3000.00,
        "active_customers": 25,
        "new_customers": 3
      },
      {
        "period": "2023-06",
        "sales_count": 25,
        "quantity": 500,
        "sales": 25000.00,
        "payments": 23000.00,
        "unpaid": 2000.00,
        "active_customers": 30,
        "new_customers": 2
      }
    ],
    "customer_data": [
      {
        "customer_id": 1,
        "customer_name": "张三水果店",
        "sales_count": 30,
        "quantity": 600,
        "sales": 15000.00,
        "payments": 14000.00,
        "unpaid": 1000.00,
        "percentage": 30
      },
      {
        "customer_id": 2,
        "customer_name": "李四水果批发",
        "sales_count": 20,
        "quantity": 400,
        "sales": 10000.00,
        "payments": 9500.00,
        "unpaid": 500.00,
        "percentage": 20
      }
    ]
  }
}
```

### 9.4 热销水果排行榜

- **URL**: `/statistics/top-fruits`
- **方法**: GET
- **描述**: 获取热销水果排行榜
- **权限**: 所有用户可访问，显示整个档口的数据
- **请求参数**:
  - `time_range`: 时间范围，可选值为"day"（当日）、"week"（本周）、"month"（本月）、"year"（本年），默认为"month"（可选）
  - `limit`: 返回数量限制，默认为10（可选）
  - `sort_by`: 排序依据，可选值为"sales"（销售额）或"quantity"（销售量），默认为"sales"（可选）
- **响应示例**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "period": "本月(2023年5月)",
    "total_sales": 50000.00,
    "total_quantity": 1000,
    "fruits": [
      {
        "rank": 1,
        "fruit_id": 1,
        "fruit_name": "红富士苹果",
        "category_name": "苹果",
        "sales": 12000.00,
        "quantity": 240,
        "percentage": 24.00
      },
      {
        "rank": 2,
        "fruit_id": 3,
        "fruit_name": "脑橙",
        "category_name": "橘子",
        "sales": 10000.00,
        "quantity": 220,
        "percentage": 20.00
      },
      {
        "rank": 3,
        "fruit_id": 4,
        "fruit_name": "小米蕉",
        "category_name": "香蕉",
        "sales": 8000.00,
        "quantity": 200,
        "percentage": 16.00
      }
    ]
  }
}
```