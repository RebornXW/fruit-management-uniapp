// 库存记录服务
import { ref } from 'vue';

// 库存记录数据存储
const inventoryRecords = ref([]);

// 生成唯一的记录ID
function generateRecordId() {
    const date = new Date();
    const dateStr = date.getFullYear().toString().substring(2) +
        (date.getMonth() + 1).toString().padStart(2, '0') +
        date.getDate().toString().padStart(2, '0');

    // 获取当天已有的记录数量
    const todayRecords = inventoryRecords.value.filter(record => record.date === formatDate(date));
    const recordNumber = (todayRecords.length + 1).toString().padStart(3, '0');

    return `I${dateStr}${recordNumber}`;
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
    const recordId = generateRecordId();
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

    // 添加到记录列表
    inventoryRecords.value.unshift(record); // 添加到列表开头

    // 保存到本地存储
    saveInventoryRecords();

    return record;
}

// 获取所有库存记录
function getInventoryRecords() {
    // 如果本地存储中有数据，则加载
    if (inventoryRecords.value.length === 0) {
        loadInventoryRecords();
    }
    return inventoryRecords;
}

// 保存库存记录到本地存储
function saveInventoryRecords() {
    try {
        uni.setStorageSync('inventoryRecords', JSON.stringify(inventoryRecords.value));
    } catch (e) {
        console.error('保存库存记录失败:', e);
    }
}

// 从本地存储加载库存记录
function loadInventoryRecords() {
    try {
        const records = uni.getStorageSync('inventoryRecords');
        if (records) {
            inventoryRecords.value = JSON.parse(records);
        }
    } catch (e) {
        console.error('加载库存记录失败:', e);
    }
}

// 清空库存记录（仅用于测试）
function clearInventoryRecords() {
    inventoryRecords.value = [];
    saveInventoryRecords();
}

export default {
    addInventoryRecord,
    getInventoryRecords,
    clearInventoryRecords
};
