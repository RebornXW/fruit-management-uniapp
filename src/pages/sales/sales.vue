<template>
	<view class="sales-container">
		<!-- 标题栏 -->
		<view class="sales-header">
			<view class="sales-header-content">
				<text class="sales-title">水果销售</text>
				<view class="sales-date-display">
					<uni-icons type="calendar" size="20" color="#ffffff" class="sales-date-icon"></uni-icons>
					<text class="sales-date-text">{{currentDate}}</text>
				</view>
			</view>
		</view>

		<!-- 滚动内容区域 -->
		<scroll-view scroll-y class="sales-content-scroll">
			<!-- 销售统计卡片 -->
			<view class="sales-stats-card">
				<view class="sales-card-header">
					<text class="sales-card-title">今日销售统计</text>
					<text class="sales-view-more" @tap="showStatistics">
						查看统计详情 <uni-icons type="right" size="14" color="#0D9488"></uni-icons>
					</text>
				</view>
				<view class="sales-stats-grid">
					<view class="sales-stats-item sales-amount-item">
						<text class="sales-stats-label">销售总额</text>
						<text class="sales-stats-value">¥{{totalSalesAmount}}</text>
					</view>
					<view class="sales-stats-item sales-quantity-item">
						<text class="sales-stats-label">销售数量</text>
						<text class="sales-stats-value">{{totalSalesQuantity}}箱</text>
					</view>
					<view class="sales-stats-item sales-customer-count-item">
						<text class="sales-stats-label">客户数量</text>
						<text class="sales-stats-value">{{totalCustomers}}</text>
					</view>
					<view class="sales-stats-item sales-unpaid-item">
						<text class="sales-stats-label">未收款金额</text>
						<text class="sales-stats-value">¥{{totalUnpaidAmount}}</text>
					</view>
				</view>
			</view>

			<!-- 快速销售区域 -->
			<view class="sales-quick-card">
				<view class="sales-card-header">
					<text class="sales-card-title">快速销售</text>
				</view>

				<!-- 搜索框 -->
				<view class="sales-search-container">
					<input v-model="searchText" type="text" placeholder="搜索水果名称..." class="sales-search-input" />
					<view class="sales-search-icon-container">
						<uni-icons type="search" size="18" color="#9CA3AF"></uni-icons>
					</view>
				</view>

				<!-- 水果列表 -->
				<scroll-view scroll-x class="sales-fruits-scroll" :show-scrollbar="false">
					<view class="sales-fruits-list">
						<view
							v-for="fruit in filteredFruits"
							:key="fruit.id"
							class="sales-fruit-item"
							@tap="showSaleModal(fruit)"
						>
							<view class="sales-fruit-image-container">
								<image :src="fruit.image" :alt="fruit.name" class="sales-fruit-image"></image>
							</view>
							<view class="sales-fruit-info">
								<view class="sales-fruit-content">
									<view class="sales-fruit-details">
										<text class="sales-fruit-name">{{fruit.name}}</text>
										<text class="sales-fruit-spec">{{fruit.spec}}</text>
									</view>
									<view class="sales-fruit-price-info">
										<text class="sales-fruit-price">¥{{fruit.minPrice}} - ¥{{fruit.maxPrice}}</text>
										<text class="sales-fruit-stock">库存: {{fruit.stock}}箱</text>
									</view>
								</view>
							</view>
						</view>
						<view v-if="filteredFruits.length === 0" class="sales-empty-state">
							<text class="sales-empty-text">暂无水果数据</text>
							<text class="sales-empty-subtext">请先在库存管理中添加水果</text>
						</view>
					</view>
				</scroll-view>
			</view>

			<!-- 最近销售记录 -->
			<view class="sales-history-card">
				<text class="sales-card-title">最近销售记录</text>

				<view class="sales-history-list">
					<view
						v-for="(record, index) in salesRecords"
						:key="index"
						:class="['sales-history-item', index < salesRecords.length - 1 ? 'sales-history-border' : '']"
					>
						<view class="sales-history-content">
							<!-- 左侧图标区域 -->
							<view class="sales-history-image-container">
								<uni-icons type="cart" size="24" color="#0D9488"></uni-icons>
							</view>

							<!-- 左侧商品信息区域 -->
							<view class="sales-history-left">
								<!-- 商品名称 -->
								<text class="sales-history-name">{{record.productName}}</text>
								<!-- 数量和单价 -->
								<text class="sales-history-quantity">{{record.quantity}}件 × ¥{{record.unitPrice}}</text>
							</view>

							<!-- 中间信息区域 -->
							<view class="sales-history-middle">
								<!-- 上部：客户名称 -->
								<text class="sales-history-customer-name">{{record.customerName}}</text>

								<!-- 下部：日期 -->
								<text class="sales-history-date">{{record.date}}</text>
							</view>

							<!-- 右侧区域 -->
							<view class="sales-history-right">
								<!-- 上部：总价 -->
								<text class="sales-history-total">¥{{record.amount}}</text>

								<!-- 下部：付款状态 -->
								<text :class="['sales-history-payment-status', record.status === '已付款' ? 'status-paid' : 'status-unpaid']">{{record.status}}</text>
							</view>
						</view>
					</view>
					<view v-if="salesRecords.length === 0" class="sales-empty-state">
						<text class="sales-empty-text">暂无销售记录</text>
						<text class="sales-empty-subtext">完成销售后将在此显示</text>
					</view>
				</view>
			</view>
		</scroll-view>

		<!-- 销售确认弹窗 -->
		<uni-popup ref="salePopup" type="center">
			<view class="sales-popup-container">
				<view class="sales-popup-header">
					<view class="sales-popup-title-container">
						<text class="sales-popup-title">{{currentFruit.name}}</text>
						<text class="sales-popup-spec">{{currentFruit.spec}}</text>
					</view>
					<text class="sales-popup-close" @tap="closePopup">
						<uni-icons type="closeempty" size="20" color="#6B7280"></uni-icons>
					</text>
				</view>
				<view class="sales-popup-image-container">
					<image :src="currentFruit.image" :alt="currentFruit.name" class="sales-popup-image"></image>
				</view>

				<!-- 客户选择 -->
				<view class="sales-popup-form-item">
					<text class="sales-popup-label">选择客户</text>
					<view class="sales-popup-customer-selector" @tap="showCustomerSelector">
						<text class="sales-popup-customer-name">{{selectedCustomer.name || '选择客户'}}</text>
						<uni-icons type="right" size="16" color="#6B7280"></uni-icons>
					</view>
				</view>

				<view class="sales-popup-form-item">
					<text class="sales-popup-label">销售价格（元/箱）</text>
					<view class="sales-popup-price-input">
						<text class="sales-popup-currency">¥</text>
						<input
							type="digit"
							v-model="salePrice"
							class="sales-popup-input"
							step="0.1"
							min="0"
						/>
					</view>
					<view class="sales-popup-price-hint">
						参考价格: ¥{{currentFruit.minPrice}} - ¥{{currentFruit.maxPrice}}/箱
					</view>
				</view>

				<view class="sales-popup-form-item">
					<text class="sales-popup-label">销售数量</text>
					<view class="sales-popup-quantity-wrapper">
						<button class="sales-popup-quantity-btn" @tap="decrementQuantity">
							<text class="iconfont icon-minus"></text>
						</button>
						<input
							type="number"
							v-model="saleQuantity"
							class="sales-popup-quantity-input"
							@input="validateQuantity"
						/>
						<button class="sales-popup-quantity-btn" @tap="incrementQuantity">
							<text class="iconfont icon-add"></text>
						</button>
					</view>
					<text class="sales-popup-stock">库存: {{currentFruit.stock}}箱</text>
				</view>

				<view class="sales-popup-total">
					<view class="sales-popup-total-content">
						<text class="sales-popup-total-label">销售总价:</text>
						<text class="sales-popup-total-value">¥{{totalPrice}}</text>
					</view>
				</view>

				<view class="sales-popup-payment-option">
					<text class="sales-popup-label">是否全款</text>
					<switch :checked="isFullPayment" @change="togglePaymentStatus" color="#0D9488" class="sales-popup-switch" />
					<text :class="['sales-popup-payment-status', isFullPayment ? 'status-paid' : 'status-unpaid']">{{ isFullPayment ? '已付款' : '未付款' }}</text>
				</view>

				<view class="sales-popup-actions">
					<button class="sales-popup-confirm-btn" @tap="confirmSale">
						确认销售
					</button>
				</view>
			</view>
		</uni-popup>

		<!-- 客户选择弹窗 -->
		<uni-popup ref="customerSelectorPopup" type="bottom">
			<view class="customer-selector-container">
				<view class="customer-selector-header">
					<text class="customer-selector-title">选择客户</text>
					<text class="customer-selector-close" @tap="closeCustomerSelector">
						<uni-icons type="close" size="20" color="#6B7280"></uni-icons>
					</text>
				</view>

				<view class="customer-selector-search">
					<uni-icons type="search" size="18" color="#9CA3AF"></uni-icons>
					<input
						v-model="customerSearchText"
						type="text"
						placeholder="搜索客户名称..."
						class="customer-search-input"
					/>
				</view>

				<scroll-view scroll-y class="customer-selector-list">
					<view
						v-for="customer in filteredCustomersList"
						:key="customer.id"
						class="customer-selector-item"
						@tap="selectCustomer(customer)"
					>
						<text class="customer-selector-name">{{customer.name}}</text>
						<text class="customer-selector-phone">{{customer.phone}}</text>
					</view>
				</scroll-view>
			</view>
		</uni-popup>

		<!-- 统计详情弹窗 -->
		<uni-popup ref="statisticsPopup" type="center">
			<view class="sales-stats-popup">
				<view class="sales-stats-header">
					<text class="sales-stats-title">销售统计详情</text>
					<text class="sales-stats-close" @tap="closeStatisticsPopup">
						<uni-icons type="closeempty" size="20" color="#6B7280"></uni-icons>
					</text>
				</view>

				<!-- 1. 销售趋势图 -->
				<view class="sales-stats-section">
					<text class="sales-stats-section-title">销售趋势图</text>
					<view class="sales-chart-container">
						<view class="sales-chart-legend">
							<view class="sales-chart-legend-item">
								<view class="sales-chart-legend-color sales-amount-color"></view>
								<text class="sales-chart-legend-text">销售额</text>
							</view>
						</view>
						<view class="sales-chart">
							<!-- 横坐标轴 -->
							<view class="sales-chart-axis-x">
								<text v-for="(day, index) in salesTrend.days" :key="index" class="sales-chart-label">{{day}}</text>
							</view>
							<!-- 图表主体 -->
							<view class="sales-chart-body">
								<!-- 销售额折线图 -->
								<view class="sales-chart-line">
									<view
										v-for="(amount, index) in salesTrend.amounts"
										:key="index"
										class="sales-chart-point sales-amount-point"
										:style="{bottom: amount + '%', left: (index * 16.66) + '%'}"
									></view>
									<!-- 连接线 -->
									<view class="sales-chart-line-path"></view>
								</view>
							</view>
						</view>
					</view>
				</view>

				<!-- 3. 主要客户销售额排名 -->
				<view class="sales-stats-section">
					<text class="sales-stats-section-title">主要客户销售额排名</text>
					<view class="sales-customer-ranking">
						<view
							v-for="(customer, index) in customerRanking"
							:key="index"
							class="sales-customer-item"
						>
							<view class="sales-customer-rank">
								<text class="sales-customer-rank-number">{{index + 1}}</text>
							</view>
							<view class="sales-customer-info">
								<text class="sales-customer-name">{{customer.name}}</text>
								<view class="sales-customer-progress-container">
									<view class="sales-customer-progress-bg">
										<view
											class="sales-customer-progress"
											:style="{width: customer.percentage + '%'}"
										></view>
									</view>
									<text class="sales-customer-amount">¥{{customer.amount}}</text>
								</view>
							</view>
						</view>
						<!-- 空状态显示 -->
						<view v-if="customerRanking.length === 0" class="sales-empty-state">
							<text class="sales-empty-text">暂无客户销售数据</text>
							<text class="sales-empty-subtext">完成销售后将在此显示</text>
						</view>
					</view>
				</view>

				<!-- 4. 热销水果排行榜 -->
				<view class="sales-stats-section">
					<text class="sales-stats-section-title">热销水果排行榜</text>
					<view class="sales-ranking-list">
						<view
							v-for="(item, index) in topSellingFruits"
							:key="index"
							class="sales-ranking-item"
						>
							<text class="sales-ranking-badge" :class="'rank-' + (index + 1)">
								{{index + 1}}
							</text>
							<view class="sales-ranking-content">
								<view class="sales-ranking-fruit-info">
									<text class="sales-ranking-name">{{item.name}}</text>
									<text class="sales-ranking-spec">{{item.spec}}</text>
								</view>
								<view class="sales-ranking-data">
									<text class="sales-ranking-amount">¥{{item.amount}}</text>
									<text class="sales-ranking-quantity">{{item.quantity}}箱</text>
								</view>
							</view>
						</view>
						<!-- 空状态显示 -->
						<view v-if="topSellingFruits.length === 0" class="sales-empty-state">
							<text class="sales-empty-text">暂无水果销售数据</text>
							<text class="sales-empty-subtext">完成销售后将在此显示</text>
						</view>
					</view>
				</view>

				<button class="sales-popup-close-btn" @tap="closeStatisticsPopup">
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
import { addSalesRecord } from '@/services/salesRecordService.js';
import { updateCustomerDebtInfo } from '@/services/customerService.js';

// 数据
const searchText = ref('');
const fruitData = ref([]);
const currentFruit = ref({});
const salePrice = ref(0);
const saleQuantity = ref(1);
const salesRecords = ref([]);
const currentDate = ref('');
const isFullPayment = ref(true); // 默认为全款
// 销售统计数据
const totalSalesAmount = computed(() => {
	// 计算今日销售总额
	// 过滤出今日销售记录（简化处理，实际应用中应该比较日期）
	const todaySales = salesRecords.value;

	// 计算总额
	const total = todaySales.reduce((sum, record) => {
		return sum + parseFloat(record.amount || record.total || 0);
	}, 0);

	// 格式化为带千位分隔符的字符串
	return total.toLocaleString('zh-CN');
});

const totalSalesQuantity = computed(() => {
	// 计算今日销售总数量
	// 过滤出今日销售记录
	const todaySales = salesRecords.value;

	// 计算总数量
	return todaySales.reduce((sum, record) => {
		return sum + parseInt(record.quantity || 0);
	}, 0);
});

// 计算今日客户数量
const totalCustomers = computed(() => {
	// 过滤出今日销售记录
	const todaySales = salesRecords.value;

	// 使用Set来去除重复客户
	const uniqueCustomers = new Set();
	todaySales.forEach(record => {
		if (record.customerName) {
			uniqueCustomers.add(record.customerName);
		} else if (record.customer && record.customer.name) {
			uniqueCustomers.add(record.customer.name);
		}
	});

	return uniqueCustomers.size;
});

// 计算今日未收款金额
const totalUnpaidAmount = computed(() => {
	// 过滤出今日未付款的销售记录
	const todaySales = salesRecords.value;
	const unpaidSales = todaySales.filter(record =>
		record.status === '未付款' || record.paymentStatus === 'unpaid'
	);

	// 计算未付款总额
	const total = unpaidSales.reduce((sum, record) => {
		return sum + parseFloat(record.amount || record.total || 0);
	}, 0);

	// 格式化为带千位分隔符的字符串
	return total.toLocaleString('zh-CN');
});

// 客户相关数据
const customersList = ref([]);
const selectedCustomer = ref({});
const customerSearchText = ref('');

// 过滤后的客户列表
const filteredCustomersList = computed(() => {
	if (!customerSearchText.value) return customersList.value;

	const query = customerSearchText.value.toLowerCase();
	return customersList.value.filter(customer => {
		return customer.name.toLowerCase().includes(query) ||
			customer.phone.includes(query);
	});
});

// 1. 销售趋势图数据
const salesTrend = ref({
	days: ['5/10', '5/11', '5/12', '5/13', '5/14', '5/15', '5/16'],
	amounts: [30, 45, 25, 60, 75, 65, 80] // 百分比高度
});

// 3. 主要客户销售额排名数据 - 使用计算属性根据实际销售记录计算
const customerRanking = computed(() => {
	// 如果没有销售记录，返回空数组
	if (salesRecords.value.length === 0) {
		return [];
	}

	// 创建一个Map来存储每个客户的销售总额
	const customerSalesMap = new Map();

	// 遍历所有销售记录
	salesRecords.value.forEach(record => {
		// 确保记录有客户信息
		let customerId, customerName;

		// 首先检查新结构
		if (record.customerName) {
			customerId = record.customerName; // 使用客户名称作为唯一标识
			customerName = record.customerName;
		}
		// 然后检查旧结构
		else if (record.customer && record.customer.name) {
			customerId = record.customer.id || record.customer.name;
			customerName = record.customer.name;
		} else {
			return; // 跳过没有客户信息的记录
		}

		// 获取销售金额
		const saleAmount = parseFloat(record.amount || record.total || 0);

		// 如果客户已存在，累加销售额；否则创建新条目
		if (customerSalesMap.has(customerId)) {
			const currentAmount = customerSalesMap.get(customerId).amount;
			customerSalesMap.set(customerId, {
				name: customerName,
				amount: currentAmount + saleAmount
			});
		} else {
			customerSalesMap.set(customerId, {
				name: customerName,
				amount: saleAmount
			});
		}
	});

	// 如果没有有效的客户销售数据，返回空数组
	if (customerSalesMap.size === 0) {
		return [];
	}

	// 将Map转换为数组并按销售额降序排序
	const sortedCustomers = Array.from(customerSalesMap.values())
		.sort((a, b) => b.amount - a.amount);

	// 只取前5名客户
	const topCustomers = sortedCustomers.slice(0, 5);

	// 计算百分比 - 以最高销售额为基准(100%)
	const maxAmount = topCustomers.length > 0 ? topCustomers[0].amount : 0;

	// 为每个客户添加百分比
	return topCustomers.map(customer => ({
		name: customer.name,
		amount: Math.round(customer.amount), // 四舍五入到整数
		percentage: maxAmount > 0 ? Math.round((customer.amount / maxAmount) * 100) : 0
	}));
});

// 4. 热销水果排行榜数据 - 使用计算属性根据实际销售金额排序
const topSellingFruits = computed(() => {
	// 如果没有销售记录，返回空数组
	if (salesRecords.value.length === 0) {
		return [];
	}

	// 创建一个Map来存储每个水果的销售数据
	const fruitSalesMap = new Map();

	// 遍历所有销售记录
	salesRecords.value.forEach(record => {
		// 确保记录有水果名称和数量
		let fruitName, quantity, amount, spec;

		// 首先检查新结构
		if (record.productName && record.quantity) {
			fruitName = record.productName;
			quantity = parseInt(record.quantity);
			amount = parseFloat(record.amount || 0);
			spec = record.spec || '';
		}
		// 然后检查旧结构
		else if (record.name && record.quantity) {
			fruitName = record.name;
			quantity = parseInt(record.quantity);
			amount = parseFloat(record.total || 0);
			spec = record.spec || '';
		} else {
			return; // 跳过没有必要信息的记录
		}

		// 生成唯一标识符，包含品牌、品种、规格
		const fruitKey = `${record.brand || ''}-${fruitName}-${spec}`;

		// 如果水果已存在，累加销售额和数量；否则创建新条目
		if (fruitSalesMap.has(fruitKey)) {
			const currentData = fruitSalesMap.get(fruitKey);
			fruitSalesMap.set(fruitKey, {
				name: fruitName,
				spec: spec,
				amount: currentData.amount + amount,
				quantity: currentData.quantity + quantity
			});
		} else {
			fruitSalesMap.set(fruitKey, {
				name: fruitName,
				spec: spec,
				amount: amount,
				quantity: quantity
			});
		}
	});

	// 如果没有有效的水果销售数据，返回空数组
	if (fruitSalesMap.size === 0) {
		return [];
	}

	// 将Map转换为数组并按销售金额降序排序
	const sortedFruits = Array.from(fruitSalesMap.values())
		.sort((a, b) => b.amount - a.amount);

	// 只取前3名水果
	return sortedFruits.slice(0, 3).map(fruit => ({
		name: fruit.name,
		spec: fruit.spec,
		amount: Math.round(fruit.amount),
		quantity: fruit.quantity
	}));
});

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
const customerSelectorPopup = ref(null);

// 显示销售弹窗
function showSaleModal(fruit) {
	currentFruit.value = fruit;
	salePrice.value = fruit.minPrice;
	saleQuantity.value = 1;
	isFullPayment.value = true; // 重置为默认全款状态
	salePopup.value.open();
}

// 切换付款状态
function togglePaymentStatus(e) {
	isFullPayment.value = e.detail.value;
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

// 验证销售数量
function validateQuantity() {
	// 转换为数字
	let quantity = parseInt(saleQuantity.value);

	// 非数字或负数处理
	if (isNaN(quantity) || quantity < 1) {
		saleQuantity.value = 1;
		return;
	}

	// 超过库存处理
	if (quantity > currentFruit.value.stock) {
		uni.showToast({
			title: '超出库存数量',
			icon: 'none'
		});
		saleQuantity.value = currentFruit.value.stock;
	}
}

// 显示客户选择器
function showCustomerSelector() {
	customerSelectorPopup.value.open();
}

// 关闭客户选择器
function closeCustomerSelector() {
	customerSelectorPopup.value.close();
}

// 选择客户
function selectCustomer(customer) {
	selectedCustomer.value = customer;
	closeCustomerSelector();
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

	if (!selectedCustomer.value.id) {
		uni.showToast({
			title: '请选择客户',
			icon: 'none'
		});
		return;
	}

	// 更新库存
	const index = fruitData.value.findIndex(f => f.id === currentFruit.value.id);
	if (index !== -1) {
		fruitData.value[index].stock -= saleQuantity.value;

		// 同步更新库存管理中的数据
		try {
			const inventoryKey = 'inventoryData';
			const storedInventory = uni.getStorageSync(inventoryKey);

			if (storedInventory) {
				const inventoryData = JSON.parse(storedInventory);
				const inventoryIndex = inventoryData.findIndex(f => f.id === currentFruit.value.id);

				if (inventoryIndex !== -1) {
					// 更新库存管理中的库存
					inventoryData[inventoryIndex].stock -= saleQuantity.value;

					// 保存更新后的库存数据
					uni.setStorageSync(inventoryKey, JSON.stringify(inventoryData));
					console.log('已同步更新库存管理中的库存');

					// 触发页面刷新事件，通知其他页面更新数据
					uni.$emit('pageRefresh');
				}
			}
		} catch (e) {
			console.error('更新库存管理中的库存失败', e);
		}
	}

	// 添加销售记录
	const now = new Date();
	const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
	const date = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;

	// 创建符合服务层结构的记录
	const newRecord = {
		orderNo: `S${date.replace(/-/g, '')}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
		date: date,
		time: time,
		salesPerson: '系统用户', // 可以根据实际情况设置为登录用户
		customerName: selectedCustomer.value.name || '散客',
		brand: currentFruit.value.brand || '',
		fruitCategory: currentFruit.value.category || '',
		productName: currentFruit.value.name,
		spec: currentFruit.value.spec || '',
		unitPrice: parseFloat(salePrice.value).toFixed(2),
		quantity: saleQuantity.value,
		amount: parseFloat(totalPrice.value).toFixed(2),
		status: isFullPayment.value ? '已付款' : '未付款',
		paymentMethod: isFullPayment.value ? '现金' : '',
		paymentTime: isFullPayment.value ? `${date} ${time}` : '',
		remark: '',
		// 保存原始数据，便于其他功能使用
		customer: {
			id: selectedCustomer.value.id,
			name: selectedCustomer.value.name
		},
		paidAmount: isFullPayment.value ? parseFloat(totalPrice.value) : 0,
		variety: currentFruit.value.variety || ''
	};

	// 添加到本地销售记录
	salesRecords.value.unshift(newRecord);

	// 限制记录数量
	if (salesRecords.value.length > 10) {
		salesRecords.value = salesRecords.value.slice(0, 10);
	}

	// 同时添加到销售记录服务
	addSalesRecord(newRecord);

	// 保存销售记录到本地存储
	try {
		const salesRecordsKey = 'salesRecords';
		uni.setStorageSync(salesRecordsKey, JSON.stringify(salesRecords.value));
	} catch (e) {
		console.error('保存销售记录失败', e);
	}

	// 保存客户ID以更新欠款信息
	const customerId = selectedCustomer.value.id;

	// 重置选择的客户
	selectedCustomer.value = {};

	// 更新客户欠款信息
	updateCustomerDebtInfo(customerId);

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

	// 加载客户数据
	loadCustomersData();

	// 监听页面显示事件
	uni.$on('onShow', () => {
		console.log('销售页面显示');
		// 重新加载数据
		loadFruitData();
		// 触发tabChange事件
		uni.$emit('tabChange');
	});

	// 监听页面刷新事件
	uni.$on('pageRefresh', () => {
		console.log('销售页面收到刷新事件');
		// 重新加载数据
		loadFruitData();
	});
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

			// 将库存数据转换为销售数据格式
			fruitData.value = inventoryData.map(item => ({
				id: item.id,
				name: `${item.brand} ${item.variety}`,
				spec: item.spec,
				stock: item.stock,
				minPrice: item.minPrice,
				maxPrice: item.maxPrice,
				image: item.image,
				brand: item.brand,
				category: item.category,
				variety: item.variety
			}));

			console.log('从库存数据加载了销售数据');
			return;
		}
	} catch (e) {
		console.error('加载库存数据失败', e);
	}

	// 如果没有库存数据，显示空数组
	fruitData.value = [];
	console.log('没有找到库存数据，显示空列表');
}

// 加载销售记录
function loadSalesRecords() {
	// 尝试从本地存储加载销售记录
	try {
		const salesRecordsKey = 'salesRecords';
		const storedRecords = uni.getStorageSync(salesRecordsKey);
		if (storedRecords) {
			salesRecords.value = JSON.parse(storedRecords);
			return;
		}
	} catch (e) {
		console.error('加载销售记录失败', e);
	}

	// 如果没有存储的销售记录，初始化为空数组
	salesRecords.value = [];
}

// 加载客户数据
function loadCustomersData() {
	// 模拟从服务器获取数据
	// 实际应用中，这里应该是API调用
	customersList.value = [
		{ id: 1, name: "李明", type: "零售客户", phone: "13812345678", orders: 5 },
		{ id: 2, name: "张三水果店", type: "批发客户", phone: "15912345678", orders: 12 },
		{ id: 3, name: "王五超市", type: "批发客户", phone: "17712345678", orders: 8 },
		{ id: 4, name: "赵六水果配送", type: "合作商", phone: "18612345678", orders: 15 }
	];
}
</script>

<style>
.sales-container {
	display: flex;
	flex-direction: column;
	height: 100vh;
	padding-bottom: 150rpx;
	background-color: #F5F8FA;
	font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
	box-sizing: border-box;
}

/* 头部样式 */
.sales-header {
	background: linear-gradient(135deg, #0D9488, #0F766E);
	padding: 40rpx 30rpx;
	border-bottom-left-radius: 0;
	border-bottom-right-radius: 0;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.sales-header-content {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.sales-title {
	font-size: 36rpx;
	font-weight: bold;
	color: white;
	letter-spacing: 1rpx;
}

.sales-date-display {
	display: flex;
	align-items: center;
	background-color: rgba(255, 255, 255, 0.2);
	padding: 8rpx 16rpx;
	border-radius: 30rpx;
}

.sales-date-icon {
	margin-right: 8rpx;
}

.sales-date-text {
	color: white;
	font-size: 24rpx;
}

/* 滚动区域 */
.sales-content-scroll {
	flex: 1;
	height: calc(100vh - 240rpx);
	width: 100%;
	box-sizing: border-box;
}

/* 卡片通用样式 */
.sales-stats-card {
	background-color: rgba(255, 255, 255, 0.9);
	border-radius: 24rpx;
	margin: 24rpx;
	padding: 24rpx 20rpx;
	box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
	box-sizing: border-box;
	width: calc(100% - 48rpx);
	border: 1rpx solid rgba(255, 255, 255, 0.3);
	backdrop-filter: blur(5rpx);
	-webkit-backdrop-filter: blur(5rpx);
}

.sales-quick-card {
	background-color: white;
	border-radius: 24rpx;
	margin: 24rpx;
	padding: 30rpx 20rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	box-sizing: border-box;
	width: calc(100% - 48rpx);
}

.sales-history-card {
	background-color: white;
	border-radius: 24rpx;
	margin: 24rpx;
	padding: 24rpx 20rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	margin-bottom: 120rpx;
	box-sizing: border-box;
	width: calc(100% - 48rpx);
	border: 1rpx solid #E5E7EB;
}

.sales-card-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 16rpx;
	position: relative;
}

.sales-card-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #1F2937;
	position: relative;
	padding-left: 0;
}

.sales-card-title::before {
	display: none;
}

.sales-view-more {
	font-size: 26rpx;
	color: #0D9488;
	display: flex;
	align-items: center;
	background-color: rgba(13, 148, 136, 0.08);
	padding: 8rpx 16rpx;
	border-radius: 30rpx;
	transition: background-color 0.2s ease;
}

.sales-view-more:active {
	background-color: rgba(13, 148, 136, 0.15);
}

/* 统计数据样式 */
.sales-stats-grid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 16rpx;
	margin-top: 16rpx;
}

.sales-stats-item {
	padding: 16rpx 20rpx;
	border-radius: 16rpx;
	display: flex;
	flex-direction: column;
	justify-content: center;
	position: relative;
	overflow: hidden;
	height: 120rpx;
	box-sizing: border-box;
	backdrop-filter: blur(12rpx);
	-webkit-backdrop-filter: blur(12rpx);
	background: rgba(240, 242, 245, 0.6);
	border: 1rpx solid rgba(210, 215, 220, 0.5);
	box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.1);
	transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.sales-stats-item:active {
	transform: scale(0.98);
	box-shadow: 0 5rpx 15rpx rgba(0, 0, 0, 0.1);
}

.sales-stats-item::before {
	display: none;
}

.sales-stats-item::after {
	display: none;
}

.sales-amount-item {
	color: #10B981;
}

.sales-amount-item::after {
	background-color: #10B981;
}

.sales-quantity-item {
	color: #3B82F6;
}

.sales-quantity-item::after {
	background-color: #3B82F6;
}

.sales-customer-count-item {
	color: #8B5CF6; /* 紫色，与绿色形成明显区分 */
}

.sales-customer-count-item::after {
	background-color: #8B5CF6;
}

.sales-unpaid-item {
	color: #EF4444;
}

.sales-unpaid-item::after {
	background-color: #EF4444;
}

.sales-stats-label {
	font-size: 22rpx;
	color: #6B7280;
	margin-bottom: 8rpx;
	display: block;
	font-weight: 500;
	position: relative;
	z-index: 2;
}

.sales-stats-value {
	font-size: 36rpx;
	font-weight: bold;
	display: block;
	margin-bottom: 4rpx;
	letter-spacing: 0.5rpx;
	position: relative;
	z-index: 2;
	color: currentColor;
}

/* 各统计项的数值颜色使用 currentColor 继承父元素的颜色 */

.sales-trend-icon {
	margin-right: 4rpx;
}


/* 搜索框样式 */
.sales-search-container {
	position: relative;
	margin-bottom: 24rpx;
	width: 100%;
	box-sizing: border-box;
}

.sales-search-input {
	width: 100%;
	height: 80rpx;
	padding: 0 16rpx 0 60rpx;
	background-color: #F9FAFB;
	border: 1rpx solid #E5E7EB;
	border-radius: 40rpx;
	font-size: 26rpx;
	color: #1F2937;
	box-sizing: border-box;
}

.sales-search-icon-container {
	position: absolute;
	left: 20rpx;
	top: 50%;
	transform: translateY(-50%);
	z-index: 1;
}

/* 水果列表样式 */
.sales-fruits-scroll {
	width: 100%;
	box-sizing: border-box;
	white-space: nowrap;
	padding: 10rpx 0;
	/* 隐藏滑动条 */
	scrollbar-width: none; /* Firefox */
	-ms-overflow-style: none; /* IE and Edge */
}

/* 隐藏滑动条 - WebKit 浏览器 */
.sales-fruits-scroll::-webkit-scrollbar {
	display: none;
	width: 0;
	height: 0;
}

.sales-fruits-list {
	display: inline-flex;
	gap: 20rpx;
	padding: 0 10rpx;
	box-sizing: border-box;
}

/* 空状态样式 */
.sales-empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 60rpx 0;
	width: 100%;
}

.sales-empty-text {
	font-size: 32rpx;
	color: #6B7280;
	margin-bottom: 12rpx;
}

.sales-empty-subtext {
	font-size: 24rpx;
	color: #9CA3AF;
}

.sales-fruit-item {
	display: inline-flex;
	flex-direction: column;
	padding: 20rpx;
	background-color: #F9FAFB;
	border-radius: 16rpx;
	transition: all 0.3s ease;
	width: 220rpx;
	white-space: normal;
	vertical-align: top;
}

.sales-fruit-item:active {
	transform: scale(0.98);
	opacity: 0.9;
}

.sales-fruit-image-container {
	width: 180rpx;
	height: 180rpx;
	border-radius: 12rpx;
	overflow: hidden;
	background-color: #F3F4F6;
	box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
	flex-shrink: 0;
	margin: 0 auto 10rpx;
}

.sales-fruit-image {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.sales-fruit-info {
	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	text-align: center;
}

.sales-fruit-name {
	font-size: 26rpx;
	font-weight: bold;
	color: #1F2937;
	margin-bottom: 6rpx;
	display: block;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	width: 100%;
}

.sales-fruit-spec {
	font-size: 22rpx;
	color: #6B7280;
	display: block;
	margin-bottom: 8rpx;
}

.sales-fruit-price {
	font-size: 24rpx;
	color: #0D9488;
	font-weight: bold;
	display: block;
	margin-bottom: 6rpx;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	width: 100%;
}

.sales-fruit-stock {
	font-size: 22rpx;
	color: #9CA3AF;
	display: block;
}

/* 销售记录样式 */
.sales-history-list {
	margin-top: 24rpx;
}

.sales-history-item {
	padding: 12rpx 0;
	transition: all 0.2s ease;
}

.sales-history-item:active {
	background-color: #F9FAFB;
}

.sales-history-border {
	border-bottom: 1rpx solid #F3F4F6;
	margin-bottom: 0;
}

.sales-history-content {
	display: flex;
	align-items: stretch;
	width: 100%;
	gap: 12rpx;
	position: relative;
	height: 110rpx;
}

.sales-history-image-container {
	width: 100rpx;
	height: 100rpx;
	border-radius: 12rpx;
	overflow: hidden;
	background-color: #F3F4F6;
	flex-shrink: 0;
	border: 1rpx solid #E5E7EB;
	align-self: center;
}

.sales-history-image {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.sales-history-left {
	width: 240rpx;
	display: flex;
	flex-direction: column;
	gap: 4rpx;
	overflow: hidden;
	justify-content: center;
}

.sales-history-middle {
	width: 240rpx;
	overflow: hidden;
	display: flex;
	flex-direction: column;
	gap: 4rpx;
	padding-left: 6rpx;
	justify-content: center;
}

.sales-history-info-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	width: 100%;
	margin-bottom: 8rpx;
}

.sales-history-date-row {
	display: flex;
	align-items: center;
	gap: 12rpx;
}

/* 已移除不再需要的样式 */

.sales-history-name {
	font-size: 28rpx;
	font-weight: 600;
	color: #1F2937;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	max-width: 400rpx;
	padding-top: 0rpx;
}

.sales-history-customer-row {
	display: flex;
	align-items: center;
	gap: 8rpx;
	justify-content: flex-end;
}

.sales-history-customer-label {
	font-size: 22rpx;
	color: #9CA3AF;
}

.sales-history-customer-name {
	font-size: 24rpx;
	color: #4B5563;
	font-weight: 500;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	max-width: 220rpx;
	margin-bottom: 0;
	padding-top: 0;
}

/* 已移除不再需要的样式 */

/* 已移除不再需要的样式 */

.sales-history-quantity {
	font-size: 24rpx;
	color: #6B7280;
	margin-top: 0;
	padding-bottom: 0;
}

/* 客户标签样式已移至 .sales-history-customer-name */

.sales-history-right {
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	gap: 4rpx;
	min-width: 120rpx;
	justify-content: flex-start;
}

.sales-history-total {
	font-size: 30rpx;
	font-weight: bold;
	color: #0D9488;
	display: block;
	letter-spacing: 0.5rpx;
	margin-bottom: 4rpx;
	padding-top: 12rpx;
}

.sales-history-date {
	font-size: 22rpx;
	color: #6B7280;
	margin-top: 0;
	padding-bottom: 0;
}

.sales-history-time {
	font-size: 22rpx;
	color: #9CA3AF;
	position: relative;
	padding-left: 12rpx;
}

.sales-history-time::before {
	content: '';
	position: absolute;
	left: 4rpx;
	top: 50%;
	width: 4rpx;
	height: 4rpx;
	border-radius: 50%;
	background-color: #D1D5DB;
	transform: translateY(-50%);
}

.sales-history-payment-status {
	font-size: 22rpx;
	padding: 0 12rpx;
	border-radius: 6rpx;
	font-weight: 500;
	letter-spacing: 0.5rpx;
	line-height: 1;
	margin-top: 0rpx;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 36rpx;
	box-sizing: border-box;
}

.status-paid {
	color: #10B981;
	background-color: rgba(16, 185, 129, 0.1);
	border: 1rpx solid rgba(16, 185, 129, 0.2);
	box-shadow: 0 1rpx 2rpx rgba(16, 185, 129, 0.05);
}

.status-unpaid {
	color: #EF4444;
	background-color: rgba(239, 68, 68, 0.05);
	border: 1rpx solid rgba(239, 68, 68, 0.1);
	box-shadow: 0 1rpx 2rpx rgba(239, 68, 68, 0.05);
}

/* 弹窗样式 */
.sales-popup-container {
	background-color: white;
	border-radius: 24rpx;
	width: 92%;
	padding: 40rpx;
	box-sizing: border-box;
	margin: 0 auto;
	position: relative;
	top: 0;
	left: 0;
	transform: none;
	max-width: 650rpx;
}

.sales-popup-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 30rpx;
}

.sales-popup-title-container {
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.sales-popup-title {
	font-size: 38rpx;
	font-weight: bold;
	color: #1F2937;
	position: relative;
	padding-bottom: 16rpx;
}

.sales-popup-title::after {
	content: '';
	position: absolute;
	bottom: 0;
	left: 0;
	width: 60rpx;
	height: 4rpx;
	background-color: #0D9488;
	border-radius: 2rpx;
}

.sales-popup-spec {
	font-size: 22rpx;
	color: #6B7280;
	font-weight: normal;
}

.sales-popup-close {
	padding: 10rpx;
}

.sales-popup-image-container {
	width: 200rpx;
	height: 200rpx;
	border-radius: 16rpx;
	overflow: hidden;
	background-color: #F3F4F6;
	margin: 0 auto 30rpx;
	box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.1);
}

.sales-popup-image {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.sales-popup-form-item {
	margin-bottom: 24rpx;
	width: 100%;
	box-sizing: border-box;
}

/* 统一输入框样式 */
.sales-popup-customer-selector,
.sales-popup-price-input,
.sales-popup-quantity-wrapper {
	height: 80rpx;
	border-radius: 12rpx;
	margin: 12rpx 0;
	box-sizing: border-box;
}

.sales-popup-label {
	font-size: 26rpx;
	font-weight: 500;
	color: #374151;
	margin-bottom: 10rpx;
	display: block;
}

.sales-popup-price-input {
	position: relative;
	width: 100%;
	box-sizing: border-box;
}

.sales-popup-currency {
	position: absolute;
	left: 30rpx;
	top: 50%;
	transform: translateY(-50%);
	color: #6B7280;
	z-index: 1;
}

.sales-popup-input {
	width: 100%;
	height: 80rpx;
	padding: 0 20rpx 0 60rpx;
	background-color: #F9FAFB;
	border: 1rpx solid #E5E7EB;
	border-radius: 12rpx;
	font-size: 30rpx;
	font-weight: bold;
	color: #0D9488;
	text-align: right;
	box-sizing: border-box;
}

.sales-popup-price-hint {
	font-size: 22rpx;
	color: #6B7280;
	margin-top: 8rpx;
	text-align: right;
	width: 100%;
	box-sizing: border-box;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.sales-popup-quantity-wrapper {
	display: flex;
	align-items: center;
	background-color: #F9FAFB;
	padding: 0 10rpx;
	border: 1rpx solid #E5E7EB;
}

.sales-popup-quantity-btn {
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border: none;
	padding: 0;
	position: relative;
	flex-shrink: 0;
	background: transparent;
	box-shadow: none;
	margin: 0;
}

.sales-popup-quantity-btn::after {
	border: none;
	display: none;
}

.sales-popup-quantity-input {
	flex: 1;
	height: 80rpx;
	text-align: center;
	font-size: 32rpx;
	font-weight: bold;
	color: #1F2937;
	background: transparent;
	border: none;
	margin: 0 20rpx;
}

/* 使用与库存管理页一致的图标样式 */
.sales-popup-quantity-btn .iconfont {
	font-size: 32rpx;
	color: #4B5563;
}

.sales-popup-stock {
	font-size: 24rpx;
	color: #6B7280;
}

.sales-popup-total {
	margin: 12rpx 0 20rpx 0;
	background-color: #F9FAFB;
	border-radius: 12rpx;
	width: 100%;
	box-sizing: border-box;
	height: 80rpx;
	display: flex;
	align-items: center;
}

.sales-popup-payment-option {
	display: flex;
	align-items: center;
	padding: 20rpx 0;
	border-bottom: 1rpx solid #E5E7EB;
	margin-bottom: 20rpx;
}

.sales-popup-switch {
	margin: 0 20rpx;
}

.sales-popup-payment-status {
	font-size: 24rpx;
	font-weight: 500;
	padding: 4rpx 12rpx;
	border-radius: 6rpx;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 36rpx;
	box-sizing: border-box;
}

.sales-popup-payment-option .status-paid {
	color: #10B981;
	background-color: rgba(16, 185, 129, 0.1);
	border: 1rpx solid rgba(16, 185, 129, 0.2);
	box-shadow: 0 1rpx 2rpx rgba(16, 185, 129, 0.05);
}

.sales-popup-payment-option .status-unpaid {
	color: #EF4444;
	background-color: rgba(239, 68, 68, 0.05);
	border: 1rpx solid rgba(239, 68, 68, 0.1);
	box-shadow: 0 1rpx 2rpx rgba(239, 68, 68, 0.05);
}

.sales-popup-total-content {
	display: flex;
	justify-content: space-between;
	align-items: center;
	width: 100%;
	padding: 0 30rpx;
}

.sales-popup-total-label {
	font-size: 26rpx;
	font-weight: 500;
	color: #374151;
}

.sales-popup-total-value {
	font-size: 36rpx;
	font-weight: bold;
	color: #0D9488;
}

.sales-popup-actions {
	width: 100%;
	box-sizing: border-box;
}

.sales-popup-confirm-btn {
	width: 100%;
	height: 96rpx;
	background: linear-gradient(135deg, #0D9488, #0F766E);
	color: white;
	font-size: 32rpx;
	font-weight: 500;
	border-radius: 48rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 4rpx 12rpx rgba(13, 148, 136, 0.2);
	border: none;
	margin-top: 10rpx;
}

/* 统计弹窗样式 */
.sales-stats-popup {
	width: 650rpx;
	background-color: white;
	border-radius: 24rpx;
	overflow-y: auto;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.15);
	padding: 40rpx;
	max-height: 80vh;
	box-sizing: border-box;
	margin: 0 auto;
}

.sales-stats-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 30rpx;
	padding-bottom: 20rpx;
	border-bottom: 1rpx solid #F3F4F6;
}

.sales-stats-title {
	font-size: 38rpx;
	font-weight: bold;
	color: #1F2937;
	position: relative;
	padding-bottom: 16rpx;
}

/* 删除标题下方的绿色线 */
.sales-stats-title::after {
	display: none;
}

.sales-stats-close {
	padding: 10rpx;
}

.sales-stats-section {
	margin-bottom: 50rpx;
	width: 100%;
}

.sales-stats-section-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #1F2937;
	margin-bottom: 24rpx;
	display: block;
	position: relative;
	padding-left: 0; /* 删除左边距 */
}

/* 删除标题左侧的绿色线 */
.sales-stats-section-title::before {
	display: none;
}

/* 1. 销售趋势图样式 */
.sales-chart-container {
	background-color: #F9FAFB;
	border-radius: 16rpx;
	padding: 30rpx;
	width: 100%;
	box-sizing: border-box;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
	margin: 0 auto;
	overflow: hidden;
}

.sales-chart-legend {
	display: flex;
	justify-content: flex-end;
	gap: 20rpx;
	margin-bottom: 10rpx;
}

.sales-chart-legend-item {
	display: flex;
	align-items: center;
	gap: 8rpx;
}

.sales-chart-legend-color {
	width: 16rpx;
	height: 16rpx;
	border-radius: 4rpx;
}

.sales-amount-color {
	background-color: #0D9488;
}

.sales-quantity-color {
	background-color: #3B82F6;
}

.sales-chart-legend-text {
	font-size: 22rpx;
	color: #6B7280;
}

.sales-chart {
	height: 360rpx;
	position: relative;
	margin-top: 20rpx;
	width: 100%;
}

.sales-chart-axis-x {
	display: flex;
	justify-content: space-between;
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	padding-top: 10rpx;
	border-top: 1rpx solid #E5E7EB;
}

.sales-chart-label {
	font-size: 20rpx;
	color: #9CA3AF;
	text-align: center;
	width: 14.28%; /* 100% / 7天 */
}

.sales-chart-body {
	height: 320rpx;
	position: relative;
	width: 100%;
}

/* 已删除柱状图相关样式 */

.sales-chart-line {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	height: 100%;
}

.sales-chart-point {
	position: absolute;
	width: 12rpx;
	height: 12rpx;
	border-radius: 50%;
	background-color: #0D9488;
	border: 2rpx solid white;
	box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
	transform: translate(-50%, 50%);
	z-index: 2;
}

.sales-amount-point {
	background-color: #0D9488;
}

.sales-chart-point-value {
	position: absolute;
	top: -30rpx;
	left: 50%;
	transform: translateX(-50%);
	font-size: 18rpx;
	color: #0D9488;
	white-space: nowrap;
	background-color: rgba(255, 255, 255, 0.8);
	padding: 2rpx 6rpx;
	border-radius: 4rpx;
}

.sales-chart-line-path {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	pointer-events: none;
	border-bottom: 2rpx dashed #0D9488;
	transform: translateY(50%);
}

.sales-pie-container {
	width: 240rpx;
	height: 240rpx;
	border-radius: 50%;
	position: relative;
	overflow: hidden;
	background-color: #F3F4F6;
}

.sales-pie-segment {
	position: absolute;
	width: 100%;
	height: 100%;
	top: 0;
	left: 0;
}

.sales-pie-legend {
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	gap: 16rpx 30rpx;
	width: 100%;
}

.sales-pie-legend-item {
	display: flex;
	align-items: center;
	gap: 8rpx;
}

.sales-pie-legend-color {
	width: 16rpx;
	height: 16rpx;
	border-radius: 4rpx;
}

.sales-pie-legend-text {
	font-size: 22rpx;
	color: #4B5563;
}

/* 3. 主要客户销售额排名样式 */
.sales-customer-ranking {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
	width: 100%;
}

.sales-customer-item {
	display: flex;
	align-items: center;
	gap: 24rpx;
	padding: 24rpx;
	background-color: #F9FAFB;
	border-radius: 16rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
	width: 100%;
	box-sizing: border-box;
	margin: 0 auto;
}

.sales-customer-rank {
	width: 40rpx;
	height: 40rpx;
	border-radius: 20rpx;
	background-color: #F3F4F6;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.sales-customer-rank-number {
	font-size: 22rpx;
	font-weight: bold;
	color: #4B5563;
}

.sales-customer-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}

.sales-customer-name {
	font-size: 26rpx;
	font-weight: 500;
	color: #1F2937;
}

.sales-customer-progress-container {
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.sales-customer-progress-bg {
	flex: 1;
	height: 12rpx;
	background-color: #F3F4F6;
	border-radius: 6rpx;
	overflow: hidden;
}

.sales-customer-progress {
	height: 100%;
	background-color: #0D9488;
	border-radius: 6rpx;
}

.sales-customer-amount {
	font-size: 24rpx;
	font-weight: 500;
	color: #0D9488;
	white-space: nowrap;
}

/* 4. 热销水果排行榜样式 */
.sales-ranking-list {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
	width: 100%;
}

.sales-ranking-item {
	display: flex;
	align-items: center;
	padding: 24rpx;
	background-color: #F9FAFB;
	border-radius: 16rpx;
	gap: 24rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
	width: 100%;
	box-sizing: border-box;
	margin: 0 auto;
}

.sales-ranking-badge {
	width: 48rpx;
	height: 48rpx;
	border-radius: 24rpx;
	background-color: #0D9488;
	color: white;
	font-size: 24rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.rank-1 {
	background-color: #F59E0B;
}

.rank-2 {
	background-color: #6B7280;
}

.rank-3 {
	background-color: #B45309;
}

.sales-ranking-content {
	flex: 1;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.sales-ranking-fruit-info {
	display: flex;
	flex-direction: column;
	gap: 4rpx;
}

.sales-ranking-name {
	font-size: 26rpx;
	font-weight: 500;
	color: #1F2937;
}

.sales-ranking-spec {
	font-size: 22rpx;
	color: #6B7280;
}

.sales-ranking-data {
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	gap: 4rpx;
}

.sales-ranking-amount {
	font-size: 28rpx;
	font-weight: bold;
	color: #0D9488;
}

.sales-ranking-quantity {
	font-size: 22rpx;
	color: #6B7280;
}

.sales-popup-close-btn {
	width: 100%;
	height: 80rpx;
	background-color: #F3F4F6;
	color: #4B5563;
	font-size: 28rpx;
	border-radius: 0;
	margin-top: 20rpx;
}

/* 客户选择器样式 */
.sales-popup-customer-selector {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0 20rpx;
	background-color: #F9FAFB;
	border: 1rpx solid #E5E7EB;
}

.sales-popup-customer-name {
	font-size: 28rpx;
	color: #374151;
	font-weight: 500;
}

.customer-selector-container {
	background-color: white;
	border-top-left-radius: 24rpx;
	border-top-right-radius: 24rpx;
	padding: 30rpx;
	padding-bottom: env(safe-area-inset-bottom);
	max-height: 70vh;
	box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.1);
}

.customer-selector-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 24rpx;
}

.customer-selector-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #1F2937;
}

.customer-selector-close {
	padding: 10rpx;
}

.customer-selector-search {
	display: flex;
	align-items: center;
	background-color: #F3F4F6;
	border-radius: 32rpx;
	padding: 0 16rpx;
	margin-bottom: 20rpx;
	height: 70rpx;
}

.customer-search-input {
	flex: 1;
	height: 70rpx;
	font-size: 28rpx;
	padding-left: 12rpx;
	color: #374151;
}

.customer-selector-list {
	max-height: 50vh;
}

.customer-selector-item {
	padding: 20rpx 16rpx;
	border-bottom: 1rpx solid #E5E7EB;
}

.customer-selector-item:active {
	background-color: #F3F4F6;
}

.customer-selector-name {
	font-size: 28rpx;
	font-weight: 500;
	color: #1F2937;
	display: block;
	margin-bottom: 4rpx;
}

.customer-selector-phone {
	font-size: 24rpx;
	color: #6B7280;
}
</style>