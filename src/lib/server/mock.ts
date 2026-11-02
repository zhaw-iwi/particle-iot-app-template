import type { AppConfig } from './config';
import type { EventSource } from './collector';
import type { StreamEvent } from './particle/events';
import type { ReadingStore } from './readings';
import { normalizeEvent } from './readings';
import { pause } from './async';

/** Simulates the firmware, not a second set of browser-side fake readings. */
export class MockDevice implements EventSource {
  private counter = 60;
  private publish?: (event: StreamEvent) => void;
  constructor(private config: AppConfig) {}

  private event(counter: number, at = new Date()): StreamEvent {
    return {
      event: this.config.eventName,
      data: JSON.stringify({
        coreid: this.config.deviceId,
        data: String(counter),
        published_at: at.toISOString()
      })
    };
  }

  async seed(store: ReadingStore) {
    const now = Date.now();
    for (let index = 1; index <= 60; index++) {
      const reading = normalizeEvent(
        this.event(index, new Date(now - (60 - index) * 5000)),
        this.config.deviceId,
        this.config.eventName
      )!;
      await store.insert(reading);
    }
  }

  async stream(signal: AbortSignal, publish: (event: StreamEvent) => void, connected: () => void) {
    this.publish = publish;
    connected();
    try {
      while (!signal.aborted) {
        await pause(5000, signal);
        if (signal.aborted) break;
        this.counter = (this.counter + 1) % 1_000_001;
        publish(this.event(this.counter));
      }
    } finally {
      this.publish = undefined;
    }
  }
  async readCounter() {
    return this.counter;
  }
  async resetCounter() {
    this.counter = 0;
    this.publish?.(this.event(0));
    return 0;
  }
}
