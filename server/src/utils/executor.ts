enum CircuitState {
  CLOSED,
  OPEN,
  HALF_OPEN
}

class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private nextAttemptTime: number = 0;

  constructor(
    private failureThreshold: number = 3,
    private recoveryTimeoutMs: number = 15000
  ) {}

  public async execute<T>(action: () => Promise<T>, fallback: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() > this.nextAttemptTime) {
        this.state = CircuitState.HALF_OPEN;
      } else {
        return fallback();
      }
    }

    try {
      const result = await action();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failureCount = 0;
    this.state = CircuitState.CLOSED;
  }

  private onFailure() {
    this.failureCount++;
    if (this.failureCount >= this.failureThreshold) {
      this.state = CircuitState.OPEN;
      this.nextAttemptTime = Date.now() + this.recoveryTimeoutMs;
      console.warn(`[CIRCUIT BREAKER] OPENED for ${this.recoveryTimeoutMs}ms`);
    }
  }
}

export class AgentExecutor {
  private circuitBreaker = new CircuitBreaker();

  private async sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public async runWithResilience<T>(
    agentTask: () => Promise<T>,
    taskPayload: any,
    maxRetries: number = 3
  ): Promise<T> {
    const executeTask = async () => {
      let attempt = 0;
      let baseDelay = 1000;

      while (attempt <= maxRetries) {
        try {
          return await agentTask();
        } catch (error) {
          attempt++;
          if (attempt > maxRetries) {
            console.error(`[EXECUTION FAILED] Task exhausted after ${maxRetries} retries.`);
            throw error;
          }
          const maxDelay = baseDelay * Math.pow(2, attempt);
          const jitterDelay = Math.random() * maxDelay;
          
          console.warn(`[RETRY] Attempt ${attempt} failed. Retrying in ${Math.round(jitterDelay)}ms...`);
          await this.sleep(jitterDelay);
        }
      }
      throw new Error("Execution failed");
    };

    const dlqFallback = async () => {
      console.error(`[DLQ ROUTING] Circuit Open. Routing task to DLQ. Payload:`, taskPayload);
      throw new Error("Service Unavailable - Task routed to DLQ");
    };

    return this.circuitBreaker.execute(executeTask, dlqFallback);
  }
}
