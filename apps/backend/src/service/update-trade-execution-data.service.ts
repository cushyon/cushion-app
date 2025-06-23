// @ts-ignore
import { prisma } from "@repo/database";

export const updateTradeExecutionData = async (
  id: string,
  nav: number,
  initial_capital: number
) => {
  const currentExecutionData = await prisma.tradeexecution.findUnique({
    where: { id },
  });

  const new_max_nav = Math.max(currentExecutionData.max_nav, nav);

  const tradeExecutionData = await prisma.tradeexecution.update({
    where: { id },
    data: { nav, max_nav: new_max_nav },
  });
  return tradeExecutionData;
};
