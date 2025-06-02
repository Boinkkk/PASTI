package entities

import "time"

type PengumpulanTugas struct {
	PengumpulanID      int       `gorm:"column:pengumpulan_id;primaryKey;autoIncrement"`
	TugasID            int       `gorm:"column:tugas_id;not null"`
	SiswaID            int       `gorm:"column:siswa_id;not null"`
	FileJawabanSiswa   string    `gorm:"column:file_jawaban_siswa;size:255"`
	CatatanSiswa       string    `gorm:"column:catatan_siswa;type:text"`
	TanggalPengumpulan time.Time `gorm:"column:tanggal_pengumpulan"`
	Nilai              float64   `gorm:"column:nilai;type:decimal(5,2)"`
	CatatanGuru        string    `gorm:"column:catatan_guru;type:text"`
	StatusPengumpulan  string    `gorm:"column:status_pengumpulan;type:enum('Belum Mengerjakan','Mengerjakan','Terlambat','Dinilai');default:'Belum Mengerjakan'"`
	PoinDidapat        int       `gorm:"column:poin_didapat;default:0"`
	CreatedAt          time.Time `gorm:"column:created_at"`
	UpdatedAt          time.Time `gorm:"column:updated_at"`
}
