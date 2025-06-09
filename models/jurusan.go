package models

// Jurusan model
type Jurusan struct {
	IDJurusan   int    `gorm:"column:id_jurusan;primaryKey;autoIncrement" json:"id_jurusan"`
	NamaJurusan string `gorm:"column:nama_jurusan;size:50;not null" json:"nama_jurusan"`

	Kelas []Kelas `gorm:"-" json:"kelas,omitempty"`

}

// TableName method untuk menentukan nama tabel yang benar
func (Jurusan) TableName() string {
	return "jurusan"
}
