package main

import (
	"Pasti/config"
	"Pasti/controllers"
	"Pasti/routes"
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

func main() {
	config.ConnectDB()

	r := mux.NewRouter()
	
	// Route untuk upload file
	r.HandleFunc("/api/upload/tugas", controllers.UploadFileHandler).Methods("POST")
	
	// Serve static files (uploaded files)
	r.PathPrefix("/uploads/").Handler(http.StripPrefix("/uploads/", http.FileServer(http.Dir("uploads/"))))
	
	router := r.PathPrefix("/api").Subrouter()
	// Tambahkan routes
	routes.AuthRoutes(router)
	routes.SiswaRoutes(router)
	routes.AbsensiRoute(router)
	routes.GuruRoutes(router)

	// Bungkus dengan CORS middleware
	log.Println("Server Running On port 8080")
	log.Fatal(http.ListenAndServe(":8080", enableCORS(r)))
}

// Middleware CORS
func enableCORS(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Izinkan dari frontend (React bisa di port 5173 atau 5174)
		origin := r.Header.Get("Origin")
		if origin == "http://localhost:5173" || origin == "http://localhost:5174" {
			w.Header().Set("Access-Control-Allow-Origin", origin)
		} else {
			w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
		}
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		// Untuk request preflight (OPTIONS)
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		h.ServeHTTP(w, r)
	})
}