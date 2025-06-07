package models

import "time"

// PengumpulanTugas model
type PengumpulanTugas struct {
	PengumpulanID      int       `gorm:"column:pengumpulan_id;primaryKey;autoIncrement" json:"pengumpulan_id"`
	TugasID            int       `gorm:"column:tugas_id;not null" json:"tugas_id"`
	SiswaID            int       `gorm:"column:siswa_id;not null" json:"siswa_id"`
	FileJawabanSiswa   string    `gorm:"column:file_jawaban_siswa;size:255" json:"file_jawaban_siswa"`
	CatatanSiswa       string    `gorm:"column:catatan_siswa;type:text" json:"catatan_siswa"`
	TanggalPengumpulan time.Time `gorm:"column:tanggal_pengumpulan;autoCreateTime" json:"tanggal_pengumpulan"`
	Nilai              *float64  `gorm:"column:nilai;type:decimal(5,2)" json:"nilai"`
	CatatanGuru        string    `gorm:"column:catatan_guru;type:text" json:"catatan_guru"`
	StatusPengumpulan  string    `gorm:"column:status_pengumpulan;type:enum('Belum Mengerjakan','Mengerjakan','Terlambat','Dinilai');default:'Belum Mengerjakan'" json:"status_pengumpulan"`
	PoinDidapat        int       `gorm:"column:poin_didapat;default:0" json:"poin_didapat"`
	CreatedAt          time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	UpdatedAt          time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`

	// Relasi
	Tugas Tugas `gorm:"foreignKey:TugasID;references:TugasID" json:"tugas,omitempty"`
	Siswa Siswa `gorm:"foreignKey:SiswaID;references:SiswaID" json:"siswa,omitempty"`
}

// TableName method untuk menentukan nama tabel yang benar
func (PengumpulanTugas) TableName() string {
	return "pengumpulantugas"
}
