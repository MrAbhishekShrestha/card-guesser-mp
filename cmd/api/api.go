package api

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"

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

	wd, _ := os.Getwd()
	angularDist := filepath.Join(wd, "client", "dist", "card-guesser", "browser")
	if _, err := os.Stat(angularDist); os.IsNotExist(err) {
		return fmt.Errorf("could not find the dist folder: %v", err)
	}
	indexPath := filepath.Join(angularDist, "index.html")
	if _, err := os.Stat(indexPath); os.IsNotExist(err) {
		return fmt.Errorf("could not find index.html: %v", err)
	}
	router.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		serveClient(angularDist, indexPath, w, r)
	})

	log.Println("Listening on", s.addr)
	return http.ListenAndServe(s.addr, router)
}

func serveHelloWorld(w http.ResponseWriter, r *http.Request) {
	log.Println("serving Hello World")
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

func serveClient(angularDist string, indexPath string, w http.ResponseWriter, r *http.Request) {
	log.Println("serving static client")
	fs := http.FileServer(http.Dir(angularDist))
	path := filepath.Join(angularDist, r.URL.Path)
	_, err := os.Stat(path)

	if os.IsNotExist(err) {
		log.Printf("Path %s not found. serving index.html\n", r.URL.Path)
		http.ServeFile(w, r, indexPath)
		return
	} else if err != nil {
		log.Printf("Error checking path %s: %v\n", path, err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	fs.ServeHTTP(w, r)
}
