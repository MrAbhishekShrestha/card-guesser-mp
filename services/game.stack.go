package services

import "slices"

type GameStack struct {
	games []*Game
	tos   int //Top of Stack index
}

func NewGameStack() *GameStack {
	return &GameStack{games: make([]*Game, 0), tos: 0}
}

func (g *GameStack) Push(game *Game) {
	g.games = append(g.games, game)
	g.tos++
}

func (g *GameStack) Peek() *Game {
	if g.tos == 0 {
		return nil
	}
	return g.games[g.tos-1]
}

func (g *GameStack) Pop() *Game {
	if g.tos == 0 {
		return nil
	}
	g.tos--
	game := g.games[g.tos]
	g.games = slices.Delete(g.games, g.tos, 1)
	return game
}

func (g *GameStack) Len() int {
	return len(g.games)
}

func (g *GameStack) GetAllGames() []*Game {
	var reversed []*Game
	for i := len(g.games) - 1; i >= 0; i-- {
		reversed = append(reversed, g.games[i])
	}
	return reversed
}
