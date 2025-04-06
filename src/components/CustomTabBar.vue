<template>
	<view class="custom-tab-bar">
		<view 
			v-for="(item, index) in tabList" 
			:key="index" 
			class="tab-item" 
			:class="{ active: current === index }"
			@tap="switchTab(item.pagePath, index)"
		>
			<text class="tab-icon" :class="item.iconClass"></text>
			<text class="tab-text">{{ item.text }}</text>
		</view>
	</view>
</template>

<script>
export default {
	name: 'CustomTabBar',
	data() {
		return {
			current: 0,
			tabList: [
				{
					pagePath: '/pages/price/price',
					text: '今日报价',
					iconClass: 'fas fa-tag'
				},
				{
					pagePath: '/pages/inventory/inventory',
					text: '库存管理',
					iconClass: 'fas fa-warehouse'
				},
				{
					pagePath: '/pages/sales/sales',
					text: '水果销售',
					iconClass: 'fas fa-shopping-cart'
				},
				{
					pagePath: '/pages/profile/profile',
					text: '个人中心',
					iconClass: 'fas fa-user'
				}
			]
		};
	},
	mounted() {
		// 获取当前页面路径
		const pages = getCurrentPages();
		const currentPage = pages[pages.length - 1];
		const currentPath = '/' + currentPage.route;
		
		// 设置当前选中的标签
		const index = this.tabList.findIndex(item => item.pagePath === currentPath);
		if (index !== -1) {
			this.current = index;
		}
	},
	methods: {
		switchTab(path, index) {
			if (this.current !== index) {
				uni.switchTab({
					url: path
				});
				this.current = index;
			}
		}
	}
};
</script>

<style>
.custom-tab-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	height: 100rpx;
	background-color: #FFFFFF;
	display: flex;
	box-shadow: 0 -1px 5px rgba(0, 0, 0, 0.05);
	z-index: 999;
}

.tab-item {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 10rpx 0;
}

.tab-icon {
	font-size: 44rpx;
	color: #7A7E83;
	line-height: 1;
	margin-bottom: 4rpx;
}

.tab-text {
	font-size: 24rpx;
	color: #7A7E83;
}

.tab-item.active .tab-icon,
.tab-item.active .tab-text {
	color: #0D9488;
}
</style> 