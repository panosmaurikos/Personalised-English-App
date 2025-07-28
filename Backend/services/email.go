package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
)

type NylasEmailRequest struct {
	Subject string `json:"subject"`
	To      []struct {
		Email string `json:"email"`
		Name  string `json:"name,omitempty"`
	} `json:"to"`
	From struct {
		Email string `json:"email"`
		Name  string `json:"name,omitempty"`
	} `json:"from"`
	Body string `json:"body"`
}

func SendNoReplyEmail(to, subject, body string) error {
	apiKey := os.Getenv("NYLAS_API_KEY")
	grantID := os.Getenv("NYLAS_GRANT_ID")
	fromEmail := os.Getenv("NYLAS_FROM_EMAIL") // π.χ. noreply@yourdomain.com

	if apiKey == "" || grantID == "" || fromEmail == "" {
		return fmt.Errorf("Nylas API credentials not set")
	}

	url := fmt.Sprintf("https://api.us.nylas.com/v3/grants/%s/messages/send", grantID)

	reqBody := NylasEmailRequest{
		Subject: subject,
		Body:    body,
	}
	reqBody.To = []struct {
		Email string `json:"email"`
		Name  string `json:"name,omitempty"`
	}{{Email: to}}
	reqBody.From.Email = fromEmail

	jsonBody, err := json.Marshal(reqBody)
	if err != nil {
		return err
	}

	httpReq, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonBody))
	if err != nil {
		return err
	}
	httpReq.Header.Set("Authorization", "Bearer "+apiKey)
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Accept", "application/json")

	resp, err := http.DefaultClient.Do(httpReq)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		return fmt.Errorf("Nylas API error: %s", resp.Status)
	}
	return nil
}
