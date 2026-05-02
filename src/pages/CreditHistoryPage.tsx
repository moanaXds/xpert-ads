import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Wallet, 
  Calendar, 
  Tag, 
  ExternalLink,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Transaction {
  _id: string;
  amount: number;
  type: 'earn' | 'spend';
  reason: string;
  postId?: string;
  createdAt: string;
}

const CreditHistoryPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch('/api/user/transactions?page=1&limit=20');
        if (res.ok) {
          const data = await res.json();
          setTransactions(data.transactions);
          setTotalPages(data.totalPages);
        } else {
          setError('Failed to load transaction history');
        }
      } catch (err) {
        setError('An error occurred while fetching transactions');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const handleLoadMore = async () => {
    if (page >= totalPages) return;
    
    setLoadMoreLoading(true);
    const nextPage = page + 1;
    try {
      const res = await fetch(`/api/user/transactions?page=${nextPage}&limit=20`);
      if (res.ok) {
        const data = await res.json();
        setTransactions(prev => [...prev, ...data.transactions]);
        setPage(nextPage);
      }
    } catch (err) {
      console.error('Error loading more transactions:', err);
    } finally {
      setLoadMoreLoading(false);
    }
  };

  const getReasonLabel = (reason: string) => {
    switch (reason) {
      case 'post_ad': return 'Posted Advertisement';
      case 'content_view': return 'Watched Content';
      case 'like_received': return 'Engagement Reward (Like)';
      case 'comment_received': return 'Engagement Reward (Comment)';
      case 'promotion': return 'Profile Promotion';
      default: return reason.replace('_', ' ');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-6">
        <div className="animate-pulse mb-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
            <div className="space-y-2">
              <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-48" />
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-64" />
            </div>
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="card-base p-6 flex items-center justify-between gap-6 animate-pulse">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
                <div className="space-y-2">
                  <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-40" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-32" />
                </div>
              </div>
              <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-brand-lime/10 rounded-2xl text-brand-lime">
            <Wallet size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Credit History</h1>
            <p className="text-gray-500">Track your earnings and expenditures transparently.</p>
          </div>
        </div>
      </motion.div>

      {error ? (
        <div className="p-8 bg-red-50 dark:bg-red-900/10 rounded-3xl border border-red-100 dark:border-red-900/20 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Something went wrong</h2>
          <p className="text-red-500/80">{error}</p>
        </div>
      ) : transactions.length > 0 ? (
        <div className="space-y-4">
          {transactions.map((tx, index) => (
            <motion.div
              key={tx._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card-base p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-brand-lime/30 transition-all"
              id={`transaction-${tx._id}`}
            >
              <div className="flex items-center gap-5">
                <div className={`p-4 rounded-2xl shrink-0 ${
                  tx.type === 'earn' 
                    ? 'bg-brand-lime/10 text-brand-lime' 
                    : 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                }`}>
                  {tx.type === 'earn' ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-text-base">
                    {getReasonLabel(tx.reason)}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      {formatDate(tx.createdAt)}
                    </span>
                    <span className="flex items-center gap-1.5 capitalize">
                      <Tag size={14} />
                      {tx.type === 'earn' ? 'Earned' : 'Spent'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-none pt-4 md:pt-0">
                <div className="text-right">
                  <div className={`text-2xl font-black ${
                    tx.type === 'earn' ? 'text-brand-lime' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {tx.type === 'earn' ? '+' : '-'}{tx.amount}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Credits</div>
                </div>
                
                {tx.postId && (
                  <Link 
                    to={`/watch/${tx.postId}`}
                    className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-400 hover:text-brand-lime hover:bg-brand-lime/10 transition-all"
                    title="View post"
                  >
                    <ExternalLink size={20} />
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
          
          {page < totalPages ? (
            <div className="flex justify-center pt-8">
              <button
                onClick={handleLoadMore}
                disabled={loadMoreLoading}
                className="btn-primary px-10 py-4 flex items-center gap-2"
              >
                {loadMoreLoading ? <Loader2 size={20} className="animate-spin" /> : 'Load More Transactions'}
              </button>
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-sm text-gray-500 italic">You've reached the end of your transaction history.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="card-base p-20 text-center">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
            <Wallet size={40} />
          </div>
          <h2 className="text-2xl font-bold mb-2">No Transactions Yet</h2>
          <p className="text-gray-500 max-w-sm mx-auto">
            You haven't earned or spent any credits yet. Start watching content or post an advertisement to see history here!
          </p>
          <Link to="/" className="btn-primary mt-8 inline-block px-8">
            Explore Campaigns
          </Link>
        </div>
      )}
    </div>
  );
};

export default CreditHistoryPage;
