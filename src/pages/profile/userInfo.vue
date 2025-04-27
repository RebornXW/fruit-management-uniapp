<template>
	<view class="page-container">
		<!-- 顶部白色栏 - 为状态栏和前置摄像头预留空间 -->
		<view class="page-header">
			<view class="header-left" @tap="goBack">
				<text class="iconfont icon-left"></text>
			</view>
			<!-- 保留白色标题栏，但不显示标题文字 -->
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
					</view>
				</view>

				<!-- 姓名 -->
				<view class="info-item">
					<text class="item-label">姓名</text>
					<view class="item-content">
						<input type="text" v-model="userInfo.name" placeholder="请输入姓名" class="app-input" />
					</view>
				</view>

				<!-- 联系方式 -->
				<view class="info-item">
					<text class="item-label">联系方式</text>
					<view class="item-content">
						<input type="text" v-model="userInfo.phone" placeholder="请输入联系方式" class="app-input" maxlength="11" />
					</view>
				</view>

				<!-- 档口名称(只读) -->
				<view class="info-item">
					<text class="item-label">档口名称</text>
					<view class="item-content">
						<text class="item-value">{{userInfo.stallName}}</text>
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

			<!-- 底部按钮区域 -->
			<view class="footer">
				<view class="button-container">
					<button class="app-confirm-btn" @tap="saveUserInfo">保存修改</button>
					<button class="app-logout-btn" @tap="handleLogout">退出登录</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { ref, onMounted } from 'vue';
import { getUserProfile, updateUserProfile, logout } from '@/services/authService.js';
import { uploadAvatar } from '@/services/uploadService.js';
import http from '@/services/http.js';

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
				console.log('获取到的用户信息:', res);

				// 保存原始头像URL，用于后续比较
				// 确保头像URL是完整的URL
				let avatarUrl = res.avatar || '/static/default-avatar.png';

				// 如果头像URL是相对路径，转换为完整URL
				if (avatarUrl && !avatarUrl.startsWith('http') && !avatarUrl.startsWith('/static')) {
					// 假设后端返回的是相对路径，需要拼接基础URL
					const baseUrl = http.BASE_URL.split('/api')[0]; // 获取API基础URL
					avatarUrl = baseUrl + avatarUrl;
				}

				console.log('处理后的头像URL:', avatarUrl);

				userInfo.value = {
					name: res.name || '默认用户',
					stallName: res.stall_name || '水果档口',
					avatar: avatarUrl,
					originalAvatar: avatarUrl, // 保存原始头像URL
					role: res.role || '管理员',
					phone: res.phone || '',
					username: res.username || 'admin',
					id: res.id
				};
				console.log('设置用户信息成功:', userInfo.value);
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
			console.log('开始选择头像');
			uni.chooseImage({
				count: 1,
				sizeType: ['compressed'],
				sourceType: ['album', 'camera'],
				success: (res) => {
					console.log('选择头像成功，完整返回结果:', res);

					// 直接使用临时路径
					const avatarPath = res.tempFilePaths[0];
					userInfo.value.avatar = avatarPath;
					console.log('设置头像路径:', avatarPath);
					console.log('头像路径类型:', typeof avatarPath);
					console.log('头像路径是否为Blob URL:', avatarPath.startsWith('blob:'));

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

			// 获取原始头像URL（从getUserInfo获取的数据）
			const originalAvatar = userInfo.value.originalAvatar || '';
			console.log('原始头像路径:', originalAvatar);

			// 准备要提交的数据，使用下划线命名法
			const profileData = {
				name: userInfo.value.name,
				phone: userInfo.value.phone,
				stall_name: userInfo.value.stallName
			};

			// 如果头像发生了变化且是本地文件路径或Blob URL
			// 添加日志输出头像路径
			console.log('当前头像路径:', userInfo.value.avatar);

			// 检查是否是新选择的头像（需要上传）
			const isNewAvatar = userInfo.value.avatar && (
				// 本地文件路径格式
				userInfo.value.avatar.startsWith('file://') ||
				userInfo.value.avatar.startsWith('http://tmp') ||
				userInfo.value.avatar.startsWith('/storage/') ||
				userInfo.value.avatar.startsWith('/var/mobile/') ||
				userInfo.value.avatar.indexOf('://') === -1 || // 如果路径中不包含协议部分，可能是本地路径

				// Blob URL格式 (Web环境)
				userInfo.value.avatar.startsWith('blob:') ||

				// 检查是否与原始头像不同（避免重复上传）
				(typeof originalAvatar === 'string' && userInfo.value.avatar !== originalAvatar)
			);

			console.log('是否需要上传新头像:', isNewAvatar);

			if (isNewAvatar) {
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
				// 如果头像没有变化，也将当前头像URL添加到要提交的数据中
				profileData.avatar = userInfo.value.avatar;
				// 提交个人信息
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
				// 处理头像URL，确保是完整URL
				let avatarUrl = res.avatar || userInfo.value.avatar;

				// 如果头像URL是相对路径，转换为完整URL
				if (avatarUrl && !avatarUrl.startsWith('http') && !avatarUrl.startsWith('/static')) {
					// 假设后端返回的是相对路径，需要拼接基础URL
					const baseUrl = http.BASE_URL.split('/api')[0]; // 获取API基础URL
					avatarUrl = baseUrl + avatarUrl;
				}

				console.log('保存后的头像URL:', avatarUrl);

				userInfo.value = {
					...userInfo.value,
					name: res.name || userInfo.value.name,
					phone: res.phone || userInfo.value.phone,
					stallName: res.stall_name || userInfo.value.stallName,
					avatar: avatarUrl,
					originalAvatar: avatarUrl // 更新原始头像URL
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

		// 退出登录
		const handleLogout = () => {
			// 显示确认对话框
			uni.showModal({
				title: '确认退出',
				content: '确定要退出登录吗？',
				confirmColor: '#EF4444',
				success: (res) => {
					if (res.confirm) {
						// 显示加载中
						uni.showLoading({ title: '正在退出...' });

						// 调用退出登录API
						logout().then(() => {
							uni.hideLoading();

							// 清除本地存储的登录信息
							uni.removeStorageSync('token');
							uni.removeStorageSync('loginUser');

							// 显示成功提示
							uni.showToast({
								title: '已退出登录',
								icon: 'success',
								duration: 1500
							});

							// 延迟一下再跳转，让用户看到成功提示
							setTimeout(() => {
								// 跳转到登录页
								uni.reLaunch({
									url: '/pages/index/index'
								});
							}, 1500);
						}).catch(err => {
							uni.hideLoading();
							console.error('退出登录失败', err);

							// 显示错误提示
							uni.showToast({
								title: '退出失败，请重试',
								icon: 'none'
							});
						});
					}
				}
			});
		};

		return {
			userInfo,
			goBack,
			editAvatar,
			saveUserInfo,
			handleLogout
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
	padding: 0 20rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	z-index: 10;
	position: relative;
	height: 30px; /* 与全局样式保持一致 */
}

.header-left {
	width: 40rpx;
	height: 30px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.header-left .iconfont {
	font-size: 32rpx;
	color: #333333;
}

.page-title {
	display: none; /* 隐藏标题文本 */
}

.header-right {
	width: 40rpx;
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
	position: relative; /* 添加相对定位，作为编辑图标的定位父元素 */
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
}



/* 底部区域样式 */
.footer {
	margin-top: auto;
	padding: 30rpx 0;
}

/* 按钮容器样式 */
.button-container {
	padding: 0 20rpx;
	display: flex;
	flex-direction: column;
	gap: 30rpx;
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

/* 退出登录按钮样式 */
.app-logout-btn {
	width: 100%;
	height: 90rpx;
	background: #FFFFFF;
	color: #EF4444;
	border: 1rpx solid #EF4444;
	border-radius: 45rpx;
	font-size: 32rpx;
	font-weight: 600;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.3s ease;
}

.app-logout-btn:active {
	transform: scale(0.98);
	background-color: #FEF2F2;
}

/* 个人信息页面特定的输入框样式 */
.info-item .app-input {
	text-align: right;
	height: 70rpx;
	font-size: 28rpx;
	color: #1F2937;
	min-width: 200rpx;
	background-color: transparent;
}
</style>