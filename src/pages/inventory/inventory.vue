<template>
	<view class="inventory-container" @tap="closeAllMoreActions">
		<!-- 头部 -->
		<view class="header-section">
			<view class="header-content">
				<text class="header-title">库存管理</text>
				<view class="date-display">
					<text class="date-text">{{currentDate}}</text>
				</view>
			</view>

			<!-- 搜索框和操作按钮并排 -->
			<view class="header-tools">
				<view class="search-box">
					<text class="iconfont icon-search search-icon"></text>
					<input v-model="searchText" type="text" placeholder="搜索水果..." class="search-input" />
				</view>
				<view class="header-actions">
					<button class="header-btn record-btn" @tap="showAddRecord">
						<text class="iconfont icon-clipboard"></text>
					</button>
					<button class="header-btn add-btn" @tap="showAddFruit">
						<text class="iconfont icon-add"></text>
					</button>
				</view>
			</view>
		</view>

		<!-- 库存数据统计 -->
		<view class="dashboard-container">
			<!-- 三卡片水平布局 -->
			<view class="stats-row">
				<!-- 库存总量 -->
				<view class="stat-card total-card">
					<view class="stat-icon-container total-icon">
						<text class="iconfont icon-warehouse"></text>
					</view>
					<view class="stat-content">
						<text class="stat-label">库存总量</text>
						<view class="stat-value-row">
							<text class="stat-value">{{totalStock}}</text>
							<text class="stat-unit">箱</text>
						</view>
					</view>
				</view>

				<!-- 今日入库 -->
				<view class="stat-card in-card">
					<view class="stat-icon-container in-icon">
						<text class="iconfont icon-arrow-down"></text>
					</view>
					<view class="stat-content">
						<text class="stat-label">今日入库</text>
						<view class="stat-value-row">
							<text class="stat-value">{{todayIn}}</text>
							<text class="stat-unit">箱</text>
						</view>
					</view>
				</view>

				<!-- 今日出库 -->
				<view class="stat-card out-card">
					<view class="stat-icon-container out-icon">
						<text class="iconfont icon-arrow-up"></text>
					</view>
					<view class="stat-content">
						<text class="stat-label">今日出库</text>
						<view class="stat-value-row">
							<text class="stat-value">{{todayOut}}</text>
							<text class="stat-unit">箱</text>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 内容区 - 库存列表 -->
		<scroll-view scroll-y class="content-section" @tap.stop="closeAllMoreActions">
			<view class="list-header">
				<text class="list-title">库存水果列表</text>
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
						<text class="filter-label">品牌</text>
						<picker @change="onBrandChange" :value="brandIndex" :range="brands" class="filter-picker">
							<view class="picker-text">{{brands[brandIndex]}}</view>
						</picker>
					</view>
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
								<text class="fruit-name">{{fruit.brand}} {{fruit.variety}}</text>
								<view class="fruit-stock-tag">
									<text class="stock-text">库存: {{fruit.stock}}箱</text>
								</view>
							</view>
							<view class="fruit-info-row">
								<text class="fruit-spec">{{fruit.spec}}</text>
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
			<view class="popup-container">
				<view class="popup-header">
					<text class="popup-title">{{operationType === 'in' ? '入库操作' : '出库操作'}}</text>
					<text class="popup-close" @tap="closePopup('inventory')">✕</text>
				</view>
				<view class="popup-content">
					<view class="selected-fruit">
						<text class="selected-name">{{currentFruit.name}}</text>
						<text class="selected-spec">{{currentFruit.spec}}</text>
						<view class="selected-stock">
							<text class="current-stock">当前库存: {{currentFruit.stock}}箱</text>
						</view>
					</view>
					<view class="form-item">
						<text class="form-label">操作数量 (箱)</text>
						<view class="quantity-control">
							<button class="quantity-btn" @tap="decrementQuantity">-</button>
							<input
								type="number"
								v-model="operationQuantity"
								class="quantity-input"
								:class="operationType === 'in' ? 'in-text' : 'out-text'"
							/>
							<button class="quantity-btn" @tap="incrementQuantity">+</button>
						</view>
					</view>
					<view class="form-item">
						<text class="form-label">备注</text>
						<textarea v-model="operationRemark" placeholder="添加备注信息" class="remark-input"></textarea>
					</view>
					<button
						class="confirm-btn"
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
			<view class="popup-container">
				<view class="popup-header">
					<text class="popup-title">{{isAddingFruit ? '新增水果' : '编辑水果'}}</text>
					<text class="popup-close" @tap="closePopup('edit')">✕</text>
				</view>
				<scroll-view scroll-y class="popup-content" :style="{ height: '75vh' }">
					<view class="form-content">
						<view class="form-item">
							<text class="form-label">品牌 <text class="required">*</text></text>
							<input v-model="editForm.brand" placeholder="请输入品牌" class="text-input" />
						</view>
						<view class="form-item">
							<text class="form-label">水果品类 <text class="required">*</text></text>
							<picker @change="onCategoryChange" :value="categoryIndex" :range="fruitCategories" class="picker">
								<view class="picker-text">{{fruitCategories[categoryIndex]}}</view>
							</picker>
						</view>
						<view class="form-item">
							<text class="form-label">水果品种 <text class="required">*</text></text>
							<picker @change="onVarietyChange" :value="varietyIndex" :range="fruitVarieties" class="picker">
								<view class="picker-text">{{fruitVarieties[varietyIndex]}}</view>
							</picker>
						</view>
						<view class="form-item">
							<text class="form-label">规格型号 <text class="required">*</text></text>
							<input v-model="editForm.spec" placeholder="请输入规格型号" class="text-input" />
						</view>
						<view class="form-item">
							<text class="form-label">包装类型</text>
							<picker @change="onPackageTypeChange" :value="packageTypeIndex" :range="packageTypes" class="picker">
								<view class="picker-text">{{packageTypes[packageTypeIndex]}}</view>
							</picker>
						</view>
						<view class="form-item">
							<text class="form-label">重量 (斤)</text>
							<input type="number" v-model="editForm.weight" placeholder="请输入重量" class="text-input" />
						</view>
						<view class="form-item">
							<text class="form-label">参考价格区间</text>
							<view class="price-range-container">
								<input type="number" v-model="editForm.minPrice" placeholder="最低价" class="price-input" />
								<text class="price-separator">-</text>
								<input type="number" v-model="editForm.maxPrice" placeholder="最高价" class="price-input" />
								<text class="price-unit">元</text>
							</view>
							<text class="price-tip">不填则默认为0</text>
						</view>
						<view class="form-item" v-if="isAddingFruit">
							<text class="form-label">初始库存</text>
							<input type="number" v-model="editForm.stock" placeholder="请输入初始库存" class="text-input" />
						</view>
						<view class="form-item">
							<text class="form-label">上传图片</text>
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
							<button class="confirm-btn primary-btn" @tap="confirmEditFruit">
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

		<!-- 底部TabBar -->
		<custom-tab-bar></custom-tab-bar>
	</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import CustomTabBar from '@/components/CustomTabBar.vue';
import operationRecordService from '@/services/operationRecordService.js';
import inventoryRecordService from '@/services/inventoryRecordService.js';

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
const fruitCategories = ['全部', '苹果', '梨', '枣', '其他'];
const categoryIndex = ref(0);
const fruitVarieties = ref(['阿克苏冰糖心', '红富士', '奶油富士']);
const varietyIndex = ref(0);
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
const todayIn = ref(12);
const todayOut = ref(8);

// 筛选相关数据
const showFilter = ref(false);
const brands = ref(['全部', '明牌', '砀山', '新鲜']);
const brandIndex = ref(0);
const filterCategoryIndex = ref(0);
const filterVarietyIndex = ref(0);
const filteredVarieties = ref(['全部']);
const appliedFilters = ref({
	brand: '全部',
	category: '全部',
	variety: '全部'
});

// 计算总库存
const totalStock = computed(() => {
	return fruitData.value.reduce((total, fruit) => total + fruit.stock, 0);
});

// 过滤后的水果数据
const filteredFruits = computed(() => {
	let result = fruitData.value;

	// 应用筛选条件
	if (appliedFilters.value.brand !== '全部') {
		result = result.filter(fruit => fruit.brand === appliedFilters.value.brand);
	}

	if (appliedFilters.value.category !== '全部') {
		result = result.filter(fruit => fruit.category === appliedFilters.value.category);
	}

	if (appliedFilters.value.variety !== '全部') {
		result = result.filter(fruit => fruit.variety === appliedFilters.value.variety);
	}

	// 应用搜索文本
	if (searchText.value) {
		result = result.filter(fruit =>
			fruit.name.includes(searchText.value) ||
			fruit.spec.includes(searchText.value)
		);
	}

	return result;
});

// 获取弹窗组件引用
const inventoryPopup = ref(null);
const editFruitPopup = ref(null);
const deletePopup = ref(null);

// 显示入库/出库操作弹窗
function showInventoryOperation(type, fruit) {
	// 先关闭所有更多操作菜单
	closeAllMoreActions();

	operationType.value = type;
	currentFruit.value = fruit;
	operationQuantity.value = 1;
	operationRemark.value = '';
	inventoryPopup.value.open();
}

// 显示编辑水果弹窗
function showEditFruit(fruit) {
	// 先关闭所有更多操作菜单
	closeAllMoreActions();

	isAddingFruit.value = false;
	currentFruit.value = fruit;

	// 设置品类索引
	const categoryIdx = fruitCategories.indexOf(fruit.category);
	categoryIndex.value = categoryIdx !== -1 ? categoryIdx : 0;

	// 更新品种列表
	updateVarietiesByCategory(fruitCategories[categoryIndex.value]);

	// 设置品种索引
	const varietyIdx = fruitVarieties.value.indexOf(fruit.variety);
	varietyIndex.value = varietyIdx !== -1 ? varietyIdx : 0;

	editForm.value = {
		id: fruit.id,
		brand: fruit.brand,
		category: fruit.category,
		variety: fruit.variety,
		spec: fruit.spec,
		weight: fruit.weight,
		stock: fruit.stock,
		image: fruit.image,
		minPrice: fruit.minPrice || '',
		maxPrice: fruit.maxPrice || ''
	};
	packageTypeIndex.value = packageTypes.indexOf(fruit.packageType);
	editFruitPopup.value.open();
}

// 显示新增水果弹窗
function showAddFruit() {
	// 先关闭所有更多操作菜单
	closeAllMoreActions();

	isAddingFruit.value = true;
	editForm.value = {
		id: null,
		brand: '',
		category: fruitCategories[0],
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
	updateVarietiesByCategory(fruitCategories[0]);
	varietyIndex.value = 0;
	editFruitPopup.value.open();
}

// 显示删除确认弹窗
function confirmDelete(fruit) {
	// 先关闭所有更多操作菜单
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
	const index = fruitData.value.findIndex(f => f.id === currentFruit.value.id);
	if (index !== -1) {
		if (operationType.value === 'in') {
			// 入库操作
			fruitData.value[index].stock += parseInt(operationQuantity.value);
			todayIn.value += parseInt(operationQuantity.value);
		} else {
			// 出库操作
			if (fruitData.value[index].stock >= operationQuantity.value) {
				fruitData.value[index].stock -= parseInt(operationQuantity.value);
				todayOut.value += parseInt(operationQuantity.value);
			} else {
				uni.showToast({
					title: '库存不足',
					icon: 'none'
				});
				return;
			}
		}

		// 保存库存数据到本地存储
		saveInventoryData();

		// 获取当前登录用户
		const loginUser = uni.getStorageSync('loginUser');
		const operator = loginUser ? loginUser.name : '系统管理员';

		// 添加库存记录
		const operationTypeText = operationType.value === 'in' ? '入库' : '出库';
		inventoryRecordService.addInventoryRecord(
			operationTypeText,
			fruitData.value[index],
			parseInt(operationQuantity.value),
			operationRemark.value,
			operator
		);

		// 在实际应用中，这里应该调用API保存数据和操作记录
		uni.showToast({
			title: operationType.value === 'in' ? '入库成功' : '出库成功',
			icon: 'success'
		});
		closePopup('inventory');
	}
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
	editForm.value.image = '';
}

// 确认编辑/新增水果
function confirmEditFruit() {
	// 表单验证
	if (!editForm.value.brand || !editForm.value.category || !editForm.value.variety || !editForm.value.spec) {
		uni.showToast({
			title: '请填写必填项',
			icon: 'none'
		});
		return;
	}

	// 转换价格值为数字，空值默认为0
	const minPrice = editForm.value.minPrice === '' ? 0 : parseInt(editForm.value.minPrice);
	const maxPrice = editForm.value.maxPrice === '' ? 0 : parseInt(editForm.value.maxPrice);

	// 构建水果名称（品牌+品种）
	const fruitName = `${editForm.value.brand} ${editForm.value.variety}`;

	if (isAddingFruit.value) {
		// 新增水果
		const newId = fruitData.value.length > 0 ? Math.max(...fruitData.value.map(f => f.id)) + 1 : 1;
		const newFruit = {
			id: newId,
			name: fruitName,
			spec: editForm.value.spec || '', // 只保留规格型号，移除包装类型
			stock: parseInt(editForm.value.stock) || 0,
			image: editForm.value.image || 'https://via.placeholder.com/300',
			brand: editForm.value.brand,
			category: editForm.value.category,
			variety: editForm.value.variety,
			weight: editForm.value.weight || '',
			packageType: packageTypes[packageTypeIndex.value],
			minPrice: minPrice,
			maxPrice: maxPrice,
			showMoreActions: false // 添加这个字段以防止界面渲染问题
		};
		fruitData.value.push(newFruit);

		// 添加操作记录
		const operationData = {
			brand: newFruit.brand,
			fruitCategory: newFruit.category,
			fruitName: newFruit.variety,
			spec: newFruit.spec,
			packagingType: newFruit.packageType,
			weight: newFruit.weight,
			priceRange: `${newFruit.minPrice}-${newFruit.maxPrice}`,
			image: newFruit.image
		};

		// 获取当前登录用户
		const loginUser = uni.getStorageSync('loginUser');
		const operator = loginUser ? loginUser.name : '系统管理员';

		// 添加新增操作记录
		operationRecordService.addOperationRecord('新增', {}, operationData, operator);

		// 同步到今日报价页面
		syncToPricePage(newFruit);
	} else {
		// 编辑水果
		const index = fruitData.value.findIndex(f => f.id === editForm.value.id);
		if (index !== -1) {
			// 保存原始数据，用于操作记录
			const originalFruit = { ...fruitData.value[index] };
			const originalData = {
				brand: originalFruit.brand,
				fruitCategory: originalFruit.category,
				fruitName: originalFruit.variety,
				spec: originalFruit.spec,
				packagingType: originalFruit.packageType,
				weight: originalFruit.weight,
				priceRange: `${originalFruit.minPrice}-${originalFruit.maxPrice}`,
				image: originalFruit.image
			};

			// 更新水果数据
			fruitData.value[index].name = fruitName;
			fruitData.value[index].spec = editForm.value.spec || ''; // 只保留规格型号，移除包装类型
			fruitData.value[index].image = editForm.value.image || fruitData.value[index].image;
			fruitData.value[index].brand = editForm.value.brand;
			fruitData.value[index].category = editForm.value.category;
			fruitData.value[index].variety = editForm.value.variety;
			fruitData.value[index].weight = editForm.value.weight || '';
			fruitData.value[index].packageType = packageTypes[packageTypeIndex.value];
			fruitData.value[index].minPrice = minPrice;
			fruitData.value[index].maxPrice = maxPrice;

			// 准备新数据，用于操作记录
			const newData = {
				brand: fruitData.value[index].brand,
				fruitCategory: fruitData.value[index].category,
				fruitName: fruitData.value[index].variety,
				spec: fruitData.value[index].spec,
				packagingType: fruitData.value[index].packageType,
				weight: fruitData.value[index].weight,
				priceRange: `${fruitData.value[index].minPrice}-${fruitData.value[index].maxPrice}`,
				image: fruitData.value[index].image
			};

			// 获取当前登录用户
			const loginUser = uni.getStorageSync('loginUser');
			const operator = loginUser ? loginUser.name : '系统管理员';

			// 添加编辑操作记录
			operationRecordService.addOperationRecord('编辑', originalData, newData, operator);

			// 同步到今日报价页面
			syncToPricePage(fruitData.value[index]);
		}
	}

	// 保存库存数据到本地存储
	saveInventoryData();

	// 在实际应用中，这里应该调用API保存数据
	uni.showToast({
		title: isAddingFruit.value ? '添加成功' : '编辑成功',
		icon: 'success'
	});
	closePopup('edit');
}

// 保存库存数据到本地存储
function saveInventoryData() {
	try {
		const inventoryKey = 'inventoryData';
		uni.setStorageSync(inventoryKey, JSON.stringify(fruitData.value));

		// 同步所有水果数据到报价页面
		syncAllToPricePage();
	} catch (e) {
		console.error('保存库存数据失败', e);
	}
}

// 同步所有水果数据到报价页面
function syncAllToPricePage() {
	// 不需要额外的同步操作，因为今日报价页面直接使用库存数据
	console.log('库存数据已更新，今日报价页面将自动同步');
}

// 同步价格到今日报价页面
function syncToPricePage(_fruit) {
	// 不需要额外的同步操作，因为今日报价页面直接使用库存数据
	console.log('库存数据已更新，今日报价页面将自动同步');
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

// 页面加载时获取数据
onMounted(() => {
	// 设置当前日期
	const now = new Date();
	currentDate.value = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;

	// 加载水果数据
	loadFruitData();

	// 确保数据同步到报价页面
	setTimeout(() => {
		syncAllToPricePage();
	}, 100);

	// 触发tabChange事件以更新底部导航状态
	setTimeout(() => {
		uni.$emit('tabChange');
		console.log('库存页面触发tabChange事件');
	}, 200);

	// 监听页面显示事件
	uni.$on('onShow', () => {
		console.log('库存页面显示');
		// 重新加载数据
		loadFruitData();
		// 触发tabChange事件
		uni.$emit('tabChange');
	});
});

// 监听页面刷新事件
uni.$on('pageRefresh', () => {
	console.log('库存页面收到刷新事件');
	// 重新加载数据
	loadFruitData();
});

// 页面卸载时移除事件监听
uni.$on('beforeDestroy', () => {
	uni.$off('pageRefresh');
	uni.$off('onShow');
});

// 加载水果数据
function loadFruitData() {
	// 先尝试从本地存储获取数据
	try {
		const inventoryKey = 'inventoryData';
		const storageData = uni.getStorageSync(inventoryKey);
		if (storageData) {
			fruitData.value = JSON.parse(storageData);
			return;
		}
	} catch (e) {
		console.error('从本地存储加载数据失败', e);
	}

	// 如果本地没有数据，使用默认数据
	// 实际应用中，这里应该是API调用
	fruitData.value = [
		{ id: 1, name: "阿克苏冰糖心苹果", spec: "85#特级果", stock: 100, image: "https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?q=80&w=300", showMoreActions: false, brand: "新疆", category: "苹果", variety: "阿克苏冰糖心", packageType: "纸箱", weight: "10kg/箱", minPrice: 180, maxPrice: 220 },
		{ id: 2, name: "青苯乳山竹", spec: "特级果", stock: 50, image: "https://images.unsplash.com/photo-1621175831370-bedcedbe5261?q=80&w=300", showMoreActions: false, brand: "泰国", category: "其他", variety: "青苯乳山竹", packageType: "纸箱", weight: "9kg/箱", minPrice: 220, maxPrice: 260 },
		{ id: 3, name: "红心火龙果", spec: "特级果", stock: 30, image: "https://images.unsplash.com/photo-1550092137-f842b9d0cbd7?q=80&w=300", showMoreActions: false, brand: "越南", category: "其他", variety: "红心火龙果", packageType: "纸箱", weight: "5kg/箱", minPrice: 150, maxPrice: 180 },
		{ id: 4, name: "新鲜橘子", spec: "5斤精品袋装", stock: 15, image: "https://images.unsplash.com/photo-1519096989031-2aee4ffe17c6?q=80&w=300", showMoreActions: false, brand: "新鲜", category: "其他", variety: "橘子", minPrice: 25, maxPrice: 30 }
	];

	// 保存到本地存储
	saveInventoryData();
}

// 添加显示库存记录函数
// 显示库存记录页面或弹窗
function showAddRecord() {
	// 跳转到库存记录页面
	uni.navigateTo({
		url: '/pages/records/inventory-records'
	});
}

// 水果品类选择
function onCategoryChange(e) {
	categoryIndex.value = e.detail.value;
	// 根据选择的品类更新品种列表
	updateVarietiesByCategory(fruitCategories[categoryIndex.value]);
	// 重置品种索引
	varietyIndex.value = 0;
	// 更新表单中的品类
	editForm.value.category = fruitCategories[categoryIndex.value];
	// 更新表单中的品种
	editForm.value.variety = fruitVarieties.value[0];
}

// 水果品种选择
function onVarietyChange(e) {
	varietyIndex.value = e.detail.value;
	// 更新表单中的品种
	editForm.value.variety = fruitVarieties.value[varietyIndex.value];
}

// 根据品类更新品种列表
function updateVarietiesByCategory(category) {
	switch(category) {
		case '苹果':
			fruitVarieties.value = ['阿克苏冰糖心', '红富士', '奶油富士'];
			break;
		case '梨':
			fruitVarieties.value = ['红香酥', '库尔勒香梨', '秋月梨', '皇冠梨'];
			break;
		case '枣':
			fruitVarieties.value = ['大枣', '小枣', '蜜枣'];
			break;
		case '其他':
			fruitVarieties.value = ['自定义'];
			break;
		default:
			fruitVarieties.value = ['自定义'];
	}
}

// 显示/隐藏筛选弹窗
function toggleFilterPopup() {
	// 先关闭所有更多操作菜单
	closeAllMoreActions();

	showFilter.value = !showFilter.value;
}

// 品牌选择
function onBrandChange(e) {
	brandIndex.value = e.detail.value;
}

// 筛选品类选择
function onFilterCategoryChange(e) {
	filterCategoryIndex.value = e.detail.value;
	// 根据选择的品类更新品种列表
	updateFilteredVarieties(fruitCategories[filterCategoryIndex.value]);
	// 重置品种索引
	filterVarietyIndex.value = 0;
}

// 筛选品种选择
function onFilterVarietyChange(e) {
	filterVarietyIndex.value = e.detail.value;
}

// 根据品类更新筛选品种列表
function updateFilteredVarieties(category) {
	if (category === '全部') {
		filteredVarieties.value = ['全部'];
	} else {
		switch(category) {
			case '苹果':
				filteredVarieties.value = ['全部', '阿克苏冰糖心', '红富士', '奶油富士'];
				break;
			case '梨':
				filteredVarieties.value = ['全部', '红香酥', '库尔勒香梨', '秋月梨', '皇冠梨'];
				break;
			case '枣':
				filteredVarieties.value = ['全部', '大枣', '小枣', '蜜枣'];
				break;
			case '其他':
				filteredVarieties.value = ['全部', '自定义'];
				break;
			default:
				filteredVarieties.value = ['全部'];
		}
	}
}

// 重置筛选条件
function resetFilters() {
	brandIndex.value = 0;
	filterCategoryIndex.value = 0;
	filterVarietyIndex.value = 0;
	appliedFilters.value = {
		brand: '全部',
		category: '全部',
		variety: '全部'
	};
	// 更新筛选后的水果列表
	applyFilters();
}

// 应用筛选条件
function applyFilters() {
	appliedFilters.value = {
		brand: brands.value[brandIndex.value],
		category: fruitCategories[filterCategoryIndex.value],
		variety: filteredVarieties.value[filterVarietyIndex.value]
	};
	// 关闭筛选弹窗
	showFilter.value = false;
}

// 确认删除水果
function confirmDeleteFruit() {
	const index = fruitData.value.findIndex(f => f.id === currentFruit.value.id);
	if (index !== -1) {
		// 保存原始数据，用于操作记录
		const originalFruit = { ...fruitData.value[index] };
		const originalData = {
			brand: originalFruit.brand,
			fruitCategory: originalFruit.category,
			fruitName: originalFruit.variety,
			spec: originalFruit.spec,
			packagingType: originalFruit.packageType,
			weight: originalFruit.weight,
			priceRange: `${originalFruit.minPrice}-${originalFruit.maxPrice}`,
			image: originalFruit.image
		};

		// 获取当前登录用户
		const loginUser = uni.getStorageSync('loginUser');
		const operator = loginUser ? loginUser.name : '系统管理员';

		// 添加删除操作记录
		operationRecordService.addOperationRecord('删除', originalData, {}, operator);

		// 从数组中移除当前水果
		fruitData.value.splice(index, 1);

		// 保存更新后的库存数据
		saveInventoryData();

		// 同步删除操作到今日报价页面
		syncDeleteToPricePage(currentFruit.value.id);

		// 在实际应用中，这里应该调用API删除数据
		uni.showToast({
			title: '删除成功',
			icon: 'success'
		});
	}
	closePopup('delete');
}

// 同步删除操作到今日报价页面
function syncDeleteToPricePage(_fruitId) {
	// 不需要额外的同步操作，因为今日报价页面直接使用库存数据
	console.log('库存数据已更新，今日报价页面将自动同步');
}
</script>

<style>

/* 全局页面样式，防止整体滑动 */
page {
	height: 100%;
	overflow: hidden;
	position: relative;
}

.inventory-container {
	display: flex;
	flex-direction: column;
	height: 100vh;
	padding-bottom: 120rpx; /* 增加底部导航栏留出空间 */
	background-color: #F5F8FA;
	font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
	overflow: hidden; /* 防止整个页面滚动 */
}

/* 头部样式 */
.header-section {
	background: linear-gradient(135deg, #0D9488, #0F766E);
	padding: 40rpx 30rpx 30rpx;
	border-bottom-left-radius: 0;
	border-bottom-right-radius: 0;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.header-content {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 24rpx;
}

.header-title {
	font-size: 36rpx;
	font-weight: bold;
	color: white;
	letter-spacing: 1rpx;
}

.date-display {
	background-color: rgba(255, 255, 255, 0.2);
	padding: 8rpx 16rpx;
	border-radius: 30rpx;
}

.date-text {
	color: white;
	font-size: 24rpx;
}

.header-tools {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 15rpx;
}

.search-box {
	flex: 1;
	position: relative;
	height: 70rpx;
	background-color: rgba(255, 255, 255, 0.9);
	border-radius: 35rpx;
	display: flex;
	align-items: center;
}

.search-icon {
	position: absolute;
	left: 25rpx;
	font-size: 28rpx;
	color: #9CA3AF;
}

.search-input {
	flex: 1;
	height: 100%;
	padding: 0 20rpx 0 65rpx;
	font-size: 26rpx;
	color: #333;
}

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

.add-btn {
	background-color: rgba(255, 255, 255, 0.25);
}

/* 数据统计面板样式 */
.dashboard-container {
	padding: 10rpx 14rpx 6rpx;
	margin-bottom: 0;
	overflow: hidden;
}

.stats-row {
	display: flex;
	gap: 8rpx;
}

.stat-card {
	flex: 1;
	display: flex;
	align-items: center;
	padding: 12rpx;
	border-radius: 12rpx;
	height: 70rpx;
	box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.08);
}

.total-card {
	background: linear-gradient(135deg, #0D9488, #0F766E);
}

.in-card {
	background: linear-gradient(135deg, #065F46, #10B981);
}

.out-card {
	background: linear-gradient(135deg, #991B1B, #EF4444);
}

.stat-icon-container {
	width: 38rpx;
	height: 38rpx;
	border-radius: 8rpx;
	background: rgba(255, 255, 255, 0.15);
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 10rpx;
}

.stat-icon-container .iconfont {
	font-size: 22rpx;
	color: white;
}

.stat-content {
	flex: 1;
}

.stat-label {
	font-size: 20rpx;
	color: rgba(255, 255, 255, 0.85);
	margin-bottom: 4rpx;
}

.stat-value-row {
	display: flex;
	align-items: baseline;
}

.stat-value {
	font-size: 28rpx;
	font-weight: bold;
	color: white;
	margin-right: 4rpx;
}

.stat-unit {
	font-size: 20rpx;
	color: rgba(255, 255, 255, 0.8);
}

/* 列表头部区域样式 */
.list-header {
	padding: 20rpx 30rpx 16rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	position: relative;
}

.list-title {
	font-size: 28rpx;
	color: #6B7280;
	font-weight: 500;
}

.list-actions {
	display: flex;
	align-items: center;
	z-index: 10;
}

.filter-button {
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: #F3F4F6;
	border-radius: 30rpx;
	padding: 0 20rpx;
	height: 60rpx;
	border: none;
	box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
}

.filter-button::after {
	border: none;
}

.filter-button .iconfont {
	font-size: 28rpx;
	color: #6B7280;
	margin-right: 6rpx;
}

.filter-text {
	font-size: 24rpx;
	color: #6B7280;
}

/* 内容区 */
.content-section {
	flex: 1;
	margin-top: 16rpx;
	margin-bottom: 120rpx; /* 增加底部空间 */
	height: calc(100vh - 400rpx); /* 设置固定高度，减去头部、统计面板和底部导航的高度 */
	overflow: hidden; /* 防止内容溢出 */
}

.fruit-list {
	padding: 0 24rpx 120rpx; /* 增加底部内边距，确保最后一项可见 */
}

.fruit-card {
	background: white;
	border-radius: 16rpx;
	overflow: hidden;
	margin-bottom: 24rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	transition: all 0.3s;
}

.fruit-card:active {
	transform: scale(0.99);
}

.fruit-info {
	display: flex;
	padding: 24rpx;
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
	margin-bottom: 8rpx;
	background-color: #F9FAFB;
	padding: 6rpx 14rpx;
	border-radius: 8rpx;
	display: inline-block;
}

.fruit-stock-tag {
	flex-shrink: 0;
}

.stock-text {
	font-size: 22rpx;
	background-color: #E6FFFA;
	color: #0D9488;
	padding: 6rpx 16rpx;
	border-radius: 999rpx;
	font-weight: 500;
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
	box-shadow: none;
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

/* 弹窗样式 */
.popup-container {
	background-color: white;
	border-top-left-radius: 24rpx;
	border-top-right-radius: 24rpx;
	overflow: hidden;
	padding-bottom: env(safe-area-inset-bottom);
	max-height: 80vh;
	display: flex;
	flex-direction: column;
	position: relative;
	width: 100% !important; /* 确保宽度始终为100% */
	left: 0 !important; /* 确保左边距为0 */
	right: 0 !important; /* 确保右边距为0 */
}

.popup-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 30rpx;
	border-bottom: 1rpx solid #F3F4F6;
	flex-shrink: 0;
}

.popup-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #1F2937;
}

.popup-close {
	font-size: 32rpx;
	color: #9CA3AF;
	padding: 10rpx;
}

.popup-content {
	padding: 30rpx 30rpx 100rpx;
	box-sizing: border-box;
	width: 100% !important;
	overflow-y: auto;
	max-height: 70vh;
	margin: 0 auto;
}

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

.form-item {
	margin-bottom: 24rpx;
}

.form-label {
	font-size: 28rpx;
	color: #4B5563;
	font-weight: 500;
	margin-bottom: 12rpx;
	display: block;
}

.quantity-control {
	display: flex;
	border: 1rpx solid #E5E7EB;
	border-radius: 12rpx;
	overflow: hidden;
	height: 80rpx;
	box-sizing: border-box;
	align-items: center;
}

.quantity-btn {
	width: 80rpx;
	height: 80rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: #F9FAFB;
	font-size: 36rpx;
	color: #4B5563;
	line-height: 1;
	padding: 0;
	margin: 0;
	border: none;
}

.quantity-input {
	flex: 1;
	text-align: center;
	font-size: 32rpx;
	font-weight: bold;
	height: 80rpx;
	line-height: 80rpx;
	vertical-align: middle;
	padding: 0;
	margin: 0;
}

.in-text {
	color: #047857;
}

.out-text {
	color: #DC2626;
}

.text-input {
	width: 100%;
	height: 80rpx;
	border: 1rpx solid #E5E7EB;
	border-radius: 12rpx;
	padding: 0 24rpx;
	font-size: 28rpx;
	color: #1F2937;
	box-sizing: border-box;
}

.remark-input {
	width: 100%;
	height: 160rpx;
	border: 1rpx solid #E5E7EB;
	border-radius: 12rpx;
	padding: 16rpx 24rpx;
	font-size: 28rpx;
	color: #1F2937;
}

.confirm-btn {
	height: 90rpx;
	border-radius: 45rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 30rpx;
	font-weight: 500;
	margin-top: 30rpx;
	margin-bottom: 30rpx;
	color: white;
	width: 100% !important;
	position: relative;
	z-index: 10;
	box-sizing: border-box;
}

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

/* 表单样式 */
.picker {
	width: 100%;
	height: 80rpx;
	background-color: #F9FAFB;
	border-radius: 12rpx;
	padding: 0 20rpx;
	display: flex;
	align-items: center;
	box-sizing: border-box;
}

.picker-text {
	font-size: 28rpx;
	color: #374151;
}

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

.required {
	color: #EF4444;
	margin-left: 4rpx;
}

/* 筛选弹窗样式 */
.filter-popup {
	position: absolute;
	top: 70rpx;
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
	margin-bottom: 12rpx;
}
</style>