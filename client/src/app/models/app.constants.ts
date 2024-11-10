export class AppConstants {
  // public static readonly protocol = "wss";
  // public static readonly domain = "card-guesser-mp.onrender.com"
  // public static readonly path = "/api/v1/ws"
  public static readonly protocol = "ws";
  public static readonly domain = "localhost:3000"
  public static readonly path = "/api/v1/ws"
}

export enum GameActions {
  REGISTER = "REGISTER",
  SET_NAME = "SET_NAME",
  CREATE_ROOM = "CREATE_ROOM",
  JOIN_ROOM = "JOIN_ROOM",
  LEAVE_ROOM = "LEAVE_ROOM",
  START_GAME = "START_GAME",
  MOVE = "MOVE",
  END_GAME = "END_GAME"
}