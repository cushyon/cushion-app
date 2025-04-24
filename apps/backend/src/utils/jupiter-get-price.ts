import axios from "axios";
import { z } from "zod";

export const JUPITER_PRICE_CACHE_KEY = "jupiter-price";
const CACHE_TIME = 15 * 60 * 1000; // 15 minutes in milliseconds

const jupiterPriceResponseSchema = z.object({
  data: z.record(
    z.object({
      id: z.string(),
      price: z.string(),
      type: z.string(),
    })
  ),
  timeTaken: z.number(),
});

export async function fetchJupiterTokenPrice(tokenMint: string) {
  const url = `https://api.jup.ag/price/v2?ids=${tokenMint}`;
  const response = await axios.get(url);
  const data = jupiterPriceResponseSchema.parse(response.data);
  return data.data[tokenMint].price;
}

export async function fetchJupiterTokenPriceVersusToken(
  tokenMint: string,
  tokenToCompare: string
) {
  const url = `https://api.jup.ag/price/v2?ids=${tokenMint}&vsToken=${tokenToCompare}`;
  const response = await axios.get(url);
  return response.data;
}
