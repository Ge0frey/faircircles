import { useCallback, useEffect, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useStore } from '../store/useStore';
import { fetchFairScore, RateLimitError, NetworkError } from '../lib/fairscale';

export function useFairScore() {
  const { publicKey, connected } = useWallet();
  const {
    fairScore,
    fairScoreLoading,
    fairScoreError,
    setFairScore,
    setFairScoreLoading,
    setFairScoreError,
    clearFairScoreError,
    isFairScoreCacheValid,
  } = useStore();
  
  // Track if we've already attempted to fetch for this wallet
  const hasFetchedRef = useRef<string | null>(null);

  /**
   * Force fetch the FairScore, bypassing cache
   * Use this for explicit user refresh actions
   */
  const forceRefetch = useCallback(async () => {
    if (!publicKey) {
      setFairScore(null);
      return;
    }

    const walletAddress = publicKey.toBase58();
    setFairScoreLoading(true);
    clearFairScoreError();

    try {
      const score = await fetchFairScore(walletAddress);
      setFairScore(score, walletAddress);
    } catch (error) {
      console.error('Failed to fetch FairScore:', error);
      
      // Handle rate limit and network errors specially:
      // DO NOT reset the existing fairScore - preserve cached data
      // Also don't show error in UI if we have cached data - use it silently
      if (error instanceof RateLimitError || error instanceof NetworkError) {
        // Keep the existing fairScore - don't call setFairScore(null)
        // Don't set error if we have cached data - silently use cache
        if (!fairScore) {
          setFairScoreError(error.message);
        }
      } else {
        // For other errors, set error but still preserve cached data if available
        setFairScoreError(error instanceof Error ? error.message : 'Failed to fetch FairScore');
      }
    } finally {
      setFairScoreLoading(false);
    }
  }, [publicKey, fairScore, setFairScore, setFairScoreLoading, setFairScoreError, clearFairScoreError]);

  /**
   * Load FairScore with cache awareness
   * Will skip fetch if cache is still valid
   */
  const loadFairScore = useCallback(async (force: boolean = false) => {
    if (!publicKey) {
      setFairScore(null);
      return;
    }

    const walletAddress = publicKey.toBase58();

    // Check if cache is still valid and we're not forcing a refresh
    if (!force && isFairScoreCacheValid(walletAddress)) {
      console.log('Using cached FairScore for wallet:', walletAddress);
      return; // Use cached data, don't fetch
    }

    // Check if we've already fetched for this wallet in this session
    // This prevents redundant fetches on tab navigation
    if (!force && hasFetchedRef.current === walletAddress && fairScore) {
      console.log('Already fetched FairScore for this wallet in session');
      return;
    }

    setFairScoreLoading(true);
    clearFairScoreError();

    try {
      const score = await fetchFairScore(walletAddress);
      setFairScore(score, walletAddress);
      hasFetchedRef.current = walletAddress;
    } catch (error) {
      console.error('Failed to fetch FairScore:', error);
      
      // Handle rate limit and network errors specially:
      // DO NOT reset the existing fairScore - preserve cached data
      // Also don't show error in UI if we have cached data - use it silently
      if (error instanceof RateLimitError || error instanceof NetworkError) {
        // Keep the existing fairScore - don't call setFairScore(null)
        // Don't set error if we have cached data - silently use cache
        if (!fairScore) {
          setFairScoreError(error.message);
        }
        // Mark as fetched to prevent retry loops
        hasFetchedRef.current = walletAddress;
      } else {
        // For other errors, set error but still preserve cached data if available
        setFairScoreError(error instanceof Error ? error.message : 'Failed to fetch FairScore');
      }
    } finally {
      setFairScoreLoading(false);
    }
  }, [publicKey, fairScore, setFairScore, setFairScoreLoading, setFairScoreError, clearFairScoreError, isFairScoreCacheValid]);

  useEffect(() => {
    if (connected && publicKey) {
      // Only fetch if we don't have cached data or wallet changed
      loadFairScore(false);
    } else {
      // Wallet disconnected - clear the score
      setFairScore(null);
      hasFetchedRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, publicKey?.toBase58()]); // Only re-run when wallet connection changes

  return {
    fairScore,
    loading: fairScoreLoading,
    error: fairScoreError,
    refetch: forceRefetch, // Explicit refresh bypasses cache
    clearError: clearFairScoreError,
    isEligible: (minScore: number) => {
      if (!fairScore) return false;
      // Score is now on 0-1000 scale, minScore from circles is 0-100
      // Convert minScore to 0-1000 scale for comparison
      return fairScore.fair_score >= minScore * 10;
    },
  };
}
