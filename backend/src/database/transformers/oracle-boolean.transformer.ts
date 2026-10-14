import type { ValueTransformer } from 'typeorm';

export const oracleBooleanTransformer: ValueTransformer = {
  to(value: boolean): string {
    return value ? 'Y' : 'N';
  },
  from(value: string | null): boolean {
    return value === 'Y';
  },
};
