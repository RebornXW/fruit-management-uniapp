<template>
  <view class="custom-nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
    <!-- 背景层 -->
    <view class="nav-bar-bg"></view>

    <!-- 内容层 -->
    <view class="nav-bar-content">
      <!-- 左侧区域 - 返回按钮 -->
      <view class="nav-bar-left" v-if="showBack" @tap="goBack">
        <text class="nav-bar-back-icon iconfont icon-left"></text>
      </view>

      <!-- 中间区域 - 标题 (如果需要) -->
      <view class="nav-bar-center" v-if="showTitle">
        <text class="nav-bar-title">{{ title }}</text>
      </view>

      <!-- 右侧区域 - 插槽 -->
      <view class="nav-bar-right">
        <slot name="right"></slot>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// 定义组件属性
const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  showBack: {
    type: Boolean,
    default: false
  },
  showTitle: {
    type: Boolean,
    default: false
  }
});

// 状态栏高度
const statusBarHeight = ref(20);

// 返回上一页
const goBack = () => {
  // 检查页面栈
  const pages = getCurrentPages();

  // 如果有上一页，则返回上一页
  if (pages.length > 1) {
    uni.navigateBack();
  } else {
    // 如果没有上一页，则跳转到首页
    uni.switchTab({
      url: '/pages/profile/profile'
    });
  }
};

// 获取状态栏高度
onMounted(() => {
  try {
    const systemInfo = uni.getSystemInfoSync();
    statusBarHeight.value = systemInfo.statusBarHeight;
  } catch (e) {
    console.error('获取系统信息失败', e);
  }
});
</script>

<style>
.custom-nav-bar {
  position: relative;
  width: 100%;
  z-index: 100;
}

.nav-bar-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  z-index: -1;
  border-bottom: 0.5px solid rgba(0, 0, 0, 0.05);
}

.nav-bar-content {
  display: flex;
  align-items: center;
  height: 44px;
  padding: 0 16px;
}

.nav-bar-left {
  flex: 1;
  display: flex;
  align-items: center;
}

.nav-bar-back-icon {
  font-size: 18px;
  color: #333;
  padding: 8px;
  margin-left: -8px;
  opacity: 0.8;
}

.nav-bar-center {
  flex: 2;
  text-align: center;
}

.nav-bar-title {
  font-size: 17px;
  font-weight: 500;
  color: #333;
  opacity: 0.85;
  letter-spacing: 0.5px;
}

.nav-bar-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

/* 图标映射 */
.icon-left:before {
  content: "\f104";
}
</style>
