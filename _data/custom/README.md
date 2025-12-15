# Custom Chain Data

This directory contains community-submitted chain data that will be merged with the official ethereum-lists/chains data.

## How to Submit a New Chain

1. Fork this repository
2. Create a new file in `_data/custom/chains/` named `eip155-{chainId}.json`
3. Fill in the required fields (see schema below)
4. Submit a Pull Request
5. Wait for automated validation and maintainer approval

## File Naming Convention

- Chain files: `eip155-{chainId}.json` (e.g., `eip155-12345.json`)
- Icon files: `{iconName}.json` (e.g., `mychain.json`)

## Required Fields

```json
{
  "name": "My Chain Name",
  "chain": "SYMBOL",
  "shortName": "mychain",
  "chainId": 12345,
  "networkId": 12345,
  "rpc": ["https://rpc.mychain.com"],
  "nativeCurrency": {
    "name": "My Token",
    "symbol": "MTK",
    "decimals": 18
  },
  "infoURL": "https://mychain.com"
}
```

## Optional Fields

```json
{
  "faucets": ["https://faucet.mychain.com"],
  "explorers": [
    {
      "name": "MyChain Explorer",
      "url": "https://explorer.mychain.com",
      "standard": "EIP3091"
    }
  ],
  "icon": "mychain",
  "features": [
    { "name": "EIP155" },
    { "name": "EIP1559" }
  ],
  "status": "active"
}
```

## Icon Format

If you want to add an icon, create a file in `_data/custom/icons/{iconName}.json`:

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

**Icon Requirements:**
- Must be hosted on IPFS
- Maximum size: 250KB
- Supported formats: PNG, SVG, JPG
- Recommended size: 256x256 pixels

## Validation

Your PR will be automatically validated for:
- Valid JSON format
- Required fields present
- Unique chainId (not already in ethereum-lists/chains or custom)
- RPC endpoint reachability
- Icon URL accessibility (if provided)

## Review Process

1. Automated checks must pass
2. Maintainer review required
3. Once approved, data will be merged and available on chains.click
