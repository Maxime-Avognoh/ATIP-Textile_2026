export const SEPT_DISCOUNT = 0.20;

export function getSeptemberPromo(originalPrice: number): {
  isOnSale: boolean;
  salePrice: number;
  discountPct: number;
} {
  const now = new Date();
  const isOnSale = now.getFullYear() === 2026 && now.getMonth() === 8; // 8 = September
  return {
    isOnSale,
    salePrice: isOnSale ? Math.round(originalPrice * (1 - SEPT_DISCOUNT) * 100) / 100 : originalPrice,
    discountPct: Math.round(SEPT_DISCOUNT * 100),
  };
}

export function applySeptemberDiscount(cents: number): number {
  const now = new Date();
  const isOnSale = now.getFullYear() === 2026 && now.getMonth() === 8;
  return isOnSale ? Math.round(cents * (1 - SEPT_DISCOUNT)) : cents;
}
