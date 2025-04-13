<template>
	<record-viewer
		title="操作记录"
		:records="operationRecords"
		:columns="columns"
		:statusOptions="statusOptions"
		:statusMap="statusMap"
		:detailSections="detailSections"
		detailTitle="操作详情"
		cardNoPrefix="操作ID:"
		cardNoField="recordId"
		cardContentField="fruitName"
		cardTitleField="operationType"
		cardStatusField="operationType"
		:customGetStatusLabel="getOperationStatusLabel"
	></record-viewer>
</template>

<script setup>
import { onMounted } from 'vue';
import RecordViewer from '@/components/RecordViewer.vue';
import operationRecordService from '@/services/operationRecordService.js';

// 获取操作记录数据
const operationRecords = operationRecordService.getOperationRecords();

// 添加模拟数据（只在没有记录时添加）
if (operationRecords.value.length === 0) {
	// 模拟数据
	const mockRecords = [
	{
		recordId: 'OP20240503001',
		date: '2024-05-03',
		time: '10:30',
		operator: '张业务',
		operationType: '编辑',
		// 原始信息
		originalBrand: '国产',
		originalFruitCategory: '橙子',
		originalFruitName: '赤橙',
		originalSpec: '中果',
		originalPackagingType: '网袋',
		originalWeight: '10kg/袋',
		originalPriceRange: '80-100',
		originalImage: '/static/fruits/orange-old.jpg',
		// 变更后信息
		brand: '国产',
		fruitCategory: '橙子',
		fruitName: '赤橙',
		spec: '中果',
		packagingType: '网袋',
		weight: '10kg/袋',
		priceRange: '80-100',
		image: '/static/fruits/orange-new.jpg',
		imageChanged: true,
		remark: '更新了产品图片'
	},
	{
		recordId: 'OP20240502001',
		date: '2024-05-02',
		time: '09:15',
		operator: '王业务',
		operationType: '编辑',
		// 原始信息
		originalBrand: '海南',
		originalFruitCategory: '芒果',
		originalFruitName: '金煎芒果',
		originalSpec: '特级果',
		originalPackagingType: '纸箱',
		originalWeight: '5kg/箱',
		originalPriceRange: '150-180',
		originalImage: '/static/fruits/mango-old.jpg',
		// 变更后信息
		brand: '海南',
		fruitCategory: '芒果',
		fruitName: '金煎芒果',
		spec: '特级果',
		packagingType: '纸箱',
		weight: '5kg/箱',
		priceRange: '150-180',
		image: '/static/fruits/mango-new.jpg',
		imageChanged: true,
		remark: '仅更新了产品图片，保持其他信息不变'
	},
	{
		recordId: 'OP20240501001',
		date: '2024-05-01',
		time: '14:30',
		operator: '李业务',
		operationType: '新增',
		brand: '明牌',
		fruitCategory: '苹果',
		fruitName: '阿克苏苹果',
		spec: '大果',
		packagingType: '纸箱',
		weight: '10kg/箱',
		priceRange: '200-250',
		image: '/static/fruits/apple.jpg',
		remark: '新增水果品种'
	},
	{
		recordId: 'OP20240501002',
		date: '2024-05-01',
		time: '15:45',
		operator: '王业务',
		operationType: '编辑',
		// 原始信息
		originalBrand: '砀山',
		originalFruitCategory: '梨',
		originalFruitName: '砀山梨',
		originalSpec: '中果',
		originalPackagingType: '塑料箱',
		originalWeight: '15kg/箱',
		originalPriceRange: '100-150',
		originalImage: '/static/fruits/pear.jpg',
		// 变更后信息
		brand: '砀山',
		fruitCategory: '梨',
		fruitName: '砀山梨',
		spec: '大果',
		packagingType: '纸箱',
		weight: '15kg/箱',
		priceRange: '120-180',
		image: '/static/fruits/pear.jpg',
		remark: '调整规格和价格区间'
	},
	{
		recordId: 'OP20240430001',
		date: '2024-04-30',
		time: '09:20',
		operator: '张业务',
		operationType: '删除',
		brand: '进口',
		fruitCategory: '香蕉',
		fruitName: '菲律宾香蕉',
		spec: '标准',
		packagingType: '纸箱',
		weight: '12kg/箱',
		priceRange: '80-120',
		image: '/static/fruits/banana.jpg',
		remark: '停止销售该品种'
	},
	{
		recordId: 'OP20240429001',
		date: '2024-04-29',
		time: '16:15',
		operator: '李业务',
		operationType: '编辑',
		// 原始信息
		originalBrand: '新疆',
		originalFruitCategory: '葡萄',
		originalFruitName: '新疆葡萄',
		originalSpec: '标准',
		originalPackagingType: '塑料箱',
		originalWeight: '5kg/箱',
		originalPriceRange: '150-200',
		originalImage: '/static/fruits/grape.jpg',
		// 变更后信息
		brand: '新疆',
		fruitCategory: '葡萄',
		fruitName: '新疆葡萄',
		spec: '特大果',
		packagingType: '纸箱',
		weight: '5kg/箱',
		priceRange: '180-250',
		image: '/static/fruits/grape.jpg',
		remark: '调整规格和价格'
	},
	{
		recordId: 'OP20240428002',
		date: '2024-04-28',
		time: '14:20',
		operator: '张业务',
		operationType: '编辑',
		// 原始信息
		originalBrand: '国产',
		originalFruitCategory: '草莓',
		originalFruitName: '丰香草莓',
		originalSpec: '标准',
		originalPackagingType: '塑料盒',
		originalWeight: '250g/盒',
		originalPriceRange: '15-20',
		originalImage: '/static/fruits/strawberry-old.jpg',
		// 变更后信息
		brand: '国产',
		fruitCategory: '草莓',
		fruitName: '丰香草莓',
		spec: '标准',
		packagingType: '塑料盒',
		weight: '250g/盒',
		priceRange: '15-20',
		image: '/static/fruits/strawberry-new.jpg',
		imageChanged: true,
		remark: '只更新了产品图片，其他信息保持不变'
	},
	{
		recordId: 'OP20240428001',
		date: '2024-04-28',
		time: '10:30',
		operator: '王业务',
		operationType: '新增',
		brand: '海南',
		fruitCategory: '芒果',
		fruitName: '海南芒果',
		spec: '中果',
		packagingType: '纸箱',
		weight: '8kg/箱',
		priceRange: '180-220',
		image: '/static/fruits/mango.jpg',
		remark: '新增热带水果品种'
	}
	];

	// 将模拟数据添加到操作记录中
	mockRecords.forEach(record => {
		operationRecords.value.push(record);
	});

	// 保存到本地存储
	uni.setStorageSync('operationRecords', JSON.stringify(operationRecords.value));
}

// 表格列配置
const columns = [
	{ title: '日期', field: 'date', width: '180rpx', type: 'date' },
	{ title: '时间', field: 'time', width: '120rpx', type: 'text' },
	{ title: '业务员', field: 'operator', width: '140rpx', type: 'text' },
	{ title: '操作类型', field: 'operationType', width: '140rpx', type: 'status' },
	{ title: '水果品种', field: 'fruitName', width: '220rpx', type: 'text' },
	{ title: '规格', field: 'spec', width: '140rpx', type: 'text' }
];

// 状态配置
const statusOptions = [
	{ label: '新增', value: 'add', field: 'operationType', matchValue: '新增' },
	{ label: '编辑', value: 'edit', field: 'operationType', matchValue: '编辑' },
	{ label: '删除', value: 'delete', field: 'operationType', matchValue: '删除' }
];

const statusMap = {
	'新增': 'bg-emerald-500',
	'编辑': 'bg-blue-500',
	'删除': 'bg-red-500'
};

// 自定义状态标签函数
function getOperationStatusLabel() {
	// 始终返回全部操作，佟为下拉菜单的标题
	return '全部操作';
}

// 详情部分配置
const detailSections = [
	{
		title: '基本信息',
		fields: [
			{ label: '操作日期', field: 'date', type: 'date', timeField: 'time' },
			{ label: '业务员', field: 'operator', type: 'text' },
			{ label: '操作类型', field: 'operationType', type: 'status' }
		]
	},
	{
		title: '原始信息',
		fields: [
			{ label: '品牌', field: 'originalBrand', type: 'text' },
			{ label: '水果品类', field: 'originalFruitCategory', type: 'text' },
			{ label: '水果品种', field: 'originalFruitName', type: 'text' },
			{ label: '规格型号', field: 'originalSpec', type: 'text' },
			{ label: '包装类型', field: 'originalPackagingType', type: 'text' },
			{ label: '重量', field: 'originalWeight', type: 'text' },
			{ label: '参考价格区间', field: 'originalPriceRange', type: 'text' },
			{ label: '图片变更', field: 'imageChanged', type: 'boolean', trueText: '是', falseText: '否', condition: { field: 'imageChanged', value: true } }
		],
		condition: { field: 'operationType', value: '编辑' }
	},
	{
		title: '变更后信息',
		fields: [
			{ label: '品牌', field: 'brand', type: 'text' },
			{ label: '水果品类', field: 'fruitCategory', type: 'text' },
			{ label: '水果品种', field: 'fruitName', type: 'text' },
			{ label: '规格型号', field: 'spec', type: 'text' },
			{ label: '包装类型', field: 'packagingType', type: 'text' },
			{ label: '重量', field: 'weight', type: 'text' },
			{ label: '参考价格区间', field: 'priceRange', type: 'text' }
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

// 页面加载时获取数据
onMounted(() => {
	// 实际应用中，这里应该从API获取数据
	console.log('操作记录页面加载');

	// 如果没有模拟数据，则不会添加模拟数据
	// 因为我们现在使用真实的操作记录数据
});
</script>

<style>
</style>
