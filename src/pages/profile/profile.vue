<template>
	<view class="page-container">
		<!-- 顶部白色栏 -->
		<view class="page-header">
			<view class="page-title">个人中心</view>
		</view>

		<!-- 滚动内容区域 -->
		<scroll-view
			scroll-y
			class="profile-scroll hide-scrollbar"
			:show-scrollbar="false"
			:enhanced="true"
			:bounces="false"
		>
		<!-- 用户信息头部 - 现代简约风格 -->
		<view class="user-profile-header">
			<view class="user-profile-card">
				<view class="user-avatar-container">
					<view class="user-avatar">
						<image :src="userData.avatar" :alt="userData.name" class="avatar-image" mode="aspectFill"></image>
					</view>
					<view class="user-status-indicator"></view>
				</view>

				<view class="user-info">
					<view class="user-name">{{userData.name}}</view>
					<view class="user-shop">档口：{{userData.shopName}}</view>
				</view>

				<view class="edit-profile-btn" @tap="editProfile">
					<uni-icons type="compose" size="20" color="#333333"></uni-icons>
				</view>
			</view>
		</view>

		<!-- 销售数据统计 - 创意简约版 -->
		<view class="px-4 -mt-2 mb-4">
			<view class="sales-dashboard bg-white rounded-2xl shadow-lg overflow-hidden">
				<!-- 标题区域与时间选择器 -->
				<view class="sales-dashboard-header">
					<text class="dashboard-title">销售数据统计</text>
					<view class="report-tabs">
						<view class="report-tab" :class="{active: reportTypeIndex === 0}" @tap="setReportType(0)">日报</view>
						<view class="report-tab" :class="{active: reportTypeIndex === 1}" @tap="setReportType(1)">月报</view>
						<view class="report-tab" :class="{active: reportTypeIndex === 2}" @tap="setReportType(2)">年报</view>
					</view>
				</view>

				<!-- 滚动切换区域 -->
				<swiper class="report-swiper" :current="reportTypeIndex" @change="onSwiperChange">
					<!-- 日报页 -->
					<swiper-item>
						<view class="dashboard-content">
							<!-- 左侧目标完成环形图 -->
							<view class="dashboard-left">
								<view class="circle-progress-wrapper" @click="showTargetSetting">
									<view class="circle-progress-container">
										<view class="circle-bg"></view>
										<view class="circle-progress-mask" :style="{transform: 'rotate(' + (getCurrentData().targetCompletion * 3.6) + 'deg)'}"></view>
										<view class="circle-content">
											<text class="circle-percentage">{{getCurrentData().targetCompletion}}%</text>
											<text class="circle-label">目标完成</text>
										</view>
									</view>
								</view>
							</view>

							<!-- 右侧数据指标区 -->
							<view class="dashboard-right">
								<!-- 总销售额 -->
								<view class="metric-item sales-item">
									<view class="metric-header">
										<text class="metric-label">总销售额</text>
									</view>
									<text class="metric-value sales-value">¥{{getCurrentData().amount}}</text>
								</view>

								<!-- 预计提成收入 -->
								<view class="metric-item commission-item">
									<view class="metric-header">
										<text class="metric-label">预计提成收入</text>
									</view>
									<text class="metric-value commission-value">¥{{getCurrentData().commission}}</text>
								</view>
							</view>
						</view>
					</swiper-item>

					<!-- 月报页 -->
					<swiper-item>
						<view class="dashboard-content">
							<!-- 左侧目标完成环形图 -->
							<view class="dashboard-left">
								<view class="circle-progress-wrapper" @click="showTargetSetting">
									<view class="circle-progress-container">
										<view class="circle-bg"></view>
										<view class="circle-progress-mask" :style="{transform: 'rotate(' + (getCurrentData().targetCompletion * 3.6) + 'deg)'}"></view>
										<view class="circle-content">
											<text class="circle-percentage">{{getCurrentData().targetCompletion}}%</text>
											<text class="circle-label">目标完成</text>
										</view>
									</view>
								</view>
							</view>

							<!-- 右侧数据指标区 -->
							<view class="dashboard-right">
								<!-- 总销售额 -->
								<view class="metric-item sales-item-monthly">
									<view class="metric-header">
										<text class="metric-label">总销售额</text>
									</view>
									<text class="metric-value sales-value-monthly">¥{{getCurrentData().amount}}</text>
								</view>

								<!-- 预计提成收入 -->
								<view class="metric-item commission-item-monthly">
									<view class="metric-header">
										<text class="metric-label">预计提成收入</text>
									</view>
									<text class="metric-value commission-value-monthly">¥{{getCurrentData().commission}}</text>
								</view>
							</view>
						</view>
					</swiper-item>

					<!-- 年报页 -->
					<swiper-item>
						<view class="dashboard-content">
							<!-- 左侧目标完成环形图 -->
							<view class="dashboard-left">
								<view class="circle-progress-wrapper" @click="showTargetSetting">
									<view class="circle-progress-container">
										<view class="circle-bg"></view>
										<view class="circle-progress-mask" :style="{transform: 'rotate(' + (getCurrentData().targetCompletion * 3.6) + 'deg)'}"></view>
										<view class="circle-content">
											<text class="circle-percentage">{{getCurrentData().targetCompletion}}%</text>
											<text class="circle-label">目标完成</text>
										</view>
									</view>
								</view>
							</view>

							<!-- 右侧数据指标区 -->
							<view class="dashboard-right">
								<!-- 总销售额 -->
								<view class="metric-item sales-item-yearly">
									<view class="metric-header">
										<text class="metric-label">总销售额</text>
									</view>
									<text class="metric-value sales-value-yearly">¥{{getCurrentData().amount}}</text>
								</view>

								<!-- 预计提成收入 -->
								<view class="metric-item commission-item-yearly">
									<view class="metric-header">
										<text class="metric-label">预计提成收入</text>
									</view>
									<text class="metric-value commission-value-yearly">¥{{getCurrentData().commission}}</text>
								</view>
							</view>
						</view>
					</swiper-item>
				</swiper>
			</view>
		</view>

		<!-- 功能项 - 整体质感背景设计 -->
		<view class="px-4 mb-4">
			<view class="function-panel">
				<!-- 背景纹理和光效 -->
				<view class="function-panel-texture"></view>
				<view class="function-panel-highlight"></view>

				<!-- 功能按钮区 -->
				<view class="function-menu-elegant">
					<view class="function-item-elegant" @tap="navigateTo('/pages/records/sales-records')">
						<image src="/static/icons/sales-records.png" style="width: 32px; height: 32px;"></image>
						<text class="function-text-elegant">销售记录</text>
					</view>
					<view class="function-item-elegant" @tap="navigateTo('/pages/records/inventory-records')">
						<image src="/static/icons/inventory-records.png" style="width: 32px; height: 32px;"></image>
						<text class="function-text-elegant">库存记录</text>
					</view>
					<view class="function-item-elegant" @tap="navigateTo('/pages/records/system-log')">
						<image src="/static/icons/operation-records.png" style="width: 32px; height: 32px;"></image>
						<text class="function-text-elegant">系统日志</text>
					</view>
					<view class="function-item-elegant" @tap="navigateTo('/pages/records/payment-records')">
						<image src="/static/icons/payment-records.png" style="width: 32px; height: 32px;"></image>
						<text class="function-text-elegant">付款记录</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 数据摘要卡片 - 高科技感设计 -->
		<view class="px-4 mb-24">
			<view class="flex items-center mb-3">
				<view class="w-8 h-8 bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg flex items-center justify-center mr-2 shadow-sm">
					<uni-icons type="chart-pie" size="16" color="#FFFFFF"></uni-icons>
				</view>
				<text class="text-base font-bold">业务数据摘要</text>
			</view>

			<!-- 卡片网格布局 -->
			<view class="business-summary-grid">
				<!-- 在售水果卡片 -->
				<view class="business-summary-card card-amber" @tap="navigateTo('/pages/price/price')">
					<view class="card-glow amber-glow"></view>
					<view class="card-content">
						<view class="card-header">
							<text class="card-title">在售水果</text>
							<view class="card-icon">
								<uni-icons type="shop" size="20" color="#FFFFFF"></uni-icons>
							</view>
						</view>
						<view class="card-body">
							<text class="card-value">{{activeFruitsCount}}</text>
							<text class="card-unit">种</text>
						</view>
					</view>
				</view>

				<!-- 库存预警卡片 -->
				<view class="business-summary-card card-orange" @tap="navigateTo('/pages/inventory/inventory')">
					<view class="card-glow orange-glow"></view>
					<view class="card-content">
						<view class="card-header">
							<text class="card-title">库存预警</text>
							<view class="card-icon">
								<uni-icons type="notification" size="20" color="#FFFFFF"></uni-icons>
							</view>
						</view>
						<view class="card-body">
							<text class="card-value">{{lowStockCount}}</text>
							<text class="card-unit">种</text>
						</view>
					</view>
				</view>

				<!-- 欠款客户卡片 -->
				<view class="business-summary-card card-red" @tap="navigateTo('/pages/customer/customer')">
					<view class="card-glow red-glow"></view>
					<view class="card-content">
						<view class="card-header">
							<text class="card-title">欠款客户</text>
							<view class="card-icon">
								<uni-icons type="wallet" size="20" color="#FFFFFF"></uni-icons>
							</view>
						</view>
						<view class="card-body">
							<text class="card-value">{{unpaidCustomersCount}}</text>
							<text class="card-unit">位</text>
						</view>
					</view>
				</view>

				<!-- 热销水果卡片 -->
				<view class="business-summary-card card-emerald" @tap="viewFullRanking">
					<view class="card-glow emerald-glow"></view>
					<view class="card-content">
						<view class="card-header">
							<text class="card-title">热销水果</text>
							<view class="card-icon">
								<uni-icons type="star" size="20" color="#FFFFFF"></uni-icons>
							</view>
						</view>
						<view class="card-body hot-selling-container">
							<view class="hot-selling-preview">
								<view class="hot-selling-item" v-for="(fruit, index) in topSales.slice(0, 3)" :key="index">
									<view class="hot-selling-rank">{{index + 1}}</view>
									<image :src="fruit.image" class="hot-selling-image" mode="aspectFill"></image>
									<text class="hot-selling-name">{{fruit.name}}</text>
								</view>
							</view>
						</view>
					</view>
				</view>


			</view>
		</view>
	</scroll-view>

		<!-- 功能模态弹窗 -->
		<uni-popup ref="functionPopup" type="center">
			<view class="bg-white rounded-xl w-4/5 max-h-3/4 overflow-y-auto p-5">
				<view class="flex justify-between items-center mb-4">
					<text class="text-xl font-bold">{{currentFunction.title}}</text>
					<text class="text-gray-500" @tap="closePopup">
						<uni-icons type="close" size="20" color="#6B7280"></uni-icons>
					</text>
				</view>
				<view class="function-content">
					<text class="text-gray-600">{{currentFunction.content}}</text>
				</view>
				<view class="mt-4 text-center">
					<button class="w-full bg-teal-600 text-white py-2 rounded-lg" @tap="closePopup">
						关闭
					</button>
				</view>
			</view>
		</uni-popup>

		<!-- 设置弹窗 -->
		<uni-popup ref="settingsPopup" type="bottom">
			<!-- 设置固定高度，确保弹窗不会被底部TabBar遮挡 -->
			<view class="bg-white rounded-t-xl p-3" style="height: 600rpx; position: relative;">
				<!-- 标题栏 -->
				<view class="flex justify-between items-center mb-2">
					<text class="text-lg font-bold">设置</text>
					<text class="text-gray-500" @tap="closeSettings">
						<uni-icons type="closeempty" size="20" color="#6B7280"></uni-icons>
					</text>
				</view>

				<!-- 菜单项 -->
				<view class="settings-menu">
					<view class="p-2 flex items-center justify-between border-b border-gray-100" @tap="editProfile">
						<text>个人信息</text>
						<uni-icons type="right" size="16" color="#9CA3AF"></uni-icons>
					</view>
					<view class="p-2 flex items-center justify-between border-b border-gray-100">
						<text>账号安全</text>
						<uni-icons type="right" size="16" color="#9CA3AF"></uni-icons>
					</view>
					<view class="p-2 flex items-center justify-between border-b border-gray-100">
						<text>通知设置</text>
						<uni-icons type="right" size="16" color="#9CA3AF"></uni-icons>
					</view>
					<view class="p-2 flex items-center justify-between border-b border-gray-100">
						<text>关于我们</text>
						<uni-icons type="right" size="16" color="#9CA3AF"></uni-icons>
					</view>
				</view>

				<!-- 退出登录按钮，固定在底部 -->
				<view class="absolute bottom-3 left-3 right-3">
					<button class="w-full py-3 bg-red-500 text-white rounded-lg font-medium text-lg" style="background-color: #EF4444; width: 100%;" @tap="handleLogout">
						退出登录
					</button>
				</view>
			</view>
		</uni-popup>

		<!-- 时间范围选择器 -->
		<uni-popup ref="timeRangePopup" type="bottom">
			<view class="bg-white rounded-t-xl p-5">
				<view class="flex justify-between items-center mb-4">
					<text class="text-xl font-bold">选择时间范围</text>
					<text class="text-gray-500" @tap="closeTimeRange">
						<uni-icons type="close" size="20" color="#6B7280"></uni-icons>
					</text>
				</view>
				<view class="space-y-3">
					<view
						v-for="(range, index) in timeRanges"
						:key="index"
						class="p-3 flex items-center justify-between border-b border-gray-100"
						@tap="selectTimeRange(range)"
					>
						<text>{{range}}</text>
						<uni-icons v-if="timeRange === range" type="checkmarkempty" size="16" color="#0D9488"></uni-icons>
					</view>
				</view>
			</view>
		</uni-popup>

		<!-- 销售记录弹窗 -->
		<uni-popup ref="salesRecordPopup" type="center">
			<view class="sales-record-popup bg-white rounded-xl w-11/12 max-h-3/4 overflow-hidden">
				<!-- 顶部标题和操作栏 -->
				<view class="flex justify-between items-center p-4 border-b border-gray-100">
					<text class="text-lg font-bold">销售记录</text>
					<view class="flex items-center space-x-2">
						<view class="view-toggle flex items-center bg-gray-100 rounded-full p-1">
							<view class="view-toggle-btn" :class="{'active': viewType === 'list'}" @tap="switchView('list')">
								<uni-icons type="list" size="14" color="#4B5563"></uni-icons>
							</view>
							<view class="view-toggle-btn" :class="{'active': viewType === 'card'}" @tap="switchView('card')">
								<uni-icons type="grid" size="14" color="#4B5563"></uni-icons>
							</view>
						</view>
						<view class="app-search-box app-search-box-content app-search-box-small">
							<text class="iconfont icon-search app-search-icon"></text>
							<input type="text" placeholder="搜索客户/商品" class="app-search-input" v-model="searchKeyword" @input="filterSalesRecords" />
							<text v-if="searchKeyword" class="app-search-clear" @tap="searchKeyword = ''">×</text>
						</view>
						<view class="filter-btn" @tap="showFilterOptions">
							<uni-icons type="funnel" size="16" color="#9CA3AF"></uni-icons>
						</view>
					</view>
				</view>

				<!-- 筛选条件栏 -->
				<scroll-view scroll-x class="filter-tags-scroll" show-scrollbar="false">
					<view class="filter-tags px-4 py-2 border-b border-gray-100 flex">
						<view class="filter-tag" :class="{'active': dateRange === 'today'}" @tap="setDateRange('today')">今日</view>
						<view class="filter-tag" :class="{'active': dateRange === 'yesterday'}" @tap="setDateRange('yesterday')">昨日</view>
						<view class="filter-tag" :class="{'active': dateRange === 'week'}" @tap="setDateRange('week')">本周</view>
						<view class="filter-tag" :class="{'active': dateRange === 'month'}" @tap="setDateRange('month')">本月</view>
						<view class="filter-tag" :class="{'active': statusFilter === 'all'}" @tap="setStatusFilter('all')">全部</view>
						<view class="filter-tag" :class="{'active': statusFilter === 'paid'}" @tap="setStatusFilter('paid')">已付款</view>
						<view class="filter-tag" :class="{'active': statusFilter === 'unpaid'}" @tap="setStatusFilter('unpaid')">未付款</view>
					</view>
				</scroll-view>

				<!-- 数据汇总条 -->
				<view class="data-summary bg-gray-50 px-4 py-2 flex justify-between items-center text-xs text-gray-500">
					<text>总计: {{filteredSalesRecords.length}} 条</text>
					<text>销售额: ¥{{totalAmount}}</text>
					<text>数量: {{totalQuantity}}箱</text>
				</view>

				<!-- 列表视图 -->
				<scroll-view v-if="viewType === 'list'" scroll-y class="table-content" :style="{ height: 'calc(100vh - 480rpx)' }">
					<!-- 表头 -->
					<view class="table-header flex items-center px-4 py-2 bg-white sticky">
						<view class="w-1/4 text-sm text-gray-500 font-medium">日期/单号</view>
						<view class="w-1/4 text-sm text-gray-500 font-medium">客户/业务员</view>
						<view class="w-1/4 text-sm text-gray-500 font-medium">商品/规格</view>
						<view class="w-1/4 text-sm text-gray-500 font-medium text-right">数量/金额</view>
					</view>

					<!-- 表格内容 -->
					<view v-for="(record, index) in currentPageRecords" :key="index"
						class="table-row" :class="index % 2 === 0 ? 'bg-white' : 'bg-gray-50'"
						@tap="showRecordDetail(record)">
						<view class="flex px-4 py-3 border-b border-gray-100">
							<view class="w-1/4">
								<text class="block text-sm">{{record.date}}</text>
								<text class="block text-xs text-gray-400">#{{record.orderNo || 'S' + record.date.replace(/-/g, '')}}</text>
							</view>
							<view class="w-1/4">
								<text class="block text-sm">{{record.customerName}}</text>
								<text class="block text-xs text-gray-400">{{record.salesPerson}}</text>
							</view>
							<view class="w-1/4">
								<text class="block text-sm text-gray-700">{{record.productName}}</text>
								<text class="block text-xs text-gray-400">{{record.spec || '10kg/箱'}}</text>
							</view>
							<view class="w-1/4 text-right">
								<text class="block text-sm">{{record.quantity}}箱</text>
								<view class="flex items-center justify-end">
									<text class="text-sm text-emerald-600 font-medium mr-1">¥{{record.amount}}</text>
									<view class="status-dot" :class="record.status === '已付款' ? 'bg-emerald-500' : 'bg-red-500'"></view>
								</view>
							</view>
						</view>
					</view>

					<!-- 无数据提示 -->
					<view v-if="filteredSalesRecords.length === 0" class="empty-tip">
						<uni-icons type="info" size="24" color="#9CA3AF"></uni-icons>
						<text class="text-gray-400 mt-2">暂无销售记录</text>
					</view>
				</scroll-view>

				<!-- 卡片视图 -->
				<scroll-view v-if="viewType === 'card'" scroll-y class="card-content" :style="{ height: 'calc(100vh - 480rpx)' }">
					<view class="grid-cards px-4 py-2">
						<view v-for="(record, index) in currentPageRecords" :key="index"
							class="record-card" @tap="showRecordDetail(record)">
							<view class="card-header flex justify-between items-center">
								<view class="flex items-center">
									<text class="text-xs text-gray-400">#{{record.orderNo || 'S' + record.date.replace(/-/g, '')}}</text>
								</view>
								<text class="text-xs text-gray-400">{{record.date}}</text>
							</view>

							<view class="card-customer flex justify-between items-center mt-2">
								<text class="text-sm font-medium">{{record.customerName}}</text>
								<view class="status-tag" :class="record.status === '已付款' ? 'paid' : 'unpaid'">
									{{record.status}}
								</view>
							</view>

							<view class="card-divider my-2"></view>

							<view class="card-product">
								<view class="flex justify-between">
									<text class="text-sm">{{record.productName}}</text>
									<text class="text-sm">{{record.quantity}}箱</text>
								</view>
								<view class="flex justify-between items-center mt-1">
									<text class="text-xs text-gray-400">{{record.spec || '10kg/箱'}}</text>
									<text class="text-xs text-gray-400">¥{{record.unitPrice || '250'}}/箱</text>
								</view>
							</view>

							<view class="card-divider my-2"></view>

							<view class="card-footer flex justify-between items-center">
								<text class="text-xs text-gray-400">业务员: {{record.salesPerson}}</text>
								<text class="text-emerald-600 font-medium">¥{{record.amount}}</text>
							</view>
						</view>

						<!-- 无数据提示 -->
						<view v-if="filteredSalesRecords.length === 0" class="empty-tip">
							<uni-icons type="info" size="24" color="#9CA3AF"></uni-icons>
							<text class="text-gray-400 mt-2">暂无销售记录</text>
						</view>
					</view>
				</scroll-view>

				<!-- 分页控制 -->
				<view class="p-4 border-t border-gray-100">
					<view class="flex justify-between items-center">
						<view class="flex items-center space-x-2">
							<button class="page-btn" :disabled="currentPage === 1" @tap="prevPage">上一页</button>
							<text class="text-sm text-gray-500">{{currentPage}}/{{totalPages}}</text>
							<button class="page-btn" :disabled="currentPage === totalPages" @tap="nextPage">下一页</button>
						</view>
						<button class="close-btn" @tap="closeSalesRecord">关闭</button>
					</view>
				</view>
			</view>
		</uni-popup>

		<!-- 销售记录详情弹窗 -->
		<uni-popup ref="recordDetailPopup" type="bottom">
			<view class="record-detail-popup bg-white rounded-t-xl">
				<view class="drag-handle"></view>

				<view class="p-4">
					<view class="flex justify-between items-center mb-4">
						<view class="flex items-center">
							<text class="text-lg font-bold">销售详情</text>
							<text class="text-sm text-gray-400 ml-2">#{{selectedRecord.orderNo || 'S' + (selectedRecord.date || '').replace(/-/g, '')}}</text>
						</view>
						<uni-icons type="close" size="20" color="#9CA3AF" @tap="closeRecordDetail"></uni-icons>
					</view>

					<view class="detail-sections">
						<!-- 基本信息区 -->
						<view class="detail-section">
							<view class="section-title">基本信息</view>
							<view class="section-content">
								<view class="detail-item">
									<text class="label">交易日期</text>
									<text class="value">{{selectedRecord.date}} {{selectedRecord.time}}</text>
								</view>
								<view class="detail-item">
									<text class="label">业务员</text>
									<text class="value">{{selectedRecord.salesPerson}}</text>
								</view>
								<view class="detail-item">
									<text class="label">客户</text>
									<text class="value">{{selectedRecord.customerName}}</text>
								</view>
							</view>
						</view>

						<!-- 商品信息区 -->
						<view class="detail-section">
							<view class="section-title">商品信息</view>
							<view class="section-content">
								<view class="detail-item">
									<text class="label">商品名称</text>
									<text class="value">{{selectedRecord.productName}}</text>
								</view>
								<view class="detail-item">
									<text class="label">规格</text>
									<text class="value">{{selectedRecord.spec || '10kg/箱'}}</text>
								</view>
								<view class="detail-item">
									<text class="label">数量</text>
									<text class="value">{{selectedRecord.quantity}}箱</text>
								</view>
								<view class="detail-item">
									<text class="label">单价</text>
									<text class="value">¥{{selectedRecord.unitPrice || '250'}}/箱</text>
								</view>
								<view class="detail-item">
									<text class="label">总金额</text>
									<text class="value text-emerald-600 font-medium">¥{{selectedRecord.amount}}</text>
								</view>
							</view>
						</view>

						<!-- 付款信息区 -->
						<view class="detail-section">
							<view class="section-title">付款信息</view>
							<view class="section-content">
								<view class="detail-item">
									<text class="label">付款状态</text>
									<view class="status-tag" :class="selectedRecord.status === '已付款' ? 'paid' : 'unpaid'">
										{{selectedRecord.status}}
									</view>
								</view>
								<view class="detail-item" v-if="selectedRecord.status === '已付款'">
									<text class="label">付款方式</text>
									<text class="value">{{selectedRecord.paymentMethod || '微信支付'}}</text>
								</view>
								<view class="detail-item" v-if="selectedRecord.status === '已付款'">
									<text class="label">付款时间</text>
									<text class="value">{{selectedRecord.paymentTime || selectedRecord.date + ' ' + selectedRecord.time}}</text>
								</view>
							</view>
						</view>

						<!-- 备注信息区 -->
						<view class="detail-section" v-if="selectedRecord.remark">
							<view class="section-title">备注</view>
							<view class="section-content">
								<view class="detail-item remark-item">
									<text class="value full-width">{{selectedRecord.remark}}</text>
								</view>
							</view>
						</view>
					</view>
				</view>

				<!-- 底部操作区 -->
				<view class="detail-footer p-4 border-t border-gray-100">
					<view class="flex space-x-2">
						<button class="action-btn secondary flex-1" @tap="closeRecordDetail">关闭</button>
						<button class="action-btn primary flex-1" @tap="printRecord">打印小票</button>
					</view>
				</view>
			</view>
		</uni-popup>

		<!-- 编辑个人信息弹窗 -->
		<uni-popup ref="editProfilePopup" type="center">
			<view class="popup-container">
				<!-- 顶部标题栏 -->
				<view class="popup-header">
					<view class="flex justify-between items-center">
						<text class="text-xl font-bold text-white">编辑个人信息</text>
						<view @tap="closeEditProfile" class="close-btn">
							<uni-icons type="close" size="20" color="#FFFFFF"></uni-icons>
						</view>
					</view>
				</view>

				<!-- 内容区域 -->
				<view class="popup-content">
					<!-- 头像编辑区域 -->
					<view class="avatar-edit-section">
						<view class="flex flex-col items-center">
							<view class="relative">
								<view class="avatar-container">
									<image :src="editForm.avatar" class="w-full h-full object-cover"></image>
								</view>
								<view class="avatar-edit-btn" @tap="chooseAvatar">
									<uni-icons type="camera-filled" size="20" color="#FFFFFF"></uni-icons>
								</view>
							</view>
							<text class="text-sm text-gray-500 mt-3">点击图标修改头像</text>
						</view>
					</view>

					<!-- 表单区域 -->
					<view class="form-section">
						<!-- 姓名 -->
						<view class="form-group">
							<text class="form-label">姓名</text>
							<view class="form-control">
								<uni-icons type="person" size="22" color="#6B7280"></uni-icons>
								<input type="text" v-model="editForm.name" placeholder="请输入姓名" class="form-input" />
							</view>
						</view>

						<!-- 联系方式 -->
						<view class="form-group">
							<text class="form-label">联系方式</text>
							<view class="form-control">
								<uni-icons type="phone" size="22" color="#6B7280"></uni-icons>
								<input type="text" v-model="editForm.phone" placeholder="请输入手机号" class="form-input" />
							</view>
						</view>

						<!-- 档口名称 -->
						<view class="form-group">
							<text class="form-label">档口名称</text>
							<view class="form-control">
								<uni-icons type="shop" size="22" color="#6B7280"></uni-icons>
								<input type="text" v-model="editForm.shopName" placeholder="请输入档口名称" class="form-input" />
							</view>
						</view>

						<!-- 身份(只读) -->
						<view class="form-group">
							<text class="form-label">业务身份</text>
							<view class="form-control form-control-disabled">
								<uni-icons type="staff" size="22" color="#9CA3AF"></uni-icons>
								<text class="form-input text-gray-600">{{editForm.role}}</text>
							</view>
							<text class="form-hint">业务身份无法修改</text>
						</view>

						<!-- 账号(只读) -->
						<view class="form-group">
							<text class="form-label">登录账号</text>
							<view class="form-control form-control-disabled">
								<uni-icons type="locked" size="22" color="#9CA3AF"></uni-icons>
								<text class="form-input text-gray-600">{{editForm.username}}</text>
							</view>
							<text class="form-hint">登录账号无法修改</text>
						</view>
					</view>
				</view>

				<!-- 底部按钮区域 -->
				<view class="popup-footer">
					<button class="popup-btn btn-cancel" @tap="closeEditProfile">取消</button>
					<button class="popup-btn btn-confirm" @tap="saveProfile">保存</button>
				</view>
			</view>
		</uni-popup>

		<!-- 设置目标销售额和提成比例弹窗 -->
		<uni-popup ref="targetSettingPopup" type="dialog">
			<view class="target-setting-popup">
				<view class="target-popup-title">设置{{getReportTypeText()}}目标</view>
				<view class="target-popup-content">
					<view class="target-input-group">
						<text class="target-input-label">目标销售额（元）</text>
						<input type="digit" v-model="targetSalesAmount" class="target-input-field" placeholder="请输入目标销售额" />
					</view>
					<view class="target-input-group">
						<text class="target-input-label">提成比例（%）</text>
						<input type="digit" v-model="commissionRate" class="target-input-field" placeholder="请输入提成比例" />
					</view>
					<view class="target-input-group">
						<text class="target-input-label">当前销售额（元）</text>
						<text class="target-input-value">¥{{getCurrentData().amount}}</text>
					</view>
					<view class="target-input-group">
						<text class="target-input-label">完成率</text>
						<text class="target-input-value target-completion-rate">{{calculateCompletionRate()}}%</text>
					</view>
					<view class="target-input-group">
						<text class="target-input-label">预计提成收入（元）</text>
						<text class="target-input-value target-commission-rate">¥{{calculateCommission()}}</text>
					</view>
				</view>
				<view class="target-popup-footer">
					<button class="target-btn target-btn-cancel" @click="cancelTargetSetting">取消</button>
					<button class="target-btn target-btn-confirm" @click="confirmTargetSetting">确定</button>
				</view>
			</view>
		</uni-popup>

		<!-- 使用系统原生TabBar，无需自定义组件 -->
	</view>
</template>

<script setup>
import { ref, reactive, onMounted, computed, onUnmounted } from 'vue';
import uniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue';
import uniPopup from '@dcloudio/uni-ui/lib/uni-popup/uni-popup.vue';
import { getUserProfile, updateUserProfile, uploadAvatar, logout } from '@/services/authService.js';
import statisticsService from '@/services/statisticsService.js';
import fruitService from '@/services/fruitService.js';
import customerService from '@/services/customerService.js';

// 用户数据
const userData = ref({
	name: '默认用户',
	shopName: '水果档口',
	avatar: '/static/default-avatar.png',
	role: '管理员',
	phone: '',
	username: ''
});

// 编辑表单数据
const editForm = ref({
	name: '',
	shopName: '',
	avatar: '',
	role: '',
	phone: '',
	username: ''
});

// 获取弹窗组件引用
const functionPopup = ref(null);
const settingsPopup = ref(null);
const timeRangePopup = ref(null);
const salesRecordPopup = ref(null);
const targetSettingPopup = ref(null);

// 目标销售额和提成比例设置
const targetSalesAmount = ref('');
const commissionRate = ref('');

// 目标销售额数据
const targetSalesData = reactive({
	daily: uni.getStorageSync('targetSales_daily') || 0,
	monthly: uni.getStorageSync('targetSales_monthly') || 0,
	yearly: uni.getStorageSync('targetSales_yearly') || 0
});

// 提成比例数据
const commissionRateData = reactive({
	daily: uni.getStorageSync('commissionRate_daily') || 0,
	monthly: uni.getStorageSync('commissionRate_monthly') || 0,
	yearly: uni.getStorageSync('commissionRate_yearly') || 0
});
const searchKeyword = ref('');
const salesRecords = ref([
	{
		orderNo: 'S20240501001',
		salesPerson: '李业务',
		customerName: '老王水果店',
		productName: '明牌阿克苏苹果',
		spec: '10kg/箱',
		unitPrice: '250',
		quantity: 5,
		amount: '1,250',
		date: '2024-05-01',
		time: '14:30',
		status: '已付款',
		paymentMethod: '微信支付',
		paymentTime: '2024-05-01 14:35',
		remark: '客户要求下午3点前送达'
	},
	{
		orderNo: 'S20240501002',
		salesPerson: '王业务',
		customerName: '小张水果摊',
		productName: '砀山梨',
		spec: '15kg/箱',
		unitPrice: '120',
		quantity: 3,
		amount: '360',
		date: '2024-05-01',
		time: '10:15',
		status: '已付款',
		paymentMethod: '现金',
		paymentTime: '2024-05-01 10:20'
	},
	{
		orderNo: 'S20240430001',
		salesPerson: '张业务',
		customerName: '老李水果批发',
		productName: '新鲜橘子',
		spec: '12kg/箱',
		unitPrice: '80',
		quantity: 8,
		amount: '640',
		date: '2024-04-30',
		time: '16:45',
		status: '未付款',
		remark: '约定下周一付款'
	},
	{
		orderNo: 'S20240430002',
		salesPerson: '李业务',
		customerName: '城北水果超市',
		productName: '红富士苹果',
		spec: '10kg/箱',
		unitPrice: '200',
		quantity: 10,
		amount: '2,000',
		date: '2024-04-30',
		time: '09:20',
		status: '已付款',
		paymentMethod: '银行转账',
		paymentTime: '2024-04-30 11:30'
	},
	{
		orderNo: 'S20240429001',
		salesPerson: '王业务',
		customerName: '水果大王',
		productName: '进口香蕉',
		spec: '15kg/箱',
		unitPrice: '100',
		quantity: 15,
		amount: '1,500',
		date: '2024-04-29',
		time: '13:10',
		status: '已付款',
		paymentMethod: '微信支付',
		paymentTime: '2024-04-29 13:15'
	}
]);

const filteredSalesRecords = ref([...salesRecords.value]);

// 业务员列表
const staffList = ref([
	{ id: 0, name: '全部业务员' },
	{ id: 1, name: '李业务' },
	{ id: 2, name: '王业务' },
	{ id: 3, name: '张业务' }
]);
const staffIndex = ref(0);

// 报表类型
const reportTypes = ['日报', '月报', '年报'];
const reportTypeIndex = ref(0);

// 销售数据面板
const dashboardData = reactive({
	// 销售报表数据
	daily: {
		amount: '8,356',
		amountTrend: 12.5,
		targetCompletion: 85,
		commission: '334.24',  // 预计提成收入（4%）
		commissionTrend: 15.8,
		topProduct: '阿克苏苹果',
		topProductQuantity: 52
	},
	monthly: {
		amount: '246,850',
		amountTrend: 15.2,
		targetCompletion: 92,
		commission: '9,874.00',  // 预计提成收入（4%）
		commissionTrend: 18.3,
		topProduct: '阿克苏苹果',
		topProductQuantity: 320
	},
	yearly: {
		amount: '2,985,600',
		amountTrend: 22.8,
		targetCompletion: 75,
		commission: '119,424.00',  // 预计提成收入（4%）
		commissionTrend: 25.6,
		topProduct: '阿克苏苹果',
		topProductQuantity: 3850
	},
	// 业务数据摘要
	activeFruits: 15,         // 在售水果数量
	lowStockCount: 2,         // 库存预警数量
	unpaidCustomers: 5,       // 欠款客户数量
});


	// 水果和客户数据
const fruitData = ref([]);
const customerData = ref([]);

// 计算属性：在售水果数量（库存大于0的水果种类数量）
const activeFruitsCount = computed(() => {
	console.log('计算在售水果数量，水果数据:', fruitData.value);
	return fruitData.value.filter(fruit => {
		// 处理不同的数据结构
		const stock = fruit.stock !== undefined ? fruit.stock :
			(fruit.inventory !== undefined ? fruit.inventory : 0);
		return stock > 0;
	}).length;
});

// 计算属性：库存预警数量（库存大于0但小于50的水果种类数量）
const lowStockCount = computed(() => {
	console.log('计算库存预警数量，水果数据:', fruitData.value);
	return fruitData.value.filter(fruit => {
		// 处理不同的数据结构
		const stock = fruit.stock !== undefined ? fruit.stock :
			(fruit.inventory !== undefined ? fruit.inventory : 0);
		return stock > 0 && stock < 50;
	}).length;
});

// 计算属性：欠款客户数量（付款状态为未付款或部分付款的客户数量）
const unpaidCustomersCount = computed(() => {
	console.log('计算欠款客户数量，客户数据:', customerData.value);
	return customerData.value.filter(customer => {
		// 处理不同的数据结构
		const unpaidAmount = customer.unpaidAmount !== undefined ? customer.unpaidAmount :
			(customer.unpaid_amount !== undefined ? customer.unpaid_amount : 0);
		return unpaidAmount > 0;
	}).length;
});



// 热销水果排行
const topSales = ref([
	{ name: '阿克苏苹果', quantity: 52, amount: '2,860', image: '/static/fruit/apple.png' },
	{ name: '砀山梨', quantity: 38, amount: '1,216', image: '/static/fruit/pear.png' },
	{ name: '新鲜橘子', quantity: 25, amount: '750', image: '/static/fruit/grape.png' }
]);

// 当前功能
const currentFunction = ref({
	title: '',
	content: ''
});

// 时间范围
const timeRange = ref('本周');
const timeRanges = ref(['今日', '本周', '本月', '本季度', '本年']);

// 获取弹窗组件引用
const editProfilePopup = ref(null);

// 获取登录用户信息
onMounted(() => {
	// 首先检查登录状态
	checkLoginStatus();

	// 初始化时刷新面板数据，获取最新的销售总额数据
	// 加载水果和客户数据
	loadFruitData();
	loadCustomerData();
	refreshDashboardData();

	// 监听页面显示事件
	uni.$on('onShow', checkLoginStatus);

	// 监听用户信息更新事件
	uni.$on('userInfoUpdated', (updatedInfo) => {
		if (updatedInfo) {
			// 如果提供了更新的用户信息，直接使用
			console.log('收到用户信息更新事件，带有数据:', updatedInfo);
			userData.value = {
				name: updatedInfo.name,
				shopName: updatedInfo.stallName,
				avatar: updatedInfo.avatar || '/static/default-avatar.png',
				role: updatedInfo.role,
				phone: updatedInfo.phone || '',
				username: updatedInfo.username || '',
				lastLogin: updatedInfo.lastLogin || ''
			};

			// 更新本地存储
			uni.setStorageSync('loginUser', {
				id: updatedInfo.id,
				name: updatedInfo.name,
				storeName: updatedInfo.stallName,
				avatar: updatedInfo.avatar || '/static/default-avatar.png',
				role: updatedInfo.role,
				phone: updatedInfo.phone || '',
				username: updatedInfo.username || '',
				last_login: updatedInfo.lastLogin || ''
			});
		} else {
			// 如果没有提供更新的用户信息，重新加载
			console.log('收到用户信息更新事件，无数据，重新加载');
			loadUserInfo();
		}
	});
});

// 在组件卸载时移除监听器
onUnmounted(() => {
	uni.$off('onShow', checkLoginStatus);
	uni.$off('userInfoUpdated');
});

// 加载用户信息
function loadUserInfo() {
	// 首先检查是否有token
	const token = uni.getStorageSync('token');
	if (!token) {
		// 如果没有token，跳转到登录页
		uni.redirectTo({
			url: '/pages/index/index'
		});
		return;
	}

	// 显示加载中
	uni.showLoading({ title: '加载中...' });

	// 从API获取登录用户信息
	getUserProfile().then(res => {
		console.log('获取到的用户信息原始数据:', res);

		// 根据API文档中的字段名称映射数据
		userData.value = {
			name: res.name,
			shopName: res.stall_name, // API中是stall_name
			avatar: res.avatar || '/static/default-avatar.png',
			role: res.role,
			phone: res.phone || '',
			username: res.username || '',
			lastLogin: res.last_login || ''
		};

		// 同时更新编辑表单数据
		editForm.value = {
			name: userData.value.name,
			shopName: userData.value.shopName,
			avatar: userData.value.avatar,
			role: userData.value.role,
			phone: userData.value.phone,
			username: userData.value.username
		};

		// 将用户信息存储到 loginUser 中，供其他页面使用
		uni.setStorageSync('loginUser', {
			id: res.id,
			name: res.name,
			storeName: res.stall_name,
			avatar: res.avatar || '/static/default-avatar.png',
			role: res.role,
			phone: res.phone || '',
			username: res.username || '',
			last_login: res.last_login || ''
		});

		console.log('已从API加载用户信息并存储到 loginUser:', userData.value);

		// 隐藏加载中
		uni.hideLoading();
	}).catch(err => {
		console.error('获取用户信息失败:', err);

		// 隐藏加载中
		uni.hideLoading();

		// 如果获取用户信息失败，可能是token过期或无效
		uni.showToast({
			title: '登录已过期，请重新登录',
			icon: 'none'
		});

		// 清除本地token
		uni.removeStorageSync('token');
		uni.removeStorageSync('loginUser');

		// 跳转到登录页
		setTimeout(() => {
			uni.redirectTo({
				url: '/pages/index/index'
			});
		}, 1500); // 延迟1.5秒，让用户看到提示
	});
}

// 检查登录状态函数
function checkLoginStatus() {
	// 直接调用loadUserInfo函数，它会先检查token
	loadUserInfo();
}

// 业务员切换
function onStaffChange(e) {
	staffIndex.value = e.detail.value;
	refreshDashboardData();
}

// 报表类型切换
function onReportTypeChange(e) {
	reportTypeIndex.value = e.detail.value;
	refreshDashboardData();
}

// 设置报表类型
function setReportType(index) {
	reportTypeIndex.value = index;
	refreshDashboardData();
}

// 轮播切换
function onSwiperChange(e) {
	reportTypeIndex.value = e.detail.current;
	refreshDashboardData();
}

// 刷新面板数据
function refreshDashboardData() {
	// 获取当前报表类型
	const reportType = getReportTypeKey();

	// 计算目标完成率
	const completionRate = calculateCompletionRate();

	// 计算预计提成收入
	const commission = calculateCommission();

	// 更新面板数据
	dashboardData[reportType].targetCompletion = completionRate;
	dashboardData[reportType].commission = commission;

	// 调用API获取销售总额摘要数据
	statisticsService.getSalesSummary()
		.then(res => {
			console.log('获取销售总额摘要成功:', res);

			// 更新销售数据
			if (res) {
				// 更新日报数据
				if (res.today) {
					dashboardData.daily.amount = formatNumber(res.today.sales);
				}

				// 更新月报数据
				if (res.this_month) {
					dashboardData.monthly.amount = formatNumber(res.this_month.sales);
				}

				// 更新年报数据
				if (res.this_year) {
					dashboardData.yearly.amount = formatNumber(res.this_year.sales);
				}

				// 重新计算目标完成率和提成收入
				const reportType = getReportTypeKey();
				dashboardData[reportType].targetCompletion = calculateCompletionRate();
				dashboardData[reportType].commission = calculateCommission();
			}
		})
		.catch(err => {
			console.error('获取销售总额摘要失败:', err);
		});
}

// 获取当前选择的报表类型的数据
function getCurrentData() {
	const index = reportTypeIndex.value;
	if (index === 0) {
		return dashboardData.daily;
	} else if (index === 1) {
		return dashboardData.monthly;
	} else {
		return dashboardData.yearly;
	}
}

// 获取当前报表类型文本
function getReportTypeText() {
	const index = reportTypeIndex.value;
	return reportTypes[index];
}

// 显示目标设置弹窗
function showTargetSetting() {
	// 获取当前报表类型
	const reportType = getReportTypeKey();

	// 设置当前值
	targetSalesAmount.value = targetSalesData[reportType].toString();
	commissionRate.value = commissionRateData[reportType].toString();

	// 打开弹窗
	targetSettingPopup.value.open();
}

// 获取当前报表类型的key
function getReportTypeKey() {
	const index = reportTypeIndex.value;
	if (index === 0) {
		return 'daily';
	} else if (index === 1) {
		return 'monthly';
	} else {
		return 'yearly';
	}
}

// 计算完成率
function calculateCompletionRate() {
	const reportType = getReportTypeKey();
	const target = parseFloat(targetSalesData[reportType]) || 0;
	// 处理可能包含千位分隔符的金额字符串
	const amountStr = getCurrentData().amount || '0';
	const current = parseFloat(amountStr.toString().replace(/,/g, '')) || 0;

	if (target <= 0) return 0;

	const rate = Math.min(Math.round((current / target) * 100), 100);
	return rate;
}

// 计算预计提成收入
function calculateCommission() {
	const reportType = getReportTypeKey();
	const rate = parseFloat(commissionRateData[reportType]) || 0;
	// 处理可能包含千位分隔符的金额字符串
	const amountStr = getCurrentData().amount || '0';
	const current = parseFloat(amountStr.toString().replace(/,/g, '')) || 0;

	const commission = (current * rate / 100).toFixed(2);
	return commission;
}

// 取消目标设置
function cancelTargetSetting() {
	targetSettingPopup.value.close();
}

// 确认目标设置
function confirmTargetSetting() {
	const reportType = getReportTypeKey();

	// 将输入值转为数字
	const targetAmount = parseFloat(targetSalesAmount.value) || 0;
	const commRate = parseFloat(commissionRate.value) || 0;

	// 更新数据
	targetSalesData[reportType] = targetAmount;
	commissionRateData[reportType] = commRate;

	// 存储到本地
	uni.setStorageSync(`targetSales_${reportType}`, targetAmount);
	uni.setStorageSync(`commissionRate_${reportType}`, commRate);

	// 关闭弹窗
	targetSettingPopup.value.close();

	// 显示成功提示
	uni.showToast({
		title: '设置成功',
		icon: 'success'
	});

	// 刷新数据
	refreshDashboardData();
}

// 编辑个人信息
function editProfile() {
	// 跳转到个人信息编辑页面
	uni.navigateTo({
		url: '/pages/profile/userInfo',
		animationType: 'slide-in-right'
	});
}

// 关闭编辑个人信息弹窗
function closeEditProfile() {
	editProfilePopup.value.close();
}

// 选择头像
function chooseAvatar() {
	uni.chooseImage({
		count: 1,
		sizeType: ['compressed'],
		sourceType: ['album', 'camera'],
		success: (res) => {
			// 设置临时头像路径，实际上传在保存时进行
			editForm.value.avatar = res.tempFilePaths[0];
		},
		fail: (err) => {
			console.error('选择头像失败', err);
			uni.showToast({
				title: '选择头像失败',
				icon: 'none'
			});
		}
	});
}

// 保存个人信息
function saveProfile() {
	// 表单验证
	if (!editForm.value.name.trim()) {
		uni.showToast({
			title: '姓名不能为空',
			icon: 'none'
		});
		return;
	}

	if (editForm.value.phone && !/^1\d{10}$/.test(editForm.value.phone)) {
		uni.showToast({
			title: '手机号格式不正确',
			icon: 'none'
		});
		return;
	}

	// 准备要提交的数据
	const profileData = {
		name: editForm.value.name,
		storeName: editForm.value.shopName,
		phone: editForm.value.phone
	};

	// 如果头像发生了变化，先上传头像
	const originalAvatar = userData.value.avatar;
	const newAvatar = editForm.value.avatar;

	if (newAvatar !== originalAvatar && newAvatar.startsWith('file://')) {
		// 显示上传中提示
		uni.showLoading({ title: '正在上传头像...' });

		// 上传头像
		uploadAvatar(newAvatar).then(res => {
			// 头像上传成功，将返回的URL添加到要提交的数据中
			profileData.avatar = res.avatarUrl;

			// 提交个人信息
			submitProfileData(profileData);
		}).catch(err => {
			console.error('头像上传失败', err);
			uni.hideLoading();
			uni.showToast({
				title: '头像上传失败，请重试',
				icon: 'none'
			});
		});
	} else {
		// 如果头像没有变化，直接提交个人信息
		submitProfileData(profileData);
	}
}

// 提交个人信息到API
function submitProfileData(profileData) {
	uni.showLoading({ title: '正在保存...' });

	updateUserProfile(profileData).then(() => {
		uni.hideLoading();

		// 更新本地显示的用户数据
		userData.value.name = profileData.name;
		userData.value.shopName = profileData.storeName;
		userData.value.phone = profileData.phone;
		if (profileData.avatar) {
			userData.value.avatar = profileData.avatar;
		}

		// 关闭弹窗
		closeEditProfile();

		// 显示成功提示
		uni.showToast({
			title: '保存成功',
			icon: 'success'
		});

		// 触发用户信息更新事件
		uni.$emit('userInfoUpdated');
	}).catch(err => {
		uni.hideLoading();
		console.error('保存用户信息失败', err);
		uni.showToast({
			title: err.message || '保存失败，请重试',
			icon: 'none'
		});
	});
}

// 查看完整排行
function viewFullRanking() {
	// 构建热销水果排行榜内容
	let rankingContent = '<div style="padding: 10px 0;">';

	// 添加排行榜标题
	rankingContent += '<div style="margin-bottom: 20px; text-align: center; font-weight: bold; color: #10B981;">本月热销水果排行榜</div>';

	// 添加排行榜列表
	topSales.value.forEach((fruit, index) => {
		rankingContent += `
			<div style="display: flex; align-items: center; margin-bottom: 15px; padding: 10px; background-color: ${index < 3 ? '#F0FDF4' : '#F9FAFB'}; border-radius: 8px;">
				<div style="width: 30px; height: 30px; background-color: ${getTopRankColor(index)}; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-weight: bold;">${index + 1}</div>
				<div style="width: 40px; height: 40px; border-radius: 8px; overflow: hidden; margin-right: 15px;">
					<img src="${fruit.image}" style="width: 100%; height: 100%; object-fit: cover;" />
				</div>
				<div style="flex: 1;">
					<div style="font-weight: bold; color: #1F2937;">${fruit.name}</div>
					<div style="font-size: 12px; color: #6B7280;">销量: ${fruit.quantity}箱</div>
				</div>
				<div style="font-weight: bold; color: #10B981;">¥${fruit.amount}</div>
			</div>
		`;
	});

	rankingContent += '</div>';

	// 设置弹窗内容
	currentFunction.value = {
		title: '热销水果排行榜',
		content: rankingContent
	};

	// 打开弹窗
	functionPopup.value.open();
}

// 获取排名颜色
function getTopRankColor(index) {
	const colors = [
		'#F59E0B', // 金色 - 第一名
		'#6B7280', // 银色 - 第二名
		'#B45309', // 铜色 - 第三名
		'#9CA3AF'  // 灰色 - 其他名次
	];

	return index < 3 ? colors[index] : colors[3];
}

// 显示设置
function showSettings() {
	settingsPopup.value.open();
}

// 关闭设置
function closeSettings() {
	settingsPopup.value.close();
}

// 处理退出登录
function handleLogout() {
	uni.showModal({
		title: '确认退出',
		content: '您确定要退出登录吗？',
		success: (res) => {
			if (res.confirm) {
				// 显示加载中
				uni.showLoading({ title: '正在退出...' });

				// 调用退出登录API
				logout().then(() => {
					// 清除本地存储
					uni.removeStorageSync('token');
					uni.removeStorageSync('loginUser');
					console.log('已清除本地登录信息');

					// 隐藏加载中
					uni.hideLoading();

					// 显示成功提示
					uni.showToast({
						title: '退出成功',
						icon: 'success',
						duration: 1500
					});

					// 延迟跳转，让用户看到成功提示
					setTimeout(() => {
						// 跳转到登录页
						uni.reLaunch({
							url: '/pages/index/index'
						});
					}, 1500);
				}).catch(err => {
					console.error('退出登录失败', err);
					uni.hideLoading();
					uni.showToast({
						title: '退出失败，请重试',
						icon: 'none'
					});
				});
			}
		}
	});

	// 关闭设置弹窗
	closeSettings();
}

// 显示时间范围选择器
function toggleTimeRangeSelector() {
	timeRangePopup.value.open();
}

// 关闭时间范围选择器
function closeTimeRange() {
	timeRangePopup.value.close();
}

// 选择时间范围
function selectTimeRange(range) {
	timeRange.value = range;
	closeTimeRange();
}

// 格式化数字，添加千位分隔符
function formatNumber(num) {
	if (num === undefined || num === null) return '0';
	return parseFloat(num).toLocaleString('en-US', {
		maximumFractionDigits: 2,
		minimumFractionDigits: 0
	});
}

// 在 script setup 部分添加视图和筛选相关数据
const viewType = ref('list'); // 'list' 或 'card'
const dateRange = ref('week'); // 'today', 'yesterday', 'week', 'month'
const statusFilter = ref('all'); // 'all', 'paid', 'unpaid'

// 计算属性：总金额
const totalAmount = computed(() => {
	return filteredSalesRecords.value.reduce((sum, record) => {
		return sum + parseFloat(record.amount.replace(/,/g, ''));
	}, 0).toLocaleString();
});

// 计算属性：总数量
const totalQuantity = computed(() => {
	return filteredSalesRecords.value.reduce((sum, record) => {
		return sum + record.quantity;
	}, 0);
});

// 切换视图类型
function switchView(type) {
	viewType.value = type;
}

// 设置日期范围
function setDateRange(range) {
	dateRange.value = range;
	filterSalesRecords();
}

// 设置状态筛选
function setStatusFilter(status) {
	statusFilter.value = status;
	filterSalesRecords();
}

// 显示筛选选项
function showFilterOptions() {
	uni.showToast({
		title: '高级筛选功能开发中',
		icon: 'none'
	});
}

// 修改过滤方法，添加日期和状态筛选
function filterSalesRecords() {
	let filtered = [...salesRecords.value];

	// 关键词筛选
	if (searchKeyword.value) {
		const keyword = searchKeyword.value.toLowerCase();
		filtered = filtered.filter(record =>
			record.customerName.toLowerCase().includes(keyword) ||
			record.productName.toLowerCase().includes(keyword) ||
			record.salesPerson.toLowerCase().includes(keyword)
		);
	}

	// 日期范围筛选
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
		const weekStart = new Date(today);
		weekStart.setDate(weekStart.getDate() - weekStart.getDay());
		filtered = filtered.filter(record => {
			const recordDate = new Date(record.date);
			return recordDate >= weekStart;
		});
	} else if (dateRange.value === 'month') {
		const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
		filtered = filtered.filter(record => {
			const recordDate = new Date(record.date);
			return recordDate >= monthStart;
		});
	}

	// 状态筛选
	if (statusFilter.value === 'paid') {
		filtered = filtered.filter(record => record.status === '已付款');
	} else if (statusFilter.value === 'unpaid') {
		filtered = filtered.filter(record => record.status === '未付款');
	}

	filteredSalesRecords.value = filtered;
	currentPage.value = 1; // 重置到第一页
}

// 打印小票
function printRecord() {
	uni.showToast({
		title: '打印功能开发中',
		icon: 'none'
	});
}

// 在 script setup 部分添加分页相关数据和方法
const currentPage = ref(1);
const pageSize = 20;
const totalPages = computed(() => Math.ceil(filteredSalesRecords.value.length / pageSize));
const currentPageRecords = computed(() => {
	const start = (currentPage.value - 1) * pageSize;
	const end = start + pageSize;
	return filteredSalesRecords.value.slice(start, end);
});

// 添加分页方法
function prevPage() {
	if (currentPage.value > 1) {
		currentPage.value--;
	}
}

function nextPage() {
	if (currentPage.value < totalPages.value) {
		currentPage.value++;
	}
}

// 在 script setup 部分添加详情相关数据和方法
const recordDetailPopup = ref(null);
const selectedRecord = ref({});

// 显示记录详情
function showRecordDetail(record) {
	selectedRecord.value = record;
	recordDetailPopup.value.open();
}

// 关闭记录详情
function closeRecordDetail() {
	recordDetailPopup.value.close();
}

// 关闭销售记录弹窗
function closeSalesRecord() {
	salesRecordPopup.value.close();
}

// 添加页面导航方法
function navigateTo(url) {
	// 检查是否是 tabBar 页面
	const tabBarPages = [
		'/pages/price/price',
		'/pages/inventory/inventory',
		'/pages/customer/customer',
		'/pages/sales/sales',
		'/pages/profile/profile'
	];

	if (tabBarPages.includes(url)) {
		// 如果是 tabBar 页面，使用 switchTab
		uni.switchTab({
			url: url,
			success: () => {
				// 延迟触发tabChange事件，确保页面已经完成切换
				setTimeout(() => {
					// 触发tabChange事件，更新底部tab栏状态
					uni.$emit('tabChange');
					console.log('从个人中心跳转后触发tabChange事件');
				}, 100);
			}
		});
	} else {
		// 如果不是 tabBar 页面，使用 navigateTo
		uni.navigateTo({
			url: url
		});
	}
}

// 关闭功能弹窗
function closePopup() {
	functionPopup.value.close();
}

// 加载水果数据
function loadFruitData() {
	console.log('开始加载水果数据');

	// 使用缓存机制加载水果数据
	fruitService.getFruits({}, false)
		.then(res => {
			console.log('获取水果数据成功', res);

			// 处理返回的数据
			let fruitsArray = [];

			// 如果是数组，直接使用
			if (Array.isArray(res)) {
				fruitsArray = res;
			}
			// 如果是对象，并且有items属性
			else if (res && typeof res === 'object' && res.items) {
				fruitsArray = res.items;
			}
			// 如果是对象，并且有data属性
			else if (res && typeof res === 'object' && res.data) {
				// 如果data是数组，直接使用
				if (Array.isArray(res.data)) {
					fruitsArray = res.data;
				}
				// 如果data是对象，并且有items属性
				else if (typeof res.data === 'object' && res.data.items) {
					fruitsArray = res.data.items;
				}
			}

			// 确保每个水果对象都有正确的库存字段
			fruitsArray = fruitsArray.map(fruit => {
				// 如果没有stock字段，但有inventory字段，则使用inventory作为stock
				if (fruit.stock === undefined && fruit.inventory !== undefined) {
					fruit.stock = fruit.inventory;
				}
				// 确保stock是数字类型
				if (fruit.stock !== undefined) {
					fruit.stock = parseFloat(fruit.stock);
				} else {
					fruit.stock = 0;
				}
				return fruit;
			});

			// 更新水果数据
			fruitData.value = fruitsArray;
			console.log('水果数据加载成功，共', fruitData.value.length, '条');
			console.log('水果数据示例:', fruitData.value.length > 0 ? JSON.stringify(fruitData.value[0], null, 2) : '无数据');
		})
		.catch(err => {
			console.error('加载水果数据失败:', err);
		});
}

// 加载客户数据
function loadCustomerData() {
	console.log('开始加载客户数据');

	customerService.getCustomers()
		.then(res => {
			console.log('获取客户数据成功', res);

			// 处理返回的数据
			let customersArray = [];

			// 如果是数组，直接使用
			if (Array.isArray(res)) {
				customersArray = res;
			}
			// 如果是对象，并且有items属性
			else if (res && typeof res === 'object' && res.items) {
				customersArray = res.items;
			}
			// 如果是对象，并且有data属性
			else if (res && typeof res === 'object' && res.data) {
				// 如果data是数组，直接使用
				if (Array.isArray(res.data)) {
					customersArray = res.data;
				}
				// 如果data是对象，并且有items属性
				else if (typeof res.data === 'object' && res.data.items) {
					customersArray = res.data.items;
				}
			}

			// 处理客户数据，确保欠款字段正确映射
			customerData.value = customersArray.map(customer => {
				// 确保欠款金额是数字类型
				let unpaidAmount = 0;
				if (customer.unpaid_amount !== undefined) {
					unpaidAmount = parseFloat(customer.unpaid_amount);
				} else if (customer.unpaidAmount !== undefined) {
					unpaidAmount = parseFloat(customer.unpaidAmount);
				} else if (customer.totalSales !== undefined && customer.paidAmount !== undefined) {
					// 如果有总销售额和已付款金额，计算欠款金额
					const totalSales = parseFloat(customer.totalSales);
					const paidAmount = parseFloat(customer.paidAmount);
					unpaidAmount = totalSales - paidAmount;
				} else if (customer.total_sales !== undefined && customer.paid_amount !== undefined) {
					// 如果有总销售额和已付款金额（下划线命名），计算欠款金额
					const totalSales = parseFloat(customer.total_sales);
					const paidAmount = parseFloat(customer.paid_amount);
					unpaidAmount = totalSales - paidAmount;
				}

				// 返回处理后的客户对象
				return {
					...customer,
					// 将下划线命名转换为驼峰命名
					unpaidAmount: unpaidAmount
				};
			});

			console.log('客户数据加载成功，共', customerData.value.length, '条');
			console.log('客户数据示例:', customerData.value.length > 0 ? JSON.stringify(customerData.value[0], null, 2) : '无数据');
		})
		.catch(err => {
			console.error('加载客户数据失败:', err);
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

.profile-container {
	height: 100vh;
	background-color: #F5F5F5;
	display: flex;
	flex-direction: column;
	overflow: hidden; /* 禁止整个页面滚动 */
}

/* 顶部白色栏样式 */
.profile-header {
	background-color: #FFFFFF;
	padding: 20rpx 30rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	z-index: 10;
}

.profile-title {
	font-size: 36rpx;
	font-weight: 600;
	color: #333333;
	letter-spacing: 1rpx;
}

.profile-scroll {
	flex: 1;
	height: 100%;
}

.hide-scrollbar::-webkit-scrollbar {
	display: none;
	width: 0 !important;
	height: 0 !important;
	-webkit-appearance: none;
	background: transparent;
}

/* 用户信息头部 - 现代简约风格 */
.user-profile-header {
	padding: 20rpx 30rpx 40rpx;
	background: linear-gradient(to bottom, rgba(255,255,255,0.8), rgba(250,250,252,0.85));
	position: relative;
}

.user-profile-card {
	display: flex;
	align-items: center;
	padding: 30rpx;
	border-radius: 24rpx;
	background: rgba(255, 255, 255, 0.7);
	backdrop-filter: blur(15px);
	-webkit-backdrop-filter: blur(15px);
	box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.06);
	border: 1px solid rgba(255, 255, 255, 0.8);
	position: relative;
	overflow: hidden;
}

.user-profile-card::before {
	content: '';
	position: absolute;
	top: -50%;
	left: -50%;
	width: 200%;
	height: 200%;
	background: radial-gradient(circle at top right, rgba(255, 255, 255, 0.2), transparent 70%);
	z-index: 0;
}

.user-avatar-container {
	position: relative;
	margin-right: 30rpx;
	z-index: 1;
}

.user-avatar {
	width: 120rpx;
	height: 120rpx;
	border-radius: 50%;
	overflow: hidden;
	border: 3rpx solid rgba(255, 255, 255, 0.9);
	box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.08);
}

.avatar-image {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.user-status-indicator {
	position: absolute;
	bottom: 0;
	right: 0;
	width: 24rpx;
	height: 24rpx;
	border-radius: 50%;
	background-color: #10B981;
	border: 3rpx solid #FFFFFF;
	box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.user-info {
	flex: 1;
	z-index: 1;
}

.user-name {
	font-size: 36rpx;
	font-weight: 600;
	color: #333333;
	margin-bottom: 8rpx;
	letter-spacing: 0.5rpx;
}

.user-shop {
	font-size: 26rpx;
	color: #666666;
	opacity: 0.9;
}

.edit-profile-btn {
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.5);
	backdrop-filter: blur(5px);
	-webkit-backdrop-filter: blur(5px);
	border: 1px solid rgba(255, 255, 255, 0.7);
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);
	z-index: 1;
	transition: all 0.3s ease;
}

.edit-profile-btn:active {
	transform: scale(0.95);
	background: rgba(255, 255, 255, 0.7);
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

.bg-teal-100 {
	background-color: #E6FFFA;
}

.bg-blue-100 {
	background-color: #DBEAFE;
}

.text-blue-600 {
	color: #2563EB;
}

.bg-yellow-100 {
	background-color: #FEF9C3;
}

.text-yellow-600 {
	color: #D97706;
}

.bg-purple-100 {
	background-color: #F3E8FF;
}

.text-purple-600 {
	color: #9333EA;
}

.bg-yellow-400 {
	background-color: #FBBF24;
}

.bg-orange-400 {
	background-color: #FB923C;
}

.text-green-500 {
	color: #10B981;
}

.text-red-500 {
	color: #EF4444;
}

.grid-stats {
	display: flex;
	justify-content: space-between;
	gap: 0.75rem;
}

.grid-stats > view {
	flex: 1;
}

.grid-menu {
	display: flex;
	flex-wrap: wrap;
}

.grid-menu > view {
	width: 25%;
	box-sizing: border-box;
}

.space-y-3 > view:not(:first-child) {
	margin-top: 0.75rem;
}

.info-item {
	margin-bottom: 16rpx;
}

.info-label {
	font-size: 26rpx;
	color: #6B7280;
	margin-bottom: 4rpx;
	display: block;
}

.info-value {
	font-size: 30rpx;
	color: #1F2937;
	font-weight: 500;
}

.data-swiper {
	height: 160px;
}

/* 新增统计卡片样式 */
.stats-container {
	padding: 8rpx;
}

.stat-card {
	padding: 20rpx;
	border-radius: 12rpx;
	margin-bottom: 12rpx;
	position: relative;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.stat-card-primary {
	background: linear-gradient(to right, #0D9488, #14B8A6);
	color: white;
}

.stat-card-primary.blue {
	background: linear-gradient(to right, #2563EB, #3B82F6);
}

.stat-card-primary.purple {
	background: linear-gradient(to right, #7C3AED, #8B5CF6);
}

.stat-card-secondary {
	background-color: #F8FDFC;
	color: #0F766E;
}

.stat-card-secondary.blue {
	background-color: #F5F8FF;
	color: #1E40AF;
}

.stat-card-secondary.purple {
	background-color: #F9F7FF;
	color: #6D28D9;
}

.stat-title {
	font-size: 24rpx;
	opacity: 0.9;
	margin-bottom: 8rpx;
}

.stat-value {
	font-size: 40rpx;
	font-weight: bold;
}

.stat-trend {
	position: absolute;
	right: 20rpx;
	top: 20rpx;
	border-radius: 40rpx;
	padding: 4rpx 12rpx;
	display: flex;
	align-items: center;
	font-size: 22rpx;
	box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.trend-up {
	background-color: rgba(16, 185, 129, 0.8);
	color: white;
}

.trend-down {
	background-color: rgba(239, 68, 68, 0.8);
	color: white;
}

.trend-text {
	margin-left: 4rpx;
}

.bg-indigo-100 {
	background-color: #E0E7FF;
}

.text-indigo-600 {
	color: #4F46E5;
}

.bg-emerald-100 {
	background-color: #D1FAE5;
}

.text-emerald-600 {
	color: #059669;
}

.bg-sky-100 {
	background-color: #E0F2FE;
}

.text-sky-600 {
	color: #0284C7;
}

.bg-violet-100 {
	background-color: #EDE9FE;
}

.text-violet-600 {
	color: #7C3AED;
}

.sales-record-popup {
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.search-box {
	display: flex;
	align-items: center;
	background-color: #F3F4F6;
	border-radius: 20rpx;
	padding: 8rpx 16rpx;
	width: 200rpx;
}

.search-input {
	flex: 1;
	font-size: 24rpx;
	margin-left: 8rpx;
}

.filter-btn {
	width: 60rpx;
	height: 60rpx;
	background-color: #F3F4F6;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.view-toggle {
	display: flex;
	align-items: center;
}

.view-toggle-btn {
	width: 50rpx;
	height: 50rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
}

.view-toggle-btn.active {
	background-color: #FFFFFF;
	box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.filter-tags-scroll {
	white-space: nowrap;
}

.filter-tags {
	padding: 16rpx 24rpx;
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.filter-tag {
	display: inline-block;
	padding: 8rpx 16rpx;
	background-color: #F3F4F6;
	border-radius: 16rpx;
	font-size: 24rpx;
	color: #4B5563;
}

.filter-tag.active {
	background-color: #059669;
	color: #FFFFFF;
}

.table-header {
	font-weight: 500;
	top: 0;
	z-index: 10;
}

.table-row {
	transition: background-color 0.2s;
}

.table-row:active {
	background-color: #F3F4F6;
}

.status-dot {
	width: 12rpx;
	height: 12rpx;
	border-radius: 50%;
}

.status-tag {
	display: inline-block;
	font-size: 20rpx;
	padding: 4rpx 12rpx;
	border-radius: 20rpx;
}

.status-tag.paid {
	background-color: #D1FAE5;
	color: #059669;
}

.status-tag.unpaid {
	background-color: #FEE2E2;
	color: #DC2626;
}

.grid-cards {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 20rpx;
	padding: 20rpx;
}

.record-card {
	background-color: #FFFFFF;
	border-radius: 16rpx;
	padding: 16rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
	border: 1rpx solid rgba(0, 0, 0, 0.05);
}

/* 功能面板整体样式 - 高质感设计 */
.function-panel {
	position: relative;
	border-radius: 24rpx;
	overflow: hidden;
	padding: 30rpx 20rpx;
	box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.08);
	background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(240, 240, 250, 0.85));
	backdrop-filter: blur(10px);
	-webkit-backdrop-filter: blur(10px);
	border: 1px solid rgba(255, 255, 255, 0.6);
}

/* 背景纹理效果 */
.function-panel-texture {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	opacity: 0.04;
	background-image:
		linear-gradient(0deg, transparent 24%, rgba(0, 0, 0, 0.5) 25%, rgba(0, 0, 0, 0.5) 26%, transparent 27%, transparent 74%, rgba(0, 0, 0, 0.5) 75%, rgba(0, 0, 0, 0.5) 76%, transparent 77%, transparent),
		linear-gradient(90deg, transparent 24%, rgba(0, 0, 0, 0.5) 25%, rgba(0, 0, 0, 0.5) 26%, transparent 27%, transparent 74%, rgba(0, 0, 0, 0.5) 75%, rgba(0, 0, 0, 0.5) 76%, transparent 77%, transparent);
	background-size: 50rpx 50rpx;
}

/* 光泽高光效果 */
.function-panel-highlight {
	position: absolute;
	top: -50%;
	left: -50%;
	right: -50%;
	bottom: -50%;
	background: radial-gradient(ellipse at center, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 70%);
	transform: rotate(-45deg);
	pointer-events: none;
}

/* 功能菜单布局 */
.function-menu-elegant {
	position: relative;
	z-index: 1;
	display: flex;
	justify-content: space-around;
	align-items: center;
}

/* 功能项样式 */
.function-item-elegant {
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 22%;
	position: relative;
	transition: all 0.3s ease;
}

.function-item-elegant:active {
	transform: scale(0.95);
}

/* 图标样式 */
.function-item-elegant image {
	width: 32px;
	height: 32px;
	margin-bottom: 16rpx;
	filter: drop-shadow(0 2rpx 4rpx rgba(0, 0, 0, 0.1));
	transition: all 0.3s ease;
}

.function-item-elegant:active image {
	filter: drop-shadow(0 1rpx 2rpx rgba(0, 0, 0, 0.1));
}

/* 文本样式 */
.function-text-elegant {
	font-size: 26rpx;
	font-weight: 500;
	white-space: nowrap;
	letter-spacing: 1rpx;
	color: rgba(0, 0, 0, 0.75);
	text-shadow: 0 1rpx 2rpx rgba(255, 255, 255, 0.5);
}

/* 销售数据统计创意简约版样式 */
.sales-dashboard {
	position: relative;
	overflow: hidden;
	padding: 0 0 30rpx 0;
	background: #ffffff;
	border-radius: 24rpx;
}

/* 标题区域样式 */
.sales-dashboard-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 24rpx 30rpx;
	border-bottom: 1px solid #f3f4f6;
	position: relative;
}

.dashboard-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #1f2937;
	position: relative;
	padding-left: 20rpx;
}

.dashboard-title::before {
	content: '';
	position: absolute;
	left: 0;
	top: 50%;
	transform: translateY(-50%);
	width: 8rpx;
	height: 32rpx;
	background: linear-gradient(to bottom, #0ea5e9, #0284c7);
	border-radius: 4rpx;
}

.report-tabs {
	display: flex;
	align-items: center;
	background-color: #f3f4f6;
	border-radius: 30rpx;
	padding: 4rpx;
}

.report-tab {
	padding: 8rpx 20rpx;
	font-size: 24rpx;
	color: #6b7280;
	border-radius: 26rpx;
	transition: all 0.3s ease;
}

.report-tab.active {
	background-color: #ffffff;
	color: #0d9488;
	font-weight: 500;
	box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
}

.report-swiper {
	height: 300rpx;
}

/* 主要内容区域样式 */
.dashboard-content {
	display: flex;
	padding: 30rpx;
	position: relative;
}

/* 左侧环形图样式 */
.dashboard-left {
	width: 40%;
	display: flex;
	justify-content: center;
	align-items: center;
}

.circle-progress-wrapper {
	position: relative;
	width: 180rpx;
	height: 180rpx;
}

.circle-progress-container {
	width: 100%;
	height: 100%;
	position: relative;
	border-radius: 50%;
	overflow: hidden;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.circle-bg {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	border-radius: 50%;
	background-color: #e5e7eb;
	z-index: 1;
	box-shadow: inset 0 0 8rpx rgba(0, 0, 0, 0.1);
}

.circle-progress {
	position: absolute;
	top: 0;
	left: 0;
	width: 50%;
	height: 100%;
	background-color: transparent;
	transform-origin: right center;
	z-index: 2;
	transition: transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.circle-progress::before {
	content: '';
	position: absolute;
	top: 0;
	left: -100%;
	width: 100%;
	height: 100%;
	border-radius: 50%;
	background: linear-gradient(135deg, #597fbd, #1d4ed8, #1e40af);
	box-shadow: 0 0 100rpx rgba(255, 0, 0, 0.5);
}

.circle-content {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	z-index: 3;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	width: 80%;
	height: 80%;
	border-radius: 50%;
	background-color: white;
	box-shadow: inset 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.circle-percentage {
	font-size: 40rpx;
	font-weight: bold;
	color: #0284c7;
	line-height: 1;
}

.circle-label {
	font-size: 20rpx;
	color: #6b7280;
	margin-top: 8rpx;
}

/* 右侧指标区样式 */
.dashboard-right {
	width: 60%;
	display: flex;
	flex-direction: column;
	justify-content: center;
	gap: 24rpx;
	padding-left: 60rpx;
	padding-right: 0rpx;
}

.metric-item {
	position: relative;
	transition: all 0.3s ease;
}

.metric-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 8rpx;
}

.metric-label {
	font-size: 24rpx;
	color: #6b7280;
	font-weight: 500;
}

.trend-indicator {
	font-size: 20rpx;
	font-weight: 500;
	padding: 2rpx 10rpx;
	border-radius: 20rpx;
}

.positive {
	color: #10b981;
	background-color: #ecfdf5;
}

.negative {
	color: #ef4444;
	background-color: #fef2f2;
}

.metric-value {
	font-size: 40rpx;
	font-weight: bold;
	display: block;
	position: relative;
}

/* 日报样式 */
.sales-value {
	color: #0ea5e9;
	position: relative;
	padding-bottom: 12rpx;
}

.sales-value::after {
	content: '';
	position: absolute;
	bottom: 0;
	left: 0;
	width: 60%;
	height: 4rpx;
	background: linear-gradient(to right, #0ea5e9, transparent);
	border-radius: 2rpx;
}

.commission-value {
	color: #8b5cf6;
	position: relative;
	padding-bottom: 12rpx;
}

.commission-value::after {
	content: '';
	position: absolute;
	bottom: 0;
	left: 0;
	width: 60%;
	height: 4rpx;
	background: linear-gradient(to right, #8b5cf6, transparent);
	border-radius: 2rpx;
}

/* 月报样式 */
.sales-value-monthly {
	color: #f59e0b;
	position: relative;
	padding-bottom: 12rpx;
}

.sales-value-monthly::after {
	content: '';
	position: absolute;
	bottom: 0;
	left: 0;
	width: 60%;
	height: 4rpx;
	background: linear-gradient(to right, #f59e0b, transparent);
	border-radius: 2rpx;
}

.commission-value-monthly {
	color: #10b981;
	position: relative;
	padding-bottom: 12rpx;
}

.commission-value-monthly::after {
	content: '';
	position: absolute;
	bottom: 0;
	left: 0;
	width: 60%;
	height: 4rpx;
	background: linear-gradient(to right, #10b981, transparent);
	border-radius: 2rpx;
}

/* 年报样式 */
.sales-value-yearly {
	color: #ec4899;
	position: relative;
	padding-bottom: 12rpx;
}

.sales-value-yearly::after {
	content: '';
	position: absolute;
	bottom: 0;
	left: 0;
	width: 60%;
	height: 4rpx;
	background: linear-gradient(to right, #ec4899, transparent);
	border-radius: 2rpx;
}

.commission-value-yearly {
	color: #3b82f6;
	position: relative;
	padding-bottom: 12rpx;
}

.commission-value-yearly::after {
	content: '';
	position: absolute;
	bottom: 0;
	left: 0;
	width: 60%;
	height: 4rpx;
	background: linear-gradient(to right, #3b82f6, transparent);
	border-radius: 2rpx;
}



/* 业务数据摘要高科技感样式 */
.business-summary-grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 20rpx;
}

.business-summary-card {
	background-color: rgba(255, 255, 255, 0.08);
	backdrop-filter: blur(20px);
	border-radius: 20rpx;
	padding: 24rpx;
	box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
	display: flex;
	flex-direction: column;
	transition: all 0.3s ease;
	position: relative;
	overflow: hidden;
	height: 160rpx;
	border: 1px solid rgba(255, 255, 255, 0.15);
}

.business-summary-card:active {
	transform: scale(0.98);
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.2);
}

/* 卡片发光效果 */
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

/* 不同卡片的发光颜色 */
.amber-glow {
	background: rgba(245, 158, 11, 0.6);
}

.orange-glow {
	background: rgba(249, 115, 22, 0.6);
}

.red-glow {
	background: rgba(239, 68, 68, 0.6);
}

.emerald-glow {
	background: rgba(16, 185, 129, 0.6);
}



/* 卡片颜色主题 */
.card-amber {
	background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.2));
}

.card-orange {
	background: linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(234, 88, 12, 0.2));
}

.card-red {
	background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.2));
}

.card-emerald {
	background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.2));
}



.card-content {
	position: relative;
	z-index: 1;
	display: flex;
	flex-direction: column;
	height: 100%;
}

.card-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 16rpx;
}

.card-title {
	font-size: 28rpx;
	color: rgba(0, 0, 0, 0.8);
	font-weight: 500;
	letter-spacing: 1rpx;
}

.card-icon {
	width: 40rpx;
	height: 40rpx;
	border-radius: 8rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	opacity: 0.7;
}

.card-body {
	flex: 1;
	display: flex;
	align-items: flex-end;
}

.card-value {
	font-size: 72rpx;
	font-weight: bold;
	color: rgba(0, 0, 0, 0.9);
	line-height: 1;
	letter-spacing: -1rpx;
}

.card-unit {
	font-size: 28rpx;
	color: rgba(0, 0, 0, 0.6);
	margin-left: 8rpx;
	font-weight: normal;
	align-self: flex-end;
	margin-bottom: 12rpx;
}

/* 热销水果预览样式 */
.hot-selling-container {
	width: 100%;
}

.hot-selling-preview {
	display: flex;
	justify-content: space-between;
	width: 100%;
	gap: 16rpx;
}

.hot-selling-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	position: relative;
	width: 33.33%;
}

.hot-selling-rank {
	position: absolute;
	top: -8rpx;
	left: -8rpx;
	width: 28rpx;
	height: 28rpx;
	border-radius: 50%;
	background-color: rgba(16, 185, 129, 0.9);
	color: white;
	font-size: 20rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 2;
	font-weight: bold;
	box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.2);
}

.hot-selling-image {
	width: 64rpx;
	height: 64rpx;
	border-radius: 12rpx;
	object-fit: cover;
	border: 1rpx solid rgba(255, 255, 255, 0.2);
	background-color: rgba(255, 255, 255, 0.1);
	box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.2);
}

.hot-selling-name {
	font-size: 20rpx;
	color: rgba(0, 0, 0, 0.7);
	margin-top: 8rpx;
	text-align: center;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	width: 100%;
}

.card-divider {
	height: 1rpx;
	background-color: #F3F4F6;
}

.empty-tip {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 60rpx 0;
}

.page-btn {
	background-color: #F3F4F6;
	color: #4B5563;
	padding: 8rpx 16rpx;
	border-radius: 20rpx;
	font-size: 24rpx;
}

.page-btn:disabled {
	opacity: 0.5;
}

.close-btn {
	background-color: #F3F4F6;
	color: #4B5563;
	padding: 8rpx 24rpx;
	border-radius: 20rpx;
	font-size: 24rpx;
}

.record-detail-popup {
	box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.drag-handle {
	width: 80rpx;
	height: 6rpx;
	background-color: #E5E7EB;
	border-radius: 4rpx;
	margin: 16rpx auto;
}

.detail-sections {
	display: flex;
	flex-direction: column;
	gap: 24rpx;
}

.detail-section {
	background-color: #F9FAFB;
	border-radius: 16rpx;
	overflow: hidden;
}

.section-title {
	font-size: 28rpx;
	font-weight: 600;
	color: #4B5563;
	padding: 16rpx 20rpx;
	background-color: #F3F4F6;
	border-bottom: 1rpx solid #E5E7EB;
}

.section-content {
	padding: 16rpx 20rpx;
}

.detail-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 12rpx 0;
}

.detail-item:not(:last-child) {
	border-bottom: 1rpx solid #F3F4F6;
}

.label {
	color: #6B7280;
	font-size: 28rpx;
}

.value {
	color: #1F2937;
	font-size: 28rpx;
}

.full-width {
	width: 100%;
}

.remark-item {
	flex-direction: column;
	align-items: flex-start;
}

.detail-footer {
	padding: 20rpx;
}

.action-btn {
	height: 80rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 12rpx;
	font-size: 28rpx;
}

.action-btn.secondary {
	background-color: #F3F4F6;
	color: #4B5563;
}

.action-btn.primary {
	background-color: #059669;
	color: #FFFFFF;
}

/* 新增编辑个人信息样式 - 美化版 */
.popup-container {
	width: 92%;
	max-width: 680rpx;
	max-height: 90vh;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	border-radius: 24rpx;
	box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.15);
	background-color: #FFFFFF;
}

.popup-header {
	position: relative;
	background: linear-gradient(135deg, #66b257 0%, #0F766E 100%);
	padding: 30rpx 40rpx;
	border-bottom: 1rpx solid rgba(255, 255, 255, 0.1);
}

.close-btn {
	width: 56rpx;
	height: 56rpx;
	border-radius: 50%;
	background-color: rgba(255, 255, 255, 0.15);
	transition: all 0.3s ease;
	display: flex;
	align-items: center;
	justify-content: center;
}

.close-btn:active {
	background-color: rgba(255, 255, 255, 0.25);
	transform: scale(0.92);
}

.popup-content {
	flex: 1;
	overflow-y: auto;
	padding: 40rpx 40rpx 30rpx;
	background-color: #FFFFFF;
}

.avatar-edit-section {
	margin: 10rpx 0 40rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.avatar-container {
	width: 200rpx;
	height: 200rpx;
	border-radius: 50%;
	overflow: hidden;
	background-color: #F3F4F6;
	border: 6rpx solid #FFFFFF;
	box-shadow: 0 8rpx 20rpx rgba(13, 148, 136, 0.15);
	transition: all 0.3s ease;
}

.avatar-edit-btn {
	position: absolute;
	bottom: 10rpx;
	right: 10rpx;
	width: 68rpx;
	height: 68rpx;
	background: linear-gradient(135deg, #10B981 0%, #0D9488 100%);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 4rpx solid #FFFFFF;
	box-shadow: 0 4rpx 12rpx rgba(13, 148, 136, 0.25);
	transition: all 0.3s ease;
}

.avatar-edit-btn:active {
	transform: scale(0.92);
	background: linear-gradient(135deg, #0D9488 0%, #0F766E 100%);
}

.form-section {
	width: 100%;
	margin-top: 10rpx;
}

.form-group {
	margin-bottom: 30rpx;
}

.form-label {
	font-size: 28rpx;
	color: #374151;
	margin-bottom: 12rpx;
	display: block;
	font-weight: 600;
	letter-spacing: 0.5rpx;
}

.form-control {
	display: flex;
	align-items: center;
	width: 100%;
	height: 96rpx;
	border: 1.5px solid #E5E7EB;
	border-radius: 16rpx;
	padding: 0 24rpx;
	background-color: #F9FAFB;
	transition: all 0.3s ease;
	box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.02);
}

.form-control:focus-within {
	border-color: #0D9488;
	box-shadow: 0 0 0 3rpx rgba(13, 148, 136, 0.15);
	background-color: #FFFFFF;
}

.form-control-disabled {
	background-color: #F3F4F6;
	border-color: #E5E7EB;
	opacity: 0.9;
}

.form-control .uni-icons {
	margin-right: 20rpx;
	color: #6B7280;
}

.form-input {
	flex: 1;
	height: 100%;
	font-size: 30rpx;
	color: #1F2937;
	background-color: transparent;
	letter-spacing: 0.5rpx;
}

.form-hint {
	font-size: 24rpx;
	color: #9CA3AF;
	margin-top: 10rpx;
	margin-left: 6rpx;
	letter-spacing: 0.5rpx;
}

/* 通用弹窗底部样式 */
.profile-popup-footer {
	display: flex;
	border-top: 1rpx solid #F3F4F6;
	box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.03);
}

/* 目标设置弹窗样式 */
.target-setting-popup {
	width: 650rpx;
	background-color: #FFFFFF;
	border-radius: 28rpx;
	overflow: hidden;
	box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.15), 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
	border: 1rpx solid rgba(255, 255, 255, 0.8);
}

.target-popup-title {
	font-size: 36rpx;
	font-weight: bold;
	color: #1F2937;
	padding: 36rpx 30rpx;
	border-bottom: 1rpx solid #F3F4F6;
	text-align: center;
	background: linear-gradient(to right, #F0F9FF, #E0F2FE, #F0F9FF);
	text-shadow: 0 1rpx 2rpx rgba(255, 255, 255, 0.8);
}

.target-popup-content {
	padding: 40rpx 30rpx;
	background-color: #FFFFFF;
}

.target-input-group {
	margin-bottom: 30rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
	position: relative;
}

.target-input-group:last-child {
	margin-bottom: 10rpx;
}

.target-input-label {
	font-size: 28rpx;
	color: #4B5563;
	font-weight: 500;
}

.target-input-field {
	width: 300rpx;
	height: 80rpx;
	border: 1rpx solid #E5E7EB;
	border-radius: 16rpx;
	padding: 0 20rpx;
	font-size: 28rpx;
	background-color: #F9FAFB;
	transition: all 0.3s ease;
	box-shadow: inset 0 2rpx 5rpx rgba(0, 0, 0, 0.05);
}

.target-input-field:focus {
	border-color: #38BDF8;
	box-shadow: 0 0 0 3rpx rgba(56, 189, 248, 0.2);
	outline: none;
}

.target-input-value {
	font-size: 30rpx;
	color: #1F2937;
	font-weight: 600;
	padding: 10rpx 20rpx;
	background-color: #F9FAFB;
	border-radius: 12rpx;
	min-width: 200rpx;
	text-align: right;
}

.target-completion-rate {
	color: #0EA5E9;
	font-weight: bold;
	background: linear-gradient(to right, #E0F2FE, #BAE6FD);
}

.target-commission-rate {
	color: #8B5CF6;
	font-weight: bold;
	background: linear-gradient(to right, #EDE9FE, #DDD6FE);
}

.target-popup-footer {
	display: flex;
	padding: 30rpx;
	justify-content: space-between;
	border-top: 1rpx solid #F3F4F6;
	background-color: #FAFAFA;
}

.target-btn {
	flex: 0.48;
	height: 90rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 32rpx;
	font-weight: 500;
	border-radius: 45rpx;
	transition: all 0.3s ease;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.target-btn-cancel {
	background: linear-gradient(to right, #F9FAFB, #F3F4F6);
	color: #4B5563;
	border: 1rpx solid #E5E7EB;
}

.target-btn-cancel:active {
	transform: scale(0.98);
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.target-btn-confirm {
	background: linear-gradient(135deg, #38BDF8, #0EA5E9, #0284C7);
	color: #FFFFFF;
	border: none;
}

.target-btn-confirm:active {
	transform: scale(0.98);
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.profile-popup-btn {
	flex: 1;
	height: 110rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 32rpx;
	font-weight: 600;
	transition: all 0.3s ease;
	letter-spacing: 1rpx;
}
</style>