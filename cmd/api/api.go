package api

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/MrAbhishekShrestha/card-guesser-mp/services"
	"github.com/gorilla/websocket"
)

const pathPrefix = "/api/v1/"

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(r *http.Request) bool { return true },
}

type APIServer struct {
	addr string
}

func NewAPIServer(addr string) *APIServer {
	return &APIServer{addr: addr}
}

func (s *APIServer) Run() error {
	hubStore := services.NewStore()
	Hub := services.NewHub(hubStore)
	go Hub.Run()

	router := http.NewServeMux()
	router.HandleFunc(pathPrefix+"hello", serveHelloWorld)
	router.HandleFunc(pathPrefix+"ws", func(w http.ResponseWriter, r *http.Request) {
		serveWs(Hub, w, r)
	})

	log.Println("Listening on", s.addr)
	return http.ListenAndServe(s.addr, router)
}

func serveHelloWorld(w http.ResponseWriter, r *http.Request) {
	w.Header().Add("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	response := struct {
		Data string `json:"data"`
	}{
		Data: "Hello World",
	}
	json.NewEncoder(w).Encode(response)
}

func serveWs(hub *services.Hub, w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	hub.Register <- conn
}
