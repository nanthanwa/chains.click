#!/usr/bin/env npx tsx
/**
 * Validate custom chain data submissions
 * Used in CI to validate PRs that add new chains
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, basename } from 'path';

const CUSTOM_CHAINS_DIR = join(process.cwd(), '_data', 'custom', 'chains');
const CUSTOM_ICONS_DIR = join(process.cwd(), '_data', 'custom', 'icons');
const CHAIN_SCHEMA_PATH = join(process.cwd(), '_data', 'custom', 'chain.schema.json');
const ICON_SCHEMA_PATH = join(process.cwd(), '_data', 'custom', 'icon.schema.json');
const EXISTING_CHAINS_PATH = join(process.cwd(), 'src', 'lib', 'data', 'chains-mini.json');

interface ValidationError {
	file: string;
	errors: string[];
}

interface ChainData {
	name: string;
	chain: string;
	shortName: string;
	chainId: number;
	networkId: number;
	rpc: string[];
	nativeCurrency: {
		name: string;
		symbol: string;
		decimals: number;
	};
	[key: string]: unknown;
}

interface ExistingChain {
	id: number;
	name: string;
}

// Load existing chain IDs to check for duplicates
function loadExistingChainIds(): Set<number> {
	const ids = new Set<number>();

	if (existsSync(EXISTING_CHAINS_PATH)) {
		try {
			const chains = JSON.parse(readFileSync(EXISTING_CHAINS_PATH, 'utf-8')) as ExistingChain[];
			chains.forEach(c => ids.add(c.id));
		} catch {
			console.warn('Warning: Could not load existing chains for duplicate check');
		}
	}

	return ids;
}

// Validate JSON syntax
function validateJsonSyntax(filePath: string): { valid: boolean; data?: unknown; error?: string } {
	try {
		const content = readFileSync(filePath, 'utf-8');
		const data = JSON.parse(content);
		return { valid: true, data };
	} catch (e) {
		return { valid: false, error: `Invalid JSON: ${(e as Error).message}` };
	}
}

// Validate chain data against required fields
function validateChainData(data: unknown, filename: string): string[] {
	const errors: string[] = [];
	const chain = data as ChainData;

	// Required fields
	const requiredFields = ['name', 'chain', 'shortName', 'chainId', 'networkId', 'rpc', 'nativeCurrency'];
	for (const field of requiredFields) {
		if (!(field in chain)) {
			errors.push(`Missing required field: ${field}`);
		}
	}

	if (errors.length > 0) return errors;

	// Validate chainId matches filename
	const expectedFilename = `eip155-${chain.chainId}.json`;
	if (filename !== expectedFilename) {
		errors.push(`Filename mismatch: expected ${expectedFilename}, got ${filename}`);
	}

	// Validate chainId is positive integer
	if (!Number.isInteger(chain.chainId) || chain.chainId < 1) {
		errors.push(`chainId must be a positive integer, got: ${chain.chainId}`);
	}

	// Validate networkId
	if (!Number.isInteger(chain.networkId) || chain.networkId < 1) {
		errors.push(`networkId must be a positive integer, got: ${chain.networkId}`);
	}

	// Validate RPC array
	if (!Array.isArray(chain.rpc) || chain.rpc.length === 0) {
		errors.push('rpc must be a non-empty array');
	} else {
		for (const rpc of chain.rpc) {
			if (typeof rpc !== 'string') {
				errors.push(`Invalid RPC entry: must be string`);
			} else if (!rpc.startsWith('https://')) {
				errors.push(`RPC must use HTTPS: ${rpc}`);
			}
		}
	}

	// Validate nativeCurrency
	if (chain.nativeCurrency) {
		if (!chain.nativeCurrency.name || typeof chain.nativeCurrency.name !== 'string') {
			errors.push('nativeCurrency.name is required and must be a string');
		}
		if (!chain.nativeCurrency.symbol || typeof chain.nativeCurrency.symbol !== 'string') {
			errors.push('nativeCurrency.symbol is required and must be a string');
		}
		if (typeof chain.nativeCurrency.decimals !== 'number' || chain.nativeCurrency.decimals < 0) {
			errors.push('nativeCurrency.decimals must be a non-negative number');
		}
	}

	// Validate shortName format
	if (chain.shortName && !/^[a-z0-9-]+$/.test(chain.shortName)) {
		errors.push('shortName must contain only lowercase letters, numbers, and hyphens');
	}

	// Validate name length
	if (chain.name && chain.name.length > 100) {
		errors.push('name must be 100 characters or less');
	}

	return errors;
}

// Test RPC endpoint reachability
async function testRpcEndpoint(rpcUrl: string): Promise<{ reachable: boolean; error?: string }> {
	try {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 10000);

		const response = await fetch(rpcUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				jsonrpc: '2.0',
				method: 'eth_chainId',
				params: [],
				id: 1
			}),
			signal: controller.signal
		});

		clearTimeout(timeout);

		if (!response.ok) {
			return { reachable: false, error: `HTTP ${response.status}` };
		}

		const data = await response.json() as { result?: string; error?: { message: string } };
		if (data.error) {
			return { reachable: false, error: data.error.message };
		}

		return { reachable: true };
	} catch (e) {
		return { reachable: false, error: (e as Error).message };
	}
}

// Validate icon data
function validateIconData(data: unknown): string[] {
	const errors: string[] = [];

	if (!Array.isArray(data)) {
		errors.push('Icon data must be an array');
		return errors;
	}

	if (data.length === 0) {
		errors.push('Icon array must not be empty');
		return errors;
	}

	for (const icon of data) {
		if (!icon.url || typeof icon.url !== 'string') {
			errors.push('Icon must have a url string');
		} else if (!icon.url.startsWith('ipfs://')) {
			errors.push(`Icon URL must use IPFS: ${icon.url}`);
		}

		if (typeof icon.width !== 'number' || icon.width < 16 || icon.width > 1024) {
			errors.push('Icon width must be between 16 and 1024');
		}

		if (typeof icon.height !== 'number' || icon.height < 16 || icon.height > 1024) {
			errors.push('Icon height must be between 16 and 1024');
		}

		if (!['png', 'svg', 'jpg', 'jpeg'].includes(icon.format)) {
			errors.push(`Invalid icon format: ${icon.format}. Must be png, svg, jpg, or jpeg`);
		}
	}

	return errors;
}

async function main() {
	console.log('Validating custom chain data...\n');

	const validationErrors: ValidationError[] = [];
	const existingChainIds = loadExistingChainIds();
	const customChainIds = new Set<number>();
	let hasErrors = false;

	// Validate chain files
	if (existsSync(CUSTOM_CHAINS_DIR)) {
		const chainFiles = readdirSync(CUSTOM_CHAINS_DIR)
			.filter(f => f.endsWith('.json') && f.startsWith('eip155-'));

		console.log(`Found ${chainFiles.length} chain file(s) to validate\n`);

		for (const filename of chainFiles) {
			const filePath = join(CUSTOM_CHAINS_DIR, filename);
			const errors: string[] = [];

			console.log(`Validating ${filename}...`);

			// Check JSON syntax
			const jsonResult = validateJsonSyntax(filePath);
			if (!jsonResult.valid) {
				errors.push(jsonResult.error!);
			} else {
				// Validate chain data
				const chainErrors = validateChainData(jsonResult.data, filename);
				errors.push(...chainErrors);

				// Check for duplicate chainId
				const chain = jsonResult.data as ChainData;
				if (chain.chainId) {
					if (existingChainIds.has(chain.chainId)) {
						errors.push(`chainId ${chain.chainId} already exists in ethereum-lists/chains`);
					}
					if (customChainIds.has(chain.chainId)) {
						errors.push(`chainId ${chain.chainId} is duplicated in custom chains`);
					}
					customChainIds.add(chain.chainId);
				}

				// Test at least one RPC endpoint
				if (chain.rpc && chain.rpc.length > 0 && errors.length === 0) {
					console.log(`  Testing RPC endpoints...`);
					let anyReachable = false;
					for (const rpc of chain.rpc.slice(0, 3)) { // Test first 3 RPCs
						const result = await testRpcEndpoint(rpc);
						if (result.reachable) {
							console.log(`  ✓ ${rpc} is reachable`);
							anyReachable = true;
							break;
						} else {
							console.log(`  ✗ ${rpc}: ${result.error}`);
						}
					}
					if (!anyReachable) {
						errors.push('No RPC endpoints are reachable');
					}
				}
			}

			if (errors.length > 0) {
				validationErrors.push({ file: filename, errors });
				console.log(`  ✗ FAILED\n`);
			} else {
				console.log(`  ✓ PASSED\n`);
			}
		}
	} else {
		console.log('No custom chains directory found\n');
	}

	// Validate icon files
	if (existsSync(CUSTOM_ICONS_DIR)) {
		const iconFiles = readdirSync(CUSTOM_ICONS_DIR)
			.filter(f => f.endsWith('.json'));

		if (iconFiles.length > 0) {
			console.log(`Found ${iconFiles.length} icon file(s) to validate\n`);

			for (const filename of iconFiles) {
				const filePath = join(CUSTOM_ICONS_DIR, filename);
				const errors: string[] = [];

				console.log(`Validating ${filename}...`);

				const jsonResult = validateJsonSyntax(filePath);
				if (!jsonResult.valid) {
					errors.push(jsonResult.error!);
				} else {
					const iconErrors = validateIconData(jsonResult.data);
					errors.push(...iconErrors);
				}

				if (errors.length > 0) {
					validationErrors.push({ file: filename, errors });
					console.log(`  ✗ FAILED\n`);
				} else {
					console.log(`  ✓ PASSED\n`);
				}
			}
		}
	}

	// Summary
	console.log('─'.repeat(50));
	if (validationErrors.length > 0) {
		console.log('\n❌ Validation FAILED\n');
		for (const { file, errors } of validationErrors) {
			console.log(`${file}:`);
			for (const error of errors) {
				console.log(`  - ${error}`);
			}
			console.log();
		}
		process.exit(1);
	} else {
		console.log('\n✅ All validations PASSED\n');
	}
}

main().catch(error => {
	console.error('Validation failed:', error);
	process.exit(1);
});
