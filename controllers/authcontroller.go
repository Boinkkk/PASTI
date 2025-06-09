package controllers

import (
	"Pasti/config"
	"Pasti/helpers"
	"Pasti/models"
	"encoding/json"
	"net/http"
)

func Register(w http.ResponseWriter, r *http.Request) {
	var register models.Register

	if err := json.NewDecoder(r.Body).Decode(&register); err != nil {
		helpers.Response(w, 500, err.Error(), nil)
		return
	}

	defer r.Body.Close()

	if register.Password != register.ConfirmPassword {
		helpers.Response(w, 400, "Passowrd Not Match", nil)
		return
	}

	passwordHash, err := helpers.HassPassword(register.Password)

	if err != nil {
		helpers.Response(w, 500, err.Error(), nil)
		return
	}

	siswa := models.Siswa{
		NIS:          register.NIS,
		NamaLengkap: register.NamaLengkap,
		Email:        register.Email,
		KelasID:     register.KelasID,
		NoTelepon:   register.NoTelepon,
		PasswordHash: passwordHash,

	}

	if err := config.DB.Create(&siswa).Error; err != nil {
		helpers.Response(w, 500, err.Error(), nil)
		return
	}

	helpers.Response(w, 201, "Register Succesfully", nil)
}

func Login(w http.ResponseWriter, r *http.Request) {
	var login models.Login

	if err := json.NewDecoder(r.Body).Decode(&login); err != nil {
		helpers.Response(w, 500, err.Error(), nil)
		return
	}

	var siswa models.Siswa
	if err := config.DB.First(&siswa, "email = ?", login.Email).Error; err != nil {
		helpers.Response(w, 404, "Wrong Email Or Password", nil)
		return
	}

	if err := helpers.VerifyPassword(siswa.PasswordHash, login.Password); err != nil {
		helpers.Response(w, 404, "Wrong Password or Email", nil)
		return
	}

	token, err := helpers.CreateToken(&siswa)

	if err != nil {
		helpers.Response(w, 500, err.Error(), nil)
		return
	}

	helpers.Response(w, 200, "Succesfully Login", token)

}

func LoginGuru(w http.ResponseWriter, r *http.Request) {
	var loginGuru models.LoginGuru

	if err := json.NewDecoder(r.Body).Decode(&loginGuru); err != nil {
		helpers.Response(w, 500, err.Error(), nil)
		return
	}

	var guru models.Guru
	if err := config.DB.First(&guru, "nip = ?", loginGuru.NIP).Error; err != nil {
		helpers.Response(w, 404, "Wrong NIP Or Password", nil)
		return
	}

	if err := helpers.VerifyPassword(guru.PasswordHash, loginGuru.Password); err != nil {
		helpers.Response(w, 404, "Wrong Password or NIP", nil)
		return
	}

	token, err := helpers.CreateTokenGuru(&guru)

	if err != nil {
		helpers.Response(w, 500, err.Error(), nil)
		return
	}

	// Response data guru tanpa password
	responseData := map[string]interface{}{
		"token": token,
		"user": map[string]interface{}{
			"guru_id":      guru.GuruID,
			"nip":          guru.NIP,
			"nama_lengkap": guru.NamaLengkap,
			"email":        guru.Email,
			"role":         "guru",
		},
	}

	helpers.Response(w, 200, "Successfully Login", responseData)
}

func RegisterGuru(w http.ResponseWriter, r *http.Request) {
	var register models.RegisterGuru

	if err := json.NewDecoder(r.Body).Decode(&register); err != nil {
		helpers.Response(w, 500, err.Error(), nil)
		return
	}

	defer r.Body.Close()

	if register.Password != register.ConfirmPassword {
		helpers.Response(w, 400, "Password Not Match", nil)
		return
	}

	passwordHash, err := helpers.HassPassword(register.Password)

	if err != nil {
		helpers.Response(w, 500, err.Error(), nil)
		return
	}

	guru := models.Guru{
		NIP:          register.NIP,
		NamaLengkap:  register.NamaLengkap,
		Email:        register.Email,
		PasswordHash: passwordHash,
	}

	if err := config.DB.Create(&guru).Error; err != nil {
		helpers.Response(w, 500, err.Error(), nil)
		return
	}

	helpers.Response(w, 201, "Guru Successfully Registered", nil)
}