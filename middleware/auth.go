package middleware

import (
	"Pasti/helpers"
	"context"
	"log"
	"net/http"
)

func Auth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		accesToken := r.Header.Get("Authorization")

		if accesToken == "" {
			helpers.Response(w, 401, "unauthorized", nil)
			return
		}

		siswa, err := helpers.ValidateToken(accesToken)

		if err != nil {
			helpers.Response(w, 401, err.Error(), nil)
			return
		}

		ctx := context.WithValue(r.Context(), "siswainfo", siswa) 
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// AuthGuru middleware untuk autentikasi guru
func AuthGuru(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		accessToken := r.Header.Get("Authorization")

		if accessToken == "" {
			helpers.Response(w, 401, "unauthorized", nil)
			return
		}

		guru, err := helpers.ValidateTokenGuru(accessToken)

		if err != nil {
			helpers.Response(w, 401, err.Error(), nil)
			return
		}

		ctx := context.WithValue(r.Context(), "guruinfo", guru)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// AuthUniversal middleware untuk autentikasi siswa atau guru
func AuthUniversal(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		accessToken := r.Header.Get("Authorization")

		log.Printf("🔍 AuthUniversal middleware:")
		log.Printf("   - URL: %s", r.URL.Path)
		log.Printf("   - Token present: %t", accessToken != "")

		if accessToken == "" {
			log.Printf("❌ No authorization token")
			helpers.Response(w, 401, "unauthorized", nil)
			return
		}

		user, err := helpers.ValidateTokenUniversal(accessToken)

		if err != nil {
			log.Printf("❌ Token validation failed: %v", err)
			helpers.Response(w, 401, err.Error(), nil)
			return
		}

		// Simpan informasi user dengan key yang sesuai
		if siswa, ok := user.(*helpers.MyCustomClaims); ok {
			log.Printf("✅ Authenticated as SISWA: %d", siswa.ID)
			ctx := context.WithValue(r.Context(), "siswainfo", siswa)
			next.ServeHTTP(w, r.WithContext(ctx))
		} else if guru, ok := user.(*helpers.GuruCustomClaims); ok {
			log.Printf("✅ Authenticated as GURU: %d", guru.ID)
			ctx := context.WithValue(r.Context(), "guruinfo", guru)
			next.ServeHTTP(w, r.WithContext(ctx))
		} else {
			log.Printf("❌ Invalid token type")
			helpers.Response(w, 401, "invalid token type", nil)
			return
		}
	})
}

// AuthAdmin middleware untuk autentikasi admin
func AuthAdmin(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		accessToken := r.Header.Get("Authorization")

		log.Printf("🔍 AuthAdmin middleware:")
		log.Printf("   - URL: %s", r.URL.Path)
		log.Printf("   - Token present: %t", accessToken != "")

		if accessToken == "" {
			log.Printf("❌ No authorization token")
			helpers.Response(w, 401, "unauthorized", nil)
			return
		}
		adminClaims, err := helpers.ValidateTokenAdmin(accessToken)

		if err != nil {
			log.Printf("❌ Admin token validation failed: %v", err)
			helpers.Response(w, 401, err.Error(), nil)
			return
		}

		admin, ok := adminClaims.(*helpers.AdminCustomClaims)
		if !ok {
			log.Printf("❌ Invalid admin token type")
			helpers.Response(w, 401, "invalid admin token", nil)
			return
		}

		log.Printf("✅ Authenticated as ADMIN: %s", admin.Username)
		
		// Set headers for the controller to use
		r.Header.Set("X-Username", admin.Username)
		r.Header.Set("X-Role", "admin")
		
		ctx := context.WithValue(r.Context(), "admininfo", admin)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}