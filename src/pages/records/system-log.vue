<template>
	<record-viewer
		title="系统日志"
		:records="systemLogs"
		:columns="columns"
		:statusOptions="statusOptions"
		:statusMap="statusMap"
		:detailSections="detailSections"
		detailTitle="日志详情"
		cardNoPrefix="日志ID:"
		cardNoField="id"
		cardContentField="business_description"
		cardTitleField="module"
		cardStatusField="log_type"
		:customGetStatusLabel="getLogTypeLabel"
		@search="handleSearch"
		@status-filter="handleStatusFilter"
		@date-filter="handleDateFilter"
		@page-change="handlePageChange"
	></record-viewer>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import RecordViewer from '@/components/RecordViewer.vue';
import { getSystemLogs } from '@/services/systemLogService.js';

// 创建响应式系统日志数据
const systemLogs = ref([]);

// 筛选参数
const filterParams = ref({
	log_type: '',
	start_date: '',
	end_date: '',
	keyword: '',
	page: 1,
	limit: 20
});

// 加载系统日志数据
async function loadSystemLogs(params = {}) {
	console.log('加载系统日志，参数:', params);

	// 显示加载提示
	uni.showLoading({
		title: '加载中...'
	});

	try {
		// 合并筛选参数
		const queryParams = { ...filterParams.value, ...params };
		console.log('最终请求参数:', queryParams);

		// 从服务中获取系统日志
		const data = await getSystemLogs(queryParams);
		console.log('从服务中获取的系统日志:', data);

		// 如果没有记录，显示空数组
		if (!data || !data.items || data.items.length === 0) {
			console.log('没有找到系统日志数据');
			systemLogs.value = [];
			uni.showToast({
				title: '暂无系统日志',
				icon: 'none'
			});
			uni.hideLoading();
			return;
		}

		console.log('找到系统日志数据:', data.items.length, '条');

		// 如果有记录，格式化数据
		// 先打印第一条记录的完整数据结构
		if (data.items.length > 0) {
			console.log('第一条记录数据结构:', JSON.stringify(data.items[0], null, 2));
		}

		systemLogs.value = data.items.map(record => {
			// 处理日期和时间
			let datePart = '';
			let timePart = '';
			if (record.log_datetime) {
				const parts = record.log_datetime.split('T');
				datePart = parts[0] || '';
				timePart = parts[1] ? parts[1].split('.')[0].split('Z')[0] : '';
			} else if (record.created_at) {
				const parts = record.created_at.split('T');
				datePart = parts[0] || '';
				timePart = parts[1] ? parts[1].split('.')[0].split('Z')[0] : '';
			}

			return {
				id: record.id,
				log_type: record.log_type || '',
				module: record.module || '',
				action: record.action || '',
				user_id: record.user_id,
				user_name: record.user_name || '',
				target_type: record.target_type || '',
				target_id: record.target_id,
				record_id: record.record_id || '',
				business_description: record.business_description || '',
				data_before: record.data_before || '',
				data_after: record.data_after || '',
				ip_address: record.ip_address || '',
				user_agent: record.user_agent || '',
				request_url: record.request_url || '',
				request_method: record.request_method || '',
				response_code: record.response_code,
				execution_time: record.execution_time,
				log_datetime: record.log_datetime || '',
				created_at: record.created_at || '',
				date: datePart,
				time: timePart
			};
		});

		console.log('格式化后的系统日志数量:', systemLogs.value.length);
	} catch (error) {
		console.error('获取系统日志失败:', error);
		uni.showToast({
			title: '获取系统日志失败',
			icon: 'none'
		});
	} finally {
		// 隐藏加载提示
		uni.hideLoading();
	}
}

// 处理状态筛选
function handleStatusFilter(status) {
	console.log('筛选日志类型:', status);
	if (status) {
		// 根据状态值设置筛选参数
		filterParams.value.log_type = status.matchValue;
	} else {
		// 清除筛选参数
		filterParams.value.log_type = '';
	}

	// 重新加载数据
	loadSystemLogs();
}

// 处理日期筛选
function handleDateFilter(dateRange) {
	console.log('筛选日期范围:', dateRange);
	if (dateRange) {
		filterParams.value.start_date = dateRange.startDate;
		filterParams.value.end_date = dateRange.endDate;
	} else {
		filterParams.value.start_date = '';
		filterParams.value.end_date = '';
	}

	// 重新加载数据
	loadSystemLogs();
}

// 处理搜索
function handleSearch(keyword) {
	console.log('搜索关键词:', keyword);
	filterParams.value.keyword = keyword;

	// 重新加载数据
	loadSystemLogs();
}

// 处理分页
function handlePageChange(page) {
	console.log('切换到页码:', page);
	filterParams.value.page = page;

	// 重新加载数据
	loadSystemLogs();
}

// 页面加载时获取数据
onMounted(() => {
	console.log('系统日志页面加载');
	loadSystemLogs();
});

// 表格列配置
const columns = [
	{ title: '日期', field: 'date', width: '120rpx', type: 'date' },
	{ title: '时间', field: 'time', width: '120rpx', type: 'text' },
	{ title: '模块', field: 'module', width: '120rpx', type: 'text' },
	{ title: '操作', field: 'action', width: '120rpx', type: 'text' },
	{ title: '用户', field: 'user_name', width: '120rpx', type: 'text' },
	{ title: '描述', field: 'business_description', width: '300rpx', type: 'text' },
	{ title: '日志类型', field: 'log_type', width: '140rpx', type: 'status' }
];

// 状态配置
const statusOptions = [
	{ label: '业务操作', value: 'business', field: 'log_type', matchValue: 'BUSINESS_OPERATION' },
	{ label: '系统技术', value: 'system', field: 'log_type', matchValue: 'SYSTEM_TECHNICAL' },
	{ label: '安全审计', value: 'security', field: 'log_type', matchValue: 'SECURITY_AUDIT' }
];

const statusMap = {
	'BUSINESS_OPERATION': 'bg-blue-500',
	'SYSTEM_TECHNICAL': 'bg-amber-500',
	'SECURITY_AUDIT': 'bg-emerald-500'
};

// 自定义状态标签函数
function getLogTypeLabel() {
	// 始终返回全部日志类型，作为下拉菜单的标题
	return '日志类型';
}

// 详情部分配置
const detailSections = [
	{
		title: '基本信息',
		fields: [
			{ label: '日志时间', field: 'date', type: 'date', timeField: 'time' },
			{ label: '日志类型', field: 'log_type', type: 'status' },
			{ label: '模块', field: 'module', type: 'text' },
			{ label: '操作', field: 'action', type: 'text' },
			{ label: '用户', field: 'user_name', type: 'text' },
			{ label: '描述', field: 'business_description', type: 'text' }
		]
	},
	{
		title: '目标信息',
		fields: [
			{ label: '目标类型', field: 'target_type', type: 'text' },
			{ label: '目标ID', field: 'target_id', type: 'text' },
			{ label: '记录编号', field: 'record_id', type: 'text' }
		],
		condition: { field: 'target_type', value: undefined, operator: 'exists' }
	},
	{
		title: '变更前数据',
		fields: [
			{ label: '数据', field: 'data_before', type: 'json' }
		],
		condition: { field: 'data_before', value: undefined, operator: 'exists' }
	},
	{
		title: '变更后数据',
		fields: [
			{ label: '数据', field: 'data_after', type: 'json' }
		],
		condition: { field: 'data_after', value: undefined, operator: 'exists' }
	},
	{
		title: '请求信息',
		fields: [
			{ label: '请求URL', field: 'request_url', type: 'text' },
			{ label: '请求方法', field: 'request_method', type: 'text' },
			{ label: '响应代码', field: 'response_code', type: 'text' },
			{ label: '执行时间', field: 'execution_time', type: 'text', suffix: 'ms' }
		],
		condition: { field: 'request_url', value: undefined, operator: 'exists' }
	},
	{
		title: '客户端信息',
		fields: [
			{ label: 'IP地址', field: 'ip_address', type: 'text' },
			{ label: '用户代理', field: 'user_agent', type: 'text' }
		],
		condition: { field: 'ip_address', value: undefined, operator: 'exists' }
	}
];
</script>

<style>
</style>
