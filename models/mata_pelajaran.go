package models

import "time"

// MataPelajaran model
type MataPelajaran struct {
	MapelID   int       `gorm:"column:mapel_id;primaryKey;autoIncrement" json:"mapel_id"`
	KodeMapel string    `gorm:"column:kode_mapel;size:10;not null" json:"kode_mapel"`
	NamaMapel string    `gorm:"column:nama_mapel;size:100;not null" json:"nama_mapel"`
	Deskripsi string    `gorm:"column:deskripsi;type:text" json:"deskripsi"`
	CreatedAt time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`
}

// TableName method untuk menentukan nama tabel yang benar
func (MataPelajaran) TableName() string {
	return "matapelajaran"
}
