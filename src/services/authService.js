// 用户认证服务
import http from './http.js';

/**
 * 用户登录
 * @param {string} username 用户名
 * @param {string} password 密码
 * @returns {Promise} 登录结果
 */
export function login(username, password) {
  return http.request({
    url: '/auth/login',
    method: 'POST',
    data: { username, password }
  });
}

/**
 * 用户登出
 * @returns {Promise} 登出结果
 */
export function logout() {
  return http.request({
    url: '/auth/logout',
    method: 'POST'
  });
}

/**
 * 获取当前用户信息
 * @returns {Promise} 用户信息
 */
export function getUserProfile() {
  return http.request({
    url: '/auth/profile',
    method: 'GET'
  });
}

/**
 * 修改个人信息
 * @param {Object} data 用户信息
 * @returns {Promise} 修改结果
 */
export function updateUserProfile(data) {
  return http.request({
    url: '/auth/profile',
    method: 'PUT',
    data
  });
}

/**
 * 修改密码
 * @param {string} oldPassword 旧密码
 * @param {string} newPassword 新密码
 * @param {string} confirmPassword 确认密码
 * @returns {Promise} 修改结果
 */
export function changePassword(oldPassword, newPassword, confirmPassword) {
  return http.request({
    url: '/auth/password',
    method: 'PUT',
    data: {
      old_password: oldPassword,
      new_password: newPassword,
      confirm_password: confirmPassword
    }
  });
}

/**
 * 上传用户头像
 * @param {string} filePath 文件路径
 * @returns {Promise} 上传结果
 */
export function uploadAvatar(filePath) {
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: http.BASE_URL + '/auth/avatar',
      filePath: filePath,
      name: 'avatar',
      header: {
        'Authorization': `Bearer ${uni.getStorageSync('token') || ''}`
      },
      success: (res) => {
        try {
          const data = JSON.parse(res.data);
          if (data.code === 200) {
            resolve(data.data);
          } else {
            uni.showToast({ title: data.message || '上传失败', icon: 'none' });
            reject(data);
          }
        } catch (e) {
          uni.showToast({ title: '上传失败', icon: 'none' });
          reject(e);
        }
      },
      fail: (err) => {
        uni.showToast({ title: '网络错误', icon: 'none' });
        reject(err);
      }
    });
  });
}

export default {
  login,
  logout,
  getUserProfile,
  updateUserProfile,
  changePassword,
  uploadAvatar
};
