<template>
	<view class="price-container">
		<!-- 头部 -->
		<view class="header bg-teal-600 text-white p-4">
			<view class="flex justify-between items-center">
				<text class="text-xl font-bold">今日报价 <text class="text-sm font-medium ml-2">{{currentDate}}</text></text>
				<text class="iconfont icon-more"></text>
			</view>
			
			<!-- 搜索框 -->
			<view class="mt-4 search-container">
				<view class="search-box">
					<input v-model="searchText" type="text" placeholder="搜索水果..." class="search-input" />
					<text class="iconfont icon-search search-icon"></text>
				</view>
			</view>
		</view>
		
		<!-- 分类标签 - 固定在头部下方 -->
		<view class="category-container">
			<scroll-view scroll-x class="category-scroll">
				<view class="category-list">
					<view 
						v-for="(category, index) in categories" 
						:key="index"
						class="category-item"
						:class="{ 'category-active': currentCategory === category.value }"
						@tap="selectCategory(category.value)"
					>
						<text class="iconfont" :class="category.icon"></text>
						<text class="category-text">{{category.label}}</text>
					</view>
				</view>
			</scroll-view>
		</view>
		
		<!-- 水果展示区 -->
		<scroll-view scroll-y class="fruit-list-container">
			<view class="fruit-list">
				<view 
					v-for="fruit in filteredFruits" 
					:key="fruit.id"
					class="fruit-card"
					@tap="showPriceAdjust(fruit)"
				>
					<view class="fruit-content">
						<view class="fruit-image-container">
							<image :src="fruit.image" :alt="fruit.name" class="fruit-image"></image>
						</view>
						<view class="fruit-info">
							<view class="fruit-header">
								<text class="fruit-name">{{fruit.name}}</text>
							</view>
							<text class="fruit-spec">{{fruit.spec}}</text>
							<view class="fruit-footer">
								<view class="fruit-stock">
									<text class="stock-text">
										库存: {{fruit.stock}}箱
									</text>
								</view>
								<view class="fruit-price-container">
									<text class="fruit-price">
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
		<uni-popup ref="pricePopup" type="bottom">
			<view class="bg-white rounded-t-xl w-full p-4">
				<view class="flex justify-between items-center mb-4">
					<text class="text-lg font-bold">调整价格区间</text>
					<text class="text-gray-500" @tap="closePopup">✕</text>
				</view>
				<view class="space-y-4">
					<view class="p-3 bg-gray-50 rounded-lg">
						<text class="font-medium">{{currentFruit.name}}</text>
						<text class="text-sm text-gray-500">{{currentFruit.spec}}</text>
					</view>
					<view>
						<text class="block text-sm font-medium text-gray-700 mb-1">最低价格</text>
						<view class="flex items-center space-x-2">
							<text class="text-xl font-bold text-teal-600 w-16">¥{{minPrice}}</text>
							<slider 
								:min="10" :max="200" :value="minPrice" 
								@change="onMinPriceChange" 
								activeColor="#0D9488"
								class="flex-1"
							/>
						</view>
					</view>
					<view>
						<text class="block text-sm font-medium text-gray-700 mb-1">最高价格</text>
						<view class="flex items-center space-x-2">
							<text class="text-xl font-bold text-teal-600 w-16">¥{{maxPrice}}</text>
							<slider 
								:min="10" :max="200" :value="maxPrice" 
								@change="onMaxPriceChange" 
								activeColor="#0D9488"
								class="flex-1"
							/>
						</view>
					</view>
					<view class="bg-teal-50 p-3 rounded-lg">
						<view class="flex justify-between">
							<text class="text-sm">价格区间：</text>
							<text class="font-medium text-teal-600">¥{{minPrice}} - ¥{{maxPrice}}</text>
						</view>
					</view>
					<button 
						class="w-full bg-teal-600 text-white py-3 rounded-lg font-medium"
						@tap="confirmPriceAdjust"
					>
						确认调整
					</button>
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
		minPrice.value = maxPrice.value;
	}
}

// 确认价格调整
function confirmPriceAdjust() {
	const index = fruitData.value.findIndex(f => f.id === currentFruit.value.id);
	if (index !== -1) {
		fruitData.value[index].minPrice = minPrice.value;
		fruitData.value[index].maxPrice = maxPrice.value;
		// 在实际应用中，这里应该调用API保存数据
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
});

// 加载水果数据
function loadFruitData() {
	// 模拟从服务器获取数据
	// 实际应用中，这里应该是API调用
	fruitData.value = [
		{ id: 1, name: "明牌阿克苏苹果", spec: "85#光果13斤箱装", stock: 35, minPrice: 50, maxPrice: 60, image: "https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?q=80&w=300" },
		{ id: 2, name: "红富士苹果", spec: "80#12斤纸箱装", stock: 42, minPrice: 45, maxPrice: 55, image: "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab12?q=80&w=300" },
		{ id: 3, name: "砀山梨", spec: "优级10斤装", stock: 28, minPrice: 30, maxPrice: 35, image: "https://images.unsplash.com/photo-1594502184342-2349ffc9ead3?q=80&w=300" },
		{ id: 4, name: "新鲜橘子", spec: "5斤精品袋装", stock: 15, minPrice: 25, maxPrice: 30, image: "https://images.unsplash.com/photo-1519096989031-2aee4ffe17c6?q=80&w=300" }
	];
}
</script>

<style>
.price-container {
	display: flex;
	flex-direction: column;
	height: 100vh;
	padding-bottom: 100rpx; /* 为底部导航栏留出空间 */
}

.header {
	background-color: #0D9488;
}

/* 搜索框优化 */
.search-container {
	padding: 0 4rpx;
}

.search-box {
	position: relative;
	background-color: rgba(255, 255, 255, 0.9);
	border-radius: 32rpx;
	height: 72rpx;
	display: flex;
	align-items: center;
}

.search-input {
	height: 100%;
	width: 100%;
	padding: 0 40rpx 0 80rpx;
	font-size: 28rpx;
	color: #333;
}

.search-icon {
	position: absolute;
	left: 32rpx;
	font-size: 32rpx;
	color: #9CA3AF;
}

/* 分类标签优化 - 固定在头部下方 */
.category-container {
	background-color: #F8FAFC;
	padding: 20rpx 0;
	border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);
	position: sticky;
	top: 0;
	z-index: 10;
}

.category-scroll {
	width: 100%;
}

.category-list {
	display: flex;
	padding: 0 20rpx;
}

.category-item {
	padding: 14rpx 28rpx;
	margin-right: 20rpx;
	background: linear-gradient(145deg, rgba(255,255,255,0.95), rgba(248,250,252,0.85));
	border-radius: 16rpx;
	font-size: 26rpx;
	color: #4B5563;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03), inset 0 1rpx 2rpx rgba(255, 255, 255, 0.9);
	transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	border: 1rpx solid rgba(255, 255, 255, 0.6);
	display: flex;
	align-items: center;
	justify-content: center;
	backdrop-filter: blur(8rpx);
	position: relative;
	overflow: hidden;
	text-align: center;
}

.category-item::after {
	content: "";
	position: absolute;
	top: 0;
	left: -150%;
	width: 120%;
	height: 100%;
	background: linear-gradient(90deg, 
		rgba(255,255,255,0) 0%, 
		rgba(255,255,255,0.2) 50%, 
		rgba(255,255,255,0) 100%);
	transform: skewX(-25deg);
	transition: all 0.6s ease;
	z-index: 1;
	border-radius: 16rpx;
}

.category-item:hover {
	transform: none;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03), inset 0 1rpx 2rpx rgba(255, 255, 255, 0.9);
	border-radius: 16rpx;
}

.category-item:hover::after {
	left: 150%;
	border-radius: 16rpx;
}

.category-item:active {
	transform: scale(0.95) translateY(2rpx);
	box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1), inset 0 1rpx 1rpx rgba(255, 255, 255, 0.7);
	transition: all 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
	border-radius: 16rpx;
}

.category-active {
	background: linear-gradient(145deg, #12B886, #0D9488);
	color: white;
	border-color: rgba(255, 255, 255, 0.2);
	box-shadow: 0 8rpx 16rpx rgba(13, 148, 136, 0.2), inset 0 1rpx 3rpx rgba(255, 255, 255, 0.3);
	text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.1);
	border-radius: 16rpx;
}

.category-active:hover {
	transform: none;
	box-shadow: 0 8rpx 16rpx rgba(13, 148, 136, 0.2), inset 0 1rpx 3rpx rgba(255, 255, 255, 0.3);
	background: linear-gradient(145deg, #10B981, #0D9488);
	border-radius: 16rpx;
}

.category-active:active {
	transform: scale(0.95) translateY(2rpx);
	box-shadow: 0 4rpx 8rpx rgba(13, 148, 136, 0.2), inset 0 1rpx 2rpx rgba(255, 255, 255, 0.2);
	border-radius: 16rpx;
}

.category-item .iconfont {
	margin-right: 6rpx;
	font-size: 28rpx;
	transition: all 0.3s ease;
	position: relative;
	z-index: 2;
	display: inline-block;
	vertical-align: middle;
}

.category-active .iconfont {
	transform: translateY(-1rpx);
	text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.2);
}

.category-text {
	font-weight: 500;
	letter-spacing: 0.5rpx;
	position: relative;
	z-index: 2;
	display: inline-block;
	vertical-align: middle;
}

/* 水果列表优化 */
.fruit-list-container {
	flex: 1;
	padding: 24rpx 24rpx 0;
	box-sizing: border-box;
	width: 100%;
	background-color: #F5F8FA;
}

.fruit-list {
	display: flex;
	flex-direction: column;
	width: 100%;
}

.fruit-card {
	background-color: white;
	border-radius: 16rpx;
	margin-bottom: 24rpx;
	overflow: hidden;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
	width: 100%;
	box-sizing: border-box;
	transition: transform 0.3s;
}

.fruit-card:active {
	transform: scale(0.98);
}

.fruit-content {
	display: flex;
	padding: 24rpx;
	width: 100%;
	box-sizing: border-box;
	border-left: 8rpx solid #0D9488;
}

.fruit-image-container {
	width: 140rpx;
	height: 140rpx;
	border-radius: 12rpx;
	overflow: hidden;
	flex-shrink: 0;
	background-color: #F3F4F6;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.fruit-image {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.fruit-info {
	flex: 1;
	margin-left: 24rpx;
	display: flex;
	flex-direction: column;
	width: calc(100% - 164rpx);
	overflow: hidden;
}

.fruit-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: 12rpx;
	width: 100%;
}

.fruit-name {
	font-weight: bold;
	font-size: 30rpx;
	color: #333;
	max-width: 100%;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.fruit-price-container {
	background: linear-gradient(135deg, #FEF3C7, #FECACA);
	padding: 10rpx 20rpx;
	border-radius: 20rpx;
	box-shadow: 0 2rpx 6rpx rgba(236, 72, 153, 0.15);
}

.fruit-price {
	color: #9D174D;
	font-weight: bold;
	font-size: 28rpx;
	flex-shrink: 0;
}

.fruit-spec {
	font-size: 24rpx;
	color: #6B7280;
	margin-bottom: 20rpx;
	background-color: #F9FAFB;
	padding: 6rpx 12rpx;
	border-radius: 8rpx;
	display: inline-block;
}

.fruit-footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: auto;
}

.fruit-stock {
	display: flex;
	align-items: center;
}

.stock-text {
	font-size: 22rpx;
	background-color: #E6FFFA;
	color: #0D9488;
	padding: 8rpx 20rpx;
	border-radius: 20rpx;
	box-shadow: 0 2rpx 4rpx rgba(13, 148, 136, 0.1);
}

.bg-teal-600 {
	background-color: #0D9488;
}

.text-teal-600 {
	color: #0D9488;
}

.border-teal-600 {
	border-color: #0D9488;
}

.bg-teal-100 {
	background-color: #E6FFFA;
}

.bg-teal-50 {
	background-color: #F0FDFA;
}

.space-y-4 > view:not(:first-child) {
	margin-top: 1rem;
}
</style> 