import { ref } from 'vue';
import { getSalesRecords } from './salesRecordService.js';
import { getCustomerById } from './customerService.js';
import http from './http.js';

// 回款记录列表
const paymentRecords = ref([]);

// 生成回款记录ID
function generatePaymentId() {
    const now = new Date();
    const dateStr = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `P${dateStr}${randomNum}`;
}

// 格式化日期为 YYYY-MM-DD
function formatDate(date) {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
}

// 格式化时间为 HH:MM
function formatTime(date) {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

// 计算客户欠款总额
function calculateCustomerDebt(customerId) {
    // 获取所有销售记录
    const allSalesRecords = getSalesRecords();

    // 过滤出该客户的销售记录
    const customerRecords = allSalesRecords.filter(record => {
        // 支持新旧两种数据结构
        if (record.customerId === customerId) {
            return true;
        }
        if (record.customer && record.customer.id === customerId) {
            return true;
        }
        return false;
    });

    // 计算未付款总额
    return customerRecords.reduce((total, record) => {
        // 如果是已付款状态，则没有欠款
        if (record.status === '已付款' || record.paymentStatus === 'paid') {
            return total;
        }

        // 计算未付金额
        let unpaidAmount = 0;
        if (record.unpaidAmount !== undefined) {
            // 如果有明确的未付金额字段
            unpaidAmount = parseFloat(record.unpaidAmount);
        } else if (record.paidAmount !== undefined && record.amount !== undefined) {
            // 如果有已付金额和总金额，计算差额
            unpaidAmount = parseFloat(record.amount) - parseFloat(record.paidAmount);
        } else if (record.amount !== undefined) {
            // 如果只有总金额，且状态为未付款，则全额未付
            unpaidAmount = parseFloat(record.amount);
        } else if (record.total !== undefined) {
            // 兼容旧结构
            unpaidAmount = parseFloat(record.total);
        }

        return total + (unpaidAmount > 0 ? unpaidAmount : 0);
    }, 0);
}

// 获取客户的待付款销售记录（包含未回款和部分回款的记录）
function getCustomerUnpaidRecords(customerId) {
    // 获取所有销售记录
    const allSalesRecords = getSalesRecords();

    // 获取客户信息
    const customer = getCustomerById(customerId);
    if (!customer) {
        console.error(`未找到客户ID: ${customerId}`);
        return [];
    }

    console.log(`获取客户 ${customer.name} (客户ID: ${customerId}) 的待付款记录`);

    // 过滤出该客户的待付款销售记录（未回款和部分回款）
    const filteredRecords = allSalesRecords.filter(record => {
        // 检查客户匹配
        let isCustomerMatch = false;

        // 通过客户ID匹配
        if (record.customerId === customerId || (record.customer && record.customer.id === customerId)) {
            isCustomerMatch = true;
        }
        // 通过客户名称匹配
        else if (record.customerName && record.customerName === customer.name) {
            isCustomerMatch = true;
        }

        if (!isCustomerMatch) {
            return false; // 如果客户不匹配，直接跳过
        }

        // 检查付款状态 - 包含未付款和部分付款的记录
        const needsPayment =
            record.status === '未付款' || record.status === '未回款' || record.paymentStatus === 'unpaid' ||
            record.status === '部分付款' || record.status === '部分回款' || record.paymentStatus === 'partial';

        if (!needsPayment) {
            return false; // 如果不需要付款，直接跳过
        }

        // 计算未付金额
        let unpaidAmount = 0;

        // 如果有明确的未付金额字段
        if (record.unpaidAmount !== undefined) {
            unpaidAmount = parseFloat(record.unpaidAmount) || 0;
        }
        // 如果有金额和已付金额，计算差额
        else if (record.amount !== undefined && record.paidAmount !== undefined) {
            unpaidAmount = Math.max(0, parseFloat(record.amount) - parseFloat(record.paidAmount));
        }
        // 如果有总额和已付金额，计算差额
        else if (record.total !== undefined && record.paidAmount !== undefined) {
            unpaidAmount = Math.max(0, parseFloat(record.total) - parseFloat(record.paidAmount));
        }
        // 如果只有金额或总额，且状态为未付款
        else if ((record.status === '未付款' || record.status === '未回款' || record.paymentStatus === 'unpaid')) {
            unpaidAmount = parseFloat(record.amount || record.total || 0);
        }

        // 如果没有未付金额，跳过该记录
        if (unpaidAmount <= 0) {
            return false;
        }

        // 添加计算出的未付金额到记录中，便于后续处理
        record._calculatedUnpaidAmount = unpaidAmount;

        return true; // 所有条件都满足，保留该记录
    });

    // 按日期排序，从最早到最近
    const sortedRecords = filteredRecords.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA - dateB; // 升序排列，最早的在前
    });

    console.log(`找到 ${sortedRecords.length} 条待付款记录，已按日期排序（从最早到最近）`);

    // 输出详细信息便于调试
    sortedRecords.forEach((record, index) => {
        console.log(`记录 ${index + 1}: ${record.orderNo || record.id}, 日期: ${record.date}, 未付金额: ${record._calculatedUnpaidAmount}, 状态: ${record.status || record.paymentStatus}`);
    });

    return sortedRecords;
}

// 获取回款记录列表
export function getPaymentRecords(params = {}) {
  return http.request({ url: '/payment_records', method: 'GET', data: params });
}

// 获取回款记录详情
export function getPaymentRecordById(id) {
  return http.request({ url: `/payment_records/${id}`, method: 'GET' });
}

// 创建回款记录
export function createPaymentRecord(data) {
  return http.request({ url: '/payment_records', method: 'POST', data });
}

// 更新回款记录
export function updatePaymentRecord(id, data) {
  return http.request({ url: `/payment_records/${id}`, method: 'PUT', data });
}

// 删除回款记录
export function deletePaymentRecord(id) {
  return http.request({ url: `/payment_records/${id}`, method: 'DELETE' });
}

// 获取客户的回款记录
export function getCustomerPaymentRecords(customerId, params = {}) {
  return http.request({ url: `/customers/${customerId}/payment_records`, method: 'GET', data: params });
}

export default {
  getPaymentRecords,
  getPaymentRecordById,
  createPaymentRecord,
  updatePaymentRecord,
  deletePaymentRecord,
  getCustomerPaymentRecords,
  calculateCustomerDebt,
  getCustomerUnpaidRecords
};
