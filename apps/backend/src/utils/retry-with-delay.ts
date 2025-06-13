type RetryResult<T> = {
  status: "success" | "error";
  data?: T;
  error?: any;
};

export async function retryWithDelay<T>(
  fn: () => Promise<RetryResult<T>>,
  maxRetries: number,
  initialDelay: number
): Promise<RetryResult<T>> {
  let currentRetry = 0;
  let currentDelay = initialDelay;

  while (currentRetry <= maxRetries) {
    try {
      const result = await fn();

      if (result.status === "success") {
        return result;
      }

      if (currentRetry === maxRetries) {
        return result;
      }

      console.log(
        `Retry attempt ${currentRetry + 1} failed. Waiting ${currentDelay}ms before next attempt...`
      );
      await new Promise((resolve) => setTimeout(resolve, currentDelay));

      currentRetry++;
      currentDelay *= 2; // Double the delay for next retry
    } catch (error) {
      if (currentRetry === maxRetries) {
        return {
          status: "error",
          error,
        };
      }

      console.log(
        `Retry attempt ${currentRetry + 1} failed with error. Waiting ${currentDelay}ms before next attempt...`
      );
      await new Promise((resolve) => setTimeout(resolve, currentDelay));

      currentRetry++;
      currentDelay *= 2;
    }
  }

  return {
    status: "error",
    error: "Max retries exceeded",
  };
}
