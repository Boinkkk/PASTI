package models

import "time"

// Kelas model
type Kelas struct {
    KelasID     int       `gorm:"column:kelas_id;primaryKey;autoIncrement" json:"kelas_id"`
    NamaKelas   string    `gorm:"column:nama_kelas;size:50;not null" json:"nama_kelas"`
    WaliKelasID *int      `gorm:"column:wali_kelas_id" json:"wali_kelas_id"`
    IDJurusan   int       `gorm:"column:id_jurusan;not null" json:"id_jurusan"`
    CreatedAt   time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`
    UpdatedAt   time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`

    // Relasi - KELAS belongs to JURUSAN
    WaliKelas *Guru   `gorm:"foreignKey:WaliKelasID;references:GuruID" json:"wali_kelas,omitempty"`
    Jurusan   Jurusan `gorm:"foreignKey:IDJurusan;references:IDJurusan" json:"jurusan,omitempty"`
    
    // Relasi has many
    Siswa []Siswa `gorm:"foreignKey:KelasID" json:"siswa,omitempty"`
}

// TableName method untuk menentukan nama tabel yang benar
func (Kelas) TableName() string {
    return "kelas"
}