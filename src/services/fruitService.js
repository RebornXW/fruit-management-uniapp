// 水果服务
import http from './http.js';

// 缓存对象
const cache = {
    categoriesWithVarieties: null,
    lastFetchTime: 0,
    expirationTime: 5 * 60 * 1000 // 5分钟缓存过期时间
};

/**
 * 获取水果列表，可传递查询参数
 * @param {Object} params 查询参数
 */
export function getFruits(params = {}) {
    // 根据API文档，水果列表默认包含库存数量
    return http.request({ url: '/fruits', method: 'GET', data: params });
}

/**
 * 获取单个水果详情
 * @param {string|number} id 水果ID
 */
export function getFruitById(id) {
    return http.request({ url: `/fruits/${id}`, method: 'GET' });
}

/**
 * 创建新水果
 * @param {Object} data 水果数据
 */
export function createFruit(data) {
    // 先获取分类和品种的ID
    return getCategoryAndVarietyIds(data.category, data.variety)
        .then(({ categoryId, varietyId }) => {
            // 创建一个新的数据对象，替换category和variety为对应的ID
            // 同时将packageType、minPrice、maxPrice转换为package_type、min_price、max_price
            const newData = {
                ...data,
                category_id: categoryId,
                variety_id: varietyId,
                package_type: data.packageType,
                min_price: data.minPrice,
                max_price: data.maxPrice
            };

            // 删除原始的category、variety、packageType、minPrice、maxPrice字段
            delete newData.category;
            delete newData.variety;
            delete newData.packageType;
            delete newData.minPrice;
            delete newData.maxPrice;

            // 发送请求
            return http.request({ url: '/fruits', method: 'POST', data: newData });
        });
}

/**
 * 更新水果
 * @param {string|number} id 水果ID
 * @param {Object} data 更新字段
 */
export function updateFruit(id, data) {
    // 如果数据中包含分类和品种名称，则需要转换为ID
    if (data.category && data.variety) {
        return getCategoryAndVarietyIds(data.category, data.variety)
            .then(({ categoryId, varietyId }) => {
                // 创建一个新的数据对象，替换category和variety为对应的ID
                // 同时将packageType、minPrice、maxPrice转换为package_type、min_price、max_price
                const newData = {
                    ...data,
                    category_id: categoryId,
                    variety_id: varietyId,
                    package_type: data.packageType,
                    min_price: data.minPrice,
                    max_price: data.maxPrice
                };

                // 删除原始的category、variety、packageType、minPrice、maxPrice字段
                delete newData.category;
                delete newData.variety;
                delete newData.packageType;
                delete newData.minPrice;
                delete newData.maxPrice;

                // 发送请求
                return http.request({ url: `/fruits/${id}`, method: 'PUT', data: newData });
            });
    } else {
        // 如果没有分类和品种名称，但仍需要转换其他字段
        const newData = { ...data };

        // 转换packageType、minPrice、maxPrice字段
        if (data.packageType) {
            newData.package_type = data.packageType;
            delete newData.packageType;
        }

        if (data.minPrice !== undefined) {
            newData.min_price = data.minPrice;
            delete newData.minPrice;
        }

        if (data.maxPrice !== undefined) {
            newData.max_price = data.maxPrice;
            delete newData.maxPrice;
        }

        // 发送请求
        return http.request({ url: `/fruits/${id}`, method: 'PUT', data: newData });
    }
}

/**
 * 更新水果价格
 * @param {string|number} id 水果ID
 * @param {number} minPrice 最低价格
 * @param {number} maxPrice 最高价格
 */
export function updateFruitPrice(id, minPrice, maxPrice) {
    return http.request({
        url: `/fruits/${id}`,
        method: 'PUT',
        data: {
            min_price: minPrice,
            max_price: maxPrice
        }
    });
}

/**
 * 删除水果
 * @param {string|number} id 水果ID
 */
export function deleteFruit(id) {
    return http.request({ url: `/fruits/${id}`, method: 'DELETE' });
}

/**
 * 获取水果分类列表
 */
export function getCategories() {
    return http.request({ url: '/fruits/categories', method: 'GET' });
}

/**
 * 获取水果品种列表，可传category_id
 * @param {Object} params 查询参数
 */
export function getVarieties(params = {}) {
    return http.request({ url: '/fruits/varieties', method: 'GET', data: params });
}

/**
 * 获取单个水果品类
 * @param {string|number} id 品类ID
 */
export function getCategoryById(id) {
    return http.request({ url: `/fruits/categories/${id}`, method: 'GET' });
}

/**
 * 获取单个水果品种
 * @param {string|number} id 品种ID
 */
export function getVarietyById(id) {
    return http.request({ url: `/fruits/varieties/${id}`, method: 'GET' });
}

/**
 * 获取所有水果分类及其品种
 * @param {boolean} forceRefresh 是否强制刷新缓存
 * @returns {Promise} 分类及品种数据
 */
export function getCategoriesWithVarieties(forceRefresh = false) {
    const now = Date.now();

    // 如果缓存有效且不强制刷新，直接返回缓存数据
    if (!forceRefresh &&
        cache.categoriesWithVarieties &&
        (now - cache.lastFetchTime) < cache.expirationTime) {
        console.log('使用缓存的分类及品种数据');
        return Promise.resolve(cache.categoriesWithVarieties);
    }

    // 缓存无效或强制刷新，从服务器获取数据
    console.log('从服务器获取分类及品种数据');
    return http.request({ url: '/fruits/categories/with-varieties', method: 'GET' })
        .then(res => {
            // 更新缓存
            cache.categoriesWithVarieties = res;
            cache.lastFetchTime = now;
            return res;
        });
}

/**
 * 根据水果名称获取默认图片
 * @param {string} fruitName 水果名称
 * @returns {string} 图片路径
 */
export function getDefaultFruitImage(fruitName) {
    // 使用本地图片作为默认水果图片
    if (!fruitName) {
        // 如果没有水果名称，返回默认图片
        return '/static/fruit/strawberry.png';
    }

    const lowerName = typeof fruitName === 'string' ? fruitName.toLowerCase() : '';

    // 根据水果名称匹配图片
    if (lowerName.includes('苹果') || lowerName.includes('apple')) {
        return '/static/fruit/apple.png';
    } else if (lowerName.includes('梨') || lowerName.includes('pear')) {
        return '/static/fruit/pear.png';
    } else if (lowerName.includes('葡萄') || lowerName.includes('grape')) {
        return '/static/fruit/grape.png';
    } else if (lowerName.includes('柚子') || lowerName.includes('orange')) {
        return '/static/fruit/orange.png';
    } else if (lowerName.includes('香蕉') || lowerName.includes('banana')) {
        return '/static/fruit/banana.png';
    } else if (lowerName.includes('枣')) {
        return '/static/fruit/grape.png';
    } else {
        // 如果没有匹配，返回默认图片
        return '/static/fruit/strawberry.png';
    }
}

/**
 * 根据分类名称和品种名称获取对应的ID
 * @param {string} categoryName 分类名称
 * @param {string} varietyName 品种名称
 * @returns {Promise<{categoryId: number, varietyId: number}>} 分类和品种ID
 */
export function getCategoryAndVarietyIds(categoryName, varietyName) {
    // 定义一个缓存对象，用于存储分类和品种数据
    let categoryData = [];

    // 使用缓存的分类及品种数据，避免重复请求
    return getCategoriesWithVarieties(false) // 使用缓存，不强制刷新
        .then(res => {
            // 处理返回的数据，兼容不同的响应格式
            if (Array.isArray(res)) {
                categoryData = res;
            } else if (res && typeof res === 'object' && res.data) {
                if (Array.isArray(res.data)) {
                    categoryData = res.data;
                } else if (typeof res.data === 'object' && res.data.items) {
                    categoryData = res.data.items;
                }
            }

            // 确保分类数据是数组
            if (!Array.isArray(categoryData)) {
                console.error('处理后的分类数据仍然不是数组:', categoryData);
                categoryData = [];
            }

            // 在分类数据中查找匹配的分类
            const category = categoryData.find(item => {
                const name = item.name || item.category_name || '';
                return name === categoryName;
            });

            if (!category) {
                throw new Error(`未找到分类: ${categoryName}`);
            }

            const categoryId = category.id;

            // 在分类的品种列表中查找匹配的品种
            if (category.varieties && Array.isArray(category.varieties)) {
                const variety = category.varieties.find(item => {
                    const name = item.name || item.variety_name || '';
                    return name === varietyName;
                });

                if (!variety) {
                    throw new Error(`在分类 ${categoryName} 中未找到品种: ${varietyName}`);
                }

                return {
                    categoryId,
                    varietyId: variety.id
                };
            } else {
                // 如果分类中没有品种列表，则需要单独获取品种列表
                return getVarieties({ category_id: categoryId })
                    .then(varietiesRes => {
                        let varietiesData = [];

                        // 处理返回的数据
                        if (Array.isArray(varietiesRes)) {
                            varietiesData = varietiesRes;
                        } else if (varietiesRes && typeof varietiesRes === 'object' && varietiesRes.data) {
                            if (Array.isArray(varietiesRes.data)) {
                                varietiesData = varietiesRes.data;
                            } else if (typeof varietiesRes.data === 'object' && varietiesRes.data.items) {
                                varietiesData = varietiesRes.data.items;
                            }
                        }

                        // 确保品种数据是数组
                        if (!Array.isArray(varietiesData)) {
                            console.error('处理后的品种数据仍然不是数组:', varietiesData);
                            varietiesData = [];
                        }

                        // 在品种数据中查找匹配的品种
                        const variety = varietiesData.find(item => {
                            const name = item.name || item.variety_name || '';
                            return name === varietyName;
                        });

                        if (!variety) {
                            throw new Error(`在分类 ${categoryName} 中未找到品种: ${varietyName}`);
                        }

                        return {
                            categoryId,
                            varietyId: variety.id
                        };
                    });
            }
        });
}

export default {
    getFruits,
    getFruitById,
    createFruit,
    updateFruit,
    updateFruitPrice,
    deleteFruit,
    getCategories,
    getVarieties,
    getCategoryById,
    getVarietyById,
    getCategoriesWithVarieties,
    getDefaultFruitImage,
    getCategoryAndVarietyIds
};
