export function calculatePrice(count: number): { total: number, savings: number } {
  const base = 5.99;
  if (count <= 0) return { total: 0, savings: 0 };
  if (count === 1) return { total: 5.99, savings: 0 };
  if (count === 2) return { total: 11.99, savings: 0.99 };
  if (count === 3) return { total: 16.99, savings: 1.98 };
  const extra = count - 3;
  const total = 16.99 + extra * 5.00;
  const savings = (base * count) - total;
  return { total: parseFloat(total.toFixed(2)), savings: parseFloat(savings.toFixed(2)) };
} 