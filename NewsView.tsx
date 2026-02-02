
import React from 'react';
import { NewsItem } from './types';
import BannerAd from './BannerAd';

interface NewsViewProps {
  news: NewsItem[];
  isLoading: boolean;
  onRefresh: (category?: string) => void;
  selectedCategory: string;
  language: string;
  isPremium: boolean;
}

const NEWS_CATEGORIES = [
  { name: 'Discovery', icon: '✨' },
  { name: 'Technology', icon: '💻' },
  { name: 'Science', icon: '🔬' },
  { name: 'Health', icon: '🏥' },
  { name: 'Politics', icon: '🏛️' },
  { name: 'International', icon: '🌍' },
  { name: 'Business', icon: '📈' },
  { name: 'Entertainment', icon: '🎭' }
];

const NewsView: React.FC<NewsViewProps> = ({ news, isLoading, onRefresh, selectedCategory, language, isPremium }) => {
  const categories: Record<string, string> = {
    'technology': 'bg-blue-100 text-blue-600',
    'science': 'bg-emerald-100 text-emerald-600',
    'ai': 'bg-purple-100 text-purple-600',
    'education': 'bg-amber-100 text-amber-600',
    'space': 'bg-indigo-100 text-indigo-600',
    'health': 'bg-rose-100 text-rose-600',
    'politics': 'bg-red-100 text-red-600',
    'international': 'bg-sky-100 text-sky-600',
    'business': 'bg-green-100 text-green-600'
  };

  const getCategoryStyles = (cat: string) => {
    const lowCat = cat.toLowerCase();
    const key = Object.keys(categories).find(k => lowCat.includes(k));
    return key ? categories[key] : 'bg-slate-100 text-slate-600';
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-12 lg:p-16">
      <div className="max-w-4xl mx-auto space-y-10 pb-20">
        
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-4xl font-black text-slate-900 mb-2">Daily Mastery Feed</h2>
            <p className="text-slate-500 font-medium">Real-time global news curated for the lifelong learner.</p>
          </div>
          <button 
            onClick={() => onRefresh(selectedCategory)}
            disabled={isLoading}
            className="flex items-center space-x-2 px-6 py-3 bg-white border border-slate-200 text-indigo-600 font-black rounded-2xl hover:bg-indigo-50 transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <i className={`fas fa-sync-alt ${isLoading ? 'animate-spin' : ''}`}></i>
            <span>Refresh</span>
          </button>
        </header>

        {/* Category Pill Selector */}
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-4 -mx-2 px-2">
          {NEWS_CATEGORIES.map(cat => (
            <button
              key={cat.name}
              onClick={() => onRefresh(cat.name)}
              disabled={isLoading}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-2xl font-black text-xs whitespace-nowrap transition-all border-2 ${
                selectedCategory === cat.name 
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' 
                  : 'bg-white border-slate-100 text-slate-500 hover:border-indigo-200 hover:text-indigo-600'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        <BannerAd isPremium={isPremium} type="fluid" />

        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white p-8 rounded-[40px] border border-slate-100 animate-pulse space-y-4">
                <div className="h-4 w-24 bg-slate-100 rounded-full"></div>
                <div className="h-8 w-3/4 bg-slate-50 rounded-xl"></div>
                <div className="h-4 w-full bg-slate-50 rounded-xl"></div>
                <div className="h-4 w-1/2 bg-slate-50 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[48px] border border-slate-100">
             <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
               <i className="fas fa-newspaper text-3xl"></i>
             </div>
             <h3 className="text-2xl font-black text-slate-800 mb-2">No {selectedCategory} news found</h3>
             <p className="text-slate-500 mb-8">Try refreshing the feed to scan for global updates.</p>
             <button onClick={() => onRefresh(selectedCategory)} className="px-8 py-4 bg-indigo-600 text-white font-black rounded-2xl">Try Again</button>
          </div>
        ) : (
          <div className="space-y-6">
            {news.map((item, idx) => (
              <div 
                key={item.id} 
                className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all group animate-in slide-in-from-bottom-8 duration-500"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${getCategoryStyles(item.category)}`}>
                      {item.category}
                    </span>
                    <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-slate-50 text-slate-400">
                      {item.source}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-300 font-bold uppercase">{new Date(item.timestamp).toLocaleDateString()}</span>
                </div>

                <h3 className="text-2xl font-black text-slate-800 mb-4 group-hover:text-indigo-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-slate-600 leading-relaxed font-medium mb-8">
                  {item.summary}
                </p>

                <div className="flex items-center justify-between">
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center space-x-2 text-indigo-600 font-black text-sm hover:underline"
                  >
                    <span>Read Full Article</span>
                    <i className="fas fa-external-link-alt text-xs"></i>
                  </a>
                  
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-indigo-50 flex items-center justify-center text-indigo-600 text-[10px] font-black"><i className="fas fa-brain"></i></div>
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-amber-50 flex items-center justify-center text-amber-600 text-[10px] font-black"><i className="fas fa-search"></i></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsView;
