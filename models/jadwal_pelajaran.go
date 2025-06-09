package models

import "time"

// JadwalPelajaran model
type JadwalPelajaran struct {
    JadwalID   int       `gorm:"column:jadwal_id;primaryKey;autoIncrement" json:"jadwal_id"`
    KelasID    int       `gorm:"column:kelas_id;not null" json:"kelas_id"`
    MapelID    int       `gorm:"column:mapel_id;not null" json:"mapel_id"`
    GuruID     int       `gorm:"column:guru_id;not null" json:"guru_id"`
    Hari       string    `gorm:"column:hari;type:enum('Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu');not null" json:"hari"`
    JamMulai   string    `gorm:"column:jam_mulai;type:time;not null" json:"jam_mulai"`
    JamSelesai string    `gorm:"column:jam_selesai;type:time;not null" json:"jam_selesai"`
    Ruang      string    `gorm:"column:ruang;size:20" json:"ruang"`
    CreatedAt  time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`
    UpdatedAt  time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`

    // Relasi - JADWAL PELAJARAN belongs to GURU, KELAS, MATA PELAJARAN
    Kelas         Kelas         `gorm:"foreignKey:KelasID;references:KelasID" json:"kelas,omitempty"`
    MataPelajaran MataPelajaran `gorm:"foreignKey:MapelID;references:MapelID" json:"mata_pelajaran,omitempty"`
    Guru          Guru          `gorm:"foreignKey:GuruID;references:GuruID" json:"guru,omitempty"`

    // Relasi has many
    Tugas []Tugas `gorm:"-" json:"tugas,omitempty"`
}

// TableName method untuk menentukan nama tabel yang benar
func (JadwalPelajaran) TableName() string {
    return "jadwalpelajaran"
}