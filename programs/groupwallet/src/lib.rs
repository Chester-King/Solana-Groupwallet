use anchor_lang::prelude::*;
use anchor_lang::require;
use std::vec::Vec;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod groupwallet {
    use super::*;
    pub fn initialize(ctx: Context<Initialize>, _user_key_vector: Vec<Pubkey>) -> ProgramResult {
        let _data_account = &mut ctx.accounts.data_account;
        _data_account.members = _user_key_vector;
        Ok(())
    }

    pub fn newproposal(ctx: Context<Propupdate>, _topay: Pubkey, _amount: u64) -> ProgramResult {
        let signer_address = &mut ctx.accounts.signer;
        let _members = &mut ctx.accounts.data_account.members;
        let _proposal_account = &mut ctx.accounts.proposal_account;
        require!(_members.contains(&signer_address.to_account_info().key()),CustomError::WrongUser);

        _proposal_account.topay = _topay;
        _proposal_account.amount = _amount;
        _proposal_account.votestatus = vec![false; _members.len()];
        

        Ok(())
    }

    pub fn voteproposal(ctx: Context<Voteupdate>, _vote: bool, _index: u64) -> ProgramResult {
        let _proposal_account = &mut ctx.accounts.proposal_account;
        let _members = &mut ctx.accounts.data_account.members;
        let signer_address = &mut ctx.accounts.signer;
        require!(_members[_index as usize]==signer_address.to_account_info().key(),CustomError::WrongUser);
        _proposal_account.votestatus[_index as usize] = _vote;

        Ok(())
    }

    pub fn executeproposal(ctx: Context<Execupdate>) -> ProgramResult {
        
        let _proposal_account = &mut ctx.accounts.proposal_account;
        let signer_address = &mut ctx.accounts.signer;
        let _data_account = &mut ctx.accounts.data_account;
        let balance = _proposal_account.amount;

        require!(_proposal_account.topay==signer_address.to_account_info().key(),CustomError::WrongInput);


        require!(!_proposal_account.votestatus.contains(&false),CustomError::NoFullConsent);

        **_data_account.to_account_info().try_borrow_mut_lamports()? -= balance;
        **signer_address.to_account_info().try_borrow_mut_lamports()? += balance;


        Ok(())
    }

}

#[error]
pub enum CustomError {
    WrongInput,
    TimeError,
    SameUser,
    WrongUser,
    ChallengeNotExpired,
    ChallengeExpired,
    NoFullConsent,
    NotEnoughFunds
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = user, space = 16 + 500)]
    pub data_account: Account<'info, DataAccount>,
    #[account(init, payer = user, space = 16 + 500)]
    pub proposal_account: Account<'info, ProposalAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program <'info, System>,
}

#[derive(Accounts)]
pub struct Propupdate<'info> {
    #[account(mut)]
    pub proposal_account: Account<'info, ProposalAccount>,
    #[account(mut)]
    pub data_account: Account<'info, DataAccount>,
    pub signer: Signer<'info>,
    pub system_program: Program <'info, System>,
}

#[derive(Accounts)]
pub struct Voteupdate<'info> {
    #[account(mut)]
    pub proposal_account: Account<'info, ProposalAccount>,
    #[account(mut)]
    pub data_account: Account<'info, DataAccount>,
    pub signer: Signer<'info>,
    pub system_program: Program <'info, System>,
}


#[derive(Accounts)]
pub struct Execupdate<'info> {
    #[account(mut)]
    pub proposal_account: Account<'info, ProposalAccount>,
    #[account(mut)]
    pub data_account: Account<'info, DataAccount>,
    pub signer: Signer<'info>,
    pub system_program: Program <'info, System>,
}


#[account]
pub struct DataAccount {
    pub members : Vec<Pubkey>
}

#[account]
pub struct ProposalAccount {
    pub topay : Pubkey,
    pub amount : u64,
    pub votestatus : Vec<bool>
}
