import { describe, it, expect } from 'vitest';
import { AIProviderGateway } from '../src/lib/aiProviderGateway';

describe('AI Provider Gateway Tests', () => {
  it('should have a factory and gateway', () => {
    expect(AIProviderGateway).toBeDefined();
  });
});
