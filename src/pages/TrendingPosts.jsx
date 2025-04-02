import React, { useState, useEffect } from 'react';
import { fetchUsers, fetchUserPosts, fetchPostComments } from '../services/api';

function TrendingPosts() {
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getTrendingPosts = async () => {
      try {
        setLoading(true);
        
        // Fetch all users
        const users = await fetchUsers();
        
        // Fetch all posts from all users
        let allPosts = [];
        for (const user of users) {
          try {
            const userPosts = await fetchUserPosts(user.id);
            // Add user info to each post
            const postsWithUser = userPosts.map(post => ({
              ...post,
              user: {
                id: user.id,
                name: user.name,
                username: user.username,
                avatar: `https://i.pravatar.cc/150?u=${user.id}`
              },
              // Add random image to post
              image: `https://picsum.photos/seed/${post.id}/800/600`
            }));
            allPosts = [...allPosts, ...postsWithUser];
          } catch (error) {
            console.error(`Error fetching posts for user ${user.id}:`, error);
          }
        }
        
        // Fetch comments for each post
        const postsWithComments = await Promise.all(
          allPosts.map(async (post) => {
            try {
              const comments = await fetchPostComments(post.id);
              return {
                ...post,
                comments,
                commentCount: comments.length
              };
            } catch (error) {
              console.error(`Error fetching comments for post ${post.id}:`, error);
              return { ...post, comments: [], commentCount: 0 };
            }
          })
        );
        
        // Find the maximum comment count
        const maxCommentCount = Math.max(...postsWithComments.map(post => post.commentCount));
        
        // Filter posts with the maximum comment count
        const trending = postsWithComments.filter(post => post.commentCount === maxCommentCount);
        
        setTrendingPosts(trending);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching trending posts:', error);
        setError('Failed to fetch trending posts. Please try again later.');
        setLoading(false);
      }
    };

    getTrendingPosts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600">Loading trending posts...</div>
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
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Trending Posts with Most Comments</h2>
      
      {trendingPosts.length === 0 ? (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative">
          No trending posts found.
        </div>
      ) : (
        <div className="space-y-8">
          {trendingPosts.map((post) => (
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
                
                {/* Post stats */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="font-semibold text-indigo-600">{post.commentCount}</span> comments
                  </div>
                  <div className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                    Trending
                  </div>
                </div>
              </div>
              
              {/* Comments section */}
              <div className="bg-gray-50 p-5 border-t border-gray-100">
                <h5 className="text-sm font-medium text-gray-700 mb-3">Top Comments</h5>
                <div className="space-y-3">
                  {post.comments.slice(0, 3).map((comment) => (
                    <div key={comment.id} className="flex space-x-3">
                      <img 
                        src={`https://i.pravatar.cc/150?u=${comment.id}`} 
                        alt="Commenter" 
                        className="h-8 w-8 rounded-full object-cover"
                      />
                      <div className="flex-1 bg-white p-3 rounded-lg shadow-sm">
                        <p className="text-xs font-medium text-gray-900">{comment.name}</p>
                        <p className="text-xs text-gray-700">{comment.body}</p>
                      </div>
                    </div>
                  ))}
                  {post.comments.length > 3 && (
                    <p className="text-xs text-center text-indigo-600 font-medium">
                      +{post.comments.length - 3} more comments
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TrendingPosts; 