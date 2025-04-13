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
		:customGetStatusLabel="getSalesStatusLabel"
	></record-viewer>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import RecordViewer from '@/components/RecordViewer.vue';
import { salesRecords as mockSalesRecords } from '@/pages/sales/mock-data.js';

// 格式化数据以符合列表需要的形式
const salesRecords = ref([]);

onMounted(() => {
	console.log('销售记录页面已加载');
	console.log('导入的模拟数据条数:', mockSalesRecords.length);

	const formattedRecords = mockSalesRecords.map(record => ({
		orderNo: record.orderNo,
		salesPerson: record.salesPerson,
		customerName: record.customerName,
		productName: record.productName,
		spec: record.spec,
		unitPrice: record.unitPrice,
		quantity: record.quantity,
		amount: record.amount,
		date: record.date,
		time: '10:00', // 模拟时间
		status: record.status,
		paymentMethod: record.status === '已付款' ? '微信支付' : '',
		paymentTime: record.status === '已付款' ? `${record.date} 10:30` : '',
		remark: `订单号：${record.orderNo}的销售记录`
	}));

	console.log('格式化后的数据条数:', formattedRecords.length);
	salesRecords.value = formattedRecords;

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
	{ title: '日期', field: 'date', type: 'date', width: '200rpx' },
	{ title: '单号', field: 'orderNo', type: 'text', width: '220rpx' },
	{ title: '客户', field: 'customerName', type: 'text', width: '200rpx' },
	{ title: '业务员', field: 'salesPerson', type: 'text', width: '150rpx' },
	{ title: '商品', field: 'productName', type: 'text', width: '240rpx' },
	{ title: '规格', field: 'spec', type: 'text', width: '200rpx' },
	{ title: '数量', field: 'quantity', unit: '箱', type: 'number', width: '120rpx' },
	{ title: '单价', field: 'unitPrice', unit: '/箱', type: 'price', width: '140rpx' },
	{ title: '金额', field: 'amount', type: 'price', width: '180rpx' },
	{ title: '状态', field: 'status', type: 'status', width: '120rpx' }
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
function getSalesStatusLabel(statusValue) {
	// 始终返回全部状态，作为下拉菜单的标题
	return '全部状态';
}

// 详情弹窗配置
const detailSections = [
	{
		title: '基本信息',
		fields: [
			{ label: '交易日期', field: 'date', timeField: 'time', type: 'date' },
			{ label: '业务员', field: 'salesPerson', type: 'text' },
			{ label: '客户', field: 'customerName', type: 'text' }
		]
	},
	{
		title: '商品信息',
		fields: [
			{ label: '商品名称', field: 'productName', type: 'text' },
			{ label: '规格', field: 'spec', type: 'text' },
			{ label: '数量', field: 'quantity', unit: '箱', type: 'number' },
			{ label: '单价', field: 'unitPrice', unit: '/箱', type: 'price' },
			{ label: '总金额', field: 'amount', type: 'price' }
		]
	},
	{
		title: '付款信息',
		fields: [
			{ label: '付款状态', field: 'status', type: 'status' },
			{ label: '付款方式', field: 'paymentMethod', type: 'text', condition: { field: 'status', value: '已付款' } },
			{ label: '付款时间', field: 'paymentTime', type: 'text', condition: { field: 'status', value: '已付款' } }
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