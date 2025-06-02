package entities

import "time"

type Absensi struct {
	IDAbsensi    int       `gorm:"column:id_absensi;primaryKey;autoIncrement"`
	IDPertemuan  int       `gorm:"column:id_pertemuan;not null"`
	IDSiswa      int       `gorm:"column:id_siswa;not null"`
	WaktuAbsen   time.Time `gorm:"column:waktu_absen;not null"`
	Status       string    `gorm:"column:status;type:enum('Hadir','Izin','Sakit','Alpha');default:'Hadir'"`
	Keterangan   string    `gorm:"column:keterangan;type:text"`
}
