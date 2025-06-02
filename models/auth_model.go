package models

import (
	"d/Pasti/entities"

	"gorm.io/gorm"
)

// Fungsi untuk verifikasi password (gunakan bcrypt di controller)
func GetSiswaByEmail(db *gorm.DB, email string) (*entities.Siswa, error) {
	var siswa entities.Siswa
	err := db.Where("email = ?", email).First(&siswa).Error
	if err != nil {
		return nil, err
	}
	return &siswa, nil
}
