import http from './http.js';
import { getSalesRecords } from './salesRecordService.js';

/**
 * 获取付款记录列表
 * @param {Object} params 查询参数
 * @returns {Promise} 付款记录列表
 */
export function getPaymentRecords(params = {}) {
    return http.request({ url: '/payments', method: 'GET', data: params });
}

/**
 * 获取付款记录详情
 * @param {string|number} id 付款记录ID
 * @returns {Promise} 付款记录详情
 */
export function getPaymentRecordById(id) {
    return http.request({ url: `/payments/${id}`, method: 'GET' });
}

/**
 * 创建付款记录
 * @param {Object} data 付款记录数据
 * @returns {Promise} 创建结果
 */
export function createPaymentRecord(data) {
    console.log('调用 createPaymentRecord API, 付款数据:', data);

    // 根据API文档中7.3创建付款记录的要求格式化数据
    // 使用下划线命名法而不是驼峰命名法
    const paymentData = {
        customer_id: data.customerId || data.customer_id,
        amount: parseFloat(data.amount),
        payment_method: data.paymentMethod || data.payment_method,
        operator_id: uni.getStorageSync('loginUser')?.id || 1, // 从本地存储中获取当前登录用户ID
        remark: data.remark || '',
        related_sales: data.selectedRecords || data.related_sales || []
    };

    return http.request({ url: '/payments', method: 'POST', data: paymentData });
}

/**
 * 更新付款记录
 * @param {string|number} id 付款记录ID
 * @param {Object} data 更新字段
 * @returns {Promise} 更新结果
 */
export function updatePaymentRecord(id, data) {
    return http.request({ url: `/payments/${id}`, method: 'PUT', data });
}

/**
 * 删除付款记录
 * @param {string|number} id 付款记录ID
 * @returns {Promise} 删除结果
 */
export function deletePaymentRecord(id) {
    return http.request({ url: `/payments/${id}`, method: 'DELETE' });
}

/**
 * 获取付款记录关联的销售记录
 * @param {string|number} id 付款记录ID
 * @param {Object} params 查询参数
 * @returns {Promise} 销售记录列表
 */
export function getPaymentRecordSales(id, params = {}) {
    return http.request({ url: `/payments/${id}/sales`, method: 'GET', data: params });
}

/**
 * 为付款记录添加关联的销售记录
 * @param {string|number} id 付款记录ID
 * @param {Array} sales 销售记录数组，每个元素包含sale_id和amount
 * @returns {Promise} 添加结果
 */
export function addPaymentRecordSales(id, sales) {
    return http.request({
        url: `/payments/${id}/sales`,
        method: 'POST',
        data: { sales }
    });
}

/**
 * 移除付款记录关联的销售记录
 * @param {string|number} id 付款记录ID
 * @param {string|number} saleId 销售记录ID
 * @returns {Promise} 移除结果
 */
export function removePaymentRecordSale(id, saleId) {
    return http.request({
        url: `/payments/${id}/sales/${saleId}`,
        method: 'DELETE'
    });
}

/**
 * 获取客户的付款记录
 * @param {string|number} customerId 客户ID
 * @param {Object} params 查询参数
 * @returns {Promise} 付款记录列表
 */
export function getCustomerPaymentRecords(customerId, params = {}) {
    return http.request({
        url: `/customers/${customerId}/payments`,
        method: 'GET',
        data: params
    });
}

/**
 * 获取客户的待付款销售记录
 * @param {string|number} customerId 客户ID
 * @param {Object} params 查询参数
 * @returns {Promise} 待付款销售记录列表
 */
export function getCustomerUnpaidRecords(customerId, params = {}) {
    console.log('调用 getCustomerUnpaidRecords API, 客户ID:', customerId, '参数:', params);

    // 使用salesRecordService中的getSalesRecords函数
    // 通过传递customer_id和payment_status参数为0或2来获取待付款的记录
    // payment_status: 0-未付款, 1-已付款, 2-部分付款
    const queryParams = {
        ...params,
        customer_id: customerId,
        payment_status: [0, 2] // 未付款和部分付款
    };

    // 使用已导入的getSalesRecords函数

    return new Promise((resolve, reject) => {
        // 调用getSalesRecords函数获取待付款记录
        getSalesRecords(queryParams)
        .then(res => {
            console.log('获取客户待付款记录成功:', res);

            // 处理返回的数据，兼容不同的响应格式
            let records = [];

            // 如果是数组，直接使用
            if (Array.isArray(res)) {
                records = res;
            }
            // 如果是对象，并且有items属性
            else if (res && typeof res === 'object' && res.items) {
                records = res.items;
            }
            // 如果是对象，并且有data属性
            else if (res && typeof res === 'object' && res.data) {
                // 如果data是数组，直接使用
                if (Array.isArray(res.data)) {
                    records = res.data;
                }
                // 如果data是对象，并且有items属性
                else if (typeof res.data === 'object' && res.data.items) {
                    records = res.data.items;
                }
            }

            console.log('处理后的待付款记录数据:', records);
            resolve(records);
        })
        .catch(err => {
            console.error('获取客户待付款记录失败:', err);
            // 失败时返回空数组，而不是拒绝 Promise
            resolve([]);
        });
    });
}

/**
 * 获取客户欠款总额
 * @param {string|number} customerId 客户ID
 * @returns {Promise} 欠款总额
 */
export function calculateCustomerDebt(customerId) {
    return http.request({
        url: `/customers/${customerId}`,
        method: 'GET'
    })
    .then(res => {
        // 直接返回unpaid_amount字段
        return res && res.unpaid_amount !== undefined ? parseFloat(res.unpaid_amount) : 0;
    })
    .catch(() => {
        // 失败时返回0
        return 0;
    });
}

/**
 * 处理客户回款
 * @param {string|number} customerId 客户ID
 * @param {Object} data 回款数据
 * @returns {Promise} 回款结果
 */
export function processCustomerRepayment(customerId, data) {
    console.log('调用 processCustomerRepayment API, 客户ID:', customerId, '回款数据:', data);
    return new Promise((resolve, reject) => {
        http.request({
            url: `/customers/${customerId}/repayment`,
            method: 'POST',
            data
        })
        .then(res => {
            console.log('处理客户回款成功:', res);
            resolve(res);
        })
        .catch(err => {
            console.error('处理客户回款失败:', err);
            reject(err);
        });
    });
}

/**
 * 处理付款
 * @param {Object} paymentData 付款数据
 * @returns {Promise} 付款结果
 */
export function processPayment(paymentData) {
    console.log('调用 processPayment API, 付款数据:', paymentData);

    // 直接调用createPaymentRecord函数，根据API文档中7.3创建付款记录
    // 前端不需要考虑如何分配金额，直接调用后端就行了
    return createPaymentRecord(paymentData);
}

export default {
    getPaymentRecords,
    getPaymentRecordById,
    createPaymentRecord,
    updatePaymentRecord,
    deletePaymentRecord,
    getPaymentRecordSales,
    addPaymentRecordSales,
    removePaymentRecordSale,
    getCustomerPaymentRecords,
    getCustomerUnpaidRecords,
    calculateCustomerDebt,
    processCustomerRepayment,
    processPayment
};
