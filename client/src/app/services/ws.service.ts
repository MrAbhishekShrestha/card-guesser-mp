import { Injectable } from "@angular/core";
import { webSocket, WebSocketSubject } from "rxjs/webSocket";
import { ClientMessage, ServerMessage, ServerPayloads } from "../models/websocket.model";
import { Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private socket$!: WebSocketSubject<any>;
  messages$: Observable<ServerMessage<ServerPayloads>> = this.socket$?.asObservable();
  connected = false;

  connect(url: string) {
    if (!this.socket$ || this.socket$.closed) {
      this.socket$ = webSocket(url);
      this.connected = true;
      this.socket$.subscribe();
    }
  }

  sendMessage<K>(message: ClientMessage<K>) {
    if (this.socket$) {
      this.socket$.next(message);
    }
  }

  disconnect() {
    this.socket$.complete();
    this.connected = false;
  }
}