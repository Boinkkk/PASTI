package entities

import "time"

type Notifikasi struct {
	NotifikasiID     int       `gorm:"column:notifikasi_id;primaryKey;autoIncrement"`
	UserID           int       `gorm:"column:user_id;not null"`
	TipeUser         string    `gorm:"column:tipe_user;type:enum('Siswa','Guru');not null"`
	JudulNotifikasi  string    `gorm:"column:judul_notifikasi;size:255;not null"`
	PesanNotifikasi  string    `gorm:"column:pesan_notifikasi;type:text;not null"`
	LinkTerkait      string    `gorm:"column:link_terkait;size:255"`
	StatusBaca       bool      `gorm:"column:status_baca;type:tinyint(1);default:0"`
	CreatedAt        time.Time `gorm:"column:created_at"`
}
