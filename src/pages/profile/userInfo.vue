<template>
	<view class="user-info-container">
		<!-- 头部导航栏 -->
		<view class="header bg-teal-600 text-white">
			<view class="flex items-center">
				<view class="back-icon" @tap="goBack">
					<uni-icons type="back" size="24" color="#FFFFFF"></uni-icons>
				</view>
				<text class="title">个人信息</text>
			</view>
		</view>
		
		<!-- 内容区域 -->
		<view class="content-container">
			<view class="info-list">
				<!-- 头像 -->
				<view class="info-item" @tap="editAvatar">
					<text class="item-label">头像</text>
					<view class="item-content flex items-center">
						<image class="avatar" :src="userInfo.avatar" mode="aspectFill"></image>
						<uni-icons type="right" size="16" color="#9CA3AF"></uni-icons>
					</view>
				</view>
				
				<!-- 姓名 -->
				<view class="info-item">
					<text class="item-label">姓名</text>
					<view class="item-content flex items-center">
						<input type="text" v-model="userInfo.name" placeholder="请输入姓名" class="form-input" />
					</view>
				</view>
				
				<!-- 档口名称(只读) -->
				<view class="info-item">
					<text class="item-label">档口名称</text>
					<view class="item-content flex items-center">
						<text class="item-value">{{userInfo.shopName}}</text>
					</view>
				</view>
				
				<!-- 联系方式 -->
				<view class="info-item">
					<text class="item-label">联系方式</text>
					<view class="item-content flex items-center">
						<input type="text" v-model="userInfo.phone" placeholder="请输入联系方式" class="form-input" maxlength="11" />
					</view>
				</view>
				
				<!-- 角色(只读) -->
				<view class="info-item">
					<text class="item-label">业务身份</text>
					<view class="item-content flex items-center">
						<text class="item-value">{{userInfo.role}}</text>
					</view>
				</view>
			</view>
			
			<!-- 底部保存按钮 -->
			<view class="save-btn-container">
				<button class="save-btn" @tap="saveUserInfo">保存</button>
			</view>
		</view>
	</view>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';
import uniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue';
import http from '@/services/http.js';

export default {
	components: {
		uniIcons
	},
	setup() {
		const userInfo = ref({
			name: '默认用户',
			shopName: '水果档口',
			avatar: '/static/default-avatar.png',
			role: '管理员',
			phone: '',
			username: 'admin'
		});
		
		// 生命周期
		onMounted(() => {
			getUserInfo();
		});
		
		// 获取用户信息
		const getUserInfo = async () => {
			try {
				const data = await http.request({ url: '/auth/profile', method: 'GET' });
				userInfo.value = {
					name: data.name,
					shopName: data.shopName || data.storeName,
					avatar: data.avatar,
					role: data.role,
					phone: data.phone,
					username: data.username
				};
			} catch (e) {
				console.error('获取用户信息失败', e);
				// fallback 本地存储
				const loginUserInfo = uni.getStorageSync('loginUser');
				if (loginUserInfo) {
					userInfo.value = {
						name: loginUserInfo.name || '默认用户',
						shopName: loginUserInfo.storeName || '水果档口',
						avatar: loginUserInfo.avatar || '/static/default-avatar.png',
						role: loginUserInfo.role || '管理员',
						phone: loginUserInfo.phone || '',
						username: loginUserInfo.username || 'admin'
					};
				}
			}
		};
		
		// 返回上一页
		const goBack = () => {
			uni.navigateBack();
		};
		
		// 编辑头像
		const editAvatar = () => {
			uni.chooseImage({
				count: 1,
				sizeType: ['compressed'],
				sourceType: ['album', 'camera'],
				success: (res) => {
					// 直接使用临时路径
					userInfo.value.avatar = res.tempFilePaths[0];
					console.log('头像路径:', res.tempFilePaths[0]);
				}
			});
		};
		
		// 保存用户信息
		const saveUserInfo = () => {
			// 表单验证
			if (!userInfo.value.name.trim()) {
				uni.showToast({
					title: '姓名不能为空',
					icon: 'none'
				});
				return;
			}
			
			if (userInfo.value.phone && !/^1\d{10}$/.test(userInfo.value.phone)) {
				uni.showToast({
					title: '手机号格式不正确',
					icon: 'none'
				});
				return;
			}
			
			try {
				// 获取当前登录用户信息
				const loginUserInfo = uni.getStorageSync('loginUser');
				if (loginUserInfo) {
					// 更新信息
					loginUserInfo.name = userInfo.value.name;
					loginUserInfo.avatar = userInfo.value.avatar;
					loginUserInfo.phone = userInfo.value.phone;
					
					// 保存回本地存储
					uni.setStorageSync('loginUser', loginUserInfo);
					
					// 通知个人中心页面刷新
					uni.$emit('userInfoUpdated');
					
					// 返回上一页并显示成功提示
					uni.navigateBack({
						success: () => {
							uni.showToast({
								title: '保存成功',
								icon: 'success'
							});
						}
					});
				}
			} catch (e) {
				console.error('保存用户信息失败', e);
				uni.showToast({
					title: '保存失败，请重试',
					icon: 'none'
				});
			}
		};
		
		return {
			userInfo,
			goBack,
			editAvatar,
			saveUserInfo
		};
	}
}
</script>

<style>
page {
	background-color: #F5F5F5;
}

.user-info-container {
	width: 100%;
	height: 100vh;
	display: flex;
	flex-direction: column;
	animation: slideIn 0.3s ease-out forwards;
}

@keyframes slideIn {
	from {
		transform: translateX(100%);
	}
	to {
		transform: translateX(0);
	}
}

.header {
	padding: 20rpx 30rpx;
	position: relative;
	height: 90rpx;
	display: flex;
	align-items: center;
	background-color: #0D9488;
}

.back-icon {
	padding: 10rpx 20rpx 10rpx 0;
}

.title {
	font-size: 34rpx;
	font-weight: 500;
	color: #FFFFFF;
	flex: 1;
	text-align: center;
	margin-right: 44rpx; /* 为了居中，抵消返回按钮的宽度 */
}

.content-container {
	flex: 1;
	padding: 20rpx;
	overflow-y: auto;
	display: flex;
	flex-direction: column;
}

.info-list {
	background-color: #FFFFFF;
	border-radius: 16rpx;
	overflow: hidden;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
	margin-bottom: 30rpx;
}

.info-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 28rpx 30rpx;
	border-bottom: 1rpx solid #f5f5f5;
}

.info-list .info-item:last-child {
	border-bottom: none;
}

.item-label {
	font-size: 32rpx;
	color: #1F2937;
	font-weight: 500;
}

.item-content {
	display: flex;
	align-items: center;
}

.item-value {
	font-size: 32rpx;
	color: #111827;
	font-weight: 500;
	margin-right: 10rpx;
}

.avatar {
	width: 100rpx;
	height: 100rpx;
	border-radius: 50%;
	margin-right: 20rpx;
	background-color: #E5E7EB;
	border: 4rpx solid #FFFFFF;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.form-input {
	text-align: right;
	height: 60rpx;
	font-size: 32rpx;
	font-weight: 500;
	color: #111827;
}

.save-btn-container {
	margin-top: auto;
	padding: 30rpx 0;
}

.save-btn {
	width: 90%;
	height: 90rpx;
	margin: 0 auto;
	background-color: #0D9488;
	color: #FFFFFF;
	border-radius: 45rpx;
	font-size: 32rpx;
	font-weight: 500;
	display: flex;
	align-items: center;
	justify-content: center;
}

.save-btn:active {
	opacity: 0.9;
	transform: scale(0.98);
}

.bg-teal-600 {
	background-color: #0D9488;
}

.text-white {
	color: #FFFFFF;
}

.mt-3 {
	margin-top: 30rpx;
}
</style> 