import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Zap, 
  ArrowLeft,
  Loader2,
  Play,
  Image as ImageIcon,
  MessageSquare,
  ThumbsUp
} from 'lucide-react';

interface Post {
  _id: string;
  title: string;
  fileUrl: string;
  fileType: 'video' | 'image';
  views: number;
  likes: number;
  commentsCount: number;
  createdAt: string;
}

const UserContentPage = () => {
  const { username } = useParams<{ username: string }>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUserPosts = async (pageToFetch = 1, isLoadMore = false) => {
    if (isLoadMore) setLoadMoreLoading(true);
    else setLoading(true);
    
    try {
      const res = await fetch(`/api/posts/user/${username}?page=${pageToFetch}&limit=12`);
      if (res.ok) {
        const data = await res.json();
        if (isLoadMore) {
          setPosts(prev => [...prev, ...data.posts]);
        } else {
          setPosts(data.posts);
        }
        setPage(data.currentPage);
        setTotalPages(data.totalPages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadMoreLoading(false);
    }
  };

  useEffect(() => {
    fetchUserPosts(1, false);
  }, [username]);

  const handleLoadMore = () => {
    if (page < totalPages) {
      fetchUserPosts(page + 1, true);
    }
  };

  const SkeletonCard = () => (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm p-4 animate-pulse">
      <div className="aspect-video bg-gray-100 rounded-2xl mb-4" />
      <div className="h-5 bg-gray-100 rounded w-3/4 mb-2" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
    </div>
  );

  if (loading && page === 1) {
    return (
      <div className="min-h-screen bg-light-gray p-6 md:p-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div className="w-12 h-12 bg-white rounded-full animate-pulse" />
            <div className="h-8 bg-white rounded w-64 animate-pulse" />
            <div className="w-10" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <SkeletonCard key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-gray p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <Link to={`/u/${username}`} className="p-3 rounded-full bg-white hover:bg-gray-200 transition-colors shadow-sm">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-3xl font-bold">Latest from @{username}</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {posts.map(post => (
            <motion.div
              key={post._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all group"
            >
              <Link to={`/watch/${post._id}`} className="block relative aspect-video bg-black">
                {post.fileType === 'video' ? (
                  <video src={post.fileUrl} className="w-full h-full object-cover" />
                ) : (
                  <img src={post.fileUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                )}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    {post.fileType === 'video' ? <Play className="text-white fill-white" size={24} /> : <ImageIcon className="text-white" size={24} />}
                  </div>
                </div>
              </Link>
              <div className="p-5">
                <h3 className="font-bold mb-3 line-clamp-1">{post.title}</h3>
                <div className="flex items-center justify-between text-xs text-gray-400 font-bold uppercase tracking-wider">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1"><ThumbsUp size={12} /> {post.likes}</span>
                    <span className="flex items-center gap-1"><MessageSquare size={12} /> {post.commentsCount}</span>
                  </div>
                  <span>{post.views} views</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {posts.length === 0 && !loading && (
          <div className="bg-white rounded-3xl p-20 text-center border-4 border-dashed border-gray-100 flex flex-col items-center">
             <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300">
                <Zap size={40} />
             </div>
             <h2 className="text-2xl font-bold mb-2">No Content Yet</h2>
             <p className="text-gray-500">@{username} hasn't uploaded anything here yet.</p>
          </div>
        )}

        {/* Pagination/Load More */}
        {page < totalPages && (
          <div className="mt-12 flex justify-center">
            <button 
              disabled={loadMoreLoading}
              onClick={handleLoadMore}
              className="px-10 py-4 bg-brand-lime text-black rounded-full font-bold shadow-lg shadow-brand-lime/10 flex items-center gap-2 hover:scale-105 transition-all active:scale-95 disabled:opacity-50"
            >
              {loadMoreLoading ? <Loader2 size={20} className="animate-spin" /> : 'Load More Content'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserContentPage;
