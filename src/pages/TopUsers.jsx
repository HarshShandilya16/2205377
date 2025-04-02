import React, { useState, useEffect } from 'react';
import { fetchUsers, fetchUserPosts } from '../services/api';

function TopUsers() {
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getTopUsers = async () => {
      try {
        setLoading(true);
        // Fetch all users
        const usersData = await fetchUsers();
        console.log('Users data received:', usersData); // Debug log
        
        // Convert users object to array of user objects
        const users = Object.entries(usersData).map(([id, userData]) => {
          // Check if userData is an object or a string
          const name = typeof userData === 'string' ? userData : userData.name || `User ${id}`;
          return {
            id,
            name,
            username: name.toString().toLowerCase().replace(/\s+/g, '.')
          };
        });
        
        // For each user, fetch their posts and calculate count
        const usersWithPostCount = await Promise.all(
          users.map(async (user) => {
            try {
              const posts = await fetchUserPosts(user.id);
              return {
                ...user,
                postCount: posts.length,
                // Generate random avatar for display
                avatar: `https://i.pravatar.cc/150?u=${user.id}`
              };
            } catch (error) {
              console.error(`Error fetching posts for user ${user.id}:`, error);
              return { ...user, postCount: 0, avatar: `https://i.pravatar.cc/150?u=${user.id}` };
            }
          })
        );
        
        // Sort users by post count in descending order
        const sortedUsers = usersWithPostCount.sort((a, b) => b.postCount - a.postCount);
        
        // Get top 5 users
        const top5Users = sortedUsers.slice(0, 5);
        
        setTopUsers(top5Users);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching top users:', error);
        setError('Failed to fetch users. Please try again later.');
        setLoading(false);
      }
    };

    getTopUsers();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600">Loading top users...</div>
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
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Top 5 Users by Post Count</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topUsers.map((user) => (
          <div key={user.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-5">
              <div className="flex items-center">
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="h-12 w-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
                  <p className="text-sm text-gray-500">@{user.username}</p>
                </div>
              </div>
              
              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  <span className="text-2xl font-bold text-indigo-600">{user.postCount}</span> posts
                </div>
                <div className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                  #{topUsers.indexOf(user) + 1} Top User
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TopUsers; 