import { Injectable } from "@angular/core";
import { webSocket, WebSocketSubject } from "rxjs/webSocket";
import { WebSocketClientMessage } from "../models/websocket.model";

@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private socket$!: WebSocketSubject<any>;
  messages$ = this.socket$?.asObservable();
  connected = false;

  connect(url: string) {
    if (!this.socket$ || this.socket$.closed) {
      this.socket$ = webSocket(url);
      this.connected = true;
      this.socket$.subscribe();
    }
  }

  sendMessage(message: WebSocketClientMessage) {
    if (this.socket$) {
      this.socket$.next(JSON.stringify(message));
    }
  }

  disconnect() {
    this.socket$.complete();
    this.connected = false;
  }
}