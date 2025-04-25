<template>
	<record-viewer
		title="销售记录"
		:records="salesRecords"
		:columns="columns"
		:statusOptions="statusOptions"
		:statusMap="statusMap"
		:detailSections="detailSections"
		detailTitle="销售详情"
		:showPrintButton="true"
		cardContentField="brand,productName"
		:customGetStatusLabel="getSalesStatusLabel"
	></record-viewer>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import RecordViewer from '@/components/RecordViewer.vue';
import { getSalesRecords } from '@/services/salesRecordService.js';

// 格式化数据以符合列表需要的形式
const salesRecords = ref([]);

onMounted(async () => {
	console.log('销售记录页面已加载');

	// 显示加载中
	uni.showLoading({ title: '加载中...' });

	try {
		// 从服务中获取销售记录
		const data = await getSalesRecords();
		console.log('从服务中获取的销售记录:', data);

		// 如果没有记录，显示空数组
		if (!data || !data.items || data.items.length === 0) {
			console.log('没有找到销售记录数据');
			salesRecords.value = [];
			uni.hideLoading();
			return;
		}

		console.log('找到销售记录数据:', data.items.length, '条');

		// 先打印第一条记录的完整数据结构
		if (data.items.length > 0) {
			console.log('第一条记录数据结构:', JSON.stringify(data.items[0], null, 2));
		}

		// 如果有记录，格式化数据
		salesRecords.value = data.items.map(record => {
			// 处理日期和时间
			let datePart = '';
			let timePart = '';
			if (record.sale_date) {
				const parts = record.sale_date.split(' ');
				datePart = parts[0] || '';
				timePart = parts[1] || '';
			}

			// 处理付款状态
			let statusText = '未付款';
			if (record.payment_status === 1) {
				statusText = '已付款';
			} else if (record.payment_status === 2) {
				statusText = '部分付款';
			}

			return {
				id: record.id,
				orderNo: record.id.toString(),
				date: datePart,
				time: timePart,
				salesPerson: record.user_name || '',
				customerName: record.customer_name || '',
				brand: record.brand || '',
				fruitCategory: record.fruit_category || '',
				productName: record.fruit_name || '',
				spec: record.spec || '',
				unitPrice: (record.unit_price || 0).toString(),
				quantity: record.quantity || 0,
				amount: (record.total_price || 0).toString(),
				paidAmount: (record.paid_amount || 0).toString(),
				status: statusText,
				remark: record.remarks || ''
			};
		});

		console.log('格式化后的销售记录数量:', salesRecords.value.length);
	} catch (error) {
		console.error('获取销售记录失败:', error);
		uni.showToast({
			title: '获取销售记录失败',
			icon: 'none'
		});
	} finally {
		// 隐藏加载中
		uni.hideLoading();
	}

	// 检查页面栈情况
	const pages = getCurrentPages();
	console.log('当前页面栈:', pages.length);

	// 如果是直接打开的销售记录页面（没有导航历史），则强制设置个人中心为前一个页面
	if (pages.length === 1) {
		// 记录一个访问来源标记用于返回按钮判断
		uni.setStorageSync('salesRecordPageSource', 'profile');
		console.log('设置销售记录页面来源为个人中心');
	}
});

// 列表视图列配置
const columns = [
	{ title: '记录编号', field: 'orderNo', type: 'text', width: '120rpx' },
	{ title: '销售时间', field: 'date', type: 'datetime', timeField: 'time', width: '180rpx' },
	{ title: '用户名称', field: 'salesPerson', type: 'text', width: '120rpx' },
	{ title: '客户名称', field: 'customerName', type: 'text', width: '150rpx' },
	{ title: '水果名称', field: 'productName', type: 'text', width: '150rpx' },
	{ title: '规格', field: 'spec', type: 'text', width: '120rpx' },
	{ title: '单价', field: 'unitPrice', type: 'price', width: '100rpx' },
	{ title: '数量', field: 'quantity', type: 'number', width: '80rpx' },
	{ title: '总价', field: 'amount', type: 'price', width: '120rpx' },
	{ title: '已付金额', field: 'paidAmount', type: 'price', width: '120rpx' },
	{ title: '付款状态', field: 'status', type: 'status', width: '120rpx' },
	{ title: '备注', field: 'remark', type: 'text', width: '150rpx' }
];

// 状态配置
const statusOptions = [
	{ label: '已付款', value: 'paid', field: 'status', matchValue: '已付款' },
	{ label: '未付款', value: 'unpaid', field: 'status', matchValue: '未付款' },
	{ label: '部分付款', value: 'partial', field: 'status', matchValue: '部分付款' }
];

const statusMap = {
	'已付款': 'bg-emerald-500',
	'未付款': 'bg-red-500',
	'部分付款': 'bg-yellow-500'
};

// 自定义状态标签函数
function getSalesStatusLabel() {
	// 始终返回全部状态，作为下拉菜单的标题
	return '全部状态';
}

// 详情弹窗配置
const detailSections = [
	{
		title: '基本信息',
		fields: [
			{ label: '记录编号', field: 'orderNo', type: 'text' },
			{ label: '销售日期', field: 'date', type: 'date' },
			{ label: '销售时间', field: 'time', type: 'text' },
			{ label: '用户名称', field: 'salesPerson', type: 'text' },
			{ label: '客户名称', field: 'customerName', type: 'text' }
		]
	},
	{
		title: '商品信息',
		fields: [
			{ label: '水果名称', field: 'productName', type: 'text' },
			{ label: '规格', field: 'spec', type: 'text' },
			{ label: '单价', field: 'unitPrice', type: 'price' },
			{ label: '数量', field: 'quantity', type: 'number' },
			{ label: '总价', field: 'amount', type: 'price' }
		]
	},
	{
		title: '付款信息',
		fields: [
			{ label: '已付金额', field: 'paidAmount', type: 'price' },
			{ label: '付款状态', field: 'status', type: 'status' }
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