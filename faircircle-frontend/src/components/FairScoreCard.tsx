import { useFairScore } from '../hooks/useFairScore';
import { TIER_COLORS, getTierFromScore } from '../types';
import { getTierDescription } from '../lib/fairscale';
import { 
  Shield, 
  Sparkles, 
  TrendingUp, 
  Award,
  RefreshCw,
  AlertCircle,
  Calendar,
  Activity,
  Layers,
  Zap
} from 'lucide-react';

export function FairScoreCard() {
  const { fairScore, loading, error, refetch } = useFairScore();

  // Show loading state only if we don't have cached data
  if (loading && !fairScore) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <div className="animate-pulse space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-zinc-800 rounded-xl"></div>
            <div className="h-6 bg-zinc-800 rounded-lg w-1/2"></div>
          </div>
          <div className="h-28 bg-zinc-800 rounded-xl"></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="h-20 bg-zinc-800 rounded-xl"></div>
            <div className="h-20 bg-zinc-800 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state only if we don't have cached data to fall back on
  if (error && !fairScore) {
    return (
      <div className="glass-card rounded-2xl p-6 border border-red-500/20">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-lg bg-red-500/10 flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h4 className="font-semibold text-red-400 mb-1">Failed to load FairScore</h4>
            <p className="text-zinc-500 text-sm mb-4">{error}</p>
            <button
              onClick={refetch}
              className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-zinc-800"
            >
              <RefreshCw className="w-4 h-4" />
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!fairScore) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center">
        <div className="p-3 rounded-xl bg-zinc-800/50 w-fit mx-auto mb-4">
          <Shield className="w-10 h-10 text-zinc-600" />
        </div>
        <h3 className="text-lg font-bold text-zinc-300 mb-2">Connect Your Wallet</h3>
        <p className="text-zinc-500 text-sm max-w-xs mx-auto">
          Connect your wallet to view your FairScore and join circles
        </p>
      </div>
    );
  }

  const tier = fairScore.tier || getTierFromScore(fairScore.fair_score);
  const colors = TIER_COLORS[tier];

  return (
    <div className="glass-card rounded-2xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10">
            <Shield className="w-5 h-5 text-emerald-400" />
          </div>
          <h3 className="font-bold text-white">Your FairScore</h3>
        </div>
        <button
          onClick={refetch}
          disabled={loading}
          className={`p-2.5 rounded-xl bg-zinc-800/50 hover:bg-zinc-700 transition-colors text-zinc-500 hover:text-white ${loading ? 'animate-spin' : ''}`}
          title="Refresh score"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Score Display - Enhanced */}
      <div className={`relative overflow-hidden rounded-2xl p-6 ${colors.bg} shadow-lg`}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full bg-white/10 blur-2xl" />
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-5xl font-bold tracking-tight text-white drop-shadow-lg">
                {Math.round(fairScore.fair_score)}
              </div>
              <div className={`text-sm font-bold uppercase tracking-wider mt-1 ${colors.text} opacity-80`}>
                {tier} Tier
              </div>
            </div>
            <div className={`p-3 rounded-2xl bg-white/20 backdrop-blur-sm`}>
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Tier Description */}
      <p className="text-zinc-400 text-sm leading-relaxed">
        {getTierDescription(tier)}
      </p>

      {/* Badges */}
      {fairScore.badges && fairScore.badges.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-zinc-500" />
            <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Earned Badges
            </h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {fairScore.badges.map((badge) => (
              <div
                key={badge.id}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  TIER_COLORS[badge.tier]?.bg || 'bg-zinc-700'
                } ${TIER_COLORS[badge.tier]?.text || 'text-zinc-300'}`}
                title={badge.description}
              >
                <Zap className="w-3 h-3" />
                {badge.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Metrics - Enhanced Grid */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-zinc-500" />
          <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            Key Metrics
          </h4>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-zinc-800/30 hover:bg-zinc-800/50 transition-colors">
            <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1">
              <Calendar className="w-3 h-3" />
              Wallet Age
            </div>
            <div className="text-lg font-bold text-white">{fairScore.features?.wallet_age_days || 0}d</div>
          </div>
          <div className="p-3 rounded-xl bg-zinc-800/30 hover:bg-zinc-800/50 transition-colors">
            <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1">
              <TrendingUp className="w-3 h-3" />
              Transactions
            </div>
            <div className="text-lg font-bold text-white">{(fairScore.features?.tx_count || 0).toLocaleString()}</div>
          </div>
          <div className="p-3 rounded-xl bg-zinc-800/30 hover:bg-zinc-800/50 transition-colors">
            <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1">
              <Activity className="w-3 h-3" />
              Active Days
            </div>
            <div className="text-lg font-bold text-white">{fairScore.features?.active_days || 0}</div>
          </div>
          <div className="p-3 rounded-xl bg-zinc-800/30 hover:bg-zinc-800/50 transition-colors">
            <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1">
              <Layers className="w-3 h-3" />
              Platforms
            </div>
            <div className="text-lg font-bold text-white">{fairScore.features?.platform_diversity || 0}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
