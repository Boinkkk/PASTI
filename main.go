package main

import (
	"Pasti/config"
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

func main() {
	config.ConnectDB()

	r := mux.NewRouter()
	router := r.PathPrefix("/api").Subrouter()

	log.Println("Server Running On port 8080")
	http.ListenAndServe(":8080", router)
}