package entities

import "time"

type Tugas struct {
	TugasID              int       `gorm:"column:tugas_id;primaryKey;autoIncrement"`
	JadwalID             int       `gorm:"column:jadwal_id;not null"`
	JudulTugas           string    `gorm:"column:judul_tugas;size:255;not null"`
	DeskripsiTugas       string    `gorm:"column:deskripsi_tugas;type:text"`
	FileTugasGuru        string    `gorm:"column:file_tugas_guru;size:255"`
	TanggalDibuat        time.Time `gorm:"column:tanggal_dibuat"`
	DeadlinePengumpulan  time.Time `gorm:"column:deadline_pengumpulan"`
	PoinMaksimal         int       `gorm:"column:poin_maksimal;default:100"`
	TipeTugas            string    `gorm:"column:tipe_tugas;type:enum('Individu','Kelompok');default:'Individu'"`
	CreatedAt            time.Time `gorm:"column:created_at"`
	UpdatedAt            time.Time `gorm:"column:updated_at"`
}
