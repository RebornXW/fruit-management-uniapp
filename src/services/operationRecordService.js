import http from './http.js';

/**
 * 获取操作记录列表
 * @param {Object} params 查询参数
 * @returns {Promise} 操作记录列表
 */
export function getOperationRecords(params = {}) {
    return http.request({ url: '/operations', method: 'GET', data: params });
}

/**
 * 获取操作记录详情
 * @param {string|number} id 操作记录ID
 * @returns {Promise} 操作记录详情
 */
export function getOperationRecordById(id) {
    return http.request({ url: `/operations/${id}`, method: 'GET' });
}

/**
 * 添加操作记录
 * @param {string} operationType 操作类型，如新增、编辑、删除
 * @param {Object} originalData 原始数据，如果是新增操作可为空
 * @param {Object} newData 新数据，如果是删除操作可为空
 * @param {string} operator 操作人
 * @returns {Promise} 创建结果
 */
export function addOperationRecord(operationType, originalData = {}, newData = {}, operator = '') {
    const record = {
        operationType,
        originalData: JSON.stringify(originalData),
        newData: JSON.stringify(newData),
        operator
    };

    return http.request({ url: '/operations', method: 'POST', data: record });
}

/**
 * 获取用户的操作记录
 * @param {string|number} userId 用户ID
 * @param {Object} params 查询参数
 * @returns {Promise} 操作记录列表
 */
export function getUserOperationRecords(userId, params = {}) {
    return http.request({
        url: `/users/${userId}/operations`,
        method: 'GET',
        data: params
    });
}

/**
 * 获取系统日志
 * @param {Object} params 查询参数
 * @returns {Promise} 系统日志列表
 */
export function getSystemLogs(params = {}) {
    return http.request({ url: '/system-logs', method: 'GET', data: params });
}

export default {
    getOperationRecords,
    getOperationRecordById,
    addOperationRecord,
    getUserOperationRecords,
    getSystemLogs
};
