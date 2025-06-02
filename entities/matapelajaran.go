package entities

import "time"

type MataPelajaran struct {
	MapelID    int       `gorm:"column:mapel_id;primaryKey;autoIncrement"`
	KodeMapel  string    `gorm:"column:kode_mapel;size:10;unique;not null"`
	NamaMapel  string    `gorm:"column:nama_mapel;size:100;not null"`
	Deskripsi  string    `gorm:"column:deskripsi;type:text"`
	CreatedAt  time.Time `gorm:"column:created_at"`
	UpdatedAt  time.Time `gorm:"column:updated_at"`
}
