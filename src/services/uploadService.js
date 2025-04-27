// 通用文件上传服务
import http from './http.js';

/**
 * 通用文件上传函数
 * @param {string} filePath 文件路径
 * @param {string} fileType 文件类型（avatar、fruit等）
 * @returns {Promise} 上传结果，包含文件URL
 */
export function uploadFile(filePath, fileType = '') {
  console.log('开始上传文件:', filePath, '类型:', fileType);
  console.log('上传URL:', http.BASE_URL + '/upload/file');

  // 检查是否是Blob URL (Web环境)
  if (filePath && filePath.startsWith('blob:')) {
    console.log('检测到Blob URL，将进行特殊处理');
    return handleBlobUpload(filePath, fileType);
  }

  // 常规文件路径上传
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: http.BASE_URL + '/upload/file',
      filePath: filePath,
      name: 'file',
      formData: {
        type: fileType
      },
      header: {
        'Authorization': `Bearer ${uni.getStorageSync('token') || ''}`
      },
      success: (res) => {
        console.log('上传成功，原始响应:', res);
        try {
          const data = JSON.parse(res.data);
          console.log('解析后的响应数据:', data);
          if (data.code === 200 || data.code === 201) {
            console.log('上传成功，返回数据:', data.data);
            resolve(data.data);
          } else {
            console.error('上传失败，服务器返回错误:', data);
            uni.showToast({ title: data.message || '上传失败', icon: 'none' });
            reject(data);
          }
        } catch (e) {
          console.error('解析响应数据失败:', e, '原始响应:', res.data);
          uni.showToast({ title: '上传失败', icon: 'none' });
          reject(e);
        }
      },
      fail: (err) => {
        console.error('上传请求失败:', err);
        uni.showToast({ title: '网络错误', icon: 'none' });
        reject(err);
      }
    });
  });
}

// 处理Blob URL上传 (Web环境)
function handleBlobUpload(blobUrl, fileType) {
  console.log('处理Blob URL上传:', blobUrl);

  return new Promise((resolve, reject) => {
    // 从Blob URL获取文件数据
    fetch(blobUrl)
      .then(response => {
        console.log('Fetch响应:', response);
        return response.blob();
      })
      .then(blob => {
        console.log('获取到Blob数据:', blob);
        console.log('Blob类型:', blob.type);
        console.log('Blob大小:', blob.size, '字节');

        // 根据Blob类型确定文件扩展名
        let fileName = 'image.jpg'; // 默认文件名
        if (blob.type) {
          const extension = blob.type.split('/')[1];
          if (extension) {
            fileName = `image.${extension}`;
          }
        }
        console.log('使用文件名:', fileName);

        // 创建FormData对象
        const formData = new FormData();
        formData.append('file', blob, fileName);
        if (fileType) {
          formData.append('type', fileType);
        }

        // 打印FormData内容（仅用于调试）
        console.log('FormData已创建，包含文件和类型');

        console.log('准备上传Blob数据，URL:', http.BASE_URL + '/upload/file');
        console.log('Authorization头:', `Bearer ${uni.getStorageSync('token') || ''}`);

        // 使用fetch API上传
        fetch(http.BASE_URL + '/upload/file', {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${uni.getStorageSync('token') || ''}`
            // 注意：当使用FormData时，不要手动设置Content-Type，浏览器会自动设置正确的值
          }
        })
        .then(response => response.json())
        .then(data => {
          console.log('Blob上传成功，返回数据:', data);
          if (data.code === 200 || data.code === 201) {
            // 确保返回的数据格式一致
            const result = {
              file_url: data.data.file_url || data.data.url || data.data.path || ''
            };
            console.log('标准化后的上传结果:', result);
            resolve(result);
          } else {
            uni.showToast({ title: data.message || 'Blob上传失败', icon: 'none' });
            reject(data);
          }
        })
        .catch(error => {
          console.error('Blob上传请求失败:', error);
          uni.showToast({ title: 'Blob上传网络错误', icon: 'none' });
          reject(error);
        });
      })
      .catch(error => {
        console.error('获取Blob数据失败:', error);
        uni.showToast({ title: '获取Blob数据失败', icon: 'none' });
        reject(error);
      });
  });
}

/**
 * 上传用户头像
 * @param {string} filePath 文件路径
 * @returns {Promise} 上传结果，包含头像URL
 */
export function uploadAvatar(filePath) {
  console.log('开始上传头像:', filePath);
  return uploadFile(filePath, 'avatar')
    .then(data => {
      console.log('头像上传成功，服务器返回:', data);
      // 确保返回的数据格式一致，包含avatar_url字段
      const result = {
        avatar_url: data.file_url
      };
      console.log('处理后的头像数据:', result);
      return result;
    })
    .catch(err => {
      console.error('头像上传失败:', err);
      throw err; // 重新抛出错误，让调用者处理
    });
}

/**
 * 上传水果图片
 * @param {string} filePath 文件路径
 * @returns {Promise} 上传结果，包含图片URL
 */
export function uploadFruitImage(filePath) {
  return uploadFile(filePath, 'fruit')
    .then(data => {
      // 确保返回的数据格式一致，包含image_url字段
      return {
        image_url: data.file_url
      };
    });
}

/**
 * 批量上传文件
 * @param {Array<string>} filePaths 文件路径数组
 * @param {string} fileType 文件类型
 * @returns {Promise<Array>} 上传结果数组
 */
export function uploadMultipleFiles(filePaths, fileType = '') {
  const promises = filePaths.map(filePath => uploadFile(filePath, fileType));
  return Promise.all(promises);
}

export default {
  uploadFile,
  uploadAvatar,
  uploadFruitImage,
  uploadMultipleFiles
};
