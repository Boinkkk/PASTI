package models

import "time"

// Tugas model
type Tugas struct {
    TugasID              int       `gorm:"column:tugas_id;primaryKey;autoIncrement" json:"tugas_id"`
    JadwalID             int       `gorm:"column:jadwal_id;not null" json:"jadwal_id"`
    JudulTugas           string    `gorm:"column:judul_tugas;size:255;not null" json:"judul_tugas"`
    DeskripsiTugas       string    `gorm:"column:deskripsi_tugas;type:text" json:"deskripsi_tugas"`
    TanggalPenugasan     time.Time `gorm:"column:tanggal_penugasan;autoCreateTime" json:"tanggal_penugasan"`
    DeadlinePengumpulan  time.Time `gorm:"column:deadline_pengumpulan;not null" json:"deadline_pengumpulan"`
    FileSoal             string    `gorm:"column:file_soal;size:255" json:"file_soal"`
    PoinMaksimal         int       `gorm:"column:poin_maksimal;default:100" json:"poin_maksimal"`
    StatusTugas          string    `gorm:"column:status_tugas;type:enum('Draft','Aktif','Berakhir');default:'Draft'" json:"status_tugas"`
    CreatedAt            time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`
    UpdatedAt            time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`

    // Relasi belongs to - HANYA INI YANG BOLEH
    JadwalPelajaran JadwalPelajaran `gorm:"foreignKey:JadwalID;references:JadwalID" json:"jadwal_pelajaran,omitempty"`
    
    // HAPUS atau JANGAN PAKAI foreignKey di relasi has-many ini:
    // PengumpulanTugas []PengumpulanTugas `gorm:"foreignKey:TugasID" json:"pengumpulan_tugas,omitempty"`
    // Atau cukup:
    // PengumpulanTugas []PengumpulanTugas `json:"pengumpulan_tugas,omitempty"`
}

// TableName method untuk menentukan nama tabel yang benar
func (Tugas) TableName() string {
    return "tugas"
}