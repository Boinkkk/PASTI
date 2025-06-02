package entities

import "time"

type Kelas struct {
	KelasID      int       `gorm:"column:kelas_id;primaryKey;autoIncrement"`
	NamaKelas    string    `gorm:"column:nama_kelas;size:50;not null"`
	WaliKelasID  *int      `gorm:"column:wali_kelas_id"`
	CreatedAt    time.Time `gorm:"column:created_at"`
	UpdatedAt    time.Time `gorm:"column:updated_at"`
	IDJurusan    int       `gorm:"column:id_jurusan;not null"`
}
