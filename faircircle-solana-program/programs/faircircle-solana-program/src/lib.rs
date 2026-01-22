use anchor_lang::prelude::*;

declare_id!("FeuH9rfHZ8XuMQrFVdWHP6MEA4e4fqtF95Bbi3aiMZdk");

#[program]
pub mod faircircle_solana_program {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
