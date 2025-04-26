<template>
	<view class="page-container" @tap="handlePageClick">
		<!-- 顶部白色栏 -->
		<view class="page-header">
			<view class="page-title">库存管理</view>
		</view>

		<!-- 搜索框和操作按钮 -->
		<view class="search-section">
			<view class="app-search-box app-search-box-header">
				<text class="iconfont icon-search app-search-icon"></text>
				<input v-model="searchText" type="text" placeholder="搜索水果名称或规格..." class="app-search-input" />
				<text v-if="searchText" class="app-search-clear" @tap="searchText = ''">×</text>
			</view>
			<view class="header-actions">
				<button class="app-add-btn" @tap="showAddRecord">
					<text class="iconfont icon-clipboard"></text>
				</button>
				<button class="app-add-btn" @tap="showAddFruit">
					<text class="iconfont icon-add"></text>
				</button>
			</view>
		</view>

		<!-- 库存数据统计卡片 - 新设计 -->
		<view class="stats-container">
			<view class="stats-wrapper">
				<!-- 库存总量卡片 - 新布局 -->
				<view class="stat-card">
					<view class="stat-header">
						<text class="stat-title">库存总量</text>
						<view class="stat-icon-wrapper blue">
							<text class="iconfont icon-star"></text>
						</view>
					</view>
					<view class="stat-value-container">
						<text class="stat-value">{{totalStock}}</text>
						<text class="stat-unit">箱</text>
					</view>
				</view>

				<!-- 今日入库卡片 - 新布局 -->
				<view class="stat-card">
					<view class="stat-header">
						<text class="stat-title">今日入库</text>
						<view class="stat-icon-wrapper green">
							<text class="iconfont icon-arrow-down"></text>
						</view>
					</view>
					<view class="stat-value-container">
						<text class="stat-value">{{todayIn}}</text>
						<text class="stat-unit">箱</text>
					</view>
				</view>

				<!-- 今日出库卡片 - 新布局 -->
				<view class="stat-card">
					<view class="stat-header">
						<text class="stat-title">今日出库</text>
						<view class="stat-icon-wrapper red">
							<text class="iconfont icon-arrow-up"></text>
						</view>
					</view>
					<view class="stat-value-container">
						<text class="stat-value">{{todayOut}}</text>
						<text class="stat-unit">箱</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 内容区标题栏 - 新设计 -->
		<view class="content-header">
			<view class="content-header-left">
				<view class="section-indicator"></view>
				<text class="list-title">库存水果列表</text>
			</view>
			<view class="list-actions">
				<button class="filter-button" @tap.stop="toggleFilterPopup">
					<text class="iconfont icon-filter"></text>
					<text class="filter-text">筛选</text>
				</button>
			</view>
		</view>

		<!-- 添加筛选条件弹出层 -->
		<view class="filter-popup" v-if="showFilter" @tap.stop>
			<view class="filter-header">
				<text class="filter-title">筛选条件</text>
				<text class="filter-close" @tap.stop="toggleFilterPopup">✕</text>
			</view>
			<view class="filter-content">
				<view class="filter-item">
					<text class="filter-label">水果品类</text>
					<picker @change="onFilterCategoryChange" :value="filterCategoryIndex" :range="fruitCategories" class="filter-picker">
						<view class="picker-text">{{fruitCategories[filterCategoryIndex]}}</view>
					</picker>
				</view>
				<view class="filter-item">
					<text class="filter-label">水果品种</text>
					<picker @change="onFilterVarietyChange" :value="filterVarietyIndex" :range="filteredVarieties" class="filter-picker">
						<view class="picker-text">{{filteredVarieties[filterVarietyIndex]}}</view>
					</picker>
				</view>
				<view class="filter-actions">
					<button class="filter-reset-btn" @tap.stop="resetFilters">重置</button>
					<button class="filter-apply-btn" @tap.stop="applyFilters">应用</button>
				</view>
			</view>
		</view>

		<!-- 内容区 - 库存列表 -->
		<scroll-view
			scroll-y
			class="content-section"
			@tap.stop="closeAllMoreActions"
			:show-scrollbar="false"
			:enhanced="true"
			:bounces="false"
		>
			<view class="fruit-list">
				<!-- 水果列表 -->
				<view
					v-for="fruit in filteredFruits"
					:key="fruit.id"
					class="fruit-card"
					@tap.stop
				>
					<view class="fruit-info">
						<view class="fruit-image-container">
							<image :src="fruit.image" :alt="fruit.name" class="fruit-image"></image>
						</view>
						<view class="fruit-details">
							<view class="fruit-header">
								<text class="fruit-name">{{fruit.name}}</text>
							</view>
							<view class="fruit-info-row">
								<text class="fruit-spec">{{fruit.spec}}</text>
								<view class="fruit-stock" :class="getStockLevelClass(fruit.stock)">
									<text class="stock-value">{{fruit.stock}}</text>
									<text class="stock-unit">箱</text>
								</view>
							</view>
						</view>
					</view>
					<view class="fruit-actions">
						<view class="action-row">
							<button class="action-btn in-btn" @tap.stop="showInventoryOperation('in', fruit)">
								<text class="iconfont icon-arrow-down action-icon"></text>入库
							</button>
							<button class="action-btn out-btn" @tap.stop="showInventoryOperation('out', fruit)">
								<text class="iconfont icon-arrow-up action-icon"></text>出库
							</button>
							<button class="action-btn more-btn" @tap.stop="toggleMoreActions(fruit)">
								<text class="iconfont icon-more action-icon"></text>
							</button>
						</view>

						<!-- 更多操作浮层 -->
						<view class="more-actions-popup" v-if="fruit.showMoreActions" @tap.stop>
							<view class="more-action" @tap.stop="showEditFruit(fruit)">
								<text class="iconfont icon-edit more-action-icon"></text>
								<text class="more-action-text">编辑</text>
							</view>
							<view class="more-action" @tap.stop="confirmDelete(fruit)">
								<text class="iconfont icon-delete more-action-icon"></text>
								<text class="more-action-text">删除</text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>

		<!-- 入库/出库操作弹窗 -->
		<uni-popup ref="inventoryPopup" type="bottom" :mask-click="true" :animation="true">
			<view class="app-popup-container">
				<view class="app-popup-header">
					<text class="app-popup-title">{{operationType === 'in' ? '入库操作' : '出库操作'}}</text>
					<text class="app-popup-close" @tap="closePopup('inventory')">✕</text>
				</view>
				<view class="app-popup-content">
					<view class="selected-fruit">
						<text class="selected-name">{{currentFruit.name}}</text>
						<text class="selected-spec">{{currentFruit.spec}}</text>
						<view class="selected-stock">
							<text class="current-stock">当前库存: {{currentFruit.stock}}箱</text>
						</view>
					</view>
					<view class="app-form-item">
						<text class="app-form-label">操作数量 (箱)</text>
						<view class="app-quantity-control">
							<button class="app-quantity-btn app-quantity-btn-minus" @tap="decrementQuantity">-</button>
							<input
								type="number"
								v-model="operationQuantity"
								class="app-quantity-input"
								:class="operationType === 'in' ? 'in-text' : 'out-text'"
							/>
							<button class="app-quantity-btn app-quantity-btn-plus" @tap="incrementQuantity">+</button>
						</view>
					</view>
					<view class="app-form-item">
						<text class="app-form-label">备注</text>
						<textarea v-model="operationRemark" placeholder="添加备注信息" class="app-textarea"></textarea>
					</view>
					<button
						class="app-confirm-btn"
						:class="operationType === 'in' ? 'in-confirm' : 'out-confirm'"
						@tap="confirmOperation"
					>
						确认{{operationType === 'in' ? '入库' : '出库'}}
					</button>
				</view>
			</view>
		</uni-popup>

		<!-- 编辑水果弹窗 -->
		<uni-popup ref="editFruitPopup" type="bottom">
			<view class="app-popup-container">
				<view class="app-popup-header">
					<text class="app-popup-title">{{isAddingFruit ? '新增水果' : '编辑水果'}}</text>
					<text class="app-popup-close" @tap="closePopup('edit')">✕</text>
				</view>
				<scroll-view scroll-y class="app-popup-content" :style="{ height: '75vh' }" :show-scrollbar="false" :enhanced="true">
					<view class="form-content">
						<view class="app-form-item">
							<text class="app-form-label">品牌 <text class="app-required">*</text></text>
							<input v-model="editForm.brand" placeholder="请输入品牌" class="app-input" :disabled="!isAddingFruit" />
							<text v-if="!isAddingFruit" class="app-form-tip">品牌不可修改</text>
						</view>
						<view class="app-form-item">
							<text class="app-form-label">水果品类 <text class="app-required">*</text></text>
							<picker @change="onCategoryChange" :value="categoryIndex" :range="fruitCategories" class="app-picker" :disabled="!isAddingFruit">
								<view class="app-picker-text" :class="{'app-picker-disabled': !isAddingFruit}">{{fruitCategories[categoryIndex]}}</view>
							</picker>
							<text v-if="!isAddingFruit" class="app-form-tip">水果品类不可修改</text>
						</view>
						<view class="app-form-item">
							<text class="app-form-label">水果品种 <text class="app-required">*</text></text>
							<picker @change="onVarietyChange" :value="varietyIndex" :range="fruitVarieties" class="app-picker" :disabled="!isAddingFruit">
								<view class="app-picker-text" :class="{'app-picker-disabled': !isAddingFruit}">{{fruitVarieties[varietyIndex]}}</view>
							</picker>
							<text v-if="!isAddingFruit" class="app-form-tip">水果品种不可修改</text>
						</view>
						<view class="app-form-item">
							<text class="app-form-label">规格型号 <text class="app-required">*</text></text>
							<input v-model="editForm.spec" placeholder="请输入规格型号" class="app-input" :disabled="!isAddingFruit" />
							<text v-if="!isAddingFruit" class="app-form-tip">规格型号不可修改</text>
						</view>
						<view class="app-form-item">
							<text class="app-form-label">包装类型</text>
							<picker @change="onPackageTypeChange" :value="packageTypeIndex" :range="packageTypes" class="app-picker">
								<view class="app-picker-text">{{packageTypes[packageTypeIndex]}}</view>
							</picker>
						</view>
						<view class="app-form-item">
							<text class="app-form-label">重量 (斤)</text>
							<input type="number" v-model="editForm.weight" placeholder="请输入重量" class="app-input" />
						</view>
						<view class="app-form-item">
							<text class="app-form-label">参考价格区间</text>
							<view class="app-price-range">
								<input type="number" v-model="editForm.minPrice" placeholder="最低价" class="app-price-input" />
								<text class="app-price-separator">-</text>
								<input type="number" v-model="editForm.maxPrice" placeholder="最高价" class="app-price-input" />
								<text class="app-price-unit">元</text>
							</view>
							<text class="app-form-tip">不填则默认为0</text>
						</view>
						<view class="app-form-item" v-if="isAddingFruit">
							<text class="app-form-label">初始库存</text>
							<input type="number" v-model="editForm.stock" placeholder="请输入初始库存" class="app-input" />
						</view>
						<view class="app-form-item">
							<text class="app-form-label">上传图片</text>
							<view class="upload-container">
								<view class="image-preview" v-if="editForm.image">
									<image :src="editForm.image" mode="aspectFill" class="preview-image"></image>
									<text class="delete-image" @tap="deleteImage">×</text>
								</view>
								<view class="upload-btn" @tap="chooseImage" v-else>
									<text class="iconfont icon-camera"></text>
									<text class="upload-text">上传图片</text>
								</view>
							</view>
						</view>
						<view class="button-container">
							<button class="app-confirm-btn" @tap="confirmEditFruit">
								确认{{isAddingFruit ? '添加' : '编辑'}}
							</button>
						</view>
					</view>
				</scroll-view>
			</view>
		</uni-popup>

		<!-- 删除确认弹窗 -->
		<uni-popup ref="deletePopup" type="dialog">
			<uni-popup-dialog
				:type="'warning'"
				:title="'删除确认'"
				:content="'确定要删除' + currentFruit.name + '吗？'"
				:before-close="true"
				@confirm="confirmDeleteFruit"
				@close="closePopup('delete')"
			></uni-popup-dialog>
		</uni-popup>

		<!-- 使用系统原生TabBar，无需自定义组件 -->
	</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import fruitService from '@/services/fruitService.js';
import inventoryRecordService from '@/services/inventoryRecordService.js';

import statisticsService from '@/services/statisticsService.js';

// 数据
const searchText = ref('');
const fruitData = ref([]);
const currentFruit = ref({});
const operationType = ref('in'); // 'in' 或 'out'
const operationQuantity = ref(1);
const operationRemark = ref('');
const currentDate = ref('');
const packageTypes = ['箱装', '框装'];
const packageTypeIndex = ref(0);
const fruitCategories = ref([]);
const categoryIndex = ref(0);
const fruitVarieties = ref([]);
const varietyIndex = ref(0);
// 存储完整的分类及品种数据
const categoryVarietyData = ref([]);
// 数据加载状态标志，避免重复加载
const isLoading = ref(false);
const lastLoadTime = ref(0);
const editForm = ref({
	id: null,
	brand: '',
	category: '',
	variety: '',
	spec: '',
	weight: '',
	stock: 0,
	image: '',
	minPrice: '',
	maxPrice: ''
});
const isAddingFruit = ref(false);
const totalStock = ref(0);
const todayIn = ref(0);
const todayOut = ref(0);

// 筛选相关数据
const showFilter = ref(false);
const filterCategoryIndex = ref(0);
const filterVarietyIndex = ref(0);
const filteredVarieties = ref(['全部']);
const appliedFilters = ref({
	category: '全部',
	variety: '全部'
});

// 总库存、今日入库、今日出库数据从API获取，不再使用计算属性

// 过滤后的水果数据
const filteredFruits = computed(() => {
	let result = fruitData.value;

	// 打印原始数据以便调试
	console.log('原始水果数据:', result.map(f => ({ id: f.id, name: f.name, category: f.category, variety: f.variety })));
	console.log('当前筛选条件:', appliedFilters.value);

	// 应用筛选条件
	if (appliedFilters.value.category !== '全部') {
		// 使用更宽松的匹配方式，允许部分匹配
		result = result.filter(fruit => {
			const match = fruit.category && (
				fruit.category === appliedFilters.value.category ||
				fruit.category.includes(appliedFilters.value.category) ||
				appliedFilters.value.category.includes(fruit.category)
			);
			console.log(`水果 ID: ${fruit.id}, 名称: ${fruit.name}, 品类: ${fruit.category}, 筛选品类: ${appliedFilters.value.category}, 匹配结果: ${match}`);
			return match;
		});
	}

	if (appliedFilters.value.variety !== '全部') {
		// 使用更宽松的匹配方式，允许部分匹配
		result = result.filter(fruit => {
			const match = fruit.variety && (
				fruit.variety === appliedFilters.value.variety ||
				fruit.variety.includes(appliedFilters.value.variety) ||
				appliedFilters.value.variety.includes(fruit.variety)
			);
			console.log(`水果 ID: ${fruit.id}, 名称: ${fruit.name}, 品种: ${fruit.variety}, 筛选品种: ${appliedFilters.value.variety}, 匹配结果: ${match}`);
			return match;
		});
	}

	// 应用搜索文本 - 只搜索name和spec属性
	if (searchText.value) {
		const keyword = searchText.value.toLowerCase();
		result = result.filter(fruit => {
			// 确保name和spec属性存在，并且转为小写进行比较，提高搜索准确性
			const nameMatch = fruit.name && fruit.name.toLowerCase().includes(keyword);
			const specMatch = fruit.spec && fruit.spec.toLowerCase().includes(keyword);
			return nameMatch || specMatch;
		});
	}

	return result;
});

// 根据库存量返回不同的样式类
function getStockLevelClass(stock) {
	if (stock <= 0) {
		return 'stock-empty';
	} else if (stock <= 10) {
		return 'stock-low';
	} else if (stock <= 50) {
		return 'stock-medium';
	} else {
		return 'stock-high';
	}
}

// 获取弹窗组件引用
const inventoryPopup = ref(null);
const editFruitPopup = ref(null);
const deletePopup = ref(null);



// 显示入库/出库操作弹窗
function showInventoryOperation(type, fruit) {
	// 先关闭所有其他水果的操作菜单
	closeAllMoreActions();

	operationType.value = type;
	currentFruit.value = fruit;
	operationQuantity.value = 1;
	operationRemark.value = '';
	inventoryPopup.value.open();
}

// 显示编辑水果弹窗
function showEditFruit(fruit) {
	// 先关闭所有其他水果的操作菜单
	closeAllMoreActions();

	// 显示加载中提示
	uni.showLoading({ title: '加载中...' });

	// 从后端获取最新的水果信息
	fruitService.getFruitById(fruit.id)
		.then(latestFruit => {
			uni.hideLoading();

			// 处理返回的数据，将下划线命名转换为驼峰命名
			const processedFruit = {
				...latestFruit,
				packageType: latestFruit.package_type,
				minPrice: latestFruit.min_price,
				maxPrice: latestFruit.max_price
			};

			isAddingFruit.value = false;
			currentFruit.value = processedFruit;

			// 设置品类索引
			const categoryIdx = fruitCategories.value.indexOf(processedFruit.category);
			categoryIndex.value = categoryIdx !== -1 ? categoryIdx : 0;

			// 更新品种列表
			updateVarietiesByCategory(fruitCategories.value[categoryIndex.value]);

			// 设置品种索引
			const varietyIdx = fruitVarieties.value.indexOf(processedFruit.variety);
			varietyIndex.value = varietyIdx !== -1 ? varietyIdx : 0;

			editForm.value = {
				id: processedFruit.id,
				brand: processedFruit.brand,
				category: processedFruit.category,
				variety: processedFruit.variety,
				spec: processedFruit.spec,
				weight: processedFruit.weight,
				stock: processedFruit.stock,
				image: processedFruit.image,
				minPrice: processedFruit.minPrice || '',
				maxPrice: processedFruit.maxPrice || ''
			};
			packageTypeIndex.value = packageTypes.indexOf(processedFruit.packageType);
			editFruitPopup.value.open();
		})
		.catch(err => {
			uni.hideLoading();
			uni.showToast({
				title: '获取水果信息失败，请重试',
				icon: 'none'
			});
			console.error('获取水果信息失败:', err);
		});
}

// 显示新增水果弹窗
function showAddFruit() {
	// 先关闭所有其他水果的操作菜单
	closeAllMoreActions();

	isAddingFruit.value = true;
	editForm.value = {
		id: null,
		brand: '',
		category: fruitCategories.value[0],
		variety: fruitVarieties.value[0],
		spec: '',
		weight: '',
		stock: 0,
		image: '',
		minPrice: '',
		maxPrice: ''
	};
	packageTypeIndex.value = 0;
	categoryIndex.value = 0;
	updateVarietiesByCategory(fruitCategories.value[0]);
	varietyIndex.value = 0;
	editFruitPopup.value.open();
}

// 显示删除确认弹窗
function confirmDelete(fruit) {
	// 先关闭所有其他水果的操作菜单
	closeAllMoreActions();

	currentFruit.value = fruit;
	deletePopup.value.open();
}

// 关闭弹窗
function closePopup(type) {
	if (type === 'inventory') {
		inventoryPopup.value.close();
	} else if (type === 'edit') {
		editFruitPopup.value.close();
	} else if (type === 'delete') {
		deletePopup.value.close();
	}
}

// 减少操作数量
function decrementQuantity() {
	if (operationQuantity.value > 1) {
		operationQuantity.value--;
	}
}

// 增加操作数量
function incrementQuantity() {
	operationQuantity.value++;
}

// 确认入库/出库操作
function confirmOperation() {
	// 显示加载中提示
	uni.showLoading({ title: '处理中...' });

	// 获取当前登录用户信息
	const token = uni.getStorageSync('token');
	if (!token) {
		uni.hideLoading();
		uni.showToast({ title: '请先登录', icon: 'none' });
		return;
	}


	const operatorId = uni.getStorageSync('loginUser')?.id;
	const operationTypeText = operationType.value === 'in' ? '入库' : '出库';

	// 调用库存记录服务添加记录
	inventoryRecordService.addInventoryRecord(
		operationType.value,
		currentFruit.value,
		parseInt(operationQuantity.value),
		operationRemark.value,
		operatorId
	)
		.then(() => {
			uni.hideLoading();
			// API返回成功
			uni.showToast({ title: operationTypeText + '成功', icon: 'success' });
			// 直接重新加载水果数据和库存统计信息，强制刷新
			loadFruitData(true);
			// 通知其他页面刷新
			uni.$emit('pageRefresh');
			// 关闭弹窗
			closePopup('inventory');
		})
		.catch(err => {
			uni.hideLoading();
			// 显示错误信息
			uni.showToast({
				title: err.message || operationTypeText + '失败，请重试',
				icon: 'none'
			});
			console.error('库存操作失败:', err);

			// 即使失败也刷新数据，确保UI与后端状态一致
			setTimeout(() => {
				loadFruitData(true);
			}, 1000);
		});
}

// 包装类型选择
function onPackageTypeChange(e) {
	packageTypeIndex.value = e.detail.value;
}

// 选择图片
function chooseImage() {
	uni.chooseImage({
		count: 1,
		sizeType: ['compressed'],
		sourceType: ['album', 'camera'],
		success: (res) => {
			editForm.value.image = res.tempFilePaths[0];
		}
	});
}

// 删除图片
function deleteImage() {
	// 将图片设置为空，保存时会根据水果品类自动选择默认图片
	editForm.value.image = '';

	// 显示提示
	uni.showToast({
		title: '已删除图片，保存后将使用默认图片',
		icon: 'none',
		duration: 2000
	});
}

// 确认编辑/新增水果
function confirmEditFruit() {
	// 表单验证
	if (!editForm.value.brand || !editForm.value.category || !editForm.value.variety || !editForm.value.spec) {
		uni.showToast({ title: '请填写必填项', icon: 'none' });
		return;
	}

	// 显示加载中提示
	uni.showLoading({ title: '处理中...' });

	// 准备数据
	const minPrice = editForm.value.minPrice === '' ? 0 : parseInt(editForm.value.minPrice);
	const maxPrice = editForm.value.maxPrice === '' ? 0 : parseInt(editForm.value.maxPrice);
	const payload = {
		brand: editForm.value.brand,
		name: `${editForm.value.brand} ${editForm.value.variety}`,
		category: editForm.value.category,
		variety: editForm.value.variety,
		spec: editForm.value.spec,
		packageType: packageTypes[packageTypeIndex.value],
		weight: parseFloat(editForm.value.weight) || 0,
		minPrice: minPrice,
		maxPrice: maxPrice,
		image: editForm.value.image || fruitService.getDefaultFruitImage(editForm.value.category),
		status: 1
	};

	// 如果是新增水果且有初始库存，添加到payload
	if (isAddingFruit.value && editForm.value.stock > 0) {
		payload.stock = parseInt(editForm.value.stock);
	}



	if (isAddingFruit.value) {
		// 新增水果
		fruitService.createFruit(payload)
			.then(() => {
				uni.hideLoading();
				uni.showToast({ title: '添加成功', icon: 'success' });
				closePopup('edit');
				loadFruitData(true);



				// 通知其他页面刷新
				uni.$emit('pageRefresh');
			})
			.catch(err => {
				uni.hideLoading();
				uni.showToast({
					title: err.message || '添加失败，请重试',
					icon: 'none'
				});
				console.error('添加水果失败:', err);

				// 即使失败也刷新数据，确保UI与后端状态一致
				setTimeout(() => {
					loadFruitData(true);
				}, 1000);
			});
	} else {
		// 编辑水果
		// 更新水果信息
		fruitService.updateFruit(editForm.value.id, payload)
			.then(() => {
				uni.hideLoading();
				uni.showToast({ title: '编辑成功', icon: 'success' });
				closePopup('edit');
				loadFruitData(true);

				// 通知其他页面刷新
				uni.$emit('pageRefresh');
			})
			.catch(err => {
				uni.hideLoading();
				uni.showToast({
					title: err.message || '编辑失败，请重试',
					icon: 'none'
				});
				console.error('编辑水果失败:', err);

				// 即使失败也刷新数据，确保UI与后端状态一致
				setTimeout(() => {
					loadFruitData(true);
				}, 1000);
			});
	}
}

// 显示/隐藏更多操作
function toggleMoreActions(fruit) {
	// 先关闭所有其他水果的操作菜单
	fruitData.value.forEach(item => {
		if(item !== fruit) {
			item.showMoreActions = false;
		}
	});
	// 切换当前水果的更多操作菜单显示状态
	fruit.showMoreActions = !fruit.showMoreActions;
}

// 点击页面其他区域时关闭所有操作菜单
function closeAllMoreActions() {
	fruitData.value.forEach(item => {
		item.showMoreActions = false;
	});
}

// 处理页面点击事件
function handlePageClick() {
	// 关闭所有更多操作菜单
	closeAllMoreActions();

	// 关闭筛选弹窗
	if (showFilter.value) {
		showFilter.value = false;
	}
}

// 页面加载时获取数据
onMounted(() => {
	// 设置当前日期
	const now = new Date();
	currentDate.value = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;

	// 加载水果数据，首次加载使用强制刷新
	loadFruitData(true);

	// 通知报价页面刷新数据
	setTimeout(() => {
		uni.$emit('refreshPricePage');
	}, 100);

	// 触发tabChange事件以更新底部导航状态
	setTimeout(() => {
		uni.$emit('tabChange');
		console.log('库存页面触发tabChange事件');
	}, 200);

	// 监听页面显示事件
	uni.$on('onShow', () => {
		console.log('库存页面显示');

		// 判断是否需要重新加载数据
		// 如果距离上次加载时间超过 10 秒，才重新加载
		const now = Date.now();
		if (now - lastLoadTime.value > 10000) { // 10秒以上才重新加载
			console.log('距离上次加载时间超过 10 秒，重新加载数据');
			loadFruitData(true); // 使用强制刷新
		} else {
			console.log('距离上次加载时间太短，不重新加载');
		}

		// 触发tabChange事件
		uni.$emit('tabChange');
	});

	// 监听分类数据加载完成事件
	uni.$on('categoriesDataLoaded', (data) => {
		console.log('收到分类数据加载完成事件');
		// 处理分类数据
		processCategoriesData(data);
	});
});

// 监听页面刷新事件
uni.$on('pageRefresh', () => {
	console.log('库存页面收到刷新事件');

	// 判断是否需要重新加载数据
	// 如果正在加载中，则跳过
	if (isLoading.value) {
		console.log('正在加载中，跳过刷新请求');
		return;
	}

	// 如果距离上次加载时间超过 2 秒，才重新加载
	const now = Date.now();
	if (now - lastLoadTime.value > 2000) { // 2秒以上才重新加载
		console.log('距离上次加载时间超过 2 秒，重新加载数据');
		loadFruitData(true); // 使用强制刷新
	} else {
		console.log('距离上次加载时间太短，不重新加载');
	}
});

// 页面卸载时移除事件监听
uni.$on('beforeDestroy', () => {
	uni.$off('pageRefresh');
	uni.$off('onShow');
	uni.$off('categoriesDataLoaded');
});

// 库存统计数据缓存
const statisticsCache = {
	data: null,
	timestamp: 0,
	expirationTime: 5 * 60 * 1000 // 5分钟缓存过期时间
};

// 加载库存统计数据
function loadInventoryStatistics(forceRefresh = false) {
	console.log('加载库存统计数据, forceRefresh:', forceRefresh);

	// 检查缓存是否有效，如果不是强制刷新，则可以使用缓存
	const now = Date.now();
	if (!forceRefresh && statisticsCache.data && (now - statisticsCache.timestamp) < statisticsCache.expirationTime) {
		console.log('使用缓存的库存统计数据');
		// 使用缓存数据
		totalStock.value = statisticsCache.data.totalStock;
		todayIn.value = statisticsCache.data.todayIn;
		todayOut.value = statisticsCache.data.todayOut;
		return Promise.resolve(statisticsCache.data);
	}

	// 使用API 9.2 获取库存统计数据
	// 可以添加查询参数，如当前日期等
	const today = new Date();
	const year = today.getFullYear();
	const month = String(today.getMonth() + 1).padStart(2, '0');
	const day = String(today.getDate()).padStart(2, '0');
	const formattedDate = `${year}-${month}-${day}`;

	const params = {
		start_date: formattedDate,
		end_date: formattedDate,
		period: 'day'
	};

	return statisticsService.getInventoryStatistics(params)
		.then(data => {
			console.log('获取库存统计数据成功:', data);

			// 更新缓存
			statisticsCache.data = data;
			statisticsCache.timestamp = now;

			// 更新库存统计数据
			totalStock.value = data.totalStock;
			todayIn.value = data.todayIn;
			todayOut.value = data.todayOut;

			return data;
		})
		.catch(err => {
			console.error('获取库存统计数据失败:', err);
			// 返回默认数据，确保Promise链不会中断
			return {
				totalStock: totalStock.value || 0,
				todayIn: todayIn.value || 0,
				todayOut: todayOut.value || 0
			};
		});
}

// 加载水果数据和库存统计信息
function loadFruitData(forceRefresh = false) {
	// 防止重复加载，如果正在加载中，直接返回
	if (isLoading.value && !forceRefresh) {
		console.log('数据正在加载中，跳过重复请求');
		return;
	}

	// 防止短时间内重复加载，如果距离上次加载不足 2 秒，直接返回
	// 但如果强制刷新，则忽略时间限制
	const now = Date.now();
	if (now - lastLoadTime.value < 2000 && !forceRefresh) { // 2秒内不重复加载
		console.log('距离上次加载时间太短，跳过重复请求');
		return;
	}

	// 设置加载状态和时间
	isLoading.value = true;
	lastLoadTime.value = now;

	// 显示加载中提示
	uni.showLoading({ title: '加载中...' });

	// 如果是强制刷新，清除统计数据缓存
	if (forceRefresh) {
		console.log('强制刷新，清除统计数据缓存');
		// 清除缓存，确保下次调用loadInventoryStatistics时会重新获取数据
		statisticsCache.data = null;
		statisticsCache.timestamp = 0;
	}

	// 创建一个Promise数组，同时加载水果数据和库存统计数据
	const promises = [
		// 根据API文档，水果列表默认包含库存数量
		// 如果是强制刷新，则不使用缓存
		fruitService.getFruits({}, forceRefresh),

		// 加载库存统计数据，如果是强制刷新，则也强制刷新库存统计数据
		loadInventoryStatistics(forceRefresh)
	];

	// 使用Promise.all同时处理两个请求
	Promise.all(promises)
		.then(([fruitsRes, statsRes]) => {
			// 处理水果数据和库存统计数据
			// 打印原始响应数据，便于调试
			console.log('获取到的原始水果数据:', fruitsRes);
			console.log('获取到的库存统计数据:', statsRes);

			// 注意：库存统计数据已在loadInventoryStatistics内部处理，这里不需要重复处理
			// 只需处理水果数据
			processAndUpdateFruitData(fruitsRes);
		})
		.catch(err => {
			uni.hideLoading();
			uni.showToast({
				title: '加载数据失败，请重试',
				icon: 'none'
			});
			console.error('加载数据失败:', err);
		})
		.finally(() => {
			// 无论成功失败，都重置加载状态
			isLoading.value = false;
		});
}

// 处理和更新水果数据的辅助函数
function processAndUpdateFruitData(res) {
	// 处理返回的水果数据，兼容不同的响应格式
	let fruits = [];

	// 如果是数组，直接使用
	if (Array.isArray(res)) {
		fruits = res;
		console.log('数据是数组格式');
	}
	// 如果是对象，并且有items属性，使用items
	else if (res && typeof res === 'object' && res.items) {
		fruits = res.items;
		console.log('数据是分页对象格式，使用items属性');
	}
	// 如果是对象，并且有data属性
	else if (res && typeof res === 'object' && res.data) {
		// 如果data是数组，直接使用
		if (Array.isArray(res.data)) {
			fruits = res.data;
			console.log('数据在data属性中，是数组格式');
		}
		// 如果data是对象，并且有items属性
		else if (typeof res.data === 'object' && res.data.items) {
			fruits = res.data.items;
			console.log('数据在data.items属性中');
		}
	}

	console.log('处理后的水果数据:', fruits);

	// 确保水果数据是数组
	if (!Array.isArray(fruits)) {
		console.error('处理后的水果数据仍然不是数组:', fruits);
		fruits = [];
	}

	// 对每个水果添加显示属性
	fruitData.value = fruits.map(fruit => ({
		...fruit,
		showMoreActions: false, // 控制更多操作菜单的显示
		// 确保图片路径正确
		image: fruit.image || fruitService.getDefaultFruitImage(fruit.category),
		// 确保库存数量存在，根据API文档，直接使用inventory字段
		stock: fruit.inventory || fruit.stock || 0
	}));

	// 隐藏加载提示
	uni.hideLoading();

	// 加载分类及其品种数据
	loadCategoriesWithVarieties();
}

// 加载水果分类及其品种数据
function loadCategoriesWithVarieties() {
	// 显示加载中提示
	uni.showLoading({ title: '加载分类数据...' });

	// 首先检查全局变量中是否有数据
	const app = getApp();
	if (app && app.globalData && app.globalData.categoriesWithVarieties) {
		console.log('使用全局变量中的分类及品种数据');
		processCategoriesData(app.globalData.categoriesWithVarieties);
		uni.hideLoading();
		return;
	}

	// 使用API 3.17获取分类及其品种数据
	// 使用缓存数据，不强制刷新，减少请求次数
	fruitService.getCategoriesWithVarieties(false)
		.then(res => {
			uni.hideLoading();
			processCategoriesData(res);
		})
		.catch(err => {
			uni.hideLoading();
			console.error('获取水果分类及品种失败:', err);

			// 如果获取失败，回退到使用旧的方式获取分类和品种
			const categories = Array.from(new Set(fruitData.value.map(f => f.category))).filter(Boolean);
			fruitCategories.value = ['全部', ...categories];
			updateVarietiesByCategory(fruitCategories.value[filterCategoryIndex.value]);
		});
}

// 处理分类数据的辅助函数
function processCategoriesData(res) {
	console.log('获取到的分类及品种数据:', res);

	// 处理返回的数据，兼容不同的响应格式
	let categoriesData = [];

	// 如果是数组，直接使用
	if (Array.isArray(res)) {
		categoriesData = res;
	}
	// 如果是对象，并且有data属性
	else if (res && typeof res === 'object' && res.data) {
		// 如果data是数组，直接使用
		if (Array.isArray(res.data)) {
			categoriesData = res.data;
		}
		// 如果data是对象，并且有items属性
		else if (typeof res.data === 'object' && res.data.items) {
			categoriesData = res.data.items;
		}
	}

	console.log('处理后的分类数据:', categoriesData);

	// 确保分类数据是数组
	if (!Array.isArray(categoriesData)) {
		console.error('处理后的分类数据仍然不是数组:', categoriesData);
		categoriesData = [];
	}

	// 存储完整的分类及品种数据，便于后续使用
	categoryVarietyData.value = categoriesData;

	// 提取品类名称列表
	const categories = categoriesData.map(item => {
		// 如果是字符串，直接使用
		if (typeof item === 'string') {
			return item;
		}
		// 如果是对象，使用name属性
		else if (typeof item === 'object' && item !== null) {
			return item.name || item.category_name || '';
		}
		return '';
	}).filter(name => name); // 过滤掉空值

	console.log('提取后的品类名称列表:', categories);

	// 更新品类列表
	fruitCategories.value = ['全部', ...categories];

	// 更新品种列表
	updateVarietiesByCategory(fruitCategories.value[filterCategoryIndex.value]);
}

// 添加盘库功能函数
function showAddRecord() {
	// 显示提示框，告知用户盘库功能正在开发中
	uni.showToast({
		title: '盘库功能正在开发中...',
		icon: 'none',
		duration: 2000
	});
}

// 水果品类选择
function onCategoryChange(e) {
	// 如果是编辑模式，不允许更改
	if (!isAddingFruit.value) {
		uni.showToast({
			title: '编辑模式下不能更改品类',
			icon: 'none'
		});
		return;
	}

	categoryIndex.value = e.detail.value;
	// 根据选择的品类更新品种列表
	updateVarietiesByCategory(fruitCategories.value[categoryIndex.value]);
	// 重置品种索引
	varietyIndex.value = 0;
	// 更新表单中的品类
	editForm.value.category = fruitCategories.value[categoryIndex.value];
	// 更新表单中的品种
	editForm.value.variety = fruitVarieties.value[0];
}

// 水果品种选择
function onVarietyChange(e) {
	// 如果是编辑模式，不允许更改
	if (!isAddingFruit.value) {
		uni.showToast({
			title: '编辑模式下不能更改品种',
			icon: 'none'
		});
		return;
	}

	varietyIndex.value = e.detail.value;
	// 更新表单中的品种
	editForm.value.variety = fruitVarieties.value[varietyIndex.value];
}

// 根据品类更新品种列表
function updateVarietiesByCategory(category) {
	// 如果选择的是全部，则从本地数据中获取所有品种
	if (category === '全部') {
		const list = Array.from(new Set(fruitData.value.map(f => f.variety)));
		fruitVarieties.value = list;
		filteredVarieties.value = ['全部', ...list];
		return;
	}

	// 如果有完整的分类及品种数据，则从中获取对应的品种列表
	if (categoryVarietyData.value && categoryVarietyData.value.length > 0) {
		console.log('从完整数据中获取品种列表，当前品类:', category);

		// 查找对应的品类数据
		const categoryData = categoryVarietyData.value.find(item => {
			const categoryName = item.name || item.category_name || '';
			return categoryName === category;
		});

		console.log('找到的品类数据:', categoryData);

		// 如果找到了对应的品类数据，并且有品种列表
		if (categoryData && categoryData.varieties && Array.isArray(categoryData.varieties)) {
			// 提取品种名称列表
			const varieties = categoryData.varieties.map(item => {
				// 如果是字符串，直接使用
				if (typeof item === 'string') {
					return item;
				}
				// 如果是对象，使用name属性
				else if (typeof item === 'object' && item !== null) {
					return item.name || item.variety_name || '';
				}
				return '';
			}).filter(name => name); // 过滤掉空值

			console.log('提取后的品种名称列表:', varieties);

			// 更新品种列表
			fruitVarieties.value = varieties;
			filteredVarieties.value = ['全部', ...varieties];
			return;
		}
	}

	// 如果没有完整数据或者没有找到对应的品类数据，则从 API 获取
	uni.showLoading({ title: '加载品种...' });

	// 构造查询参数
	const params = { category_name: category };

	fruitService.getVarieties(params)
		.then(res => {
			uni.hideLoading();
			console.log('从 API 获取到的原始品种数据:', res);

			// 处理返回的品种数据，兼容不同的响应格式
			let varietiesData = [];

			// 如果是数组，直接使用
			if (Array.isArray(res)) {
				varietiesData = res;
			}
			// 如果是对象，并且有data属性
			else if (res && typeof res === 'object' && res.data) {
				// 如果data是数组，直接使用
				if (Array.isArray(res.data)) {
					varietiesData = res.data;
				}
				// 如果data是对象，并且有items属性
				else if (typeof res.data === 'object' && res.data.items) {
					varietiesData = res.data.items;
				}
			}

			console.log('处理后的品种原始数据:', varietiesData);

			// 确保品种数据是数组
			if (!Array.isArray(varietiesData)) {
				console.error('处理后的品种数据仍然不是数组:', varietiesData);
				varietiesData = [];
			}

			// 根据API文档中的格式提取品种名称
			const varieties = varietiesData.map(item => {
				// 如果是字符串，直接使用
				if (typeof item === 'string') {
					return item;
				}
				// 如果是对象，使用name属性
				else if (typeof item === 'object' && item !== null) {
					return item.name || item.variety_name || '';
				}
				return '';
			}).filter(name => name); // 过滤掉空值

			console.log('提取后的品种名称列表:', varieties);

			// 更新品种列表
			fruitVarieties.value = varieties;
			filteredVarieties.value = ['全部', ...varieties];
		})
		.catch(err => {
			uni.hideLoading();
			console.error('获取水果品种失败:', err);

			// 如果 API 请求失败，回退到从本地数据获取品种
			const list = Array.from(new Set(fruitData.value.filter(f => f.category === category).map(f => f.variety)));
			fruitVarieties.value = list;
			filteredVarieties.value = ['全部', ...list];
		});
}

// 筛选条件变更
function onFilterCategoryChange(e) {
	filterCategoryIndex.value = e.detail.value;
	const sel = fruitCategories.value[filterCategoryIndex.value];
	appliedFilters.value.category = sel;
	updateVarietiesByCategory(sel);
	filterVarietyIndex.value = 0;
	appliedFilters.value.variety = '全部';
}

function onFilterVarietyChange(e) {
	filterVarietyIndex.value = e.detail.value;
	const sel = filteredVarieties.value[filterVarietyIndex.value];
	appliedFilters.value.variety = sel;
}

// 删除重复的函数

// 删除重复的onMounted函数

// 显示/隐藏筛选弹窗
function toggleFilterPopup() {
	// 先关闭所有更多操作菜单
	closeAllMoreActions();

	// 如果要显示筛选弹窗，确保品种列表与当前选择的品类一致
	if (!showFilter.value) {
		// 更新品种列表
		updateVarietiesByCategory(fruitCategories.value[filterCategoryIndex.value]);
	}

	showFilter.value = !showFilter.value;
}

// 重置筛选条件
function resetFilters() {
	// 重置为第一个选项，即“全部”
	filterCategoryIndex.value = 0;
	filterVarietyIndex.value = 0;

	// 确保品种列表也重置为全部
	filteredVarieties.value = ['全部'];

	appliedFilters.value = {
		category: '全部',
		variety: '全部'
	};

	// 更新筛选后的水果列表
	applyFilters();
}

// 应用筛选条件
function applyFilters() {
	appliedFilters.value = {
		category: fruitCategories.value[filterCategoryIndex.value],
		variety: filteredVarieties.value[filterVarietyIndex.value]
	};

	// 关闭筛选弹窗
	showFilter.value = false;
}

// 确认删除水果
function confirmDeleteFruit() {
	// 显示加载中提示
	uni.showLoading({ title: '处理中...' });

	// 直接执行删除操作
	fruitService.deleteFruit(currentFruit.value.id)
		.then(() => {
			uni.hideLoading();
			uni.showToast({ title: '删除成功', icon: 'success' });

			// 重新加载数据，强制刷新
			loadFruitData(true);

			// 通知其他页面刷新
			uni.$emit('pageRefresh');

			// 关闭弹窗
			closePopup('delete');
		})
		.catch(err => {
			uni.hideLoading();
			uni.showToast({
				title: err.message || '删除失败，请重试',
				icon: 'none'
			});
			console.error('删除水果失败:', err);

			// 即使失败也刷新数据，确保UI与后端状态一致
			setTimeout(() => {
				loadInventoryStatistics();
				loadFruitData(true);
			}, 1000);

			// 关闭弹窗
			closePopup('delete');
		});
}

// 使用fruitService中的getDefaultFruitImage方法替代原来的getDefaultImageByCategory函数
</script>

<style>

/* 全局页面样式，防止整体滑动 */
page {
	height: 100%;
	overflow: hidden;
	position: relative;
}

.page-container {
	display: flex;
	flex-direction: column;
	height: 100vh;
	padding-bottom: 120rpx; /* 增加底部导航栏留出空间 */
	background: #F1F5F9; /* 统一使用这一种浅灰蓝色背景 */
	font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
	overflow: hidden; /* 防止整个页面滚动 */
	position: relative;
}

/* 搜索区域样式 */
.search-section {
	padding: 20rpx 30rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 20rpx;
	background-color: rgba(255, 255, 255, 0.8);
	backdrop-filter: blur(15px);
	-webkit-backdrop-filter: blur(15px);
	border-bottom: 1px solid rgba(0, 0, 0, 0.03);
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.03);
}

/* 使用统一搜索框样式 */



.header-actions {
	display: flex;
	gap: 12rpx;
}

.header-btn {
	width: 70rpx;
	height: 70rpx;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: rgba(255, 255, 255, 0.15);
	border: none;
	padding: 0;
	margin: 0;
	height: 100%;
	border: none;
	position: relative;
}

.header-btn::after {
	border: none;
}

.header-btn .iconfont {
	font-size: 32rpx;
	color: white;
}

.record-btn {
	background-color: rgba(255, 255, 255, 0.15);
}

/* 使用统一新增按钮样式 */

/* 统计卡片新样式 */
.stats-container {
	padding: 20rpx 20rpx;
	margin-bottom: 0;
	box-sizing: border-box;
}

.stats-wrapper {
	display: flex;
	justify-content: space-between;
	gap: 16rpx;
	width: 100%;
	margin: 0 auto;
	max-width: 100%;
	padding: 0;
	box-sizing: border-box;
}

.stat-card {
	flex: 1;
	display: flex;
	flex-direction: column;
	background-color: #FFFFFF;
	border-radius: 16rpx;
	padding: 16rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
	position: relative;
	overflow: hidden;
	border: 1rpx solid #E2E8F0;
}

.stat-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 8rpx;
}

.stat-icon-wrapper {
	width: 36rpx;
	height: 36rpx;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
	position: relative;
	overflow: hidden;
}

.stat-icon-wrapper::after {
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	height: 1rpx;
	background: rgba(255, 255, 255, 0.5);
}

.stat-icon-wrapper .iconfont {
	font-size: 20rpx;
	color: #FFFFFF;
}

.blue {
	background: linear-gradient(to bottom, #3B82F6, #2563EB);
}

.green {
	background: linear-gradient(to bottom, #10B981, #059669);
}

.red {
	background: linear-gradient(to bottom, #EF4444, #DC2626);
}

.stat-title {
	font-size: 24rpx;
	color: #6B7280;
	font-weight: 500;
}

.stat-value-container {
	display: flex;
	align-items: baseline;
	margin-top: 4rpx;
}

.stat-value {
	font-size: 40rpx;
	font-weight: 600;
	color: #111827;
	line-height: 1;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	max-width: 90%;
}

.stat-unit {
	font-size: 22rpx;
	color: #6B7280;
	margin-left: 4rpx;
}

/* 内容标题栏样式 - 新设计 */
.content-header {
	padding: 24rpx 24rpx 16rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	position: relative;
	background-color: #FFFFFF; /* 纯白色背景 */
	border-bottom: 1rpx solid #E2E8F0;
	margin-top: 16rpx;
	border-radius: 16rpx 16rpx 0 0;
	margin-left: 20rpx;
	margin-right: 20rpx;
	box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.03);
	box-sizing: border-box;
	width: calc(100% - 40rpx); /* 确保宽度正确 */
}

.content-header-left {
	display: flex;
	align-items: center;
}

.section-indicator {
	width: 4rpx;
	height: 28rpx;
	background: linear-gradient(to bottom, #3B82F6, #2563EB);
	border-radius: 2rpx;
	margin-right: 12rpx;
}

.list-title {
	font-size: 28rpx;
	color: #1E293B;
	font-weight: 600;
	letter-spacing: 0.5rpx;
}

.list-actions {
	display: flex;
	align-items: center;
}

.filter-button {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(to bottom, #FFFFFF, #F8FAFC);
	border: 1rpx solid #E2E8F0;
	border-radius: 28rpx;
	padding: 0 20rpx;
	height: 56rpx;
	box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.03);
	transition: all 0.2s ease;
	line-height: 1;
}

.filter-button:active {
	transform: scale(0.98);
	background: linear-gradient(to bottom, #F8FAFC, #F1F5F9);
}

.filter-button::after {
	border: none;
}

.filter-button .iconfont {
	font-size: 24rpx;
	color: #3B82F6;
	margin-right: 8rpx;
}

.filter-text {
	font-size: 24rpx;
	color: #334155;
	font-weight: 500;
}

/* 内容区 */
.content-section {
	flex: 1;
	margin-bottom: 120rpx; /* 增加底部空间 */
	height: calc(100vh - 420rpx); /* 设置固定高度，减去头部、统计面板、标题栏和底部导航的高度 */
	overflow: hidden; /* 防止内容溢出 */
	background-color: #FFFFFF; /* 纯白色背景 */
	margin-left: 20rpx;
	margin-right: 20rpx;
	border-radius: 0 0 16rpx 16rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
	padding: 0; /* 确保没有内边距 */
	width: calc(100% - 40rpx); /* 确保宽度正确 */
	box-sizing: border-box;
}

.fruit-list {
	padding: 20rpx 10rpx 120rpx; /* 减少左右内边距 */
	display: flex;
	flex-direction: column;
	align-items: center; /* 水平居中 */
	width: 100%; /* 确保宽度正确 */
	box-sizing: border-box;
}

.fruit-card {
	background: #F9FAFC; /* 修改为略带灰色的白色背景 */
	border-radius: 12rpx;
	overflow: hidden;
	margin-bottom: 16rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05); /* 稍微增强阴影效果 */
	border: 1rpx solid #E2E8F0;
	width: 100%; /* 使用100%宽度 */
	max-width: 680rpx; /* 减小最大宽度，确保有边距 */
	box-sizing: border-box;
}

.fruit-card:active {
	background-color: #F1F5F9; /* 修改为更深一点的灰色，增强点击反馈 */
	transform: scale(0.995);
}

.fruit-info {
	display: flex;
	padding: 20rpx;
}

.fruit-image-container {
	width: 120rpx;
	height: 120rpx;
	border-radius: 12rpx;
	overflow: hidden;
	background-color: #F3F4F6;
	box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
	flex-shrink: 0;
}

.fruit-image {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.fruit-details {
	flex: 1;
	margin-left: 20rpx;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
}

.fruit-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 8rpx;
}

.fruit-name {
	font-size: 30rpx;
	font-weight: bold;
	color: #1F2937;
	flex: 1;
	margin-right: 12rpx;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.fruit-spec {
	font-size: 24rpx;
	color: #6B7280;
	background-color: #F9FAFB;
	padding: 6rpx 14rpx;
	border-radius: 8rpx;
	display: inline-block;
	max-width: 60%;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.fruit-stock {
	padding: 6rpx 12rpx;
	border-radius: 6rpx;
	display: inline-flex;
	align-items: center;
	font-size: 22rpx;
	font-weight: 500;
	box-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.05);
	position: relative;
	overflow: hidden;
}

.fruit-stock::before {
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	height: 1rpx;
	background: rgba(255, 255, 255, 0.7);
}

.stock-value {
	margin-right: 2rpx;
	font-weight: 600;
}

.stock-unit {
	font-size: 18rpx;
	opacity: 0.9;
}

.stock-normal {
	background: linear-gradient(to bottom, #10B981, #059669);
	color: white;
}

.stock-low {
	background: linear-gradient(to bottom, #F59E0B, #D97706);
	color: white;
}

.stock-critical {
	background: linear-gradient(to bottom, #EF4444, #DC2626);
	color: white;
}

.stock-empty {
	background: linear-gradient(to bottom, #9CA3AF, #6B7280);
	color: white;
}

.stock-medium {
	background: linear-gradient(to bottom, #38BDF8, #0284C7);
	color: white;
}

.stock-high {
	background: linear-gradient(to bottom, #60A5FA, #2563EB);
	color: white;
}

.fruit-actions {
	position: relative;
	border-top: 1rpx solid #F3F4F6;
}

.action-row {
	display: flex;
	height: 80rpx;
	border: none;
}

.action-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 26rpx;
	background: transparent;
	border-radius: 0;
	transition: all 0.2s;
	padding: 0;
	margin: 0;
	height: 100%;
	border: none;
	position: relative;
}

.action-btn::after {
	border: none;
}

.action-btn:not(:last-child)::after {
	content: "";
	position: absolute;
	right: 0;
	top: 25%;
	bottom: 25%;
	width: 1rpx;
	background-color: #EDF2F7;
	display: block;
}

.in-btn, .out-btn {
	flex: 2;
}

.in-btn {
	color: #047857;
}

.out-btn {
	color: #DC2626;
}

.more-btn {
	flex: 1;
	color: #6B7280;
}

.action-icon {
	margin-right: 8rpx;
	font-size: 24rpx;
}

/* 更多操作浮层样式 */
.more-actions-popup {
	position: absolute;
	bottom: 90rpx;
	right: 10rpx;
	background-color: white;
	border-radius: 12rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.15);
	z-index: 10;
	overflow: hidden;
	width: 200rpx;
}

.more-action {
	display: flex;
	align-items: center;
	padding: 20rpx 24rpx;
	transition: background-color 0.2s;
}

.more-action:active {
	background-color: #F9FAFB;
}

.more-action:not(:last-child) {
	border-bottom: 1rpx solid #F3F4F6;
}

.more-action-icon {
	margin-right: 12rpx;
	font-size: 28rpx;
}

.more-action-text {
	font-size: 26rpx;
	color: #374151;
}

/* 使用统一弹窗样式 */

.form-content {
	padding-bottom: 50rpx;
}

.button-container {
	margin-top: 30rpx;
	padding-bottom: 30rpx;
}

.selected-fruit {
	background-color: #F9FAFB;
	padding: 24rpx;
	border-radius: 16rpx;
	margin-bottom: 30rpx;
}

.selected-name {
	font-size: 30rpx;
	font-weight: bold;
	color: #1F2937;
}

.selected-spec {
	font-size: 24rpx;
	color: #6B7280;
	margin-top: 8rpx;
}

.selected-stock {
	margin-top: 16rpx;
}

.current-stock {
	font-size: 22rpx;
	background-color: #E6FFFA;
	color: #0D9488;
	padding: 6rpx 16rpx;
	border-radius: 999rpx;
	display: inline-block;
}

/* 使用统一表单样式 */

.in-text {
	color: #047857;
}

.out-text {
	color: #DC2626;
}

/* 使用统一按钮样式 */

.in-confirm {
	background: linear-gradient(135deg, #059669, #047857);
	box-shadow: 0 4rpx 12rpx rgba(4, 120, 87, 0.2);
}

.out-confirm {
	background: linear-gradient(135deg, #EF4444, #DC2626);
	box-shadow: 0 4rpx 12rpx rgba(220, 38, 38, 0.2);
}

.primary-btn {
	background: linear-gradient(135deg, #0D9488, #0F766E);
	box-shadow: 0 4rpx 12rpx rgba(13, 148, 136, 0.2);
}

/* 使用统一表单样式 */

.upload-container {
	width: 100%;
	display: flex;
	justify-content: flex-start;
}

.image-preview {
	position: relative;
	width: 160rpx;
	height: 160rpx;
	border-radius: 12rpx;
	overflow: hidden;
}

.preview-image {
	width: 100%;
	height: 100%;
}

.delete-image {
	position: absolute;
	top: 0;
	right: 0;
	width: 40rpx;
	height: 40rpx;
	background-color: rgba(0, 0, 0, 0.5);
	color: white;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 24rpx;
	border-bottom-left-radius: 12rpx;
}

.upload-btn {
	width: 160rpx;
	height: 160rpx;
	background-color: #F9FAFB;
	border-radius: 12rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}

.upload-text {
	font-size: 24rpx;
	color: #6B7280;
	margin-top: 8rpx;
}

/* 筛选弹窗样式 */
.filter-popup {
	position: absolute;
	top: 90rpx; /* 将位置往下调整了一点 */
	right: 20rpx;
	background-color: white;
	z-index: 110;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.15);
	border-radius: 16rpx;
	overflow: hidden;
	width: 320rpx;
}

.filter-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 12rpx 16rpx;
	border-bottom: 1rpx solid #F3F4F6;
}

.filter-title {
	font-size: 24rpx;
	font-weight: bold;
	color: #1F2937;
}

.filter-close {
	font-size: 24rpx;
	color: #9CA3AF;
	padding: 6rpx;
}

.filter-content {
	padding: 12rpx 16rpx 16rpx;
}

.filter-item {
	margin-bottom: 12rpx;
}

.filter-label {
	font-size: 22rpx;
	color: #4B5563;
	margin-bottom: 6rpx;
	display: block;
}

.filter-picker {
	width: 100%;
	height: 50rpx;
	background-color: #F9FAFB;
	border-radius: 8rpx;
	padding: 0 12rpx;
	display: flex;
	align-items: center;
	box-sizing: border-box;
}

.filter-actions {
	display: flex;
	justify-content: space-between;
	margin-top: 16rpx;
}

.filter-reset-btn, .filter-apply-btn {
	height: 50rpx;
	border-radius: 25rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 22rpx;
	font-weight: 500;
	width: 48%;
}

.filter-reset-btn {
	background-color: #F3F4F6;
	color: #4B5563;
}

.filter-apply-btn {
	background: linear-gradient(135deg, #0D9488, #0F766E);
	color: white;
	box-shadow: 0 4rpx 12rpx rgba(13, 148, 136, 0.2);
}

.price-range-container {
	display: flex;
	align-items: center;
	background-color: #F9FAFB;
	border-radius: 12rpx;
	padding: 0 16rpx;
	height: 80rpx;
	border: 1rpx solid #E5E7EB;
}

.price-input {
	width: 120rpx;
	height: 60rpx;
	border: none;
	background: transparent;
	padding: 0 8rpx;
	font-size: 28rpx;
	color: #1F2937;
	text-align: center;
}

.price-separator {
	margin: 0 12rpx;
	font-size: 32rpx;
	color: #6B7280;
	font-weight: 500;
}

.price-unit {
	font-size: 28rpx;
	color: #6B7280;
	margin-left: 10rpx;
}

.price-tip {
	font-size: 22rpx;
	color: #9CA3AF;
	margin-top: 6rpx;
	padding-left: 4rpx;
}

.fruit-info-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 12rpx;
	margin-top: 8rpx;
}

/* 禁用状态的样式 */
.disabled-picker {
	color: #9CA3AF;
	background-color: #F3F4F6;
}

.text-input:disabled {
	background-color: #F3F4F6;
	color: #9CA3AF;
}

.form-tip {
	font-size: 22rpx;
	color: #9CA3AF;
	margin-top: 6rpx;
	padding-left: 4rpx;
}

/* 新的库存卡片样式 */
.fruit-stock-card {
	position: relative;
	width: 120rpx;
	height: 60rpx;
	border-radius: 30rpx;
	overflow: hidden;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.stock-card-glow {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 1;
	opacity: 0.7;
}

.stock-card-content {
	position: relative;
	z-index: 2;
	display: flex;
	align-items: center;
	justify-content: center;
	height: 100%;
	padding: 0 16rpx;
}

.stock-value {
	font-size: 32rpx;
	font-weight: bold;
	color: white;
	margin-right: 4rpx;
}

.stock-unit {
	font-size: 22rpx;
	color: rgba(255, 255, 255, 0.9);
}

.stock-icon {
	position: absolute;
	right: 10rpx;
	font-size: 24rpx;
	color: rgba(255, 255, 255, 0.7);
}

/* 不同库存级别的样式 */
.stock-high {
	background: linear-gradient(135deg, rgba(16, 185, 129, 0.8), rgba(5, 150, 105, 0.8));
}

.stock-high .stock-card-glow {
	background: radial-gradient(circle at 70% 30%, rgba(255, 255, 255, 0.3), transparent 50%);
}

.stock-medium {
	background: linear-gradient(135deg, rgba(245, 158, 11, 0.8), rgba(217, 119, 6, 0.8));
}

.stock-medium .stock-card-glow {
	background: radial-gradient(circle at 70% 30%, rgba(255, 255, 255, 0.3), transparent 50%);
}

.stock-low {
	background: linear-gradient(135deg, rgba(239, 68, 68, 0.8), rgba(220, 38, 38, 0.8));
}

.stock-low .stock-card-glow {
	background: radial-gradient(circle at 70% 30%, rgba(255, 255, 255, 0.3), transparent 50%);
}

.stock-empty {
	background: linear-gradient(135deg, rgba(107, 114, 128, 0.8), rgba(75, 85, 99, 0.8));
}

.stock-empty .stock-card-glow {
	background: radial-gradient(circle at 70% 30%, rgba(255, 255, 255, 0.2), transparent 50%);
}
</style>