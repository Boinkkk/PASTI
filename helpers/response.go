package helpers

import (
	"encoding/json"
	"net/http"
)

type ResponseWithData struct {
	Status  string `json:"status"`
	Message string `json:"message"`
	Data    any    `json:"data"`
}

type ResponseWithoutData struct {
	Status  string `json:"status"`
	Message string `json:"message"`
}

func Response(w http.ResponseWriter, code int, message string, paylaod interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)

	var response any

	status := "succes"

	if code >= 400 {
		status = "failed"
	}

	if paylaod != nil {
		response = &ResponseWithData{
			Status: status,
			Message: message,
			Data: paylaod,
		}
	} else {
		response = &ResponseWithoutData{
			Status: status,
			Message: message,
		}
	}

	res, _ := json.Marshal(response)

	w.Write(res)
}