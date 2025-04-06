<script>
export default {
  onLaunch: function () {
    console.log('App Launch')
  },
  onShow: function () {
    console.log('App Show')
  },
  onHide: function () {
    console.log('App Hide')
  },
}
</script>

<style>
/*每个页面公共css */
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css');

page {
	font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
	background-color: #F5F5F5;
	height: 100%;
}

/* iconfont样式 */
.iconfont {
  font-family: "FontAwesome" !important;
  font-size: 16px;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 图标映射 */
.icon-search:before {
  content: "\f002";
}

.icon-more:before {
  content: "\f142";
}

.icon-arrow-up:before {
  content: "\f062";
}

.icon-arrow-down:before {
  content: "\f063";
}

.icon-minus:before {
  content: "\f068";
}

.icon-plus:before {
  content: "\f067";
}

.icon-file:before {
  content: "\f15b";
}

.icon-calendar:before {
  content: "\f133";
}

.icon-right:before {
  content: "\f054";
}

.icon-down:before {
  content: "\f078";
}

.icon-setting:before {
  content: "\f013";
}

.icon-edit:before {
  content: "\f304";
}

.icon-delete:before {
  content: "\f1f8";
}

.icon-check:before {
  content: "\f00c";
}

.icon-add:before {
  content: "\f067";
}

.icon-exchange:before {
  content: "\f362";
}

.icon-chart:before {
  content: "\f080";
}

.icon-users:before {
  content: "\f0c0";
}

.icon-logout:before {
  content: "\f2f5";
}

.icon-close:before {
  content: "\f00d";
}

/* 通用样式 */
.flex {
	display: flex;
}

.items-center {
	align-items: center;
}

.justify-center {
	justify-content: center;
}

.justify-between {
	justify-content: space-between;
}

.flex-1 {
	flex: 1;
}

.flex-shrink-0 {
	flex-shrink: 0;
}

.text-center {
	text-align: center;
}

.text-right {
	text-align: right;
}

.font-bold {
	font-weight: bold;
}

.font-medium {
	font-weight: 500;
}

.text-xs {
	font-size: 12px;
}

.text-sm {
	font-size: 14px;
}

.text-base {
	font-size: 16px;
}

.text-lg {
	font-size: 18px;
}

.text-xl {
	font-size: 20px;
}

.rounded-lg {
	border-radius: 8px;
}

.rounded-full {
	border-radius: 999px;
}

.rounded-xl {
	border-radius: 12px;
}

.rounded-t-xl {
	border-top-left-radius: 12px;
	border-top-right-radius: 12px;
}

.mb-1 {
	margin-bottom: 4px;
}

.mb-2 {
	margin-bottom: 8px;
}

.mb-3 {
	margin-bottom: 12px;
}

.mb-4 {
	margin-bottom: 16px;
}

.mr-1 {
	margin-right: 4px;
}

.mr-2 {
	margin-right: 8px;
}

.mr-3 {
	margin-right: 12px;
}

.mr-4 {
	margin-right: 16px;
}

.ml-1 {
	margin-left: 4px;
}

.ml-3 {
	margin-left: 12px;
}

.ml-4 {
	margin-left: 16px;
}

.mt-1 {
	margin-top: 4px;
}

.mt-2 {
	margin-top: 8px;
}

.mt-3 {
	margin-top: 12px;
}

.mt-4 {
	margin-top: 16px;
}

.mt-6 {
	margin-top: 24px;
}

.p-2 {
	padding: 8px;
}

.p-3 {
	padding: 12px;
}

.p-4 {
	padding: 16px;
}

.p-5 {
	padding: 20px;
}

.py-1 {
	padding-top: 4px;
	padding-bottom: 4px;
}

.py-2 {
	padding-top: 8px;
	padding-bottom: 8px;
}

.py-3 {
	padding-top: 12px;
	padding-bottom: 12px;
}

.px-2 {
	padding-left: 8px;
	padding-right: 8px;
}

.px-3 {
	padding-left: 12px;
	padding-right: 12px;
}

.px-4 {
	padding-left: 16px;
	padding-right: 16px;
}

.pl-2 {
	padding-left: 8px;
}

.pl-10 {
	padding-left: 40px;
}

.pb-2 {
	padding-bottom: 8px;
}

.pb-3 {
	padding-bottom: 12px;
}

.pb-4 {
	padding-bottom: 16px;
}

.pb-16 {
	padding-bottom: 64px;
}

.mx-auto {
	margin-left: auto;
	margin-right: auto;
}

.mx-4 {
	margin-left: 16px;
	margin-right: 16px;
}

.mb-20 {
	margin-bottom: 80px;
}

.pb-20 {
	padding-bottom: 80px;
}

.w-full {
	width: 100%;
}

.w-5 {
	width: 20px;
}

.w-6 {
	width: 24px;
}

.w-10 {
	width: 40px;
}

.w-12 {
	width: 48px;
}

.w-14 {
	width: 56px;
}

.w-16 {
	width: 64px;
}

.w-24 {
	width: 96px;
}

.h-5 {
	height: 20px;
}

.h-6 {
	height: 24px;
}

.h-10 {
	height: 40px;
}

.h-12 {
	height: 48px;
}

.h-14 {
	height: 56px;
}

.h-16 {
	height: 64px;
}

.h-20 {
	height: 80px;
}

.h-24 {
	height: 96px;
}

.h-40 {
	height: 160px;
}

.h-48 {
	height: 192px;
}

.shadow-sm {
	box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.shadow-lg {
	box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}

.overflow-hidden {
	overflow: hidden;
}

.relative {
	position: relative;
}

.absolute {
	position: absolute;
}

.block {
	display: block;
}

.whitespace-nowrap {
	white-space: nowrap;
}

.object-cover {
	object-fit: cover;
}

.text-white {
	color: #FFFFFF;
}

.text-gray-400 {
	color: #9CA3AF;
}

.text-gray-500 {
	color: #6B7280;
}

.text-gray-600 {
	color: #4B5563;
}

.text-gray-700 {
	color: #374151;
}

.text-gray-800 {
	color: #1F2937;
}

.text-gray-900 {
	color: #111827;
}

.bg-white {
	background-color: #FFFFFF;
}

.bg-gray-50 {
	background-color: #F9FAFB;
}

.bg-gray-100 {
	background-color: #F3F4F6;
}

.bg-gray-200 {
	background-color: #E5E7EB;
}

.bg-gray-300 {
	background-color: #D1D5DB;
}

.border-white {
	border-color: #FFFFFF;
}

.border-gray-100 {
	border-color: #F3F4F6;
}

.border-gray-200 {
	border-color: #E5E7EB;
}

.border-gray-300 {
	border-color: #D1D5DB;
}

.border {
	border-width: 1px;
	border-style: solid;
}

.border-t {
	border-top-width: 1px;
	border-top-style: solid;
}

.border-b {
	border-bottom-width: 1px;
	border-bottom-style: solid;
}

.border-r {
	border-right-width: 1px;
	border-right-style: solid;
}

.border-2 {
	border-width: 2px;
}

.left-3 {
	left: 12px;
}

.left-4 {
	left: 16px;
}

.top-3 {
	top: 12px;
}

.right-0 {
	right: 0;
}

.bottom-0 {
	bottom: 0;
}

.top-1\/2 {
	top: 50%;
}

.space-x-2 > view:not(:first-child),
.space-x-2 > text:not(:first-child) {
	margin-left: 8px;
}

.space-x-3 > view:not(:first-child),
.space-x-3 > text:not(:first-child) {
	margin-left: 12px;
}

.space-y-2 > view:not(:first-child) {
	margin-top: 8px;
}

.gap-2 {
	gap: 8px;
}

.gap-3 {
	gap: 12px;
}

.gap-4 {
	gap: 16px;
}

.z-50 {
	z-index: 50;
}

.-mt-12 {
	margin-top: -48px;
}
</style>
