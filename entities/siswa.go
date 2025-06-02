package entities

import "time"

type Siswa struct {
	SiswaID        int       `gorm:"column:siswa_id;primaryKey;autoIncrement"`
	NIS            string    `gorm:"column:nis;size:20;unique;not null"`
	NamaLengkap    string    `gorm:"column:nama_lengkap;size:100;not null"`
	KelasID        int       `gorm:"column:kelas_id;not null"`
	Email          string    `gorm:"column:email;size:100;unique"`
	PasswordHash   string    `gorm:"column:password_hash;size:255;not null"`
	PoinMotivasi   int       `gorm:"column:poin_motivasi;default:0"`
	TingkatDisiplin string   `gorm:"column:tingkat_disiplin;type:enum('Sangat Baik','Baik','Cukup','Kurang','Sangat Kurang');default:'Baik'"`
	FotoProfil     string    `gorm:"column:foto_profil;size:255"`
	CreatedAt      time.Time `gorm:"column:created_at"`
	UpdatedAt      time.Time `gorm:"column:updated_at"`
}
