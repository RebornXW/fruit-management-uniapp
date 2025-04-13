<template>
	<record-viewer
		title="库存记录"
		:records="inventoryRecords"
		:columns="columns"
		:statusOptions="statusOptions"
		:statusMap="statusMap"
		:detailSections="detailSections"
		detailTitle="库存变更详情"
		cardNoPrefix="库存ID:"
		cardNoField="recordId"
		cardContentField="productName"
		cardTitleField="operationType"
		cardStatusField="operationType"
		countLabel="总变更量"
		totalLabel="总价值变更"
		cardFooterLabel=""
		cardFooterField=""
		:customGetStatusLabel="getInventoryStatusLabel"
	></record-viewer>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import RecordViewer from '@/components/RecordViewer.vue';

// 库存记录数据
const inventoryRecords = ref([
	{
		recordId: 'I20240501001',
		operatorName: '张库管',
		productName: '明牌阿克苏苹果',
		spec: '10kg/箱',
		unitPrice: '180',
		quantity: 50,
		amount: '9,000',
		date: '2024-05-01',
		time: '09:15',
		operationType: '入库',
		source: '供应商A',
		remark: '新鲜到货，品质优良'
	},
	{
		recordId: 'I20240501002',
		operatorName: '李库管',
		productName: '砀山梨',
		spec: '15kg/箱',
		unitPrice: '100',
		quantity: 30,
		amount: '3,000',
		date: '2024-05-01',
		time: '11:30',
		operationType: '入库',
		source: '供应商B',
		remark: '常规进货'
	},
	{
		recordId: 'I20240430001',
		operatorName: '张库管',
		productName: '新鲜橘子',
		spec: '12kg/箱',
		unitPrice: '60',
		quantity: -8,
		amount: '-480',
		date: '2024-04-30',
		time: '16:45',
		operationType: '出库',
		destination: '老李水果批发',
		remark: '销售出库'
	},
	{
		recordId: 'I20240429001',
		operatorName: '李库管',
		productName: '进口香蕉',
		spec: '15kg/箱',
		unitPrice: '80',
		quantity: 40,
		amount: '3,200',
		date: '2024-04-29',
		time: '10:10',
		operationType: '入库',
		source: '供应商C',
		remark: '采购入库'
	}
]);

onMounted(() => {
	console.log('库存记录页面已加载');
	console.log('库存记录数据条数:', inventoryRecords.value.length);

	// 检查页面栈情况
	const pages = getCurrentPages();
	console.log('当前页面栈:', pages.length);

	// 如果是直接打开的库存记录页面（没有导航历史），则强制设置个人中心为前一个页面
	if (pages.length === 1) {
		// 记录一个访问来源标记用于返回按钮判断
		uni.setStorageSync('inventoryRecordPageSource', 'profile');
		console.log('设置库存记录页面来源为个人中心');
	}
});

// 列表视图列配置
const columns = [
	{ title: '日期', field: 'date', type: 'date', width: '180rpx' },
	{ title: '时间', field: 'time', type: 'text', width: '120rpx' },
	{ title: '操作员', field: 'operatorName', type: 'text', width: '150rpx' },
	{ title: '商品', field: 'productName', type: 'text', width: '240rpx' },
	{ title: '规格', field: 'spec', type: 'text', width: '180rpx' },
	{ title: '操作类型', field: 'operationType', type: 'status', width: '120rpx' },
	{ title: '数量', field: 'quantity', unit: '件', type: 'number', width: '120rpx' }
];

// 状态配置
const statusOptions = [
	{ label: '入库', value: 'in', field: 'operationType', matchValue: '入库' },
	{ label: '出库', value: 'out', field: 'operationType', matchValue: '出库' }
];

const statusMap = {
	'入库': 'bg-emerald-500',
	'出库': 'bg-blue-500',
	'调整': 'bg-yellow-500'
};

// 自定义状态标签函数
function getInventoryStatusLabel(statusValue) {
	// 始终返回全部操作，作为下拉菜单的标题
	return '全部操作';
}

// 详情弹窗配置
const detailSections = [
	{
		title: '基本信息',
		fields: [
			{ label: '操作时间', field: 'date', timeField: 'time', type: 'date' },
			{ label: '操作类型', field: 'operationType', type: 'status' },
			{ label: '操作员', field: 'operatorName', type: 'text' }
		]
	},
	{
		title: '商品信息',
		fields: [
			{ label: '品牌', field: 'brand', type: 'text' },
			{ label: '水果品类', field: 'fruitCategory', type: 'text' },
			{ label: '水果品种', field: 'productName', type: 'text' },
			{ label: '规格型号', field: 'spec', type: 'text' },
			{ label: '变更数量', field: 'quantity', unit: '箱', type: 'number' }
		]
	},
	{
		title: '供应来源',
		fields: [
			{ label: '供应商', field: 'source', type: 'text' }
		],
		condition: { field: 'operationType', value: '入库' }
	},
	{
		title: '出库去向',
		fields: [
			{ label: '目的地', field: 'destination', type: 'text' }
		],
		condition: { field: 'operationType', value: '出库' }
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