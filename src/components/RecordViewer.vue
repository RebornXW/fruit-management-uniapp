<template>
	<view class="record-viewer" @tap="onPageClick">
		<view class="record-viewer-fixed">
			<!-- 顶部标题和操作栏 -->
			<view class="header-container">
				<view class="header-inner">
					<view class="back-button" @tap="goBack">
						<uni-icons type="left" size="16" color="#ffffff"></uni-icons>
					</view>
					<view class="search-container">
						<uni-icons type="search" size="16" color="#ffffff80"></uni-icons>
						<input type="text"
							:placeholder="isFocused ? '' : title"
							placeholder-style="color: rgba(255, 255, 255, 0.6); font-weight: normal; font-size: 24rpx;"
							class="search-field"
							v-model="searchKeyword"
							@input="filterRecords"
							@focus="handleFocus"
							@blur="handleBlur" />
					</view>
					<view class="filter-container" @tap="showAdvancedFilter">
						<uni-icons type="gear" size="16" color="#ffffff"></uni-icons>
					</view>
				</view>
			</view>

			<!-- 筛选控制区域 -->
			<view class="filter-control-container">
				<view class="segment-control">
					<view
						v-for="(option, index) in dateOptions"
						:key="index"
						class="segment-item"
						:class="{'segment-active': dateRange === option.value}"
						@tap="setDateRange(option.value)"
					>
						<text>{{option.label}}</text>
					</view>
				</view>

				<view class="status-dropdown" @tap.stop="toggleStatusDropdown">
					<text>{{statusFilter === 'all' ? getStatusLabel() : getCurrentStatusLabel()}}</text>
					<text class="iconfont icon-down"></text>
				</view>
			</view>

			<!-- 状态下拉菜单 -->
			<view class="status-dropdown-menu" v-if="showStatusDropdown" @tap.stop>
				<view
					class="status-option"
					:class="{'status-option-active': statusFilter === 'all'}"
					@tap="setStatusFilter('all')"
				>
					<text>{{ getStatusLabel() }}</text>
				</view>
				<view
					v-for="(option, index) in props.statusOptions"
					:key="index"
					class="status-option"
					:class="{'status-option-active': statusFilter === option.value}"
					@tap="setStatusFilter(option.value)"
				>
					<text>{{option.label}}</text>
				</view>
			</view>

			<!-- 点击其他区域关闭下拉菜单的遮罩层 -->
			<view v-if="showStatusDropdown" class="dropdown-mask" @tap="closeStatusDropdown"></view>

			<!-- 数据汇总条 -->
			<view class="data-summary">
				<view class="summary-item">
					<text class="summary-label">总计:</text>
					<text class="summary-value">{{filteredRecords.length}} 条</text>
				</view>
				<view class="summary-item" v-if="showTotal">
					<text class="summary-label">{{totalLabel}}:</text>
					<text class="summary-value">¥{{totalValue}}</text>
				</view>
				<view class="summary-item" v-if="showCount">
					<text class="summary-label">{{countLabel}}:</text>
					<text class="summary-value">{{totalCount}}{{countUnit}}</text>
				</view>
			</view>

			<!-- 列表视图 - 不允许滚动 -->
			<view class="table-content-wrapper">
				<view v-if="viewType === 'list'" class="table-content">
					<!-- 横向可滚动区域 -->
					<scroll-view scroll-x class="table-scroll-container" show-scrollbar="false" @scroll="handleTableScroll">
						<!-- 表头 -->
						<view class="table-header sticky">
							<view v-for="(column, index) in visibleColumns" :key="index"
								:style="{ width: column.width }"
								class="table-header-column"
								:class="{'sortable': isSortableColumn(column.field)}"
								@tap="isSortableColumn(column.field) && handleSort(column.field)">
								<view class="column-title-wrapper">
									<view class="column-title-container">
										<text class="column-title">{{column.title}}</text>
										<!-- 排序图标 - 只在已排序的列显示 -->
										<view v-if="isSortableColumn(column.field) && sortField === column.field" class="sort-icon">
											<uni-icons v-if="sortOrder === 'asc'" type="arrow-up" size="12" color="#4B5563"></uni-icons>
											<uni-icons v-else type="arrow-down" size="12" color="#4B5563"></uni-icons>
										</view>
									</view>
								</view>
							</view>
						</view>

						<!-- 表格内容 - 显示固定数量的行 -->
						<view class="table-body">
							<view v-for="(item, index) in currentPageRecords" :key="index"
								class="table-row" :class="index % 2 === 0 ? 'bg-white' : 'bg-gray-50'"
								@tap="showRecordDetail(item)">
								<template v-for="(column, colIndex) in visibleColumns" :key="colIndex">
									<view :style="{ width: column.width }" class="table-cell">
										<block v-if="column.type === 'text'">
											<text class="block text-sm text-ellipsis">{{item[column.field]}}</text>
										</block>
										<block v-else-if="column.type === 'date'">
											<text class="block text-sm text-ellipsis">{{item[column.field]}}</text>
										</block>
										<block v-else-if="column.type === 'number'">
											<text class="block text-sm text-ellipsis">{{item[column.field]}}{{column.unit || ''}}</text>
										</block>
										<block v-else-if="column.type === 'price'">
											<text class="block text-sm text-emerald-600 text-ellipsis">¥{{item[column.field]}}</text>
										</block>
										<block v-else-if="column.type === 'status'">
											<view class="status-tag" :class="getStatusTagClass(item[column.field])">
												{{item[column.field]}}
											</view>
										</block>
									</view>
								</template>
							</view>
						</view>
					</scroll-view>
				</view>

				<!-- 卡片视图 - 不允许滚动 -->
				<view v-if="viewType === 'card'" class="card-content">
					<view class="grid-cards px-4 py-2">
						<view v-for="(item, index) in currentPageRecords" :key="index"
							class="record-card" @tap="showRecordDetail(item)">
							<view class="card-header flex justify-between items-center">
								<view class="flex items-center">
									<text class="text-xs text-gray-400">{{cardNoPrefix}}{{item[cardNoField] || 'S' + item[cardDateField].replace(/-/g, '')}}</text>
								</view>
								<text class="text-xs text-gray-400">{{item[cardDateField]}}</text>
							</view>

							<view class="card-customer flex justify-between items-center mt-2">
								<text class="text-sm font-medium text-ellipsis">{{item[cardTitleField]}}</text>
								<view class="status-tag" :class="getStatusTagClass(item[cardStatusField])">
									{{item[cardStatusField]}}
								</view>
							</view>

							<view class="card-divider my-2"></view>

							<view class="card-product">
								<view class="flex justify-between">
									<text class="text-sm text-ellipsis">
										<!-- 支持多字段内容显示 -->
										<template v-if="cardContentField.includes(',')">
											{{ cardContentField.split(',').map(field => item[field.trim()]).filter(Boolean).join(' ') }}
										</template>
										<template v-else>
											{{item[cardContentField]}}
										</template>
									</text>
									<text class="text-sm">{{item[cardQuantityField]}}{{cardQuantityUnit}}</text>
								</view>
								<view class="flex justify-between items-center mt-1">
									<text class="text-xs text-gray-400 text-ellipsis">{{item[cardSpecField] || '--'}}</text>
									<text class="text-xs text-gray-400" v-if="showUnitPrice">¥{{item[cardUnitPriceField] || '--'}}{{cardUnitPriceUnit}}</text>
								</view>
							</view>

							<view class="card-divider my-2"></view>

							<view class="card-footer flex justify-between items-center">
								<text class="text-xs text-gray-400">{{cardFooterLabel}}: {{item[cardFooterField]}}</text>
								<text class="text-emerald-600 font-medium">¥{{item[cardPriceField]}}</text>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 分页控制 - 固定在底部 -->
			<view class="pagination">
				<view class="pagination-inner">
					<button class="page-btn prev-btn" :disabled="currentPage === 1" :class="{'disabled': currentPage === 1}" @tap="prevPage">
						<uni-icons type="left" size="14" color="#4B5563"></uni-icons>
						<text class="page-btn-text">上一页</text>
					</button>
					<view class="page-indicator">
						<view class="page-counter">
							<text class="page-current">{{currentPage}}</text>
							<text class="page-divider">/</text>
							<text class="page-total">{{totalPages}}</text>
						</view>
					</view>
					<button class="page-btn next-btn" :disabled="currentPage === totalPages" :class="{'disabled': currentPage === totalPages}" @tap="nextPage">
						<text class="page-btn-text">下一页</text>
						<uni-icons type="right" size="14" color="#4B5563"></uni-icons>
					</button>
				</view>
			</view>
		</view>

		<!-- 详情弹窗 -->
		<uni-popup ref="recordDetailPopup" type="bottom">
			<view class="record-detail-popup bg-white rounded-t-xl">
				<view class="drag-handle"></view>

				<view class="p-4">
					<view class="flex justify-between items-center mb-4">
						<view class="flex items-center">
							<text class="text-lg font-bold">{{detailTitle}}</text>

						</view>
						<uni-icons type="close" size="20" color="#9CA3AF" @tap="closeRecordDetail"></uni-icons>
					</view>

					<view class="detail-sections">
						<template v-for="(section, sectionIndex) in detailSections" :key="sectionIndex">
							<view v-if="shouldRenderSection(section)" class="detail-section">
								<view class="section-title">{{section.title}}</view>
								<view class="section-content">
									<template v-for="(field, fieldIndex) in section.fields" :key="fieldIndex">
										<view v-if="shouldRenderField(field)" class="detail-item" :class="{ 'remark-item': field.type === 'remark' }">
											<text class="label">{{field.label}}</text>

											<template v-if="field.type === 'text'">
												<text class="value">{{selectedRecord[field.field] || '--'}}</text>
											</template>

											<template v-else-if="field.type === 'date'">
												<text class="value">{{selectedRecord[field.field] || '--'}} {{selectedRecord[field.timeField] || ''}}</text>
											</template>

											<template v-else-if="field.type === 'price'">
												<text class="value text-emerald-600 font-medium">¥{{selectedRecord[field.field] || '--'}}</text>
											</template>

											<template v-else-if="field.type === 'number'">
												<text class="value">{{selectedRecord[field.field] || '--'}}{{field.unit || ''}}</text>
											</template>

											<template v-else-if="field.type === 'status'">
												<view class="status-tag" :class="getStatusTagClass(selectedRecord[field.field])">
													{{selectedRecord[field.field] || '--'}}
												</view>
											</template>

											<template v-else-if="field.type === 'remark'">
												<text class="value full-width">{{selectedRecord[field.field] || '无'}}</text>
											</template>
										</view>
									</template>
								</view>
							</view>
						</template>
					</view>
				</view>

				<!-- 底部操作区 -->
				<view class="detail-footer p-4 border-t border-gray-100">
					<view class="flex space-x-2">
						<button class="action-btn secondary flex-1" @tap="closeRecordDetail">关闭</button>
						<button v-if="showPrintButton" class="action-btn primary flex-1" @tap="printRecord">打印小票</button>
					</view>
				</view>
			</view>
		</uni-popup>

		<!-- 高级筛选弹窗 -->
		<uni-popup ref="advancedFilterPopup" type="bottom">
			<view class="advanced-filter-popup bg-white rounded-t-xl">
				<view class="drag-handle"></view>

				<view class="p-4">
					<view class="flex justify-between items-center mb-4">
						<text class="text-lg font-bold">高级筛选</text>
						<view class="close-btn" @tap="closeAdvancedFilter">
						<uni-icons type="closeempty" size="20" color="#9CA3AF"></uni-icons>
						</view>
					</view>

					<view class="column-selector">
						<!-- 列选项 -->
						<view v-for="(column, index) in props.columns" :key="index" class="column-option">
							<checkbox :checked="columnVisibility.get(column.title)" @tap="toggleColumnVisibility(column)" color="#4f46e5" />
							<text class="column-label">{{column.title}}</text>
						</view>
					</view>
				</view>

				<view class="filter-footer p-4 border-t border-gray-100">
					<view class="flex space-x-2">
						<button class="action-btn secondary flex-1" @tap="toggleAllColumns">
							<text>{{isAllSelected ? '取消全选' : '全选'}}</text>
						</button>
						<button class="action-btn primary flex-1" @tap="applyColumnFilter">确定</button>
					</view>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import uniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue';
import uniPopup from '@dcloudio/uni-ui/lib/uni-popup/uni-popup.vue';

// Props定义
const props = defineProps({
	// 基本配置
	title: { type: String, default: '记录查看' },
	records: { type: Array, default: () => [] },

	// 列表视图配置
	columns: { type: Array, default: () => [] },

	// 卡片视图配置
	cardNoPrefix: { type: String, default: '#' },
	cardNoField: { type: String, default: 'orderNo' },
	cardDateField: { type: String, default: 'date' },
	cardTitleField: { type: String, default: 'customerName' },
	cardStatusField: { type: String, default: 'status' },
	cardContentField: { type: String, default: 'productName' },
	cardQuantityField: { type: String, default: 'quantity' },
	cardQuantityUnit: { type: String, default: '箱' },
	cardSpecField: { type: String, default: 'spec' },
	cardUnitPriceField: { type: String, default: 'unitPrice' },
	cardUnitPriceUnit: { type: String, default: '/箱' },
	cardFooterLabel: { type: String, default: '业务员' },
	cardFooterField: { type: String, default: 'salesPerson' },
	cardPriceField: { type: String, default: 'amount' },
	showUnitPrice: { type: Boolean, default: true },

	// 详情弹窗配置
	detailTitle: { type: String, default: '详情' },
	recordNoPrefix: { type: String, default: '#' },
	recordNoField: { type: String, default: 'orderNo' },
	detailSections: { type: Array, default: () => [] },
	showPrintButton: { type: Boolean, default: false },

	// 状态配置
	statusOptions: { type: Array, default: () => [] },
	statusMap: { type: Object, default: () => ({}) },
	customGetStatusLabel: { type: Function, default: null }, // 自定义状态标签函数

	// 汇总配置
	showTotal: { type: Boolean, default: true },
	totalLabel: { type: String, default: '总金额' },
	totalField: { type: String, default: 'amount' },
	showCount: { type: Boolean, default: true },
	countLabel: { type: String, default: '总数量' },
	countField: { type: String, default: 'quantity' },
	countUnit: { type: String, default: '箱' }
});

// 视图状态
const viewType = ref('list'); // 默认始终使用列表视图
const currentPage = ref(1);
const pageSize = ref(10); // 默认每页显示10条记录，可以根据屏幕大小适当调整
const searchKeyword = ref('');
const dateRange = ref('all'); // 修改默认值为'all'，表示显示所有记录
const statusFilter = ref('all');

// 排序相关状态
const sortField = ref(null);
const sortOrder = ref('asc');

// 弹窗引用
const recordDetailPopup = ref(null);
const selectedRecord = ref({});

// 计算属性：过滤后的记录
const filteredRecords = ref([...props.records]);

// 计算属性：总页数
const totalPages = computed(() => Math.ceil(filteredRecords.value.length / pageSize.value));

// 计算属性：当前页的记录
const currentPageRecords = computed(() => {
	const start = (currentPage.value - 1) * pageSize.value;
	const end = start + pageSize.value;
	return filteredRecords.value.slice(start, end);
});

// 计算属性：总金额
const totalValue = computed(() => {
	return filteredRecords.value.reduce((sum, record) => {
		const amount = typeof record[props.totalField] === 'string'
			? parseFloat(record[props.totalField].replace(/,/g, ''))
			: record[props.totalField];
		return sum + (isNaN(amount) ? 0 : amount);
	}, 0).toLocaleString();
});

// 计算属性：总数量
const totalCount = computed(() => {
	return filteredRecords.value.reduce((sum, record) => {
		const quantity = typeof record[props.countField] === 'number'
			? record[props.countField]
			: parseFloat(record[props.countField] || 0);
		return sum + (isNaN(quantity) ? 0 : quantity);
	}, 0);
});

// 列的可见性状态
const columnVisibility = ref(new Map());

// 初始化列的可见性
watch(() => props.columns, (newColumns) => {
	newColumns.forEach(column => {
		if (!columnVisibility.value.has(column.title)) {
			columnVisibility.value.set(column.title, true);
		}
	});
}, { immediate: true });

// 计算属性：可见的列
const visibleColumns = computed(() => {
	return props.columns.filter(column => columnVisibility.value.get(column.title) === true);
});

// 监听props.records变化
watch(() => props.records, (newRecords) => {
	console.log('记录数据更新:', newRecords.length, '条记录');
	filteredRecords.value = [...newRecords];
	// 确保重置筛选状态
	dateRange.value = 'all'; // 修改默认值为'all'，表示显示所有记录
	statusFilter.value = 'all'; // 默认为全部状态
	searchKeyword.value = ''; // 清空搜索关键词
	filterRecords();
}, { deep: true, immediate: true });

// 过滤记录的方法
function filterRecords() {
	let filtered = [...props.records];
	console.log('原始记录数:', filtered.length);

	// 关键词筛选
	if (searchKeyword.value) {
		const keyword = searchKeyword.value.toLowerCase();
		filtered = filtered.filter(record => {
			// 搜索所有字符串类型的字段
			return Object.entries(record).some(([key, value]) => {
				return typeof value === 'string' && value.toLowerCase().includes(keyword);
			});
		});
	}

	// 日期范围筛选
	if (dateRange.value !== 'all') {
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		if (dateRange.value === 'today') {
			const todayStr = today.toISOString().split('T')[0];
			filtered = filtered.filter(record => record.date === todayStr);
		} else if (dateRange.value === 'yesterday') {
			const yesterday = new Date(today);
			yesterday.setDate(yesterday.getDate() - 1);
			const yesterdayStr = yesterday.toISOString().split('T')[0];
			filtered = filtered.filter(record => record.date === yesterdayStr);
		} else if (dateRange.value === 'week') {
			// 修复本周筛选逻辑
			const weekStart = new Date(today);
			// 获取当前是星期几（0是星期日，1是星期一，以此类推）
			const currentDay = today.getDay();
			// 计算本周一的日期（如果今天是星期日，则退回6天，如果是星期一则不变，星期二退回1天，以此类推）
			const daysToSubtract = currentDay === 0 ? 6 : currentDay - 1;
			weekStart.setDate(today.getDate() - daysToSubtract);
			// 设置为当天的0点
			weekStart.setHours(0, 0, 0, 0);
			// 转为YYYY-MM-DD格式以便比较
			const weekStartStr = weekStart.toISOString().split('T')[0];

			console.log('本周开始日期:', weekStartStr);
			filtered = filtered.filter(record => {
				// 确保record.date是有效的日期字符串
				if (!record.date) return false;
				const result = record.date >= weekStartStr;
				return result;
			});
		} else if (dateRange.value === 'month') {
			const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
			const monthStartStr = monthStart.toISOString().split('T')[0];
			filtered = filtered.filter(record => {
				if (!record.date) return false;
				return record.date >= monthStartStr;
			});
		}
	}

	// 状态筛选
	if (statusFilter.value !== 'all') {
		filtered = filtered.filter(record => {
			// 特殊处理部分付款
			if (statusFilter.value === 'partial') {
				return record.status === '部分付款';
			}

			// 查找匹配的状态选项
			const statusOption = props.statusOptions.find(option => option.value === statusFilter.value);
			if (statusOption && statusOption.field) {
				return record[statusOption.field] === statusOption.matchValue;
			}
			return record.status === statusFilter.value;
		});
	}

	// 排序处理
	if (sortField.value) {
		const field = sortField.value;
		const order = sortOrder.value;

		filtered.sort((a, b) => {
			let valueA = a[field];
			let valueB = b[field];

			// 日期排序特殊处理
			if (field === 'date') {
				valueA = new Date(valueA || '1970-01-01').getTime();
				valueB = new Date(valueB || '1970-01-01').getTime();
			}
			// 金额排序特殊处理
			else if (field === 'amount') {
				valueA = typeof valueA === 'string' ? parseFloat(valueA.replace(/[^\d.-]/g, '')) : valueA || 0;
				valueB = typeof valueB === 'string' ? parseFloat(valueB.replace(/[^\d.-]/g, '')) : valueB || 0;
			}
			// 字符串排序特殊处理
			else if (typeof valueA === 'string' && typeof valueB === 'string') {
				return order === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
			}

			if (order === 'asc') {
				return valueA - valueB;
			} else {
				return valueB - valueA;
			}
		});
	}

	console.log('筛选后记录数:', filtered.length);
	filteredRecords.value = filtered;
	currentPage.value = 1; // 重置到第一页

	// 强制更新计算属性
	nextTick(() => {
		console.log('总页数:', totalPages.value);
		console.log('当前页记录数:', currentPageRecords.value.length);
		console.log('总金额:', totalValue.value);
		console.log('总数量:', totalCount.value);
	});
}

// 日期选项
const dateOptions = [
	{ label: '今日', value: 'today' },
	{ label: '本周', value: 'week' },
	{ label: '本月', value: 'month' }
];

// 添加一个"全部"的日期范围值
const ALL_DATE_RANGE = 'all';

// 设置日期范围
function setDateRange(range) {
	// 如果点击的是当前已选中的选项，则切换为"全部"
	if (dateRange.value === range) {
		dateRange.value = ALL_DATE_RANGE;
	} else {
		dateRange.value = range;
	}
	filterRecords();
}

// 设置状态筛选
function setStatusFilter(status) {
	statusFilter.value = status;
	filterRecords();
	// 选择选项后自动关闭下拉框
	showStatusDropdown.value = false;
}

// 显示筛选选项
function showAdvancedFilter() {
	// 打开弹窗前更新全选状态
	updateAllSelectedState();
	advancedFilterPopup.value.open();
}

// 分页方法
function prevPage() {
	if (currentPage.value > 1) {
		currentPage.value--;
	}
}

function nextPage() {
	if (currentPage.value < totalPages.value) {
		currentPage.value++;
	}
}

// 显示记录详情
function showRecordDetail(record) {
	selectedRecord.value = record;
	recordDetailPopup.value.open();
}

// 关闭记录详情
function closeRecordDetail() {
	recordDetailPopup.value.close();
}

// 打印小票
function printRecord() {
	uni.showToast({
		title: '打印功能开发中',
		icon: 'none'
	});
}

// 获取状态类名
function getStatusClass(status) {
	return props.statusMap[status] || 'bg-gray-500';
}

// 获取状态标签类名
function getStatusTagClass(status) {
	// 特殊状态颜色处理
	if (status === '已付款') {
		return 'success';
	} else if (status === '未付款') {
		return 'danger';
	} else if (status === '部分付款') {
		return 'warning';
	}

	// 默认使用原来的逻辑
	const className = props.statusMap[status] ? props.statusMap[status].replace('bg-', '') : '';
	return className ? className : 'gray';
}

// 判断是否应该渲染某个详情部分
function shouldRenderSection(section) {
	if (!section.condition) return true;

	// 如果有条件字段，检查该字段值是否满足条件
	if (section.condition.field && section.condition.value !== undefined) {
		return selectedRecord.value[section.condition.field] === section.condition.value;
	}

	return true;
}

// 判断是否应该渲染某个字段
function shouldRenderField(field) {
	if (!field.condition) return true;

	// 如果有条件字段，检查该字段值是否满足条件
	if (field.condition.field && field.condition.value !== undefined) {
		return selectedRecord.value[field.condition.field] === field.condition.value;
	}

	return true;
}

// 返回上一页
const goBack = () => {
	console.log('点击返回按钮');

	// 检查页面栈
	const pages = getCurrentPages();
	console.log('当前页面栈:', pages.length);

	// 检查是否有来源标记
	const salesRecordSource = uni.getStorageSync('salesRecordPageSource');
	const inventoryRecordSource = uni.getStorageSync('inventoryRecordPageSource');

	if (salesRecordSource === 'profile' || inventoryRecordSource === 'profile') {
		console.log('检测到来源标记为个人中心，直接跳转');
		uni.switchTab({
			url: '/pages/profile/profile'
		});
		return;
	}

	// 如果有上一页，则返回上一页
	if (pages.length > 1) {
		console.log('有上一页，执行返回');
		uni.navigateBack();
	} else {
		// 如果没有上一页，则跳转到个人中心
		console.log('没有上一页，跳转到个人中心');
		uni.switchTab({
			url: '/pages/profile/profile'
		});
	}
};

// 获取状态显示文本
function getStatusLabel() {
	// 如果提供了自定义函数，使用自定义函数
	if (props.customGetStatusLabel) {
		return props.customGetStatusLabel(statusFilter.value, props);
	}

	// 默认处理逻辑
	if (statusFilter.value === 'all') {
		return '全部';
	}

	// 使用状态选项中的标签
	const statusOption = props.statusOptions.find(option => option.value === statusFilter.value);
	return statusOption ? statusOption.label : '全部';
}

// 获取当前选中的状态标签
function getCurrentStatusLabel() {
	// 如果是全部状态
	if (statusFilter.value === 'all') {
		return getStatusLabel();
	}

	// 使用状态选项中的标签
	const statusOption = props.statusOptions.find(option => option.value === statusFilter.value);
	return statusOption ? statusOption.label : '全部';
}

// 搜索框焦点状态
const isFocused = ref(false);

// 处理搜索框获取焦点
function handleFocus() {
	isFocused.value = true;
}

// 处理搜索框失去焦点
function handleBlur() {
	isFocused.value = false;
}

// 获取主标题（第一部分）
function getMainTitle(title) {
	if (!title) return '';
	// 检查是否有分隔符如"/"、"-"、"："等
	const separators = ['/', '-', '：', ':', '(', '（'];
	for (const sep of separators) {
		if (title.includes(sep)) {
			return title.split(sep)[0];
		}
	}
	return title;
}

// 获取副标题（第二部分）
function getSubTitle(title) {
	if (!title) return '';
	// 检查是否有分隔符如"/"、"-"、"："等
	const separators = ['/', '-', '：', ':', '(', '（'];
	for (const sep of separators) {
		if (title.includes(sep)) {
			const parts = title.split(sep);
			return parts.slice(1).join(sep);
		}
	}
	return '';
}

// 表格滚动处理
const tableScrollLeft = ref(0);

// 处理表格水平滚动同步
function handleTableScroll(e) {
	tableScrollLeft.value = e.detail.scrollLeft;
}

// 全选功能
const isAllSelected = ref(true);

function toggleAllColumns() {
	isAllSelected.value = !isAllSelected.value;
	props.columns.forEach(column => {
		columnVisibility.value.set(column.title, isAllSelected.value);
	});
}

// 更新全选状态
function updateAllSelectedState() {
	const allSelected = props.columns.every(column => columnVisibility.value.get(column.title) === true);
	isAllSelected.value = allSelected;
}

// 高级筛选相关逻辑
const advancedFilterPopup = ref(null);

function closeAdvancedFilter() {
	advancedFilterPopup.value.close();
}

function toggleColumnVisibility(column) {
	const currentVisibility = columnVisibility.value.get(column.title);
	columnVisibility.value.set(column.title, !currentVisibility);

	// 更新全选状态
	updateAllSelectedState();
}

function applyColumnFilter() {
	closeAdvancedFilter();
}

// 状态下拉控制
const showStatusDropdown = ref(false);

// 切换状态下拉
function toggleStatusDropdown() {
	showStatusDropdown.value = !showStatusDropdown.value;
}

// 关闭状态下拉
function closeStatusDropdown() {
	showStatusDropdown.value = false;
}

// 监听页面点击，关闭下拉菜单
function onPageClick() {
	if(showStatusDropdown.value) {
		showStatusDropdown.value = false;
	}
}

// 表格标题点击排序功能
function isSortableColumn(field) {
	return ['date', 'orderNo', 'amount', 'status'].includes(field);
}

function handleSort(field) {
	if (sortField.value === field) {
		sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
	} else {
		sortField.value = field;
		sortOrder.value = 'asc';
	}
	filterRecords();
}
</script>

<style>
.record-viewer {
	position: relative;
	width: 100%;
	height: 100vh;
	overflow: hidden;
	background-color: #f8f9fa;
	display: flex;
	flex-direction: column;
}

.record-viewer-fixed {
	position: relative;
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
}

.header-container {
	background: linear-gradient(135deg, #0088ff, #4f46e5);
	padding: 0;
	position: relative;
	overflow: hidden;
	box-shadow: 0 4rpx 20rpx rgba(79, 70, 229, 0.2);
}

.header-container::after {
	content: '';
	position: absolute;
	top: -100rpx;
	right: -100rpx;
	width: 300rpx;
	height: 300rpx;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.08);
	z-index: 0;
}

.header-inner {
	display: flex;
	align-items: center;
	padding: 24rpx 30rpx;
	position: relative;
	z-index: 1;
}

.back-button {
	width: 64rpx;
	height: 64rpx;
	border-radius: 50%;
	background-color: rgba(255, 255, 255, 0.15);
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.search-container {
	flex: 1;
	margin: 0 20rpx;
	display: flex;
	align-items: center;
	background-color: rgba(255, 255, 255, 0.15);
	border-radius: 100rpx;
	padding: 0 24rpx;
	height: 72rpx;
}

.search-field {
	flex: 1;
	font-size: 28rpx;
	padding-left: 12rpx;
	background-color: transparent;
	color: #ffffff;
}

.filter-container {
	width: 64rpx;
	height: 64rpx;
	border-radius: 50%;
	background-color: rgba(255, 255, 255, 0.15);
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

/* 筛选控制区域样式 */
.filter-control-container {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20rpx 30rpx;
	background-color: #ffffff;
	border-bottom: 1px solid #f0f0f0;
}

.segment-control {
	display: flex;
	background-color: #f3f4f6;
	border-radius: 8rpx;
	overflow: hidden;
	border: 1px solid #e5e7eb;
}

.segment-item {
	padding: 0 20rpx;
	height: 64rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 26rpx;
	color: #4b5563;
	min-width: 120rpx;
}

.segment-active {
	background-color: #ffffff;
	color: #4f46e5;
	font-weight: 500;
	box-shadow: 0 2rpx 6rpx rgba(0,0,0,0.05);
}

.status-dropdown {
	position: relative;
	display: flex;
	align-items: center;
	padding: 0 20rpx;
	height: 64rpx;
	border-radius: 8rpx;
	border: 1px solid #e5e7eb;
	font-size: 26rpx;
	color: #4b5563;
	background-color: #ffffff;
	box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.03);
	transition: all 0.2s ease;
}

.status-dropdown:active {
	background-color: #f9fafb;
	transform: translateY(1rpx);
}

.status-dropdown text {
	margin-right: 8rpx;
	font-weight: 500;
}

.status-dropdown-menu {
	position: absolute;
	top: 210rpx; /* 将位置向下调整 */
	right: 30rpx;
	width: 200rpx;
	background-color: #ffffff;
	border-radius: 8rpx;
	box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1);
	z-index: 100;
}

.status-option {
	padding: 16rpx 20rpx;
	font-size: 26rpx;
	border-bottom: 1px solid #f3f4f6;
}

.status-option:last-child {
	border-bottom: none;
}

.status-option-active {
	color: #4f46e5;
	font-weight: 500;
}

.data-summary {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 16rpx 40rpx;
	background-color: #ffffff;
	border-bottom: 1px solid #f0f0f0;
	box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.03);
}

.summary-item {
	display: flex;
	align-items: center;
}

.summary-label {
	font-size: 24rpx;
	color: #6b7280;
	margin-right: 8rpx;
}

.summary-value {
	font-size: 24rpx;
	font-weight: 600;
	color: #4f46e5;
}

.view-options {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20rpx 30rpx;
	background-color: #ffffff;
}

.view-btn {
	padding: 8rpx 16rpx;
	border-radius: 8rpx;
	font-size: 24rpx;
	color: #666666;
}

.view-btn.active {
	background-color: #f0f7ff;
	color: #2563eb;
	font-weight: 500;
}

.table-content-wrapper {
	flex: 1;
	display: flex;
	flex-direction: column;
	background-color: #ffffff;
	position: relative;
	overflow: hidden;
}

.table-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

.table-scroll-container {
	flex: 1;
	width: 100%;
	overflow-x: auto;
	white-space: nowrap;
	position: relative;
	background-color: #ffffff;
}

.table-header {
	display: flex;
	flex-direction: row;
	background-color: #f9fafb;
	border-bottom: 1px solid #f0f0f0;
	position: sticky;
	top: 0;
	left: 0;
	z-index: 10;
	width: max-content;
}

.table-header-column {
	flex-shrink: 0;
	padding: 16rpx 12rpx;
	min-height: 80rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: #f9fafb;
}

.column-title-wrapper {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	width: 100%;
}

.sortable {
	cursor: pointer;
	position: relative;
}

.sortable:hover {
	background-color: #f3f4f6;
}

.column-title-container {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: center;
	width: 100%;
}

.column-title {
	font-size: 28rpx;
	color: #4b5563;
	font-weight: 600;
	line-height: 1.2;
	text-align: center;
	white-space: nowrap;
	font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
}

.sort-icon {
	margin-left: 4rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.table-body {
	width: max-content;
}

.table-row {
	display: flex;
	flex-direction: row;
	border-bottom: 1px solid #f0f0f0;
	min-height: 80rpx;
	padding: 12rpx 0;
	width: max-content;
}

.table-cell {
	flex-shrink: 0;
	padding: 0 12rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: 48rpx;
}

.bg-white {
	background-color: #ffffff !important;
}

.bg-gray-50 {
	background-color: #f9fafb !important;
}

.status-dot {
	width: 16rpx;
	height: 16rpx;
	border-radius: 50%;
	margin-left: 8rpx;
}

.grid-cards {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(320rpx, 1fr));
	gap: 20rpx;
}

.record-card {
	background-color: #ffffff;
	border-radius: 16rpx;
	padding: 24rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.card-divider {
	height: 1px;
	background-color: #f5f5f5;
}

.filter-tag {
	padding: 6rpx 16rpx;
	border-radius: 8rpx;
	font-size: 24rpx;
	margin-right: 16rpx;
	background-color: #f3f4f6;
	color: #4b5563;
	border: 1px solid #e5e7eb;
}

.filter-tag.active {
	background-color: #eef2ff;
	color: #4f46e5;
	font-weight: 500;
	border-color: #c7d2fe;
}

.empty-tip {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 80rpx 0;
}

.search-box {
	display: flex;
	align-items: center;
	background-color: #f3f4f6;
	border-radius: 8rpx;
	padding: 8rpx 16rpx;
	margin: 0 12rpx;
}

.search-input {
	font-size: 24rpx;
	padding-left: 8rpx;
	width: 100%;
	background-color: transparent;
}

.view-toggle {
	display: flex;
	align-items: center;
}

.view-toggle-btn {
	padding: 8rpx 16rpx;
	border-radius: 100rpx;
}

.view-toggle-btn.active {
	background-color: #ffffff;
	box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
}

.filter-btn {
	padding: 8rpx;
}

.record-detail-popup {
	border-radius: 32rpx 32rpx 0 0;
	max-height: 80vh;
	overflow-y: auto;
}

.drag-handle {
	width: 60rpx;
	height: 6rpx;
	background-color: #e5e7eb;
	border-radius: 3rpx;
	margin: 16rpx auto;
}

.detail-section {
	margin-bottom: 32rpx;
}

.section-title {
	font-size: 28rpx;
	font-weight: 600;
	color: #374151;
	margin-bottom: 16rpx;
	padding-bottom: 8rpx;
	border-bottom: 1px solid #f3f4f6;
}

.section-content {
	margin-top: 16rpx;
}

.detail-item {
	display: flex;
	justify-content: space-between;
	padding: 8rpx 0;
	align-items: center;
}

.remark-item {
	flex-direction: column;
	align-items: flex-start;
}

.label {
	font-size: 24rpx;
	color: #6b7280;
	margin-right: 16rpx;
}

.value {
	font-size: 24rpx;
	color: #1f2937;
	text-align: right;
}

.full-width {
	width: 100%;
	margin-top: 8rpx;
	text-align: left;
	line-height: 1.5;
	white-space: pre-wrap;
}

.detail-footer {
	padding: 24rpx;
	margin-top: 16rpx;
}

.action-btn {
	border-radius: 8rpx;
	padding: 16rpx;
	font-size: 28rpx;
	text-align: center;
}

.action-btn.primary {
	background-color: #4f46e5;
	color: #ffffff;
}

.action-btn.secondary {
	background-color: #f3f4f6;
	color: #4b5563;
}

.pagination {
	position: relative;
	z-index: 10;
	background-color: #ffffff;
	box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.05);
	border-top: 1px solid #f0f0f0;
	padding: 16rpx 0;
	margin-top: auto;
}

.pagination-inner {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 16rpx 30rpx;
}

.page-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 68rpx;
	padding: 0 28rpx;
	border-radius: 100rpx;
	font-size: 26rpx;
	font-weight: 500;
	color: #ffffff;
	border: none;
	background: linear-gradient(135deg, #38bdf8, #0284c7);
	box-shadow: 0 4rpx 10rpx rgba(2, 132, 199, 0.15);
	transition: all 0.2s ease;
}

.page-btn.disabled {
	opacity: 0.3;
	background: linear-gradient(135deg, #e0f2fe, #bae6fd);
	color: #0284c7;
	box-shadow: none;
}

.page-btn:active:not(.disabled) {
	transform: translateY(2rpx);
	box-shadow: 0 2rpx 6rpx rgba(2, 132, 199, 0.1);
}

.page-btn-text {
	margin: 0 6rpx;
}

.page-indicator {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.page-counter {
	display: flex;
	align-items: baseline;
	padding: 6rpx 24rpx;
	border-radius: 8rpx;
	background-color: #f0f9ff;
	border: 1px solid #bae6fd;
}

.page-current {
	color: #0284c7;
	font-weight: bold;
	font-size: 34rpx;
}

.page-divider {
	color: #7dd3fc;
	margin: 0 8rpx;
	font-size: 24rpx;
}

.page-total {
	color: #0369a1;
	font-size: 28rpx;
}

.prev-btn, .next-btn {
	min-width: 160rpx;
}

/* 工具类 */
.text-lg {
	font-size: 32rpx;
}

.text-sm {
	font-size: 26rpx;
}

.text-xs {
	font-size: 22rpx;
}

.font-bold {
	font-weight: 600;
}

.font-medium {
	font-weight: 500;
}

.text-gray-400 {
	color: #9ca3af;
}

.text-gray-500 {
	color: #6b7280;
}

.text-emerald-600 {
	color: #059669;
}

.flex {
	display: flex;
}

.flex-1 {
	flex: 1;
}

.items-center {
	align-items: center;
}

.justify-between {
	justify-content: space-between;
}

.p-4 {
	padding: 32rpx;
}

.mt-2 {
	margin-top: 16rpx;
}

.mb-4 {
	margin-bottom: 32rpx;
}

.ml-2 {
	margin-left: 16rpx;
}

.px-4 {
	padding-left: 32rpx;
	padding-right: 32rpx;
}

.py-2 {
	padding-top: 16rpx;
	padding-bottom: 16rpx;
}

.my-2 {
	margin-top: 16rpx;
	margin-bottom: 16rpx;
}

.text-ellipsis {
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	max-width: 100%;
	line-height: 1.4;
}

.space-x-2 > view:not(:first-child),
.space-x-2 > button:not(:first-child) {
	margin-left: 16rpx;
}

.block {
	display: block;
}

.status-tag {
	padding: 4rpx 12rpx;
	border-radius: 8rpx;
	font-size: 26rpx; /* 增大字体大小，使其与其他文本更协调 */
	display: inline-block;
	line-height: 1.4;
	text-align: center;
	min-width: 80rpx;
	font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
	font-weight: 500;
}

.bg-white {
	background-color: #ffffff !important;
}

.bg-gray-50 {
	background-color: #f9fafb !important;
}

.rounded-t-xl {
	border-top-left-radius: 24rpx;
	border-top-right-radius: 24rpx;
}

.border-t {
	border-top-width: 1px;
	border-top-style: solid;
}

.border-gray-100 {
	border-color: #f3f4f6;
}

.advanced-filter-btn {
	width: 64rpx;
	height: 64rpx;
	border-radius: 50%;
	background-color: #f3f4f6;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-left: 16rpx;
}

.advanced-filter-popup {
	max-height: 80vh;
	overflow-y: auto;
}

.column-selector {
	display: flex;
	flex-direction: column;
	gap: 24rpx;
}

.column-option {
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.column-label {
	font-size: 28rpx;
	color: #374151;
}

.filter-footer {
	position: sticky;
	bottom: 0;
	background-color: #ffffff;
	box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.close-btn {
	width: 64rpx;
	height: 64rpx;
	border-radius: 50%;
	box-sizing: border-box;
	background-color: #f3f4f6;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.2s ease;
}

.close-btn:active {
	background-color: #e5e7eb;
	transform: scale(0.95);
}

.all-select-option {
	padding: 16rpx 0;
	margin-bottom: 20rpx;
	border-bottom: 1px solid #f3f4f6;
}

.column-divider {
	height: 1px;
	background-color: #f3f4f6;
	margin: 8rpx 0 20rpx 0;
}

/* 美化字体样式 */
.column-title {
	font-size: 28rpx;
	color: #4b5563;
	font-weight: 600;
	line-height: 1.2;
	text-align: center;
	white-space: nowrap;
	font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
}

.table-cell text {
	font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
	font-size: 26rpx;
}

.status-tag {
	padding: 4rpx 12rpx;
	border-radius: 8rpx;
	font-size: 22rpx;
	display: inline-block;
	line-height: 1.4;
	text-align: center;
	min-width: 80rpx;
	font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
	font-weight: 500;
}

.status-dropdown text {
	margin-right: 8rpx;
	font-weight: 500;
	font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
}

.status-option text {
	font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
	font-size: 26rpx;
}

.segment-item text {
	font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
	font-size: 26rpx;
}

/* 操作类型标签样式 */
.status-tag.in {
	background-color: #ecfdf5;
	color: #059669;
	border: 1px solid #a7f3d0;
}

.status-tag.out {
	background-color: #fef2f2;
	color: #dc2626;
	border: 1px solid #fecaca;
}

.status-tag.add {
	background-color: #eff6ff;
	color: #2563eb;
	border: 1px solid #bfdbfe;
}

.status-tag.edit {
	background-color: #faf5ff;
	color: #9333ea;
	border: 1px solid #e9d5ff;
}

.status-tag.delete {
	background-color: #fef2f2;
	color: #dc2626;
	border: 1px solid #fecaca;
}

.dropdown-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 90;
}
</style>