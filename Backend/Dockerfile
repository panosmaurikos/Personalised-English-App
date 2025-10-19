FROM golang:1.24.5

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
COPY wait-for-it.sh .
RUN chmod +x wait-for-it.sh
RUN go build -o main .
EXPOSE 8080

CMD ["./wait-for-it.sh", "postgres:5432", "--", "./main"]