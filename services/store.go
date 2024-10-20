package services

import (
	"errors"

	"github.com/google/uuid"
)

type Store struct {
	players map[uuid.UUID]*Player
	rooms   map[uuid.UUID]bool
}

func NewStore() *Store {
	return &Store{
		players: make(map[uuid.UUID]*Player),
		rooms:   make(map[uuid.UUID]bool),
	}
}

func (s *Store) RegisterPlayer(player *Player) {
	s.players[player.id] = player
}

func (s *Store) GetPlayerById(id uuid.UUID) (*Player, error) {
	player, ok := s.players[id]
	if !ok {
		return nil, errors.New("Player not found")
	}
	return player, nil
}

func (s *Store) UnregisterPlayer(id uuid.UUID) error {
	player, err := s.GetPlayerById(id)
	if err != nil {
		return err
	}
	delete(s.players, id)
	close(player.send)
	return nil
}

func (s *Store) SetPlayerName(id uuid.UUID, name string) error {
	player, err := s.GetPlayerById(id)
	if err != nil {
		return err
	}
	player.SetName(name)
	return nil
}

func (s *Store) CreateRoom(room any)   {}
func (s *Store) GetRoomById(id string) {}
func (s *Store) DeleteRoom(id string)  {}
func (s *Store) JoinRoom(id string)    {}
func (s *Store) LeaveRoom(id string)   {}
