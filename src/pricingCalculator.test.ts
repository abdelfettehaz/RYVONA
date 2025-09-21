import { calculatePrice } from './pricingCalculator';
describe('calculatePrice', () => {
  it('calculates for 1 shirt', () => {
    expect(calculatePrice(1)).toEqual({ total: 5.99, savings: 0 });
  });
  it('calculates for 2 shirts', () => {
    expect(calculatePrice(2)).toEqual({ total: 11.99, savings: 0.99 });
  });
  it('calculates for 3 shirts', () => {
    expect(calculatePrice(3)).toEqual({ total: 16.99, savings: 1.98 });
  });
  it('calculates for 4 shirts', () => {
    expect(calculatePrice(4)).toEqual({ total: 21.99, savings: 2.97 });
  });
  it('calculates for 5 shirts', () => {
    expect(calculatePrice(5)).toEqual({ total: 26.99, savings: 3.96 });
  });
}); 