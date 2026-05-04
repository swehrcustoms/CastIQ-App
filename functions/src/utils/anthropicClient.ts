import Anthropic from '@anthropic-ai/sdk';
import { defineSecret } from 'firebase-functions/params';

export const anthropicApiKey = defineSecret('ANTHROPIC_API_KEY');

export function getAnthropicClient(): Anthropic {
  return new Anthropic({ apiKey: anthropicApiKey.value() });
}

export const MODEL = 'claude-sonnet-4-20250514';
