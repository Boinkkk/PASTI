// models/notifikasi.go
package models

import "time"

type NotifikasiTugas struct {
    ID               int       `gorm:"column:id;primaryKey;autoIncrement" json:"id"`
    TugasID          int       `gorm:"column:tugas_id;not null" json:"tugas_id"`
    SiswaID          int       `gorm:"column:siswa_id;not null" json:"siswa_id"`
    JenisNotifikasi  string    `gorm:"column:jenis_notifikasi;type:enum('3_hari','1_hari','2_jam','lewat_deadline');not null" json:"jenis_notifikasi"`
    TanggalKirim     time.Time `gorm:"column:tanggal_kirim;default:CURRENT_TIMESTAMP" json:"tanggal_kirim"`
    Status           string    `gorm:"column:status;type:enum('terkirim','gagal');default:'terkirim'" json:"status"`
    ResponseAPI      string    `gorm:"column:response_api;type:text" json:"response_api"`
    CreatedAt        time.Time `gorm:"column:created_at;default:CURRENT_TIMESTAMP" json:"created_at"`
    
    // Relations
    Tugas  Tugas  `gorm:"foreignKey:TugasID;references:TugasID" json:"tugas,omitempty"`
    Siswa  Siswa  `gorm:"foreignKey:SiswaID;references:SiswaID" json:"siswa,omitempty"`
}

func (NotifikasiTugas) TableName() string {
    return "notifikasi_tugas"
}