import { ref } from 'vue';

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

// 加载销售记录
function loadSalesRecords() {
    try {
        const storedRecords = uni.getStorageSync('salesRecords');
        if (storedRecords) {
            salesRecords.value = JSON.parse(storedRecords);
            console.log('从本地存储加载了销售记录:', salesRecords.value.length);
        } else {
            console.log('本地存储中没有销售记录');
            salesRecords.value = [];
        }
    } catch (e) {
        console.error('加载销售记录失败', e);
        salesRecords.value = [];
    }
}

// 保存销售记录到本地存储
function saveSalesRecords() {
    try {
        uni.setStorageSync('salesRecords', JSON.stringify(salesRecords.value));
        console.log('销售记录已保存到本地存储');
    } catch (e) {
        console.error('保存销售记录失败', e);
    }
}

// 添加销售记录
function addSalesRecord(record) {
    // 直接使用传入的记录，因为它已经符合服务层结构

    // 添加到记录列表
    salesRecords.value.unshift(record);

    // 保存到本地存储
    saveSalesRecords();

    return record;
}

// 获取销售记录
function getSalesRecords() {
    // 如果记录为空，先尝试加载
    if (salesRecords.value.length === 0) {
        loadSalesRecords();
    }
    return salesRecords.value;
}

// 导出服务
export {
    salesRecords,
    loadSalesRecords,
    addSalesRecord,
    getSalesRecords
};
