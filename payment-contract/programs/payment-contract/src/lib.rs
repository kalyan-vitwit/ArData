use anchor_lang::prelude::*;

declare_id!("D3tJsQ2Ad36CNK68H9P9porbsmQAyXz8WxxN3CfkDi91");

#[program]
pub mod payment_contract {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
