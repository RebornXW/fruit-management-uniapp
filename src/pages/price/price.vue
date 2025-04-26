<template>
	<view class="page-container">
		<!-- 顶部白色栏 - 为状态栏和前置摄像头预留空间 -->
		<view class="page-header">
			<!-- 保留白色标题栏，但不显示标题文字 -->
		</view>

		<!-- 搜索框 -->
		<view class="price-search-container">
			<view class="app-search-box app-search-box-header">
				<text class="iconfont icon-search app-search-icon"></text>
				<input v-model="searchText" type="text" placeholder="搜索水果..." class="app-search-input" />
				<text v-if="searchText" class="app-search-clear" @tap="searchText = ''">×</text>
			</view>
		</view>

		<!-- 分类标签 - 现代玻璃态设计 -->
		<view class="price-category-container">
			<!-- 背景装饰元素 -->
			<view class="category-bg-decoration"></view>

			<scroll-view scroll-x class="price-category-scroll hide-scrollbar" :show-scrollbar="false" :enhanced="true" :bounces="true">
				<view class="price-category-list">
					<view
						v-for="(category, index) in categories"
						:key="index"
						class="price-category-item"
						:class="{ 'price-category-active': currentCategory === category.value }"
						@tap="selectCategory(category.value)"
					>
						<!-- 内部光效 -->
						<view class="category-item-glow"></view>

						<text class="iconfont" :class="category.icon"></text>
						<text class="price-category-text">{{category.label}}</text>

						<!-- 活跃状态指示点 -->
						<view v-if="currentCategory === category.value" class="active-indicator"></view>
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
									<text class="price-stock-text" :class="getStockClass(fruit.stock)">
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

		<!-- 使用系统原生TabBar，无需自定义组件 -->
	</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import CustomNavBar from '@/components/CustomNavBar.vue';
import fruitService from '@/services/fruitService.js';

// 数据
const searchText = ref('');
const currentCategory = ref('全部');
const categories = ref([
	{ label: '全部', value: '全部', icon: 'icon-apps' }
]);

// 定义水果品类数组
const fruitCategories = ['苹果', '梨', '枣', '其他'];

// 更新分类标签
function updateCategories() {
	// 直接使用预定义的水果品类数组
	console.log('使用预定义的水果品类:', fruitCategories);

	// 创建分类数组
	const newCategories = [
		{ label: '全部', value: '全部', icon: 'icon-apps' }
	];

	// 添加水果品类 - 简化逻辑，移除图标相关代码
	fruitCategories.forEach(category => {
		if (category) {
			// 直接使用通用图标
			newCategories.push({ label: category, value: category, icon: 'icon-fruit' });
		}
	});

	categories.value = newCategories;
}
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
			fruit.spec.includes(searchText.value) ||
			(fruit.brand && fruit.brand.includes(searchText.value)) ||
			(fruit.variety && fruit.variety.includes(searchText.value));

		// 按分类过滤 - 使用category字段
		const matchCategory = currentCategory.value === '全部' ||
			(fruit.category && fruit.category === currentCategory.value);

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
		// 当最低价格高于最高价格时，将最高价格设置为等于最低价格
		maxPrice.value = minPrice.value;
	}
}

// 最高价格变化
function onMaxPriceChange(e) {
	maxPrice.value = e.detail.value;
	if (maxPrice.value < minPrice.value) {
		// 当最高价格低于最低价格时，将最低价格设置为等于最高价格
		minPrice.value = maxPrice.value;
	}
}

// 确认价格调整
function confirmPriceAdjust() {
	const index = fruitData.value.findIndex(f => f.id === currentFruit.value.id);
	if (index !== -1) {
		// 显示加载中提示
		uni.showLoading({ title: '更新中...' });

		// 调用API更新水果价格
		fruitService.updateFruitPrice(currentFruit.value.id, minPrice.value, maxPrice.value)
			.then(() => {
				uni.hideLoading();

				// 更新报价页面的价格
				fruitData.value[index].minPrice = minPrice.value;
				fruitData.value[index].maxPrice = maxPrice.value;

				// 显示成功提示
				uni.showToast({
					title: '价格调整成功',
					icon: 'success'
				});
				closePopup();
			})
			.catch(err => {
				uni.hideLoading();
				uni.showToast({
					title: '价格更新失败，请重试',
					icon: 'none'
				});
				console.error('更新水果价格失败:', err);
			});
	}
}

// 使用fruitService中的getDefaultFruitImage方法替代原来的getDefaultImageByCategory函数

// 根据库存量返回不同的类名
function getStockClass(stock) {
	if (stock <= 0) {
		return 'stock-empty';
	} else if (stock < 10) {
		return 'stock-low';
	} else if (stock < 30) {
		return 'stock-medium';
	} else {
		return 'stock-high';
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

// 监听报价页面刷新事件
uni.$on('refreshPricePage', () => {
	console.log('今日报价页面收到refreshPricePage事件');
	// 重新加载数据
	loadFruitData();
});

// 页面卸载时移除事件监听
uni.$on('beforeDestroy', () => {
	uni.$off('pageRefresh');
	uni.$off('refreshPricePage');
	uni.$off('onShow');
});

// 上次加载时间
const lastLoadTime = ref(0);
const isLoading = ref(false);

// 加载水果数据
function loadFruitData() {
	// 防止重复加载，如果正在加载中，直接返回
	if (isLoading.value) {
		console.log('数据正在加载中，跳过重复请求');
		return;
	}

	// 防止短时间内重复加载，如果距离上次加载不足 2 秒，直接返回
	const now = Date.now();
	if (now - lastLoadTime.value < 2000) { // 2秒内不重复加载
		console.log('距离上次加载时间太短，跳过重复请求');
		return;
	}

	// 设置加载状态和时间
	isLoading.value = true;
	lastLoadTime.value = now;

	// 显示加载中提示
	uni.showLoading({ title: '加载中...' });

	// 从后端API获取水果数据，使用缓存机制
	fruitService.getFruits({}, false) // 不强制刷新，使用缓存
		.then(res => {
			uni.hideLoading();
			console.log('从后端获取到的水果数据:', res);

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

			// 将API返回的数据转换为报价页面所需的格式
			fruitData.value = fruits.map(fruit => ({
				id: fruit.id,
				name: fruit.name,
				spec: fruit.spec,
				stock: fruit.inventory || fruit.stock || 0, // 使用inventory字段作为库存数量
				minPrice: fruit.min_price || fruit.minPrice || 0,
				maxPrice: fruit.max_price || fruit.maxPrice || 0,
				image: fruit.image || fruitService.getDefaultFruitImage(fruit.category),
				brand: fruit.brand,
				category: fruit.category,
				variety: fruit.variety,
				packageType: fruit.package_type || fruit.packageType,
				weight: fruit.weight
			}));

			console.log('从后端加载了报价数据');

			// 提取所有水果的品类，用于更新分类标签
			const categories = Array.from(new Set(fruitData.value.map(f => f.category).filter(Boolean)));
			fruitCategories.length = 0;
			fruitCategories.push(...categories);

			// 更新分类标签
			updateCategories();
		})
		.catch(err => {
			uni.hideLoading();
			uni.showToast({
				title: '获取水果列表失败，请重试',
				icon: 'none'
			});
			console.error('加载水果数据失败:', err);

			// 如果获取失败，使用空数组
			fruitData.value = [];
			// 即使没有数据也要更新分类标签
			updateCategories();
		})
		.finally(() => {
			// 无论成功失败，都重置加载状态
			isLoading.value = false;
		});
}
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
	padding-bottom: 50px; /* 使用底部tab栏的实际高度 */
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
	padding: 20rpx 30rpx;
	background-color: rgba(255, 255, 255, 0.8);
	backdrop-filter: blur(15px);
	-webkit-backdrop-filter: blur(15px);
	border-bottom: 1px solid rgba(0, 0, 0, 0.03);
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.03);
}

/* 使用统一搜索框样式 */

.price-category-container {
	background-color: rgba(255, 255, 255, 0.7);
	padding: 24rpx 0 28rpx;
	position: sticky;
	top: 0;
	z-index: 10;
	backdrop-filter: blur(10px);
	-webkit-backdrop-filter: blur(10px);
	border-bottom: 1px solid rgba(255, 255, 255, 0.8);
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
	position: relative;
	overflow: hidden;
}

/* 背景装饰元素 */
.category-bg-decoration {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	overflow: hidden;
	z-index: -1;
}

.category-bg-decoration::before {
	content: '';
	position: absolute;
	top: -100%;
	left: -100%;
	width: 300%;
	height: 300%;
	background: radial-gradient(circle at center, rgba(255, 255, 255, 0.2), transparent 70%);
	opacity: 0.8;
	animation: rotate 20s linear infinite;
}

.category-bg-decoration::after {
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background:
		linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
		linear-gradient(0deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
	background-size: 20px 20px;
	opacity: 0.3;
}

@keyframes rotate {
	0% {
		transform: rotate(0deg);
	}
	100% {
		transform: rotate(360deg);
	}
}

.price-category-scroll {
	width: 100%;
	white-space: nowrap;
	overflow-x: auto;
	-webkit-overflow-scrolling: touch;
	scrollbar-width: none;
	-ms-overflow-style: none;
	scroll-behavior: smooth;
}

/* 隐藏所有浏览器的滚动条 */
.price-category-scroll::-webkit-scrollbar {
	display: none;
	width: 0;
	height: 0;
	background: transparent;
}

.price-category-list {
	display: flex;
	padding: 0 24rpx;
	flex-wrap: nowrap;
	width: max-content;
	align-items: center;
}

.price-category-item {
	position: relative;
	padding: 14rpx 28rpx;
	margin-right: 24rpx;
	font-size: 26rpx;
	color: rgba(75, 85, 99, 0.8);
	transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	display: flex;
	align-items: center;
	justify-content: center;
	min-width: 120rpx;
	flex-shrink: 0;
	overflow: hidden;
	border-radius: 40rpx;
	background: rgba(255, 255, 255, 0.5);
	backdrop-filter: blur(5px);
	-webkit-backdrop-filter: blur(5px);
	border: 1px solid rgba(255, 255, 255, 0.7);
	box-shadow:
		0 4rpx 10rpx rgba(0, 0, 0, 0.03),
		inset 0 0 0 1px rgba(255, 255, 255, 0.5);
}

/* 内部光效元素 */
.category-item-glow {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: radial-gradient(circle at top right, rgba(255, 255, 255, 0.3), transparent 70%);
	opacity: 0;
	z-index: 1;
	transition: opacity 0.3s ease;
	pointer-events: none;
}

.price-category-item:hover .category-item-glow {
	opacity: 0.5;
}

.price-category-active .category-item-glow {
	background: radial-gradient(circle at center, rgba(255, 255, 255, 0.4), transparent 70%);
	opacity: 0.7;
	animation: pulse-glow 3s infinite alternate;
}

@keyframes pulse-glow {
	0% {
		opacity: 0.3;
	}
	100% {
		opacity: 0.7;
	}
}

.price-category-item:active {
	transform: scale(0.95);
	box-shadow:
		0 2rpx 5rpx rgba(0, 0, 0, 0.05),
		inset 0 0 0 1px rgba(255, 255, 255, 0.3);
}

.price-category-item:active::before {
	opacity: 1;
}

.price-category-active {
	color: white;
	background: linear-gradient(135deg, rgba(13, 148, 136, 0.9), rgba(15, 118, 110, 0.9));
	border: 1px solid rgba(255, 255, 255, 0.3);
	box-shadow:
		0 6rpx 15rpx rgba(13, 148, 136, 0.2),
		inset 0 0 0 1px rgba(255, 255, 255, 0.2);
	transform: translateY(-4rpx);
}

/* 活跃状态指示点 */
.active-indicator {
	position: absolute;
	bottom: -10rpx;
	left: 50%;
	transform: translateX(-50%);
	width: 8rpx;
	height: 8rpx;
	border-radius: 50%;
	background: rgba(13, 148, 136, 0.8);
	box-shadow: 0 0 10rpx 2rpx rgba(13, 148, 136, 0.5);
	animation: pulse 1.5s infinite;
	z-index: 3;
}

@keyframes pulse {
	0% {
		opacity: 0.6;
		transform: translateX(-50%) scale(1);
	}
	50% {
		opacity: 1;
		transform: translateX(-50%) scale(1.5);
	}
	100% {
		opacity: 0.6;
		transform: translateX(-50%) scale(1);
	}
}

.price-category-item .iconfont {
	margin-right: 10rpx;
	font-size: 28rpx;
	position: relative;
	z-index: 2;
	transition: transform 0.3s ease;
}

.price-category-active .iconfont {
	transform: scale(1.1);
}

.price-category-text {
	font-weight: 500;
	letter-spacing: 0.5rpx;
	position: relative;
	z-index: 2;
	display: inline-block;
	vertical-align: middle;
	transition: all 0.3s ease;
}

.price-category-active .price-category-text {
	font-weight: 600;
	text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.price-fruit-list-container {
	flex: 1;
	padding: 24rpx;
	box-sizing: border-box;
	width: 100%;
	overflow: -moz-scrollbars-none; /* Firefox */
	-ms-overflow-style: none; /* IE and Edge */
	scrollbar-width: none; /* Firefox */
	height: calc(100vh - 320rpx - 50px); /* 调整高度确保可滚动区域适合剩余空间，并为底部tab栏预留空间 */
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
	padding-bottom: 60rpx; /* 减少底部内边距，使最后一个卡片与底部距离更合理 */
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
	background-color: rgba(233, 226, 226, 0.341); /* 灰色背景 */
	padding: 8rpx 20rpx;
	border-radius: 20rpx;
	box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

/* 不同库存级别的文字颜色 */
.stock-high {
	color: #10B981; /* 高库存 - 绿色 */
}

.stock-medium {
	color: #F59E0B; /* 中等库存 - 黄色 */
}

.stock-low {
	color: #EF4444; /* 低库存 - 红色 */
}

.stock-empty {
	color: #6B7280; /* 无库存 - 灰色 */
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
	background-color: rgba(255, 255, 255, 0.8);
	padding: 8rpx 16rpx;
	border-radius: 16rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.date-text {
	font-size: 24rpx;
	color: #666;
	margin-left: 8rpx;
}
</style>