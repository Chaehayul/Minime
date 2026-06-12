import axios from 'axios';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

const notifyDemo = (detail: string) => {
  window.dispatchEvent(new CustomEvent('portfolio-demo-notice', { detail }));
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (localStorage.getItem('portfolioDemoRole')) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('portfolioDemoRole');
        notifyDemo('체험 세션이 만료되었습니다. 역할을 다시 선택해 주세요.');
        return Promise.reject(error);
      }
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    if (!error.response) {
      notifyDemo('무료 서버를 시작하고 있습니다. 잠시 후 다시 시도해 주세요.');
    }
    return Promise.reject(error);
  },
);

export const getImageUrl = (url: string | null | undefined): string => {
  if (!url) return '';
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//.test(url)) {
    const localUrl = new URL(url);
    return `${API_BASE_URL}${localUrl.pathname}${localUrl.search}`;
  }
  if (url.startsWith('http')) return url;
  return `${API_BASE_URL}${url}`;
};

export default api;
