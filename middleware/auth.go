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