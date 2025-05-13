import axios from "axios";

export interface TokenAccountBalanceResponse {
  jsonrpc: string;
  id: number;
  result: {
    value: {
      amount: string;
      decimals: number;
      uiAmount: number;
      uiAmountString: string;
    };
    context: {
      slot: number;
    };
  };
}

export async function getTokenAccountBalance(
  accountAddress: string
): Promise<TokenAccountBalanceResponse> {
  try {
    console.log("process.env.HELIUS_API_KEY", process.env.HELIUS_API_KEY);
    const response = await axios.post(
      `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`,
      {
        jsonrpc: "2.0",
        id: 1,
        method: "getTokenAccountBalance",
        params: [accountAddress],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        `Failed to fetch token account balance: ${error.message}`
      );
    }
    throw error;
  }
}
