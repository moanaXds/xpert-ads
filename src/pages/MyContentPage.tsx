import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Zap, 
  Loader2,
  Play,
  Image as ImageIcon,
  MessageSquare,
  ThumbsUp,
  PlusCircle,
  Eye
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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

const MyContentPage = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });

  const fetchMyPosts = async (page = 1) => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/posts/user/${user.username}?page=${page}&limit=12`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts);
        setPagination({ currentPage: data.currentPage, totalPages: data.totalPages });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPosts();
  }, [user]);

  if (!user) return null;

  if (loading && pagination.currentPage === 1) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-lime" size={48} />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-12 max-w-[1400px] mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold mb-2">Your Content</h1>
          <p className="text-gray-500">Manage and track your advertising campaigns.</p>
        </div>
        <Link to="/upload" className="btn-primary py-4 px-8 flex items-center gap-2 shadow-xl shadow-brand-lime/20">
          <PlusCircle size={20} /> Create New Post
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {posts.map(post => (
          <motion.div
            key={post._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-base overflow-hidden hover:shadow-2xl hover:border-brand-lime/20 group flex flex-col"
          >
            <Link to={`/watch/${post._id}`} className="block relative aspect-video bg-black shrink-0">
              {post.fileType === 'video' ? (
                <video src={post.fileUrl} className="w-full h-full object-cover" />
              ) : (
                <img src={post.fileUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                  <Eye className="text-white" size={24} />
                </div>
              </div>
              <div className="absolute top-3 left-3 px-3 py-1 bg-black/50 backdrop-blur-md rounded-full text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-1.5 shadow-lg border border-white/10">
                {post.fileType === 'video' ? <Play size={10} className="fill-white" /> : <ImageIcon size={10} />}
                {post.fileType}
              </div>
            </Link>
            <div className="p-6 flex-1 flex flex-col">
              <h3 className="font-bold text-lg mb-4 line-clamp-1 group-hover:text-deep-blue transition-colors">{post.title}</h3>
              
              <div className="mt-auto grid grid-cols-3 gap-2 border-t border-border-subtle pt-4">
                <div className="text-center">
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter mb-0.5">Views</div>
                  <div className="font-bold text-sm">{post.views.toLocaleString()}</div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter mb-0.5">Likes</div>
                  <div className="font-bold text-sm">{post.likes}</div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter mb-0.5">Comm.</div>
                  <div className="font-bold text-sm">{post.commentsCount}</div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {posts.length === 0 && !loading && (
        <div className="card-base p-24 text-center border-4 border-dashed flex flex-col items-center max-w-2xl mx-auto mt-12">
           <div className="w-24 h-24 bg-bg-input rounded-full flex items-center justify-center mb-8 text-gray-300 dark:text-gray-700">
              <PlusCircle size={48} />
           </div>
           <h2 className="text-3xl font-bold mb-4">No content yet!</h2>
           <p className="text-gray-500 dark:text-gray-400 mb-10 max-w-sm">
             You haven't uploaded any advertising material yet. Start your first campaign to grow your audience today.
           </p>
           <Link to="/upload" className="btn-primary py-4 px-10 rounded-2xl">
              Create Your First Post
           </Link>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-16 flex justify-center items-center gap-6">
          <button 
            disabled={pagination.currentPage === 1}
            onClick={() => fetchMyPosts(pagination.currentPage - 1)}
            className="w-12 h-12 flex items-center justify-center bg-bg-card rounded-full font-bold shadow-sm disabled:opacity-30 border border-border-subtle hover:bg-bg-input transition-colors"
          >
            ←
          </button>
          <span className="font-bold text-gray-400">Page {pagination.currentPage} / {pagination.totalPages}</span>
          <button 
            disabled={pagination.currentPage === pagination.totalPages}
            onClick={() => fetchMyPosts(pagination.currentPage + 1)}
            className="w-12 h-12 flex items-center justify-center bg-bg-card rounded-full font-bold shadow-sm disabled:opacity-30 border border-border-subtle hover:bg-bg-input transition-colors"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
};

export default MyContentPage;
