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
				<input v-model="searchText" type="text" placeholder="搜索客户名称、联系方式或地址..." class="search-input" @input="filterCustomers" />
			</view>
			<button class="add-customer-btn" @tap="resetAndOpenAddCustomerPopup()">
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
						<view class="info-card" v-if="currentCustomer.address">
							<text class="info-label">地址</text>
							<text class="info-value">{{currentCustomer.address}}</text>
						</view>

						<!-- 回款统计卡片 -->
						<view class="info-card payment-stats">
							<view class="stats-header">
								<text class="stats-title">回款统计</text>
								<view class="stats-actions">
									<button class="payment-btn" @tap="addPayment" v-if="currentCustomerDebt > 0">
										添加回款
									</button>
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
													<text class="record-name">{{getFruitDisplayName(record)}}</text>
													<text class="record-quantity">{{getQuantityDisplay(record)}}</text>
												</view>
											</view>
											<view class="record-right">
												<text class="record-total">¥{{getTotalDisplay(record)}}</text>
												<text class="record-date">{{getDateDisplay(record)}}</text>
												<view class="record-status-container">
													<text class="record-status" :class="{
														'status-paid': parseInt(record.payment_status) === 1,
														'status-partial': parseInt(record.payment_status) === 2,
														'status-unpaid': parseInt(record.payment_status) === 0
													}">
														{{getPaymentStatusText(record)}}
													</text>
													<button
														v-if="parseInt(record.payment_status) === 0 || parseInt(record.payment_status) === 2"
														class="record-payment-btn"
														@tap.stop="addSinglePayment(record)"
													>收款</button>
												</view>
											</view>
										</view>
									</view>
								</view>

								<!-- 加载状态 - 放在列表底部 -->
								<view class="loading-status" v-if="customerSalesRecords.length > 0">
									<view class="loading-more" v-if="isLoading">
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
					<view class="close-btn" @tap="addCustomerPopup.close()">
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
						<text class="form-label">地址</text>
						<input v-model="newCustomer.address" type="text" placeholder="请输入地址" class="form-input" />
					</view>
					<view class="form-item">
						<text class="form-label">备注</text>
						<textarea v-model="newCustomer.remark" placeholder="请输入备注信息" class="form-textarea"></textarea>
					</view>
					<button class="confirm-btn" @tap="confirmAddCustomer">确认添加</button>
				</view>
			</view>
		</uni-popup>

		<!-- 收款弹窗 -->
		<payment-popup
			ref="paymentPopupRef"
			:customer="currentCustomer"
			:total-debt-amount="currentCustomerDebt"
			:unpaid-records="unpaidRecords"
			@close="onPaymentPopupClose"
			@confirm="onPaymentConfirm"
		></payment-popup>

		<!-- 底部TabBar -->
		<custom-tab-bar></custom-tab-bar>
	</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import CustomTabBar from '@/components/CustomTabBar.vue';
import CustomIcon from '@/components/CustomIcon.vue';
import PaymentPopup from './PaymentPopup.vue';
import { processPayment } from '@/services/paymentService.js';
import { getDefaultFruitImage } from '@/services/fruitService.js';
import { getSalesRecords } from '@/services/salesRecordService.js';
import { getCustomers, getCustomerById, createCustomer } from '@/services/customerService.js';

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
	address: '',
	remark: ''
});

// 收款相关数据
const paymentPopupRef = ref(null);
const currentCustomerDebt = ref(0);
const unpaidRecords = ref([]);

// 过滤后的客户数据
const filteredCustomers = computed(() => {
	if (!searchText.value) return customersData.value;

	const query = searchText.value.toLowerCase();
	return customersData.value.filter(customer => {
		return customer.name.toLowerCase().includes(query) ||
			customer.phone.includes(query) ||
			(customer.address && customer.address.toLowerCase().includes(query));
	});
});

// 搜索过滤
function filterCustomers() {
	// 搜索逻辑已经在computed中实现
}

// 获取弹窗组件引用
const customerPopup = ref(null);

// 显示客户详情弹窗
async function showCustomerDetail(customer) {
	// 显示加载中提示
	uni.showLoading({ title: '加载中...' });

	// 先设置当前客户的基本信息，避免弹窗打开时的闪烁
	currentCustomer.value = customer;
	console.log('当前客户基本数据:', customer);

	try {
		// 打开弹窗
		customerPopup.value.open();

		// 重置分页和记录数据
		resetRecordsData();

		// 使用客户对象中的欠款信息
		currentCustomerDebt.value = customer.unpaidAmount || 0;
		console.log('使用客户对象中的欠款信息:', currentCustomerDebt.value);

		// 使用API 4.2获取客户详情，包含最近销售记录和付款记录
		try {
			const customerDetail = await getCustomerById(customer.id);
			console.log('获取到的客户详情:', customerDetail);

			if (customerDetail) {
				// 更新当前客户的详细信息
				currentCustomer.value = {
					...customer,
					...customerDetail,
					// 将下划线命名转换为驼峰命名
					unpaidAmount: customerDetail.unpaid_amount || customer.unpaidAmount || 0,
					totalSales: customerDetail.total_sales || customer.totalSales || 0,
					paidAmount: customerDetail.paid_amount || customer.paidAmount || 0
				};

				// 更新欠款总额
				currentCustomerDebt.value = currentCustomer.value.unpaidAmount;

				// 如果有最近销售记录，处理并显示
				if (customerDetail.recent_sales && customerDetail.recent_sales.length > 0) {
					console.log('客户有最近销售记录:', customerDetail.recent_sales.length, '条');

					// 处理销售记录
					const processedRecords = customerDetail.recent_sales.map(record => {
						// 创建记录的副本，避免修改原始数据
						const processedRecord = { ...record };

						// 处理字段名称转换
						if (record.sale_date) processedRecord.date = record.sale_date;
						if (record.fruit_name) processedRecord.name = record.fruit_name;

						// 确保 payment_status 字段存在并为数字
						if (record.payment_status !== undefined) {
							processedRecord.payment_status = parseInt(record.payment_status);
						} else {
							// 如果没有 payment_status，默认为 0（未付款）
							processedRecord.payment_status = 0;
						}

						// 确保记录有图片
						if (!processedRecord.image) {
							// 根据水果名称设置默认图片
							processedRecord.image = getDefaultFruitImage(processedRecord.name || '水果');
						}

						return processedRecord;
					});

					// 存储所有记录
					allRecords.value = processedRecords;

					// 设置总记录数
					totalRecords.value = processedRecords.length;

					// 初始加载最新的几条记录
					loadLatestRecords();
				} else {
					// 如果没有最近销售记录，尝试使用getSalesRecords获取
					console.log('客户详情中没有最近销售记录，尝试使用getSalesRecords获取');
					try {
						await loadAllCustomerRecords(customer.id);
					} catch (recordError) {
						console.error('加载客户销售记录失败:', recordError);
					}
				}

				// 如果有最近付款记录，处理并存储
				if (customerDetail.recent_payments && customerDetail.recent_payments.length > 0) {
					console.log('客户有最近付款记录:', customerDetail.recent_payments.length, '条');
					// 这里可以存储付款记录，如果需要在UI中显示
				}
			}
		} catch (detailError) {
			console.error('获取客户详情失败:', detailError);

			// 如果获取客户详情失败，尝试使用其他API获取销售记录
			try {
				await loadAllCustomerRecords(customer.id);
			} catch (recordError) {
				console.error('加载客户销售记录失败:', recordError);
			}
		}

		// 客户欠款总额已经在客户详情中获取，不需要再计算

		// 从已加载的销售记录中筛选出待付款记录
		try {
			// 从已加载的销售记录中筛选出付款状态为0（未付款）或2（部分付款）的记录
			unpaidRecords.value = allRecords.value.filter(record => {
				const paymentStatus = parseInt(record.payment_status);
				return paymentStatus === 0 || paymentStatus === 2;
			});
			console.log('从销售记录中筛选出的待付款记录:', unpaidRecords.value);
		} catch (unpaidError) {
			console.error('筛选待付款记录失败:', unpaidError);
			unpaidRecords.value = []; // 设置为空数组
		}

		uni.hideLoading();
	} catch (error) {
		uni.hideLoading();
		console.error('加载客户详情失败:', error);
		uni.showToast({
			title: '加载客户详情失败',
			icon: 'none'
		});
	}
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
async function loadAllCustomerRecords(customerId) {
	if (isLoading.value) return;

	isLoading.value = true;
	console.log('开始加载客户销售记录, 客户ID:', customerId);

	try {
		// 从 salesRecordService 获取所有销售记录
		console.log('调用 getSalesRecords API, 参数:', { customerId });
		const allSalesRecordsResult = await getSalesRecords({ customerId });
		console.log('获取到的原始销售记录数据:', allSalesRecordsResult);

		// 处理返回的销售记录数据，兼容不同的响应格式
		let allSalesRecords = [];

		// 如果是数组，直接使用
		if (Array.isArray(allSalesRecordsResult)) {
			allSalesRecords = allSalesRecordsResult;
			console.log('销售记录数据是数组格式');
		}
		// 如果是对象，并且有items属性
		else if (allSalesRecordsResult && typeof allSalesRecordsResult === 'object' && allSalesRecordsResult.items) {
			allSalesRecords = allSalesRecordsResult.items;
			console.log('销售记录数据是分页对象格式，使用items属性');
		}
		// 如果是对象，并且有data属性
		else if (allSalesRecordsResult && typeof allSalesRecordsResult === 'object' && allSalesRecordsResult.data) {
			// 如果data是数组，直接使用
			if (Array.isArray(allSalesRecordsResult.data)) {
				allSalesRecords = allSalesRecordsResult.data;
				console.log('销售记录数据在data属性中，是数组格式');
			}
			// 如果data是对象，并且有items属性
			else if (typeof allSalesRecordsResult.data === 'object' && allSalesRecordsResult.data.items) {
				allSalesRecords = allSalesRecordsResult.data.items;
				console.log('销售记录数据在data.items属性中');
			}
		}

		console.log('处理后的销售记录数据:', allSalesRecords);
		console.log('从 salesRecordService 获取的销售记录数量:', allSalesRecords.length);
		console.log('销售记录数据结构示例:', allSalesRecords.length > 0 ? JSON.stringify(allSalesRecords[0], null, 2) : '没有记录');

		// 如果没有销售记录，设置空数组并显示提示
		if (allSalesRecords.length === 0) {
			console.log('没有找到销售记录');
			uni.showToast({
				title: '没有找到销售记录',
				icon: 'none'
			});

			// 设置空数组，而不是直接返回
			allRecords.value = [];
			totalRecords.value = 0;
			customerSalesRecords.value = [];
			isLoading.value = false;

			// 从客户详情API获取客户的总销售额、已付款金额和欠款金额
			await calculateCustomerPaymentStats(customerId);
			return;
		}

		// 按日期排序 - 确保最新的在前面
		allSalesRecords.sort((a, b) => {
			return new Date(b.date) - new Date(a.date);
		});

		// 更新每条记录的付款状态显示
		const processedRecords = allSalesRecords.map(record => {
			// 创建记录的副本，避免修改原始数据
			const processedRecord = { ...record };

			// 确保 payment_status 字段存在并为数字
			if (processedRecord.payment_status !== undefined) {
				processedRecord.payment_status = parseInt(processedRecord.payment_status);
			} else {
				// 如果没有 payment_status，默认为 0（未付款）
				processedRecord.payment_status = 0;
			}

			// 确保记录有图片
			if (!processedRecord.image) {
				// 根据水果名称设置默认图片
				processedRecord.image = getDefaultFruitImage(processedRecord.name || processedRecord.fruitName || '水果');
			}

			return processedRecord;
		});

		// 存储所有记录
		allRecords.value = processedRecords;

		// 设置总记录数
		totalRecords.value = processedRecords.length;

		// 从客户详情API获取客户的总销售额、已付款金额和欠款金额
		await calculateCustomerPaymentStats(customerId);

		// 初始加载最新的几条记录
		loadLatestRecords();
	} catch (error) {
		console.error('加载客户销售记录失败:', error);
		uni.showToast({
			title: '加载客户销售记录失败',
			icon: 'none'
		});
	} finally {
		isLoading.value = false;
	}
}

// 计算客户的回款统计
async function calculateCustomerPaymentStats(customerId) {
	console.log('获取客户回款统计信息, 客户ID:', customerId);

	try {
		// 使用API 4.2获取客户详情，包含总销售额、已付款金额和欠款金额
		const customerDetail = await getCustomerById(customerId);
		console.log('从客户详情API获取的回款统计信息:', customerDetail);

		if (customerDetail) {
			// 从客户详情中提取总销售额、已付款金额和欠款金额
			const totalSales = parseFloat(customerDetail.total_sales || 0);
			const paidAmount = parseFloat(customerDetail.paid_amount || 0);
			const unpaidAmount = parseFloat(customerDetail.unpaid_amount || 0);

			// 计算回款率
			const paymentRate = totalSales > 0 ? Math.round((paidAmount / totalSales) * 100) : 0;

			console.log(`客户回款统计信息:`, {
				总销售额: totalSales,
				已回款金额: paidAmount,
				未付款金额: unpaidAmount,
				回款率: paymentRate + '%'
			});

			// 更新当前客户的回款信息
			currentCustomer.value = {
				...currentCustomer.value,
				totalSales,
				paidAmount,
				unpaidAmount,
				paymentRate
			};

			// 更新欠款总额（用于其他组件）
			currentCustomerDebt.value = unpaidAmount;

			return { totalSales, paidAmount, unpaidAmount, paymentRate };
		}
	} catch (error) {
		console.error('获取客户回款统计信息失败:', error);
		// 如果获取失败，保持当前值不变
		return null;
	}
}

// 格式化金额
function formatMoney(amount) {
	return amount.toFixed(2);
}



// 使用fruitService中的getDefaultFruitImage方法

// 获取水果显示名称
function getFruitDisplayName(record) {
	// 优先使用fruit_name字段
	if (record.fruit_name) return record.fruit_name;
	// 其次尝试不同的字段名称
	if (record.name) return record.name;
	if (record.fruitName) return record.fruitName;
	if (record.productName) return record.productName;
	if (record.title) return record.title;

	// 尝试组合字段
	if (record.brand && record.variety) {
		return `${record.brand}${record.variety}`;
	}

	// 如果没有名称，返回默认值
	return '水果';
}

// 获取数量显示
function getQuantityDisplay(record) {
	// 如果有数量和价格
	if (record.quantity && (record.price || record.unitPrice)) {
		const price = record.price || record.unitPrice;
		const unit = record.unit || '箱';
		return `${record.quantity}${unit} × ¥${price}`;
	}

	// 如果只有数量
	if (record.quantity) {
		const unit = record.unit || '箱';
		return `${record.quantity}${unit}`;
	}

	// 如果没有数量
	return '';
}

// 获取总价显示
function getTotalDisplay(record) {
	// 尝试不同的字段名称
	if (record.total) return formatMoney(parseFloat(record.total));
	if (record.amount) return formatMoney(parseFloat(record.amount));
	if (record.totalAmount) return formatMoney(parseFloat(record.totalAmount));

	// 如果有数量和单价，计算总价
	if (record.quantity && (record.price || record.unitPrice)) {
		const price = parseFloat(record.price || record.unitPrice);
		const quantity = parseFloat(record.quantity);
		return formatMoney(price * quantity);
	}

	// 如果没有总价，返回默认值
	return '0.00';
}

// 获取日期显示
function getDateDisplay(record) {
	// 如果有日期字段
	if (record.date) return record.date;
	if (record.createDate) return record.createDate;
	if (record.createTime) return record.createTime;
	if (record.saleDate) return record.saleDate;
	if (record.sale_date) return record.sale_date;

	// 如果有时间戳
	if (record.timestamp) {
		const date = new Date(record.timestamp);
		return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
	}

	// 如果没有日期，返回默认值
	return '';
}

// 获取付款状态文本
function getPaymentStatusText(record) {
	// 只检查payment_status字段（0-未付款，1-已付款，2-部分付款）
	const status = parseInt(record.payment_status);
	if (status === 1) return '已回款';
	if (status === 2) return '部分回款';
	if (status === 0) return '未回款';

	// 默认返回未回款
	return '未回款';
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
	// 打开收款弹窗
	paymentPopupRef.value.open();
}

// 添加单条记录收款
function addSinglePayment(record) {
	// 计算该记录的未付金额
	let unpaidAmount = 0;
	if (record.unpaidAmount !== undefined) {
		unpaidAmount = parseFloat(record.unpaidAmount);
	} else if (record.amount !== undefined && record.paidAmount !== undefined) {
		unpaidAmount = parseFloat(record.amount) - parseFloat(record.paidAmount);
	} else if (record.total !== undefined && record.paidAmount !== undefined) {
		unpaidAmount = parseFloat(record.total) - parseFloat(record.paidAmount);
	} else if (record.amount !== undefined) {
		unpaidAmount = parseFloat(record.amount);
	} else if (record.total !== undefined) {
		unpaidAmount = parseFloat(record.total);
	}

	// 如果没有未付金额，显示提示并返回
	if (unpaidAmount <= 0) {
		uni.showToast({
			title: '该记录已经付清',
			icon: 'none'
		});
		return;
	}

	// 设置当前选中的记录
	const selectedRecords = [record.orderNo || record.id];

	// 打开收款弹窗，并传入选中的记录
	paymentPopupRef.value.openWithSelectedRecords(selectedRecords);
}

// 关闭收款弹窗
function onPaymentPopupClose() {
	// 什么也不需要做
}

// 确认收款
async function onPaymentConfirm(paymentData) {
	console.log('开始处理收款，收款数据:', paymentData);

	// 显示加载中提示
	uni.showLoading({ title: '处理中...' });

	try {
		// 处理收款
		const result = await processPayment(paymentData);
		console.log('收款处理成功，结果:', result);

		// 隐藏加载中提示
		uni.hideLoading();

		// 显示成功提示
		uni.showToast({
			title: '收款成功',
			icon: 'success'
		});

		// 重新获取客户详情，包含最新的欠款总额
		try {
			// 使用客户详情接口获取最新数据
			const customerDetail = await getCustomerById(currentCustomer.value.id);
			if (customerDetail) {
				// 从客户详情中获取欠款总额
				const newDebtAmount = customerDetail.unpaid_amount || 0;
				currentCustomerDebt.value = newDebtAmount;

				// 更新当前客户的欠款信息
				currentCustomer.value = {
					...currentCustomer.value,
					...customerDetail,
					// 将下划线命名转换为驼峰命名
					unpaidAmount: newDebtAmount,
					totalSales: customerDetail.total_sales || currentCustomer.value.totalSales || 0,
					paidAmount: customerDetail.paid_amount || currentCustomer.value.paidAmount || 0
				};
			}
		} catch (error) {
			console.error('获取客户详情失败:', error);
		}

		// 重新加载客户的销售记录，然后筛选出待付款记录
		try {
			// 重新加载客户的销售记录
			resetRecordsData();
			await loadAllCustomerRecords(currentCustomer.value.id);

			// 从重新加载的销售记录中筛选出待付款记录
			unpaidRecords.value = allRecords.value.filter(record => {
				const paymentStatus = parseInt(record.payment_status);
				return paymentStatus === 0 || paymentStatus === 2;
			});
			console.log('重新筛选的待付款记录:', unpaidRecords.value);
		} catch (unpaidError) {
			console.error('重新筛选待付款记录失败:', unpaidError);
		}

		// 重新加载客户的销售记录
		try {
			resetRecordsData();
			await loadAllCustomerRecords(currentCustomer.value.id);
		} catch (recordsError) {
			console.error('重新加载客户销售记录失败:', recordsError);
		}

		// 重新加载客户列表数据，更新所有客户的欠款信息
		try {
			await loadCustomersData();
		} catch (customersError) {
			console.error('重新加载客户列表数据失败:', customersError);
		}
	} catch (error) {
		// 隐藏加载中提示
		uni.hideLoading();

		console.error('收款处理失败:', error);
		uni.showToast({
			title: '收款失败',
			icon: 'none'
		});
	}
}

// 加载最新的记录（默认顶部显示）
function loadLatestRecords() {
	const total = allRecords.value.length;
	console.log('开始加载最新记录，总记录数:', total);

	// 记录总数作为全局变量，便于其他函数使用
	totalRecords.value = total;

	// 如果记录总数小于等于页面大小，直接全部显示
	if (total <= pageSize.value) {
		customerSalesRecords.value = [...allRecords.value];
		hasMore.value = false;
		console.log('记录总数小于等于页面大小，全部显示');
		return;
	}

	// 否则，取前pageSize条记录
	customerSalesRecords.value = allRecords.value.slice(0, pageSize.value);
	console.log(`加载前 ${pageSize.value} 条记录，当前显示的记录数量:`, customerSalesRecords.value.length);

	// 设置分页状态
	hasMore.value = customerSalesRecords.value.length < total;
	console.log('是否还有更多记录:', hasMore.value);
}

// 向下滑动加载更多记录
function loadMoreRecords() {
	if (isLoading.value || !hasMore.value) return;

	isLoading.value = true;

	// 直接使用当前显示的记录数量作为起始索引
	// 检查是否已经加载完所有记录
	if (customerSalesRecords.value.length >= allRecords.value.length) {
		console.log('已经加载完所有记录');
		hasMore.value = false;
		isLoading.value = false;
		return;
	}

	// 计算加载更多的起始索引
	const startIndex = customerSalesRecords.value.length;
	const endIndex = Math.min(startIndex + pageSize.value, allRecords.value.length);
	const newRecords = allRecords.value.slice(startIndex, endIndex);

	// 模拟网络延迟
	setTimeout(() => {
		// 添加新记录到后面
		customerSalesRecords.value = [...customerSalesRecords.value, ...newRecords];

		// 更新状态
		hasMore.value = customerSalesRecords.value.length < allRecords.value.length;
		isLoading.value = false;

		// 打印日志信息便于调试
		console.log('当前显示的记录数量:', customerSalesRecords.value.length);
		console.log('总记录数量:', allRecords.value.length);
		console.log('是否还有更多记录:', hasMore.value);
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

// 重置并打开新增客户弹窗
function resetAndOpenAddCustomerPopup() {
	// 重置表单
	newCustomer.value = {
		name: '',
		phone: '',
		address: '',
		remark: ''
	};
	// 打开弹窗
	addCustomerPopup.value.open();
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

	// 显示加载中提示
	uni.showLoading({ title: '添加中...' });

	// 创建新客户对象
	const customer = {
		name: newCustomer.value.name,
		phone: newCustomer.value.phone,
		address: newCustomer.value.address || '',
		remark: newCustomer.value.remark || '',
		status: 1
	};

	// 使用API创建客户
	createCustomer(customer)
		.then(() => {
			uni.hideLoading();

			// 关闭弹窗
			addCustomerPopup.value.close();

			// 显示成功提示
			uni.showToast({
				title: '添加成功',
				icon: 'success'
			});

			// 重新加载客户数据
			loadCustomersData();

			// 触发页面刷新事件，通知其他页面更新客户数据
			uni.$emit('pageRefresh');
		})
		.catch(err => {
			uni.hideLoading();
			uni.showToast({
				title: err.message || '添加失败，请重试',
				icon: 'none'
			});
			console.error('添加客户失败:', err);
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
	console.log('开始加载客户数据');

	// 返回一个Promise对象
	return new Promise((resolve, reject) => {
		// 显示加载中提示
		uni.showLoading({ title: '加载中...' });

		// 使用API获取客户数据
		getCustomers()
			.then(res => {
				uni.hideLoading();
				console.log('获取到的原始客户数据:', res);

				// 处理返回的客户数据
				// 根据API文档中4.1获取客户列表的响应格式处理数据
				let customersArray = [];

				// 先检查标准的API响应格式
				if (res && res.data && res.data.items && Array.isArray(res.data.items)) {
					console.log('使用标准API响应格式: res.data.items');
					customersArray = res.data.items;
				}
				// 如果不是标准格式，尝试其他可能的格式
				else if (res && res.items && Array.isArray(res.items)) {
					console.log('使用备用格式: res.items');
					customersArray = res.items;
				}
				else if (res && Array.isArray(res)) {
					console.log('使用备用格式: res数组');
					customersArray = res;
				}
				else if (res && res.data && Array.isArray(res.data)) {
					console.log('使用备用格式: res.data数组');
					customersArray = res.data;
				}
				else {
					console.warn('无法识别的客户数据格式:', res);
					customersArray = [];
				}

				// 处理客户数据，确保欠款字段正确映射
				customersData.value = customersArray.map(customer => {
					// 确保欠款金额是数字类型
					let unpaidAmount = 0;
					if (customer.unpaid_amount !== undefined) {
						unpaidAmount = parseFloat(customer.unpaid_amount);
					} else if (customer.unpaidAmount !== undefined) {
						unpaidAmount = parseFloat(customer.unpaidAmount);
					}

					// 确保总销售额是数字类型
					let totalSales = 0;
					if (customer.total_sales !== undefined) {
						totalSales = parseFloat(customer.total_sales);
					} else if (customer.totalSales !== undefined) {
						totalSales = parseFloat(customer.totalSales);
					}

					// 确保已付款金额是数字类型
					let paidAmount = 0;
					if (customer.paid_amount !== undefined) {
						paidAmount = parseFloat(customer.paid_amount);
					} else if (customer.paidAmount !== undefined) {
						paidAmount = parseFloat(customer.paidAmount);
					}

					// 返回处理后的客户对象
					return {
						...customer,
						// 将下划线命名转换为驼峰命名
						unpaidAmount: unpaidAmount,
						totalSales: totalSales,
						paidAmount: paidAmount
					};
				});

				console.log('客户数据加载成功，包含欠款信息:',
					customersData.value.map(c => ({
						id: c.id,
						name: c.name,
						unpaidAmount: c.unpaidAmount
					})));

				// 解决Promise
				resolve(customersData.value);
			})
			.catch(err => {
				uni.hideLoading();
				uni.showToast({
					title: '获取客户数据失败，请重试',
					icon: 'none'
				});
				console.error('加载客户数据失败:', err);

				// 拒绝Promise
				reject(err);
			});
	});
}



// 注意: 原来的 updateCustomerDebtInfo 函数已经被移动到 customerService.js 中

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
	padding: 30rpx 0;
	display: flex;
	justify-content: center;
	width: 100%;
	margin-bottom: 30rpx;
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
	padding: 30rpx 0;
	width: 100%;
	text-align: center;
	margin-bottom: 30rpx;
}

.no-more-text {
	font-size: 24rpx;
	color: #6B7280;
	padding: 10rpx 30rpx;
	background-color: #F3F4F6;
	border-radius: 30rpx;
	display: inline-block;
}

/* 空状态样式 */
.empty-records {
	padding: 60rpx 0 120rpx 0; /* 增加底部的padding，考虑底部导航栏的高度 */
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 400rpx; /* 设置固定高度，确保内容居中显示 */
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
.record-status-container {
	display: flex;
	align-items: center;
	margin-top: 4rpx;
	gap: 10rpx;
}

.record-status {
	font-size: 22rpx;
	padding: 2rpx 8rpx;
	border-radius: 8rpx;
}

.status-paid {
	background-color: #D1FAE5;
	color: #059669;
}

.status-partial {
	background-color: #FEF3C7;
	color: #D97706;
}

.status-unpaid {
	background-color: #FEE2E2;
	color: #DC2626;
}

.record-payment-btn {
	font-size: 20rpx;
	padding: 2rpx 10rpx;
	background-color: #0D9488;
	color: #FFFFFF;
	border-radius: 8rpx;
	line-height: 1.2;
	height: auto;
	margin: 0;
	display: none; /* 隐藏收款按钮 */
}

/* 操作按钮样式 */
.action-buttons {
	display: flex;
	justify-content: space-between;
	margin-top: 24rpx;
}

/* 回款按钮样式 */
.payment-btn {
	font-size: 24rpx;
	padding: 4rpx 16rpx;
	background-color: #0D9488;
	color: #FFFFFF;
	border-radius: 8rpx;
	line-height: 1.5;
	height: auto;
	margin: 0;
	margin-right: 16rpx;
	box-shadow: 0 2rpx 4rpx rgba(13, 148, 136, 0.2);
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

