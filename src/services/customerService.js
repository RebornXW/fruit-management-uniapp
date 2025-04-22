import http from './http.js';

/**
 * 获取客户列表
 * @param {Object} params 查询参数
 * @returns {Promise} 客户列表
 */
export function getCustomers(params = {}) {
    return http.request({ url: '/customers', method: 'GET', data: params });
}

/**
 * 获取客户详情
 * @param {string|number} id 客户ID
 * @returns {Promise} 客户详情
 */
export function getCustomerById(id) {
    return http.request({ url: `/customers/${id}`, method: 'GET' });
}

/**
 * 创建客户
 * @param {Object} data 客户数据
 * @returns {Promise} 创建结果
 */
export function createCustomer(data) {
    return http.request({ url: '/customers', method: 'POST', data });
}

/**
 * 更新客户
 * @param {string|number} id 客户ID
 * @param {Object} data 更新字段
 * @returns {Promise} 更新结果
 */
export function updateCustomer(id, data) {
    return http.request({ url: `/customers/${id}`, method: 'PUT', data });
}

/**
 * 删除客户
 * @param {string|number} id 客户ID
 * @returns {Promise} 删除结果
 */
export function deleteCustomer(id) {
    return http.request({ url: `/customers/${id}`, method: 'DELETE' });
}

/**
 * 获取客户销售记录
 * @param {string|number} id 客户ID
 * @param {Object} params 查询参数
 * @returns {Promise} 销售记录列表
 */
export function getCustomerSales(id, params = {}) {
    return http.request({ url: `/customers/${id}/sales`, method: 'GET', data: params });
}

/**
 * 获取客户付款记录
 * @param {string|number} id 客户ID
 * @param {Object} params 查询参数
 * @returns {Promise} 付款记录列表
 */
export function getCustomerPayments(id, params = {}) {
    return http.request({ url: `/customers/${id}/payments`, method: 'GET', data: params });
}

/**
 * 获取客户欠款信息
 * @param {string|number} id 客户ID
 * @returns {Promise} 客户欠款信息
 */
export function getCustomerDebtInfo(id) {
    return http.request({ url: `/customers/${id}/debt-info`, method: 'GET' });
}

export default {
    getCustomers,
    getCustomerById,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerSales,
    getCustomerPayments,
    getCustomerDebtInfo
};
