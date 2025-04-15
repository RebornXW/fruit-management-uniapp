import { ref } from 'vue';
import { getSalesRecords } from './salesRecordService.js';

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

// 加载回款记录
function loadPaymentRecords() {
    try {
        const storedRecords = uni.getStorageSync('paymentRecords');
        if (storedRecords) {
            paymentRecords.value = JSON.parse(storedRecords);
            console.log('从本地存储加载了回款记录:', paymentRecords.value.length);
        } else {
            console.log('本地存储中没有回款记录');
            paymentRecords.value = [];
        }
    } catch (e) {
        console.error('加载回款记录失败', e);
        paymentRecords.value = [];
    }
}

// 保存回款记录到本地存储
function savePaymentRecords() {
    try {
        uni.setStorageSync('paymentRecords', JSON.stringify(paymentRecords.value));
        console.log('回款记录已保存到本地存储');
    } catch (e) {
        console.error('保存回款记录失败', e);
    }
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

// 获取客户的未付款销售记录
function getCustomerUnpaidRecords(customerId) {
    // 获取所有销售记录
    const allSalesRecords = getSalesRecords();

    // 过滤出该客户的未付款销售记录
    return allSalesRecords.filter(record => {
        // 检查客户ID匹配
        const isCustomerMatch =
            record.customerId === customerId ||
            (record.customer && record.customer.id === customerId);

        // 检查付款状态
        const isUnpaid =
            record.status === '未付款' ||
            record.paymentStatus === 'unpaid';

        return isCustomerMatch && isUnpaid;
    }).sort((a, b) => {
        // 按日期排序，旧的在前
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA - dateB;
    });
}

// 处理回款
async function processPayment(paymentData) {
    const now = new Date();
    const currentDate = formatDate(now);
    const currentTime = formatTime(now);

    // 1. 创建回款记录
    const paymentRecord = {
        id: generatePaymentId(),
        date: currentDate,
        time: currentTime,
        customerId: paymentData.customerId,
        customerName: paymentData.customerName,
        amount: parseFloat(paymentData.amount).toFixed(2),
        paymentMethod: paymentData.paymentMethod,
        relatedRecords: [],  // 将在处理销售记录时填充
        remark: paymentData.remark || '',
        operatorId: paymentData.operatorId || 'system',
        operatorName: paymentData.operatorName || '系统用户'
    };

    // 2. 更新相关销售记录的付款状态
    let updatedRecords = [];

    if (paymentData.selectedRecords && paymentData.selectedRecords.length > 0) {
        // 如果选择了特定记录，则处理选中的记录
        updatedRecords = await distributePaymentToSelectedRecords(
            paymentData.selectedRecords,
            parseFloat(paymentData.amount),
            paymentRecord.id
        );
    } else {
        // 如果没有选择特定记录，则按时间顺序分配金额
        updatedRecords = await distributePaymentAmount(
            paymentData.customerId,
            parseFloat(paymentData.amount),
            paymentRecord.id
        );
    }

    // 更新关联记录
    paymentRecord.relatedRecords = updatedRecords;

    // 3. 添加到回款记录列表
    paymentRecords.value.unshift(paymentRecord);

    // 4. 保存回款记录
    savePaymentRecords();

    return paymentRecord;
}

// 处理选中的记录进行回款
async function distributePaymentToSelectedRecords(selectedRecordIds, totalAmount, paymentId) {
    // 获取所有销售记录
    const allSalesRecords = getSalesRecords();

    let remainingAmount = totalAmount;
    const updatedRecords = [];

    // 选中的记录按日期排序（先付旧账）
    const selectedRecords = [];

    // 找出所有选中的记录
    for (const recordId of selectedRecordIds) {
        const record = allSalesRecords.find(r => (r.orderNo === recordId || r.id === recordId));
        if (record) {
            selectedRecords.push(record);
        }
    }

    // 按日期排序
    selectedRecords.sort((a, b) => new Date(a.date) - new Date(b.date));

    // 按顺序分配金额
    for (const record of selectedRecords) {
        if (remainingAmount <= 0) break;

        // 计算未付金额
        let unpaidAmount = 0;
        if (record.unpaidAmount !== undefined) {
            unpaidAmount = parseFloat(record.unpaidAmount);
        } else if (record.amount !== undefined) {
            unpaidAmount = parseFloat(record.amount) - (parseFloat(record.paidAmount) || 0);
        } else if (record.total !== undefined) {
            unpaidAmount = parseFloat(record.total) - (parseFloat(record.paidAmount) || 0);
        }

        if (unpaidAmount <= 0) continue; // 跳过已经付清的记录

        const amountToApply = Math.min(remainingAmount, unpaidAmount);

        // 更新已付金额
        record.paidAmount = (parseFloat(record.paidAmount) || 0) + amountToApply;

        // 更新未付金额
        if (record.unpaidAmount !== undefined) {
            record.unpaidAmount = Math.max(0, parseFloat(record.unpaidAmount) - amountToApply).toFixed(2);
        } else {
            record.unpaidAmount = Math.max(0, unpaidAmount - amountToApply).toFixed(2);
        }

        // 更新付款状态
        if (parseFloat(record.unpaidAmount) <= 0) {
            record.status = '已付款';
            record.paymentStatus = 'paid';
        } else {
            record.status = '部分付款';
            record.paymentStatus = 'partial';
        }

        // 添加付款记录
        if (!record.paymentRecords) {
            record.paymentRecords = [];
        }

        record.paymentRecords.push({
            paymentId: paymentId,
            amount: amountToApply.toFixed(2),
            date: formatDate(new Date()),
            time: formatTime(new Date())
        });

        updatedRecords.push(record.orderNo || record.id);
        remainingAmount -= amountToApply;
    }

    // 保存更新后的销售记录
    try {
        uni.setStorageSync('salesRecords', JSON.stringify(allSalesRecords));
        console.log('销售记录已更新');
    } catch (e) {
        console.error('更新销售记录失败', e);
    }

    return updatedRecords;
}

// 分配回款金额到各个销售记录
async function distributePaymentAmount(customerId, totalAmount, paymentId) {
    // 获取客户的未付清销售记录，按日期排序（先付旧账）
    const unpaidRecords = getCustomerUnpaidRecords(customerId);

    let remainingAmount = totalAmount;
    const updatedRecords = [];

    // 获取所有销售记录
    const allSalesRecords = getSalesRecords();

    // 按顺序分配金额
    for (const record of unpaidRecords) {
        if (remainingAmount <= 0) break;

        // 计算未付金额
        let unpaidAmount = 0;
        if (record.unpaidAmount !== undefined) {
            unpaidAmount = parseFloat(record.unpaidAmount);
        } else if (record.amount !== undefined) {
            unpaidAmount = parseFloat(record.amount) - (parseFloat(record.paidAmount) || 0);
        } else if (record.total !== undefined) {
            unpaidAmount = parseFloat(record.total) - (parseFloat(record.paidAmount) || 0);
        }

        const amountToApply = Math.min(remainingAmount, unpaidAmount);

        // 查找记录在allSalesRecords中的索引
        const recordIndex = allSalesRecords.findIndex(r => r.orderNo === record.orderNo);
        if (recordIndex === -1) continue;

        // 更新销售记录
        const recordToUpdate = allSalesRecords[recordIndex];

        // 更新已付金额
        recordToUpdate.paidAmount = (parseFloat(recordToUpdate.paidAmount) || 0) + amountToApply;

        // 更新未付金额
        if (recordToUpdate.unpaidAmount !== undefined) {
            recordToUpdate.unpaidAmount = Math.max(0, parseFloat(recordToUpdate.unpaidAmount) - amountToApply).toFixed(2);
        } else {
            recordToUpdate.unpaidAmount = Math.max(0, unpaidAmount - amountToApply).toFixed(2);
        }

        // 更新付款状态
        if (parseFloat(recordToUpdate.unpaidAmount) <= 0) {
            recordToUpdate.status = '已付款';
            recordToUpdate.paymentStatus = 'paid';
        } else {
            recordToUpdate.status = '部分付款';
            recordToUpdate.paymentStatus = 'partial';
        }

        // 添加付款记录
        if (!recordToUpdate.paymentRecords) {
            recordToUpdate.paymentRecords = [];
        }

        recordToUpdate.paymentRecords.push({
            paymentId: paymentId,
            amount: amountToApply.toFixed(2),
            date: formatDate(new Date()),
            time: formatTime(new Date())
        });

        updatedRecords.push(record.orderNo);
        remainingAmount -= amountToApply;
    }

    // 保存更新后的销售记录
    try {
        uni.setStorageSync('salesRecords', JSON.stringify(allSalesRecords));
        console.log('销售记录已更新');
    } catch (e) {
        console.error('更新销售记录失败', e);
    }

    return updatedRecords;
}

// 获取回款记录
function getPaymentRecords() {
    // 如果记录为空，先尝试加载
    if (paymentRecords.value.length === 0) {
        loadPaymentRecords();
    }
    return paymentRecords.value;
}

// 获取客户的回款记录
function getCustomerPaymentRecords(customerId) {
    return getPaymentRecords().filter(record => record.customerId === customerId);
}

// 导出服务
export {
    paymentRecords,
    loadPaymentRecords,
    processPayment,
    calculateCustomerDebt,
    getCustomerUnpaidRecords,
    getPaymentRecords,
    getCustomerPaymentRecords
};
