import React, { useState, useEffect, useCallback } from 'react';
import { fetchUsers, fetchUserPosts } from '../services/api';

function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(0);

  // Function to fetch all posts
  const fetchAllPosts = useCallback(async () => {
    try {
      // Fetch all users
      const usersData = await fetchUsers();
      
      // Fetch all posts from all users
      let allPosts = [];
      
      // Convert users object to array of user objects with id and name
      const users = Object.entries(usersData).map(([id, name]) => ({
        id,
        name
      }));
      
      // Fetch posts for each user in parallel to improve performance
      const userPostsPromises = users.map(async (user) => {
        try {
          const userPosts = await fetchUserPosts(user.id);
          // Add user info to each post
          return userPosts.map(post => ({
            ...post,
            user: {
              id: user.id,
              name: user.name,
              username: user.name.toLowerCase().replace(/\s+/g, '.'),
              avatar: `https://i.pravatar.cc/150?u=${user.id}`
            },
            // Add random image to post
            image: `https://picsum.photos/seed/${post.id}/800/600`,
            // Add timestamp for sorting (using post id for simplicity)
            timestamp: Date.now() - (post.id * 1000) // Simulating different post times
          }));
        } catch (error) {
          console.error(`Error fetching posts for user ${user.id}:`, error);
          return []; // Return empty array if there's an error
        }
      });
      
      // Wait for all promises to resolve
      const userPostsArrays = await Promise.all(userPostsPromises);
      
      // Flatten the array of arrays
      allPosts = userPostsArrays.flat();
      
      // Sort posts by timestamp (newest first)
      const sortedPosts = allPosts.sort((a, b) => b.timestamp - a.timestamp);
      
      // Update last fetch time
      setLastFetchTime(Date.now());
      
      return sortedPosts;
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  }, []);

  // Initial data load
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const fetchedPosts = await fetchAllPosts();
        setPosts(fetchedPosts);
        setLoading(false);
      } catch (error) {
        setError('Failed to load feed. Please try again later.');
        setLoading(false);
      }
    };

    loadInitialData();
  }, [fetchAllPosts]);

  // Polling for new posts every 30 seconds
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      // Only poll if it's been at least 30 seconds since the last fetch
      if (Date.now() - lastFetchTime >= 30000) {
        try {
          const latestPosts = await fetchAllPosts();
          setPosts(latestPosts);
        } catch (error) {
          console.error('Error polling for new posts:', error);
        }
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(pollInterval);
  }, [fetchAllPosts, lastFetchTime]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600">Loading feed...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Social Media Feed</h2>
      
      <div className="space-y-6">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-5">
              {/* Post header with user info */}
              <div className="flex items-center mb-4">
                <img 
                  src={post.user.avatar} 
                  alt={post.user.name} 
                  className="h-10 w-10 rounded-full object-cover mr-3"
                />
                <div>
                  <h3 className="text-md font-medium text-gray-900">{post.user.name}</h3>
                  <p className="text-xs text-gray-500">@{post.user.username}</p>
                </div>
              </div>
              
              {/* Post content */}
              <h4 className="text-lg font-semibold mb-2">{post.title}</h4>
              <p className="text-gray-700 mb-4">{post.body}</p>
              
              {/* Post image */}
              <img 
                src={post.image} 
                alt={post.title} 
                className="w-full h-64 object-cover rounded-md mb-4"
              />
              
              {/* Post timestamp and interactions */}
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div>
                  {new Date(post.timestamp).toLocaleString()}
                </div>
                <div className="flex space-x-4">
                  <button className="flex items-center text-gray-500 hover:text-red-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Like
                  </button>
                  <button className="flex items-center text-gray-500 hover:text-blue-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Comment
                  </button>
                  <button className="flex items-center text-gray-500 hover:text-green-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Feed; 