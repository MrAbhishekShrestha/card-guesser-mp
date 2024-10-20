package services

import (
	"log"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

type Hub struct {
	Store      HubStore
	Register   chan *websocket.Conn
	Unregister chan uuid.UUID
	SetName    chan SetNamePayload
	CreateRoom chan CreateRoomPayload
	JoinRoom   chan JoinRoomPayload
	LeaveRoom  chan JoinRoomPayload
}

func NewHub(store HubStore) *Hub {
	return &Hub{
		Store:      store,
		Register:   make(chan *websocket.Conn),
		Unregister: make(chan uuid.UUID),
		SetName:    make(chan SetNamePayload),
		CreateRoom: make(chan CreateRoomPayload),
		JoinRoom:   make(chan JoinRoomPayload),
		LeaveRoom:  make(chan JoinRoomPayload),
	}
}

func (h *Hub) Run() {
	log.Println("Running Hub")
	for {
		select {
		case conn := <-h.Register:
			id := uuid.New()
			player := NewPlayer(id, conn, h)
			h.Store.RegisterPlayer(player)
			player.Run()
			player.send <- []byte(id.String())
			log.Printf("new player %s registered\n", id)
		case playerId := <-h.Unregister:
			if err := h.Store.UnregisterPlayer(playerId); err != nil {
				log.Printf("unregister player error: %v\n", err)
				continue
			}
			log.Printf("Player %s unregistered\n", playerId)
		case namePayload := <-h.SetName:
			if err := h.Store.SetPlayerName(namePayload.PlayerId, namePayload.Name); err != nil {
				log.Printf("error setting player name: %v\n", err)
			}
			log.Printf("Set Player %s name to %s", namePayload.PlayerId.String(), namePayload.Name)
		}
	}
}
