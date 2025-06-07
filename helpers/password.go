package helpers

import "golang.org/x/crypto/bcrypt"

func HassPassword(password string) (string, error) {
	passwordHash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)

	return string(passwordHash), err

}