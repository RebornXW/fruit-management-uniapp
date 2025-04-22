<template>
	<view class="user-info-container">
		<!-- 头部导航栏 -->
		<view class="header">
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
						<uni-icons type="camera-filled" size="20" color="#0D9488"></uni-icons>
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
				<button class="save-btn" @tap="saveUserInfo">保存修改</button>
			</view>
		</view>
	</view>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';
import uniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue';
import { getUserProfile, updateUserProfile, uploadAvatar } from '@/services/authService.js';

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
			// 显示加载中
			uni.showLoading({ title: '加载中...' });
			getUserInfo();
		});

		// 获取用户信息
		const getUserInfo = () => {
			getUserProfile().then(res => {
				userInfo.value = {
					name: res.name || '默认用户',
					shopName: res.storeName || '水果档口',
					avatar: res.avatar || '/static/default-avatar.png',
					role: res.role || '管理员',
					phone: res.phone || '',
					username: res.username || 'admin'
				};
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

			// 准备要提交的数据
			const profileData = {
				name: userInfo.value.name,
				phone: userInfo.value.phone
			};

			// 如果头像发生了变化且是本地文件路径
			if (userInfo.value.avatar && userInfo.value.avatar.startsWith('file://')) {
				// 显示上传中提示
				uni.showLoading({ title: '正在上传头像...' });

				// 上传头像
				uploadAvatar(userInfo.value.avatar).then(res => {
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
		};

		// 提交个人信息到API
		const submitProfileData = (profileData) => {
			uni.showLoading({ title: '正在保存...' });

			updateUserProfile(profileData).then(() => {
				uni.hideLoading();

				// 通知个人中心页面刷新
				uni.$emit('userInfoUpdated');

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
	background-color: #F9FAFB;
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
	height: 100rpx;
	display: flex;
	align-items: center;
	background: linear-gradient(135deg, #0D9488 0%, #0F766E 100%);
	box-shadow: 0 4rpx 12rpx rgba(13, 148, 136, 0.2);
	z-index: 10;
}

.back-icon {
	padding: 10rpx 20rpx 10rpx 0;
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
	background-color: rgba(255, 255, 255, 0.15);
	transition: all 0.3s ease;
}

.back-icon:active {
	background-color: rgba(255, 255, 255, 0.25);
	transform: scale(0.92);
}

.title {
	font-size: 36rpx;
	font-weight: 600;
	color: #FFFFFF;
	flex: 1;
	text-align: center;
	margin-right: 60rpx; /* 为了居中，抵消返回按钮的宽度 */
	letter-spacing: 1rpx;
	text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.content-container {
	flex: 1;
	padding: 30rpx;
	overflow-y: auto;
	display: flex;
	flex-direction: column;
	position: relative;
	margin-top: -20rpx;
}

.info-list {
	background-color: #FFFFFF;
	border-radius: 24rpx;
	overflow: hidden;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
	margin-bottom: 40rpx;
	position: relative;
	z-index: 5;
	border: 1rpx solid rgba(229, 231, 235, 0.8);
}

.info-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 32rpx 36rpx;
	border-bottom: 1rpx solid #F3F4F6;
	transition: all 0.3s ease;
}

.info-item:active {
	background-color: #F9FAFB;
}

.info-list .info-item:last-child {
	border-bottom: none;
}

.item-label {
	font-size: 32rpx;
	color: #374151;
	font-weight: 600;
	letter-spacing: 0.5rpx;
}

.item-content {
	display: flex;
	align-items: center;
}

.item-value {
	font-size: 32rpx;
	color: #111827;
	font-weight: 500;
	margin-right: 16rpx;
	letter-spacing: 0.5rpx;
}

.avatar {
	width: 120rpx;
	height: 120rpx;
	border-radius: 50%;
	margin-right: 24rpx;
	background-color: #F3F4F6;
	border: 6rpx solid #FFFFFF;
	box-shadow: 0 8rpx 20rpx rgba(13, 148, 136, 0.15);
	transition: all 0.3s ease;
	object-fit: cover;
}

.form-input {
	text-align: right;
	height: 70rpx;
	font-size: 32rpx;
	font-weight: 500;
	color: #111827;
	padding: 0 10rpx;
	min-width: 200rpx;
	background-color: transparent;
	transition: all 0.3s ease;
}

.form-input:focus {
	background-color: #F9FAFB;
	border-radius: 8rpx;
}

.save-btn-container {
	margin-top: auto;
	padding: 40rpx 0;
}

.save-btn {
	width: 90%;
	height: 100rpx;
	margin: 0 auto;
	background: linear-gradient(135deg, #10B981 0%, #0D9488 100%);
	color: #FFFFFF;
	border-radius: 50rpx;
	font-size: 34rpx;
	font-weight: 600;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 8rpx 20rpx rgba(13, 148, 136, 0.25);
	transition: all 0.3s ease;
	letter-spacing: 2rpx;
}

.save-btn:active {
	opacity: 0.9;
	transform: scale(0.96);
	background: linear-gradient(135deg, #0D9488 0%, #0F766E 100%);
	box-shadow: 0 4rpx 10rpx rgba(13, 148, 136, 0.2);
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