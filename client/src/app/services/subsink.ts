import { Subscription } from "rxjs";

export class SubSinkLocal {
  private subs: Subscription[] = []

  set sink(s: Subscription) {
    this.subs.push(s);
  }

  unsubscribe() {
    for (const s of this.subs) {
      s.unsubscribe();
    }
  }
}