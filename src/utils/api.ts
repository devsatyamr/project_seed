import axios from 'axios';

const API_URL = 'http://localhost:5000';

export async function uploadCSVFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post(`${API_URL}/predict`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.error || 'Failed to process CSV file';
      console.error('API Error:', errorMessage);
      throw new Error(errorMessage);
    }
    throw error;
  }
}