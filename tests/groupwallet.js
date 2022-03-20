const assert = require("assert");
const anchor = require("@project-serum/anchor");
const { 
  Connection,
  TransactionInstruction,
  Transaction,
  sendAndConfirmTransaction,
  PublicKey,
  SystemProgram

} = anchor.web3;
var BigNumber = require('big-number');
describe('groupwallet', () => {

  const provider = anchor.Provider.local();
  anchor.setProvider(provider);

  const dataAccount = anchor.web3.Keypair.generate();
  const proposalAccount = anchor.web3.Keypair.generate();


  it('Is initialized!', async () => {
    // Add your test here.
    const program = await anchor.workspace.Groupwallet;
    const tx = await program.rpc.initialize(
      [provider.wallet.publicKey,provider.wallet.publicKey],
      {
        accounts: {
          user : provider.wallet.publicKey,
          dataAccount : dataAccount.publicKey,
          proposalAccount : proposalAccount.publicKey,
          systemProgram : anchor.web3.SystemProgram.programId

        },
        signers: [
          dataAccount,
          proposalAccount
        ]
      }
    );
    // await console.log("Your transaction signature", tx);
    let account = await program.account.dataAccount.fetch(
      dataAccount.publicKey
    );
    // await console.log(account)
    let v1 = await anchor.getProvider().connection.getBalance(provider.wallet.publicKey);
    let v2 = await anchor.getProvider().connection.getBalance(dataAccount.publicKey);
    // await console.log(v1," - ",v2);
    await assert.ok(
      v2<2004482240
    );
    const lamports = 5000000000;
    // await console.log(lamports);
    
    let transaction = new Transaction();

    // Add an instruction to execute
    transaction.add(SystemProgram.transfer({
        fromPubkey: provider.wallet.publicKey,
        toPubkey: dataAccount.publicKey,
        lamports: lamports,
    }));
    // await console.log(typeof provider.wallet);
    // await console.log(provider.wallet.payer._keypair.secretKey);
    await sendAndConfirmTransaction(anchor.getProvider().connection, transaction, [provider.wallet.payer])
    
    
    v1 = await anchor.getProvider().connection.getBalance(provider.wallet.publicKey);
    v2 = await anchor.getProvider().connection.getBalance(dataAccount.publicKey);
    // await console.log(v1," - ",v2);
    await assert.ok(
      v2>5000000000
    );
    let account2 = await program.account.proposalAccount.fetch(
      proposalAccount.publicKey
    );
    // await console.log(account2)
    await assert.ok(
      !account2.vote1 && !account2.vote2
    );
  });


  it('new proposal', async () => {

    const program = await anchor.workspace.Groupwallet;

    // await console.log(provider.wallet.publicKey.toString())

    const tx = await program.rpc.newproposal(
      provider.wallet.publicKey,
      new anchor.BN(5000000000),
      {
        accounts: {
          signer : provider.wallet.publicKey,
          dataAccount : dataAccount.publicKey,
          proposalAccount : proposalAccount.publicKey,
          systemProgram : anchor.web3.SystemProgram.programId

        },
        
      }
    );

    let account1 = await program.account.dataAccount.fetch(
      dataAccount.publicKey
    );
    let account2 = await program.account.proposalAccount.fetch(
      proposalAccount.publicKey
    );

    // await console.log(account1);
    // await console.log(account2);

  })


  it('new proposal', async () => {

    const program = await anchor.workspace.Groupwallet;
  
    const tx = await program.rpc.voteproposal(
      true,
      new anchor.BN(0),
      {
        accounts: {
          signer : provider.wallet.publicKey,
          dataAccount : dataAccount.publicKey,
          proposalAccount : proposalAccount.publicKey,
          systemProgram : anchor.web3.SystemProgram.programId

        },
        
      }
    );

    const tx2 = await program.rpc.voteproposal(
      true,
      new anchor.BN(1),
      {
        accounts: {
          signer : provider.wallet.publicKey,
          dataAccount : dataAccount.publicKey,
          proposalAccount : proposalAccount.publicKey,
          systemProgram : anchor.web3.SystemProgram.programId

        },
        
      }
    );

    let account1 = await program.account.dataAccount.fetch(
      dataAccount.publicKey
    );
    let account2 = await program.account.proposalAccount.fetch(
      proposalAccount.publicKey
    );

    // await console.log(account1);
    // await console.log(account2);

  });

  it('exec proposal', async () => {

    const program = await anchor.workspace.Groupwallet;
  
    const tx = await program.rpc.executeproposal(
      {
        accounts: {
          signer : provider.wallet.publicKey,
          dataAccount : dataAccount.publicKey,
          proposalAccount : proposalAccount.publicKey,
          systemProgram : anchor.web3.SystemProgram.programId

        },
        
      }
    );

  })


});
