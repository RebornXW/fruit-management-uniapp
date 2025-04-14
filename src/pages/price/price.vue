<template>
	<view class="price-container">
		<!-- 头部 -->
		<view class="price-header bg-teal-600 text-white p-4">
			<view class="flex justify-between items-center">
				<text class="text-xl font-bold">今日报价</text>
				<view class="date-box">
					<uni-icons type="calendar" size="16" color="#FFFFFF"></uni-icons>
					<text class="date-text">{{currentDate}}</text>
				</view>
			</view>

			<!-- 搜索框 -->
			<view class="price-search-container">
				<view class="price-search-box">
					<input v-model="searchText" type="text" placeholder="搜索水果..." class="price-search-input" />
					<text class="iconfont icon-search price-search-icon"></text>
				</view>
			</view>
		</view>

		<!-- 分类标签 - 固定在头部下方 -->
		<view class="price-category-container">
			<scroll-view scroll-x class="price-category-scroll">
				<view class="price-category-list">
					<view
						v-for="(category, index) in categories"
						:key="index"
						class="price-category-item"
						:class="{ 'price-category-active': currentCategory === category.value }"
						@tap="selectCategory(category.value)"
					>
						<text class="iconfont" :class="category.icon"></text>
						<text class="price-category-text">{{category.label}}</text>
					</view>
				</view>
			</scroll-view>
		</view>

		<!-- 水果展示区 -->
		<scroll-view
			scroll-y
			class="price-fruit-list-container"
			:show-scrollbar="false"
			:enhanced="true"
			:bounces="false"
		>
			<view class="price-fruit-list">
				<view
					v-for="fruit in filteredFruits"
					:key="fruit.id"
					class="price-fruit-card"
					@tap="showPriceAdjust(fruit)"
				>
					<view class="price-fruit-content">
						<view class="price-fruit-image-container">
							<image :src="fruit.image" :alt="fruit.name" class="price-fruit-image"></image>
						</view>
						<view class="price-fruit-info">
							<view class="price-fruit-header">
								<text class="price-fruit-name">{{fruit.name}}</text>
							</view>
							<text class="price-fruit-spec">{{fruit.spec}}</text>
							<view class="price-fruit-footer">
								<view class="price-fruit-stock">
									<text class="price-stock-text">
										库存: {{fruit.stock}}箱
									</text>
								</view>
								<view class="price-fruit-price-container">
									<text class="price-fruit-price">
										¥{{fruit.minPrice}} - ¥{{fruit.maxPrice}}
									</text>
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>

		<!-- 价格调整弹窗 -->
		<uni-popup ref="pricePopup" type="center">
			<view class="price-adjust-popup">
				<view class="price-adjust-header">
					<text class="price-adjust-title">调整价格区间</text>
					<text class="price-adjust-close" @tap="closePopup">✕</text>
				</view>

				<view class="price-adjust-content">
					<view class="price-adjust-fruit-info">
						<text class="price-adjust-fruit-name">{{currentFruit.name}}</text>
						<text class="price-adjust-fruit-spec">{{currentFruit.spec}}</text>
					</view>

					<view class="price-adjust-range">
						<text class="price-adjust-label">最低价格</text>
						<view class="price-adjust-slider-box">
							<text class="price-adjust-value">¥{{minPrice}}</text>
							<slider
								:min="10"
								:max="200"
								:value="minPrice"
								@change="onMinPriceChange"
								@changing="onMinPriceChange"
								activeColor="#0D9488"
								class="price-adjust-slider"
							/>
						</view>
					</view>

					<view class="price-adjust-range">
						<text class="price-adjust-label">最高价格</text>
						<view class="price-adjust-slider-box">
							<text class="price-adjust-value">¥{{maxPrice}}</text>
							<slider
								:min="10"
								:max="200"
								:value="maxPrice"
								@change="onMaxPriceChange"
								@changing="onMaxPriceChange"
								activeColor="#0D9488"
								class="price-adjust-slider"
							/>
						</view>
					</view>

					<view class="price-adjust-summary">
						<text class="price-adjust-summary-label">价格区间：</text>
						<text class="price-adjust-summary-value">¥{{minPrice}} - ¥{{maxPrice}}</text>
					</view>
				</view>

				<view class="price-adjust-footer">
					<button class="price-adjust-btn" @tap="confirmPriceAdjust">确认调整</button>
				</view>
			</view>
		</uni-popup>

		<!-- 底部TabBar -->
		<custom-tab-bar></custom-tab-bar>
	</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import CustomTabBar from '@/components/CustomTabBar.vue';

// 数据
const searchText = ref('');
const currentCategory = ref('全部');
const categories = ref([
	{ label: '全部', value: '全部', icon: 'icon-apps' },
	{ label: '苹果', value: '苹果', icon: 'icon-apple' },
	{ label: '梨', value: '梨', icon: 'icon-fruit' },
	{ label: '其他水果', value: '其他水果', icon: 'icon-basket' }
]);
const fruitData = ref([]);
const currentFruit = ref({});
const minPrice = ref(10);
const maxPrice = ref(20);
const currentDate = ref('');

// 过滤后的水果数据
const filteredFruits = computed(() => {
	return fruitData.value.filter(fruit => {
		// 按搜索文本过滤
		const matchSearch = searchText.value === '' ||
			fruit.name.includes(searchText.value) ||
			fruit.spec.includes(searchText.value);

		// 按分类过滤
		const matchCategory = currentCategory.value === '全部' ||
			(currentCategory.value === '苹果' && fruit.name.includes('苹果')) ||
			(currentCategory.value === '梨' && fruit.name.includes('梨')) ||
			(currentCategory.value === '其他水果' &&
				!fruit.name.includes('苹果') &&
				!fruit.name.includes('梨'));

		return matchSearch && matchCategory;
	});
});

// 选择分类
function selectCategory(category) {
	currentCategory.value = category;
}

// 获取弹窗组件引用
const pricePopup = ref(null);

// 显示价格调整弹窗
function showPriceAdjust(fruit) {
	currentFruit.value = fruit;
	minPrice.value = fruit.minPrice;
	maxPrice.value = fruit.maxPrice;
	pricePopup.value.open();
}

// 关闭弹窗
function closePopup() {
	pricePopup.value.close();
}

// 最低价格变化
function onMinPriceChange(e) {
	minPrice.value = e.detail.value;
	if (minPrice.value > maxPrice.value) {
		maxPrice.value = minPrice.value;
	}
}

// 最高价格变化
function onMaxPriceChange(e) {
	maxPrice.value = e.detail.value;
	if (maxPrice.value < minPrice.value) {
		// 当最高价格小于最低价格时，保持最高价格不低于最低价格
		maxPrice.value = minPrice.value;
	}
}

// 确认价格调整
function confirmPriceAdjust() {
	const index = fruitData.value.findIndex(f => f.id === currentFruit.value.id);
	if (index !== -1) {
		// 更新报价页面的价格
		fruitData.value[index].minPrice = minPrice.value;
		fruitData.value[index].maxPrice = maxPrice.value;

		// 同步更新库存管理中的价格
		try {
			const inventoryKey = 'inventoryData';
			const storedInventory = uni.getStorageSync(inventoryKey);

			if (storedInventory) {
				const inventoryData = JSON.parse(storedInventory);
				const inventoryIndex = inventoryData.findIndex(f => f.id === currentFruit.value.id);

				if (inventoryIndex !== -1) {
					// 更新库存管理中的价格
					inventoryData[inventoryIndex].minPrice = minPrice.value;
					inventoryData[inventoryIndex].maxPrice = maxPrice.value;

					// 保存更新后的库存数据
					uni.setStorageSync(inventoryKey, JSON.stringify(inventoryData));
					console.log('已同步更新库存管理中的价格');
				}
			}
		} catch (e) {
			console.error('更新库存管理中的价格失败', e);
		}

		// 显示成功提示
		uni.showToast({
			title: '价格调整成功',
			icon: 'success'
		});
		closePopup();
	}
}

// 页面加载时获取数据
onMounted(() => {
	// 设置当前日期
	const now = new Date();
	currentDate.value = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;

	// 加载水果数据
	loadFruitData();

	// 触发tabChange事件以更新底部导航状态
	setTimeout(() => {
		uni.$emit('tabChange');
		console.log('今日报价页面触发tabChange事件');
	}, 200);

	// 监听页面显示事件
	uni.$on('onShow', () => {
		console.log('今日报价页面显示');
		// 重新加载数据
		loadFruitData();
		// 触发tabChange事件
		uni.$emit('tabChange');
	});
});

// 监听页面刷新事件
uni.$on('pageRefresh', () => {
	console.log('今日报价页面收到刷新事件');
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
	// 从库存管理中获取数据
	try {
		const inventoryKey = 'inventoryData';
		const storedInventory = uni.getStorageSync(inventoryKey);

		if (storedInventory) {
			// 如果有库存数据，使用库存数据
			const inventoryData = JSON.parse(storedInventory);

			// 将库存数据转换为报价数据格式
			fruitData.value = inventoryData.map(item => ({
				id: item.id,
				name: item.name,
				spec: item.spec,
				stock: item.stock,
				minPrice: item.minPrice,
				maxPrice: item.maxPrice,
				image: item.image,
				brand: item.brand,
				category: item.category,
				variety: item.variety,
				packageType: item.packageType,
				weight: item.weight
			}));

			console.log('从库存数据加载了报价数据');
			return;
		}
	} catch (e) {
		console.error('加载库存数据失败', e);
	}

	// 如果没有库存数据，使用空数组
	fruitData.value = [];
	console.log('没有库存数据，报价页面为空');
}
</script>

<style>
/* 全局页面样式，防止整体滑动 */
page {
	height: 100%;
	overflow: hidden;
	position: relative;
}

.price-container {
	display: flex;
	flex-direction: column;
	height: 100vh;
	padding-bottom: 100rpx;
	background-color: #F8FAFC;
	font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
	overflow: hidden; /* 禁止整个页面滚动 */
}

.price-header {
	background: linear-gradient(135deg, #0D9488, #0F766E);
	padding: 40rpx 30rpx 30rpx;
	border-bottom-left-radius: 0;
	border-bottom-right-radius: 0;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.price-header .flex {
	margin-bottom: 24rpx;
}

.price-header .text-xl {
	font-size: 36rpx;
	letter-spacing: 1rpx;
}

.price-header .text-sm {
	font-size: 24rpx;
	opacity: 0.9;
}

.price-search-container {
	padding: 0 4rpx;
}

.price-search-box {
	position: relative;
	background-color: rgba(255, 255, 255, 0.95);
	border-radius: 35rpx;
	height: 70rpx;
	display: flex;
	align-items: center;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.price-search-input {
	height: 100%;
	width: 100%;
	padding: 0 40rpx 0 80rpx;
	font-size: 28rpx;
	color: #1F2937;
}

.price-search-icon {
	position: absolute;
	left: 28rpx;
	font-size: 28rpx;
	color: #9CA3AF;
}

.price-category-container {
	background-color: #FFFFFF;
	padding: 20rpx 0;
	border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);
	position: sticky;
	top: 0;
	z-index: 10;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03);
}

.price-category-scroll {
	width: 100%;
}

.price-category-list {
	display: flex;
	padding: 0 24rpx;
}

.price-category-item {
	padding: 16rpx 32rpx;
	margin-right: 20rpx;
	background: linear-gradient(145deg, #FFFFFF, #F8FAFC);
	border-radius: 16rpx;
	font-size: 26rpx;
	color: #4B5563;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03);
	transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	border: 1rpx solid rgba(0, 0, 0, 0.05);
	display: flex;
	align-items: center;
	justify-content: center;
}

.price-category-item:active {
	transform: scale(0.95);
	box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
}

.price-category-active {
	background: linear-gradient(135deg, #0D9488, #0F766E);
	color: white;
	border-color: rgba(255, 255, 255, 0.2);
	box-shadow: 0 4rpx 12rpx rgba(13, 148, 136, 0.2);
}

.price-category-item .iconfont {
	margin-right: 8rpx;
	font-size: 28rpx;
}

.price-category-text {
	font-weight: 500;
	letter-spacing: 0.5rpx;
	position: relative;
	z-index: 2;
	display: inline-block;
	vertical-align: middle;
}

.price-fruit-list-container {
	flex: 1;
	padding: 24rpx;
	box-sizing: border-box;
	width: 100%;
	overflow: -moz-scrollbars-none; /* Firefox */
	-ms-overflow-style: none; /* IE and Edge */
	scrollbar-width: none; /* Firefox */
	height: calc(100vh - 320rpx - 100rpx); /* 调整高度确保可滚动区域适合剩余空间，并为底部导航栏预留空间 */
}

.price-fruit-list-container::-webkit-scrollbar {
	display: none; /* Chrome, Safari and Opera */
	width: 0 !important;
	height: 0 !important;
	background: transparent;
}

.price-fruit-list {
	display: flex;
	flex-direction: column;
	width: 100%;
	padding-bottom: 100rpx; /* 添加底部边距，确保最后一个卡片不会被底部导航栏遮挡 */
}

.price-fruit-card {
	background-color: white;
	border-radius: 16rpx;
	margin-bottom: 24rpx;
	overflow: hidden;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
	transition: all 0.3s ease;
	border: 1rpx solid rgba(0, 0, 0, 0.05);
}

.price-fruit-card:active {
	transform: scale(0.98);
	box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
}

.price-fruit-content {
	display: flex;
	padding: 24rpx;
	width: 100%;
	box-sizing: border-box;
}

.price-fruit-image-container {
	width: 140rpx;
	height: 140rpx;
	border-radius: 12rpx;
	overflow: hidden;
	flex-shrink: 0;
	background-color: #F3F4F6;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.price-fruit-image {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.price-fruit-info {
	flex: 1;
	margin-left: 24rpx;
	display: flex;
	flex-direction: column;
	width: calc(100% - 164rpx);
	overflow: hidden;
}

.price-fruit-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: 12rpx;
	width: 100%;
}

.price-fruit-name {
	font-weight: bold;
	font-size: 30rpx;
	color: #1F2937;
	max-width: 100%;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.price-fruit-spec {
	font-size: 24rpx;
	color: #6B7280;
	margin-bottom: 20rpx;
	background-color: #F9FAFB;
	padding: 8rpx 16rpx;
	border-radius: 8rpx;
	display: inline-block;
}

.price-fruit-footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: auto;
}

.price-fruit-stock {
	display: flex;
	align-items: center;
}

.price-stock-text {
	font-size: 22rpx;
	background-color: #E6FFFA;
	color: #0D9488;
	padding: 8rpx 20rpx;
	border-radius: 20rpx;
	box-shadow: 0 2rpx 4rpx rgba(13, 148, 136, 0.1);
}

.price-fruit-price-container {
	background: linear-gradient(135deg, #FEF3C7, #FECACA);
	padding: 10rpx 20rpx;
	border-radius: 20rpx;
	box-shadow: 0 2rpx 6rpx rgba(236, 72, 153, 0.15);
}

.price-fruit-price {
	color: #9D174D;
	font-weight: bold;
	font-size: 28rpx;
	flex-shrink: 0;
}

/* 价格调整弹窗样式 */
.price-adjust-popup {
	width: 600rpx;
	background-color: white;
	border-radius: 20rpx;
	overflow: hidden;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.15);
}

.price-adjust-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 30rpx;
	border-bottom: 1rpx solid #f0f0f0;
}

.price-adjust-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333333;
}

.price-adjust-close {
	color: #999999;
	font-size: 32rpx;
	padding: 10rpx;
}

.price-adjust-content {
	padding: 30rpx;
}

.price-adjust-fruit-info {
	background-color: #f7f8fa;
	padding: 20rpx;
	border-radius: 10rpx;
	margin-bottom: 30rpx;
}

.price-adjust-fruit-name {
	font-size: 28rpx;
	font-weight: 500;
	color: #333333;
	display: block;
}

.price-adjust-fruit-spec {
	font-size: 24rpx;
	color: #999999;
	display: block;
	margin-top: 6rpx;
}

.price-adjust-range {
	margin-bottom: 30rpx;
}

.price-adjust-label {
	font-size: 26rpx;
	color: #666666;
	margin-bottom: 15rpx;
	display: block;
}

.price-adjust-slider-box {
	display: flex;
	align-items: center;
}

.price-adjust-value {
	width: 100rpx;
	font-size: 36rpx;
	font-weight: bold;
	color: #0D9488;
}

.price-adjust-slider {
	flex: 1;
}

.price-adjust-summary {
	background-color: #f0fdfa;
	padding: 20rpx;
	border-radius: 10rpx;
	display: flex;
	justify-content: space-between;
	margin-bottom: 20rpx;
}

.price-adjust-summary-label {
	font-size: 26rpx;
	color: #666666;
}

.price-adjust-summary-value {
	font-size: 26rpx;
	font-weight: 500;
	color: #0D9488;
}

.price-adjust-footer {
	padding: 20rpx 30rpx 30rpx;
}

.price-adjust-btn {
	width: 100%;
	height: 80rpx;
	line-height: 80rpx;
	text-align: center;
	background: linear-gradient(135deg, #0D9488, #0F766E);
	color: white;
	font-size: 28rpx;
	font-weight: 500;
	border-radius: 10rpx;
}

/* 日期样式 */
.date-box {
	display: flex;
	align-items: center;
	background-color: rgba(255, 255, 255, 0.1);
	padding: 6rpx 16rpx;
	border-radius: 30rpx;
}

.date-text {
	font-size: 24rpx;
	color: #FFFFFF;
	margin-left: 8rpx;
}
</style>