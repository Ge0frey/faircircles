use anchor_lang::prelude::*;
use anchor_lang::system_program;

declare_id!("FeuH9rfHZ8XuMQrFVdWHP6MEA4e4fqtF95Bbi3aiMZdk");

pub const MAX_MEMBERS: usize = 10;
pub const MIN_MEMBERS: usize = 3;
pub const CIRCLE_NAME_MAX_LEN: usize = 32;

#[program]
pub mod faircircle_solana_program {
    use super::*;

    /// Creates a new FairCircle with specified parameters
    pub fn create_circle(
        ctx: Context<CreateCircle>,
        name: String,
        contribution_amount: u64,
        period_length: i64,  // in seconds
        min_fair_score: u8,  // minimum FairScore tier required (0-100 scale)
    ) -> Result<()> {
        require!(name.len() <= CIRCLE_NAME_MAX_LEN, FairCircleError::NameTooLong);
        require!(contribution_amount > 0, FairCircleError::InvalidContributionAmount);
        require!(period_length > 0, FairCircleError::InvalidPeriodLength);

        let circle = &mut ctx.accounts.circle;
        let clock = Clock::get()?;

        circle.creator = ctx.accounts.creator.key();
        circle.name = name;
        circle.contribution_amount = contribution_amount;
        circle.period_length = period_length;
        circle.min_fair_score = min_fair_score;
        circle.current_round = 0;
        circle.payout_index = 0;
        circle.total_pool = 0;
        circle.status = CircleStatus::Forming;
        circle.created_at = clock.unix_timestamp;
        circle.round_start_time = 0;
        circle.bump = ctx.bumps.circle;
        circle.escrow_bump = ctx.bumps.escrow;

        // Creator automatically joins as first member
        circle.members[0] = ctx.accounts.creator.key();
        circle.fair_scores[0] = 0; // Will be set when starting
        circle.contributions[0] = [false; MAX_MEMBERS];
        circle.has_claimed[0] = false;
        circle.member_count = 1;

        msg!("FairCircle '{}' created by {}", circle.name, circle.creator);
        Ok(())
    }

    /// Join an existing circle (requires meeting minimum FairScore)
    pub fn join_circle(ctx: Context<JoinCircle>, fair_score: u8) -> Result<()> {
        let circle = &mut ctx.accounts.circle;
        let member = ctx.accounts.member.key();

        require!(circle.status == CircleStatus::Forming, FairCircleError::CircleNotForming);
        require!(circle.member_count < MAX_MEMBERS as u8, FairCircleError::CircleFull);
        require!(fair_score >= circle.min_fair_score, FairCircleError::InsufficientFairScore);

        // Check if member already joined
        for i in 0..circle.member_count as usize {
            require!(circle.members[i] != member, FairCircleError::AlreadyJoined);
        }

        let idx = circle.member_count as usize;
        circle.members[idx] = member;
        circle.fair_scores[idx] = fair_score;
        circle.contributions[idx] = [false; MAX_MEMBERS];
        circle.has_claimed[idx] = false;
        circle.member_count += 1;

        msg!("Member {} joined circle with FairScore {}", member, fair_score);
        Ok(())
    }

    /// Start the circle once enough members have joined (creator only)
    pub fn start_circle(ctx: Context<StartCircle>) -> Result<()> {
        let circle = &mut ctx.accounts.circle;
        let clock = Clock::get()?;

        require!(circle.status == CircleStatus::Forming, FairCircleError::CircleNotForming);
        require!(circle.member_count >= MIN_MEMBERS as u8, FairCircleError::NotEnoughMembers);
        require!(ctx.accounts.creator.key() == circle.creator, FairCircleError::Unauthorized);

        // Sort payout order by FairScore (higher score = earlier payout)
        // We'll store the sorted indices in a separate array
        circle.status = CircleStatus::Active;
        circle.current_round = 1;
        circle.round_start_time = clock.unix_timestamp;

        // Calculate payout order based on FairScore (descending)
        let mut indices: Vec<(u8, u8)> = (0..circle.member_count)
            .map(|i| (i, circle.fair_scores[i as usize]))
            .collect();
        indices.sort_by(|a, b| b.1.cmp(&a.1)); // Sort descending by fair_score
        
        for (order, (original_idx, _)) in indices.iter().enumerate() {
            circle.payout_order[order] = *original_idx;
        }

        msg!("Circle started with {} members", circle.member_count);
        Ok(())
    }

    /// Contribute SOL to the current round
    pub fn contribute(ctx: Context<Contribute>) -> Result<()> {
        let circle = &mut ctx.accounts.circle;
        let member = ctx.accounts.member.key();
        let round = circle.current_round as usize;

        require!(circle.status == CircleStatus::Active, FairCircleError::CircleNotActive);
        require!(round > 0 && round <= circle.member_count as usize, FairCircleError::InvalidRound);

        // Find member index
        let member_idx = circle.members.iter()
            .position(|&m| m == member)
            .ok_or(FairCircleError::NotMember)?;

        require!(!circle.contributions[member_idx][round - 1], FairCircleError::AlreadyContributed);

        // Transfer SOL to escrow
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.member.to_account_info(),
                to: ctx.accounts.escrow.to_account_info(),
            },
        );
        system_program::transfer(cpi_context, circle.contribution_amount)?;

        circle.contributions[member_idx][round - 1] = true;
        circle.total_pool += circle.contribution_amount;

        // Check if all members have contributed this round
        let all_contributed = (0..circle.member_count as usize)
            .all(|i| circle.contributions[i][round - 1]);

        if all_contributed {
            circle.round_contributions_complete = true;
        }

        msg!("Member {} contributed {} lamports for round {}", member, circle.contribution_amount, round);
        Ok(())
    }

    /// Claim payout for the current round (only eligible member can claim)
    pub fn claim_payout(ctx: Context<ClaimPayout>) -> Result<()> {
        let circle = &mut ctx.accounts.circle;
        let recipient = ctx.accounts.recipient.key();
        let round = circle.current_round as usize;

        require!(circle.status == CircleStatus::Active, FairCircleError::CircleNotActive);
        require!(circle.round_contributions_complete, FairCircleError::RoundNotComplete);

        // Get the member who should receive payout this round
        let payout_recipient_idx = circle.payout_order[round - 1] as usize;
        require!(circle.members[payout_recipient_idx] == recipient, FairCircleError::NotPayoutRecipient);
        require!(!circle.has_claimed[payout_recipient_idx], FairCircleError::AlreadyClaimed);

        // Calculate payout amount (all contributions for this round)
        let payout_amount = circle.contribution_amount * circle.member_count as u64;

        // Transfer from escrow to recipient
        let circle_key = circle.creator;
        let seeds = &[
            b"escrow",
            circle_key.as_ref(),
            &[circle.escrow_bump],
        ];
        let signer = &[&seeds[..]];

        let escrow_info = ctx.accounts.escrow.to_account_info();
        let recipient_info = ctx.accounts.recipient.to_account_info();

        **escrow_info.try_borrow_mut_lamports()? -= payout_amount;
        **recipient_info.try_borrow_mut_lamports()? += payout_amount;

        circle.has_claimed[payout_recipient_idx] = true;
        circle.total_pool -= payout_amount;
        circle.round_contributions_complete = false;

        // Move to next round or complete circle
        if circle.current_round >= circle.member_count {
            circle.status = CircleStatus::Completed;
            msg!("Circle completed! All members have received payouts.");
        } else {
            circle.current_round += 1;
            let clock = Clock::get()?;
            circle.round_start_time = clock.unix_timestamp;
            msg!("Round {} complete. Moving to round {}", round, circle.current_round);
        }

        msg!("Payout of {} lamports sent to {}", payout_amount, recipient);
        Ok(())
    }

    /// Update a member's FairScore (for keeper/oracle updates)
    pub fn update_fair_score(ctx: Context<UpdateFairScore>, member: Pubkey, new_score: u8) -> Result<()> {
        let circle = &mut ctx.accounts.circle;
        
        require!(ctx.accounts.authority.key() == circle.creator, FairCircleError::Unauthorized);

        let member_idx = circle.members.iter()
            .position(|&m| m == member)
            .ok_or(FairCircleError::NotMember)?;

        circle.fair_scores[member_idx] = new_score;

        msg!("Updated FairScore for {} to {}", member, new_score);
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateCircle<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,
    
    #[account(
        init,
        payer = creator,
        space = Circle::SIZE,
        seeds = [b"circle", creator.key().as_ref()],
        bump
    )]
    pub circle: Account<'info, Circle>,
    
    #[account(
        init,
        payer = creator,
        space = 8,
        seeds = [b"escrow", creator.key().as_ref()],
        bump
    )]
    /// CHECK: This is the escrow account that holds the pooled funds
    pub escrow: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct JoinCircle<'info> {
    #[account(mut)]
    pub member: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"circle", circle.creator.as_ref()],
        bump = circle.bump
    )]
    pub circle: Account<'info, Circle>,
}

#[derive(Accounts)]
pub struct StartCircle<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"circle", creator.key().as_ref()],
        bump = circle.bump
    )]
    pub circle: Account<'info, Circle>,
}

#[derive(Accounts)]
pub struct Contribute<'info> {
    #[account(mut)]
    pub member: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"circle", circle.creator.as_ref()],
        bump = circle.bump
    )]
    pub circle: Account<'info, Circle>,
    
    #[account(
        mut,
        seeds = [b"escrow", circle.creator.as_ref()],
        bump = circle.escrow_bump
    )]
    /// CHECK: Escrow account for holding pooled funds
    pub escrow: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ClaimPayout<'info> {
    #[account(mut)]
    pub recipient: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"circle", circle.creator.as_ref()],
        bump = circle.bump
    )]
    pub circle: Account<'info, Circle>,
    
    #[account(
        mut,
        seeds = [b"escrow", circle.creator.as_ref()],
        bump = circle.escrow_bump
    )]
    /// CHECK: Escrow account for holding pooled funds
    pub escrow: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct UpdateFairScore<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"circle", circle.creator.as_ref()],
        bump = circle.bump
    )]
    pub circle: Account<'info, Circle>,
}

#[account]
pub struct Circle {
    pub creator: Pubkey,                          // 32 bytes
    pub name: String,                             // 4 + 32 bytes
    pub contribution_amount: u64,                 // 8 bytes
    pub period_length: i64,                       // 8 bytes
    pub min_fair_score: u8,                       // 1 byte
    pub current_round: u8,                        // 1 byte
    pub payout_index: u8,                         // 1 byte
    pub member_count: u8,                         // 1 byte
    pub status: CircleStatus,                     // 1 byte
    pub created_at: i64,                          // 8 bytes
    pub round_start_time: i64,                    // 8 bytes
    pub total_pool: u64,                          // 8 bytes
    pub round_contributions_complete: bool,       // 1 byte
    pub bump: u8,                                 // 1 byte
    pub escrow_bump: u8,                          // 1 byte
    pub members: [Pubkey; MAX_MEMBERS],           // 32 * 10 = 320 bytes
    pub fair_scores: [u8; MAX_MEMBERS],           // 10 bytes
    pub payout_order: [u8; MAX_MEMBERS],          // 10 bytes
    pub contributions: [[bool; MAX_MEMBERS]; MAX_MEMBERS], // 100 bytes
    pub has_claimed: [bool; MAX_MEMBERS],         // 10 bytes
}

impl Circle {
    pub const SIZE: usize = 8 + // discriminator
        32 + // creator
        4 + CIRCLE_NAME_MAX_LEN + // name (String)
        8 + // contribution_amount
        8 + // period_length
        1 + // min_fair_score
        1 + // current_round
        1 + // payout_index
        1 + // member_count
        1 + // status
        8 + // created_at
        8 + // round_start_time
        8 + // total_pool
        1 + // round_contributions_complete
        1 + // bump
        1 + // escrow_bump
        (32 * MAX_MEMBERS) + // members
        MAX_MEMBERS + // fair_scores
        MAX_MEMBERS + // payout_order
        (MAX_MEMBERS * MAX_MEMBERS) + // contributions
        MAX_MEMBERS + // has_claimed
        64; // padding for safety
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum CircleStatus {
    Forming,
    Active,
    Completed,
    Cancelled,
}

#[error_code]
pub enum FairCircleError {
    #[msg("Circle name is too long")]
    NameTooLong,
    #[msg("Invalid contribution amount")]
    InvalidContributionAmount,
    #[msg("Invalid period length")]
    InvalidPeriodLength,
    #[msg("Circle is not in forming status")]
    CircleNotForming,
    #[msg("Circle is full")]
    CircleFull,
    #[msg("Your FairScore does not meet the minimum requirement")]
    InsufficientFairScore,
    #[msg("You have already joined this circle")]
    AlreadyJoined,
    #[msg("Not enough members to start the circle")]
    NotEnoughMembers,
    #[msg("You are not authorized to perform this action")]
    Unauthorized,
    #[msg("Circle is not active")]
    CircleNotActive,
    #[msg("Invalid round number")]
    InvalidRound,
    #[msg("You are not a member of this circle")]
    NotMember,
    #[msg("You have already contributed for this round")]
    AlreadyContributed,
    #[msg("Not all members have contributed for this round")]
    RoundNotComplete,
    #[msg("You are not the payout recipient for this round")]
    NotPayoutRecipient,
    #[msg("You have already claimed your payout")]
    AlreadyClaimed,
}
