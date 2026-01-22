import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useCircleProgram } from '../hooks/useCircleProgram';
import { useStore } from '../store/useStore';
import { CircleCard } from './CircleCard';
import { CircleDetail } from './CircleDetail';
import { CreateCircleForm } from './CreateCircleForm';
import { FairScoreCard } from './FairScoreCard';
import type { Circle } from '../types';
import { 
  Compass, 
  Users, 
  Plus, 
  Loader2,
  CircleDot,
  Search
} from 'lucide-react';

export function Dashboard() {
  const { connected, publicKey } = useWallet();
  const { fetchAllCircles } = useCircleProgram();
  const { activeTab, setActiveTab, circles, setCircles, circlesLoading, setCirclesLoading } = useStore();
  const [selectedCircle, setSelectedCircle] = useState<Circle | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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
    { id: 'discover' as const, label: 'Discover', icon: Compass },
    { id: 'my-circles' as const, label: 'My Circles', icon: Users },
    { id: 'create' as const, label: 'Create', icon: Plus },
  ];

  const filteredCircles = circles.filter(circle => {
    const matchesSearch = circle.name.toLowerCase().includes(searchQuery.toLowerCase());
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
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex items-center gap-2 bg-zinc-900/50 p-1.5 rounded-xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Create Tab */}
      {activeTab === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CreateCircleForm />
          </div>
          <div>
            <FairScoreCard />
          </div>
        </div>
      )}

      {/* Discover / My Circles Tabs */}
      {(activeTab === 'discover' || activeTab === 'my-circles') && (
        <>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search circles..."
              className="w-full pl-12 pr-4 py-3 bg-zinc-900/80 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Circle Lists */}
            <div className="lg:col-span-2 space-y-8">
              {circlesLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                </div>
              ) : filteredCircles.length === 0 ? (
                <div className="text-center py-20">
                  <CircleDot className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-zinc-400 mb-2">No Circles Found</h3>
                  <p className="text-zinc-600 max-w-md mx-auto">
                    {activeTab === 'my-circles' 
                      ? "You haven't joined any circles yet. Discover and join circles or create your own!"
                      : "No circles match your search. Try a different query or create a new circle."}
                  </p>
                  {activeTab === 'my-circles' && (
                    <button
                      onClick={() => setActiveTab('discover')}
                      className="mt-6 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition-colors"
                    >
                      Discover Circles
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {/* Forming Circles */}
                  {formingCircles.length > 0 && (
                    <section>
                      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                        Forming ({formingCircles.length})
                      </h2>
                      <div className="grid grid-cols-1 gap-4">
                        {formingCircles.map((circle) => (
                          <CircleCard
                            key={circle.address.toBase58()}
                            circle={circle}
                            onSelect={() => setSelectedCircle(circle)}
                          />
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Active Circles */}
                  {activeCircles.length > 0 && (
                    <section>
                      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                        Active ({activeCircles.length})
                      </h2>
                      <div className="grid grid-cols-1 gap-4">
                        {activeCircles.map((circle) => (
                          <CircleCard
                            key={circle.address.toBase58()}
                            circle={circle}
                            onSelect={() => setSelectedCircle(circle)}
                          />
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Completed Circles */}
                  {completedCircles.length > 0 && (
                    <section>
                      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                        Completed ({completedCircles.length})
                      </h2>
                      <div className="grid grid-cols-1 gap-4">
                        {completedCircles.map((circle) => (
                          <CircleCard
                            key={circle.address.toBase58()}
                            circle={circle}
                            onSelect={() => setSelectedCircle(circle)}
                          />
                        ))}
                      </div>
                    </section>
                  )}
                </>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <FairScoreCard />
              
              {/* Quick Info */}
              <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl p-6 border border-zinc-800">
                <h3 className="font-semibold text-white mb-4">How FairCircles Work</h3>
                <ol className="space-y-3 text-sm text-zinc-400">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">1</span>
                    <span>Join a circle that matches your FairScore tier</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">2</span>
                    <span>Contribute SOL each round to the shared pool</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">3</span>
                    <span>Receive the full pool when it's your turn</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">4</span>
                    <span>Higher FairScore = earlier payout position</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
