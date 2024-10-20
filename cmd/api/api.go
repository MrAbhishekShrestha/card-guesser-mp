package api

import (
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
	router.HandleFunc(pathPrefix+"ws", func(w http.ResponseWriter, r *http.Request) {
		serveWs(Hub, w, r)
	})

	log.Println("Listening on", s.addr)
	return http.ListenAndServe(s.addr, router)
}

func serveWs(hub *services.Hub, w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	hub.Register <- conn
}
