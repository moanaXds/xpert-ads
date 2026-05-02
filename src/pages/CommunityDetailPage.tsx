import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Zap, 
  Search, 
  Menu, 
  Bell, 
  User, 
  ThumbsUp, 
  ThumbsDown, 
  Share2, 
  MessageSquare, 
  MoreVertical,
  Play,
  ArrowLeft,
  Loader2,
  PlusCircle,
  Clock,
  TrendingUp,
  Video as VideoIcon,
  Image as ImageIcon,
  Eye,
  EyeOff,
  Filter,
  ChevronDown
} from 'lucide-react';
import { COMMUNITIES } from './CommunitiesPage';

const CommunityDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const community = COMMUNITIES.find(c => c.id === id);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filter States
  const [sort, setSort] = useState('newest');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page: '1',
          limit: '12',
          sort,
          type: filterType,
          status: filterStatus
        });
        const res = await fetch(`/api/posts/community/${id}?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setPosts(data.posts);
          setTotalPages(data.totalPages);
        }
      } catch (err) {
        console.error('Error fetching posts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
    setPage(1); // Reset page on filter change
  }, [id, sort, filterType, filterStatus]);

  const handleLoadMore = async () => {
    if (page >= totalPages) return;
    
    setLoadMoreLoading(true);
    const nextPage = page + 1;
    try {
      const queryParams = new URLSearchParams({
        page: nextPage.toString(),
        limit: '12',
        sort,
        type: filterType,
        status: filterStatus
      });
      const res = await fetch(`/api/posts/community/${id}?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(prev => [...prev, ...data.posts]);
        setPage(nextPage);
      }
    } catch (err) {
      console.error('Error loading more posts:', err);
    } finally {
      setLoadMoreLoading(false);
    }
  };

  if (!community) return <div>Community not found</div>;

  const SkeletonCard = () => (
    <div className="animate-pulse">
      <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-3xl mb-4" />
      <div className="flex gap-4">
        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-2xl shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg-base transition-colors duration-300">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 sticky top-16 h-[calc(100vh-64px)] p-4 border-r border-border-subtle overflow-y-auto">
          <Link to="/communities" className="flex items-center gap-4 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl font-medium transition-colors mb-2">
            <ArrowLeft size={20} /> Back to All
          </Link>
          <div className="h-px bg-border-subtle my-4" />
          <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">COMMUNITIES</div>
          <div className="space-y-1">
            {COMMUNITIES.map(c => (
              <Link 
                key={c.id} 
                to={`/community/${c.id}`}
                className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${c.id === id ? 'bg-brand-lime text-black font-bold' : 'hover:bg-gray-100 dark:hover:bg-gray-800 font-medium'}`}
              >
                <div className={`w-8 h-8 ${c.color} rounded-lg flex items-center justify-center text-white shrink-0`}>
                  {React.cloneElement(c.icon as React.ReactElement, { size: 16 })}
                </div>
                <span className="truncate">{c.name}</span>
              </Link>
            ))}
          </div>
        </aside>

        {/* Feed */}
        <main className="flex-1 p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Community Banner */}
            <div className={`w-full h-64 ${community.color} rounded-[2.5rem] mb-12 flex flex-col items-center justify-center text-white p-8 text-center relative overflow-hidden shadow-2xl`}>
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10">
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mb-6 mx-auto border border-white/30"
                >
                  {React.cloneElement(community.icon as React.ReactElement, { size: 48 })}
                </motion.div>
                <h1 className="text-5xl font-bold mb-3 tracking-tight">{community.name}</h1>
                <p className="text-white/80 max-w-md mx-auto text-lg">{community.desc}</p>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 bg-white dark:bg-gray-900 p-6 rounded-3xl border border-border-subtle shadow-sm">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl">
                  {[
                    { id: 'all', label: 'All', icon: <Filter size={14} /> },
                    { id: 'video', label: 'Videos', icon: <VideoIcon size={14} /> },
                    { id: 'image', label: 'Photos', icon: <ImageIcon size={14} /> }
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => setFilterType(t.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                        filterType === t.id 
                          ? 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm' 
                          : 'text-gray-500 hover:text-text-base'
                      }`}
                    >
                      {t.icon} {t.label}
                    </button>
                  ))}
                </div>

                <div className="h-8 w-px bg-border-subtle hidden sm:block mx-2" />

                <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl">
                  {[
                    { id: 'all', label: 'Any Status' },
                    { id: 'unseen', label: 'Unseen', icon: <EyeOff size={14} /> },
                    { id: 'seen', label: 'Seen', icon: <Eye size={14} /> }
                  ].map(s => (
                    <button
                      key={s.id}
                      onClick={() => setFilterStatus(s.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                        filterStatus === s.id 
                          ? 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm' 
                          : 'text-gray-500 hover:text-text-base'
                      }`}
                    >
                      {s.icon} {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-gray-400">Sort by:</span>
                <select 
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="bg-gray-100 dark:bg-gray-800 border-none rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-lime/20 cursor-pointer outline-none min-w-[140px]"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="hottest">Hottest Now</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
              </div>
            ) : posts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {posts.map(post => (
                  <Link key={post._id} to={`/watch/${post._id}`} className="group cursor-pointer">
                    {/* Media Container */}
                    <div className="relative aspect-video rounded-3xl overflow-hidden mb-4 bg-gray-100 dark:bg-gray-900 border border-border-subtle shadow-sm group-hover:shadow-xl group-hover:border-brand-lime/20 transition-all duration-300">
                      {post.fileType === 'video' ? (
                        <video 
                          src={post.fileUrl} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img 
                          src={post.fileUrl} 
                          alt={post.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                      )}
                      
                      {post.fileType === 'video' && (
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black shadow-xl">
                            <Play fill="black" size={24} />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gray-200 dark:bg-gray-800 flex-shrink-0 overflow-hidden border border-border-subtle">
                        {post.creator?.profileImage ? (
                          <img src={post.creator.profileImage} alt={post.creator.username} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-deep-blue text-white font-bold">
                            {post.creator?.username?.[0]?.toUpperCase() || '?'}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg leading-tight mb-1 line-clamp-2 group-hover:text-deep-blue transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-sm text-gray-400 font-medium mb-1">@{post.creator?.username || 'anonymous'}</p>
                        <p className="text-xs text-gray-500">{post.views || 0} views • {new Date(post.createdAt).toLocaleDateString()}</p>
                        
                        {/* Visual Buttons */}
                        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border-subtle">
                          <button className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-text-base transition-colors">
                            <ThumbsUp size={14} /> {post.likes || 0}
                          </button>
                          <button className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-text-base transition-colors">
                            <MessageSquare size={14} /> 0
                          </button>
                          <button className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-text-base transition-colors">
                            <Share2 size={14} /> Share
                          </button>
                        </div>
                      </div>
                      <button className="p-2 h-fit hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical size={20} />
                      </button>
                    </div>
                  </Link>
                ))}
              </div>
              {page < totalPages && (
                <div className="mt-12 flex justify-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadMoreLoading}
                    className="btn-primary px-10 py-4 flex items-center gap-2"
                  >
                    {loadMoreLoading ? <Loader2 size={20} className="animate-spin" /> : 'Load More Content'}
                  </button>
                </div>
              )}
            </>
          ) : (
              <div className="flex flex-col items-center justify-center py-24 bg-gray-50/50 dark:bg-gray-900/50 rounded-[3rem] border-4 border-dashed border-border-subtle">
                <div className="w-24 h-24 bg-bg-base rounded-full flex items-center justify-center mb-8 shadow-sm">
                  <PlusCircle size={40} className="text-gray-300" />
                </div>
                <h3 className="text-2xl font-bold mb-3">No content yet</h3>
                <p className="text-gray-500 mb-10 max-w-sm text-center text-lg">Be the first to promote your content in the {community.name} community!</p>
                <Link to="/upload" className="btn-primary py-5 px-10 rounded-2xl">Upload Now</Link>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CommunityDetailPage;
