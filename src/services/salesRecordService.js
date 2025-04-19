import { ref } from 'vue';
import http from './http.js';

// 销售记录列表
const salesRecords = ref([]);

// 生成记录ID
function generateRecordId() {
    const now = new Date();
    const dateStr = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `S${dateStr}${randomNum}`;
}

// 格式化日期为 YYYY-MM-DD
function formatDate(date) {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
}

// 格式化时间为 HH:MM
function formatTime(date) {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

// 获取销售记录
export function getSalesRecords(params = {}) {
    return http.request({ url: '/sales_records', method: 'GET', data: params });
}

// 获取销售记录详情
export function getSalesRecordById(id) {
    return http.request({ url: `/sales_records/${id}`, method: 'GET' });
}

// 添加销售记录
export function createSalesRecord(data) {
    return http.request({ url: '/sales_records', method: 'POST', data });
}

// 更新销售记录
export function updateSalesRecord(id, data) {
    return http.request({ url: `/sales_records/${id}`, method: 'PUT', data });
}

// 删除销售记录
export function deleteSalesRecord(id) {
    return http.request({ url: `/sales_records/${id}`, method: 'DELETE' });
}

// 导出服务
export {
    getSalesRecords,
    getSalesRecordById,
    createSalesRecord,
    updateSalesRecord,
    deleteSalesRecord
};

export default {
    getSalesRecords,
    getSalesRecordById,
    createSalesRecord,
    updateSalesRecord,
    deleteSalesRecord
};
