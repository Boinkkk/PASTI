package controllers

import (
	"d/Pasti/models"
)

func GenerateUserToken(userID int, email string) (string, error) {
	return models.GenerateJWT(userID, email, "siswa")
}
