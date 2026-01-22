import { useFairScore } from '../hooks/useFairScore';
import { TIER_COLORS, getTierFromScore } from '../types';
import { getTierDescription, formatBadgeTier } from '../lib/fairscale';
import { 
  Shield, 
  Sparkles, 
  TrendingUp, 
  Award,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

export function FairScoreCard() {
  const { fairScore, loading, error, refetch } = useFairScore();

  if (loading) {
    return (
      <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl p-6 border border-zinc-800">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-zinc-800 rounded-lg w-1/2"></div>
          <div className="h-24 bg-zinc-800 rounded-xl"></div>
          <div className="h-4 bg-zinc-800 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl p-6 border border-red-900/50">
        <div className="flex items-center gap-3 text-red-400 mb-4">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">Failed to load FairScore</span>
        </div>
        <p className="text-zinc-500 text-sm mb-4">{error}</p>
        <button
          onClick={refetch}
          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try again
        </button>
      </div>
    );
  }

  if (!fairScore) {
    return (
      <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl p-6 border border-zinc-800">
        <div className="text-center py-8">
          <Shield className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-zinc-400 mb-2">Connect Your Wallet</h3>
          <p className="text-zinc-600 text-sm">
            Connect your wallet to view your FairScore and join circles
          </p>
        </div>
      </div>
    );
  }

  const tier = fairScore.tier || getTierFromScore(fairScore.fair_score);
  const colors = TIER_COLORS[tier];

  return (
    <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl p-6 border border-zinc-800 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-400" />
          Your FairScore
        </h3>
        <button
          onClick={refetch}
          className="p-2 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-500 hover:text-white"
          title="Refresh score"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Score Display */}
      <div className={`relative overflow-hidden rounded-xl p-6 ${colors.bg} ${colors.glow} shadow-lg`}>
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-5xl font-bold tracking-tight text-white drop-shadow-lg">
                {Math.round(fairScore.fair_score)}
              </div>
              <div className={`text-sm font-medium uppercase tracking-wider mt-1 ${colors.text} opacity-90`}>
                {tier} tier
              </div>
            </div>
            <div className={`p-3 rounded-full bg-white/20 backdrop-blur-sm`}>
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Tier Description */}
      <p className="text-zinc-400 text-sm">
        {getTierDescription(tier)}
      </p>

      {/* Score Breakdown */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-zinc-800/50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-zinc-500 text-xs uppercase tracking-wider mb-2">
            <TrendingUp className="w-3 h-3" />
            FairScore
          </div>
          <div className="text-2xl font-bold text-white">
            {Math.round(fairScore.fair_score)}
          </div>
        </div>
        <div className="bg-zinc-800/50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-zinc-500 text-xs uppercase tracking-wider mb-2">
            <Award className="w-3 h-3" />
            Tier
          </div>
          <div className="text-2xl font-bold text-white capitalize">
            {tier}
          </div>
        </div>
      </div>

      {/* Badges */}
      {fairScore.badges && fairScore.badges.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
            Earned Badges
          </h4>
          <div className="flex flex-wrap gap-2">
            {fairScore.badges.map((badge) => (
              <div
                key={badge.id}
                className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                  TIER_COLORS[badge.tier]?.bg || 'bg-zinc-700'
                } ${TIER_COLORS[badge.tier]?.text || 'text-zinc-300'}`}
                title={badge.description}
              >
                {badge.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Features */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
          Key Metrics
        </h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex justify-between text-zinc-500">
            <span>Wallet Age Score</span>
            <span className="text-zinc-300">{fairScore.features.wallet_age_score}</span>
          </div>
          <div className="flex justify-between text-zinc-500">
            <span>Transactions</span>
            <span className="text-zinc-300">{fairScore.features.tx_count}</span>
          </div>
          <div className="flex justify-between text-zinc-500">
            <span>Active Days</span>
            <span className="text-zinc-300">{fairScore.features.active_days}</span>
          </div>
          <div className="flex justify-between text-zinc-500">
            <span>Platform Diversity</span>
            <span className="text-zinc-300">{fairScore.features.platform_diversity}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
