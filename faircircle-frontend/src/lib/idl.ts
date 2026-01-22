// Generated IDL from anchor build
export const IDL = {
  "address": "FeuH9rfHZ8XuMQrFVdWHP6MEA4e4fqtF95Bbi3aiMZdk",
  "metadata": {
    "name": "faircircle_solana_program",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "claim_payout",
      "docs": [
        "Claim payout for the current round (only eligible member can claim)"
      ],
      "discriminator": [127, 240, 132, 62, 227, 198, 146, 133],
      "accounts": [
        { "name": "recipient", "writable": true, "signer": true },
        {
          "name": "circle",
          "writable": true,
          "pda": {
            "seeds": [
              { "kind": "const", "value": [99, 105, 114, 99, 108, 101] },
              { "kind": "account", "path": "circle.creator", "account": "Circle" }
            ]
          }
        },
        {
          "name": "escrow",
          "writable": true,
          "pda": {
            "seeds": [
              { "kind": "const", "value": [101, 115, 99, 114, 111, 119] },
              { "kind": "account", "path": "circle.creator", "account": "Circle" }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "contribute",
      "docs": ["Contribute SOL to the current round"],
      "discriminator": [82, 33, 68, 131, 32, 0, 205, 95],
      "accounts": [
        { "name": "member", "writable": true, "signer": true },
        {
          "name": "circle",
          "writable": true,
          "pda": {
            "seeds": [
              { "kind": "const", "value": [99, 105, 114, 99, 108, 101] },
              { "kind": "account", "path": "circle.creator", "account": "Circle" }
            ]
          }
        },
        {
          "name": "escrow",
          "writable": true,
          "pda": {
            "seeds": [
              { "kind": "const", "value": [101, 115, 99, 114, 111, 119] },
              { "kind": "account", "path": "circle.creator", "account": "Circle" }
            ]
          }
        },
        { "name": "system_program", "address": "11111111111111111111111111111111" }
      ],
      "args": []
    },
    {
      "name": "create_circle",
      "docs": ["Creates a new FairCircle with specified parameters"],
      "discriminator": [186, 99, 49, 131, 31, 51, 13, 198],
      "accounts": [
        { "name": "creator", "writable": true, "signer": true },
        {
          "name": "circle",
          "writable": true,
          "pda": {
            "seeds": [
              { "kind": "const", "value": [99, 105, 114, 99, 108, 101] },
              { "kind": "account", "path": "creator" }
            ]
          }
        },
        {
          "name": "escrow",
          "writable": true,
          "pda": {
            "seeds": [
              { "kind": "const", "value": [101, 115, 99, 114, 111, 119] },
              { "kind": "account", "path": "creator" }
            ]
          }
        },
        { "name": "system_program", "address": "11111111111111111111111111111111" }
      ],
      "args": [
        { "name": "name", "type": "string" },
        { "name": "contribution_amount", "type": "u64" },
        { "name": "period_length", "type": "i64" },
        { "name": "min_fair_score", "type": "u8" },
        { "name": "creator_fair_score", "type": "u8" }
      ]
    },
    {
      "name": "join_circle",
      "docs": ["Join an existing circle (requires meeting minimum FairScore)"],
      "discriminator": [231, 168, 235, 18, 99, 12, 22, 7],
      "accounts": [
        { "name": "member", "writable": true, "signer": true },
        {
          "name": "circle",
          "writable": true,
          "pda": {
            "seeds": [
              { "kind": "const", "value": [99, 105, 114, 99, 108, 101] },
              { "kind": "account", "path": "circle.creator", "account": "Circle" }
            ]
          }
        }
      ],
      "args": [{ "name": "fair_score", "type": "u8" }]
    },
    {
      "name": "start_circle",
      "docs": ["Start the circle once enough members have joined (creator only)"],
      "discriminator": [53, 52, 187, 212, 217, 132, 253, 102],
      "accounts": [
        { "name": "creator", "writable": true, "signer": true },
        {
          "name": "circle",
          "writable": true,
          "pda": {
            "seeds": [
              { "kind": "const", "value": [99, 105, 114, 99, 108, 101] },
              { "kind": "account", "path": "creator" }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "update_fair_score",
      "docs": ["Update a member's FairScore (for keeper/oracle updates)"],
      "discriminator": [237, 41, 3, 6, 71, 138, 19, 129],
      "accounts": [
        { "name": "authority", "writable": true, "signer": true },
        {
          "name": "circle",
          "writable": true,
          "pda": {
            "seeds": [
              { "kind": "const", "value": [99, 105, 114, 99, 108, 101] },
              { "kind": "account", "path": "circle.creator", "account": "Circle" }
            ]
          }
        }
      ],
      "args": [
        { "name": "member", "type": "pubkey" },
        { "name": "new_score", "type": "u8" }
      ]
    }
  ],
  "accounts": [
    {
      "name": "Circle",
      "discriminator": [27, 59, 8, 117, 62, 199, 222, 252]
    }
  ],
  "errors": [
    { "code": 6000, "name": "NameTooLong", "msg": "Circle name is too long" },
    { "code": 6001, "name": "InvalidContributionAmount", "msg": "Invalid contribution amount" },
    { "code": 6002, "name": "InvalidPeriodLength", "msg": "Invalid period length" },
    { "code": 6003, "name": "CircleNotForming", "msg": "Circle is not in forming status" },
    { "code": 6004, "name": "CircleFull", "msg": "Circle is full" },
    { "code": 6005, "name": "InsufficientFairScore", "msg": "Your FairScore does not meet the minimum requirement" },
    { "code": 6006, "name": "AlreadyJoined", "msg": "You have already joined this circle" },
    { "code": 6007, "name": "NotEnoughMembers", "msg": "Not enough members to start the circle" },
    { "code": 6008, "name": "Unauthorized", "msg": "You are not authorized to perform this action" },
    { "code": 6009, "name": "CircleNotActive", "msg": "Circle is not active" },
    { "code": 6010, "name": "InvalidRound", "msg": "Invalid round number" },
    { "code": 6011, "name": "NotMember", "msg": "You are not a member of this circle" },
    { "code": 6012, "name": "AlreadyContributed", "msg": "You have already contributed for this round" },
    { "code": 6013, "name": "RoundNotComplete", "msg": "Not all members have contributed for this round" },
    { "code": 6014, "name": "NotPayoutRecipient", "msg": "You are not the payout recipient for this round" },
    { "code": 6015, "name": "AlreadyClaimed", "msg": "You have already claimed your payout" }
  ],
  "types": [
    {
      "name": "Circle",
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "creator", "type": "pubkey" },
          { "name": "name", "type": "string" },
          { "name": "contribution_amount", "type": "u64" },
          { "name": "period_length", "type": "i64" },
          { "name": "min_fair_score", "type": "u8" },
          { "name": "current_round", "type": "u8" },
          { "name": "payout_index", "type": "u8" },
          { "name": "member_count", "type": "u8" },
          { "name": "status", "type": { "defined": { "name": "CircleStatus" } } },
          { "name": "created_at", "type": "i64" },
          { "name": "round_start_time", "type": "i64" },
          { "name": "total_pool", "type": "u64" },
          { "name": "round_contributions_complete", "type": "bool" },
          { "name": "bump", "type": "u8" },
          { "name": "escrow_bump", "type": "u8" },
          { "name": "members", "type": { "array": ["pubkey", 10] } },
          { "name": "fair_scores", "type": { "array": ["u8", 10] } },
          { "name": "payout_order", "type": { "array": ["u8", 10] } },
          { "name": "contributions", "type": { "array": [{ "array": ["bool", 10] }, 10] } },
          { "name": "has_claimed", "type": { "array": ["bool", 10] } }
        ]
      }
    },
    {
      "name": "CircleStatus",
      "type": {
        "kind": "enum",
        "variants": [
          { "name": "Forming" },
          { "name": "Active" },
          { "name": "Completed" },
          { "name": "Cancelled" }
        ]
      }
    }
  ]
} as const;

export type FaircircleProgram = typeof IDL;
