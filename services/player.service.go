package services

import (
	"encoding/json"
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

const (
	writeWait      = 10 * time.Second    // time allowed to write a message to the peer
	pongWait       = 60 * time.Second    // time allowed to read the next pong message from the peer
	pingPeriod     = (pongWait * 9) / 10 // sends pings to peer with this period. Must be less than pong wait
	maxMessageSize = 512                 // max message size allowed from the peer
)

var (
	newline = []byte{'\n'}
)

type Player struct {
	id     uuid.UUID
	roomId uuid.UUID
	name   string
	conn   *websocket.Conn
	send   chan []byte
	hub    *Hub
}

func NewPlayer(id uuid.UUID, conn *websocket.Conn, hub *Hub) *Player {
	return &Player{
		id:     id,
		roomId: uuid.Nil,
		conn:   conn,
		send:   make(chan []byte),
		hub:    hub,
	}
}

func (p *Player) SetName(name string) {
	p.name = name
}

func (p *Player) Run() {
	go p.readPump()
	go p.writePump()
}

func (p *Player) readPump() {
	defer func() {
		p.hub.Unregister <- p.id
		p.conn.Close()
	}()
	p.conn.SetReadLimit(maxMessageSize)
	p.conn.SetReadDeadline(time.Now().Add(pongWait))
	p.conn.SetPongHandler(func(appData string) error {
		p.conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})
	for {
		_, message, err := p.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("err: %v\n", err)
			}
			break
		}
		var msg ClientMessage
		if err = json.Unmarshal(message, &msg); err != nil {
			log.Println("Error unmarshalling message: ", err)
			errResp := GenericErrorResponse{
				Error: err.Error(),
			}
			resp1, err := ServerFailMsg("", errResp)
			if err != nil {
				log.Printf("error marshalling response: %v\n", err)
				continue
			}
			p.send <- resp1
			continue
		}
		if err = ActionHandler(p, msg.Action, msg.Payload); err != nil {
			log.Print(err)
			errResp := GenericErrorResponse{
				Error: err.Error(),
			}
			resp, err := ServerFailMsg(msg.Action, errResp)
			if err != nil {
				log.Printf("error marshalling response: %v\n", err)
				continue
			}
			p.send <- resp
			continue
		}
	}
}

/*
writePump pumps messages from the hub to the websocket connection.

A goroutine running writePump is started for each connection. The app ensures
that there is at most 1 writer to a connection by executing all writes from
this goroutine.
*/
func (p *Player) writePump() {
	// ticker := time.NewTicker(pingPeriod)
	ticker := time.NewTicker(time.Second * 15)
	defer func() {
		ticker.Stop()
		p.conn.Close()
	}()

	for {
		select {
		case <-ticker.C:
			p.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := p.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		case message, ok := <-p.send:
			p.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				// the hub closed the channel
				p.conn.WriteMessage(websocket.CloseMessage, nil)
				return
			}
			w, err := p.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			// add queued messages to the current websocket message
			n := len(p.send)
			for i := 0; i < n; i++ {
				w.Write(newline)
				w.Write(<-p.send)
			}

			if err := w.Close(); err != nil {
				return
			}
		}
	}
}
