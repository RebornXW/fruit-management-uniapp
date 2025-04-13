<template>
	<view class="customer-container">
		<!-- 标题栏 -->
		<view class="customer-header">
			<view class="header-left">
				<text class="customer-title">客户管理</text>
			</view>
			<view class="header-right">
				<view class="date-box">
					<uni-icons type="calendar" size="16" color="#FFFFFF"></uni-icons>
					<text class="date-text">{{currentDate}}</text>
				</view>
			</view>
		</view>
		
		<!-- 搜索框 - 替代原分类标签 -->
		<view class="search-container">
			<view class="search-box">
				<uni-icons type="search" size="18" color="#9CA3AF"></uni-icons>
				<input v-model="searchText" type="text" placeholder="搜索客户名称或联系方式..." class="search-input" @input="filterCustomers" />
			</view>
			<button class="add-customer-btn" @tap="showAddCustomerPopup">
				<text class="iconfont icon-add"></text>
			</button>
		</view>
		
		<!-- 客户展示区 -->
		<scroll-view scroll-y class="customer-list-container">
			<view class="customer-list">
				<view 
					v-for="customer in filteredCustomers" 
					:key="customer.id"
					class="customer-card"
					@tap="showCustomerDetail(customer)"
				>
					<view class="customer-content">
						<view class="customer-header-row">
							<text class="customer-name">{{customer.name}}</text>
							<view class="unpaid-badge" v-if="customer.unpaidAmount > 0">
								<text class="iconfont icon-warning unpaid-icon"></text>
								<text class="unpaid-text">欠款: ¥{{formatMoney(customer.unpaidAmount)}}</text>
							</view>
						</view>
						<view class="customer-info-row">
							<text class="customer-phone">{{customer.phone}}</text>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>
		
		<!-- 客户详情弹窗 -->
		<uni-popup ref="customerPopup" type="bottom">
			<view class="customer-popup-bg">
				<view class="popup-header">
					<text class="popup-title">客户详情</text>
					<view class="close-btn" @tap="closePopup">
						<custom-icon type="close" size="20" color="#9CA3AF"></custom-icon>
					</view>
				</view>
				<scroll-view 
					scroll-y 
					class="popup-scroll-content" 
					:scroll-top="scrollTop" 
					@scrolltolower="loadMoreRecords"
					:refresher-enabled="true"
					:refresher-triggered="isRefreshing"
					@refresherrefresh="onRefresh"
					:enhanced="true"
					:show-scrollbar="true"
					:bounces="true"丁·
				>
					<view class="popup-content">
						<view class="info-card">
							<text class="info-title">{{currentCustomer.name}}</text>
						</view>
						<view class="info-card">
							<text class="info-label">联系方式</text>
							<text class="info-value">{{currentCustomer.phone}}</text>
						</view>
						
						<!-- 回款统计卡片 -->
						<view class="info-card payment-stats">
							<view class="stats-header">
								<text class="stats-title">回款统计</text>
								<view class="stats-actions">
									<view class="stats-action-btn" @tap="showPaymentHistory">
										<text class="action-text">回款记录</text>
										<uni-icons type="right" size="14" color="#0D9488"></uni-icons>
									</view>
								</view>
							</view>
							<view class="stats-content">
								<view class="stats-item">
									<text class="stats-label">总销售额</text>
									<text class="stats-value">¥{{formatMoney(currentCustomer.totalSales || 0)}}</text>
								</view>
								<view class="stats-item">
									<text class="stats-label">已回款</text>
									<text class="stats-value success">¥{{formatMoney(currentCustomer.paidAmount || 0)}}</text>
								</view>
								<view class="stats-item">
									<text class="stats-label">待回款</text>
									<text class="stats-value warning">¥{{formatMoney((currentCustomer.totalSales || 0) - (currentCustomer.paidAmount || 0))}}</text>
								</view>
							</view>
							<view class="payment-progress">
								<view class="progress-bar">
									<view class="progress-inner" :style="{width: getPaymentPercentage(currentCustomer) + '%'}"></view>
								</view>
								<text class="progress-text">回款率: {{getPaymentPercentage(currentCustomer)}}%</text>
							</view>
						</view>
						
						<!-- 销售记录区域 -->
						<view class="customer-sales-records">
							<view class="records-header">
								<text class="records-title">销售记录</text>
								<text class="records-count" v-if="totalRecords > 0">共{{totalRecords}}单</text>
							</view>
							
							<!-- 空状态 -->
							<view class="empty-records" v-if="customerSalesRecords.length === 0 && !isLoading">
								<image src="/static/images/empty.png" class="empty-image" mode="aspectFit"></image>
								<text class="empty-text">暂无销售记录</text>
							</view>
							
							<!-- 销售记录列表 - 正序排列，最新的在上面 -->
							<scroll-view 
								scroll-y 
								class="records-scroll-view" 
								:scroll-top="scrollTop"
								@scrolltolower="loadMoreRecords"
								:enhanced="true"
								:show-scrollbar="false"
								:bounces="false"
							>
								<view class="records-list">
									<view 
										v-for="(record, index) in customerSalesRecords" 
										:key="index"
										class="record-item"
									>
										<view class="record-content">
											<view class="record-left">
												<image :src="record.image" class="record-image" mode="aspectFill"></image>
												<view class="record-info">
													<text class="record-name">{{record.name}}</text>
													<text class="record-quantity">{{record.quantity}}箱 × ¥{{record.price}}</text>
												</view>
											</view>
											<view class="record-right">
												<text class="record-total">¥{{record.total}}</text>
												<text class="record-date">{{record.date}}</text>
												<text class="record-status" :class="record.paid ? 'status-paid' : 'status-unpaid'">
													{{record.paid ? '已回款' : '未回款'}}
												</text>
											</view>
										</view>
									</view>
								</view>
								
								<!-- 加载状态 - 放在列表底部 -->
								<view class="loading-status" v-if="customerSalesRecords.length > 0">
									<view class="loading-more" v-if="isLoading && !hasMore">
										<uni-icons type="spinner-cycle" size="16" color="#0D9488"></uni-icons>
										<text class="loading-text">加载中...</text>
									</view>
									<view class="no-more" v-if="!hasMore && !isLoading">
										<text class="no-more-text">没有更多记录了</text>
									</view>
								</view>
							</scroll-view>
						</view>
						
						<view class="action-buttons">
							<button class="action-button" @tap="contactCustomer">
								联系客户
							</button>
							<button class="action-button payment-button" @tap="addPayment">
								添加回款
							</button>
						</view>
					</view>
				</scroll-view>
			</view>
		</uni-popup>
		
		<!-- 新增客户弹窗 -->
		<uni-popup ref="addCustomerPopup" type="bottom">
			<view class="customer-popup-bg">
				<view class="popup-header">
					<text class="popup-title">新增客户</text>
					<view class="close-btn" @tap="closeAddCustomerPopup">
						<custom-icon type="close" size="20" color="#9CA3AF"></custom-icon>
					</view>
				</view>
				<view class="popup-content">
					<view class="form-item">
						<text class="form-label">客户名称 <text class="required">*</text></text>
						<input v-model="newCustomer.name" type="text" placeholder="请输入客户名称" class="form-input" />
					</view>
					<view class="form-item">
						<text class="form-label">联系方式 <text class="required">*</text></text>
						<input v-model="newCustomer.phone" type="text" placeholder="请输入联系方式" class="form-input" />
					</view>
					<view class="form-item">
						<text class="form-label">备注</text>
						<textarea v-model="newCustomer.remark" placeholder="请输入备注信息" class="form-textarea"></textarea>
					</view>
					<button class="confirm-btn" @tap="confirmAddCustomer">确认添加</button>
				</view>
			</view>
		</uni-popup>
		
		<!-- 底部TabBar -->
		<custom-tab-bar></custom-tab-bar>
	</view>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import CustomTabBar from '@/components/CustomTabBar.vue';
import CustomIcon from '@/components/CustomIcon.vue';

// 数据
const searchText = ref('');
const customersData = ref([]);
const currentCustomer = ref({});
const currentDate = ref('');
const customerSalesRecords = ref([]);
const scrollTop = ref(0);
const isLoading = ref(false);
const isRefreshing = ref(false);
const hasMore = ref(true);
const currentPage = ref(1);
const pageSize = ref(5); // 默认展示5条记录
const totalRecords = ref(0);
const allRecords = ref([]); // 存储所有记录

// 新增客户相关数据
const addCustomerPopup = ref(null);
const newCustomer = ref({
	name: '',
	phone: '',
	remark: ''
});

// 过滤后的客户数据
const filteredCustomers = computed(() => {
	if (!searchText.value) return customersData.value;
	
	const query = searchText.value.toLowerCase();
	return customersData.value.filter(customer => {
		return customer.name.toLowerCase().includes(query) || 
			customer.phone.includes(query);
	});
});

// 搜索过滤
function filterCustomers() {
	// 搜索逻辑已经在computed中实现
}

// 获取弹窗组件引用
const customerPopup = ref(null);

// 显示客户详情弹窗
function showCustomerDetail(customer) {
	// 先设置当前客户，避免弹窗打开时的闪烁
	currentCustomer.value = customer;
	
	// 打开弹窗
	customerPopup.value.open();
	
	// 重置分页和记录数据
	resetRecordsData();
	
	// 加载该客户的销售记录
	loadAllCustomerRecords(customer.id);
}

// 重置记录数据
function resetRecordsData() {
	currentPage.value = 1;
	hasMore.value = true;
	customerSalesRecords.value = [];
	allRecords.value = [];
	scrollTop.value = 0;
}

// 加载所有客户记录到缓存
function loadAllCustomerRecords(customerId) {
	if (isLoading.value) return;
	
	isLoading.value = true;
	
	// 模拟从服务器获取所有数据
	setTimeout(() => {
		const baseRecords = [
			{ 
				name: "明牌阿克苏苹果", 
				quantity: 2, 
				price: "55.00", 
				total: "110.00", 
				date: "2023-06-15", 
				image: "https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?q=80&w=300",
				paid: true
			},
			{ 
				name: "红富士苹果", 
				quantity: 5, 
				price: "48.00", 
				total: "240.00", 
				date: "2023-06-10", 
				image: "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab12?q=80&w=300",
				paid: true
			},
			{ 
				name: "砀山梨", 
				quantity: 3, 
				price: "32.00", 
				total: "96.00", 
				date: "2023-06-05", 
				image: "https://images.unsplash.com/photo-1594502184342-2349ffc9ead3?q=80&w=300",
				paid: false
			},
			{ 
				name: "新鲜橘子", 
				quantity: 4, 
				price: "25.00", 
				total: "100.00", 
				date: "2023-06-03", 
				image: "https://images.unsplash.com/photo-1519096989031-2aee4ffe17c6?q=80&w=300",
				paid: false
			},
			{ 
				name: "蜜桃", 
				quantity: 2, 
				price: "60.00", 
				total: "120.00", 
				date: "2023-05-28", 
				image: "https://images.unsplash.com/photo-1595743825637-cdafc8ad4908?q=80&w=300",
				paid: true
			},
			{ 
				name: "香蕉", 
				quantity: 3, 
				price: "22.00", 
				total: "66.00", 
				date: "2023-05-25", 
				image: "https://images.unsplash.com/photo-1603833665858-e61d17a86224?q=80&w=300",
				paid: false
			},
			{ 
				name: "葡萄", 
				quantity: 2, 
				price: "35.00", 
				total: "70.00", 
				date: "2023-05-20", 
				image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?q=80&w=300",
				paid: true
			},
			{ 
				name: "芒果", 
				quantity: 4, 
				price: "28.00", 
				total: "112.00", 
				date: "2023-05-18", 
				image: "https://images.unsplash.com/photo-1553279757-3e9b1b5d1b5a?q=80&w=300",
				paid: false
			},
			{ 
				name: "西瓜", 
				quantity: 1, 
				price: "45.00", 
				total: "45.00", 
				date: "2023-05-15", 
				image: "https://images.unsplash.com/photo-1628358070889-cb6569b2c487?q=80&w=300",
				paid: true
			},
			{ 
				name: "橙子", 
				quantity: 3, 
				price: "18.00", 
				total: "54.00", 
				date: "2023-05-12", 
				image: "https://images.unsplash.com/photo-1582979512210-99b6a53386f9?q=80&w=300",
				paid: false
			},
			{ 
				name: "草莓", 
				quantity: 2, 
				price: "40.00", 
				total: "80.00", 
				date: "2023-05-10", 
				image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?q=80&w=300",
				paid: true
			},
			{ 
				name: "蓝莓", 
				quantity: 1, 
				price: "50.00", 
				total: "50.00", 
				date: "2023-05-08", 
				image: "https://images.unsplash.com/photo-1498557850523-fd3d894bde2a?q=80&w=300",
				paid: false
			}
		];
		
		// 根据客户ID筛选记录
		let filteredRecords = [];
		if (customerId === 1) {
			filteredRecords = baseRecords.slice(0, 8);
		} else if (customerId === 2) {
			filteredRecords = baseRecords.slice(0, 12);
		} else if (customerId === 3) {
			filteredRecords = baseRecords.slice(0, 6);
		} else {
			filteredRecords = baseRecords;
		}
		
		// 按日期排序 - 确保最新的在前面
		filteredRecords.sort((a, b) => {
			return new Date(b.date) - new Date(a.date);
		});
		
		// 存储所有记录
		allRecords.value = filteredRecords;
		
		// 设置总记录数
		totalRecords.value = filteredRecords.length;
		
		// 计算客户的总销售额和已回款金额
		calculateCustomerPaymentStats(customerId, filteredRecords);
		
		// 初始加载最新的几条记录
		loadLatestRecords();
		
		isLoading.value = false;
	}, 100);
}

// 计算客户的回款统计
function calculateCustomerPaymentStats(customerId, records) {
	// 计算总销售额
	const totalSales = records.reduce((sum, record) => {
		return sum + parseFloat(record.total);
	}, 0);
	
	// 计算已回款金额
	const paidAmount = records.reduce((sum, record) => {
		return sum + (record.paid ? parseFloat(record.total) : 0);
	}, 0);
	
	// 更新当前客户的回款信息
	currentCustomer.value = {
		...currentCustomer.value,
		totalSales,
		paidAmount
	};
}

// 格式化金额
function formatMoney(amount) {
	return amount.toFixed(2);
}

// 计算回款百分比
function getPaymentPercentage(customer) {
	if (!customer.totalSales || customer.totalSales === 0) return 0;
	return Math.round((customer.paidAmount / customer.totalSales) * 100);
}

// 显示回款记录
function showPaymentHistory() {
	uni.showToast({
		title: '回款记录功能开发中',
		icon: 'none'
	});
}

// 添加回款
function addPayment() {
	uni.showToast({
		title: '添加回款功能开发中',
		icon: 'none'
	});
}

// 加载最新的记录（默认顶部显示）
function loadLatestRecords() {
	const total = allRecords.value.length;
	
	// 如果记录总数小于等于页面大小，直接全部显示
	if (total <= pageSize.value) {
		customerSalesRecords.value = [...allRecords.value];
		hasMore.value = false;
		return;
	}
	
	// 否则，取前pageSize条记录
	customerSalesRecords.value = allRecords.value.slice(0, pageSize.value);
	
	// 设置分页状态
	hasMore.value = pageSize.value < total;
}

// 向下滑动加载更多记录
function loadMoreRecords() {
	if (isLoading.value || !hasMore.value) return;
	
	isLoading.value = true;
	
	// 获取当前显示的最后一条记录在全部记录中的索引
	const lastRecordIndex = allRecords.value.findIndex(
		record => record.date === customerSalesRecords.value[customerSalesRecords.value.length - 1].date && 
		record.name === customerSalesRecords.value[customerSalesRecords.value.length - 1].name
	);
	
	if (lastRecordIndex === -1 || lastRecordIndex >= allRecords.value.length - 1) {
		hasMore.value = false;
		isLoading.value = false;
		return;
	}
	
	// 计算加载更多的起始索引
	const startIndex = lastRecordIndex + 1;
	const endIndex = Math.min(startIndex + pageSize.value, allRecords.value.length);
	const newRecords = allRecords.value.slice(startIndex, endIndex);
	
	// 模拟网络延迟
	setTimeout(() => {
		// 添加新记录到后面
		customerSalesRecords.value = [...customerSalesRecords.value, ...newRecords];
		
		// 更新状态
		hasMore.value = endIndex < allRecords.value.length;
		isLoading.value = false;
	}, 100);
}

// 下拉刷新
function onRefresh() {
	isRefreshing.value = true;
	
	// 模拟刷新操作
	setTimeout(() => {
		// 重新加载数据
		resetRecordsData();
		loadAllCustomerRecords(currentCustomer.value.id);
		isRefreshing.value = false;
	}, 100);
}

// 关闭弹窗
function closePopup() {
	customerPopup.value.close();
}

// 联系客户
function contactCustomer() {
	uni.makePhoneCall({
		phoneNumber: currentCustomer.value.phone,
		success: () => {
			console.log('拨打电话成功');
		},
		fail: () => {
			uni.showToast({
				title: '拨打电话失败',
				icon: 'none'
			});
		}
	});
}

// 显示新增客户弹窗
function showAddCustomerPopup() {
	// 重置表单
	newCustomer.value = {
		name: '',
		phone: '',
		remark: ''
	};
	// 打开弹窗
	addCustomerPopup.value.open();
}

// 关闭新增客户弹窗
function closeAddCustomerPopup() {
	addCustomerPopup.value.close();
}

// 确认添加客户
function confirmAddCustomer() {
	// 表单验证
	if (!newCustomer.value.name || !newCustomer.value.phone) {
		uni.showToast({
			title: '请填写必填项',
			icon: 'none'
		});
		return;
	}
	
	// 生成新客户ID
	const newId = customersData.value.length > 0 ? Math.max(...customersData.value.map(c => c.id)) + 1 : 1;
	
	// 创建新客户对象
	const customer = {
		id: newId,
		name: newCustomer.value.name,
		phone: newCustomer.value.phone,
		remark: newCustomer.value.remark || '',
		totalSales: 0,
		paidAmount: 0,
		unpaidAmount: 0
	};
	
	// 添加到客户列表
	customersData.value.push(customer);
	
	// 关闭弹窗
	closeAddCustomerPopup();
	
	// 显示成功提示
	uni.showToast({
		title: '添加成功',
		icon: 'success'
	});
}

// 页面加载时获取数据
onMounted(() => {
	// 设置当前日期
	const now = new Date();
	currentDate.value = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
	
	// 加载客户数据
	loadCustomersData();
});

// 加载客户数据
function loadCustomersData() {
	// 模拟从服务器获取数据
	// 实际应用中，这里应该是API调用
	customersData.value = [
		{ 
			id: 1, 
			name: "李明", 
			phone: "13812345678", 
			totalSales: 1100,
			paidAmount: 800,
			unpaidAmount: 300
		},
		{ 
			id: 2, 
			name: "张三水果店", 
			phone: "15912345678", 
			totalSales: 2400,
			paidAmount: 2400,
			unpaidAmount: 0
		},
		{ 
			id: 3, 
			name: "王五超市", 
			phone: "17712345678", 
			totalSales: 1600,
			paidAmount: 1200,
			unpaidAmount: 400
		},
		{ 
			id: 4, 
			name: "赵六水果配送", 
			phone: "18612345678", 
			totalSales: 3000,
			paidAmount: 2500,
			unpaidAmount: 500
		}
	];
}
</script>

<style>
.customer-container {
	display: flex;
	flex-direction: column;
	height: 100vh;
	padding-bottom: 100rpx;
	background-color: #F5F8FA;
	font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
	box-sizing: border-box;
}

/* 头部样式 */
.customer-header {
	background: #0D9488;
	padding: 30rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	width: 100%;
	box-sizing: border-box;
}

.header-left {
	flex: 1;
}

.header-right {
	flex: 1;
	display: flex;
	justify-content: flex-end;
}

.customer-title {
	font-size: 36rpx;
	font-weight: bold;
	color: white;
}

.date-box {
	display: flex;
	align-items: center;
	background-color: rgba(255, 255, 255, 0.2);
	padding: 6rpx 16rpx;
	border-radius: 30rpx;
	max-width: 220rpx;
}

.date-text {
	color: white;
	font-size: 24rpx;
	margin-left: 8rpx;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

/* 搜索框样式 */
.search-container {
	background-color: #FFFFFF;
	padding: 16rpx 24rpx;
	border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03);
	display: flex;
	align-items: center;
}

.search-box {
	display: flex;
	align-items: center;
	background-color: #F3F4F6;
	border-radius: 32rpx;
	padding: 0 16rpx;
	height: 70rpx;
	flex: 1;
	margin-right: 16rpx;
}

.search-input {
	flex: 1;
	height: 70rpx;
	font-size: 28rpx;
	padding-left: 12rpx;
	color: #374151;
}

.add-customer-btn {
	width: 70rpx;
	height: 70rpx;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: #0D9488;
	border: none;
	padding: 0;
	box-shadow: 0 2rpx 8rpx rgba(13, 148, 136, 0.2);
}

.add-customer-btn::after {
	border: none;
}

.add-customer-btn .iconfont {
	font-size: 32rpx;
	color: #FFFFFF;
}

/* 客户卡片样式优化 */
.customer-list-container {
	flex: 1;
	padding: 12rpx;
	box-sizing: border-box;
	width: 100%;
}

.customer-list {
	display: flex;
	flex-direction: column;
	width: 100%;
}

.customer-card {
	background-color: white;
	border-radius: 12rpx;
	margin-bottom: 12rpx;
	overflow: hidden;
	box-shadow: 0 1rpx 4rpx rgba(0, 0, 0, 0.05);
	transition: all 0.2s ease;
	border: 1rpx solid rgba(0, 0, 0, 0.05);
}

.customer-card:active {
	transform: scale(0.98);
	opacity: 0.95;
}

.customer-content {
	padding: 16rpx;
	border-left: none;
}

.customer-name {
	font-weight: bold;
	font-size: 28rpx;
	color: #1F2937;
	display: block;
	margin-bottom: 8rpx;
}

.customer-info-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.customer-phone {
	font-size: 24rpx;
	color: #4B5563;
}

.customer-orders {
	font-size: 22rpx;
	color: #0D9488;
	font-weight: 500;
	background-color: #E6FFFA;
	padding: 2rpx 12rpx;
	border-radius: 12rpx;
}

/* 弹窗样式优化 */
.customer-popup-bg {
	background-color: white;
	border-top-left-radius: 24rpx;
	border-top-right-radius: 24rpx;
	overflow: hidden;
	padding-bottom: env(safe-area-inset-bottom);
	box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.1);
	max-height: 80vh;
	display: flex;
	flex-direction: column;
}

.popup-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 24rpx;
	border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);
	flex-shrink: 0;
}

.popup-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #1F2937;
}

.close-btn {
	width: 72rpx;
	height: 72rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: -16rpx;
}

.popup-scroll-content {
	flex: 1;
	height: 60vh;
	padding-bottom: 80rpx;
}

.popup-content {
	padding: 24rpx;
	padding-bottom: 100rpx;
}

.info-card {
	padding: 24rpx;
	background-color: #F9FAFB;
	border-radius: 16rpx;
	margin-bottom: 16rpx;
}

.info-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #1F2937;
}

.info-label {
	font-size: 24rpx;
	color: #6B7280;
	margin-bottom: 8rpx;
	display: block;
}

.info-value {
	font-size: 28rpx;
	color: #0D9488;
	font-weight: 500;
}

.info-card.highlight {
	background-color: #E6FFFA;
}

.info-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.info-highlight {
	font-size: 28rpx;
	color: #0D9488;
	font-weight: bold;
}

.action-button {
	width: 100%;
	height: 88rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(135deg, #0D9488, #0F766E);
	color: white;
	font-size: 30rpx;
	font-weight: 500;
	border-radius: 16rpx;
	margin-top: 16rpx;
	box-shadow: 0 2rpx 8rpx rgba(13, 148, 136, 0.2);
}

.action-button:active {
	opacity: 0.9;
	transform: scale(0.98);
}

/* 销售记录区域样式优化 */
.customer-sales-records {
	margin-top: 16rpx;
	padding: 16rpx;
	background-color: #F9FAFB;
	border-radius: 12rpx;
	display: flex;
	flex-direction: column;
	height: 550rpx; /* 固定高度，确保滚动正常 */
}

.records-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 16rpx;
	flex-shrink: 0;
}

.records-title {
	font-size: 28rpx;
	font-weight: bold;
	color: #1F2937;
}

.records-count {
	font-size: 24rpx;
	color: #6B7280;
}

/* 记录滚动视图 */
.records-scroll-view {
	flex: 1;
	height: 400rpx;
	scrollbar-width: none; /* Firefox */
	-ms-overflow-style: none; /* IE and Edge */
}

.records-scroll-view::-webkit-scrollbar {
	display: none; /* Chrome, Safari, Opera */
}

.records-list {
	display: flex;
	flex-direction: column;
	padding-bottom: 16rpx;
}

.record-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 12rpx 0;
	border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);
}

.record-item:last-child {
	border-bottom: none;
}

.record-content {
	display: flex;
	justify-content: space-between;
	align-items: center;
	width: 100%;
}

.record-left {
	display: flex;
	align-items: center;
}

.record-image {
	width: 80rpx;
	height: 80rpx;
	border-radius: 8rpx;
	margin-right: 16rpx;
}

.record-info {
	display: flex;
	flex-direction: column;
}

.record-name {
	font-size: 28rpx;
	font-weight: bold;
	color: #1F2937;
	margin-bottom: 4rpx;
}

.record-quantity {
	font-size: 24rpx;
	color: #4B5563;
}

.record-right {
	display: flex;
	flex-direction: column;
	align-items: flex-end;
}

.record-total {
	font-size: 28rpx;
	font-weight: bold;
	color: #0D9488;
	margin-bottom: 4rpx;
}

.record-date {
	font-size: 24rpx;
	color: #6B7280;
}

/* 加载状态样式 */
.loading-status {
	padding: 12rpx 0;
	display: flex;
	justify-content: center;
}

.loading-more {
	display: flex;
	align-items: center;
}

.loading-text {
	font-size: 24rpx;
	color: #6B7280;
	margin-left: 8rpx;
}

.no-more {
	padding: 12rpx 0;
}

.no-more-text {
	font-size: 24rpx;
	color: #9CA3AF;
}

/* 空状态样式 */
.empty-records {
	padding: 60rpx 0;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.empty-image {
	width: 200rpx;
	height: 200rpx;
	margin-bottom: 20rpx;
}

.empty-text {
	font-size: 28rpx;
	color: #9CA3AF;
}

/* 回款统计卡片样式 */
.payment-stats {
	background-color: #F0FDFA;
	border: 1rpx solid #CCFBF1;
}

.stats-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 16rpx;
}

.stats-title {
	font-size: 28rpx;
	font-weight: bold;
	color: #0D9488;
}

.stats-actions {
	display: flex;
	align-items: center;
}

.stats-action-btn {
	display: flex;
	align-items: center;
	padding: 4rpx 12rpx;
	background-color: rgba(13, 148, 136, 0.1);
	border-radius: 20rpx;
}

.action-text {
	font-size: 24rpx;
	color: #0D9488;
	margin-right: 4rpx;
}

.stats-content {
	display: flex;
	justify-content: space-between;
	margin-bottom: 16rpx;
}

.stats-item {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.stats-label {
	font-size: 24rpx;
	color: #6B7280;
	margin-bottom: 8rpx;
}

.stats-value {
	font-size: 28rpx;
	font-weight: bold;
	color: #1F2937;
}

.stats-value.success {
	color: #059669;
}

.stats-value.warning {
	color: #DC2626;
}

.payment-progress {
	margin-top: 16rpx;
}

.progress-bar {
	height: 8rpx;
	background-color: #E5E7EB;
	border-radius: 4rpx;
	overflow: hidden;
	margin-bottom: 8rpx;
}

.progress-inner {
	height: 100%;
	background: linear-gradient(90deg, #0D9488, #10B981);
	border-radius: 4rpx;
}

.progress-text {
	font-size: 24rpx;
	color: #6B7280;
	text-align: right;
}

/* 销售记录状态样式 */
.record-status {
	font-size: 22rpx;
	padding: 2rpx 8rpx;
	border-radius: 8rpx;
	margin-top: 4rpx;
}

.status-paid {
	background-color: #D1FAE5;
	color: #059669;
}

.status-unpaid {
	background-color: #FEE2E2;
	color: #DC2626;
}

/* 操作按钮样式 */
.action-buttons {
	display: flex;
	justify-content: space-between;
	margin-top: 24rpx;
}

.action-button {
	flex: 1;
	height: 88rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(135deg, #0D9488, #0F766E);
	color: white;
	font-size: 30rpx;
	font-weight: 500;
	border-radius: 16rpx;
	box-shadow: 0 2rpx 8rpx rgba(13, 148, 136, 0.2);
	margin: 0 12rpx;
}

.action-button:first-child {
	margin-left: 0;
}

.action-button:last-child {
	margin-right: 0;
}

.payment-button {
	background: linear-gradient(135deg, #059669, #047857);
	box-shadow: 0 2rpx 8rpx rgba(5, 150, 105, 0.2);
}

.action-button:active {
	opacity: 0.9;
	transform: scale(0.98);
}

/* 客户卡片样式优化 */
.customer-card {
	background-color: white;
	border-radius: 12rpx;
	margin-bottom: 12rpx;
	overflow: hidden;
	box-shadow: 0 1rpx 4rpx rgba(0, 0, 0, 0.05);
	transition: all 0.2s ease;
	border: 1rpx solid rgba(0, 0, 0, 0.05);
}

.customer-header-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 8rpx;
}

.unpaid-badge {
	background: linear-gradient(135deg, #FEE2E2, #FECACA);
	padding: 6rpx 16rpx;
	border-radius: 20rpx;
	display: flex;
	align-items: center;
	box-shadow: 0 2rpx 6rpx rgba(220, 38, 38, 0.15);
	border: 1rpx solid rgba(220, 38, 38, 0.2);
}

.unpaid-icon {
	font-size: 24rpx;
	color: #DC2626;
	margin-right: 6rpx;
}

.unpaid-text {
	font-size: 22rpx;
	color: #DC2626;
	font-weight: 600;
}

.customer-phone {
	font-size: 24rpx;
	color: #4B5563;
}

/* 表单样式 */
.form-item {
	margin-bottom: 24rpx;
	width: 100%;
	box-sizing: border-box;
}

.form-label {
	font-size: 28rpx;
	color: #4B5563;
	font-weight: 500;
	margin-bottom: 12rpx;
	display: block;
}

.form-input {
	width: 100%;
	height: 80rpx;
	border: 1rpx solid #E5E7EB;
	border-radius: 12rpx;
	padding: 0 24rpx;
	font-size: 28rpx;
	color: #1F2937;
	box-sizing: border-box;
}

.form-textarea {
	width: 100%;
	height: 160rpx;
	border: 1rpx solid #E5E7EB;
	border-radius: 12rpx;
	padding: 16rpx 24rpx;
	font-size: 28rpx;
	color: #1F2937;
	box-sizing: border-box;
}

.confirm-btn {
	height: 90rpx;
	border-radius: 45rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 30rpx;
	font-weight: 500;
	margin-top: 24rpx;
	color: white;
	width: 100%;
	background: linear-gradient(135deg, #0D9488, #0F766E);
	box-shadow: 0 4rpx 12rpx rgba(13, 148, 136, 0.2);
	position: relative;
	overflow: hidden;
}

.confirm-btn::after {
	border: none;
}

.confirm-btn:active {
	transform: scale(0.98);
	opacity: 0.9;
}

.confirm-btn::before {
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: linear-gradient(to right, rgba(255,255,255,0.1), rgba(255,255,255,0));
	z-index: 1;
}

.required {
	color: #EF4444;
	margin-left: 4rpx;
}
</style> 