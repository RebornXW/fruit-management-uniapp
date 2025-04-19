import { ref } from 'vue';
import http from './http.js';

// 客户数据
const customersData = ref([]);

// 加载客户数据
function loadCustomersData() {
    return http.request({ url: '/customers', method: 'GET' })
        .then(response => {
            customersData.value = response.data;
            console.log('从服务器加载了客户数据:', customersData.value.length);
            return customersData.value;
        })
        .catch(error => {
            console.error('加载客户数据失败', error);
            return [];
        });
}

// 保存客户数据到服务器
function saveCustomersData() {
    return http.request({ url: '/customers', method: 'POST', data: customersData.value })
        .then(response => {
            console.log('客户数据已保存到服务器');
            return response.data;
        })
        .catch(error => {
            console.error('保存客户数据失败', error);
            return null;
        });
}

// 更新所有客户的欠款信息
function updateAllCustomersDebtInfo() {
    // 确保客户数据已加载
    if (customersData.value.length === 0) {
        loadCustomersData();
    }

    customersData.value.forEach(customer => {
        updateCustomerDebtInfo(customer.id);
    });
}

// 更新客户的欠款信息
function updateCustomerDebtInfo(customerId) {
    // 确保客户数据已加载
    if (customersData.value.length === 0) {
        loadCustomersData();
    }

    // 查找客户
    const customerIndex = customersData.value.findIndex(c => c.id === customerId);
    if (customerIndex === -1) {
        console.error('未找到客户ID:', customerId);
        return;
    }

    // 从服务器获取客户销售记录
    getCustomerSales(customerId)
        .then(salesRecords => {
            console.log('更新客户欠款信息 - 从服务器获取的销售记录数量:', salesRecords.length);

            // 过滤出该客户的销售记录
            const customerRecords = salesRecords.filter(record => {
                // 支持多种客户ID存储方式
                if (record.customerId !== undefined && record.customerId === customerId) {
                    return true;
                }

                // 支持客户对象嵌套
                if (record.customer && record.customer.id === customerId) {
                    return true;
                }

                // 支持根据客户名称匹配
                if (record.customerName !== undefined) {
                    const customerName = customersData.value[customerIndex].name;
                    return record.customerName === customerName;
                }

                return false;
            });

            console.log('更新客户欠款信息 - 该客户的销售记录数量:', customerRecords.length);

            // 计算总销售额
            const totalSales = customerRecords.reduce((sum, record) => {
                // 支持多种数据结构
                let amount = 0;

                if (record.amount !== undefined) {
                    amount = parseFloat(record.amount) || 0;
                } else if (record.total !== undefined) {
                    amount = parseFloat(record.total) || 0;
                } else if (record.totalAmount !== undefined) {
                    amount = parseFloat(record.totalAmount) || 0;
                } else if (record.price !== undefined && record.quantity !== undefined) {
                    // 如果有单价和数量，计算总价
                    const price = parseFloat(record.price) || 0;
                    const quantity = parseFloat(record.quantity) || 0;
                    amount = price * quantity;
                }

                return sum + amount;
            }, 0);

            // 计算已回款金额
            const paidAmount = customerRecords.reduce((sum, record) => {
                // 支持多种数据结构
                let paid = 0;

                // 如果有已付金额字段
                if (record.paidAmount !== undefined) {
                    paid = parseFloat(record.paidAmount) || 0;
                }
                // 如果有付款状态字段
                else if (record.paid === true || record.status === '已付款' || record.status === '已回款' || record.paymentStatus === 'paid') {
                    // 如果是已付款状态，使用总金额
                    if (record.amount !== undefined) {
                        paid = parseFloat(record.amount) || 0;
                    } else if (record.total !== undefined) {
                        paid = parseFloat(record.total) || 0;
                    } else if (record.totalAmount !== undefined) {
                        paid = parseFloat(record.totalAmount) || 0;
                    } else if (record.price !== undefined && record.quantity !== undefined) {
                        // 如果有单价和数量，计算总价
                        const price = parseFloat(record.price) || 0;
                        const quantity = parseFloat(record.quantity) || 0;
                        paid = price * quantity;
                    }
                }
                // 如果是部分付款状态
                else if (record.status === '部分回款' || record.paymentStatus === 'partial') {
                    // 使用已付金额，如果没有，默认为0
                    paid = parseFloat(record.paidAmount) || 0;
                }

                return sum + paid;
            }, 0);

            // 计算未付款金额
            const unpaidAmount = Math.max(0, totalSales - paidAmount);

            // 计算回款率
            const paymentRate = totalSales > 0 ? Math.round((paidAmount / totalSales) * 100) : 0;

            console.log(`客户 ${customersData.value[customerIndex].name} 的数据更新:`, {
                总销售额: totalSales,
                已回款金额: paidAmount,
                未付款金额: unpaidAmount,
                回款率: paymentRate + '%'
            });

            // 更新客户信息
            customersData.value[customerIndex].totalSales = totalSales;
            customersData.value[customerIndex].paidAmount = paidAmount;
            customersData.value[customerIndex].unpaidAmount = unpaidAmount;
            customersData.value[customerIndex].paymentRate = paymentRate;

            // 保存更新后的客户数据
            saveCustomersData();
        })
        .catch(error => {
            console.error('更新客户欠款信息失败', error);
        });
}

// 获取客户数据
function getCustomers() {
    // 如果客户数据为空，先加载
    if (customersData.value.length === 0) {
        loadCustomersData();
    }
    return customersData.value;
}

// 根据ID获取客户
function getCustomerById(customerId) {
    // 如果客户数据为空，先加载
    if (customersData.value.length === 0) {
        loadCustomersData();
    }
    return customersData.value.find(c => c.id === customerId);
}

// 导出服务
export {
    customersData,
    loadCustomersData,
    saveCustomersData,
    updateCustomerDebtInfo,
    updateAllCustomersDebtInfo,
    getCustomers,
    getCustomerById
};

// 客户服务
export function getCustomers(params = {}) {
    return http.request({ url: '/customers', method: 'GET', data: params });
}

export function getCustomerById(id) {
    return http.request({ url: `/customers/${id}`, method: 'GET' });
}

export function createCustomer(data) {
    return http.request({ url: '/customers', method: 'POST', data });
}

export function updateCustomer(id, data) {
    return http.request({ url: `/customers/${id}`, method: 'PUT', data });
}

export function deleteCustomer(id) {
    return http.request({ url: `/customers/${id}`, method: 'DELETE' });
}

export function getCustomerSales(id, params = {}) {
    return http.request({ url: `/customers/${id}/sales`, method: 'GET', data: params });
}

export function getCustomerPayments(id, params = {}) {
    return http.request({ url: `/customers/${id}/payments`, method: 'GET', data: params });
}
