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
	host := "localhost:"
	// host := "0.0.0.0:"
	port := getEnv("PORT", "3000")
	server := api.NewAPIServer(host + port)
	if err := server.Run(); err != nil {
		log.Fatalf("APIServer error: %v", err)
	}
}
