/** Roll back partially constructed graphics resources without relying on context loss. */
export class AllocationScope {
  private cleanup: (() => void)[] = [];
  keep<T>(resource: T | null, release: (resource: T) => void, message: string): T {
    if (resource === null) throw Error(message);
    this.cleanup.push(() => release(resource));
    return resource;
  }
  commit() {
    this.cleanup.length = 0;
  }
  dispose() {
    for (const release of this.cleanup.reverse()) {
      try {
        release();
      } catch {
        /* Continue releasing the remaining independent allocations. */
      }
    }
    this.cleanup.length = 0;
  }
}
