<template>
	<record-viewer
		title="付款记录"
		:records="paymentRecords"
		:columns="columns"
		:statusOptions="statusOptions"
		:statusMap="statusMap"
		:detailSections="detailSections"
		detailTitle="付款详情"
		:showPrintButton="true"
		cardContentField="customerName"
		:customGetStatusLabel="getPaymentMethodLabel"
	></record-viewer>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import RecordViewer from '@/components/RecordViewer.vue';
import { getPaymentRecords } from '@/services/paymentService.js';

// 格式化数据以符合列表需要的形式
const paymentRecords = ref([]);

onMounted(async () => {
	console.log('付款记录页面已加载');

	// 显示加载中
	uni.showLoading({ title: '加载中...' });

	try {
		// 从服务中获取付款记录
		const data = await getPaymentRecords();
		console.log('从服务中获取的付款记录:', data);

		// 如果没有记录，显示空数组
		if (!data || !data.items || data.items.length === 0) {
			console.log('没有找到付款记录数据');
			paymentRecords.value = [];
			uni.hideLoading();
			return;
		}

		console.log('找到付款记录数据:', data.items.length, '条');

		// 先打印第一条记录的完整数据结构
		if (data.items.length > 0) {
			console.log('第一条记录数据结构:', JSON.stringify(data.items[0], null, 2));
		}

		// 如果有记录，格式化数据
		paymentRecords.value = data.items.map(record => {
			// 处理日期和时间
			let datePart = '';
			let timePart = '';
			if (record.payment_datetime) {
				const parts = record.payment_datetime.split('T');
				datePart = parts[0] || '';
				timePart = parts[1] ? parts[1].substring(0, 8) : '';
			} else if (record.payment_date) {
				datePart = record.payment_date;
			}

			// 处理付款方式
			let paymentMethodText = record.payment_method || '未知';
			// 转换付款方式为中文
			if (paymentMethodText === 'cash') paymentMethodText = '现金';
			else if (paymentMethodText === 'wechat') paymentMethodText = '微信';
			else if (paymentMethodText === 'alipay') paymentMethodText = '支付宝';
			else if (paymentMethodText === 'bank_transfer') paymentMethodText = '银行转账';
			else if (paymentMethodText === 'other') paymentMethodText = '其他';

			return {
				id: record.id,
				orderNo: record.payment_id || record.id.toString(),
				date: datePart,
				time: timePart,
				customerName: record.customer_name || '',
				customerId: record.customer_id || '',
				operatorName: record.operator_name || '',
				operatorId: record.operator_id || '',
				amount: (record.amount || 0).toString(),
				paymentMethod: paymentMethodText,
				remark: record.remark || ''
			};
		});

		console.log('格式化后的付款记录数量:', paymentRecords.value.length);
	} catch (error) {
		console.error('获取付款记录失败:', error);
		uni.showToast({
			title: '获取付款记录失败',
			icon: 'none'
		});
	} finally {
		// 隐藏加载中
		uni.hideLoading();
	}

	// 检查页面栈情况
	const pages = getCurrentPages();
	console.log('当前页面栈:', pages.length);

	// 如果是直接打开的付款记录页面（没有导航历史），则强制设置个人中心为前一个页面
	if (pages.length === 1) {
		// 记录一个访问来源标记用于返回按钮判断
		uni.setStorageSync('paymentRecordPageSource', 'profile');
		console.log('设置付款记录页面来源为个人中心');
	}
});

// 列表视图列配置
const columns = [
	{ title: '付款编号', field: 'orderNo', type: 'text', width: '150rpx' },
	{ title: '付款日期', field: 'date', type: 'datetime', timeField: 'time', width: '200rpx' },
	{ title: '客户名称', field: 'customerName', type: 'text', width: '200rpx' },
	{ title: '操作员', field: 'operatorName', type: 'text', width: '120rpx' },
	{ title: '付款金额', field: 'amount', type: 'price', width: '120rpx' },
	{ title: '付款方式', field: 'paymentMethod', type: 'status', width: '120rpx' },
	{ title: '备注', field: 'remark', type: 'text', width: '150rpx' }
];

// 状态配置（这里用于付款方式筛选）
const statusOptions = [
	{ label: '现金', value: 'cash', field: 'paymentMethod', matchValue: '现金' },
	{ label: '微信', value: 'wechat', field: 'paymentMethod', matchValue: '微信' },
	{ label: '支付宝', value: 'alipay', field: 'paymentMethod', matchValue: '支付宝' },
	{ label: '银行转账', value: 'bank_transfer', field: 'paymentMethod', matchValue: '银行转账' },
	{ label: '其他', value: 'other', field: 'paymentMethod', matchValue: '其他' }
];

const statusMap = {
	'现金': 'bg-emerald-500',
	'微信': 'bg-green-500',
	'支付宝': 'bg-blue-500',
	'银行转账': 'bg-purple-500',
	'其他': 'bg-gray-500'
};

// 自定义状态标签函数
function getPaymentMethodLabel() {
	// 始终返回付款方式，作为下拉菜单的标题
	return '付款方式';
}

// 详情弹窗配置
const detailSections = [
	{
		title: '基本信息',
		fields: [
			{ label: '付款编号', field: 'orderNo', type: 'text' },
			{ label: '付款日期', field: 'date', type: 'date' },
			{ label: '付款时间', field: 'time', type: 'text' },
			{ label: '客户名称', field: 'customerName', type: 'text' },
			{ label: '操作员', field: 'operatorName', type: 'text' }
		]
	},
	{
		title: '付款信息',
		fields: [
			{ label: '付款金额', field: 'amount', type: 'price' },
			{ label: '付款方式', field: 'paymentMethod', type: 'status' }
		]
	},
	{
		title: '备注',
		fields: [
			{ label: '备注', field: 'remark', type: 'remark' }
		],
		condition: { field: 'remark', value: undefined, operator: 'exists' }
	}
];
</script>

<style>
</style>