package models

import "time"

// SiswaAchievement model
type SiswaAchievement struct {
	SiswaAchievementID int       `gorm:"column:siswa_achievement_id;primaryKey;autoIncrement" json:"siswa_achievement_id"`
	SiswaID            int       `gorm:"column:siswa_id;not null" json:"siswa_id"`
	AchievementID      int       `gorm:"column:achievement_id;not null" json:"achievement_id"`
	TanggalDiraih      time.Time `gorm:"column:tanggal_diraih;autoCreateTime" json:"tanggal_diraih"`
	CreatedAt          time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`

	// Relasi
	Siswa       Siswa       `gorm:"foreignKey:SiswaID;references:SiswaID" json:"siswa,omitempty"`
	Achievement Achievement `gorm:"foreignKey:AchievementID;references:AchievementID" json:"achievement,omitempty"`
}

// TableName method untuk menentukan nama tabel yang benar
func (SiswaAchievement) TableName() string {
	return "siswaachievement"
}
