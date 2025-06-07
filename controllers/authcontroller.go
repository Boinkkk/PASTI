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

	siswa := models.Siswa {
		NIS: register.NIS,
		NamaLengkap: register.NamaLengkap,
		Email: register.Email,
		KelasID: register.KelasID,
		NoTelepon: register.NoTelepon,
		PasswordHash: passwordHash,

	}

	if err := config.DB.Create(&siswa).Error; err != nil {
		helpers.Response(w, 500, err.Error(),nil)
		return
	}

	helpers.Response(w, 201, "Register Succesfully", nil)




}