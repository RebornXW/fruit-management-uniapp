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
		cardContentField="brand,productName"
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
import { getInventoryRecords } from '@/services/inventoryRecordService.js';

// 格式化数据以符合列表需要的形式
const inventoryRecords = ref([]);

onMounted(async () => {
	console.log('库存记录页面已加载');

	// 显示加载中
	uni.showLoading({ title: '加载中...' });

	try {
		// 从服务中获取库存记录
		const data = await getInventoryRecords();
		console.log('从服务中获取的库存记录:', data);

		// 如果没有记录，显示空数组
		if (!data || !data.items || data.items.length === 0) {
			console.log('没有找到库存记录数据');
			inventoryRecords.value = [];
			uni.hideLoading();
			return;
		}

		console.log('找到库存记录数据:', data.items.length, '条');

		// 如果有记录，格式化数据
		// 先打印第一条记录的完整数据结构
		if (data.items.length > 0) {
			console.log('第一条记录数据结构:', JSON.stringify(data.items[0], null, 2));
		}

		inventoryRecords.value = data.items.map(record => {
			// 处理日期和时间
			let datePart = '';
			let timePart = '';
			if (record.operation_datetime) {
				const parts = record.operation_datetime.split('T');
				datePart = parts[0] || '';
				timePart = parts[1] ? parts[1].split('.')[0].split('Z')[0] : '';
			} else if (record.operation_date) {
				datePart = record.operation_date;
			}

			// 处理操作类型
			let operationTypeText = record.operation_type === 'in' ? '入库' : '出库';

			return {
				id: record.id,
				recordId: record.record_id,
				date: datePart,
				time: timePart,
				operatorName: record.operator_name || '',
				productName: record.fruit_name || '',
				spec: record.spec || '',
				operationType: operationTypeText,
				quantity: record.quantity || 0,
				currentStock: record.current_stock || 0,
				remark: record.remark || '',
				source: record.source || '',
				destination: record.destination || ''
			};
		});

		console.log('格式化后的库存记录数量:', inventoryRecords.value.length);
	} catch (error) {
		console.error('获取库存记录失败:', error);
		uni.showToast({
			title: '获取库存记录失败',
			icon: 'none'
		});
	} finally {
		// 隐藏加载中
		uni.hideLoading();
	}

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
	{ title: '库存记录ID', field: 'recordId', type: 'text', width: '150rpx' },
	{ title: '时间', field: 'date', type: 'datetime', timeField: 'time', width: '180rpx' },
	{ title: '用户名', field: 'operatorName', type: 'text', width: '120rpx' },
	{ title: '水果名称', field: 'productName', type: 'text', width: '150rpx' },
	{ title: '规格', field: 'spec', type: 'text', width: '120rpx' },
	{ title: '操作', field: 'operationType', type: 'status', width: '100rpx' },
	{ title: '数量', field: 'quantity', type: 'number', width: '80rpx' },
	{ title: '当前库存', field: 'currentStock', type: 'number', width: '100rpx' },
	{ title: '备注', field: 'remark', type: 'text', width: '150rpx' }
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
function getInventoryStatusLabel() {
	// 始终返回全部操作，作为下拉菜单的标题
	return '全部操作';
}

// 详情弹窗配置
const detailSections = [
	{
		title: '基本信息',
		fields: [
			{ label: '库存记录ID', field: 'recordId', type: 'text' },
			{ label: '操作时间', field: 'date', timeField: 'time', type: 'date' },
			{ label: '用户名', field: 'operatorName', type: 'text' }
		]
	},
	{
		title: '商品信息',
		fields: [
			{ label: '水果名称', field: 'productName', type: 'text' },
			{ label: '规格', field: 'spec', type: 'text' },
			{ label: '操作', field: 'operationType', type: 'status' },
			{ label: '数量', field: 'quantity', type: 'number' },
			{ label: '当前库存', field: 'currentStock', type: 'number' }
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