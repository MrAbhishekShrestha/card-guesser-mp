package services

import (
	"encoding/json"
	"fmt"

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

type RoomPayload struct {
	RoomId   uuid.UUID `json:"roomId"`
	PlayerId uuid.UUID `json:"playerId"`
}

type SetNamePayload struct {
	Name     string    `json:"name"`
	PlayerId uuid.UUID `json:"playerId"`
}

type MakeMovePayload struct {
	RoomId   uuid.UUID `json:"roomId"`
	Move     int       `json:"move"`
	PlayerId uuid.UUID `json:"playerId"`
}

type PlayerWithMove struct {
	Player *Player
	Move   int
}

type PlayerWithScore struct {
	Player string `json:"player"`
	Guess  string `json:"guess"`
	Score  int    `json:"score"`
}

type ResultResponse struct {
	RoomId  uuid.UUID         `json:"roomId"`
	GameId  int               `json:"gameId"`
	Target  string            `json:"target"`
	Results []PlayerWithScore `json:"results"`
}

type Card struct {
	Suit string
	Rank int
}

func NewCard(suitIndex, rank int) (*Card, error) {
	var suit string
	switch suitIndex {
	case 0:
		suit = "S"
	case 1:
		suit = "D"
	case 2:
		suit = "C"
	case 3:
		suit = "H"
	default:
		return nil, fmt.Errorf("suitIndex %d out of range", suitIndex)
	}
	return &Card{suit, rank}, nil
}

/*
S: 0 -> 12
D: 13 -> 25
C: 26 -> 38
H: 39 -> 51
*/
func MapIntToCard(num int) (*Card, error) {
	suitIndex := num / 13
	rank := num % 13
	return NewCard(suitIndex, rank)
}

func MapIntToRank(rankInt int) string {
	switch rankInt {
	case 0:
		return "A"
	case 10:
		return "J"
	case 11:
		return "Q"
	case 12:
		return "K"
	default:
		return fmt.Sprintf("%d", rankInt)
	}
}

func (c *Card) String() string {
	return c.Suit + MapIntToRank(c.Rank)
}
