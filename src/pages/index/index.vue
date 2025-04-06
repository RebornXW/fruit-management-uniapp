<template>
	<view class="container p-4">
		<view class="header bg-teal-600 text-white p-4 rounded-lg mb-4">
			<text class="text-xl font-bold">图标测试页面</text>
		</view>
		
		<!-- Iconfont CSS样式图标测试 -->
		<view class="bg-white p-4 rounded-lg mb-4">
			<text class="text-base font-bold mb-2 block">Iconfont 样式图标</text>
			<view class="flex flex-wrap">
				<view class="icon-item">
					<text class="iconfont icon-search"></text>
					<text class="icon-name">搜索</text>
				</view>
				<view class="icon-item">
					<text class="iconfont icon-more"></text>
					<text class="icon-name">更多</text>
				</view>
				<view class="icon-item">
					<text class="iconfont icon-add"></text>
					<text class="icon-name">添加</text>
				</view>
				<view class="icon-item">
					<text class="iconfont icon-delete"></text>
					<text class="icon-name">删除</text>
				</view>
				<view class="icon-item">
					<text class="iconfont icon-edit"></text>
					<text class="icon-name">编辑</text>
				</view>
				<view class="icon-item">
					<text class="iconfont icon-check"></text>
					<text class="icon-name">确认</text>
				</view>
				<view class="icon-item">
					<text class="iconfont icon-close"></text>
					<text class="icon-name">关闭</text>
				</view>
				<view class="icon-item">
					<text class="iconfont icon-setting"></text>
					<text class="icon-name">设置</text>
				</view>
			</view>
		</view>
		
		<!-- CustomIcon组件测试 -->
		<view class="bg-white p-4 rounded-lg mb-4">
			<text class="text-base font-bold mb-2 block">CustomIcon 组件</text>
			<view class="flex flex-wrap">
				<view class="icon-item">
					<custom-icon type="search" size="24" color="#0D9488"></custom-icon>
					<text class="icon-name">搜索</text>
				</view>
				<view class="icon-item">
					<custom-icon type="more" size="24" color="#0D9488"></custom-icon>
					<text class="icon-name">更多</text>
				</view>
				<view class="icon-item">
					<custom-icon type="add" size="24" color="#0D9488"></custom-icon>
					<text class="icon-name">添加</text>
				</view>
				<view class="icon-item">
					<custom-icon type="delete" size="24" color="#0D9488"></custom-icon>
					<text class="icon-name">删除</text>
				</view>
				<view class="icon-item">
					<custom-icon type="edit" size="24" color="#0D9488"></custom-icon>
					<text class="icon-name">编辑</text>
				</view>
				<view class="icon-item">
					<custom-icon type="check" size="24" color="#0D9488"></custom-icon>
					<text class="icon-name">确认</text>
				</view>
				<view class="icon-item">
					<custom-icon type="close" size="24" color="#0D9488"></custom-icon>
					<text class="icon-name">关闭</text>
				</view>
				<view class="icon-item">
					<custom-icon type="setting" size="24" color="#0D9488"></custom-icon>
					<text class="icon-name">设置</text>
				</view>
			</view>
		</view>
		
		<!-- 测试完成后的按钮 -->
		<view class="bg-white p-4 rounded-lg">
			<button class="bg-teal-600 text-white py-2 rounded-lg" @tap="goToMainPage">
				进入应用
			</button>
		</view>
	</view>
</template>

<script setup>
import { onMounted } from 'vue';
import CustomIcon from '@/components/CustomIcon.vue';

// 进入主页面
function goToMainPage() {
	uni.switchTab({
		url: '/pages/price/price'
	});
}
</script>

<style>
.container {
	padding-bottom: 40px;
}

.icon-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 25%;
	margin-bottom: 20px;
}

.icon-name {
	font-size: 12px;
	margin-top: 6px;
	color: #666;
}

.iconfont {
	font-size: 24px;
	color: #0D9488;
}
</style>
