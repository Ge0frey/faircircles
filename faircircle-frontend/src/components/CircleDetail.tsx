import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useFairScore } from '../hooks/useFairScore';
import { useCircleProgram } from '../hooks/useCircleProgram';
import type { Circle } from '../types';
import { TIER_COLORS, getTierFromScore, lamportsToSOL } from '../types';
import { 
  ArrowLeft,
  Users, 
  Coins, 
  Clock, 
  Shield,
  Trophy,
  ChevronDown,
  ChevronUp,
  Wallet,
  CheckCircle2,
  Circle as CircleIcon,
  AlertTriangle,
  Zap
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

  const statusColors = {
    Forming: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    Active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    Completed: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    Cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  const tier = getTierFromScore(circleData.minFairScore);
  const tierColors = TIER_COLORS[tier];

  // Sort members by payout order for display
  const sortedMembers = [...circleData.members].sort((a, b) => {
    const aOrder = circleData.payoutOrder.indexOf(circleData.members.indexOf(a));
    const bOrder = circleData.payoutOrder.indexOf(circleData.members.indexOf(b));
    return aOrder - bOrder;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">{circleData.name}</h1>
          <p className="text-zinc-500">Created by {circleData.creator.toBase58().slice(0, 8)}...</p>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-sm font-medium border ${statusColors[circleData.status]}`}>
          {circleData.status}
        </span>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900/80 backdrop-blur-xl rounded-xl p-4 border border-zinc-800">
          <div className="flex items-center gap-2 text-zinc-500 text-sm mb-2">
            <Users className="w-4 h-4" />
            Members
          </div>
          <div className="text-2xl font-bold text-white">{circleData.memberCount}/10</div>
        </div>
        
        <div className="bg-zinc-900/80 backdrop-blur-xl rounded-xl p-4 border border-zinc-800">
          <div className="flex items-center gap-2 text-zinc-500 text-sm mb-2">
            <Coins className="w-4 h-4" />
            Contribution
          </div>
          <div className="text-2xl font-bold text-white">{lamportsToSOL(circleData.contributionAmount)} SOL</div>
        </div>
        
        <div className="bg-zinc-900/80 backdrop-blur-xl rounded-xl p-4 border border-zinc-800">
          <div className="flex items-center gap-2 text-zinc-500 text-sm mb-2">
            <Clock className="w-4 h-4" />
            Period
          </div>
          <div className="text-2xl font-bold text-white">{formatPeriod(circleData.periodLength)}</div>
        </div>
        
        <div className="bg-zinc-900/80 backdrop-blur-xl rounded-xl p-4 border border-zinc-800">
          <div className="flex items-center gap-2 text-zinc-500 text-sm mb-2">
            <Shield className="w-4 h-4" />
            Min Score
          </div>
          <div className={`text-2xl font-bold ${tierColors.text.replace('text-', 'text-')}`}>
            {circleData.minFairScore}+
          </div>
        </div>
      </div>

      {/* Current Round Info (for active circles) */}
      {circleData.status === 'Active' && (
        <div className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 rounded-2xl p-6 border border-emerald-500/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-emerald-400" />
              Round {currentRound} of {circleData.memberCount}
            </h3>
            <div className="text-emerald-400 font-medium">
              Pool: {lamportsToSOL(circleData.contributionAmount * circleData.memberCount)} SOL
            </div>
          </div>

          {/* Progress */}
          <div className="h-3 bg-zinc-800 rounded-full overflow-hidden mb-4">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
              style={{ 
                width: `${(circleData.members.filter((_, i) => circleData.members[i]?.hasContributed).length / circleData.memberCount) * 100}%` 
              }}
            />
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">
              {circleData.members.filter((_, i) => circleData.members[i]?.hasContributed).length} of {circleData.memberCount} contributed
            </span>
            {currentPayoutIdx >= 0 && (
              <span className="text-emerald-400">
                Payout to: {circleData.members[currentPayoutIdx]?.address.toBase58().slice(0, 8)}...
              </span>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        {canJoin && (
          <button
            onClick={handleJoin}
            disabled={loading}
            className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
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
            className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
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
            className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/25"
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
            className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-semibold rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-amber-500/25 animate-pulse"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Trophy className="w-5 h-5" />
                Claim Payout ({lamportsToSOL(circleData.contributionAmount * circleData.memberCount)} SOL)
              </>
            )}
          </button>
        )}

        {hasContributed && !isPayoutRecipient && circleData.status === 'Active' && (
          <div className="flex items-center gap-2 px-6 py-4 bg-zinc-800 rounded-xl text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium">Contributed this round</span>
          </div>
        )}
      </div>

      {/* Members List */}
      <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-zinc-800 overflow-hidden">
        <button
          onClick={() => setShowMembers(!showMembers)}
          className="w-full flex items-center justify-between p-6 hover:bg-zinc-800/50 transition-colors"
        >
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            Members & Payout Order
          </h3>
          {showMembers ? (
            <ChevronUp className="w-5 h-5 text-zinc-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-zinc-500" />
          )}
        </button>

        {showMembers && (
          <div className="border-t border-zinc-800">
            {circleData.members.map((member, idx) => {
              const payoutPosition = circleData.payoutOrder.indexOf(idx) + 1;
              const isCurrentRecipient = circleData.status === 'Active' && currentPayoutIdx === idx;
              const hasReceivedPayout = member.hasClaimed;
              const memberTier = getTierFromScore(member.fairScore);
              const memberColors = TIER_COLORS[memberTier];

              return (
                <div
                  key={member.address.toBase58()}
                  className={`flex items-center gap-4 p-4 border-b border-zinc-800/50 last:border-b-0 ${
                    isCurrentRecipient ? 'bg-emerald-500/10' : ''
                  } ${publicKey?.equals(member.address) ? 'bg-zinc-800/30' : ''}`}
                >
                  {/* Position */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                    hasReceivedPayout 
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : isCurrentRecipient
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-zinc-800 text-zinc-500'
                  }`}>
                    {payoutPosition}
                  </div>

                  {/* Member Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium truncate">
                        {member.address.toBase58().slice(0, 8)}...{member.address.toBase58().slice(-4)}
                      </span>
                      {publicKey?.equals(member.address) && (
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                          You
                        </span>
                      )}
                      {idx === 0 && (
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                          Creator
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${memberColors.bg} ${memberColors.text}`}>
                        {memberTier} • {member.fairScore}
                      </span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-2">
                    {circleData.status === 'Active' && currentRound > 0 && (
                      member.hasContributed ? (
                        <div className="flex items-center gap-1 text-emerald-400 text-sm">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Contributed</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-zinc-500 text-sm">
                          <CircleIcon className="w-4 h-4" />
                          <span>Pending</span>
                        </div>
                      )
                    )}
                    {hasReceivedPayout && (
                      <div className="flex items-center gap-1 text-emerald-400 text-sm">
                        <Trophy className="w-4 h-4" />
                        <span>Received</span>
                      </div>
                    )}
                    {isCurrentRecipient && !hasReceivedPayout && (
                      <div className="flex items-center gap-1 text-amber-400 text-sm animate-pulse">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Next Payout</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* How Payout Order Works */}
      <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl p-6 border border-zinc-800">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-400" />
          How Payout Order Works
        </h3>
        <div className="space-y-3 text-sm text-zinc-400">
          <p>
            <strong className="text-white">FairScore determines payout order:</strong> Members with higher FairScores 
            receive payouts earlier in the rotation.
          </p>
          <p>
            <strong className="text-white">Why this matters:</strong> Lower-reputation members prove their commitment 
            by contributing first while waiting for their turn, reducing default risk for the group.
          </p>
          <p>
            <strong className="text-white">Higher trust = earlier access:</strong> Building on-chain reputation 
            with FairScale rewards you with priority access to pooled funds.
          </p>
        </div>
      </div>
    </div>
  );
}
