import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useCircleProgram } from '../hooks/useCircleProgram';
import { useStore } from '../store/useStore';
import { CircleCard } from './CircleCard';
import { CircleDetail } from './CircleDetail';
import { CreateCircleForm } from './CreateCircleForm';
import { FairScoreCard } from './FairScoreCard';
import { WalletBalance } from './WalletBalance';
import type { Circle } from '../types';
import { 
  Compass, 
  Users, 
  Plus, 
  Loader2,
  CircleDot,
  Search,
  Eye,
  Sparkles,
  RefreshCw,
  TrendingUp
} from 'lucide-react';

export function Dashboard() {
  const { connected, publicKey } = useWallet();
  const { fetchAllCircles } = useCircleProgram();
  const { 
    activeTab, 
    setActiveTab, 
    circles, 
    setCircles, 
    circlesLoading, 
    setCirclesLoading,
    hiddenCircles,
    hideCircle,
    unhideCircle,
  } = useStore();
  const [selectedCircle, setSelectedCircle] = useState<Circle | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showHidden, setShowHidden] = useState(false);

  useEffect(() => {
    if (connected) {
      loadCircles();
    }
  }, [connected]);

  const loadCircles = async () => {
    setCirclesLoading(true);
    try {
      const allCircles = await fetchAllCircles();
      setCircles(allCircles);
    } catch (error) {
      console.error('Failed to load circles:', error);
    } finally {
      setCirclesLoading(false);
    }
  };

  const tabs = [
    { id: 'discover' as const, label: 'Discover', icon: Compass, description: 'Find circles to join' },
    { id: 'my-circles' as const, label: 'My Circles', icon: Users, description: 'Your active circles' },
    { id: 'create' as const, label: 'Create', icon: Plus, description: 'Start a new circle' },
  ];

  // Handle hiding a circle
  const handleHideCircle = useCallback((circleAddress: string) => {
    hideCircle(circleAddress);
  }, [hideCircle]);

  // Count of hidden completed circles for the badge
  const hiddenCompletedCount = circles.filter(c => 
    c.status === 'Completed' && hiddenCircles.includes(c.address.toBase58())
  ).length;

  const filteredCircles = circles.filter(circle => {
    const matchesSearch = circle.name.toLowerCase().includes(searchQuery.toLowerCase());
    const circleAddress = circle.address.toBase58();
    
    // Filter out hidden circles unless showHidden is true
    // Only hide completed circles, not forming or active ones
    const isHidden = circle.status === 'Completed' && hiddenCircles.includes(circleAddress);
    if (isHidden && !showHidden) return false;
    
    if (activeTab === 'my-circles') {
      return matchesSearch && circle.members.some(m => publicKey?.equals(m.address));
    }
    return matchesSearch;
  });

  const formingCircles = filteredCircles.filter(c => c.status === 'Forming');
  const activeCircles = filteredCircles.filter(c => c.status === 'Active');
  const completedCircles = filteredCircles.filter(c => c.status === 'Completed');

  if (selectedCircle) {
    return (
      <CircleDetail 
        circle={selectedCircle} 
        onBack={() => setSelectedCircle(null)} 
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Tabs - Enhanced design */}
      <div className="glass-card rounded-2xl p-2">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group flex-1 flex items-center gap-3 px-5 py-3.5 rounded-xl font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                <div className={`p-2 rounded-lg transition-colors ${
                  isActive ? 'bg-white/20' : 'bg-zinc-800 group-hover:bg-zinc-700'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold">{tab.label}</div>
                  <div className={`text-xs ${isActive ? 'text-emerald-200' : 'text-zinc-500'} hidden sm:block`}>
                    {tab.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Create Tab */}
      {activeTab === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up">
          <div className="lg:col-span-2">
            <CreateCircleForm />
          </div>
          <div className="space-y-6">
            <FairScoreCard />
          </div>
        </div>
      )}

      {/* Discover / My Circles Tabs */}
      {(activeTab === 'discover' || activeTab === 'my-circles') && (
        <div className="animate-fade-in-up">
          {/* Search Bar - Enhanced */}
          <div className="relative mb-8">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search circles by name..."
              className="w-full pl-14 pr-14 py-4 glass-card rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
            />
            <button
              onClick={loadCircles}
              disabled={circlesLoading}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors disabled:opacity-50"
              title="Refresh circles"
            >
              <RefreshCw className={`w-4 h-4 ${circlesLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Circle Lists */}
            <div className="lg:col-span-2 space-y-10">
              {circlesLoading ? (
                <div className="flex flex-col items-center justify-center py-24 glass-card rounded-2xl">
                  <div className="relative">
                    <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
                    <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping" />
                  </div>
                  <p className="text-zinc-500 mt-4 text-sm">Loading circles...</p>
                </div>
              ) : filteredCircles.length === 0 ? (
                <div className="text-center py-20 glass-card rounded-2xl">
                  <div className="p-4 rounded-2xl bg-zinc-800/50 w-fit mx-auto mb-6">
                    <CircleDot className="w-12 h-12 text-zinc-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-300 mb-3">No Circles Found</h3>
                  <p className="text-zinc-500 max-w-md mx-auto mb-8 leading-relaxed">
                    {activeTab === 'my-circles' 
                      ? "You haven't joined any circles yet. Discover available circles or create your own to get started."
                      : "No circles match your search. Try a different query or create a new circle."}
                  </p>
                  {activeTab === 'my-circles' && (
                    <button
                      onClick={() => setActiveTab('discover')}
                      className="btn-primary px-8 py-3.5 rounded-xl text-white font-semibold"
                    >
                      <Compass className="w-4 h-4 inline mr-2" />
                      Discover Circles
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {/* Forming Circles */}
                  {formingCircles.length > 0 && (
                    <section>
                      <div className="flex items-center gap-3 mb-5">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                          <Sparkles className="w-4 h-4 text-blue-400" />
                        </div>
                        <h2 className="text-lg font-semibold text-white">Forming</h2>
                        <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium">
                          {formingCircles.length}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 gap-5">
                        {formingCircles.map((circle, index) => (
                          <div 
                            key={circle.address.toBase58()} 
                            className="animate-fade-in-up opacity-0" 
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <CircleCard
                              circle={circle}
                              onSelect={() => setSelectedCircle(circle)}
                            />
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Active Circles */}
                  {activeCircles.length > 0 && (
                    <section>
                      <div className="flex items-center gap-3 mb-5">
                        <div className="p-2 rounded-lg bg-emerald-500/10">
                          <TrendingUp className="w-4 h-4 text-emerald-400" />
                        </div>
                        <h2 className="text-lg font-semibold text-white">Active</h2>
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium animate-pulse">
                          {activeCircles.length}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 gap-5">
                        {activeCircles.map((circle, index) => (
                          <div 
                            key={circle.address.toBase58()} 
                            className="animate-fade-in-up opacity-0" 
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <CircleCard
                              circle={circle}
                              onSelect={() => setSelectedCircle(circle)}
                            />
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Completed Circles */}
                  {(completedCircles.length > 0 || hiddenCompletedCount > 0) && (
                    <section>
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-purple-500/10">
                            <CircleDot className="w-4 h-4 text-purple-400" />
                          </div>
                          <h2 className="text-lg font-semibold text-white">Completed</h2>
                          <span className="px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-medium">
                            {completedCircles.length}
                          </span>
                        </div>
                        {hiddenCompletedCount > 0 && (
                          <button
                            onClick={() => setShowHidden(!showHidden)}
                            className="flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-zinc-800"
                          >
                            <Eye className="w-4 h-4" />
                            {showHidden ? 'Hide' : 'Show'} {hiddenCompletedCount} hidden
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 gap-5">
                        {completedCircles.map((circle, index) => {
                          const circleAddress = circle.address.toBase58();
                          const isHidden = hiddenCircles.includes(circleAddress);
                          return (
                            <div 
                              key={circleAddress} 
                              className={`${isHidden ? 'opacity-50' : ''} animate-fade-in-up opacity-0`}
                              style={{ animationDelay: `${index * 50}ms` }}
                            >
                              <CircleCard
                                circle={circle}
                                onSelect={() => setSelectedCircle(circle)}
                                showDismiss={activeTab === 'my-circles'}
                                onDismiss={() => handleHideCircle(circleAddress)}
                              />
                              {isHidden && (
                                <button
                                  onClick={() => unhideCircle(circleAddress)}
                                  className="mt-3 text-xs text-zinc-500 hover:text-emerald-400 transition-colors"
                                >
                                  Restore to list
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  )}
                </>
              )}
            </div>

            {/* Sidebar - Enhanced */}
            <div className="space-y-6">
              <WalletBalance />
              <FairScoreCard />
              
              {/* Quick Info - Enhanced */}
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2 rounded-lg bg-emerald-500/10">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h3 className="font-semibold text-white">How It Works</h3>
                </div>
                <ol className="space-y-4 text-sm">
                  {[
                    'Join a circle that matches your FairScore tier',
                    'Contribute SOL each round to the shared pool',
                    'Receive the full pool when it\'s your turn',
                    'Higher FairScore = earlier payout position'
                  ].map((step, index) => (
                    <li key={index} className="flex gap-4 items-start">
                      <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/10 text-emerald-400 flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </span>
                      <span className="text-zinc-400 leading-relaxed pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
