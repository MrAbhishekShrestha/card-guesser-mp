package services

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand/v2"
	"time"

	"github.com/google/uuid"
)

const ONGOING = "ONGOING"

type Game struct {
	id      uuid.UUID
	target  int
	choices map[uuid.UUID]int
	scores  map[uuid.UUID]int
	status  string
}

func NewGame() *Game {
	return &Game{
		id:      uuid.New(),
		target:  rand.IntN(51) + 1,
		choices: make(map[uuid.UUID]int, 0),
		scores:  make(map[uuid.UUID]int, 0),
		status:  ONGOING,
	}
}

func (g *Game) isOngoing() bool {
	return g.status == ONGOING
}

func (g *Game) processScore() {
	g.status = "COMPLETE"
	targetRank := g.target % 13
	for key, val := range g.choices {
		currentRank := val % 13
		diff := abs(targetRank - currentRank)
		g.scores[key] = min(diff, 13-diff)
	}
}

func abs(x int) int {
	if x < 0 {
		return -x
	}
	return x
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

type Room struct {
	id        uuid.UUID
	players   map[uuid.UUID]bool
	timeout   time.Duration
	hub       *Hub
	broadcast chan []byte
	startGame chan *Player
	makeMove  chan PlayerWithMove
	gameStack *GameStack
}

func NewRoom(timeout int, hub *Hub) *Room {
	return &Room{
		id:        uuid.New(),
		players:   make(map[uuid.UUID]bool),
		timeout:   time.Second * time.Duration(timeout),
		hub:       hub,
		broadcast: make(chan []byte),
		startGame: make(chan *Player),
		makeMove:  make(chan PlayerWithMove),
		gameStack: NewGameStack(),
	}
}

func (r *Room) Run() {
	for {
		select {
		case payload := <-r.broadcast:
			r.broadCastMessage(payload)
		case player := <-r.startGame:
			if _, ok := r.players[player.id]; !ok {
				log.Printf("Player %s is not in room %s", player.id, r.id)
				player.send <- []byte(fmt.Sprintf("You are not in room %s", r.id))
				continue
			}
			lastGame := r.gameStack.Peek()
			if lastGame != nil && lastGame.isOngoing() {
				log.Printf("Current game is still on-going")
				player.send <- []byte("Current game is still on-going")
				continue
			}
			r.gameStack.Push(NewGame())
			log.Printf("New Game started")
			r.broadCastMessage([]byte("New Game started"))
		case payload := <-r.makeMove:
			if _, ok := r.players[payload.Player.id]; !ok {
				log.Printf("Player %s is not in room %s", payload.Player.id, r.id)
				payload.Player.send <- []byte(fmt.Sprintf("You are not in room %s", r.id))
				continue
			}
			game := r.gameStack.Peek()
			if game == nil || !game.isOngoing() {
				log.Print("Game is over")
				payload.Player.send <- []byte("Game is over")
				continue
			}
			game.choices[payload.Player.id] = payload.Move
			log.Printf("Player %s guessed %d in room %s\n", payload.Player.name, payload.Move, r.id)
			if len(game.choices) == len(r.players) {
				game.processScore()
				r.printResult()
			}
		}
	}
}

func (r *Room) broadCastMessage(payload []byte) {
	for playerId := range r.players {
		player, err := r.hub.Store.GetPlayerById(playerId)
		if err != nil {
			log.Printf("player %s not found\n", playerId)
			continue
		}
		player.send <- payload
	}
}

func (r *Room) printResult() error {
	res := make([]PlayerWithScore, 0)
	game := r.gameStack.Peek()
	if game == nil {
		return fmt.Errorf("No last game")
	}
	targetCard, err := MapIntToCard(game.target)
	if err != nil {
		return err
	}
	for key, value := range game.choices {
		player, err := r.hub.Store.GetPlayerById(key)
		if err != nil {
			return err
		}
		playerCard, err := MapIntToCard(value)
		if err != nil {
			return err
		}
		playerScore, _ := game.scores[key]
		scoreSturct := PlayerWithScore{
			Player: player.name,
			Guess:  playerCard.String(),
			Score:  playerScore,
		}
		res = append(res, scoreSturct)
	}
	payload := ResultResponse{
		RoomId:  r.id,
		GameId:  r.gameStack.tos - 1,
		Target:  targetCard.String(),
		Results: res,
	}
	bytes, err := json.Marshal(payload)
	if err != nil {
		return err
	}
	r.broadCastMessage(bytes)
	return nil
}
