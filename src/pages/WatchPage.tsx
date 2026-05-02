import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ThumbsUp, 
  Share2, 
  MessageSquare, 
  MoreHorizontal, 
  Zap, 
  Menu, 
  Search, 
  Bell, 
  User,
  Loader2,
  ArrowLeft,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Post {
  _id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileType: 'video' | 'image';
  communityId: string;
  creator: {
    _id: string;
    fullName: string;
    username: string;
    profileImage?: string;
    bio?: string;
  };
  views: number;
  likes: number;
  dislikes: number;
  sharesCount: number;
  commentsCount: number;
  createdAt: string;
}

interface CommentData {
  _id: string;
  content: string;
  likesCount: number;
  repliesCount: number;
  createdAt: string;
  userId: {
    _id: string;
    fullName: string;
    username: string;
    profileImage?: string;
  };
  parentCommentId: string | null;
}

const WatchPage = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [suggestedPosts, setSuggestedPosts] = useState<Post[]>([]);
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [expandedReplies, setExpandedReplies] = useState<{ [key: string]: CommentData[] }>({});
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const fetchComments = async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/posts/${id}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  const awardCredits = async () => {
    if (rewardClaimed || !user || !post) return;
    
    try {
      const res = await fetch(`/api/posts/${post._id}/view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ durationMet: true })
      });
      
      if (res.ok) {
        const data = await res.json();
        setRewardClaimed(true);
        if (data.balanceEarned) {
          updateUser({ credits: user.credits + data.balanceEarned });
        }
      }
    } catch (err) {
      console.error('Failed to award credits:', err);
    }
  };

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/posts/${id}`);
        if (res.ok) {
          const data = await res.json();
          setPost(data);
          
          // Fetch suggested posts from same community
          const suggestedRes = await fetch(`/api/posts/community/${data.communityId}?page=1&limit=10`);
          if (suggestedRes.ok) {
            const suggestedData = await suggestedRes.json();
            setSuggestedPosts(suggestedData.posts.filter((p: Post) => p._id !== id).slice(0, 10));
          }
        }
      } catch (err) {
        console.error('Error fetching post:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
    fetchComments();
    setRewardClaimed(false);
    // Scroll to top on load
    window.scrollTo(0, 0);
  }, [id]);

  // Image reward trigger (3 seconds)
  useEffect(() => {
    if (post && post.fileType === 'image' && !rewardClaimed) {
      const timer = setTimeout(() => {
        awardCredits();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [post, rewardClaimed]);

  const handleVideoTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    const progress = (video.currentTime / video.duration) * 100;
    if (progress >= 70 && !rewardClaimed) {
      awardCredits();
    }
  };

  const handleReact = async (type: 'like' | 'dislike') => {
    if (!user || !post) return;
    try {
      const res = await fetch(`/api/posts/${post._id}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
      if (res.ok) {
        const data = await res.json();
        setPost({ ...post, likes: data.likes, dislikes: data.dislikes });
        // Update user credits if earned (handled in backend, let's refresh profile if needed or just assume success)
      }
    } catch (err) {
      console.error('Reaction failed:', err);
    }
  };

  const handleShare = async () => {
    if (!post) return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      await fetch(`/api/posts/${post._id}/share`, { method: 'POST' });
      setPost({ ...post, sharesCount: post.sharesCount + 1 });
      alert("Link copied to clipboard!");
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  const handleAddComment = async (parentCommentId: string | null = null) => {
    if (!user || !post) return;
    const content = parentCommentId ? replyContent : newComment;
    if (!content.trim()) return;

    try {
      const res = await fetch(`/api/posts/${post._id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, parentCommentId })
      });
      if (res.ok) {
        const comment = await res.json();
        // Since we fetch latest comments on any change for simplicity, but we can also append locally
        fetchComments();
        if (parentCommentId) {
          setReplyingTo(null);
          setReplyContent("");
        } else {
          setNewComment("");
        }
        setPost({ ...post, commentsCount: post.commentsCount + 1 });
      }
    } catch (err) {
      console.error('Comment failed:', err);
    }
  };

  const handleReactComment = async (commentId: string) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/comments/${commentId}/react`, { method: 'POST' });
      if (res.ok) {
        fetchComments(); // Refresh comments
        // Also refresh replies if this was a reply
        Object.keys(expandedReplies).forEach(parentId => {
          fetchReplies(parentId);
        });
      }
    } catch (err) {
      console.error('Comment reaction failed:', err);
    }
  };

  const fetchReplies = async (parentId: string) => {
    try {
      const res = await fetch(`/api/posts/${id}/comments?parentId=${parentId}`);
      if (res.ok) {
        const data = await res.json();
        setExpandedReplies(prev => ({ ...prev, [parentId]: data }));
      }
    } catch (err) {
      console.error('Error fetching replies:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg-base transition-colors duration-300">
        <Loader2 className="animate-spin text-brand-lime mb-4" size={48} />
        <p className="text-gray-500 font-medium animate-pulse">Setting up the stage...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg-base p-6 text-center transition-colors duration-300">
        <h1 className="text-4xl font-bold mb-4">Content Missing</h1>
        <p className="text-xl text-gray-500 mb-8">This post might have been moved or deleted.</p>
        <Link to="/communities" className="btn-primary">Browse Communities</Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1700px] mx-auto flex flex-col lg:flex-row gap-6 p-4 lg:p-6 bg-bg-base transition-colors duration-300 min-h-screen">
        {/* Left Column: Player & Info */}
        <div className="flex-1 min-w-0">
          {/* Player Shell */}
          <div className="aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl relative group border border-border-subtle">
            {post.fileType === 'video' ? (
              <video 
                src={post.fileUrl} 
                className="w-full h-full object-contain"
                controls
                autoPlay
                onTimeUpdate={handleVideoTimeUpdate}
              />
            ) : (
              <img 
                src={post.fileUrl} 
                alt={post.title} 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            )}
            {rewardClaimed && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-4 right-4 bg-brand-lime text-black px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 z-10"
              >
                <Zap size={16} className="fill-black" /> +{post.fileType === 'video' ? 2 : 1} Credits Earned
              </motion.div>
            )}
          </div>

          {/* Title and Stats */}
          <div className="mt-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-4 leading-tight">{post.title}</h1>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border-subtle pb-6">
              <div className="flex items-center gap-4">
                <Link to={`/u/${post.creator.username}`} className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 hover:opacity-80 transition-opacity border border-border-subtle">
                  {post.creator.profileImage ? (
                    <img src={post.creator.profileImage} alt={post.creator.username} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-brand-purple text-white font-bold">
                      {post.creator.fullName[0]}
                    </div>
                  )}
                </Link>
                <div>
                  <Link to={`/u/${post.creator.username}`} className="font-bold hover:text-deep-blue block text-lg">{post.creator.fullName}</Link>
                  <span className="text-sm text-gray-500">@{post.creator.username}</span>
                </div>
                <button className="ml-4 px-6 py-2.5 bg-text-base text-bg-base rounded-full font-bold hover:opacity-90 transition-all active:scale-95">
                  Support
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="bg-bg-input rounded-full flex overflow-hidden border border-border-subtle">
                  <button 
                    onClick={() => handleReact('like')}
                    className="px-5 py-2.5 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 font-bold"
                  >
                    <ThumbsUp size={18} /> {post.likes}
                  </button>
                  <div className="w-[1px] bg-border-subtle my-2"></div>
                  <button 
                    onClick={() => handleReact('dislike')}
                    className="px-4 py-2.5 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                  >
                    <ThumbsUp size={18} className="rotate-180" /> <span className="text-sm font-bold">{post.dislikes}</span>
                  </button>
                </div>
                <button 
                  onClick={handleShare}
                  className="bg-bg-input hover:bg-gray-200 dark:hover:bg-gray-800 px-5 py-2.5 rounded-full transition-colors flex items-center gap-2 font-bold border border-border-subtle"
                >
                  <Share2 size={18} /> {post.sharesCount > 0 ? post.sharesCount : 'Share'}
                </button>
                <button className="bg-bg-input hover:bg-gray-200 dark:hover:bg-gray-800 p-2.5 rounded-full transition-colors border border-border-subtle">
                  <MoreHorizontal size={20} />
                </button>
              </div>
            </div>

            {/* Description Box */}
            <div className="mt-6 p-6 bg-bg-input rounded-3xl border border-border-subtle">
              <div className="flex items-center gap-3 font-bold text-sm mb-4">
                <span>{post.views.toLocaleString()} views</span>
                <span>•</span>
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                <span className="text-deep-blue dark:text-blue-400">#{post.communityId}</span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed text-sm md:text-base">
                {post.description || "No description provided."}
              </p>
              <button className="mt-4 text-sm font-bold text-gray-400 hover:text-text-base transition-colors">Show more</button>
            </div>

            {/* Comments Section */}
            <div className="mt-8">
              <h3 className="text-xl font-bold mb-8">{post.commentsCount} Comments</h3>
              <div className="flex gap-4 mb-12">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-bg-input flex items-center justify-center font-bold shrink-0 border border-border-subtle">
                  {user?.profileImage ? (
                    <img src={user.profileImage} className="w-full h-full object-cover" />
                  ) : user ? (
                    user.fullName[0]
                  ) : (
                    <User size={24} className="text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <textarea 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..." 
                    rows={1}
                    className="w-full border-b border-border-subtle focus:border-text-base outline-none pb-2 transition-colors bg-transparent resize-none overflow-hidden text-lg"
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      target.style.height = target.scrollHeight + 'px';
                    }}
                  />
                  <div className="flex justify-end gap-3 mt-3">
                    <button 
                      onClick={() => setNewComment("")}
                      className="px-5 py-2 hover:bg-bg-input rounded-full font-bold text-sm transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => handleAddComment(null)}
                      disabled={!newComment.trim()}
                      className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${
                        newComment.trim() ? 'bg-brand-lime text-black shadow-lg shadow-brand-lime/10' : 'bg-bg-input text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Comment
                    </button>
                  </div>
                </div>
              </div>

              {/* Dynamic Comments List */}
              <div className="space-y-8">
                {comments.map(comment => (
                  <div key={comment._id} className="flex gap-4 group">
                    <div className="w-10 h-10 rounded-full bg-bg-input overflow-hidden shrink-0 border border-border-subtle">
                      {comment.userId.profileImage ? (
                        <img src={comment.userId.profileImage} alt={comment.userId.username} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-brand-purple text-white font-bold">
                          {comment.userId.fullName[0]}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm">@{comment.userId.username}</span>
                        <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm md:text-base text-gray-800 dark:text-gray-200 leading-relaxed overflow-wrap-anywhere">
                        {comment.content}
                      </p>
                      <div className="flex items-center gap-4 mt-3">
                        <button 
                          onClick={() => handleReactComment(comment._id)}
                          className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-text-base transition-colors"
                        >
                          <ThumbsUp size={14} /> {comment.likesCount > 0 ? comment.likesCount : ''}
                        </button>
                        <button 
                          onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                          className="text-xs font-bold text-gray-500 hover:text-text-base transition-colors"
                        >
                          Reply
                        </button>
                        {comment.repliesCount > 0 && (
                          <button 
                            onClick={() => {
                              if (expandedReplies[comment._id]) {
                                const newExpanded = { ...expandedReplies };
                                delete newExpanded[comment._id];
                                setExpandedReplies(newExpanded);
                              } else {
                                fetchReplies(comment._id);
                              }
                            }}
                            className="text-xs text-deep-blue dark:text-blue-400 font-bold hover:underline flex items-center gap-1"
                          >
                            <ChevronDown size={14} className={`transition-transform ${expandedReplies[comment._id] ? 'rotate-180' : ''}`} />
                            {expandedReplies[comment._id] ? 'Hide Replies' : `View ${comment.repliesCount} replies`}
                          </button>
                        )}
                      </div>

                      {/* Render Replies */}
                      {expandedReplies[comment._id] && (
                        <div className="mt-6 space-y-6 pl-4 border-l border-border-subtle">
                          {expandedReplies[comment._id].map(reply => (
                            <div key={reply._id} className="flex gap-3">
                              <div className="w-8 h-8 rounded-full bg-bg-input overflow-hidden shrink-0 border border-border-subtle">
                                {reply.userId.profileImage ? (
                                  <img src={reply.userId.profileImage} alt={reply.userId.username} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-brand-purple text-white font-bold text-xs">
                                    {reply.userId.fullName[0]}
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="font-bold text-xs">@{reply.userId.username}</span>
                                  <span className="text-[10px] text-gray-500">{new Date(reply.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                  {reply.content}
                                </p>
                                <div className="flex items-center gap-4 mt-2">
                                  <button 
                                    onClick={() => handleReactComment(reply._id)}
                                    className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 hover:text-text-base transition-colors"
                                  >
                                    <ThumbsUp size={12} /> {reply.likesCount > 0 ? reply.likesCount : ''}
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Reply Box */}
                      {replyingTo === comment._id && (
                        <div className="mt-6 flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-bg-input border border-border-subtle flex items-center justify-center font-bold text-xs">
                            {user?.fullName[0] || '?'}
                          </div>
                          <div className="flex-1">
                            <textarea 
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              placeholder="Add a reply..." 
                              className="w-full border-b border-border-subtle focus:border-text-base outline-none pb-2 text-sm bg-transparent resize-none"
                              autoFocus
                            />
                            <div className="flex justify-end gap-2 mt-3">
                              <button 
                                onClick={() => setReplyingTo(null)}
                                className="px-4 py-1.5 hover:bg-bg-input rounded-full font-bold text-xs transition-colors"
                              >
                                Cancel
                              </button>
                              <button 
                                onClick={() => handleAddComment(comment._id)}
                                disabled={!replyContent.trim()}
                                className="px-5 py-1.5 bg-brand-lime text-black rounded-full font-bold text-xs transition-all active:scale-95 shadow-lg shadow-brand-lime/10"
                              >
                                Reply
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {comments.length === 0 && (
                  <div className="text-center py-12 bg-bg-input rounded-3xl border-2 border-dashed border-border-subtle">
                    <MessageSquare className="mx-auto text-gray-300 dark:text-gray-700 mb-4" size={48} />
                    <p className="text-gray-400 font-medium font-bold">Be the first to share your thoughts!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Suggested Content */}
        <div className="lg:w-[420px] shrink-0">
          <h2 className="font-bold text-lg mb-6 flex items-center gap-2">
            Suggested for you <div className="p-1 px-2 bg-brand-lime rounded-full flex items-center gap-1 text-[10px] font-bold text-black uppercase tracking-wider"><Zap size={10} className="fill-black" /> Trending</div>
          </h2>
          <div className="space-y-6">
            {suggestedPosts.map(sp => (
              <Link key={sp._id} to={`/watch/${sp._id}`} className="group flex gap-4 p-2 rounded-2xl hover:bg-bg-input transition-all border border-transparent hover:border-border-subtle">
                <div className="w-44 aspect-video rounded-xl overflow-hidden shrink-0 bg-bg-input border border-border-subtle group-hover:shadow-md transition-all">
                  {sp.fileType === 'video' ? (
                    <video src={sp.fileUrl} className="w-full h-full object-cover" />
                  ) : (
                    <img src={sp.fileUrl} alt={sp.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  )}
                </div>
                <div className="min-w-0 flex flex-col justify-center">
                  <h3 className="font-bold text-sm line-clamp-2 leading-tight group-hover:text-deep-blue dark:group-hover:text-blue-400 transition-colors mb-2">
                    {sp.title}
                  </h3>
                  <p className="text-xs text-gray-400 font-medium truncate mb-1">@{sp.creator.username}</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">
                    {sp.views.toLocaleString()} views • {new Date(sp.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}

            {suggestedPosts.length === 0 && (
              <div className="p-10 bg-bg-input rounded-3xl border-2 border-dashed border-border-subtle text-center">
                <p className="text-sm text-gray-400 font-medium">No other content in this community yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
  );
};

export default WatchPage;
