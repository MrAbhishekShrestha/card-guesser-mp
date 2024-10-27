package services

import (
	"errors"

	"github.com/google/uuid"
)

type Store struct {
	players map[uuid.UUID]*Player
	rooms   map[uuid.UUID]*Room
}

func NewStore() *Store {
	return &Store{
		players: make(map[uuid.UUID]*Player),
		rooms:   make(map[uuid.UUID]*Room),
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

func (s *Store) CreateRoom(room *Room) {
	s.rooms[room.id] = room
}

func (s *Store) GetRoomById(id uuid.UUID) (*Room, error) {
	room, ok := s.rooms[id]
	if !ok {
		return nil, errors.New("Room not found")
	}
	return room, nil
}

func (s *Store) DeleteRoom(id uuid.UUID) error {
	room, err := s.GetRoomById(id)
	if err != nil {
		return err
	}
	delete(s.rooms, room.id)
	return nil
}

func (s *Store) JoinRoom(id uuid.UUID, playerId uuid.UUID) error {
	room, err := s.GetRoomById(id)
	if err != nil {
		return err
	}
	room.players[playerId] = true
	return nil
}

func (s *Store) LeaveRoom(id uuid.UUID, playerId uuid.UUID) error {
	room, err := s.GetRoomById(id)
	if err != nil {
		return err
	}
	delete(s.rooms, room.id)
	return nil
}
