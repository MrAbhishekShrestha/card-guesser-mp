package main

import (
	"log"

	"github.com/MrAbhishekShrestha/card-guesser-mp/cmd/api"
)

func main() {
	server := api.NewAPIServer("localhost:3000")
	if err := server.Run(); err != nil {
		log.Fatalf("APIServer error: %v", err)
	}
}
