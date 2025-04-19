const BASE_URL = 'http://192.168.0.9:8080/api/v1';

/**
 * 通用请求封装
 * @param {Object} options
 * @param {string} options.url - 请求路径（相对 BASE_URL）
 * @param {string} [options.method='GET']
 * @param {Object} [options.data={}] - 请求参数或请求体
 * @param {string} [options.contentType='application/json']
 */
function request({ url, method = 'GET', data = {}, contentType = 'application/json' }) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + url,
      method,
      data,
      header: {
        'Authorization': `Bearer ${uni.getStorageSync('token') || ''}`,
        'Content-Type': contentType
      },
      success: (res) => {
        const { statusCode, data: resData } = res;
        if (statusCode === 200 && (resData.code === 200 || resData.code === 201)) {
          resolve(resData.data);
        } else {
          uni.showToast({ title: resData.message || '请求失败', icon: 'none' });
          reject(resData);
        }
      },
      fail: (err) => {
        uni.showToast({ title: '网络错误', icon: 'none' });
        reject(err);
      }
    });
  });
}

export default { BASE_URL, request };
