import { normalisePercents } from "./normalize-percents";

export const checkPercentage = (percentage1: number, percentage2: number) => {
  if (percentage1 + percentage2 !== 100) {
    throw new Error("Percentage must be between 0 and 100");
  }
};

export const normalisePercentage = (
  percentage1: number,
  percentage2: number
) => {
  if (percentage1 + percentage2 !== 100) {
    console.log("----- STARTING NORMALISE PERCENTAGE -----");
    console.log(
      "Percentage must be 100, current value:",
      percentage1 + percentage2
    );
    //send a tg notif instead and round the values throw new Error("Percentage asset1 and asset2 must be 100");
    const { p1, p2 } = normalisePercents(percentage1, percentage2);
    console.log("Normalised percentages", p1, p2);
    console.log("----- NORMALISE PERCENTAGE COMPLETED -----");
    return { percentage1: p1, percentage2: p2 };
  }
  return { percentage1, percentage2 };
};
