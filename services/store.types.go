package services

import "github.com/google/uuid"

type HubStore interface {
	RegisterPlayer(player *Player)
	GetPlayerById(id uuid.UUID) (*Player, error)
	UnregisterPlayer(id uuid.UUID) error
	SetPlayerName(id uuid.UUID, name string) error
	CreateRoom(room any)
	GetRoomById(id string)
	DeleteRoom(id string)
	JoinRoom(id string)
	LeaveRoom(id string)
}
