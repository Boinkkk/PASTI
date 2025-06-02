package entities

type Jurusan struct {
	IDJurusan   int    `gorm:"column:id_jurusan;primaryKey;autoIncrement"`
	NamaJurusan string `gorm:"column:nama_jurusan;size:50;not null"`
}
