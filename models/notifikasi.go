package models

import "time"

// Notifikasi model
type Notifikasi struct {
	NotifikasiID    int       `gorm:"column:notifikasi_id;primaryKey;autoIncrement" json:"notifikasi_id"`
	UserID          int       `gorm:"column:user_id;not null" json:"user_id"`
	TipeUser        string    `gorm:"column:tipe_user;type:enum('Siswa','Guru');not null" json:"tipe_user"`
	JudulNotifikasi string    `gorm:"column:judul_notifikasi;size:255;not null" json:"judul_notifikasi"`
	PesanNotifikasi string    `gorm:"column:pesan_notifikasi;type:text;not null" json:"pesan_notifikasi"`
	LinkTerkait     string    `gorm:"column:link_terkait;size:255" json:"link_terkait"`
	StatusBaca      bool      `gorm:"column:status_baca;default:0" json:"status_baca"`
	CreatedAt       time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`
}

// TableName method untuk menentukan nama tabel yang benar
func (Notifikasi) TableName() string {
	return "notifikasi"
}
