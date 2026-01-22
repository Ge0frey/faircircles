import { useCallback, useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Program, AnchorProvider, BN } from '@coral-xyz/anchor';
import { PROGRAM_ID } from '../lib/constants';
import { IDL } from '../lib/idl';
import { useStore } from '../store/useStore';
import type { Circle, CircleStatus } from '../types';

function parseCircleStatus(status: Record<string, unknown>): CircleStatus {
  if ('forming' in status) return 'Forming';
  if ('active' in status) return 'Active';
  if ('completed' in status) return 'Completed';
  if ('cancelled' in status) return 'Cancelled';
  return 'Forming';
}

export function useCircleProgram() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { addNotification } = useStore();

  const provider = useMemo(() => {
    if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) {
      return null;
    }
    return new AnchorProvider(
      connection,
      {
        publicKey: wallet.publicKey,
        signTransaction: wallet.signTransaction,
        signAllTransactions: wallet.signAllTransactions,
      },
      { commitment: 'confirmed' }
    );
  }, [connection, wallet.publicKey, wallet.signTransaction, wallet.signAllTransactions]);

  const program = useMemo(() => {
    if (!provider) return null;
    try {
      // For Anchor 0.30+, pass IDL and provider
      return new Program(IDL as any, provider);
    } catch (error) {
      console.error('Failed to create program:', error);
      return null;
    }
  }, [provider]);

  const getCirclePDA = useCallback((creator: PublicKey) => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('circle'), creator.toBuffer()],
      PROGRAM_ID
    );
  }, []);

  const getEscrowPDA = useCallback((creator: PublicKey) => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('escrow'), creator.toBuffer()],
      PROGRAM_ID
    );
  }, []);

  const createCircle = useCallback(async (
    name: string,
    contributionAmount: number, // in SOL
    periodLength: number, // in seconds
    minFairScore: number
  ) => {
    if (!program || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    const [circlePDA] = getCirclePDA(wallet.publicKey);
    const [escrowPDA] = getEscrowPDA(wallet.publicKey);

    const lamports = new BN(contributionAmount * LAMPORTS_PER_SOL);

    try {
      const tx = await program.methods
        .createCircle(name, lamports, new BN(periodLength), minFairScore)
        .accounts({
          creator: wallet.publicKey,
          circle: circlePDA,
          escrow: escrowPDA,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      addNotification({
        type: 'success',
        title: 'Circle Created!',
        message: `Your circle "${name}" has been created successfully.`,
      });

      return tx;
    } catch (error) {
      console.error('Failed to create circle:', error);
      addNotification({
        type: 'error',
        title: 'Failed to Create Circle',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }, [program, wallet.publicKey, getCirclePDA, getEscrowPDA, addNotification]);

  const joinCircle = useCallback(async (circleCreator: PublicKey, fairScore: number) => {
    if (!program || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    const [circlePDA] = getCirclePDA(circleCreator);

    try {
      const tx = await program.methods
        .joinCircle(Math.round(fairScore))
        .accounts({
          member: wallet.publicKey,
          circle: circlePDA,
        })
        .rpc();

      addNotification({
        type: 'success',
        title: 'Joined Circle!',
        message: 'You have successfully joined the circle.',
      });

      return tx;
    } catch (error) {
      console.error('Failed to join circle:', error);
      addNotification({
        type: 'error',
        title: 'Failed to Join Circle',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }, [program, wallet.publicKey, getCirclePDA, addNotification]);

  const startCircle = useCallback(async () => {
    if (!program || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    const [circlePDA] = getCirclePDA(wallet.publicKey);

    try {
      const tx = await program.methods
        .startCircle()
        .accounts({
          creator: wallet.publicKey,
          circle: circlePDA,
        })
        .rpc();

      addNotification({
        type: 'success',
        title: 'Circle Started!',
        message: 'The circle has been activated. Round 1 begins now!',
      });

      return tx;
    } catch (error) {
      console.error('Failed to start circle:', error);
      addNotification({
        type: 'error',
        title: 'Failed to Start Circle',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }, [program, wallet.publicKey, getCirclePDA, addNotification]);

  const contribute = useCallback(async (circleCreator: PublicKey) => {
    if (!program || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    const [circlePDA] = getCirclePDA(circleCreator);
    const [escrowPDA] = getEscrowPDA(circleCreator);

    try {
      const tx = await program.methods
        .contribute()
        .accounts({
          member: wallet.publicKey,
          circle: circlePDA,
          escrow: escrowPDA,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      addNotification({
        type: 'success',
        title: 'Contribution Made!',
        message: 'Your contribution has been added to the pool.',
      });

      return tx;
    } catch (error) {
      console.error('Failed to contribute:', error);
      addNotification({
        type: 'error',
        title: 'Failed to Contribute',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }, [program, wallet.publicKey, getCirclePDA, getEscrowPDA, addNotification]);

  const claimPayout = useCallback(async (circleCreator: PublicKey) => {
    if (!program || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    const [circlePDA] = getCirclePDA(circleCreator);
    const [escrowPDA] = getEscrowPDA(circleCreator);

    try {
      const tx = await program.methods
        .claimPayout()
        .accounts({
          recipient: wallet.publicKey,
          circle: circlePDA,
          escrow: escrowPDA,
        })
        .rpc();

      addNotification({
        type: 'success',
        title: 'Payout Claimed!',
        message: 'Congratulations! Your payout has been sent to your wallet.',
      });

      return tx;
    } catch (error) {
      console.error('Failed to claim payout:', error);
      addNotification({
        type: 'error',
        title: 'Failed to Claim Payout',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }, [program, wallet.publicKey, getCirclePDA, getEscrowPDA, addNotification]);

  const fetchCircle = useCallback(async (circleCreator: PublicKey): Promise<Circle | null> => {
    if (!program) return null;

    const [circlePDA] = getCirclePDA(circleCreator);

    try {
      const circleAccount = await (program.account as any).circle.fetch(circlePDA);
      
      const members = [];
      for (let i = 0; i < circleAccount.memberCount; i++) {
        members.push({
          address: circleAccount.members[i],
          fairScore: circleAccount.fairScores[i],
          hasContributed: circleAccount.contributions[i][circleAccount.currentRound - 1] || false,
          hasClaimed: circleAccount.hasClaimed[i],
          payoutOrder: circleAccount.payoutOrder.indexOf(i),
        });
      }

      return {
        address: circlePDA,
        creator: circleAccount.creator,
        name: circleAccount.name,
        contributionAmount: circleAccount.contributionAmount.toNumber(),
        periodLength: circleAccount.periodLength.toNumber(),
        minFairScore: circleAccount.minFairScore,
        currentRound: circleAccount.currentRound,
        memberCount: circleAccount.memberCount,
        status: parseCircleStatus(circleAccount.status),
        createdAt: circleAccount.createdAt.toNumber(),
        roundStartTime: circleAccount.roundStartTime.toNumber(),
        totalPool: circleAccount.totalPool.toNumber(),
        roundContributionsComplete: circleAccount.roundContributionsComplete,
        members,
        payoutOrder: Array.from(circleAccount.payoutOrder as number[]).slice(0, circleAccount.memberCount),
      };
    } catch (error) {
      console.error('Failed to fetch circle:', error);
      return null;
    }
  }, [program, getCirclePDA]);

  const fetchAllCircles = useCallback(async (): Promise<Circle[]> => {
    if (!program) return [];

    try {
      const accounts = await (program.account as any).circle.all();
      
      return accounts.map((account: any) => {
        const circleAccount = account.account;
        const members = [];
        
        for (let i = 0; i < circleAccount.memberCount; i++) {
          members.push({
            address: circleAccount.members[i],
            fairScore: circleAccount.fairScores[i],
            hasContributed: circleAccount.currentRound > 0 
              ? circleAccount.contributions[i][circleAccount.currentRound - 1] || false
              : false,
            hasClaimed: circleAccount.hasClaimed[i],
            payoutOrder: circleAccount.payoutOrder.indexOf(i),
          });
        }

        return {
          address: account.publicKey,
          creator: circleAccount.creator,
          name: circleAccount.name,
          contributionAmount: circleAccount.contributionAmount.toNumber(),
          periodLength: circleAccount.periodLength.toNumber(),
          minFairScore: circleAccount.minFairScore,
          currentRound: circleAccount.currentRound,
          memberCount: circleAccount.memberCount,
          status: parseCircleStatus(circleAccount.status),
          createdAt: circleAccount.createdAt.toNumber(),
          roundStartTime: circleAccount.roundStartTime.toNumber(),
          totalPool: circleAccount.totalPool.toNumber(),
          roundContributionsComplete: circleAccount.roundContributionsComplete,
          members,
          payoutOrder: Array.from(circleAccount.payoutOrder as number[]).slice(0, circleAccount.memberCount),
        };
      });
    } catch (error) {
      console.error('Failed to fetch circles:', error);
      return [];
    }
  }, [program]);

  return {
    program,
    provider,
    createCircle,
    joinCircle,
    startCircle,
    contribute,
    claimPayout,
    fetchCircle,
    fetchAllCircles,
    getCirclePDA,
    getEscrowPDA,
  };
}
