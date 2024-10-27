package services

import "github.com/google/uuid"

type HubStore interface {
	RegisterPlayer(player *Player)
	GetPlayerById(id uuid.UUID) (*Player, error)
	UnregisterPlayer(id uuid.UUID) error
	SetPlayerName(id uuid.UUID, name string) error
	CreateRoom(room *Room)
	GetRoomById(id uuid.UUID) (*Room, error)
	DeleteRoom(id uuid.UUID) error
	JoinRoom(id uuid.UUID, playerId uuid.UUID) error
	LeaveRoom(id uuid.UUID, playerId uuid.UUID) error
}
