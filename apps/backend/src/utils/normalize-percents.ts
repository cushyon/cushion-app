const SCALE      = 10_000;          
const TARGET_SUM = 100 * SCALE;     // 1 000 000

/** Normalise two percentages so they obey
 *   – each ≤ 100.0000
 *   – together = 100.0000
 *   – round up to four decimals
 */
export function normalisePercents(
  raw1: number,           
  raw2: number            
): { p1: number; p2: number } {
  /* 1 — clamp inputs to 0–100 (raw1/raw2 may arrive >100) */
  raw1 = Math.min(Math.max(raw1, 0), 100);
  raw2 = Math.min(Math.max(raw2, 0), 100);

  /* 2 — round to 4 dp → exact integers */
  let i1 = Math.round(raw1 * SCALE);     // e.g. 47.359987  → 473 600
  let i2 = Math.round(raw2 * SCALE);     // e.g. 52.641012  → 526 410
  let sum = i1 + i2;

  /* 3 — correct the total so i1+i2 ≡ TARGET_SUM */
  if (sum !== TARGET_SUM) {
    const diff = TARGET_SUM - sum;       // +ve → short, −ve → long

    // we adjust asset-2 first; if that isn't enough, spill into asset-1
    if (diff > 0) {
      // short: add diff to leg-2 (cannot exceed 100 % because diff ≤ missing)
      i2 += diff;
    } else {          // diff < 0 (we are long)
      const drop = -diff;
      if (i2 >= drop) {
        i2 -= drop;   // trim leg-2 by the excess
      } else {
        // need to trim more than leg-2 holds; zero it and trim remainder from leg-1
        i1 = Math.max(0, i1 - (drop - i2));
        i2 = 0;
      }
    }
  }

  /* 4 — convert back to four-dp strings for the API payload */
  return {
    p1: Number((i1 / SCALE).toFixed(4)),
    p2: Number((i2 / SCALE).toFixed(4))
  };
}