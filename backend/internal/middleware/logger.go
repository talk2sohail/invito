package middleware

import (
	"io"
	"log/slog"
	"net/http"
	"os"
	"time"

	"github.com/go-chi/chi/v5/middleware"
)

// NewLogger returns a middleware that logs request details.
// It writes logs to stdout and, if provided, to the specified file.
func NewLogger(logFilePath string) func(next http.Handler) http.Handler {
	var w io.Writer = os.Stdout

	if logFilePath != "" {
		f, err := os.OpenFile(logFilePath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
		if err != nil {
			// If we can't open the log file, just warn and fall back to stdout
			slog.Error("failed to open log file", "path", logFilePath, "error", err)
		} else {
			w = io.MultiWriter(os.Stdout, f)
		}
	}

	logger := slog.New(slog.NewJSONHandler(w, nil))

	// Set this logger as the global default so other packages (like api) use it
	slog.SetDefault(logger)

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ww := middleware.NewWrapResponseWriter(w, r.ProtoMajor)

			t1 := time.Now()
			defer func() {
				// Log request completion
				logger.Info("request completed",
					"request_id", middleware.GetReqID(r.Context()),
					"method", r.Method,
					"path", r.URL.Path,
					"status", ww.Status(),
					"bytes_written", ww.BytesWritten(),
					"duration", time.Since(t1),
				)
			}()

			next.ServeHTTP(ww, r)
		})
	}
}
