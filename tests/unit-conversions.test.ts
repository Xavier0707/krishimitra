import { describe, it, expect } from 'vitest';
import {
  convertToQuintals,
  convertAreaToAcres,
  convertAcresToUnit,
} from '../lib/mandi/profit-calculator';

describe('Unit Conversions for MP Agriculture', () => {
  it('converts weight units accurately', () => {
    expect(convertToQuintals(100, 'quintal')).toBe(100);
    expect(convertToQuintals(500, 'kg')).toBe(5);
    expect(convertToQuintals(3, 'ton')).toBe(30);
  });

  it('converts area units accurately for MP standards', () => {
    // 1 Acre = 1.6 Bigha in central MP (0.625 acre per bigha)
    expect(convertAreaToAcres(10, 'acre')).toBe(10);
    expect(convertAreaToAcres(16, 'bigha')).toBe(10); // 16 * 0.625 = 10 acres

    // Convert acres back to bigha
    expect(convertAcresToUnit(10, 'bigha')).toBe(16);
  });
});
