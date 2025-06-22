package main

import (
	"Pasti/config"
	"Pasti/controllers"
	"Pasti/cron"
	"Pasti/middleware"
	"Pasti/routes"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
)

func main() {

	if err := godotenv.Load(); err != nil {
		log.Fatalf("Error loading .env file")
	}


	config.ConnectDB()

	cron.StartCronJobs()
	r := mux.NewRouter()
		// Upload endpoint - dengan authentication middleware  
	r.Handle("/api/upload/tugas", middleware.AuthUniversal(http.HandlerFunc(controllers.UploadFileHandler))).Methods("POST")
	
	// File serving - TANPA authentication untuk akses publik
	r.HandleFunc("/uploads/tugas/{filename}", controllers.ServeProtectedFile).Methods("GET")
	
	router := r.PathPrefix("/api").Subrouter()
		routes.AuthRoutes(router)
	routes.SiswaRoutes(router)
	routes.AbsensiRoute(router)
	routes.GuruRoutes(router)
	routes.AdminRoutes(router)

	
	log.Println("Server Running On port 8080")
	log.Fatal(http.ListenAndServe(":8080", enableCORS(r)))
}

// Middleware CORS
func enableCORS(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Izinkan dari frontend (React bisa di port 5173 atau 5174)
		origin := r.Header.Get("Origin")
		allowedOrigins := map[string]bool{
			"http://localhost:5173": true,
			"http://localhost:5174": true,
			"http://170.205.30.35/":    true,
			"http://yourdomain.com": true, // jika kamu pakai domain
		}

		if allowedOrigins[origin] {
			w.Header().Set("Access-Control-Allow-Origin", origin)
		} else {
			w.Header().Set("Access-Control-Allow-Origin", "*") // atau bisa ditolak
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