// 操作记录服务
import { ref } from 'vue';

// 操作记录数据存储
const operationRecords = ref([]);

// 生成唯一的记录ID
function generateRecordId() {
    const date = new Date();
    const dateStr = date.getFullYear().toString().substring(2) +
        (date.getMonth() + 1).toString().padStart(2, '0') +
        date.getDate().toString().padStart(2, '0');
    
    // 获取当天已有的记录数量
    const todayRecords = operationRecords.value.filter(record => record.date === formatDate(date));
    const recordNumber = (todayRecords.length + 1).toString().padStart(3, '0');
    
    return `OP${dateStr}${recordNumber}`;
}

// 格式化日期为 YYYY-MM-DD
function formatDate(date) {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
}

// 格式化时间为 HH:MM
function formatTime(date) {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

// 添加操作记录
function addOperationRecord(operationType, originalData, newData, operator) {
    const now = new Date();
    const recordId = generateRecordId();
    const date = formatDate(now);
    const time = formatTime(now);
    
    // 检查图片是否变更
    const imageChanged = operationType === '编辑' && originalData.image !== newData.image;
    
    // 创建基本记录对象
    const record = {
        recordId,
        date,
        time,
        operator: operator || '系统管理员', // 默认操作员
        operationType,
        remark: ''
    };
    
    // 根据操作类型添加不同的数据
    switch (operationType) {
        case '新增':
            // 新增操作只需要新数据
            Object.assign(record, {
                brand: newData.brand,
                fruitCategory: newData.fruitCategory,
                fruitName: newData.fruitName,
                spec: newData.spec,
                packagingType: newData.packagingType,
                weight: newData.weight,
                priceRange: newData.priceRange,
                image: newData.image,
                remark: '新增水果品种'
            });
            break;
            
        case '编辑':
            // 编辑操作需要原始数据和新数据
            Object.assign(record, {
                // 原始信息
                originalBrand: originalData.brand,
                originalFruitCategory: originalData.fruitCategory,
                originalFruitName: originalData.fruitName,
                originalSpec: originalData.spec,
                originalPackagingType: originalData.packagingType,
                originalWeight: originalData.weight,
                originalPriceRange: originalData.priceRange,
                originalImage: originalData.image,
                
                // 变更后信息
                brand: newData.brand,
                fruitCategory: newData.fruitCategory,
                fruitName: newData.fruitName,
                spec: newData.spec,
                packagingType: newData.packagingType,
                weight: newData.weight,
                priceRange: newData.priceRange,
                image: newData.image,
                
                // 图片变更标记
                imageChanged,
                
                remark: '编辑水果信息'
            });
            break;
            
        case '删除':
            // 删除操作只需要原始数据
            Object.assign(record, {
                brand: originalData.brand,
                fruitCategory: originalData.fruitCategory,
                fruitName: originalData.fruitName,
                spec: originalData.spec,
                packagingType: originalData.packagingType,
                weight: originalData.weight,
                priceRange: originalData.priceRange,
                image: originalData.image,
                remark: '删除水果品种'
            });
            break;
    }
    
    // 添加到记录列表
    operationRecords.value.unshift(record); // 添加到列表开头
    
    // 保存到本地存储
    saveOperationRecords();
    
    return record;
}

// 获取所有操作记录
function getOperationRecords() {
    // 如果本地存储中有数据，则加载
    if (operationRecords.value.length === 0) {
        loadOperationRecords();
    }
    return operationRecords;
}

// 保存操作记录到本地存储
function saveOperationRecords() {
    try {
        uni.setStorageSync('operationRecords', JSON.stringify(operationRecords.value));
    } catch (e) {
        console.error('保存操作记录失败:', e);
    }
}

// 从本地存储加载操作记录
function loadOperationRecords() {
    try {
        const records = uni.getStorageSync('operationRecords');
        if (records) {
            operationRecords.value = JSON.parse(records);
        }
    } catch (e) {
        console.error('加载操作记录失败:', e);
    }
}

// 清空操作记录（仅用于测试）
function clearOperationRecords() {
    operationRecords.value = [];
    saveOperationRecords();
}

export default {
    addOperationRecord,
    getOperationRecords,
    clearOperationRecords
};
