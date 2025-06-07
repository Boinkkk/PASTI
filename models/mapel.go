package models

// Mapel model (tabel lama - legacy)
type Mapel struct {
	IDMapel   int    `gorm:"column:id_mapel;primaryKey;autoIncrement" json:"id_mapel"`
	NamaMapel string `gorm:"column:nama_mapel;size:100;not null" json:"nama_mapel"`
}

// TableName method untuk menentukan nama tabel yang benar
func (Mapel) TableName() string {
	return "mapel"
}
