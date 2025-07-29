package services

import (
	"crypto/tls"
	"fmt"
	"net"
	"net/smtp"
	"os"
	"strings"
)

func SendNoReplyEmail(to, subject, body string) error {
	from := os.Getenv("SMTP_FROM")
	pass := os.Getenv("SMTP_PASS")
	smtpHost := os.Getenv("SMTP_HOST")
	smtpPort := os.Getenv("SMTP_PORT")

	if from == "" || pass == "" || smtpHost == "" || smtpPort == "" {
		return fmt.Errorf("SMTP credentials not set")
	}

	addr := smtpHost + ":" + smtpPort

	// Setup message
	msg := "From: " + from + "\r\n" +
		"To: " + to + "\r\n" +
		"Subject: " + subject + "\r\n" +
		"MIME-Version: 1.0\r\n" +
		"Content-Type: text/plain; charset=\"utf-8\"\r\n" +
		"\r\n" + body

	// Connect (plain) and then upgrade to TLS with STARTTLS
	conn, err := net.Dial("tcp", addr)
	if err != nil {
		return fmt.Errorf("Dial error: %w", err)
	}
	defer conn.Close()

	client, err := smtp.NewClient(conn, smtpHost)
	if err != nil {
		return fmt.Errorf("SMTP client error: %w", err)
	}
	defer client.Quit()

	// STARTTLS
	tlsconfig := &tls.Config{
		ServerName: smtpHost,
	}
	if ok, _ := client.Extension("STARTTLS"); ok {
		if err = client.StartTLS(tlsconfig); err != nil {
			return fmt.Errorf("STARTTLS error: %w", err)
		}
	}

	// Auth
	auth := smtp.PlainAuth("", from, pass, smtpHost)
	if err = client.Auth(auth); err != nil {
		return fmt.Errorf("SMTP auth error: %w", err)
	}

	// Set sender and recipient
	if err = client.Mail(from); err != nil {
		return fmt.Errorf("MAIL FROM error: %w", err)
	}
	for _, addr := range strings.Split(to, ",") {
		if err = client.Rcpt(strings.TrimSpace(addr)); err != nil {
			return fmt.Errorf("RCPT TO error: %w", err)
		}
	}

	// Data
	w, err := client.Data()
	if err != nil {
		return fmt.Errorf("DATA error: %w", err)
	}
	_, err = w.Write([]byte(msg))
	if err != nil {
		return fmt.Errorf("Write error: %w", err)
	}
	err = w.Close()
	if err != nil {
		return fmt.Errorf("Close error: %w", err)
	}

	return nil
}
