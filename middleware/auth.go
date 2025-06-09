package middleware

import (
	"Pasti/helpers"
	"context"
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

		if accessToken == "" {
			helpers.Response(w, 401, "unauthorized", nil)
			return
		}

		user, err := helpers.ValidateTokenUniversal(accessToken)

		if err != nil {
			helpers.Response(w, 401, err.Error(), nil)
			return
		}

		// Simpan informasi user dengan key yang sesuai
		if siswa, ok := user.(*helpers.MyCustomClaims); ok {
			ctx := context.WithValue(r.Context(), "siswainfo", siswa)
			next.ServeHTTP(w, r.WithContext(ctx))
		} else if guru, ok := user.(*helpers.GuruCustomClaims); ok {
			ctx := context.WithValue(r.Context(), "guruinfo", guru)
			next.ServeHTTP(w, r.WithContext(ctx))
		} else {
			helpers.Response(w, 401, "invalid token type", nil)
			return
		}
	})
}