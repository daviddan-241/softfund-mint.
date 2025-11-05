SUPABASE_URL=your_supabase_url_or_leave_blank
   SUPABASE_SERVICE_KEY=your_supabase_service_key_or_leave_blank
   METADATA_URI_BASE=https://your-hosted-metadata.example.com

## How the flow works
1. Frontend calculates SOL amount for $2.672 via CoinGecko and asks backend to prepare expectedLamports.
2. Frontend creates/sends a signed SOL transfer from buyer to treasury (client-side sign + send), then posts the payment txid to `/api/mint`.
3. Backend `/api/mint` verifies on-chain the treasury received the expected lamports, then uses Metaplex to create & mint an NFT to the buyer address.
4. Backend logs the mint in Supabase (if configured) for later airdrops.

## Airdrops
- Use `npm run airdrop` (requires MINT_AUTH_PRIVATE_KEY and SUPABASE keys) to mint reward NFTs to addresses in the `minters` table.
- Be aware minting thousands of NFTs on Mainnet costs significant SOL and storage fees.

## Security
- NEVER commit `MINT_AUTH_PRIVATE_KEY` to GitHub. Always store in Vercel env vars or a secure secret manager.
- Protect admin scripts; do not expose `/api/airdrop` publicly.
