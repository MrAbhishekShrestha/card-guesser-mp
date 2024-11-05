export class AppConstants {
  public static readonly protocol = "wss";
  public static readonly domain = "card-guesser-mp.onrender.com"
  public static readonly path = "/api/v1/ws"
  // public static readonly protocol = "ws";
  // public static readonly domain = "localhost:3000"
  // public static readonly path = "/api/v1/ws"
}

export enum Actions {
  REGISTER = "REGISTER",
  SET_NAME = "SET_NAME",
  CREATE_GAME = "CREATE_GAME"
}