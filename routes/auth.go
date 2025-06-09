package routes

import (
	"Pasti/controllers"

	"github.com/gorilla/mux"
)

func AuthRoutes(r *mux.Router) {
	router := r.PathPrefix("/auth").Subrouter()
	router.HandleFunc("/register", controllers.Register).Methods("POST")
	router.HandleFunc("/register-guru", controllers.RegisterGuru).Methods("POST")
	router.HandleFunc("/login", controllers.Login).Methods("POST")
	router.HandleFunc("/login-guru", controllers.LoginGuru).Methods("POST")
}