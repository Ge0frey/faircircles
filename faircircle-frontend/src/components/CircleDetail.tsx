import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useFairScore } from '../hooks/useFairScore';
import { useCircleProgram } from '../hooks/useCircleProgram';
import type { Circle } from '../types';
import { TIER_COLORS, getTierFromScore, getTierFromScore100, lamportsToSOL } from '../types';
import { 
  ArrowLeft,
  Users, 
  Coins, 
  Clock, 
  Shield,
  Trophy,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Circle as CircleIcon,
  AlertTriangle,
  Zap,
  TrendingUp,
  Sparkles,
  Info,
  RefreshCw
} from 'lucide-react';

interface Props {
  circle: Circle;
  onBack: () => void;
}

export function CircleDetail({ circle, onBack }: Props) {
  const { publicKey } = useWallet();
  const { fairScore } = useFairScore();
  const { contribute, claimPayout, joinCircle, startCircle, fetchCircle } = useCircleProgram();
  const [loading, setLoading] = useState(false);
  const [showMembers, setShowMembers] = useState(true);
  const [circleData, setCircleData] = useState(circle);

  const isCreator = publicKey?.equals(circleData.creator);
  const memberIndex = circleData.members.findIndex(m => publicKey?.equals(m.address));
  const isMember = memberIndex !== -1;
  const currentRound = circleData.currentRound;
  
  // Find current payout recipient
  const currentPayoutIdx = currentRound > 0 ? circleData.payoutOrder[currentRound - 1] : -1;
  const isPayoutRecipient = isMember && currentPayoutIdx === memberIndex;
  
  // Check if user has contributed this round
  const hasContributed = isMember && currentRound > 0 && circleData.members[memberIndex]?.hasContributed;
  
  // Check if all contributions are in
  const canClaim = circleData.roundContributionsComplete && isPayoutRecipient && !circleData.members[memberIndex]?.hasClaimed;
  const canContribute = isMember && circleData.status === 'Active' && !hasContributed;
  const canJoin = !isMember && circleData.status === 'Forming' && fairScore && fairScore.fair_score >= circleData.minFairScore;
  const canStart = isCreator && circleData.status === 'Forming' && circleData.memberCount >= 3;

  const refreshCircle = async () => {
    const updated = await fetchCircle(circleData.creator);
    if (updated) setCircleData(updated);
  };

  const handleContribute = async () => {
    setLoading(true);
    try {
      await contribute(circleData.creator);
      await refreshCircle();
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    setLoading(true);
    try {
      await claimPayout(circleData.creator);
      await refreshCircle();
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!fairScore) return;
    setLoading(true);
    try {
      await joinCircle(circleData.creator, fairScore.fair_score);
      await refreshCircle();
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    setLoading(true);
    try {
      await startCircle();
      await refreshCircle();
    } finally {
      setLoading(false);
    }
  };

  const formatPeriod = (seconds: number) => {
    if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
    if (seconds < 604800) return `${Math.round(seconds / 86400)} days`;
    return `${Math.round(seconds / 604800)} weeks`;
  };

  const statusConfig = {
    Forming: { 
      bg: 'bg-blue-500/10', 
      text: 'text-blue-400', 
      border: 'border-blue-500/20',
      icon: Users
    },
    Active: { 
      bg: 'bg-emerald-500/10', 
      text: 'text-emerald-400', 
      border: 'border-emerald-500/20',
      icon: TrendingUp
    },
    Completed: { 
      bg: 'bg-purple-500/10', 
      text: 'text-purple-400', 
      border: 'border-purple-500/20',
      icon: CheckCircle2
    },
    Cancelled: { 
      bg: 'bg-red-500/10', 
      text: 'text-red-400', 
      border: 'border-red-500/20',
      icon: AlertTriangle
    },
  };

  const status = statusConfig[circleData.status];
  const StatusIcon = status.icon;

  // Use getTierFromScore100 since minFairScore is on 0-100 scale
  const tier = getTierFromScore100(circleData.minFairScore);
  const tierColors = TIER_COLORS[tier];

  const contributedCount = circleData.members.filter((_, i) => circleData.members[i]?.hasContributed).length;

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header - Enhanced */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <button
            onClick={onBack}
            className="p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all hover-lift"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h1 className="text-2xl font-bold text-white">{circleData.name}</h1>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold ${status.bg} ${status.text} border ${status.border}`}>
                <StatusIcon className="w-4 h-4" />
                {circleData.status}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-zinc-500">
              <span>Created by {circleData.creator.toBase58().slice(0, 8)}...{circleData.creator.toBase58().slice(-4)}</span>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${tierColors.bg} ${tierColors.text}`}>
                {circleData.minFairScore}+ FairScore
              </span>
            </div>
          </div>
          <button
            onClick={refreshCircle}
            className="p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all"
            title="Refresh circle data"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Quick Stats - Enhanced Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-5 hover-lift transition-all">
          <div className="flex items-center gap-2 text-zinc-500 text-xs font-medium uppercase tracking-wide mb-3">
            <Users className="w-4 h-4" />
            Members
          </div>
          <div className="text-3xl font-bold text-white">{circleData.memberCount}<span className="text-lg text-zinc-500">/10</span></div>
        </div>
        
        <div className="glass-card rounded-xl p-5 hover-lift transition-all">
          <div className="flex items-center gap-2 text-zinc-500 text-xs font-medium uppercase tracking-wide mb-3">
            <Coins className="w-4 h-4" />
            Contribution
          </div>
          <div className="text-3xl font-bold text-white">{lamportsToSOL(circleData.contributionAmount)} <span className="text-lg text-emerald-400">SOL</span></div>
        </div>
        
        <div className="glass-card rounded-xl p-5 hover-lift transition-all">
          <div className="flex items-center gap-2 text-zinc-500 text-xs font-medium uppercase tracking-wide mb-3">
            <Clock className="w-4 h-4" />
            Period
          </div>
          <div className="text-3xl font-bold text-white">{formatPeriod(circleData.periodLength)}</div>
        </div>
        
        <div className="glass-card rounded-xl p-5 hover-lift transition-all">
          <div className="flex items-center gap-2 text-zinc-500 text-xs font-medium uppercase tracking-wide mb-3">
            <Zap className="w-4 h-4" />
            Total Pool
          </div>
          <div className="text-3xl font-bold text-gradient">{lamportsToSOL(circleData.totalPool)} SOL</div>
        </div>
      </div>

      {/* Current Round Info (for active circles) - Enhanced */}
      {circleData.status === 'Active' && (
        <div className="glass-card rounded-2xl p-6 border border-emerald-500/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5 pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10">
                  <Zap className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Round {currentRound} of {circleData.memberCount}</h3>
                  <p className="text-sm text-zinc-500">Contributions in progress</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-emerald-400">{lamportsToSOL(circleData.contributionAmount * circleData.memberCount)} SOL</div>
                <div className="text-xs text-zinc-500">Round Pool</div>
              </div>
            </div>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="text-zinc-400">
                  <span className="font-semibold text-emerald-400">{contributedCount}</span> of {circleData.memberCount} contributed
                </span>
                <span className="text-zinc-500 font-medium">
                  {Math.round((contributedCount / circleData.memberCount) * 100)}%
                </span>
              </div>
              <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500 relative"
                  style={{ width: `${(contributedCount / circleData.memberCount) * 100}%` }}
                >
                  <div className="absolute inset-0 animate-shimmer" />
                </div>
              </div>
            </div>

            {currentPayoutIdx >= 0 && (
              <div className="flex items-center gap-2 text-sm bg-emerald-500/10 px-4 py-3 rounded-xl">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span className="text-zinc-400">Next payout to:</span>
                <span className="font-semibold text-white">{circleData.members[currentPayoutIdx]?.address.toBase58().slice(0, 8)}...{circleData.members[currentPayoutIdx]?.address.toBase58().slice(-4)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons - Enhanced */}
      <div className="flex flex-wrap gap-4">
        {canJoin && (
          <button
            onClick={handleJoin}
            disabled={loading}
            className="flex-1 min-w-[200px] btn-primary flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-white font-semibold transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Users className="w-5 h-5" />
                Join This Circle
              </>
            )}
          </button>
        )}

        {canStart && (
          <button
            onClick={handleStart}
            disabled={loading}
            className="flex-1 min-w-[200px] flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20 hover-lift"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Start Circle
              </>
            )}
          </button>
        )}

        {canContribute && (
          <button
            onClick={handleContribute}
            disabled={loading}
            className="flex-1 min-w-[200px] btn-primary flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-white font-semibold transition-all disabled:opacity-50 animate-glow-pulse"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Coins className="w-5 h-5" />
                Contribute {lamportsToSOL(circleData.contributionAmount)} SOL
              </>
            )}
          </button>
        )}

        {canClaim && (
          <button
            onClick={handleClaim}
            disabled={loading}
            className="flex-1 min-w-[200px] flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-semibold rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-amber-500/25 animate-glow-pulse hover-lift"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Trophy className="w-5 h-5" />
                Claim {lamportsToSOL(circleData.contributionAmount * circleData.memberCount)} SOL
              </>
            )}
          </button>
        )}

        {hasContributed && !isPayoutRecipient && circleData.status === 'Active' && (
          <div className="flex items-center gap-3 px-6 py-4 glass-card rounded-xl text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-semibold">Contributed this round</span>
          </div>
        )}
      </div>

      {/* Members List - Enhanced */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <button
          onClick={() => setShowMembers(!showMembers)}
          className="w-full flex items-center justify-between p-6 hover:bg-zinc-800/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <Users className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-bold text-white">Members & Payout Order</h3>
              <p className="text-sm text-zinc-500">{circleData.memberCount} members in this circle</p>
            </div>
          </div>
          <div className={`p-2 rounded-lg transition-colors ${showMembers ? 'bg-zinc-700' : 'bg-zinc-800'}`}>
            {showMembers ? (
              <ChevronUp className="w-5 h-5 text-zinc-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-zinc-400" />
            )}
          </div>
        </button>

        {showMembers && (
          <div className="border-t border-zinc-800/50">
            {circleData.members.map((member, idx) => {
              const payoutPosition = circleData.payoutOrder.indexOf(idx) + 1;
              const isCurrentRecipient = circleData.status === 'Active' && currentPayoutIdx === idx;
              const hasReceivedPayout = member.hasClaimed;
              const memberTier = getTierFromScore(member.fairScore);
              const memberColors = TIER_COLORS[memberTier];
              const isYou = publicKey?.equals(member.address);

              return (
                <div
                  key={member.address.toBase58()}
                  className={`flex items-center gap-4 p-5 border-b border-zinc-800/30 last:border-b-0 transition-colors ${
                    isCurrentRecipient ? 'bg-amber-500/5' : ''
                  } ${isYou ? 'bg-emerald-500/5' : 'hover:bg-zinc-800/20'}`}
                >
                  {/* Position Badge */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold transition-all ${
                    hasReceivedPayout 
                      ? 'bg-emerald-500/20 text-emerald-400 ring-2 ring-emerald-500/30'
                      : isCurrentRecipient
                        ? 'bg-amber-500/20 text-amber-400 ring-2 ring-amber-500/30 animate-pulse'
                        : 'bg-zinc-800/50 text-zinc-500'
                  }`}>
                    #{payoutPosition}
                  </div>

                  {/* Member Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-white font-semibold">
                        {member.address.toBase58().slice(0, 8)}...{member.address.toBase58().slice(-4)}
                      </span>
                      {isYou && (
                        <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full">
                          You
                        </span>
                      )}
                      {idx === 0 && (
                        <span className="px-2.5 py-0.5 bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-full">
                          Creator
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold ${memberColors.bg} ${memberColors.text}`}>
                        <Shield className="w-3 h-3" />
                        {memberTier} • {member.fairScore}
                      </span>
                    </div>
                  </div>

                  {/* Status Indicators */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {circleData.status === 'Active' && currentRound > 0 && (
                      member.hasContributed ? (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm font-medium">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="hidden sm:inline">Contributed</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/50 text-zinc-500 text-sm font-medium">
                          <CircleIcon className="w-4 h-4" />
                          <span className="hidden sm:inline">Pending</span>
                        </div>
                      )
                    )}
                    {hasReceivedPayout && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm font-medium">
                        <Trophy className="w-4 h-4" />
                        <span className="hidden sm:inline">Received</span>
                      </div>
                    )}
                    {isCurrentRecipient && !hasReceivedPayout && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 text-sm font-medium animate-pulse">
                        <Sparkles className="w-4 h-4" />
                        <span className="hidden sm:inline">Next</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* How Payout Order Works - Enhanced */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-lg bg-emerald-500/10">
            <Info className="w-5 h-5 text-emerald-400" />
          </div>
          <h3 className="text-lg font-bold text-white">How Payout Order Works</h3>
        </div>
        <div className="space-y-4 text-sm">
          <div className="flex gap-4 items-start p-4 rounded-xl bg-zinc-800/30">
            <div className="p-2 rounded-lg bg-emerald-500/10 flex-shrink-0">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-white font-semibold mb-1">FairScore Determines Order</p>
              <p className="text-zinc-400">Members with higher FairScores receive payouts earlier in the rotation.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start p-4 rounded-xl bg-zinc-800/30">
            <div className="p-2 rounded-lg bg-blue-500/10 flex-shrink-0">
              <Shield className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="text-white font-semibold mb-1">Risk Mitigation</p>
              <p className="text-zinc-400">Lower-reputation members prove commitment by contributing first while waiting for their turn.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start p-4 rounded-xl bg-zinc-800/30">
            <div className="p-2 rounded-lg bg-amber-500/10 flex-shrink-0">
              <Trophy className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <p className="text-white font-semibold mb-1">Reward Trust</p>
              <p className="text-zinc-400">Building on-chain reputation with FairScale rewards you with priority access to pooled funds.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
