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

	// Check required SMTP environment variables
	if from == "" || pass == "" || smtpHost == "" || smtpPort == "" {
		return fmt.Errorf("smtp credentials not set")
	}

	addr := smtpHost + ":" + smtpPort

	// Build email message headers and body
	msg := "From: " + from + "\r\n" +
		"To: " + to + "\r\n" +
		"Subject: " + subject + "\r\n" +
		"MIME-Version: 1.0\r\n" +
		"Content-Type: text/plain; charset=\"utf-8\"\r\n" +
		"\r\n" + body

	// Connect (plain) and then upgrade to TLS with STARTTLS
	conn, err := net.Dial("tcp", addr)
	if err != nil {
		return fmt.Errorf("dial error: %w", err)
	}
	defer conn.Close()

	// Create SMTP client
	client, err := smtp.NewClient(conn, smtpHost)
	if err != nil {
		return fmt.Errorf("smtp client error: %w", err)
	}
	defer client.Quit()

	// Upgrade connection to TLS if supported
	tlsconfig := &tls.Config{
		ServerName: smtpHost,
	}
	if ok, _ := client.Extension("STARTTLS"); ok {
		if err = client.StartTLS(tlsconfig); err != nil {
			return fmt.Errorf("starttls error: %w", err)
		}
	}

	// Authenticate with SMTP server
	auth := smtp.PlainAuth("", from, pass, smtpHost)
	if err = client.Auth(auth); err != nil {
		return fmt.Errorf("smtp auth error: %w", err)
	}

	// Set sender and recipient
	if err = client.Mail(from); err != nil {
		return fmt.Errorf("mail from error: %w", err)
	}
	for _, recipient := range strings.Split(to, ",") {
		if err = client.Rcpt(strings.TrimSpace(recipient)); err != nil {
			return fmt.Errorf("rcpt to error: %w", err)
		}
	}

	// Send email data
	w, err := client.Data()
	if err != nil {
		return fmt.Errorf("data error: %w", err)
	}
	_, err = w.Write([]byte(msg))
	if err != nil {
		return fmt.Errorf("write error: %w", err)
	}
	err = w.Close()
	if err != nil {
		return fmt.Errorf("close error: %w", err)
	}

	return nil
}
