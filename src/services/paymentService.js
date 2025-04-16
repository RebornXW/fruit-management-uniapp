import { ref } from 'vue';
import { getSalesRecords } from './salesRecordService.js';
import { getCustomerById } from './customerService.js';

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

    console.log(`开始处理选中的记录进行回款，总金额: ${totalAmount}`);
    console.log(`选中的记录ID: ${selectedRecordIds.join(', ')}`);

    let remainingAmount = totalAmount;
    const updatedRecords = [];

    // 选中的记录按日期排序（先付旧账）
    const selectedRecords = [];

    // 找出所有选中的记录
    for (const recordId of selectedRecordIds) {
        const record = allSalesRecords.find(r => (r.orderNo === recordId || r.id === recordId));
        if (record) {
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

            // 如果有未付金额，添加到选中记录中
            if (unpaidAmount > 0) {
                record._calculatedUnpaidAmount = unpaidAmount;
                selectedRecords.push(record);
            } else {
                console.log(`记录 ${recordId} 没有未付金额，跳过`);
            }
        } else {
            console.log(`未找到记录ID: ${recordId}`);
        }
    }

    // 按日期排序（从最早到最近）
    selectedRecords.sort((a, b) => new Date(a.date) - new Date(b.date));
    console.log(`找到 ${selectedRecords.length} 条选中的记录，已按日期排序（从最早到最近）`);

    // 输出详细信息便于调试
    selectedRecords.forEach((record, index) => {
        console.log(`选中记录 ${index + 1}: ${record.orderNo || record.id}, 日期: ${record.date}, 未付金额: ${record._calculatedUnpaidAmount}, 状态: ${record.status || record.paymentStatus}`);
    });

    // 按顺序分配金额
    for (const record of selectedRecords) {
        if (remainingAmount <= 0) break;

        // 使用已经计算好的未付金额
        const unpaidAmount = record._calculatedUnpaidAmount;

        // 如果没有未付金额，跳过该记录
        if (!unpaidAmount || unpaidAmount <= 0) {
            console.log(`记录 ${record.orderNo || record.id} 没有未付金额，跳过`);
            continue;
        }

        const amountToApply = Math.min(remainingAmount, unpaidAmount);
        console.log(`处理记录 ${record.orderNo || record.id}, 日期: ${record.date}, 未付金额: ${unpaidAmount}, 分配金额: ${amountToApply}`);

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
            record.status = '已回款';
            record.paymentStatus = 'paid';
        } else {
            record.status = '部分回款';
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

        console.log(`记录 ${record.orderNo || record.id} 处理完成，剩余金额: ${remainingAmount}`);
    }

    // 保存更新后的销售记录
    try {
        uni.setStorageSync('salesRecords', JSON.stringify(allSalesRecords));
        console.log('销售记录已更新，共更新了 ' + updatedRecords.length + ' 条记录');
    } catch (e) {
        console.error('更新销售记录失败', e);
    }

    return updatedRecords;
}

// 分配回款金额到各个销售记录
async function distributePaymentAmount(customerId, totalAmount, paymentId) {
    // 获取客户的待付款销售记录，按日期排序（先付旧账）
    const pendingRecords = getCustomerUnpaidRecords(customerId);

    console.log(`开始处理客户 ${customerId} 的回款，总金额: ${totalAmount}`);
    console.log(`待付款记录数量: ${pendingRecords.length}`);

    let remainingAmount = totalAmount;
    const updatedRecords = [];

    // 获取所有销售记录
    const allSalesRecords = getSalesRecords();

    // 按顺序分配金额（从最早的记录开始）
    for (const record of pendingRecords) {
        if (remainingAmount <= 0) break;

        // 使用已经计算好的未付金额
        const unpaidAmount = record._calculatedUnpaidAmount;

        // 输出详细信息便于调试
        console.log(`处理记录: ${record.orderNo || record.id}, 日期: ${record.date}, 未付金额: ${unpaidAmount}`);

        // 如果没有未付金额，跳过该记录
        if (!unpaidAmount || unpaidAmount <= 0) {
            console.log(`记录 ${record.orderNo || record.id} 没有未付金额，跳过`);
            continue;
        }

        const amountToApply = Math.min(remainingAmount, unpaidAmount);

        console.log(`处理记录 ${record.orderNo || record.id}, 日期: ${record.date}, 未付金额: ${unpaidAmount}, 分配金额: ${amountToApply}`);

        // 查找记录在allSalesRecords中的索引
        const recordIndex = allSalesRecords.findIndex(r =>
            (r.orderNo && r.orderNo === record.orderNo) ||
            (r.id && r.id === record.id) ||
            (r.date === record.date && r.amount === record.amount && r.customerName === record.customerName)
        );

        if (recordIndex === -1) {
            console.log(`未找到记录 ${record.orderNo || record.id}`);
            continue;
        }

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
            recordToUpdate.status = '已回款';
            recordToUpdate.paymentStatus = 'paid';
        } else {
            recordToUpdate.status = '部分回款';
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

        updatedRecords.push(record.orderNo || record.id);
        remainingAmount -= amountToApply;

        console.log(`记录 ${record.orderNo || record.id} 处理完成，剩余金额: ${remainingAmount}`);
    }

    // 保存更新后的销售记录
    try {
        uni.setStorageSync('salesRecords', JSON.stringify(allSalesRecords));
        console.log('销售记录已更新，共更新了 ' + updatedRecords.length + ' 条记录');
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
