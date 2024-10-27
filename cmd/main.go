package main

import (
	"log"
	"os"

	"github.com/MrAbhishekShrestha/card-guesser-mp/cmd/api"
)

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}

func main() {
	// port := "localhost:3000"
	port := getEnv("PORT", ":10000")
	server := api.NewAPIServer(port)
	if err := server.Run(); err != nil {
		log.Fatalf("APIServer error: %v", err)
	}
}
