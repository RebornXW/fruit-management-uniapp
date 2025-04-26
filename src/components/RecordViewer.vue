<template>
	<view class="record-viewer" @tap="onPageClick">
		<view class="record-viewer-fixed">
			<!-- 顶部空白区域 - 为挖孔屏预留空间 -->
			<view class="page-header">
				<!-- 保留白色标题栏，但不显示标题文字 -->
			</view>

			<!-- 搜索框和操作按钮 -->
			<view class="search-section">
				<view class="back-button" @tap="goBack">
					<text class="iconfont icon-left"></text>
				</view>
				<view class="app-search-box">
					<text class="iconfont icon-search app-search-icon"></text>
					<input
						v-model="searchKeyword"
						type="text"
						:placeholder="`搜索${title}...`"
						class="app-search-input"
						@input="filterRecords"
						@focus="handleFocus"
						@blur="handleBlur"
					/>
					<text v-if="searchKeyword" class="app-search-clear" @tap="searchKeyword = ''">×</text>
				</view>
				<view class="advanced-filter-button" @tap="showAdvancedFilter">
					<text class="iconfont icon-setting"></text>
				</view>
			</view>

			<!-- 简化筛选控制区域 -->
			<view class="simple-filter">
				<!-- 数据汇总 -->
				<view class="summary-item">
					<text class="summary-label">总计:</text>
					<text class="summary-value">{{filteredRecords.length}}条</text>
				</view>

				<!-- 时间范围快速选择 -->
				<view class="filter-tags">
					<view
						v-for="(option, index) in dateOptions"
						:key="index"
						class="filter-tag"
						:class="{'filter-tag-active': dateRange === option.value}"
						@tap="setDateRange(option.value)"
					>
						<text>{{option.label}}</text>
					</view>
				</view>

				<!-- 高级筛选按钮 -->
				<view class="filter-more-btn" @tap="showFilterPopup">
					<text class="iconfont icon-filter"></text>
					<text class="filter-more-text">筛选</text>
				</view>
			</view>

			<!-- 内容区域 -->
			<scroll-view
				scroll-y
				class="content-section"
				:show-scrollbar="false"
				:enhanced="true"
				:bounces="false"
			>
				<!-- 列表视图 -->
				<view class="table-content">
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
											<text class="iconfont" :class="sortOrder === 'asc' ? 'icon-arrow-up' : 'icon-arrow-down'"></text>
										</view>
									</view>
								</view>
							</view>
						</view>

						<!-- 表格内容 -->
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
										<block v-else-if="column.type === 'datetime'">
											<text class="block text-sm text-ellipsis">{{item[column.field]}} {{item[column.timeField]}}</text>
										</block>
										<block v-else-if="column.type === 'number'">
											<text class="block text-sm text-ellipsis">{{item[column.field]}}{{column.unit || ''}}</text>
										</block>
										<block v-else-if="column.type === 'price'">
											<text class="block text-sm price-text text-ellipsis">¥{{item[column.field]}}</text>
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

				<!-- 卡片视图 (保留但默认不显示) -->
				<view v-if="false" class="card-content">
					<view class="grid-cards">
						<view v-for="(item, index) in currentPageRecords" :key="index"
							class="record-card" @tap="showRecordDetail(item)">
							<view class="card-glow" :class="getCardGlowClass(item[cardStatusField])"></view>

							<view class="card-header">
								<view class="card-id">
									<text>{{cardNoPrefix}}{{item[cardNoField] || 'S' + item[cardDateField].replace(/-/g, '')}}</text>
								</view>
								<text class="card-date">{{item[cardDateField]}} {{item['time'] || ''}}</text>
							</view>

							<view class="card-title-row">
								<text class="card-title">{{item[cardTitleField]}}</text>
								<view class="status-tag" :class="getStatusTagClass(item[cardStatusField])">
									{{item[cardStatusField]}}
								</view>
							</view>

							<view class="card-divider"></view>

							<view class="card-content-row">
								<view class="card-content-main">
									<text class="card-product-name">
										<!-- 支持多字段内容显示 -->
										<template v-if="cardContentField.includes(',')">
											{{ cardContentField.split(',').map(field => item[field.trim()]).filter(Boolean).join(' ') }}
										</template>
										<template v-else>
											{{item[cardContentField]}}
										</template>
									</text>
									<text class="card-spec">{{item[cardSpecField] || '--'}}</text>
								</view>
								<view class="card-quantity-price">
									<text class="card-quantity">{{item[cardQuantityField]}}{{cardQuantityUnit}}</text>
									<text class="card-unit-price" v-if="showUnitPrice">¥{{item[cardUnitPriceField] || '--'}}{{cardUnitPriceUnit}}</text>
								</view>
							</view>

							<view class="card-divider"></view>

							<view class="card-footer">
								<text class="card-footer-label" v-if="cardFooterLabel">{{cardFooterLabel}}: {{item[cardFooterField]}}</text>
								<text class="card-price">¥{{item[cardPriceField]}}</text>
							</view>
						</view>
					</view>
				</view>
			</scroll-view>

			<!-- 分页控制 -->
			<view class="pagination">
				<view class="pagination-inner">
					<button class="page-btn prev-btn" :disabled="currentPage === 1" :class="{'disabled': currentPage === 1}" @tap="prevPage">
						<text class="iconfont icon-left"></text>
					</button>
					<view class="page-indicator">
						<view class="page-counter">
							<text class="page-current">{{currentPage}}</text>
							<text class="page-divider">/</text>
							<text class="page-total">{{totalPages}}</text>
						</view>
					</view>
					<button class="page-btn next-btn" :disabled="currentPage === totalPages" :class="{'disabled': currentPage === totalPages}" @tap="nextPage">
						<text class="iconfont icon-right"></text>
					</button>
				</view>
			</view>
		</view>

		<!-- 详情弹窗 -->
		<uni-popup ref="recordDetailPopup" type="bottom">
			<view class="app-popup-container">
				<view class="drag-handle"></view>

				<view class="app-popup-header">
					<text class="app-popup-title">{{detailTitle}}</text>
					<text class="app-popup-close" @tap="closeRecordDetail">×</text>
				</view>

				<view class="app-popup-content">
					<view class="detail-sections">
						<template v-for="(section, sectionIndex) in detailSections" :key="sectionIndex">
							<view v-if="shouldRenderSection(section)" class="detail-section">
								<view class="section-title">
									<text>{{section.title}}</text>
								</view>
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
												<text class="value price-text">¥{{selectedRecord[field.field] || '--'}}</text>
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
				<view class="button-container">
					<button class="app-cancel-btn" @tap="closeRecordDetail">关闭</button>
					<button v-if="showPrintButton" class="app-confirm-btn" @tap="printRecord">打印小票</button>
				</view>
			</view>
		</uni-popup>

		<!-- 高级筛选弹窗 -->
		<uni-popup ref="advancedFilterPopup" type="bottom">
			<view class="app-popup-container">
				<view class="drag-handle"></view>

				<view class="app-popup-header">
					<text class="app-popup-title">显示列设置</text>
					<text class="app-popup-close" @tap="closeAdvancedFilter">×</text>
				</view>

				<view class="app-popup-content">
					<view class="column-selector">
						<!-- 列选项 -->
						<view v-for="(column, index) in props.columns" :key="index" class="column-option">
							<checkbox :checked="columnVisibility.get(column.title)" @tap="toggleColumnVisibility(column)" color="#0D9488" />
							<text class="column-label">{{column.title}}</text>
						</view>
					</view>
				</view>

				<view class="button-container">
					<view class="button-wrapper">
						<button class="app-cancel-btn" @tap="toggleAllColumns">
							{{isAllSelected ? '取消全选' : '全选'}}
						</button>
					</view>
					<view class="button-wrapper">
						<button class="app-confirm-btn" @tap="applyColumnFilter">确定</button>
					</view>
				</view>
			</view>
		</uni-popup>

		<!-- 筛选条件弹窗 -->
		<uni-popup ref="filterPopup" type="bottom">
			<view class="app-popup-container">
				<view class="drag-handle"></view>

				<view class="app-popup-header">
					<text class="app-popup-title">筛选条件</text>
					<text class="app-popup-close" @tap="closeFilterPopup">×</text>
				</view>

				<view class="app-popup-content">
					<!-- 时间范围筛选 -->
					<view class="filter-section">
						<text class="filter-section-title">时间范围</text>
						<view class="filter-options">
							<view
								v-for="(option, index) in dateOptions"
								:key="index"
								class="filter-option"
								:class="{'filter-option-active': dateRange === option.value}"
								@tap="setDateRange(option.value)"
							>
								<text>{{option.label}}</text>
							</view>
						</view>
					</view>

					<!-- 状态筛选 -->
					<view class="filter-section">
						<text class="filter-section-title">{{getStatusLabel()}}</text>
						<view class="filter-options">
							<view
								class="filter-option"
								:class="{'filter-option-active': statusFilter === 'all'}"
								@tap="setStatusFilter('all')"
							>
								<text>全部</text>
							</view>
							<view
								v-for="(option, index) in props.statusOptions"
								:key="index"
								class="filter-option"
								:class="{'filter-option-active': statusFilter === option.value}"
								@tap="setStatusFilter(option.value)"
							>
								<text>{{option.label}}</text>
							</view>
						</view>
					</view>

					<!-- 子页面可以通过插槽添加更多筛选条件 -->
					<slot name="filter-content"></slot>
				</view>

				<view class="button-container">
					<view class="button-wrapper">
						<button class="app-cancel-btn" @tap="resetFilters">重置</button>
					</view>
					<view class="button-wrapper">
						<button class="app-confirm-btn" @tap="applyFilter">确定</button>
					</view>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import uniPopup from '@dcloudio/uni-ui/lib/uni-popup/uni-popup.vue';

// 定义事件
const emit = defineEmits(['search', 'status-filter', 'date-filter', 'page-change', 'refresh']);

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

	// 汇总配置 - 简化为只显示总计
});

// 视图状态
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

// 简化为只显示总计数量

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

// 过滤记录的方法 - 同时发射事件通知父组件
function filterRecords() {
	let filtered = [...props.records];
	console.log('原始记录数:', filtered.length);

	// 关键词筛选
	if (searchKeyword.value) {
		const keyword = searchKeyword.value.toLowerCase();

		// 发射搜索事件
		emit('search', searchKeyword.value);

		filtered = filtered.filter(record => {
			// 搜索所有字符串类型的字段
			return Object.entries(record).some(([_, value]) => {
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
		} else if (dateRange.value === 'year') {
			const yearStart = new Date(today.getFullYear(), 0, 1);
			const yearStartStr = yearStart.toISOString().split('T')[0];
			filtered = filtered.filter(record => {
				if (!record.date) return false;
				return record.date >= yearStartStr;
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
		console.log('总记录数:', filteredRecords.value.length);
	});
}

// 日期选项
const dateOptions = [
	{ label: '今日', value: 'today' },
	{ label: '本周', value: 'week' },
	{ label: '本月', value: 'month' },
	{ label: '今年', value: 'year' }
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

	// 准备日期范围数据
	let dateRangeData = null;

	if (dateRange.value !== 'all') {
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		if (dateRange.value === 'today') {
			const todayStr = today.toISOString().split('T')[0];
			dateRangeData = {
				startDate: todayStr,
				endDate: todayStr
			};
		} else if (dateRange.value === 'week') {
			// 计算本周一的日期
			const weekStart = new Date(today);
			const currentDay = today.getDay();
			const daysToSubtract = currentDay === 0 ? 6 : currentDay - 1;
			weekStart.setDate(today.getDate() - daysToSubtract);
			const weekStartStr = weekStart.toISOString().split('T')[0];
			const todayStr = today.toISOString().split('T')[0];

			dateRangeData = {
				startDate: weekStartStr,
				endDate: todayStr
			};
		} else if (dateRange.value === 'month') {
			// 计算本月初的日期
			const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
			const monthStartStr = monthStart.toISOString().split('T')[0];
			const todayStr = today.toISOString().split('T')[0];

			dateRangeData = {
				startDate: monthStartStr,
				endDate: todayStr
			};
		} else if (dateRange.value === 'year') {
			// 计算今年初的日期
			const yearStart = new Date(today.getFullYear(), 0, 1);
			const yearStartStr = yearStart.toISOString().split('T')[0];
			const todayStr = today.toISOString().split('T')[0];

			dateRangeData = {
				startDate: yearStartStr,
				endDate: todayStr
			};
		}
	}

	// 发射日期筛选事件
	emit('date-filter', dateRangeData);

	// 本地筛选
	filterRecords();
}

// 设置状态筛选
function setStatusFilter(status) {
	statusFilter.value = status;

	// 查找匹配的状态选项
	let statusData = null;
	if (status !== 'all') {
		const statusOption = props.statusOptions.find(option => option.value === status);
		if (statusOption) {
			statusData = statusOption;
		}
	}

	// 发射状态筛选事件
	emit('status-filter', statusData);

	// 本地筛选
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
		// 发射分页事件
		emit('page-change', currentPage.value);
	}
}

function nextPage() {
	if (currentPage.value < totalPages.value) {
		currentPage.value++;
		// 发射分页事件
		emit('page-change', currentPage.value);
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

// 获取状态标签类名
function getStatusTagClass(status) {
	// 特殊状态颜色处理
	if (status === '已付款') {
		return 'success';
	} else if (status === '未付款') {
		return 'danger';
	} else if (status === '部分付款') {
		return 'warning';
	} else if (status === '入库') {
		return 'in';
	} else if (status === '出库') {
		return 'out';
	}

	// 默认使用原来的逻辑
	const className = props.statusMap[status] ? props.statusMap[status].replace('bg-', '') : '';
	return className ? className : 'gray';
}

// 获取卡片发光效果类名
function getCardGlowClass(status) {
	if (status === '已付款') {
		return 'emerald-glow';
	} else if (status === '未付款') {
		return 'red-glow';
	} else if (status === '部分付款') {
		return 'amber-glow';
	} else if (status === '入库') {
		return 'emerald-glow';
	} else if (status === '出库') {
		return 'red-glow';
	}

	return 'gray-glow';
}

// 重置所有筛选条件
function resetFilters() {
	dateRange.value = 'all';
	statusFilter.value = 'all';
	searchKeyword.value = '';

	// 发射事件
	emit('date-filter', null);
	emit('status-filter', null);
	emit('search', '');

	// 重新筛选记录
	filterRecords();
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

// 筛选弹框相关逻辑
const filterPopup = ref(null);

function showFilterPopup() {
	filterPopup.value.open();
}

function closeFilterPopup() {
	filterPopup.value.close();
}

function applyFilter() {
	closeFilterPopup();
	filterRecords();
	emit('date-filter', dateRange.value);
	emit('status-filter', statusFilter.value);
}



// 监听页面点击
function onPageClick() {
	// 可以在这里添加其他需要处理的页面点击事件
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
/* 全局页面样式 */
.record-viewer {
	position: relative;
	width: 100%;
	height: 100vh;
	overflow: hidden;
	background-color: #FFFFFF; /* 使用纯白色背景 */
	display: flex;
	flex-direction: column;
	font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
}

.record-viewer-fixed {
	position: relative;
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
}

/* 顶部空白区域样式 - 为挖孔屏预留空间 */
.page-header {
	background-color: #FFFFFF;
	padding: 20rpx 30rpx;
	position: relative;
	overflow: hidden;
	z-index: 10;
	height: 44rpx; /* 为状态栏预留足够高度 */
}

/* 搜索框和按钮样式 */
.search-section {
	padding: 10rpx 30rpx;
	background-color: #FFFFFF;
	margin-bottom: 10rpx;
	display: flex;
	align-items: center;
	gap: 10rpx;
	box-sizing: border-box;
}

.back-button {
	width: 50rpx;
	height: 50rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.back-button .iconfont {
	font-size: 24rpx;
	color: #0D9488;
}

.app-search-box {
	flex: 1;
	display: flex;
	align-items: center;
	background-color: #F3F4F6;
	border-radius: 30rpx;
	padding: 0 16rpx;
	height: 50rpx;
	min-width: 0; /* 防止搜索框溢出 */
}

.app-search-icon {
	font-size: 22rpx;
	color: #6B7280;
	margin-right: 8rpx;
	flex-shrink: 0;
}

.app-search-input {
	flex: 1;
	font-size: 24rpx;
	height: 50rpx;
	color: #333333;
	min-width: 0; /* 防止输入框溢出 */
	width: 100%;
}

.app-search-clear {
	font-size: 22rpx;
	color: #6B7280;
	width: 30rpx;
	height: 30rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.advanced-filter-button {
	width: 50rpx;
	height: 50rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.advanced-filter-button .iconfont {
	font-size: 24rpx;
	color: #0D9488;
}

/* 简化筛选样式 */
.simple-filter {
	margin: 0 30rpx 10rpx;
	padding: 16rpx 20rpx;
	background-color: #FFFFFF;
	border-bottom: 1rpx solid #E5E7EB;
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.summary-item {
	display: flex;
	align-items: center;
	padding: 0 16rpx;
	border-right: 1rpx solid #E5E7EB;
	margin-right: 20rpx;
}

.summary-label {
	font-size: 26rpx;
	color: #4285F4;
	margin-right: 8rpx;
}

.summary-value {
	font-size: 26rpx;
	font-weight: 600;
	color: #4285F4;
}

.filter-tags {
	flex: 1;
	display: flex;
	align-items: center;
	overflow-x: auto;
	white-space: nowrap;
}

.filter-tag {
	padding: 8rpx 20rpx;
	background-color: #F3F4F6;
	border-radius: 24rpx;
	font-size: 24rpx;
	color: #666666;
	margin-right: 12rpx;
	transition: all 0.2s ease;
}

.filter-tag-active {
	background: linear-gradient(135deg, #4285F4, #3367D6);
	color: #FFFFFF;
	box-shadow: 0 2rpx 4rpx rgba(66, 133, 244, 0.3);
}

.filter-more-btn {
	display: flex;
	align-items: center;
	padding: 8rpx 20rpx;
	background-color: rgba(142, 154, 175, 0.1);
	border-radius: 24rpx;
	margin-left: 16rpx;
}

.filter-more-btn .iconfont {
	font-size: 24rpx;
	color: #8E9AAF;
	margin-right: 6rpx;
}

.filter-more-text {
	font-size: 24rpx;
	color: #8E9AAF;
}

/* 筛选弹框样式 */
.filter-section {
	margin-bottom: 24rpx;
}

.filter-section-title {
	font-size: 26rpx;
	font-weight: 600;
	color: #333333;
	margin-bottom: 16rpx;
}

.filter-options {
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx;
}

.filter-option {
	padding: 10rpx 24rpx;
	background-color: #F3F4F6;
	border-radius: 30rpx;
	font-size: 26rpx;
	color: #666666;
	transition: all 0.2s ease;
	margin-bottom: 10rpx;
	margin-right: 10rpx;
}

.filter-option-active {
	background: linear-gradient(135deg, #4285F4, #3367D6);
	color: #FFFFFF;
	box-shadow: 0 2rpx 6rpx rgba(66, 133, 244, 0.3);
}

.filter-row {
	flex: 1;
	overflow-x: auto;
}

.filter-tags {
	display: flex;
	align-items: center;
	white-space: nowrap;
	padding: 0 4rpx;
}

.filter-tag {
	padding: 6rpx 16rpx;
	background-color: #F3F4F6;
	border-radius: 20rpx;
	font-size: 22rpx;
	color: #6B7280;
	margin-right: 8rpx;
	transition: all 0.2s ease;
}

.filter-tag-active {
	background: linear-gradient(135deg, #0D9488, #14B8A6);
	color: #FFFFFF;
	box-shadow: 0 2rpx 4rpx rgba(13, 148, 136, 0.2);
}

.filter-divider {
	width: 1rpx;
	height: 24rpx;
	background-color: #E5E7EB;
	margin: 0 8rpx;
}

.filter-reset-tag {
	padding: 6rpx 12rpx;
	background-color: rgba(13, 148, 136, 0.1);
	border-radius: 20rpx;
	font-size: 22rpx;
	color: #0D9488;
	margin-right: 8rpx;
}

.summary-item {
	padding: 0 10rpx;
	border-left: 1rpx solid #E5E7EB;
}

.summary-value {
	font-size: 22rpx;
	font-weight: 600;
	color: #0D9488;
}

/* 内容区样式 */
.content-section {
	flex: 1;
	margin: 0 30rpx 10rpx;
	background-color: #FFFFFF;
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
	background-color: #FFFFFF;
	border-bottom: 1px solid #E5E7EB;
	position: sticky;
	top: 0;
	left: 0;
	z-index: 10;
	width: max-content;
}

.table-header-column {
	flex-shrink: 0;
	padding: 12rpx 8rpx;
	min-height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border-right: 1rpx solid rgba(0, 0, 0, 0.05);
}

.table-header-column:last-child {
	border-right: none;
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
	background-color: rgba(13, 148, 136, 0.05);
}

.column-title-container {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: center;
	width: 100%;
}

.column-title {
	font-size: 24rpx;
	color: #333333;
	font-weight: 600;
	line-height: 1.2;
	text-align: center;
	white-space: nowrap;
}

.sort-icon {
	margin-left: 4rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.sort-icon .iconfont {
	font-size: 22rpx;
	color: #0D9488;
}

.table-body {
	width: max-content;
}

.table-row {
	display: flex;
	flex-direction: row;
	border-bottom: 1px solid #F3F4F6;
	min-height: 60rpx;
	padding: 8rpx 0;
	width: max-content;
	transition: all 0.2s ease;
}

.table-row:active {
	background-color: #F9FAFB;
}

.table-cell {
	flex-shrink: 0;
	padding: 0 8rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: 36rpx;
	font-size: 24rpx;
	color: #333333;
	border-right: 1rpx solid #F3F4F6;
}

.table-cell:last-child {
	border-right: none;
}

.bg-white {
	background-color: #ffffff;
}

.bg-gray-50 {
	background-color: #f9fafb;
}

.price-text {
	color: #0D9488;
	font-weight: 600;
}

/* 卡片视图样式 */
.grid-cards {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(320rpx, 1fr));
	gap: 20rpx;
	padding: 20rpx;
}

.record-card {
	background-color: rgba(255, 255, 255, 0.9);
	border-radius: 16rpx;
	padding: 24rpx;
	box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
	border: 1rpx solid rgba(255, 255, 255, 0.3);
	backdrop-filter: blur(5rpx);
	-webkit-backdrop-filter: blur(5rpx);
	display: flex;
	flex-direction: column;
	position: relative;
	overflow: hidden;
	transition: all 0.2s ease;
}

.record-card:active {
	transform: scale(0.98);
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.card-glow {
	position: absolute;
	width: 150rpx;
	height: 150rpx;
	border-radius: 50%;
	filter: blur(30rpx);
	opacity: 0.5;
	top: -50rpx;
	right: -50rpx;
	z-index: 0;
}

.emerald-glow {
	background: rgba(16, 185, 129, 0.6);
}

.amber-glow {
	background: rgba(245, 158, 11, 0.6);
}

.red-glow {
	background: rgba(239, 68, 68, 0.6);
}

.gray-glow {
	background: rgba(156, 163, 175, 0.6);
}

.card-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 16rpx;
	position: relative;
	z-index: 1;
}

.card-id {
	font-size: 24rpx;
	color: #6B7280;
}

.card-date {
	font-size: 24rpx;
	color: #6B7280;
}

.card-title-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 16rpx;
	position: relative;
	z-index: 1;
}

.card-title {
	font-size: 30rpx;
	font-weight: 600;
	color: #333333;
}

.card-divider {
	height: 1px;
	background-color: rgba(0, 0, 0, 0.05);
	margin: 16rpx 0;
	position: relative;
	z-index: 1;
}

.card-content-row {
	display: flex;
	justify-content: space-between;
	margin: 16rpx 0;
	position: relative;
	z-index: 1;
}

.card-content-main {
	flex: 1;
	display: flex;
	flex-direction: column;
}

.card-product-name {
	font-size: 28rpx;
	color: #333333;
	margin-bottom: 8rpx;
}

.card-spec {
	font-size: 24rpx;
	color: #6B7280;
}

.card-quantity-price {
	display: flex;
	flex-direction: column;
	align-items: flex-end;
}

.card-quantity {
	font-size: 28rpx;
	font-weight: 600;
	color: #333333;
	margin-bottom: 8rpx;
}

.card-unit-price {
	font-size: 24rpx;
	color: #6B7280;
}

.card-footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
	position: relative;
	z-index: 1;
}

.card-footer-label {
	font-size: 24rpx;
	color: #6B7280;
}

.card-price {
	font-size: 30rpx;
	font-weight: 600;
	color: #0D9488;
}

/* 状态标签样式 */
.status-tag {
	padding: 6rpx 16rpx;
	border-radius: 30rpx;
	font-size: 22rpx;
	display: inline-block;
	line-height: 1.4;
	text-align: center;
	min-width: 80rpx;
	font-weight: 500;
	position: relative;
	overflow: hidden;
	box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
}

.status-tag::before {
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	height: 1rpx;
	background: rgba(255, 255, 255, 0.7);
}

.status-tag.success {
	background: linear-gradient(135deg, #34A853, #0F9D58);
	color: white;
}

.status-tag.warning {
	background: linear-gradient(135deg, #FBBC05, #F9AB00);
	color: white;
}

.status-tag.danger {
	background: linear-gradient(135deg, #EA4335, #C5221F);
	color: white;
}

.status-tag.gray {
	background: linear-gradient(135deg, #9CA3AF, #6B7280);
	color: white;
}

.status-tag.in {
	background: linear-gradient(135deg, #34A853, #0F9D58);
	color: white;
}

.status-tag.out {
	background: linear-gradient(135deg, #4285F4, #3367D6);
	color: white;
}

/* 分页控制样式 */
.pagination {
	background-color: #FFFFFF;
	padding: 12rpx 0;
	margin: 0 30rpx 10rpx;
	border-top: 1rpx solid #E5E7EB;
}

.pagination-inner {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0 20rpx;
}

.page-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 60rpx;
	height: 60rpx;
	border-radius: 30rpx;
	font-size: 24rpx;
	color: #FFFFFF;
	border: none;
	background: linear-gradient(135deg, #4285F4, #3367D6);
	box-shadow: 0 2rpx 6rpx rgba(66, 133, 244, 0.3);
	transition: all 0.2s ease;
}

.page-btn.disabled {
	opacity: 0.5;
	background: #E5E7EB;
	color: #9CA3AF;
	box-shadow: none;
}

.page-btn:active:not(.disabled) {
	transform: translateY(2rpx);
	box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
}

.page-indicator {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.page-counter {
	display: flex;
	align-items: center; /* 改为center确保垂直居中 */
	justify-content: center; /* 水平居中 */
	padding: 4rpx 16rpx;
	border-radius: 6rpx;
	background-color: rgba(66, 133, 244, 0.1);
	border: 1px solid rgba(66, 133, 244, 0.2);
}

.page-current {
	color: #4285F4;
	font-weight: bold;
	font-size: 28rpx;
	line-height: 1; /* 添加行高确保文本对齐 */
}

.page-divider {
	color: #4285F4;
	margin: 0 6rpx;
	font-size: 22rpx;
	line-height: 1; /* 添加行高确保文本对齐 */
}

.page-total {
	color: #4285F4;
	font-size: 24rpx;
	line-height: 1; /* 添加行高确保文本对齐 */
}

.prev-btn, .next-btn {
	min-width: 60rpx;
}

/* 弹窗样式 */
.app-popup-container {
	border-radius: 32rpx 32rpx 0 0;
	background-color: #FFFFFF;
	max-height: 80vh;
	overflow-y: auto;
	width: 100%;
	box-shadow: 0 -8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.drag-handle {
	width: 60rpx;
	height: 6rpx;
	background-color: #E2E8F0;
	border-radius: 3rpx;
	margin: 16rpx auto;
}

.app-popup-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 24rpx 30rpx;
	border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);
}

.app-popup-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333333;
}

.app-popup-close {
	font-size: 32rpx;
	color: #EA4335;
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
	background-color: rgba(234, 67, 53, 0.1);
}

.app-popup-content {
	padding: 30rpx;
}

/* 详情部分样式 */
.detail-section {
	margin-bottom: 30rpx;
	background-color: rgba(249, 250, 251, 0.6);
	border-radius: 16rpx;
	padding: 24rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.03);
	border: 1rpx solid rgba(0, 0, 0, 0.03);
}

.section-title {
	font-size: 28rpx;
	font-weight: 600;
	color: #4285F4;
	margin-bottom: 16rpx;
	padding-bottom: 10rpx;
	border-bottom: 1px solid rgba(66, 133, 244, 0.1);
	display: flex;
	align-items: center;
}

.section-title::before {
	content: '';
	display: inline-block;
	width: 8rpx;
	height: 28rpx;
	background: linear-gradient(to bottom, #4285F4, #3367D6);
	border-radius: 4rpx;
	margin-right: 12rpx;
}

.section-content {
	margin-top: 16rpx;
}

.detail-item {
	display: flex;
	justify-content: space-between;
	padding: 12rpx 0;
	align-items: center;
	border-bottom: 1rpx solid rgba(0, 0, 0, 0.03);
}

.detail-item:last-child {
	border-bottom: none;
}

.remark-item {
	flex-direction: column;
	align-items: flex-start;
}

.label {
	font-size: 26rpx;
	color: #6B7280;
	margin-right: 16rpx;
}

.value {
	font-size: 26rpx;
	color: #333333;
	text-align: right;
	font-weight: 500;
}

.full-width {
	width: 100%;
	margin-top: 10rpx;
	text-align: left;
	line-height: 1.5;
	white-space: pre-wrap;
	background-color: #FFFFFF;
	padding: 16rpx;
	border-radius: 8rpx;
	border: 1rpx solid rgba(0, 0, 0, 0.05);
}

/* 按钮样式 */
.button-container {
	display: flex;
	gap: 20rpx;
	padding: 30rpx;
	margin-top: 20rpx;
	border-top: 1rpx solid rgba(0, 0, 0, 0.05);
	align-items: center; /* 确保垂直居中对齐 */
	justify-content: space-between; /* 确保水平均匀分布 */
}

.app-confirm-btn {
	width: 50%;
	height: 90rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 30rpx;
	color: #FFFFFF;
	background: linear-gradient(135deg, #4285F4, #3367D6);
	border-radius: 45rpx;
	box-shadow: 0 4rpx 12rpx rgba(66, 133, 244, 0.3);
	border: none;
	font-weight: 500;
	transition: all 0.2s ease;
}

.app-confirm-btn:active {
	transform: translateY(2rpx);
	box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.05);
}

.app-cancel-btn {
	width: 50%;
	height: 90rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 30rpx;
	color: #6B7280;
	background-color: #F3F4F6;
	border-radius: 45rpx;
	border: none;
	font-weight: 500;
	transition: all 0.2s ease;
}

.app-cancel-btn:active {
	transform: translateY(2rpx);
	background-color: #E5E7EB;
}

/* 按钮包装器，确保按钮完全对齐 */
.button-wrapper {
	width: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.button-wrapper button {
	width: 100%;
}

/* 高级筛选样式 */
.column-selector {
	display: flex;
	flex-direction: column;
	gap: 24rpx;
}

.column-option {
	display: flex;
	align-items: center;
	gap: 16rpx;
	padding: 12rpx 0;
	border-bottom: 1rpx solid rgba(0, 0, 0, 0.03);
}

.column-option:last-child {
	border-bottom: none;
}

.column-label {
	font-size: 28rpx;
	color: #333333;
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
	color: #9CA3AF;
}

.text-emerald-600 {
	color: #0D9488;
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

.mt-1 {
	margin-top: 8rpx;
}

.mt-2 {
	margin-top: 16rpx;
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

.block {
	display: block;
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