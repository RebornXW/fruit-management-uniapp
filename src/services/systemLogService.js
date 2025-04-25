import http from './http.js';

/**
 * 获取系统日志列表
 * @param {Object} params 查询参数
 * @returns {Promise} 系统日志列表
 */
export function getSystemLogs(params = {}) {
    return http.request({
        url: '/logs',
        method: 'GET',
        data: params
    });
}

/**
 * 获取系统日志详情
 * @param {string|number} id 日志ID
 * @returns {Promise} 系统日志详情
 */
export function getSystemLogById(id) {
    return http.request({
        url: `/logs/${id}`,
        method: 'GET'
    });
}

export default {
    getSystemLogs,
    getSystemLogById
};
