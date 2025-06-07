package models

import "time"

// Guru model
type Guru struct {
	GuruID       int       `gorm:"column:guru_id;primaryKey;autoIncrement" json:"guru_id"`
	NIP          string    `gorm:"column:nip;size:20;unique;not null" json:"nip"`
	NamaLengkap  string    `gorm:"column:nama_lengkap;size:100;not null" json:"nama_lengkap"`
	Email        string    `gorm:"column:email;size:100;unique;not null" json:"email"`
	PasswordHash string    `gorm:"column:password_hash;size:255;not null" json:"-"`
	CreatedAt    time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	UpdatedAt    time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`
}

// TableName method untuk menentukan nama tabel yang benar
func (Guru) TableName() string {
	return "guru"
}
