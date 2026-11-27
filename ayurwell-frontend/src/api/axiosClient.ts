import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/v1';

export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

axiosClient.interceptors.request.use(
  async (config) => {
    const isAuthEndpoint = config.url?.includes('/auth/login') || config.url?.includes('/auth/register');
    let token = localStorage.getItem('ayurwell_jwt');

    // Auto-acquire valid demo session if token is missing and not an auth endpoint
    if (!token && !isAuthEndpoint) {
      try {
        const authRes = await axios.post(`${API_BASE_URL}/auth/login`, {
          email: 'demo@ayurwell.com',
          password: 'Password123!',
        });
        if (authRes.data && typeof authRes.data.token === 'string') {
          const freshToken: string = authRes.data.token;
          token = freshToken;
          localStorage.setItem('ayurwell_jwt', freshToken);
        }
      } catch {
        // Ignore silent login failure
      }
    }

    if (token && !isAuthEndpoint) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.url?.includes('/auth/')) {
      console.log(`[AyurWell API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }
    return config;
  },
  (error) => {
    console.error('[AyurWell API Request Error]', error);
    return Promise.reject(error);
  }
);

axiosClient.interceptors.response.use(
  (response) => {
    if (response.config.url?.includes('/auth/')) {
      console.log(
        `[AyurWell API Response] ${response.status} ${response.config.url}`,
        response.data ? { success: response.data.success, message: response.data.message, maskedEmail: response.data.maskedEmail } : {}
      );
    }
    return response;
  },
  (error) => {
    if (error.response?.config?.url?.includes('/auth/')) {
      console.warn(
        `[AyurWell API Error] ${error.response?.status || 'NETWORK_ERROR'} ${error.config?.url}`,
        error.response?.data?.message || error.message
      );
    }
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem('ayurwell_jwt');
    }
    return Promise.reject(error);
  }
);
