package services

import (
	"encoding/json"
	"fmt"
)

const (
	CREATE_ROOM = "CREATE_ROOM"
	JOIN_ROOM   = "JOIN_ROOM"
	LEAVE_ROOM  = "LEAVE_ROOM"
	SET_NAME    = "SET_NAME"
	START_GAME  = "START_GAME"
	MOVE        = "MOVE"
	END_GAME    = "END_GAME"
)

func ActionHandler(player *Player, action string, payload json.RawMessage) error {
	switch action {
	case SET_NAME:
		var setNameParams SetNamePayload
		if err := json.Unmarshal(payload, &setNameParams); err != nil {
			return fmt.Errorf("error unmarshalling payload: %v", err)
		}
		setNameParams.PlayerId = player.id
		player.hub.SetName <- setNameParams
	case "CREATE_ROOM":
		var createRoomParams CreateRoomPayload
		if err := json.Unmarshal(payload, &createRoomParams); err != nil {
			return fmt.Errorf("error unmarshalling payload: %v", err)
		}
		createRoomParams.PlayerId = player.id
		player.hub.CreateRoom <- createRoomParams
	case "JOIN_ROOM":
		var joinRoomParams RoomPayload
		if err := json.Unmarshal(payload, &joinRoomParams); err != nil {
			return fmt.Errorf("error unmarshalling payload: %v", err)
		}
		joinRoomParams.PlayerId = player.id
		player.hub.JoinRoom <- joinRoomParams
	case "LEAVE_ROOM":
		var leaveRoomParams RoomPayload
		if err := json.Unmarshal(payload, &leaveRoomParams); err != nil {
			return fmt.Errorf("error unmarshalling payload: %v", err)
		}
		leaveRoomParams.PlayerId = player.id
		player.hub.LeaveRoom <- leaveRoomParams
	case "START_GAME":
		var startGamePayload RoomPayload
		if err := json.Unmarshal(payload, &startGamePayload); err != nil {
			return fmt.Errorf("error unmarshalling payload: %v", err)
		}
		startGamePayload.PlayerId = player.id
		player.hub.StartGame <- startGamePayload
	case "MOVE":
		var movePayload MakeMovePayload
		if err := json.Unmarshal(payload, &movePayload); err != nil {
			return fmt.Errorf("error unmarshalling payload: %v", err)
		}
		movePayload.PlayerId = player.id
		player.hub.MakeMove <- movePayload
	default:
		return fmt.Errorf("error invalid action '%s'", action)
	}
	return nil
}
