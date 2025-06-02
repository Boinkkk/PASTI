package entities

type Pertemuan struct {
	IDPertemuan int    `gorm:"column:id_pertemuan;primaryKey;autoIncrement"`
	IDJadwal    int    `gorm:"column:id_jadwal;not null"`
	PertemuanKe int    `gorm:"column:pertemuan_ke;not null"`
	TokenAbsen  string `gorm:"column:token_absen;size:30;unique;not null"`
	Tanggal     string `gorm:"column:tanggal;type:date;not null"`
	Materi      string `gorm:"column:materi;size:3000"`
}
