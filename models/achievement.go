package models

import "time"

// Achievement model
type Achievement struct {
	AchievementID      int       `gorm:"column:achievement_id;primaryKey;autoIncrement" json:"achievement_id"`
	NamaAchievement    string    `gorm:"column:nama_achievement;size:100;not null" json:"nama_achievement"`
	Deskripsi          string    `gorm:"column:deskripsi;type:text" json:"deskripsi"`
	Icon               string    `gorm:"column:icon;size:255" json:"icon"`
	PoinBonus          int       `gorm:"column:poin_bonus;default:0" json:"poin_bonus"`
	KriteriaPencapaian string    `gorm:"column:kriteria_pencapaian;type:text" json:"kriteria_pencapaian"`
	CreatedAt          time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`
}

// TableName method untuk menentukan nama tabel yang benar
func (Achievement) TableName() string {
	return "achievement"
}
