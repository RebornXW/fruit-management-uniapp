// 库存记录服务
import http from './http.js';

// 生成唯一的记录ID
function generateRecordId() {
    const date = new Date();
    const dateStr = date.getFullYear().toString().substring(2) +
        (date.getMonth() + 1).toString().padStart(2, '0') +
        date.getDate().toString().padStart(2, '0');

    // 获取当天已有的记录数量
    return http.request({ url: '/inventory_records', method: 'GET' })
        .then(response => {
            const todayRecords = response.data.filter(record => record.date === formatDate(date));
            const recordNumber = (todayRecords.length + 1).toString().padStart(3, '0');
            return `I${dateStr}${recordNumber}`;
        });
}

// 格式化日期为 YYYY-MM-DD
function formatDate(date) {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
}

// 格式化时间为 HH:MM
function formatTime(date) {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

// 添加库存记录
function addInventoryRecord(operationType, fruit, quantity, remark, operator) {
    const now = new Date();
    return generateRecordId().then(recordId => {
        const date = formatDate(now);
        const time = formatTime(now);

        // 创建基本记录对象
        const record = {
            recordId,
            date,
            time,
            operatorName: operator || '系统管理员', // 默认操作员
            operationType,
            brand: fruit.brand || '',
            fruitCategory: fruit.category || '',
            productName: fruit.variety || '',
            spec: fruit.spec || '',
            quantity: operationType === '入库' ? quantity : -quantity, // 入库为正，出库为负
            remark: remark || ''
        };

        // 创建库存记录
        return createInventoryRecord(record);
    });
}

// 获取库存记录列表
export function getInventoryRecords(params = {}) {
    return http.request({ url: '/inventory_records', method: 'GET', data: params });
}

// 获取库存记录详情
export function getInventoryRecordById(id) {
    return http.request({ url: `/inventory_records/${id}`, method: 'GET' });
}

// 创建库存记录
export function createInventoryRecord(data) {
    return http.request({ url: '/inventory_records', method: 'POST', data });
}

// 更新库存记录
export function updateInventoryRecord(id, data) {
    return http.request({ url: `/inventory_records/${id}`, method: 'PUT', data });
}

// 删除库存记录
export function deleteInventoryRecord(id) {
    return http.request({ url: `/inventory_records/${id}`, method: 'DELETE' });
}

export default {
    addInventoryRecord,
    getInventoryRecords,
    getInventoryRecordById,
    createInventoryRecord,
    updateInventoryRecord,
    deleteInventoryRecord
};
