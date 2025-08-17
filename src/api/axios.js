import axios from 'axios';

// تم إزالة متغيرات البيئة واستخدام الرابط الثابت مباشرةً لضمان عمل التطبيق على Vercel
const baseURL = 'https://compass-backend-87n1.onrender.com';

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
