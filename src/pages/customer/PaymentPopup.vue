<template>
    <uni-popup ref="popup" type="center">
        <view class="payment-popup">
            <view class="payment-popup-header">
                <text class="payment-popup-title">收款</text>
                <text class="payment-popup-close" @tap="closePopup">
                    <uni-icons type="closeempty" size="20" color="#6B7280"></uni-icons>
                </text>
            </view>

            <!-- 客户信息 -->
            <view class="payment-customer-info">
                <text class="payment-customer-name">{{customer.name}}</text>
                <text class="payment-customer-debt">欠款总额: ¥{{formatMoney(totalDebtAmount)}}</text>
            </view>

            <!-- 待付款记录列表 -->
            <scroll-view
                scroll-y
                class="unpaid-records-list"
                v-if="unpaidRecords.length > 0"
            >
                <view class="unpaid-records-header">
                    <text class="unpaid-records-title">待付款记录</text>
                    <text class="unpaid-records-select-all" @tap="toggleSelectAll">
                        {{ isAllSelected ? '取消全选' : '全选' }}
                    </text>
                </view>
                <view
                    v-for="(record, index) in unpaidRecords"
                    :key="index"
                    :class="['unpaid-record-item', selectedRecords.includes(getRecordId(record)) ? 'selected' : '']"
                    @tap="toggleRecordSelection(record)"
                >
                    <view class="record-checkbox">
                        <view class="checkbox-inner" v-if="selectedRecords.includes(getRecordId(record))"></view>
                    </view>
                    <view class="record-info">
                        <view class="record-header">
                            <text class="record-date">{{getRecordDate(record)}}</text>
                            <text class="record-amount">¥{{formatMoney(getRecordUnpaidAmount(record))}}</text>
                        </view>
                        <view class="record-product">{{getRecordProductName(record)}}</view>
                    </view>
                </view>
            </scroll-view>

            <!-- 收款金额输入 -->
            <view class="payment-amount-input">
                <text class="payment-amount-label">收款金额</text>
                <view class="payment-input-wrapper">
                    <text class="payment-currency">¥</text>
                    <input
                        type="digit"
                        v-model="paymentAmount"
                        class="payment-input"
                        :placeholder="formatMoney(totalDebtAmount)"
                    />
                </view>
            </view>

            <!-- 收款方式选择 -->
            <view class="payment-method">
                <text class="payment-method-label">收款方式</text>
                <view class="payment-method-options">
                    <view
                        v-for="(method, index) in paymentMethods"
                        :key="index"
                        :class="['payment-method-option', selectedMethod === method.value ? 'selected' : '']"
                        @tap="selectPaymentMethod(method.value)"
                    >
                        <text>{{method.label}}</text>
                    </view>
                </view>
                <text class="payment-method-selected">当前选择: {{getPaymentMethodLabel(selectedMethod)}}</text>
            </view>

            <!-- 备注 -->
            <view class="payment-remark">
                <text class="payment-remark-label">备注</text>
                <textarea
                    v-model="paymentRemark"
                    class="payment-remark-input"
                    placeholder="添加备注信息..."
                />
            </view>

            <!-- 确认按钮 -->
            <button class="payment-confirm-btn" @tap="confirmPayment">
                确认收款
            </button>
        </view>
    </uni-popup>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits, watch } from 'vue';
import uniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue';
import uniPopup from '@dcloudio/uni-ui/lib/uni-popup/uni-popup.vue';

const props = defineProps({
    customer: {
        type: Object,
        required: true
    },
    totalDebtAmount: {
        type: Number,
        default: 0
    },
    unpaidRecords: {
        type: Array,
        default: () => []
    }
});

const emit = defineEmits(['close', 'confirm']);

// 组件内部状态
const popup = ref(null);
const paymentAmount = ref('');
const paymentRemark = ref('');
const selectedMethod = ref('cash');
const selectedRecords = ref([]);
const isAllSelected = computed(() => {
    return selectedRecords.value.length === props.unpaidRecords.length && props.unpaidRecords.length > 0;
});

// 支付方式选项
const paymentMethods = [
    { label: '现金', value: 'cash' },
    { label: '微信', value: 'wechat' },
    { label: '支付宝', value: 'alipay' },
    { label: '银行转账', value: 'bank' }
];

// 监听欠款总额变化，更新默认收款金额
watch(() => props.totalDebtAmount, (newValue) => {
    paymentAmount.value = formatMoney(newValue);
}, { immediate: true });

// 打开弹窗
function open() {
    // 初始化默认值
    paymentAmount.value = formatMoney(props.totalDebtAmount);
    paymentRemark.value = '';
    selectedMethod.value = 'cash';
    selectedRecords.value = [];

    popup.value.open();
}

// 打开弹窗并选中指定记录
function openWithSelectedRecords(recordIds) {
    // 初始化默认值
    paymentRemark.value = '';
    selectedMethod.value = 'cash';
    selectedRecords.value = recordIds || [];

    // 计算选中记录的总金额
    if (recordIds && recordIds.length > 0) {
        let selectedTotal = 0;

        // 计算选中记录的未付金额总和
        recordIds.forEach(recordId => {
            // 尝试使用多种字段匹配记录
            const record = props.unpaidRecords.find(r => {
                return r.orderNo === recordId ||
                       r.id === recordId ||
                       r.order_no === recordId ||
                       r.order_id === recordId ||
                       r.sale_id === recordId ||
                       getRecordId(r) === recordId;
            });

            if (record) {
                const unpaidAmount = getRecordUnpaidAmount(record);
                console.log(`记录 ${recordId} 的未付金额: ${unpaidAmount}`);
                selectedTotal += unpaidAmount;
            } else {
                console.log(`未找到记录ID: ${recordId}`);
            }
        });

        console.log(`选中记录的未付金额总和: ${selectedTotal}`);

        // 设置付款金额为选中记录的未付金额总和
        paymentAmount.value = formatMoney(selectedTotal);
    } else {
        // 如果没有选中记录，则使用总欠款金额
        paymentAmount.value = formatMoney(props.totalDebtAmount);
    }

    popup.value.open();
}

// 关闭弹窗
function closePopup() {
    popup.value.close();
    emit('close');
}

// 选择支付方式
function selectPaymentMethod(method) {
    selectedMethod.value = method;
}

// 获取记录ID
function getRecordId(record) {
    // 尝试不同的ID字段
    if (record.orderNo) return record.orderNo;
    if (record.id) return record.id;
    if (record.order_no) return record.order_no;
    if (record.order_id) return record.order_id;
    if (record.sale_id) return record.sale_id;

    // 如果没有找到ID，使用索引作为ID
    return props.unpaidRecords.indexOf(record).toString();
}

// 切换记录选择状态
function toggleRecordSelection(record) {
    const recordId = getRecordId(record);
    const index = selectedRecords.value.indexOf(recordId);

    if (index === -1) {
        selectedRecords.value.push(recordId);
    } else {
        selectedRecords.value.splice(index, 1);
    }
}

// 全选/取消全选
function toggleSelectAll() {
    if (isAllSelected.value) {
        // 取消全选
        selectedRecords.value = [];
    } else {
        // 全选
        selectedRecords.value = props.unpaidRecords.map(record => getRecordId(record));
    }
}

// 获取记录的未付金额
function getRecordUnpaidAmount(record) {
    console.log('计算记录的未付金额:', record);

    // 如果有明确的未付金额字段
    if (record.unpaidAmount !== undefined) {
        return parseFloat(record.unpaidAmount) || 0;
    }
    if (record.unpaid_amount !== undefined) {
        return parseFloat(record.unpaid_amount) || 0;
    }

    // 如果有金额和已付金额，计算差额
    if (record.amount !== undefined && record.paidAmount !== undefined) {
        return Math.max(0, parseFloat(record.amount) - parseFloat(record.paidAmount));
    }
    if (record.amount !== undefined && record.paid_amount !== undefined) {
        return Math.max(0, parseFloat(record.amount) - parseFloat(record.paid_amount));
    }

    // 如果有总额和已付金额，计算差额
    if (record.total !== undefined && record.paidAmount !== undefined) {
        return Math.max(0, parseFloat(record.total) - parseFloat(record.paidAmount));
    }
    if (record.total !== undefined && record.paid_amount !== undefined) {
        return Math.max(0, parseFloat(record.total) - parseFloat(record.paid_amount));
    }

    // 如果有payment_status字段，根据付款状态判断
    if (record.payment_status !== undefined) {
        const status = parseInt(record.payment_status);
        // 如果是未付款(0)，返回全额
        if (status === 0) {
            if (record.amount !== undefined) return parseFloat(record.amount) || 0;
            if (record.total !== undefined) return parseFloat(record.total) || 0;
        }
        // 如果是部分付款(2)，计算差额
        else if (status === 2) {
            if (record.amount !== undefined && record.paid_amount !== undefined) {
                return Math.max(0, parseFloat(record.amount) - parseFloat(record.paid_amount));
            }
            if (record.total !== undefined && record.paid_amount !== undefined) {
                return Math.max(0, parseFloat(record.total) - parseFloat(record.paid_amount));
            }
        }
    }

    // 如果只有金额或总额，且状态为未付款或未回款
    if ((record.status === '未付款' || record.status === '未回款' || record.paymentStatus === 'unpaid') &&
        (record.amount !== undefined || record.total !== undefined)) {
        return parseFloat(record.amount || record.total);
    }

    // 如果没有明确的金额信息，尝试使用金额字段
    if (record.amount !== undefined) {
        return parseFloat(record.amount) || 0;
    }
    if (record.total !== undefined) {
        return parseFloat(record.total) || 0;
    }

    // 如果没有明确的金额信息，返回0
    console.warn('无法计算记录的未付金额:', record);
    return 0;
}

// 确认收款
function confirmPayment() {
    // 验证金额
    if (!paymentAmount.value || parseFloat(paymentAmount.value) <= 0) {
        uni.showToast({
            title: '请输入有效的收款金额',
            icon: 'none'
        });
        return;
    }

    // 验证金额不超过欠款总额
    const amount = parseFloat(paymentAmount.value);
    if (amount > props.totalDebtAmount) {
        uni.showToast({
            title: '收款金额不能超过欠款金额',
            icon: 'none'
        });
        return;
    }

    // 根据API文档中7.3创建付款记录的要求构建支付数据
    // 使用下划线命名法而不是驼峰命名法
    const paymentData = {
        customer_id: props.customer.id,
        amount: amount,
        payment_method: selectedMethod.value, // 使用原始的支付方式值：cash、wechat、alipay、bank_transfer
        remark: paymentRemark.value,
        related_sales: selectedRecords.value.length > 0 ? selectedRecords.value : []
    };

    console.log('构建的付款数据:', paymentData);

    // 触发确认事件
    emit('confirm', paymentData);

    // 关闭弹窗
    closePopup();
}

// 获取支付方式标签
// 注意：这个函数保留作为展示用途，在UI中显示支付方式的中文名称
function getPaymentMethodLabel(value) {
    const method = paymentMethods.find(m => m.value === value);
    return method ? method.label : '现金';
}

// 获取记录日期
function getRecordDate(record) {
    // 尝试不同的日期字段
    if (record.date) return record.date;
    if (record.createDate) return record.createDate;
    if (record.createTime) return record.createTime;
    if (record.saleDate) return record.saleDate;
    if (record.sale_date) return record.sale_date;
    if (record.create_time) return record.create_time;

    // 如果有时间戳
    if (record.timestamp) {
        const date = new Date(record.timestamp);
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    }

    // 如果没有日期，返回默认值
    return '';
}

// 获取记录产品名称
function getRecordProductName(record) {
    // 尝试不同的产品名称字段
    if (record.productName) return record.productName;
    if (record.name) return record.name;
    if (record.fruitName) return record.fruitName;
    if (record.fruit_name) return record.fruit_name;
    if (record.title) return record.title;
    if (record.product_name) return record.product_name;

    // 尝试组合字段
    if (record.brand && record.variety) {
        return `${record.brand}${record.variety}`;
    }

    // 如果没有名称，返回默认值
    return '水果';
}

// 格式化金额
function formatMoney(amount) {
    return parseFloat(amount).toFixed(2);
}

// 暴露方法给父组件
defineExpose({
    open,
    openWithSelectedRecords
});
</script>

<style>
.payment-popup {
    width: 650rpx;
    background-color: #FFFFFF;
    border-radius: 16rpx;
    padding: 30rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
    max-height: 80vh;
    display: flex;
    flex-direction: column;
}

.payment-popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30rpx;
    padding-bottom: 20rpx;
    border-bottom: 1rpx solid #F3F4F6;
}

.payment-popup-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #1F2937;
}

.payment-popup-close {
    padding: 10rpx;
}

.payment-customer-info {
    background-color: #F9FAFB;
    padding: 20rpx;
    border-radius: 8rpx;
    margin-bottom: 20rpx;
}

.payment-customer-name {
    font-size: 28rpx;
    font-weight: bold;
    color: #1F2937;
    margin-bottom: 8rpx;
    display: block;
}

.payment-customer-debt {
    font-size: 24rpx;
    color: #EF4444;
    display: block;
}

/* 待付款记录列表样式 */
.unpaid-records-list {
    max-height: 300rpx;
    margin-bottom: 20rpx;
    border: 1rpx solid #E5E7EB;
    border-radius: 8rpx;
}

.unpaid-records-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16rpx;
    border-bottom: 1rpx solid #E5E7EB;
    background-color: #F9FAFB;
}

.unpaid-records-title {
    font-size: 26rpx;
    font-weight: 500;
    color: #4B5563;
}

.unpaid-records-select-all {
    font-size: 24rpx;
    color: #0D9488;
}

.unpaid-record-item {
    display: flex;
    padding: 16rpx;
    border-bottom: 1rpx solid #F3F4F6;
    align-items: center;
}

.unpaid-record-item:last-child {
    border-bottom: none;
}

.unpaid-record-item.selected {
    background-color: #F0FDFA;
}

.record-checkbox {
    width: 36rpx;
    height: 36rpx;
    border-radius: 50%;
    border: 2rpx solid #D1D5DB;
    margin-right: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
}

.checkbox-inner {
    width: 24rpx;
    height: 24rpx;
    border-radius: 50%;
    background-color: #0D9488;
}

.record-info {
    flex: 1;
}

.record-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8rpx;
}

.record-date {
    font-size: 24rpx;
    color: #6B7280;
}

.record-amount {
    font-size: 26rpx;
    font-weight: 500;
    color: #EF4444;
}

.record-product {
    font-size: 26rpx;
    color: #1F2937;
}

.payment-amount-input {
    margin-bottom: 20rpx;
}

.payment-amount-label {
    font-size: 26rpx;
    color: #4B5563;
    margin-bottom: 10rpx;
    display: block;
}

.payment-input-wrapper {
    display: flex;
    align-items: center;
    border: 1rpx solid #E5E7EB;
    border-radius: 8rpx;
    padding: 0 20rpx;
    height: 80rpx;
}

.payment-currency {
    font-size: 30rpx;
    color: #4B5563;
    margin-right: 10rpx;
}

.payment-input {
    flex: 1;
    height: 80rpx;
    font-size: 30rpx;
    color: #1F2937;
}

.payment-method {
    margin-bottom: 20rpx;
}

.payment-method-label {
    font-size: 26rpx;
    color: #4B5563;
    margin-bottom: 10rpx;
    display: block;
}

.payment-method-options {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;
    margin-bottom: 10rpx;
}

.payment-method-selected {
    font-size: 24rpx;
    color: #6B7280;
    margin-top: 10rpx;
}

.payment-method-option {
    padding: 10rpx 20rpx;
    border: 1rpx solid #E5E7EB;
    border-radius: 8rpx;
    font-size: 26rpx;
    color: #4B5563;
    background-color: #F9FAFB;
}

.payment-method-option.selected {
    border-color: #0D9488;
    background-color: #ECFDF5;
    color: #0D9488;
}

.payment-remark {
    margin-bottom: 30rpx;
}

.payment-remark-label {
    font-size: 26rpx;
    color: #4B5563;
    margin-bottom: 10rpx;
    display: block;
}

.payment-remark-input {
    width: 100%;
    height: 120rpx;
    border: 1rpx solid #E5E7EB;
    border-radius: 8rpx;
    padding: 20rpx;
    font-size: 26rpx;
    color: #4B5563;
}

.payment-confirm-btn {
    width: 100%;
    height: 80rpx;
    background-color: #0D9488;
    color: #FFFFFF;
    font-size: 28rpx;
    font-weight: bold;
    border-radius: 8rpx;
    display: flex;
    align-items: center;
    justify-content: center;
}

.payment-confirm-btn:active {
    background-color: #0F766E;
}
</style>
