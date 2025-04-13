<template>
	<view class="custom-tab-bar">
		<view
			v-for="(item, index) in tabList"
			:key="index"
			class="tab-item"
			:class="{ active: currentIndex === index }"
			@click="handleTabClick(item, index)"
		>
			<text class="fas" :class="item.iconClass"></text>
			<text class="tab-text">{{ item.text }}</text>
		</view>
	</view>
</template>

<script>
export default {
	name: 'CustomTabBar',
	data() {
		return {
			currentIndex: 0,
			tabList: [
				{
					pagePath: 'pages/price/price',
					text: '今日报价',
					iconClass: 'fa-tag'
				},
				{
					pagePath: 'pages/inventory/inventory',
					text: '库存管理',
					iconClass: 'fa-warehouse'
				},
				{
					pagePath: 'pages/customer/customer',
					text: '客户管理',
					iconClass: 'fa-users'
				},
				{
					pagePath: 'pages/sales/sales',
					text: '水果销售',
					iconClass: 'fa-shopping-cart'
				},
				{
					pagePath: 'pages/profile/profile',
					text: '个人中心',
					iconClass: 'fa-user'
				}
			]
		};
	},
	created() {
		this.updateCurrentTab();
	},
	mounted() {
		// 监听页面显示事件
		uni.$on('tabChange', this.updateCurrentTab);
	},
	beforeDestroy() {
		uni.$off('tabChange', this.updateCurrentTab);
	},
	methods: {
		// 更新当前选项卡
		updateCurrentTab() {
			const pages = getCurrentPages();
			if (pages.length === 0) return;

			const currentPage = pages[pages.length - 1];
			const route = currentPage.route;
			console.log('当前路由:', route);

			// 查找匹配的标签索引
			for (let i = 0; i < this.tabList.length; i++) {
				// 比较路由路径，忽略前导斜杠
				if (route && this.tabList[i].pagePath && route.endsWith(this.tabList[i].pagePath)) {
					this.currentIndex = i;
					console.log('更新当前标签为:', i);
					break;
				}
			}
		},

		// 处理标签点击
		handleTabClick(item, index) {
			console.log('点击标签:', item.text, index);

			// 如果当前已经在该标签页，刷新当前页面
			if (this.currentIndex === index) {
				console.log('已经在当前页面，刷新页面');
				// 触发页面刷新事件
				uni.$emit('pageRefresh');
				return;
			}

			// 先更新当前标签，给用户即时反馈
			this.currentIndex = index;

			// 然后切换到对应的页面
			this.switchTabPage(item.pagePath);
		},

		// 切换标签页
		switchTabPage(pagePath, callback) {
			console.log('切换到页面:', pagePath);

			// 对于 tabBar 页面，必须使用 switchTab
			try {
				uni.switchTab({
					url: '/' + pagePath,
					success: () => {
						console.log('页面切换成功');
						// 如果有回调函数，则执行
						if (typeof callback === 'function') {
							callback();
						}

						// 延迟触发 tabChange 事件，确保页面已经加载
						setTimeout(() => {
							uni.$emit('tabChange');
							// 触发页面显示事件
							uni.$emit('onShow');
						}, 100);
					},
					fail: (err) => {
						console.error('页面切换失败:', err);
						uni.showToast({
							title: '页面切换失败',
							icon: 'none'
						});
					}
				});
			} catch (e) {
				console.error('切换页面出现异常:', e);
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
	position: relative;
}

/* 添加触摸反馈效果 */
.tab-item:active {
	opacity: 0.8;
}

.tab-item .fas {
	font-size: 44rpx;
	color: #7A7E83;
	line-height: 1;
	margin-bottom: 4rpx;
	transition: color 0.1s;
}

.tab-text {
	font-size: 24rpx;
	color: #7A7E83;
	transition: color 0.1s;
}

.tab-item.active .fas,
.tab-item.active .tab-text {
	color: #0D9488;
}
</style>