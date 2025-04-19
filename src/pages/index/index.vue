<template>
	<view class="container">
		<view class="login-header">
			<image class="logo" src="/static/logo.png" mode="aspectFit"></image>
			<text class="app-name">水果档口管理系统</text>
			<text class="app-slogan">高效管理 · 轻松销售</text>
		</view>
		
		<view class="login-form">
			<view class="form-item">
				<view class="input-label">
					<text class="fas fa-user"></text>
					<text>账号</text>
				</view>
				<input class="input" type="text" v-model="username" placeholder="请输入账号" />
			</view>
			
			<view class="form-item">
				<view class="input-label">
					<text class="fas fa-lock"></text>
					<text>密码</text>
				</view>
				<input class="input" type="password" v-model="password" placeholder="请输入密码" password />
			</view>
			
			<view class="remember-row">
				<label class="remember-pwd">
					<checkbox :checked="rememberPwd" @tap="rememberPwd = !rememberPwd" color="#0D9488" style="transform:scale(0.7)" />
					<text>记住密码</text>
				</label>
			</view>
			
			<button class="login-btn" @tap="handleLogin" :disabled="!username || !password">登录</button>
		</view>
		
		<view class="account-notice">
			<text>* 账号由管理员统一创建和分配</text>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import http from '../../services/http.js';

// 登录表单数据
const username = ref('');
const password = ref('');
const rememberPwd = ref(false);

// 从本地存储中获取保存的账号密码
onMounted(() => {
	try {
		const rememberedAccount = uni.getStorageSync('rememberedAccount');
		if (rememberedAccount) {
			username.value = rememberedAccount.username;
			password.value = rememberedAccount.password;
			rememberPwd.value = true;
		}
		
		// 检查是否已登录
		const loginUser = uni.getStorageSync('loginUser');
		if (loginUser) {
			// 已登录，直接跳转到主页
			setTimeout(() => {
				uni.switchTab({
					url: '/pages/profile/profile'
				});
			}, 100);
		}
	} catch (e) {
		console.error('读取存储数据失败', e);
	}
});

// 处理登录
async function handleLogin() {
	if (!username.value || !password.value) {
		uni.showToast({ title: '请输入账号和密码', icon: 'none' });
		return;
	}

	try {
		const data = await http.request({ url: '/auth/login', method: 'POST', data: { username: username.value, password: password.value } });
		const { token, user } = data;
		uni.setStorageSync('token', token);
		uni.setStorageSync('loginUser', user);
		if (rememberPwd.value) {
			uni.setStorageSync('rememberedAccount', { username: username.value, password: password.value });
		} else {
			uni.removeStorageSync('rememberedAccount');
		}
		uni.showToast({ title: '登录成功', icon: 'success', duration: 1500, success: () => {
			setTimeout(() => uni.switchTab({ url: '/pages/profile/profile' }), 1500);
		}});
	} catch (err) {
		console.error('登录失败', err);
		uni.showToast({ title: err.message || '登录失败，请重试', icon: 'none' });
	}
}
</script>

<style>
.container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 100vh;
	background-color: #f8f8f8;
	padding: 40rpx;
}

.login-header {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-bottom: 60rpx;
}

.logo {
	width: 160rpx;
	height: 160rpx;
	margin-bottom: 30rpx;
}

.app-name {
	font-size: 48rpx;
	font-weight: bold;
	color: #0D9488;
	margin-bottom: 20rpx;
}

.app-slogan {
	font-size: 28rpx;
	color: #6B7280;
}

.login-form {
	width: 100%;
	background-color: #fff;
	border-radius: 24rpx;
	padding: 40rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
	margin-bottom: 40rpx;
}

.form-item {
	margin-bottom: 30rpx;
}

.input-label {
	display: flex;
	align-items: center;
	margin-bottom: 16rpx;
	font-size: 28rpx;
	color: #4B5563;
}

.input-label .fas {
	margin-right: 10rpx;
	color: #0D9488;
}

.input {
	width: 100%;
	height: 80rpx;
	border: 1px solid #E5E7EB;
	border-radius: 12rpx;
	padding: 0 20rpx;
	font-size: 28rpx;
	background-color: #F9FAFB;
}

.remember-row {
	display: flex;
	justify-content: space-between;
	margin-bottom: 40rpx;
}

.remember-pwd {
	display: flex;
	align-items: center;
	font-size: 24rpx;
	color: #6B7280;
}

.login-btn {
	width: 100%;
	height: 88rpx;
	background-color: #0D9488;
	color: #fff;
	border-radius: 12rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 32rpx;
	font-weight: 500;
	border: none;
}

.login-btn:active {
	background-color: #0F766E;
}

.login-btn[disabled] {
	background-color: #9CA3AF;
	color: #F3F4F6;
}

.account-notice {
	font-size: 24rpx;
	color: #9CA3AF;
	text-align: center;
	margin-top: 20rpx;
}
</style>
