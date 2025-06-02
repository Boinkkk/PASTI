package entities

import "time"

type JadwalPelajaran struct {
	JadwalID    int       `gorm:"column:jadwal_id;primaryKey;autoIncrement"`
	KelasID     int       `gorm:"column:kelas_id;not null"`
	MapelID     int       `gorm:"column:mapel_id;not null"`
	GuruID      int       `gorm:"column:guru_id;not null"`
	Hari        string    `gorm:"column:hari;type:enum('Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu');not null"`
	JamMulai    string    `gorm:"column:jam_mulai;type:time;not null"`
	JamSelesai  string    `gorm:"column:jam_selesai;type:time;not null"`
	Ruang       string    `gorm:"column:ruang;size:20"`
	CreatedAt   time.Time `gorm:"column:created_at"`
	UpdatedAt   time.Time `gorm:"column:updated_at"`
}
