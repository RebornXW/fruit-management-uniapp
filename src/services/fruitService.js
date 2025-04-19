// 水果服务
import http from './http.js';

/**
 * 获取水果列表，可传递查询参数
 * @param {Object} params 查询参数
 */
export function getFruits(params = {}) {
    return http.request({ url: '/fruits', method: 'GET', data: params });
}

/**
 * 获取单个水果详情
 * @param {string|number} id 水果ID
 */
export function getFruitById(id) {
    return http.request({ url: `/fruits/${id}`, method: 'GET' });
}

/**
 * 创建新水果
 * @param {Object} data 水果数据
 */
export function createFruit(data) {
    return http.request({ url: '/fruits', method: 'POST', data });
}

/**
 * 更新水果
 * @param {string|number} id 水果ID
 * @param {Object} data 更新字段
 */
export function updateFruit(id, data) {
    return http.request({ url: `/fruits/${id}`, method: 'PUT', data });
}

/**
 * 删除水果
 * @param {string|number} id 水果ID
 */
export function deleteFruit(id) {
    return http.request({ url: `/fruits/${id}`, method: 'DELETE' });
}

/**
 * 获取水果分类列表
 */
export function getCategories() {
    return http.request({ url: '/fruits/categories', method: 'GET' });
}

/**
 * 获取水果品种列表，可传categoryId
 * @param {Object} params 查询参数
 */
export function getVarieties(params = {}) {
    return http.request({ url: '/fruits/varieties', method: 'GET', data: params });
}

export default {
    getFruits,
    getFruitById,
    createFruit,
    updateFruit,
    deleteFruit,
    getCategories,
    getVarieties
};
