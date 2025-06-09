package helpers

import (
	"Pasti/models"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var mySigningKey = []byte("Boinkk")

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