import axios from 'axios';

// تحديد الرابط الأساسي بناءً على بيئة التشغيل
// إذا كان التطبيق يعمل في وضع الإنتاج، استخدم رابط Render
// وإذا كان في وضع التطوير (development)، استخدم localhost
const baseURL = process.env.NODE_ENV === 'production' 
  ? 'https://compass-backend-87n1.onrender.com' 
  : 'http://localhost:5000';

const API = axios.create({
  baseURL: baseURL,
});

// إضافة التوكن تلقائيًا إذا موجود
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;
