package api

import (
	"fmt"
	"net/http"
)

// AppError represents an error with a status code and a user-facing message.
type AppError struct {
	Cause   error  `json:"-"` // Internal error (logged but not sent)
	Message string `json:"message"`
	Code    int    `json:"code"`
}

func (e *AppError) Error() string {
	if e.Cause != nil {
		return fmt.Sprintf("%s: %v", e.Message, e.Cause)
	}
	return e.Message
}

func NewAPIError(code int, message string, err error) *AppError {
	return &AppError{
		Cause:   err,
		Message: message,
		Code:    code,
	}
}

// Common Errors
func ErrInternal(err error) *AppError {
	return NewAPIError(http.StatusInternalServerError, "Internal Server Error", err)
}

func ErrBadRequest(msg string) *AppError {
	return NewAPIError(http.StatusBadRequest, msg, nil)
}

func ErrUnauthorized(msg string) *AppError {
	return NewAPIError(http.StatusUnauthorized, msg, nil)
}

func ErrForbidden(msg string) *AppError {
	return NewAPIError(http.StatusForbidden, msg, nil)
}

func ErrNotFound(msg string) *AppError {
	return NewAPIError(http.StatusNotFound, msg, nil)
}
