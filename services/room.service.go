package services

import (
	"fmt"
	"log"
	"math/rand/v2"
	"sort"
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
				errResp := GenericErrorResponse{
					Error: fmt.Sprintf("you are not in room %s", r.id),
				}
				resp, err := ServerFailMsg(START_GAME, errResp)
				if err != nil {
					log.Printf("error marshalling: %v\n", err)
					continue
				}
				player.send <- resp
				continue
			}
			lastGame := r.gameStack.Peek()
			if lastGame != nil && lastGame.isOngoing() {
				log.Printf("Current game is still on-going")
				errResp := GenericErrorResponse{
					Error: "Current game is still on-going",
				}
				resp, err := ServerFailMsg(START_GAME, errResp)
				if err != nil {
					log.Printf("error marshalling: %v\n", err)
					continue
				}
				player.send <- resp
				continue
			}
			game := NewGame()
			r.gameStack.Push(game)
			log.Printf("New Game started")
			resp := StartGameResponse{
				RoomId: r.id,
				GameId: game.id,
			}
			data, err := ServerSuccessMsg(START_GAME, resp)
			if err != nil {
				log.Printf("error marshalling: %v\n", err)
				continue
			}
			r.broadCastMessage(data)
		case payload := <-r.makeMove:
			if _, ok := r.players[payload.Player.id]; !ok {
				log.Printf("Player %s is not in room %s", payload.Player.id, r.id)
				errResp := GenericErrorResponse{
					Error: fmt.Sprintf("you are not in room %s", r.id),
				}
				resp, err := ServerFailMsg(MOVE, errResp)
				if err != nil {
					log.Printf("error marshalling: %v\n", err)
					continue
				}
				payload.Player.send <- resp
				continue
			}
			game := r.gameStack.Peek()
			if game == nil || !game.isOngoing() {
				log.Print("Game is over")
				errResp := GenericErrorResponse{
					Error: fmt.Sprintf("you are not in room %s", r.id),
				}
				resp, err := ServerFailMsg(MOVE, errResp)
				if err != nil {
					log.Printf("error marshalling: %v\n", err)
					continue
				}
				payload.Player.send <- resp
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
		return fmt.Errorf("no last game")
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
		playerScore := game.scores[key]
		scoreSturct := PlayerWithScore{
			Player: player.name,
			Guess:  playerCard.String(),
			Score:  playerScore,
		}
		res = append(res, scoreSturct)
	}
	sort.Slice(res, func(i, j int) bool {
		return res[i].Score <= res[j].Score
	})
	payload := ResultResponse{
		RoomId:  r.id,
		GameId:  game.id,
		Target:  targetCard.String(),
		Results: res,
	}
	resp, err := ServerSuccessMsg(END_GAME, payload)
	if err != nil {
		return err
	}
	r.broadCastMessage(resp)
	return nil
}
