import axios from 'axios';

// Create axios instance with base URL and default headers
const api = axios.create({
  baseURL: 'http://20.244.56.144/evaluation-service',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Function to get a new access token
export const getAccessToken = async () => {
  try {
    const response = await axios.post('http://20.244.56.144/evaluation-service/auth', {
      "email": "2205377@kiit.ac.in",
      "name": "harsh shandilya",
      "rollNo": "2205377",
      "accessCode": "nwpwrZ",
      "clientID": "ce5f8b10-1e48-4315-98ba-64661fd6888c",
      "clientSecret": "AZGeWgMsQUxeEPZZ"
    });
    
    return response.data.access_token;
  } catch (error) {
    console.error('Error fetching access token:', error);
    throw error;
  }
};

// API service functions
export const fetchUsers = async () => {
  try {
    // Get a fresh access token
    const accessToken = await getAccessToken();
    
    // Set the token in the request headers
    const response = await api.get('/users', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    console.log('Raw API Response:', response);
    console.log('Users data structure:', {
      type: typeof response.data,
      isArray: Array.isArray(response.data),
      keys: Object.keys(response.data),
      sample: response.data
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const fetchUserPosts = async (userId) => {
  try {
    // Get a fresh access token
    const accessToken = await getAccessToken();
    
    // Set the token in the request headers
    const response = await api.get(`/users/${userId}/posts`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching posts for user ${userId}:`, error);
    throw error;
  }
};

export const fetchPostComments = async (postId) => {
  try {
    // Get a fresh access token
    const accessToken = await getAccessToken();
    
    // Set the token in the request headers
    const response = await api.get(`/posts/${postId}/comments`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching comments for post ${postId}:`, error);
    throw error;
  }
}; 