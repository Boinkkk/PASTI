package entities

type Mapel struct {
	IDMapel   int    `gorm:"column:id_mapel;primaryKey;autoIncrement"`
	NamaMapel string `gorm:"column:nama_mapel;size:100;not null"`
}
