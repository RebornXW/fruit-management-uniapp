import http from './http.js';

/**
 * 获取销售记录列表
 * @param {Object} params 查询参数
 * @returns {Promise} 销售记录列表
 */
export function getSalesRecords(params = {}) {
    return http.request({ url: '/sales', method: 'GET', data: params });
}

/**
 * 获取销售记录详情
 * @param {string|number} id 销售记录ID
 * @returns {Promise} 销售记录详情
 */
export function getSalesRecordById(id) {
    return http.request({ url: `/sales/${id}`, method: 'GET' });
}

/**
 * 创建销售记录
 * @param {Object} data 销售记录数据
 * @returns {Promise} 创建结果
 */
export function createSalesRecord(data) {
    // 根据API文档中5.3创建销售记录的路径
    return http.request({ url: '/sales', method: 'POST', data });
}

/**
 * 更新销售记录
 * @param {string|number} id 销售记录ID
 * @param {Object} data 更新字段
 * @returns {Promise} 更新结果
 */
export function updateSalesRecord(id, data) {
    return http.request({ url: `/sales/${id}`, method: 'PUT', data });
}

/**
 * 删除销售记录
 * @param {string|number} id 销售记录ID
 * @returns {Promise} 删除结果
 */
export function deleteSalesRecord(id) {
    return http.request({ url: `/sales/${id}`, method: 'DELETE' });
}

/**
 * 更新销售记录付款状态
 * @param {string|number} id 销售记录ID
 * @param {number} paymentStatus 付款状态 0:未付款 1:已付款 2:部分付款
 * @returns {Promise} 更新结果
 */
export function updateSalesRecordPaymentStatus(id, paymentStatus) {
    return http.request({
        url: `/sales/${id}/payment-status`,
        method: 'PUT',
        data: { payment_status: paymentStatus }
    });
}

/**
 * 获取销售记录关联的付款记录
 * @param {string|number} id 销售记录ID
 * @param {Object} params 查询参数
 * @returns {Promise} 付款记录列表
 */
export function getSalesRecordPayments(id, params = {}) {
    return http.request({ url: `/sales/${id}/payments`, method: 'GET', data: params });
}

/**
 * 获取销售统计数据
 * @param {Object} params 查询参数
 * @returns {Promise} 统计数据
 */
export function getSalesStatistics(params = {}) {
    return http.request({ url: '/sales/statistics', method: 'GET', data: params });
}

/**
 * 获取热销水果排行
 * @param {Object} params 查询参数
 * @returns {Promise} 热销水果排行
 */
export function getTopSellingFruits(params = {}) {
    return http.request({ url: '/sales/top-selling-fruits', method: 'GET', data: params });
}

/**
 * 获取客户销售额排行
 * @param {Object} params 查询参数
 * @returns {Promise} 客户销售额排行
 */
export function getCustomerSalesRanking(params = {}) {
    return http.request({ url: '/sales/customer-ranking', method: 'GET', data: params });
}

export default {
    getSalesRecords,
    getSalesRecordById,
    createSalesRecord,
    updateSalesRecord,
    deleteSalesRecord,
    updateSalesRecordPaymentStatus,
    getSalesRecordPayments,
    getSalesStatistics,
    getTopSellingFruits,
    getCustomerSalesRanking
};
