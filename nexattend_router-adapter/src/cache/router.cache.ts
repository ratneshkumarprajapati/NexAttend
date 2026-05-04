import type { AggregatedDevices } from "../aggregator/router.aggregator.js";

export class RouterCache {
  private snapshot: AggregatedDevices = {
    devices: [],
    failures: [],
    timestamp: new Date(0).toISOString()
  };

  get(): AggregatedDevices {
    return this.snapshot;
  }

  set(snapshot: AggregatedDevices): void {
    this.snapshot = snapshot;
  }
}
