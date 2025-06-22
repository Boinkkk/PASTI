package helpers

import (
	"Pasti/models"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var mySigningKey = []byte("Boinkk")

// Custom claims untuk siswa
type MyCustomClaims struct {
	ID int `json:"id"`
	Name string `json:"name"`
	Email string `json:"email"`
	Nis string `json:"nis"`
	KelasID int `json:"kelas_id"`
	NoTelepon string `json:"no_telepon"`
	PoinMotivasi int `json:"poin_motivasi"`
	TingkatDisiplin string `json:"tingkat_disiplin"`
	Profile string `json:"profile"`
	Role string `json:"role"` // Tambahkan role

	jwt.RegisteredClaims
}

// Custom claims untuk guru
type GuruCustomClaims struct {
	ID int `json:"id"`
	Name string `json:"name"`
	Email string `json:"email"`
	NIP string `json:"nip"`
	Role string `json:"role"`

	jwt.RegisteredClaims
}

// Custom claims untuk admin
type AdminCustomClaims struct {
	Username string `json:"username"`
	Role     string `json:"role"`

	jwt.RegisteredClaims
}

func CreateToken(siswa *models.Siswa) (string, error) {
	claims := MyCustomClaims{
		siswa.SiswaID,
		siswa.NamaLengkap,
		siswa.Email,
		siswa.NIS,
		siswa.KelasID,
		siswa.NoTelepon,
		siswa.PoinMotivasi,
		siswa.TingkatDisiplin,
		siswa.FotoProfil,
		"siswa", // Role tetap sebagai siswa
		jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	ss, err := token.SignedString(mySigningKey)
	fmt.Println(ss, err)

	return ss,err
}

// CreateTokenGuru membuat token JWT untuk guru
func CreateTokenGuru(guru *models.Guru) (string, error) {
	claims := GuruCustomClaims{
		guru.GuruID,
		guru.NamaLengkap,
		guru.Email,
		guru.NIP,
		"guru", // Role sebagai guru
		jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	ss, err := token.SignedString(mySigningKey)
	fmt.Println(ss, err)

	return ss, err
}

// CreateTokenAdmin membuat token JWT untuk admin
func CreateTokenAdmin(admin *models.Admin) (string, error) {
	claims := AdminCustomClaims{
		admin.Username,
		"admin", // Role sebagai admin
		jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	ss, err := token.SignedString(mySigningKey)
	fmt.Println(ss, err)

	return ss, err
}

func ValidateToken(tokenString string)(any, error) {

	token, err := jwt.ParseWithClaims(tokenString, &MyCustomClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte("Boinkk"), nil
	})

	if err != nil {
		return nil, fmt.Errorf("unauthorized")
	}

	claims, ok := token.Claims.(*MyCustomClaims)

	if !ok || !token.Valid {
		return nil, fmt.Errorf("unauthorized")
	} 

	return claims, nil

}

// ValidateTokenGuru memvalidasi token JWT untuk guru
func ValidateTokenGuru(tokenString string) (any, error) {
	token, err := jwt.ParseWithClaims(tokenString, &GuruCustomClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte("Boinkk"), nil
	})

	if err != nil {
		return nil, fmt.Errorf("unauthorized")
	}

	claims, ok := token.Claims.(*GuruCustomClaims)

	if !ok || !token.Valid {
		return nil, fmt.Errorf("unauthorized")
	}

	return claims, nil
}

// ValidateTokenAdmin memvalidasi token JWT untuk admin
func ValidateTokenAdmin(tokenString string) (any, error) {
	token, err := jwt.ParseWithClaims(tokenString, &AdminCustomClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte("Boinkk"), nil
	})

	if err != nil {
		return nil, fmt.Errorf("unauthorized")
	}

	claims, ok := token.Claims.(*AdminCustomClaims)

	if !ok || !token.Valid {
		return nil, fmt.Errorf("unauthorized")
	}

	return claims, nil
}

// ValidateTokenUniversal memvalidasi token baik untuk siswa maupun guru
func ValidateTokenUniversal(tokenString string) (any, error) {
	// Coba parse sebagai siswa terlebih dahulu
	token, err := jwt.ParseWithClaims(tokenString, &MyCustomClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte("Boinkk"), nil
	})

	if err == nil {
		if claims, ok := token.Claims.(*MyCustomClaims); ok && token.Valid {
			return claims, nil
		}
	}

	// Jika gagal, coba parse sebagai guru
	token, err = jwt.ParseWithClaims(tokenString, &GuruCustomClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte("Boinkk"), nil
	})

	if err != nil {
		return nil, fmt.Errorf("unauthorized")
	}

	claims, ok := token.Claims.(*GuruCustomClaims)
	if !ok || !token.Valid {
		return nil, fmt.Errorf("unauthorized")
	}

	return claims, nil
}