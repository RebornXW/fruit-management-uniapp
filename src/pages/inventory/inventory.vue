<template>
	<view class="inventory-container">
		<!-- 头部 -->
		<view class="header bg-teal-600 text-white p-4">
			<view class="flex justify-between items-center">
				<text class="text-xl font-bold">库存管理</text>
				<view class="flex items-center space-x-3">
					<text class="text-sm font-medium">
						<text class="mr-1"></text>
						<text>{{currentDate}}</text>
					</text>
					<text class="iconfont icon-more"></text>
				</view>
			</view>
			
			<!-- 搜索框 -->
			<view class="mt-4 relative">
				<input v-model="searchText" type="text" placeholder="搜索库存水果" class="w-full p-2 pl-10 rounded-full text-gray-900 text-sm" />
				<text class="iconfont icon-search absolute left-4 top-3 text-gray-400"></text>
			</view>
		</view>
		
		<!-- 库存数据统计 -->
		<view class="bg-white p-4 shadow-sm">
			<view class="grid grid-cols-3 gap-4">
				<view class="text-center">
					<text class="text-xs text-gray-500">当前库存总量</text>
					<text class="text-xl font-bold text-teal-600 block">{{totalStock}}箱</text>
				</view>
				<view class="text-center">
					<text class="text-xs text-gray-500">今日入库</text>
					<text class="text-xl font-bold text-green-600 block">+{{todayIn}}箱</text>
				</view>
				<view class="text-center">
					<text class="text-xs text-gray-500">今日出库</text>
					<text class="text-xl font-bold text-red-600 block">-{{todayOut}}箱</text>
				</view>
			</view>
		</view>
		
		<!-- 新增水果按钮 -->
		<view class="px-4 py-3 bg-white border-b border-gray-200">
			<button class="bg-teal-600 text-white w-full py-2 rounded-lg font-medium flex items-center justify-center" @tap="showAddFruit">
				<text class="iconfont icon-add mr-2"></text>
				<text>新增水果</text>
			</button>
		</view>
		
		<!-- 内容区 - 库存列表 -->
		<scroll-view scroll-y class="flex-1 overflow-y-auto">
			<view class="px-4 py-2">
				<text class="text-sm font-medium text-gray-500">库存水果列表</text>
			</view>
			
			<view class="space-y-3 px-4 pb-4">
				<!-- 水果列表 -->
				<view 
					v-for="fruit in filteredFruits" 
					:key="fruit.id"
					class="bg-white rounded-lg overflow-hidden shadow-sm"
				>
					<view class="flex p-3">
						<view class="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
							<image :src="fruit.image" :alt="fruit.name" class="w-full h-full object-cover"></image>
						</view>
						<view class="ml-3 flex-1">
							<text class="font-bold">{{fruit.name}}</text>
							<text class="text-xs text-gray-500 mt-1 block">{{fruit.spec}}</text>
							<view class="mt-1 flex items-center">
								<text class="text-xs bg-teal-100 text-teal-600 px-2 py-1 rounded-full">
									库存: {{fruit.stock}}箱
								</text>
							</view>
						</view>
					</view>
					<view class="flex border-t border-gray-100">
						<button class="flex-1 py-2 text-sm text-center text-green-600 border-r border-gray-100" @tap="showInventoryOperation('in', fruit)">
							<text class="iconfont icon-arrow-down mr-1"></text> 入库
						</button>
						<button class="flex-1 py-2 text-sm text-center text-red-600 border-r border-gray-100" @tap="showInventoryOperation('out', fruit)">
							<text class="iconfont icon-arrow-up mr-1"></text> 出库
						</button>
						<button class="flex-1 py-2 text-sm text-center text-blue-600 border-r border-gray-100" @tap="showEditFruit(fruit)">
							<text class="iconfont icon-edit mr-1"></text> 编辑
						</button>
						<button class="flex-1 py-2 text-sm text-center text-gray-600" @tap="confirmDelete(fruit)">
							<text class="iconfont icon-delete mr-1"></text> 删除
						</button>
					</view>
				</view>
			</view>
		</scroll-view>
		
		<!-- 入库/出库操作弹窗 -->
		<uni-popup ref="inventoryPopup" type="bottom">
			<view class="bg-white rounded-t-xl w-full p-4">
				<view class="flex justify-between items-center mb-4">
					<text class="text-lg font-bold">{{operationType === 'in' ? '入库操作' : '出库操作'}}</text>
					<text class="text-gray-500" @tap="closePopup('inventory')">✕</text>
				</view>
				<view class="space-y-4">
					<view class="p-3 bg-gray-50 rounded-lg">
						<text class="font-medium">{{currentFruit.name}}</text>
						<text class="text-sm text-gray-500 block">{{currentFruit.spec}}</text>
						<view class="mt-2 flex">
							<text class="text-xs bg-teal-100 text-teal-600 px-2 py-1 rounded-full">
								当前库存: {{currentFruit.stock}}箱
							</text>
						</view>
					</view>
					<view>
						<text class="block text-sm font-medium text-gray-700 mb-2">操作数量 (箱)</text>
						<view class="flex border border-gray-300 rounded-lg">
							<button class="px-4 py-2 text-gray-700" @tap="decrementQuantity">-</button>
							<input 
								type="number" 
								v-model="operationQuantity" 
								class="flex-1 text-center py-2"
								:style="{ color: operationType === 'in' ? '#047857' : '#DC2626' }"
							/>
							<button class="px-4 py-2 text-gray-700" @tap="incrementQuantity">+</button>
						</view>
					</view>
					<view>
						<text class="block text-sm font-medium text-gray-700 mb-2">备注</text>
						<textarea v-model="operationRemark" placeholder="添加备注信息" class="w-full border border-gray-300 rounded-lg p-2 h-20"></textarea>
					</view>
					<button 
						:class="[
							'w-full py-3 rounded-lg font-medium text-white',
							operationType === 'in' ? 'bg-green-600' : 'bg-red-600'
						]"
						@tap="confirmOperation"
					>
						确认{{operationType === 'in' ? '入库' : '出库'}}
					</button>
				</view>
			</view>
		</uni-popup>
		
		<!-- 编辑水果弹窗 -->
		<uni-popup ref="editFruitPopup" type="bottom">
			<view class="bg-white rounded-t-xl w-full p-4">
				<view class="flex justify-between items-center mb-4">
					<text class="text-lg font-bold">{{isAddingFruit ? '新增水果' : '编辑水果'}}</text>
					<text class="text-gray-500" @tap="closePopup('edit')">✕</text>
				</view>
				<view class="space-y-4">
					<view>
						<text class="block text-sm font-medium text-gray-700 mb-2">水果名称</text>
						<input v-model="editForm.name" placeholder="请输入水果名称" class="w-full border border-gray-300 rounded-lg p-2" />
					</view>
					<view>
						<text class="block text-sm font-medium text-gray-700 mb-2">规格型号</text>
						<input v-model="editForm.spec" placeholder="请输入规格型号" class="w-full border border-gray-300 rounded-lg p-2" />
					</view>
					<view v-if="isAddingFruit">
						<text class="block text-sm font-medium text-gray-700 mb-2">初始库存 (箱)</text>
						<input type="number" v-model="editForm.stock" placeholder="请输入初始库存" class="w-full border border-gray-300 rounded-lg p-2" />
					</view>
					<view>
						<text class="block text-sm font-medium text-gray-700 mb-2">图片链接</text>
						<input v-model="editForm.image" placeholder="请输入图片链接" class="w-full border border-gray-300 rounded-lg p-2" />
					</view>
					<button class="w-full bg-teal-600 text-white py-3 rounded-lg font-medium" @tap="confirmEditFruit">
						确认{{isAddingFruit ? '添加' : '编辑'}}
					</button>
				</view>
			</view>
		</uni-popup>
		
		<!-- 删除确认弹窗 -->
		<uni-popup ref="deletePopup" type="dialog">
			<uni-popup-dialog
				:type="'warning'"
				:title="'删除确认'"
				:content="'确定要删除' + currentFruit.name + '吗？'"
				:before-close="true"
				@confirm="confirmDeleteFruit"
				@close="closePopup('delete')"
			></uni-popup-dialog>
		</uni-popup>
		
		<!-- 底部TabBar -->
		<custom-tab-bar></custom-tab-bar>
	</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import CustomTabBar from '@/components/CustomTabBar.vue';

// 数据
const searchText = ref('');
const fruitData = ref([]);
const currentFruit = ref({});
const operationType = ref('in'); // 'in' 或 'out'
const operationQuantity = ref(1);
const operationRemark = ref('');
const currentDate = ref('');
const editForm = ref({
	id: null,
	name: '',
	spec: '',
	stock: 0,
	image: ''
});
const isAddingFruit = ref(false);
const todayIn = ref(12);
const todayOut = ref(8);

// 计算总库存
const totalStock = computed(() => {
	return fruitData.value.reduce((total, fruit) => total + fruit.stock, 0);
});

// 过滤后的水果数据
const filteredFruits = computed(() => {
	if (!searchText.value) return fruitData.value;
	
	return fruitData.value.filter(fruit => 
		fruit.name.includes(searchText.value) || 
		fruit.spec.includes(searchText.value)
	);
});

// 获取弹窗组件引用
const inventoryPopup = ref(null);
const editFruitPopup = ref(null);
const deletePopup = ref(null);

// 显示入库/出库操作弹窗
function showInventoryOperation(type, fruit) {
	operationType.value = type;
	currentFruit.value = fruit;
	operationQuantity.value = 1;
	operationRemark.value = '';
	inventoryPopup.value.open();
}

// 显示编辑水果弹窗
function showEditFruit(fruit) {
	isAddingFruit.value = false;
	currentFruit.value = fruit;
	editForm.value = {
		id: fruit.id,
		name: fruit.name,
		spec: fruit.spec,
		stock: fruit.stock,
		image: fruit.image
	};
	editFruitPopup.value.open();
}

// 显示新增水果弹窗
function showAddFruit() {
	isAddingFruit.value = true;
	editForm.value = {
		id: null,
		name: '',
		spec: '',
		stock: 0,
		image: ''
	};
	editFruitPopup.value.open();
}

// 显示删除确认弹窗
function confirmDelete(fruit) {
	currentFruit.value = fruit;
	deletePopup.value.open();
}

// 关闭弹窗
function closePopup(type) {
	if (type === 'inventory') {
		inventoryPopup.value.close();
	} else if (type === 'edit') {
		editFruitPopup.value.close();
	} else if (type === 'delete') {
		deletePopup.value.close();
	}
}

// 减少操作数量
function decrementQuantity() {
	if (operationQuantity.value > 1) {
		operationQuantity.value--;
	}
}

// 增加操作数量
function incrementQuantity() {
	operationQuantity.value++;
}

// 确认入库/出库操作
function confirmOperation() {
	const index = fruitData.value.findIndex(f => f.id === currentFruit.value.id);
	if (index !== -1) {
		if (operationType.value === 'in') {
			// 入库操作
			fruitData.value[index].stock += parseInt(operationQuantity.value);
			todayIn.value += parseInt(operationQuantity.value);
		} else {
			// 出库操作
			if (fruitData.value[index].stock >= operationQuantity.value) {
				fruitData.value[index].stock -= parseInt(operationQuantity.value);
				todayOut.value += parseInt(operationQuantity.value);
			} else {
				uni.showToast({
					title: '库存不足',
					icon: 'none'
				});
				return;
			}
		}
		
		// 在实际应用中，这里应该调用API保存数据和操作记录
		uni.showToast({
			title: operationType.value === 'in' ? '入库成功' : '出库成功',
			icon: 'success'
		});
		closePopup('inventory');
	}
}

// 确认编辑/新增水果
function confirmEditFruit() {
	// 表单验证
	if (!editForm.value.name || !editForm.value.spec) {
		uni.showToast({
			title: '请填写完整信息',
			icon: 'none'
		});
		return;
	}
	
	if (isAddingFruit.value) {
		// 新增水果
		const newId = fruitData.value.length > 0 ? Math.max(...fruitData.value.map(f => f.id)) + 1 : 1;
		const newFruit = {
			id: newId,
			name: editForm.value.name,
			spec: editForm.value.spec,
			stock: parseInt(editForm.value.stock) || 0,
			image: editForm.value.image || 'https://via.placeholder.com/300',
			minPrice: 0,
			maxPrice: 0
		};
		fruitData.value.push(newFruit);
	} else {
		// 编辑水果
		const index = fruitData.value.findIndex(f => f.id === editForm.value.id);
		if (index !== -1) {
			fruitData.value[index].name = editForm.value.name;
			fruitData.value[index].spec = editForm.value.spec;
			fruitData.value[index].image = editForm.value.image;
		}
	}
	
	// 在实际应用中，这里应该调用API保存数据
	uni.showToast({
		title: isAddingFruit.value ? '添加成功' : '编辑成功',
		icon: 'success'
	});
	closePopup('edit');
}

// 确认删除水果
function confirmDeleteFruit() {
	const index = fruitData.value.findIndex(f => f.id === currentFruit.value.id);
	if (index !== -1) {
		fruitData.value.splice(index, 1);
		
		// 在实际应用中，这里应该调用API删除数据
		uni.showToast({
			title: '删除成功',
			icon: 'success'
		});
	}
	closePopup('delete');
}

// 页面加载时获取数据
onMounted(() => {
	// 设置当前日期
	const now = new Date();
	currentDate.value = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
	
	// 加载水果数据
	loadFruitData();
});

// 加载水果数据
function loadFruitData() {
	// 模拟从服务器获取数据
	// 实际应用中，这里应该是API调用
	fruitData.value = [
		{ id: 1, name: "明牌阿克苏苹果", spec: "85#光果13斤箱装", stock: 35, minPrice: 50, maxPrice: 60, image: "https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?q=80&w=300" },
		{ id: 2, name: "红富士苹果", spec: "80#12斤纸箱装", stock: 42, minPrice: 45, maxPrice: 55, image: "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab12?q=80&w=300" },
		{ id: 3, name: "砀山梨", spec: "优级10斤装", stock: 28, minPrice: 30, maxPrice: 35, image: "https://images.unsplash.com/photo-1594502184342-2349ffc9ead3?q=80&w=300" },
		{ id: 4, name: "新鲜橘子", spec: "5斤精品袋装", stock: 15, minPrice: 25, maxPrice: 30, image: "https://images.unsplash.com/photo-1519096989031-2aee4ffe17c6?q=80&w=300" }
	];
}
</script>

<style>
.inventory-container {
	display: flex;
	flex-direction: column;
	height: 100vh;
	padding-bottom: 100rpx; /* 为底部导航栏留出空间 */
}

.header {
	background-color: #0D9488;
}

.bg-teal-600 {
	background-color: #0D9488;
}

.text-teal-600 {
	color: #0D9488;
}

.bg-teal-100 {
	background-color: #E6FFFA;
}

.text-green-600 {
	color: #047857;
}

.text-red-600 {
	color: #DC2626;
}

.text-blue-600 {
	color: #2563EB;
}

.bg-green-600 {
	background-color: #047857;
}

.bg-red-600 {
	background-color: #DC2626;
}

.grid {
	display: flex;
}

.grid-cols-3 {
	flex-wrap: wrap;
}

.grid-cols-3 > view {
	width: 33.333333%;
}

.space-y-3 > view:not(:first-child),
.space-y-4 > view:not(:first-child) {
	margin-top: 1rem;
}
</style> 