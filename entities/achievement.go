package entities

import "time"

type Achievement struct {
	AchievementID        int       `gorm:"column:achievement_id;primaryKey;autoIncrement"`
	NamaAchievement      string    `gorm:"column:nama_achievement;size:100;not null"`
	Deskripsi            string    `gorm:"column:deskripsi;type:text"`
	Icon                 string    `gorm:"column:icon;size:255"`
	PoinBonus            int       `gorm:"column:poin_bonus;default:0"`
	KriteriaPencapaian   string    `gorm:"column:kriteria_pencapaian;type:text"`
	CreatedAt            time.Time `gorm:"column:created_at"`
}
