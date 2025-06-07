package models

import "time"

// Siswa model
type Siswa struct {
	SiswaID         int       `gorm:"column:siswa_id;primaryKey;autoIncrement" json:"siswa_id"`
	NIS             string    `gorm:"column:nis;size:20;unique;not null" json:"nis"`
	NamaLengkap     string    `gorm:"column:nama_lengkap;size:100;not null" json:"nama_lengkap"`
	KelasID         int       `gorm:"column:kelas_id;not null" json:"kelas_id"`
	Email           string    `gorm:"column:email;size:100;unique" json:"email"`
	PasswordHash    string    `gorm:"column:password_hash;size:255;not null" json:"-"`
	PoinMotivasi    int       `gorm:"column:poin_motivasi;default:0" json:"poin_motivasi"`
	TingkatDisiplin string    `gorm:"column:tingkat_disiplin;type:enum('Sangat Baik','Baik','Cukup','Kurang','Sangat Kurang');default:'Baik'" json:"tingkat_disiplin"`
	FotoProfil      string    `gorm:"column:foto_profil;size:255" json:"foto_profil"`
	CreatedAt       time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	UpdatedAt       time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`

	// Relasi
	Kelas Kelas `gorm:"foreignKey:KelasID;references:KelasID" json:"kelas,omitempty"`
}

type Register struct {
	NIS             string `json:"nis" binding:"required"`
	NamaLengkap     string `json:"nama_lengkap" binding:"required"`
	KelasID         int    `json:"kelas_id" binding:"required"`
	Email           string `json:"email" binding:"required,email"`
	NoTelepon       string `json:"no_telepon"`
	Password        string `json:"password" binding:"required,min=6"`
	ConfirmPassword string `json:"confirm_password" binding:"required,eqfield=Password"`
}

// TableName method untuk menentukan nama tabel yang benar
func (Siswa) TableName() string {
	return "siswa"
}
