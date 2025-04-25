import http from './http.js';

/**
 * 统计服务
 */
const statisticsService = {};

/**
 * 获取库存统计数据
 * @param {Object} params 查询参数
 * @returns {Promise} 库存统计数据，包含总库存、今日入库、今日出库
 */
statisticsService.getInventoryStatistics = function(params = {}) {
    return http.request({
        url: '/statistics/inventory',
        method: 'GET',
        data: params
    })
    .then(res => {
        console.log('获取库存统计数据成功:', res);

        // 处理返回的数据，兼容不同的响应格式
        let data = res;

        // 打印原始响应数据，便于调试
        console.log('原始库存统计数据:', res);

        // 如果是对象，并且有data属性
        if (res && typeof res === 'object' && res.data) {
            data = res.data;
            console.log('使用res.data作为数据源');
        }

        // 确保返回的数据包含所需字段
        const result = {
            totalStock: 0,
            todayIn: 0,
            todayOut: 0
        };

        // 根据API文档中的库存统计响应格式解析数据
        if (data) {
            // 总库存 - 从total_quantity中获取
            if (data.total_quantity !== undefined) {
                result.totalStock = parseInt(data.total_quantity) || 0;
            }
            // 兼容其他可能的字段名
            else if (data.total_stock !== undefined) {
                result.totalStock = parseInt(data.total_stock) || 0;
            } else if (data.totalStock !== undefined) {
                result.totalStock = parseInt(data.totalStock) || 0;
            } else if (data.total !== undefined) {
                result.totalStock = parseInt(data.total) || 0;
            }

            // 今日入库 - 从total_in_quantity中获取
            if (data.total_in_quantity !== undefined) {
                result.todayIn = parseInt(data.total_in_quantity) || 0;
            }
            // 兼容其他可能的字段名
            else if (data.today_in !== undefined) {
                result.todayIn = parseInt(data.today_in) || 0;
            } else if (data.todayIn !== undefined) {
                result.todayIn = parseInt(data.todayIn) || 0;
            } else if (data.in !== undefined) {
                result.todayIn = parseInt(data.in) || 0;
            }

            // 今日出库 - 从total_out_quantity中获取
            if (data.total_out_quantity !== undefined) {
                result.todayOut = parseInt(data.total_out_quantity) || 0;
            }
            // 兼容其他可能的字段名
            else if (data.today_out !== undefined) {
                result.todayOut = parseInt(data.today_out) || 0;
            } else if (data.todayOut !== undefined) {
                result.todayOut = parseInt(data.todayOut) || 0;
            } else if (data.out !== undefined) {
                result.todayOut = parseInt(data.out) || 0;
            }
        }

        console.log('处理后的库存统计数据:', result);
        return result;
    })
    .catch(err => {
        console.error('获取库存统计数据失败:', err);
        // 失败时返回默认值
        return {
            totalStock: 0,
            todayIn: 0,
            todayOut: 0
        };
    });
};

/**
 * 获取销售总额摘要
 * @returns {Promise} 销售总额摘要数据，包含今日、本周、本月、今年的销售总额
 */
statisticsService.getSalesSummary = function() {
    return http.request({
        url: '/statistics/sales-summary',
        method: 'GET'
    })
    .then(res => {
        console.log('获取销售总额摘要成功:', res);

        // 处理返回的数据，兼容不同的响应格式
        let data = res;

        // 打印原始响应数据，便于调试
        console.log('原始销售总额摘要数据:', res);

        // 如果是对象，并且有data属性
        if (res && typeof res === 'object' && res.data) {
            data = res.data;
            console.log('使用res.data作为数据源');
        }

        // 确保返回的数据包含所需字段
        const result = {
            today: {
                sales: 0,
                count: 0
            },
            this_week: {
                sales: 0,
                count: 0
            },
            this_month: {
                sales: 0,
                count: 0
            },
            this_year: {
                sales: 0,
                count: 0
            }
        };

        // 根据API文档中的销售总额摘要响应格式解析数据
        if (data) {
            // 今日销售额
            if (data.today) {
                result.today.sales = parseFloat(data.today.sales) || 0;
                result.today.count = parseInt(data.today.count) || 0;
            }

            // 本周销售额
            if (data.this_week) {
                result.this_week.sales = parseFloat(data.this_week.sales) || 0;
                result.this_week.count = parseInt(data.this_week.count) || 0;
            }

            // 本月销售额
            if (data.this_month) {
                result.this_month.sales = parseFloat(data.this_month.sales) || 0;
                result.this_month.count = parseInt(data.this_month.count) || 0;
            }

            // 今年销售额
            if (data.this_year) {
                result.this_year.sales = parseFloat(data.this_year.sales) || 0;
                result.this_year.count = parseInt(data.this_year.count) || 0;
            }
        }

        console.log('处理后的销售总额摘要数据:', result);
        return result;
    })
    .catch(err => {
        console.error('获取销售总额摘要失败:', err);
        // 失败时返回默认值
        return {
            today: {
                sales: 0,
                count: 0
            },
            this_week: {
                sales: 0,
                count: 0
            },
            this_month: {
                sales: 0,
                count: 0
            },
            this_year: {
                sales: 0,
                count: 0
            }
        };
    });
};

export default statisticsService;
