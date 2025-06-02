package controllers

import (
	"d/Pasti/entities"
	"d/Pasti/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type LoginResponse struct {
	Message string         `json:"message"`
	Token   string         `json:"token"`
	User    entities.Siswa `json:"user"`
}

func LoginHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req LoginRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Format request tidak valid", "message": err.Error()})
			return
		}

		siswa, err := models.GetSiswaByEmail(db, req.Email)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Login gagal", "message": "Email tidak ditemukan"})
			return
		}

		if err := bcrypt.CompareHashAndPassword([]byte(siswa.PasswordHash), []byte(req.Password)); err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Login gagal", "message": "Password salah"})
			return
		}

		// Generate JWT token
		token, err := GenerateUserToken(siswa.SiswaID, siswa.Email)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Token gagal dibuat", "message": err.Error()})
			return
		}

		c.JSON(http.StatusOK, LoginResponse{
			Message: "Login berhasil",
			Token:   token,
			User:    *siswa,
		})
	}
}
