package models

import "time"

// Absensi model
type Absensi struct {
	IDAbsensi   int       `gorm:"column:id_absensi;primaryKey;autoIncrement" json:"id_absensi"`
	IDPertemuan int       `gorm:"column:id_pertemuan;not null" json:"id_pertemuan"`
	IDSiswa     int       `gorm:"column:id_siswa;not null" json:"id_siswa"`
	WaktuAbsen  time.Time `gorm:"column:waktu_absen;not null" json:"waktu_absen"`
	Status      string    `gorm:"column:status;type:enum('Hadir','Izin','Sakit','Alpha');default:'Hadir'" json:"status"`
	Keterangan  string    `gorm:"column:keterangan;type:text" json:"keterangan"`

	// Relasi
	Pertemuan Pertemuan `gorm:"foreignKey:IDPertemuan;references:IDPertemuan" json:"pertemuan,omitempty"`
	Siswa     Siswa     `gorm:"foreignKey:IDSiswa;references:SiswaID" json:"siswa,omitempty"`
}

// TableName method untuk menentukan nama tabel yang benar
func (Absensi) TableName() string {
	return "absensi"
}
