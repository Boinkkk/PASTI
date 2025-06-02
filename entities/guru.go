package entities

import "time"

type Guru struct {
	GuruID       int       `gorm:"column:guru_id;primaryKey;autoIncrement"`
	NIP          string    `gorm:"column:nip;size:20;unique;not null"`
	NamaLengkap  string    `gorm:"column:nama_lengkap;size:100;not null"`
	Email        string    `gorm:"column:email;size:100;unique;not null"`
	PasswordHash string    `gorm:"column:password_hash;size:255;not null"`
	CreatedAt    time.Time `gorm:"column:created_at"`
	UpdatedAt    time.Time `gorm:"column:updated_at"`
}
