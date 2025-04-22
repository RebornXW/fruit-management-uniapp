import http from './http.js';

/**
 * 获取库存记录列表
 * @param {Object} params 查询参数
 * @returns {Promise} 库存记录列表
 */
export function getInventoryRecords(params = {}) {
    return http.request({ url: '/inventory', method: 'GET', data: params });
}

/**
 * 获取库存记录详情
 * @param {string|number} id 库存记录ID
 * @returns {Promise} 库存记录详情
 */
export function getInventoryRecordById(id) {
    return http.request({ url: `/inventory/${id}`, method: 'GET' });
}

/**
 * 创建库存记录
 * @param {Object} data 库存记录数据
 * @returns {Promise} 创建结果
 */
export function createInventoryRecord(data) {
    return http.request({ url: '/inventory', method: 'POST', data });
}

/**
 * 更新库存记录
 * @param {string|number} id 库存记录ID
 * @param {Object} data 更新字段
 * @returns {Promise} 更新结果
 */
export function updateInventoryRecord(id, data) {
    return http.request({ url: `/inventory/${id}`, method: 'PUT', data });
}

/**
 * 删除库存记录
 * @param {string|number} id 库存记录ID
 * @returns {Promise} 删除结果
 */
export function deleteInventoryRecord(id) {
    return http.request({ url: `/inventory/${id}`, method: 'DELETE' });
}

/**
 * 添加库存记录
 * @param {string} operationType 操作类型，入库或出库
 * @param {Object} fruit 水果信息
 * @param {number} quantity 数量
 * @param {string} remark 备注
 * @param {string} operator 操作人
 * @returns {Promise} 创建结果
 */
export function addInventoryRecord(operationType, fruit, quantity, remark, operatorId) {

    const record = {
        operation_type: operationType,
        fruit_id: fruit.id,
        quantity, // 入库出库都是数量
        remark: remark || '',
        operator_id: operatorId
    };

    return createInventoryRecord(record);
}

/**
 * 获取当前库存汇总
 * @param {Object} params 查询参数
 * @returns {Promise} 库存汇总
 */
export function getInventorySummary(params = {}) {
    return http.request({ url: '/inventory/summary', method: 'GET', data: params });
}

/**
 * 获取库存警告设置
 * @returns {Promise} 警告设置
 */
export function getInventoryAlertSettings() {
    return http.request({ url: '/inventory/alert-settings', method: 'GET' });
}

/**
 * 更新库存警告设置
 * @param {Object} data 警告设置数据
 * @returns {Promise} 更新结果
 */
export function updateInventoryAlertSettings(data) {
    return http.request({ url: '/inventory/alert-settings', method: 'PUT', data });
}

/**
 * 获取库存警告列表
 * @returns {Promise} 警告列表
 */
export function getInventoryAlerts() {
    return http.request({ url: '/inventory/alerts', method: 'GET' });
}

export default {
    getInventoryRecords,
    getInventoryRecordById,
    createInventoryRecord,
    updateInventoryRecord,
    deleteInventoryRecord,
    addInventoryRecord,
    getInventorySummary,
    getInventoryAlertSettings,
    updateInventoryAlertSettings,
    getInventoryAlerts
};
