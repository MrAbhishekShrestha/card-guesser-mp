package services

import (
	"encoding/json"

	"github.com/google/uuid"
)

type ClientMessage struct {
	Action  string          `json:"action"`
	Payload json.RawMessage `json:"payload"`
}

type CreateRoomPayload struct {
	TimeoutInSeconds int       `json:"timeoutSeconds"`
	PlayerId         uuid.UUID `json:"playerId"`
}

type JoinRoomPayload struct {
	RoomId   string    `json:"roomId"`
	PlayerId uuid.UUID `json:"playerId"`
}

type SetNamePayload struct {
	Name     string    `json:"name"`
	PlayerId uuid.UUID `json:"playerId"`
}
