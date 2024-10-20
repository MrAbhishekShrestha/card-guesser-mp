package api

import (
	"log"
	"net/http"
)

const pathPrefix = "/api/v1/"

type APIServer struct {
	addr string
}

func NewAPIServer(addr string) *APIServer {
	return &APIServer{addr: addr}
}

func (s *APIServer) Run() error {
	router := http.NewServeMux()
	log.Println("Listening on", s.addr)
	return http.ListenAndServe(s.addr, router)
}
