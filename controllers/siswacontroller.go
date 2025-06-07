package controllers

import (
	"Pasti/helpers"
	"Pasti/models"
	"net/http"
)

func Me(w http.ResponseWriter, r *http.Request) {
	siswa := r.Context().Value("siswainfo").(*helpers.MyCustomClaims)

	siswaResponse := &models.SiswaProfile{
		SiswaID: siswa.ID,
		NamaLengkap: siswa.Name,
		Email: siswa.Email,
		NIS: siswa.Nis,
		KelasID: siswa.KelasID,
		NoTelepon: siswa.NoTelepon,
		PoinMotivasi: siswa.PoinMotivasi,
		TingkatDisiplin: siswa.TingkatDisiplin,
		FotoProfil: siswa.Profile,
	}



	helpers.Response(w, 200, "Siswa profile", siswaResponse)



}