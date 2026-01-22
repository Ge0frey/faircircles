import { useCallback, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useStore } from '../store/useStore';
import { fetchFairScore } from '../lib/fairscale';

export function useFairScore() {
  const { publicKey, connected } = useWallet();
  const {
    fairScore,
    fairScoreLoading,
    fairScoreError,
    setFairScore,
    setFairScoreLoading,
    setFairScoreError,
  } = useStore();

  const loadFairScore = useCallback(async () => {
    if (!publicKey) {
      setFairScore(null);
      return;
    }

    setFairScoreLoading(true);
    setFairScoreError(null);

    try {
      const score = await fetchFairScore(publicKey.toBase58());
      setFairScore(score);
    } catch (error) {
      console.error('Failed to fetch FairScore:', error);
      setFairScoreError(error instanceof Error ? error.message : 'Failed to fetch FairScore');
      setFairScore(null);
    } finally {
      setFairScoreLoading(false);
    }
  }, [publicKey, setFairScore, setFairScoreLoading, setFairScoreError]);

  useEffect(() => {
    if (connected && publicKey) {
      loadFairScore();
    } else {
      setFairScore(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, publicKey]); // Only re-run when wallet connection changes

  return {
    fairScore,
    loading: fairScoreLoading,
    error: fairScoreError,
    refetch: loadFairScore,
    isEligible: (minScore: number) => {
      if (!fairScore) return false;
      return fairScore.fair_score >= minScore;
    },
  };
}
