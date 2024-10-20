build: 
	@go build -o bin/card-guesser.exe cmd/main.go

run: build
	@./bin/card-guesser.exe