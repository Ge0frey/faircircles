import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { FaircircleSolanaProgram } from "../target/types/faircircle_solana_program";
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { expect } from "chai";

describe("faircircle-solana-program", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.FaircircleSolanaProgram as Program<FaircircleSolanaProgram>;
  
  const creator = provider.wallet;
  
  // Derive PDAs
  const [circlePDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("circle"), creator.publicKey.toBuffer()],
    program.programId
  );
  
  const [escrowPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("escrow"), creator.publicKey.toBuffer()],
    program.programId
  );

  it("Creates a FairCircle", async () => {
    const name = "Test Circle";
    const contributionAmount = new anchor.BN(0.5 * LAMPORTS_PER_SOL); // 0.5 SOL
    const periodLength = new anchor.BN(86400); // 1 day
    const minFairScore = 40; // Silver tier

    const tx = await program.methods
      .createCircle(name, contributionAmount, periodLength, minFairScore)
      .accounts({
        creator: creator.publicKey,
        circle: circlePDA,
        escrow: escrowPDA,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("Create circle transaction:", tx);

    // Fetch the circle account
    const circleAccount = await program.account.circle.fetch(circlePDA);
    
    expect(circleAccount.name).to.equal(name);
    expect(circleAccount.contributionAmount.toNumber()).to.equal(contributionAmount.toNumber());
    expect(circleAccount.periodLength.toNumber()).to.equal(periodLength.toNumber());
    expect(circleAccount.minFairScore).to.equal(minFairScore);
    expect(circleAccount.memberCount).to.equal(1); // Creator is first member
    expect(Object.keys(circleAccount.status)[0]).to.equal("forming");
    
    console.log("Circle created successfully!");
    console.log("  Name:", circleAccount.name);
    console.log("  Contribution:", circleAccount.contributionAmount.toNumber() / LAMPORTS_PER_SOL, "SOL");
    console.log("  Min FairScore:", circleAccount.minFairScore);
    console.log("  Member Count:", circleAccount.memberCount);
  });

  it("Member joins the circle", async () => {
    // Create a new member keypair
    const member = anchor.web3.Keypair.generate();
    
    // Airdrop some SOL to the member
    const airdropSig = await provider.connection.requestAirdrop(
      member.publicKey,
      2 * LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropSig);

    const fairScore = 55; // Silver tier

    const tx = await program.methods
      .joinCircle(fairScore)
      .accounts({
        member: member.publicKey,
        circle: circlePDA,
      })
      .signers([member])
      .rpc();

    console.log("Join circle transaction:", tx);

    // Fetch the updated circle
    const circleAccount = await program.account.circle.fetch(circlePDA);
    
    expect(circleAccount.memberCount).to.equal(2);
    expect(circleAccount.members[1].equals(member.publicKey)).to.be.true;
    expect(circleAccount.fairScores[1]).to.equal(fairScore);
    
    console.log("Member joined successfully!");
    console.log("  New member count:", circleAccount.memberCount);
  });

  it("Rejects member with insufficient FairScore", async () => {
    // Create a new member with low FairScore
    const lowScoreMember = anchor.web3.Keypair.generate();
    
    // Airdrop some SOL
    const airdropSig = await provider.connection.requestAirdrop(
      lowScoreMember.publicKey,
      2 * LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropSig);

    const lowFairScore = 20; // Below the 40 minimum

    try {
      await program.methods
        .joinCircle(lowFairScore)
        .accounts({
          member: lowScoreMember.publicKey,
          circle: circlePDA,
        })
        .signers([lowScoreMember])
        .rpc();
      
      // Should not reach here
      expect.fail("Should have thrown InsufficientFairScore error");
    } catch (error) {
      expect(error.message).to.include("InsufficientFairScore");
      console.log("Correctly rejected member with insufficient FairScore");
    }
  });

  it("Creator starts the circle with enough members", async () => {
    // Add one more member to meet minimum (3 members)
    const member3 = anchor.web3.Keypair.generate();
    const airdropSig = await provider.connection.requestAirdrop(
      member3.publicKey,
      2 * LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropSig);

    await program.methods
      .joinCircle(75) // Gold tier
      .accounts({
        member: member3.publicKey,
        circle: circlePDA,
      })
      .signers([member3])
      .rpc();

    // Now start the circle
    const tx = await program.methods
      .startCircle()
      .accounts({
        creator: creator.publicKey,
        circle: circlePDA,
      })
      .rpc();

    console.log("Start circle transaction:", tx);

    const circleAccount = await program.account.circle.fetch(circlePDA);
    
    expect(Object.keys(circleAccount.status)[0]).to.equal("active");
    expect(circleAccount.currentRound).to.equal(1);
    
    console.log("Circle started successfully!");
    console.log("  Status: Active");
    console.log("  Current Round:", circleAccount.currentRound);
    console.log("  Payout order (by FairScore, highest first):", circleAccount.payoutOrder.slice(0, circleAccount.memberCount));
  });
});
