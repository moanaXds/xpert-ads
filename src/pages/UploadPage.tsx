import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Upload, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Video,
  Image as ImageIcon,
  ArrowLeft,
  Zap
} from 'lucide-react';
import { COMMUNITIES } from './CommunitiesPage';

const UploadPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [communityId, setCommunityId] = useState(COMMUNITIES[0].id);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'video' | 'image'>('image');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit for demo
        setError('File size too large. Please select a file under 10MB.');
        return;
      }
      
      setFile(selectedFile);
      setError('');
      
      const isVideo = selectedFile.type.startsWith('video/');
      setFileType(isVideo ? 'video' : 'image');
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !previewUrl) {
      setError('Please select a file to upload.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          fileUrl: previewUrl, // Storing base64 in Mongo for demo
          fileType,
          communityId
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Upload failed');
      }

      setSuccess(true);
      setTimeout(() => {
        navigate(`/community/${communityId}`);
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base p-6 md:p-12 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 flex items-center justify-between">
          <div>
            <Link to="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-text-base mb-4 transition-colors">
              <ArrowLeft size={20} /> Back to Dashboard
            </Link>
            <h1 className="text-4xl font-bold tracking-tight">Upload Content</h1>
          </div>
        </header>
 
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Form Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card-base p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold mb-2">Title</label>
                <input 
                  type="text" 
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give your content a catchy title"
                  className="w-full p-4 bg-bg-input rounded-2xl border-none focus:ring-2 focus:ring-brand-lime transition-all"
                />
              </div>
 
              <div>
                <label className="block text-sm font-bold mb-2">Description (Optional)</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us more about this..."
                  className="w-full p-4 bg-bg-input rounded-2xl border-none focus:ring-2 focus:ring-brand-lime transition-all h-32 resize-none"
                />
              </div>
 
              <div>
                <label className="block text-sm font-bold mb-2">Select Community</label>
                <select 
                  value={communityId}
                  onChange={(e) => setCommunityId(e.target.value)}
                  className="w-full p-4 bg-bg-input rounded-2xl border-none focus:ring-2 focus:ring-brand-lime transition-all appearance-none"
                >
                  {COMMUNITIES.map(c => (
                    <option key={c.id} value={c.id} className="bg-bg-card">{c.name}</option>
                  ))}
                </select>
              </div>
 
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl flex items-center gap-3 text-sm font-medium">
                  <AlertCircle size={18} /> {error}
                </div>
              )}
 
              {success && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-2xl flex items-center gap-3 text-sm font-medium">
                  <CheckCircle2 size={18} /> Upload successful! Redirecting...
                </div>
              )}
 
              <button 
                type="submit" 
                disabled={loading || success}
                className="w-full py-5 bg-brand-lime text-black rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform shadow-lg disabled:opacity-50 disabled:scale-100"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Upload size={20} />}
                {loading ? 'Uploading...' : 'Publish Content'}
              </button>
            </form>
          </motion.div>
 
          {/* Preview Section */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <label className="block text-sm font-bold mb-4">Media Preview</label>
            <div className="flex-1 bg-bg-card rounded-3xl border-2 border-dashed border-border-subtle flex flex-col items-center justify-center p-4 relative overflow-hidden min-h-[400px]">
              {previewUrl ? (
                <div className="w-full h-full flex flex-col items-center">
                  <button 
                    onClick={() => { setFile(null); setPreviewUrl(null); }}
                    className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black transition-colors z-10"
                  >
                    <X size={20} />
                  </button>
                  
                  {fileType === 'video' ? (
                    <video 
                      src={previewUrl} 
                      controls 
                      className="w-full h-full object-contain rounded-2xl"
                    />
                  ) : (
                    <img 
                      src={previewUrl} 
                      className="w-full h-full object-contain rounded-2xl" 
                      alt="Preview" 
                    />
                  )}
                </div>
              ) : (
                <div className="text-center p-8">
                  <div className="w-20 h-20 bg-bg-input rounded-full flex items-center justify-center mx-auto mb-6">
                    <Upload size={32} className="text-gray-400 dark:text-gray-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Select your media</h3>
                  <p className="text-gray-500 mb-8">Videos and photos are supported (Max 10MB)</p>
                  <label className="btn-primary cursor-pointer inline-flex items-center gap-2">
                    <ImageIcon size={20} /> Browse Files
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="video/*,image/*"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              )}
            </div>
            
            <div className="mt-6 p-6 bg-deep-blue text-white rounded-3xl flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                <Zap size={24} className="text-brand-lime" />
              </div>
              <div>
                <h4 className="font-bold">Promotion Ready</h4>
                <p className="text-sm text-white/60">Your content will be visible in the {COMMUNITIES.find(c => c.id === communityId)?.name} community.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
