package services

import (
	"fmt"
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

const (
	REGISTER = "REGISTER"
)

type Hub struct {
	Store      HubStore
	Register   chan *websocket.Conn
	Unregister chan uuid.UUID
	SetName    chan SetNamePayload
	CreateRoom chan CreateRoomPayload
	JoinRoom   chan RoomPayload
	LeaveRoom  chan RoomPayload
	StartGame  chan RoomPayload
	MakeMove   chan MakeMovePayload
}

func NewHub(store HubStore) *Hub {
	return &Hub{
		Store:      store,
		Register:   make(chan *websocket.Conn),
		Unregister: make(chan uuid.UUID),
		SetName:    make(chan SetNamePayload),
		CreateRoom: make(chan CreateRoomPayload),
		JoinRoom:   make(chan RoomPayload),
		LeaveRoom:  make(chan RoomPayload),
		StartGame:  make(chan RoomPayload),
		MakeMove:   make(chan MakeMovePayload),
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
			newPlayerPayload := RegisterPlayerResponse{
				PlayerId: id,
			}
			data, err := ServerSuccessMsg(REGISTER, newPlayerPayload)
			if err != nil {
				log.Printf("error marshalling: %v\n", err)
				continue
			}
			player.send <- data
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
				continue
			}
			log.Printf("Set Player %s name to %s", namePayload.PlayerId.String(), namePayload.Name)
		case payload := <-h.CreateRoom:
			player, err := h.Store.GetPlayerById(payload.PlayerId)
			if err != nil {
				log.Printf("player %s not found\n", payload.PlayerId)
				continue
			}
			room := NewRoom(payload.TimeoutInSeconds, h)
			go room.Run()
			h.Store.CreateRoom(room)
			log.Printf("new room %s created\n", room.id)
			newRoomPayload := CreateRoomResponse{
				RoomId: room.id,
			}
			data, err := ServerSuccessMsg(CREATE_ROOM, newRoomPayload)
			if err != nil {
				log.Printf("error marshalling: %v\n", err)
				continue
			}
			player.send <- data
		case payload := <-h.JoinRoom:
			player, err := h.Store.GetPlayerById(payload.PlayerId)
			if err != nil {
				log.Printf("player %s not found\n", payload.PlayerId)
				continue
			}
			room, err := h.Store.GetRoomById(payload.RoomId)
			if err != nil {
				log.Printf("room %s not found\n", payload.RoomId)
				createRoomErr := GenericErrorResponse{
					Error: fmt.Sprintf("room %s not found\n", payload.RoomId),
				}
				data, err := ServerFailMsg(JOIN_ROOM, createRoomErr)
				if err != nil {
					log.Printf("error marshalling: %v\n", err)
					continue
				}
				player.send <- data
				continue
			}
			room.players[player.id] = true
			log.Printf("Player %s Joined Room %s\n", player.name, room.id.String())
			playerNames := make([]string, 0)
			for k := range room.players {
				curPlayer, err := h.Store.GetPlayerById(k)
				if err != nil {
					log.Printf("player %s not found\n", k)
					continue
				}
				playerNames = append(playerNames, curPlayer.name)
			}
			joinRoomResp := JoinRoomResponse{
				RoomId:           payload.RoomId,
				TimeoutInSeconds: int(room.timeout / time.Second),
				NewPlayer:        player.name,
				Players:          playerNames,
			}
			data, err := ServerSuccessMsg(JOIN_ROOM, joinRoomResp)
			if err != nil {
				log.Printf("error marshalling: %v\n", err)
				continue
			}
			room.broadcast <- []byte(data)
		case payload := <-h.LeaveRoom:
			player, err := h.Store.GetPlayerById(payload.PlayerId)
			if err != nil {
				log.Printf("player %s not found\n", payload.PlayerId)
				continue
			}
			room, err := h.Store.GetRoomById(payload.RoomId)
			if err != nil {
				log.Printf("room %s not found\n", payload.RoomId)
				createRoomErr := GenericErrorResponse{
					Error: fmt.Sprintf("room %s not found\n", payload.RoomId),
				}
				data, err := ServerFailMsg(JOIN_ROOM, createRoomErr)
				if err != nil {
					log.Printf("error marshalling: %v\n", err)
					continue
				}
				player.send <- data
				continue
			}
			log.Printf("Player %s left Room %s\n", player.name, room.id.String())
			playerNames := make([]string, len(room.players))
			for k := range room.players {
				if k == payload.PlayerId {
					continue
				}
				player, err := h.Store.GetPlayerById(payload.PlayerId)
				if err != nil {
					log.Printf("player %s not found\n", k)
				}
				playerNames = append(playerNames, player.name)
			}
			leaveRoomResp := LeaveRoomResponse{
				RoomId:     payload.RoomId,
				LeftPlayer: player.name,
				Players:    playerNames,
			}
			data, err := ServerSuccessMsg(JOIN_ROOM, leaveRoomResp)
			if err != nil {
				log.Printf("error marshalling: %v\n", err)
				continue
			}
			room.broadcast <- []byte(data)
			delete(room.players, player.id)
		case payload := <-h.StartGame:
			player, err := h.Store.GetPlayerById(payload.PlayerId)
			if err != nil {
				log.Printf("player %s not found\n", payload.PlayerId)
				continue
			}
			room, err := h.Store.GetRoomById(payload.RoomId)
			if err != nil {
				log.Printf("room %s not found\n", payload.RoomId)
				createRoomErr := GenericErrorResponse{
					Error: fmt.Sprintf("room %s not found\n", payload.RoomId),
				}
				data, err := ServerFailMsg(JOIN_ROOM, createRoomErr)
				if err != nil {
					log.Printf("error marshalling: %v\n", err)
					continue
				}
				player.send <- data
				continue
			}
			room.startGame <- player
			log.Printf("Player %s is starting a new game in room %s\n", player.id, room.id)
		case payload := <-h.MakeMove:
			player, err := h.Store.GetPlayerById(payload.PlayerId)
			if err != nil {
				log.Printf("player %s not found\n", payload.PlayerId)
				continue
			}
			room, err := h.Store.GetRoomById(payload.RoomId)
			if err != nil {
				log.Printf("room %s not found\n", payload.RoomId)
				createRoomErr := GenericErrorResponse{
					Error: fmt.Sprintf("room %s not found\n", payload.RoomId),
				}
				data, err := ServerFailMsg(MOVE, createRoomErr)
				if err != nil {
					log.Printf("error marshalling: %v\n", err)
					continue
				}
				player.send <- data
				continue
			}
			newPL := PlayerWithMove{Player: player, Move: payload.Move}
			room.makeMove <- newPL
		}
	}
}
