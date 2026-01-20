// Shared API utilities

// Simulate network latency (ms)
export const DELAY = 500;

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
