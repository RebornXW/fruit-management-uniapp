<template>
  <view class="profile-container">
    <!-- 头部：头像、名称、档口名、设置按钮 -->
    <view class="profile-header">
      <image :src="userData.avatar" class="avatar" />
      <view class="info">
        <text class="name">{{ userData.name }}</text>
        <text class="shop-name">{{ userData.shopName }}</text>
      </view>
      <view class="settings-btn" @tap="showSettings">
        <uni-icons type="settings" size="24" color="#000" />
      </view>
    </view>

    <!-- 主体内容占位 -->
    <view class="main-content">
      <text>欢迎来到个人中心</text>
    </view>

    <!-- 设置弹窗 -->
    <uni-popup ref="settingsPopup" type="bottom" :mask-closable="true">
      <view class="popup-option" @tap="() => navigateTo('/pages/profile/userInfo')">
        <text>个人信息</text>
      </view>
      <view class="popup-option" @tap="() => navigateTo('/pages/account-security/account-security')">
        <text>账号安全</text>
      </view>
      <view class="popup-option" @tap="() => showFunction('notifications')">
        <text>消息通知</text>
      </view>
      <view class="popup-option logout" @tap="handleLogout">
        <text>退出登录</text>
      </view>
    </uni-popup>

    <!-- 底部 TabBar -->
    <CustomTabBar />
  </view>
</template>

<script setup>
import { ref, reactive, onMounted, computed, onUnmounted } from 'vue';
import uniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue';
import uniPopup from '@dcloudio/uni-ui/lib/uni-popup/uni-popup.vue';
import CustomTabBar from '@/components/CustomTabBar.vue';
import http from '@/services/http.js';

const settingsPopup = ref(null);

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
const timeRangePopup = ref(null);
const salesRecordPopup = ref(null);
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

// 业务员列表
const staffList = ref([
  { id: 0, name: '全部业务员' },
  { id: 1, name: '李业务' },
  { id: 2, name: '王业务' },
  { id: 3, name: '张业务' }
]);
const staffIndex = ref(0);

// 报表类型
const reportTypes = ['日报', '周报', '月报'];
const reportTypeIndex = ref(0);

// 销售数据面板
const dashboardData = reactive({
  daily: {
    amount: '8,356',
    amountTrend: 12.5,
    volume: 156,
    volumeTrend: -8.2,
    customers: 56,
    customersTrend: -3.1
  },
  weekly: {
    amount: '58,420',
    amountTrend: 8.7,
    volume: 1024,
    volumeTrend: -5.3,
    customers: 128,
    customersTrend: -2.1
  },
  monthly: {
    amount: '246,850',
    amountTrend: 15.2,
    volume: 4268,
    volumeTrend: 11.5,
    customers: 320,
    customersTrend: 4.8
  }
});

// 热销水果排行
const topSales = ref([
  { name: '明牌阿克苏苹果', quantity: 52, amount: '2,860', image: 'https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?q=80&w=300' },
  { name: '砀山梨', quantity: 38, amount: '1,216', image: 'https://images.unsplash.com/photo-1594502184342-2349ffc9ead3?q=80&w=300' },
  { name: '新鲜橘子', quantity: 25, amount: '750', image: 'https://images.unsplash.com/photo-1519096989031-2aee4ffe17c6?q=80&w=300' }
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
  checkLoginStatus();
  loadUserInfo();

  // 监听页面显示事件
  uni.$on('onShow', checkLoginStatus);

  // 监听用户信息更新事件
  uni.$on('userInfoUpdated', loadUserInfo);
});

// 在组件卸载时移除监听器
onUnmounted(() => {
  uni.$off('onShow', checkLoginStatus);
  uni.$off('userInfoUpdated', loadUserInfo);
});

// 加载用户信息
function loadUserInfo() {
  // 从本地存储获取登录用户信息
  const loginUserInfo = uni.getStorageSync('loginUser');
  if (loginUserInfo) {
    userData.value = {
      name: loginUserInfo.name || '默认用户',
      shopName: loginUserInfo.storeName || '水果档口',
      avatar: loginUserInfo.avatar || '/static/default-avatar.png',
      role: loginUserInfo.role || '管理员',
      phone: loginUserInfo.phone || '',
      username: loginUserInfo.username || ''
    };
    console.log('已加载用户信息:', userData.value);
  } else {
    // 如果没有登录信息，跳转到登录页
    uni.redirectTo({
      url: '/pages/index/index'
    });
  }
}

// 检查登录状态函数
function checkLoginStatus() {
  const loginUserInfo = uni.getStorageSync('loginUser');
  if (!loginUserInfo) {
    uni.redirectTo({
      url: '/pages/index/index'
    });
  }
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

// 轮播切换
function onSwiperChange(e) {
  reportTypeIndex.value = e.detail.current;
  refreshDashboardData();
}

// 刷新面板数据
function refreshDashboardData() {
  // 这里可以根据选择的业务员和报表类型加载不同的数据
  uni.showToast({
    title: `${reportTypes[reportTypeIndex.value]}，${staffList.value[staffIndex.value].name}`,
    icon: 'none'
  });
  // 模拟数据刷新
  // 实际应用中应该调用API获取数据
}

// 获取当前选择的报表类型的数据
function getCurrentData() {
  const reportType = reportTypes[reportTypeIndex.value];
  if (reportType === '日报') {
    return dashboardData.value.daily;
  } else if (reportType === '周报') {
    return dashboardData.value.weekly;
  } else {
    return dashboardData.value.monthly;
  }
}

// 显示功能弹窗
function showFunction(type) {
  switch(type) {
    case 'operationRecord':
      currentFunction.value = {
        title: '操作记录',
        content: '这里将提供操作记录功能，包括库存操作、系统操作等各类操作的记录。'
      };
      break;
    case 'reconciliation':
      currentFunction.value = {
        title: '还没想好',
        content: 'XW还在苦思冥想中这里该放什么功能中。'
      };
      break;
  }

  functionPopup.value.open();
}

// 编辑个人信息
function editProfile() {
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
      editForm.value.avatar = res.tempFilePaths[0];
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

  // 更新用户数据
  userData.value.name = editForm.value.name;
  userData.value.shopName = editForm.value.shopName;
  userData.value.avatar = editForm.value.avatar;
  userData.value.phone = editForm.value.phone;

  // 更新本地存储
  try {
    // 获取当前登录用户信息
    const loginUserInfo = uni.getStorageSync('loginUser');
    if (loginUserInfo) {
      // 更新信息
      loginUserInfo.name = editForm.value.name;
      loginUserInfo.storeName = editForm.value.shopName;
      loginUserInfo.avatar = editForm.value.avatar;
      loginUserInfo.phone = editForm.value.phone;

      // 保存回本地存储
      uni.setStorageSync('loginUser', loginUserInfo);

      // 关闭弹窗
      closeEditProfile();

      // 显示成功提示
      uni.showToast({
        title: '保存成功',
        icon: 'success'
      });
    }
  } catch (e) {
    console.error('保存用户信息失败', e);
    uni.showToast({
      title: '保存失败，请重试',
      icon: 'none'
    });
  }
}

// 查看完整排行
function viewFullRanking() {
  currentFunction.value = {
    title: '热销水果排行榜',
    content: '这里将显示所有水果的销售排行信息。'
  };
  functionPopup.value.open();
}

// 显示设置
function showSettings() {
  settingsPopup.value.open();
}

// 关闭设置
function closeSettings() {
  settingsPopup.value.close();
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
      url: url
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

// 退出登录
async function handleLogout() {
  try {
    await http.request({ url: '/auth/logout', method: 'POST' });
    settingsPopup.value.close();
    uni.removeStorageSync('token');
    uni.removeStorageSync('loginUser');
    uni.showToast({ title: '退出成功', icon: 'success' });
    setTimeout(() => uni.redirectTo({ url: '/pages/index/index' }), 500);
  } catch (e) {
    console.error('登出失败', e);
    uni.showToast({ title: '退出失败', icon: 'none' });
  }
}
</script>

<style>
/* ... */
</style>