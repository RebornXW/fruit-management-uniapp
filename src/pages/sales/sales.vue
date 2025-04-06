<template>
	<view class="sales-container">
		<!-- 标题栏 -->
		<view class="bg-teal-600 text-white p-4">
			<view class="flex justify-between items-center">
				<text class="text-xl font-bold">水果销售</text>
				<view class="flex items-center space-x-3">
					<uni-icons type="calendar" size="20" color="#ffffff" class="mr-2"></uni-icons>
					<text>{{currentDate}}</text>
				</view>
			</view>
		</view>
		
		<!-- 销售统计卡片 -->
		<view class="bg-white m-4 p-4 rounded-xl shadow-sm">
			<view class="flex justify-between items-center mb-2">
				<text class="text-base font-bold">今日销售统计</text>
				<text class="text-sm text-teal-600" @tap="showStatistics">
					查看统计详情 <uni-icons type="right" size="14" color="#0D9488"></uni-icons>
				</text>
			</view>
			<view class="grid-stats mt-3">
				<view class="bg-teal-50 p-3 rounded-lg">
					<text class="text-xs text-gray-500">销售总额</text>
					<text class="text-xl font-bold text-teal-600 block">¥{{totalSalesAmount}}</text>
					<view class="flex items-center text-xs text-green-500 mt-1">
						<uni-icons type="top" size="12" color="#10B981" class="mr-1"></uni-icons>
						<text>10.5%</text>
					</view>
				</view>
				<view class="bg-blue-50 p-3 rounded-lg">
					<text class="text-xs text-gray-500">销售数量</text>
					<text class="text-xl font-bold text-blue-600 block">{{totalSalesQuantity}}箱</text>
					<view class="flex items-center text-xs text-green-500 mt-1">
						<uni-icons type="top" size="12" color="#10B981" class="mr-1"></uni-icons>
						<text>8.2%</text>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 快速销售区域 -->
		<view class="bg-white mx-4 p-4 rounded-xl shadow-sm mb-4">
			<view class="flex justify-between items-center mb-3">
				<text class="text-base font-bold">快速销售</text>
			</view>
			
			<!-- 搜索框 -->
			<view class="relative mb-4">
				<input v-model="searchText" type="text" placeholder="搜索水果名称..." class="w-full p-2 pl-10 rounded-lg border border-gray-300 text-sm" />
				<view class="absolute left-3 top-1/2 text-gray-400">
					<uni-icons type="search" size="18" color="#9CA3AF"></uni-icons>
				</view>
			</view>
			
			<!-- 水果列表 -->
			<view class="space-y-3">
				<view 
					v-for="fruit in filteredFruits" 
					:key="fruit.id"
					class="flex items-center p-3 bg-gray-50 rounded-lg"
					@tap="showSaleModal(fruit)"
				>
					<view class="w-14 h-14 bg-gray-200 rounded-lg overflow-hidden">
						<image :src="fruit.image" :alt="fruit.name" class="w-full h-full object-cover"></image>
					</view>
					<view class="ml-3 flex-1">
						<view class="flex justify-between">
							<view>
								<text class="font-bold">{{fruit.name}}</text>
								<text class="text-xs text-gray-500 block">{{fruit.spec}}</text>
							</view>
							<view class="text-right">
								<text class="text-sm text-teal-600">¥{{fruit.minPrice}} - ¥{{fruit.maxPrice}}</text>
								<text class="text-xs text-gray-400 block">库存: {{fruit.stock}}箱</text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 最近销售记录 -->
		<view class="bg-white mx-4 p-4 rounded-xl shadow-sm mb-20">
			<text class="text-base font-bold mb-3 block">最近销售记录</text>
			
			<view class="space-y-3">
				<view 
					v-for="(record, index) in salesRecords" 
					:key="index"
					:class="['pb-3', index < salesRecords.length - 1 ? 'border-b border-gray-100' : '']"
				>
					<view class="flex justify-between items-center">
						<view class="flex items-center">
							<view class="w-10 h-10 bg-gray-200 rounded overflow-hidden mr-3">
								<image :src="record.image" :alt="record.name" class="w-full h-full object-cover"></image>
							</view>
							<view>
								<text class="font-medium">{{record.name}}</text>
								<text class="text-xs text-gray-500 block">{{record.quantity}}箱 × ¥{{record.price}}</text>
							</view>
						</view>
						<view class="text-right">
							<text class="font-bold text-teal-600">¥{{record.total}}</text>
							<text class="text-xs text-gray-400 block">{{record.time}}</text>
						</view>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 销售确认弹窗 -->
		<uni-popup ref="salePopup" type="center">
			<view class="bg-white rounded-xl w-5/6 p-5">
				<view class="flex justify-between items-center mb-4">
					<text class="text-xl font-bold">{{currentFruit.name}}</text>
					<text class="text-gray-500" @tap="closePopup">
						<uni-icons type="close" size="20" color="#6B7280"></uni-icons>
					</text>
				</view>
				<view class="mb-4 text-center">
					<view class="w-24 h-24 bg-gray-200 rounded overflow-hidden mx-auto mb-2">
						<image :src="currentFruit.image" :alt="currentFruit.name" class="w-full h-full object-cover"></image>
					</view>
				</view>
				
				<view class="mb-4">
					<text class="block text-sm font-medium mb-1">销售价格（元/箱）</text>
					<view class="relative">
						<text class="absolute left-3 top-1/2 text-gray-500">¥</text>
						<input 
							type="digit" 
							v-model="salePrice" 
							class="w-full p-2 pl-8 pr-3 rounded-lg border border-gray-300 text-right font-bold text-teal-600" 
							step="0.1" 
							min="0"
						/>
					</view>
					<view class="text-xs text-gray-500 mt-1 text-right">
						参考价格: ¥{{currentFruit.minPrice}} - ¥{{currentFruit.maxPrice}}/箱
					</view>
				</view>
				
				<view class="mb-4">
					<text class="block text-sm font-medium mb-1">销售数量</text>
					<view class="flex items-center justify-between bg-gray-100 rounded-lg">
						<button class="w-12 h-12 flex items-center justify-center text-gray-600" @tap="decrementQuantity">
							<uni-icons type="minus" size="20" color="#4B5563"></uni-icons>
						</button>
						<text class="font-bold text-xl">{{saleQuantity}}</text>
						<button class="w-12 h-12 flex items-center justify-center text-gray-600" @tap="incrementQuantity">
							<uni-icons type="plus" size="20" color="#4B5563"></uni-icons>
						</button>
					</view>
					<text class="text-sm text-gray-500 mt-1">库存: {{currentFruit.stock}}箱</text>
				</view>
				
				<view class="mb-6 bg-teal-50 p-3 rounded-lg">
					<view class="flex justify-between items-center">
						<text class="text-sm font-medium">销售总价:</text>
						<text class="text-xl font-bold text-teal-600">¥{{totalPrice}}</text>
					</view>
				</view>
				
				<view class="flex gap-2">
					<button class="flex-1 bg-teal-600 text-white py-3 rounded-lg" @tap="confirmSale">
						确认销售
					</button>
				</view>
			</view>
		</uni-popup>
		
		<!-- 统计详情弹窗 -->
		<uni-popup ref="statisticsPopup" type="center">
			<view class="bg-white rounded-xl w-5/6 max-h-4/5 overflow-y-auto p-5">
				<view class="flex justify-between items-center mb-4">
					<text class="text-xl font-bold">销售统计详情</text>
					<text class="text-gray-500" @tap="closeStatisticsPopup">
						<uni-icons type="close" size="20" color="#6B7280"></uni-icons>
					</text>
				</view>
				
				<view class="mb-4">
					<text class="block text-sm font-medium mb-2">今日销售趋势</text>
					<!-- 此处在实际应用中应该使用图表组件 -->
					<view class="bg-gray-100 h-40 rounded-lg flex items-center justify-center">
						<text class="text-gray-500">图表数据展示区域</text>
					</view>
				</view>
				
				<view class="mb-4">
					<text class="block text-sm font-medium mb-2">销售排行榜</text>
					<view class="space-y-2">
						<view 
							v-for="(item, index) in salesRanking" 
							:key="index"
							class="flex items-center bg-gray-50 p-2 rounded-lg"
						>
							<text class="w-6 h-6 flex items-center justify-center rounded-full bg-teal-600 text-white text-xs mr-2">{{index + 1}}</text>
							<text class="flex-1 font-medium">{{item.name}}</text>
							<text class="text-teal-600 font-bold">¥{{item.amount}}</text>
						</view>
					</view>
				</view>
				
				<button class="w-full bg-gray-200 text-gray-700 py-2 rounded-lg mt-4" @tap="closeStatisticsPopup">
					关闭
				</button>
			</view>
		</uni-popup>
		
		<!-- 底部TabBar -->
		<custom-tab-bar></custom-tab-bar>
	</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import uniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue';
import uniPopup from '@dcloudio/uni-ui/lib/uni-popup/uni-popup.vue';
import CustomTabBar from '@/components/CustomTabBar.vue';

// 数据
const searchText = ref('');
const fruitData = ref([]);
const currentFruit = ref({});
const salePrice = ref(0);
const saleQuantity = ref(1);
const salesRecords = ref([]);
const currentDate = ref('');
const totalSalesAmount = ref('2,586');
const totalSalesQuantity = ref(56);

// 销售排行榜数据
const salesRanking = ref([
	{ name: '明牌阿克苏苹果', amount: 875 },
	{ name: '红富士苹果', amount: 650 },
	{ name: '砀山梨', amount: 420 },
	{ name: '新鲜橘子', amount: 380 },
	{ name: '富士山苹果', amount: 261 }
]);

// 过滤后的水果数据
const filteredFruits = computed(() => {
	if (!searchText.value) return fruitData.value;
	
	return fruitData.value.filter(fruit => 
		fruit.name.includes(searchText.value) || 
		fruit.spec.includes(searchText.value)
	);
});

// 计算销售总价
const totalPrice = computed(() => {
	return (salePrice.value * saleQuantity.value).toFixed(2);
});

// 获取弹窗组件引用
const salePopup = ref(null);
const statisticsPopup = ref(null);

// 显示销售弹窗
function showSaleModal(fruit) {
	currentFruit.value = fruit;
	salePrice.value = fruit.minPrice;
	saleQuantity.value = 1;
	salePopup.value.open();
}

// 显示统计详情弹窗
function showStatistics() {
	statisticsPopup.value.open();
}

// 关闭弹窗
function closePopup() {
	salePopup.value.close();
}

// 关闭统计详情弹窗
function closeStatisticsPopup() {
	statisticsPopup.value.close();
}

// 减少销售数量
function decrementQuantity() {
	if (saleQuantity.value > 1) {
		saleQuantity.value--;
	}
}

// 增加销售数量
function incrementQuantity() {
	if (saleQuantity.value < currentFruit.value.stock) {
		saleQuantity.value++;
	} else {
		uni.showToast({
			title: '超出库存数量',
			icon: 'none'
		});
	}
}

// 确认销售
function confirmSale() {
	if (saleQuantity.value > currentFruit.value.stock) {
		uni.showToast({
			title: '库存不足',
			icon: 'none'
		});
		return;
	}
	
	if (salePrice.value <= 0) {
		uni.showToast({
			title: '请输入有效价格',
			icon: 'none'
		});
		return;
	}
	
	// 更新库存
	const index = fruitData.value.findIndex(f => f.id === currentFruit.value.id);
	if (index !== -1) {
		fruitData.value[index].stock -= saleQuantity.value;
	}
	
	// 添加销售记录
	const now = new Date();
	const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
	const newRecord = {
		name: currentFruit.value.name,
		image: currentFruit.value.image,
		quantity: saleQuantity.value,
		price: parseFloat(salePrice.value).toFixed(2),
		total: parseFloat(totalPrice.value).toFixed(2),
		time: time
	};
	
	salesRecords.value.unshift(newRecord);
	
	// 限制记录数量
	if (salesRecords.value.length > 10) {
		salesRecords.value = salesRecords.value.slice(0, 10);
	}
	
	// 在实际应用中，这里应该调用API保存销售记录
	uni.showToast({
		title: '销售成功',
		icon: 'success'
	});
	
	closePopup();
}

// 页面加载时获取数据
onMounted(() => {
	// 设置当前日期
	const now = new Date();
	currentDate.value = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
	
	// 加载水果数据
	loadFruitData();
	
	// 加载销售记录
	loadSalesRecords();
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

// 加载销售记录
function loadSalesRecords() {
	// 模拟销售记录数据
	salesRecords.value = [
		{ name: "明牌阿克苏苹果", quantity: 2, price: "55.00", total: "110.00", time: "10:25", image: "https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?q=80&w=300" },
		{ name: "红富士苹果", quantity: 5, price: "48.00", total: "240.00", time: "09:15", image: "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab12?q=80&w=300" },
		{ name: "砀山梨", quantity: 3, price: "32.00", total: "96.00", time: "08:47", image: "https://images.unsplash.com/photo-1594502184342-2349ffc9ead3?q=80&w=300" }
	];
}
</script>

<style>
.sales-container {
	display: flex;
	flex-direction: column;
	height: 100vh;
	padding-bottom: 100rpx; /* 为底部导航栏留出空间 */
}

.bg-teal-600 {
	background-color: #0D9488;
}

.text-teal-600 {
	color: #0D9488;
}

.bg-teal-50 {
	background-color: #F0FDFA;
}

.bg-blue-50 {
	background-color: #EFF6FF;
}

.text-blue-600 {
	color: #2563EB;
}

.text-green-500 {
	color: #10B981;
}

.space-y-3 > view:not(:first-child) {
	margin-top: 0.75rem;
}

.grid-stats {
	display: flex;
	justify-content: space-between;
	gap: 1rem;
}

.grid-stats > view {
	flex: 1;
}
</style> 