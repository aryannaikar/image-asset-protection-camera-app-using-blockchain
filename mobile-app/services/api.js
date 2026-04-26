import axios from 'axios';

// Replace with your computer's local IP address if testing on a physical device
// Example: 'http://192.168.1.10:5000'
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
});

export const uploadImage = async (fileUri, owner, password, coords) => {
  const formData = new FormData();
  
  // Extract filename and type
  const filename = fileUri.split('/').pop();
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : `image`;

  formData.append('image', { uri: fileUri, name: filename, type });
  formData.append('owner', owner);
  formData.append('password', password);
  if (coords) {
    formData.append('latitude', String(coords.latitude));
    formData.append('longitude', String(coords.longitude));
  }

  try {
    const response = await api.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Upload API Error:', error.response?.data || error.message);
    throw error;
  }
};

export const verifyImage = async (fileUri) => {
  const formData = new FormData();
  const filename = fileUri.split('/').pop();
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : `image`;

  formData.append('image', {
    uri: fileUri,
    name: filename,
    type,
  });

  try {
    const response = await api.post('/api/verify', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Verify API Error:', error.response?.data || error.message);
    throw error;
  }
};

export const fetchHistory = async (owner) => {
  try {
    const response = await api.get(`/api/history?owner=${owner}`);
    return response.data;
  } catch (error) {
    console.error('History API Error:', error.response?.data || error.message);
    throw error;
  }
};

export const loginUser = async (username, password) => {
  try {
    const response = await api.post('/api/login', { username, password });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Login failed');
  }
};

export default api;
