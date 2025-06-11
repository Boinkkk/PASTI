package models

import "time"

// LoginGuru model untuk request login guru
type LoginGuru struct {
    NIP      string `json:"nip" binding:"required"`
    Password string `json:"password" binding:"required"`
}

// RegisterGuru model untuk request registrasi guru
type RegisterGuru struct {
    NIP             string `json:"nip" binding:"required"`
    NamaLengkap     string `json:"nama_lengkap" binding:"required"`
    Email           string `json:"email" binding:"required,email"`
    Password        string `json:"password" binding:"required,min=6"`
    ConfirmPassword string `json:"confirm_password" binding:"required,eqfield=Password"`
}

// Guru model
type Guru struct {
    GuruID       int       `gorm:"column:guru_id;primaryKey;autoIncrement" json:"guru_id"`
    NIP          string    `gorm:"column:nip;size:20;unique;not null" json:"nip"`
    NamaLengkap  string    `gorm:"column:nama_lengkap;size:100;not null" json:"nama_lengkap"`
    Email        string    `gorm:"column:email;size:100;unique;not null" json:"email"`
    PasswordHash string    `gorm:"column:password_hash;size:255;not null" json:"-"`
    CreatedAt    time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`
    UpdatedAt    time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`    // Relasi has many - TANPA foreign key constraint di sini
    JadwalPelajaran []JadwalPelajaran `gorm:"-" json:"jadwal_pelajaran,omitempty"`
    KelasWaliKelas  []Kelas           `gorm:"-" json:"kelas_wali,omitempty"`
}

type JadwalGuru struct {
	JadwalID   int       `json:"jadwal_id"`	
	NamaMapel string    `json:"nama_mapel"`
	NamaKelas string    `json:"nama_kelas"`
	Hari       string    `json:"hari"`
	GuruID     int       `json:"guru_id"`
	WaktuMulai   string    `json:"waktu_mulai"`
	WaktuSelesai string    `json:"waktu_selesai"`
	Ruang      string    `json:"ruang"`

}

type ResponseAbsensiSiswa struct {
    IDPertemuan int       `json:"id_pertemuan"`
    PertemuanKe int       `json:"pertemuan_ke"`
    Materi string    `json:"materi"`
    Tanggal string    `json:"tanggal"`
    TokenAbsen string    `json:"token_absen"`
    IsActive bool      `json:"is_active"`
    TotalHadir int       `json:"total_hadir"`
    TotalSiswa int       `json:"total_siswa"`
}

// TableName method untuk menentukan nama tabel yang benar
func (Guru) TableName() string {
    return "guru"
}