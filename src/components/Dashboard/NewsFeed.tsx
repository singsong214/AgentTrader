import { Newspaper, ExternalLink } from 'lucide-react';

interface NewsArticle {
  title: string;
  source: string;
  url?: string;
  publishedAt: string;
}

interface NewsFeedProps {
  articles: NewsArticle[];
  loading: boolean;
}

export function NewsFeed({ articles, loading }: NewsFeedProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-700 rounded w-1/2"></div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-slate-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 h-full">
      <h2 className="text-xl font-bold text-white flex items-center mb-6">
        <Newspaper className="w-5 h-5 mr-2 text-emerald-500" />
        Recent News
      </h2>

      <div className="space-y-4">
        {articles.length > 0 ? (
          articles.map((article, index) => (
            <div key={index} className="p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-white mb-2 leading-snug">
                    {article.title}
                  </h3>
                  <div className="flex items-center space-x-3 text-xs text-slate-400">
                    <span className="font-medium">{article.source}</span>
                    <span>•</span>
                    <span>{formatDate(article.publishedAt)}</span>
                  </div>
                </div>
                {article.url && (
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-3 text-slate-400 hover:text-emerald-500 transition"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <Newspaper className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No news available</p>
          </div>
        )}
      </div>
    </div>
  );
}
