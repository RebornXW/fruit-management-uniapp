<template>
	<view class="page-container">
		<!-- 顶部白色栏 -->
		<view class="page-header">
			<view class="header-left" @tap="goBack">
				<text class="iconfont icon-left"></text>
			</view>
			<view class="page-title">个人信息</view>
			<view class="header-right"></view>
		</view>

		<!-- 内容区域 -->
		<view class="content-section">
			<!-- 内容标题栏 -->
			<view class="content-header">
				<view class="content-header-left">
					<view class="section-indicator"></view>
					<text class="list-title">基本信息</text>
				</view>
			</view>

			<!-- 信息卡片 -->
			<view class="info-card">
				<!-- 头像 -->
				<view class="info-item" @tap="editAvatar">
					<text class="item-label">头像</text>
					<view class="item-content">
						<image class="avatar" :src="userInfo.avatar" mode="aspectFill"></image>
						<text class="iconfont icon-camera edit-icon"></text>
					</view>
				</view>

				<!-- 姓名 -->
				<view class="info-item">
					<text class="item-label">姓名</text>
					<view class="item-content">
						<input type="text" v-model="userInfo.name" placeholder="请输入姓名" class="app-input" />
					</view>
				</view>

				<!-- 档口名称(只读) -->
				<view class="info-item">
					<text class="item-label">档口名称</text>
					<view class="item-content">
						<text class="item-value">{{userInfo.stallName}}</text>
					</view>
				</view>

				<!-- 联系方式 -->
				<view class="info-item">
					<text class="item-label">联系方式</text>
					<view class="item-content">
						<input type="text" v-model="userInfo.phone" placeholder="请输入联系方式" class="app-input" maxlength="11" />
					</view>
				</view>

				<!-- 角色(只读) -->
				<view class="info-item">
					<text class="item-label">业务身份</text>
					<view class="item-content">
						<text class="item-value">{{userInfo.role}}</text>
					</view>
				</view>
			</view>

			<!-- 底部保存按钮 -->
			<view class="button-container">
				<button class="app-confirm-btn" @tap="saveUserInfo">保存修改</button>
			</view>
		</view>
	</view>
</template>

<script>
import { ref, onMounted } from 'vue';
import { getUserProfile, updateUserProfile, uploadAvatar } from '@/services/authService.js';

export default {
	setup() {
		const userInfo = ref({
			name: '默认用户',
			stallName: '水果档口',
			avatar: '/static/default-avatar.png',
			role: '管理员',
			phone: '',
			username: 'admin',
			id: null
		});

		// 生命周期
		onMounted(() => {
			// 显示加载中
			uni.showLoading({ title: '加载中...' });
			getUserInfo();
		});

		// 获取用户信息
		const getUserInfo = () => {
			getUserProfile().then(res => {
				userInfo.value = {
					name: res.name || '默认用户',
					stallName: res.stall_name || '水果档口',
					avatar: res.avatar || '/static/default-avatar.png',
					role: res.role || '管理员',
					phone: res.phone || '',
					username: res.username || 'admin',
					id: res.id
				};
				console.log('获取用户信息成功:', res);
				uni.hideLoading();
			}).catch(err => {
				console.error('获取用户信息失败', err);
				uni.hideLoading();
				uni.showToast({
					title: '获取用户信息失败',
					icon: 'none'
				});

				// 如果获取用户信息失败，返回上一页
				setTimeout(() => {
					uni.navigateBack();
				}, 1500);
			});
		};

		// 返回上一页
		const goBack = () => {
			// 尝试返回上一页
			try {
				uni.navigateBack({
					fail: () => {
						// 如果navigateBack失败，则使用switchTab跳转到个人中心页面
						console.log('navigateBack失败，使用switchTab跳转');
						uni.switchTab({
							url: '/pages/profile/profile'
						});
					}
				});
			} catch (e) {
				console.error('返回上一页出错:', e);
				// 出错时使用switchTab跳转到个人中心页面
				uni.switchTab({
					url: '/pages/profile/profile'
				});
			}
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

					// 显示提示
					uni.showToast({
						title: '头像已选择，点击保存生效',
						icon: 'none',
						duration: 2000
					});
				},
				fail: (err) => {
					console.error('选择头像失败', err);
					uni.showToast({
						title: '选择头像失败',
						icon: 'none'
					});
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

			// 准备要提交的数据，使用下划线命名法
			const profileData = {
				name: userInfo.value.name,
				phone: userInfo.value.phone,
				stall_name: userInfo.value.stallName
			};

			// 如果头像发生了变化且是本地文件路径
			if (userInfo.value.avatar && (userInfo.value.avatar.startsWith('file://') || userInfo.value.avatar.startsWith('http://tmp'))) {
				// 显示上传中提示
				uni.showLoading({ title: '正在上传头像...' });

				// 上传头像
				uploadAvatar(userInfo.value.avatar).then(res => {
					// 头像上传成功，将返回的URL添加到要提交的数据中
					profileData.avatar = res.avatar_url || res.avatarUrl;
					console.log('头像上传成功:', res);

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
		};

		// 提交个人信息到API
		const submitProfileData = (profileData) => {
			uni.showLoading({ title: '正在保存...' });
			console.log('提交的个人信息数据:', profileData);

			updateUserProfile(profileData).then((res) => {
				uni.hideLoading();
				console.log('个人信息更新成功:', res);

				// 更新本地用户信息
				userInfo.value = {
					...userInfo.value,
					name: res.name || userInfo.value.name,
					phone: res.phone || userInfo.value.phone,
					stallName: res.stall_name || userInfo.value.stallName,
					avatar: res.avatar || userInfo.value.avatar
				};

				// 通知个人中心页面刷新
				uni.$emit('userInfoUpdated', userInfo.value);

				// 显示成功提示
				uni.showToast({
					title: '保存成功',
					icon: 'success',
					duration: 1500
				});

				// 延迟一下再返回，让用户看到成功提示
				setTimeout(() => {
					// 尝试返回上一页
					try {
						uni.navigateBack({
							fail: () => {
								// 如果navigateBack失败，则使用switchTab跳转到个人中心页面
								console.log('保存后返回失败，使用switchTab跳转');
								uni.switchTab({
									url: '/pages/profile/profile'
								});
							}
						});
					} catch (e) {
						console.error('保存后返回出错:', e);
						// 出错时使用switchTab跳转到个人中心页面
						uni.switchTab({
							url: '/pages/profile/profile'
						});
					}
				}, 1500);
			}).catch(err => {
				uni.hideLoading();
				console.error('保存用户信息失败', err);
				uni.showToast({
					title: err.message || '保存失败，请重试',
					icon: 'none'
				});
			});
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
	height: 100%;
}

.page-container {
	display: flex;
	flex-direction: column;
	height: 100vh;
	animation: fadeIn 0.3s ease-out forwards;
}

@keyframes fadeIn {
	from {
		opacity: 0.8;
	}
	to {
		opacity: 1;
	}
}

/* 顶部标题栏样式 */
.page-header {
	background-color: #FFFFFF;
	padding: 20rpx 30rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	z-index: 10;
	position: relative;
}

.header-left {
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.header-left .iconfont {
	font-size: 36rpx;
	color: #333333;
}

.page-title {
	font-size: 36rpx;
	font-weight: 600;
	color: #333333;
	letter-spacing: 1rpx;
	flex: 1;
	text-align: center;
}

.header-right {
	width: 60rpx;
}

/* 内容区域样式 */
.content-section {
	flex: 1;
	padding: 20rpx;
	display: flex;
	flex-direction: column;
}

/* 内容标题栏样式 */
.content-header {
	padding: 24rpx 24rpx 16rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	position: relative;
	background-color: #FFFFFF;
	border-bottom: 1rpx solid #E2E8F0;
	margin-top: 16rpx;
	border-radius: 16rpx 16rpx 0 0;
	box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.03);
	box-sizing: border-box;
}

.content-header-left {
	display: flex;
	align-items: center;
}

.section-indicator {
	width: 4rpx;
	height: 28rpx;
	background: linear-gradient(to bottom, #3B82F6, #2563EB);
	border-radius: 2rpx;
	margin-right: 12rpx;
}

.list-title {
	font-size: 28rpx;
	color: #1E293B;
	font-weight: 600;
	letter-spacing: 0.5rpx;
}

/* 信息卡片样式 */
.info-card {
	background-color: #FFFFFF;
	border-radius: 0 0 16rpx 16rpx;
	overflow: hidden;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
	margin-bottom: 30rpx;
	border: 1rpx solid #E2E8F0;
	border-top: none;
}

.info-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 24rpx;
	border-bottom: 1rpx solid #F3F4F6;
}

.info-item:last-child {
	border-bottom: none;
}

.item-label {
	font-size: 28rpx;
	color: #4B5563;
	font-weight: 500;
}

.item-content {
	display: flex;
	align-items: center;
}

.item-value {
	font-size: 28rpx;
	color: #1F2937;
	text-align: right;
}

.avatar {
	width: 100rpx;
	height: 100rpx;
	border-radius: 50%;
	background-color: #F3F4F6;
	border: 2rpx solid #E5E7EB;
	box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.1);
	object-fit: cover;
	position: relative;
}

.edit-icon {
	position: absolute;
	right: 0;
	bottom: 0;
	width: 36rpx;
	height: 36rpx;
	background-color: #0D9488;
	color: white;
	border-radius: 50%;
	font-size: 20rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-left: 10rpx;
}

/* 按钮容器样式 */
.button-container {
	margin-top: 40rpx;
	padding: 0 20rpx;
}

/* 确认按钮样式 */
.app-confirm-btn {
	width: 100%;
	height: 90rpx;
	background: linear-gradient(135deg, #0D9488, #0F766E);
	color: #FFFFFF;
	border-radius: 45rpx;
	font-size: 32rpx;
	font-weight: 600;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 4rpx 12rpx rgba(13, 148, 136, 0.2);
	transition: all 0.3s ease;
	border: none;
}

.app-confirm-btn:active {
	transform: scale(0.98);
	box-shadow: 0 2rpx 8rpx rgba(13, 148, 136, 0.15);
}

/* 输入框样式 */
.app-input {
	text-align: right;
	height: 70rpx;
	font-size: 28rpx;
	color: #1F2937;
	min-width: 200rpx;
	background-color: transparent;
}
</style>