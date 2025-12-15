# Contributing to chains.click

Thank you for your interest in contributing to chains.click! This guide will help you add new blockchain networks to our directory.

## Adding a New Chain

### Prerequisites

- The chain must be EVM-compatible
- At least one working HTTPS RPC endpoint
- The chainId must not already exist in [ethereum-lists/chains](https://github.com/ethereum-lists/chains)

### Step 1: Fork the Repository

1. Click the "Fork" button on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/chains.click.git
   cd chains.click
   ```

### Step 2: Create Your Chain File

Create a new file in `_data/custom/chains/` named `eip155-{chainId}.json`:

```bash
# Example for chainId 12345
touch _data/custom/chains/eip155-12345.json
```

### Step 3: Fill in Chain Data

Use this template and fill in your chain's information:

```json
{
  "name": "Your Chain Name",
  "chain": "SYMBOL",
  "shortName": "yourchain",
  "chainId": 12345,
  "networkId": 12345,
  "rpc": [
    "https://rpc.yourchain.com",
    "https://rpc2.yourchain.com"
  ],
  "faucets": [],
  "nativeCurrency": {
    "name": "Your Token",
    "symbol": "YTK",
    "decimals": 18
  },
  "infoURL": "https://yourchain.com",
  "explorers": [
    {
      "name": "YourChain Explorer",
      "url": "https://explorer.yourchain.com",
      "standard": "EIP3091"
    }
  ]
}
```

### Required Fields

| Field | Description | Example |
|-------|-------------|---------|
| `name` | Full chain name (max 100 chars) | `"Ethereum Mainnet"` |
| `chain` | Short symbol | `"ETH"` |
| `shortName` | URL-safe identifier (lowercase, no spaces) | `"eth"` |
| `chainId` | Unique chain ID (must match filename) | `1` |
| `networkId` | Network ID (usually same as chainId) | `1` |
| `rpc` | Array of HTTPS RPC URLs | `["https://..."]` |
| `nativeCurrency` | Object with name, symbol, decimals | See example |

### Optional Fields

| Field | Description |
|-------|-------------|
| `faucets` | Array of faucet URLs (for testnets) |
| `explorers` | Array of block explorer objects |
| `infoURL` | Project website URL |
| `icon` | Icon identifier (if adding icon) |
| `features` | Supported EIPs (EIP155, EIP1559, etc.) |
| `status` | `"active"`, `"incubating"`, or `"deprecated"` |
| `parent` | Parent chain info for L2s |

### Step 4: Add an Icon (Optional)

If you want to add a chain icon:

1. Upload your icon to IPFS (256x256 PNG recommended)
2. Create `_data/custom/icons/yourchain.json`:

```json
[
  {
    "url": "ipfs://QmYourIPFSHash",
    "width": 256,
    "height": 256,
    "format": "png"
  }
]
```

3. Add `"icon": "yourchain"` to your chain file

**Icon Requirements:**
- Must be hosted on IPFS
- Maximum file size: 250KB
- Formats: PNG, SVG, JPG
- Recommended size: 256x256 pixels

### Step 5: Validate Locally

Run the validation script to check your submission:

```bash
npm install
npm run validate
```

Fix any errors before proceeding.

### Step 6: Submit Your PR

1. Commit your changes:
   ```bash
   git add .
   git commit -m "feat: add [Chain Name] (chainId: XXXXX)"
   ```

2. Push to your fork:
   ```bash
   git push origin main
   ```

3. Create a Pull Request on GitHub

4. Fill out the PR template completely

### What Happens Next

1. **Automated Validation**: Our CI will validate your submission
2. **RPC Testing**: We'll test that your RPC endpoints are reachable
3. **Maintainer Review**: A maintainer will review your PR
4. **Merge**: Once approved, your chain will be added to chains.click

## Validation Rules

Your submission will be checked for:

- ✅ Valid JSON format
- ✅ All required fields present
- ✅ Filename matches chainId
- ✅ shortName is lowercase with only letters, numbers, and hyphens
- ✅ At least one RPC endpoint uses HTTPS
- ✅ At least one RPC endpoint is reachable
- ✅ chainId doesn't already exist
- ✅ Icon URL uses IPFS (if provided)

## Updating Existing Chains

To update an existing custom chain:

1. Find the file in `_data/custom/chains/`
2. Make your changes
3. Submit a PR with a clear description of what changed and why

## CI/CD Pipeline

All pull requests go through automated checks:

| Workflow | Trigger | Checks |
|----------|---------|--------|
| **CI** | Every PR | Type check, Build |
| **Validate PR** | PR to `_data/custom/**` | JSON schema, RPC health |
| **Deploy** | Push to main | Build & deploy to Cloudflare |
| **Sync** | Every 6 hours | Fetch upstream chain data |

### Required Secrets (for maintainers)

| Secret | Description |
|--------|-------------|
| `CLOUDFLARE_API_TOKEN` | API token with Pages deploy permissions |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID |

### Branch Protection (Recommended)

For the `main` branch:
- Require pull request before merging
- Require status checks: `build`
- Require conversation resolution
- For `_data/custom/**` changes: require maintainer approval

## Questions?

- Open an issue on GitHub
- Check existing chains for examples

Thank you for contributing to chains.click!
