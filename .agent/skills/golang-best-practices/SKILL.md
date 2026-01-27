---
name: golang-best-practices
description: Expert guidelines for writing idiomatic, performant, and maintainable Go code. Use this skill for any task involving Go (Golang) development, refactoring, or code review.
---

# Golang Developer Expert Guidelines

This skill provides a comprehensive set of instructions and best practices for acting as an expert Golang developer. Follow these guidelines to ensure code quality, performance, and idiomatic correctness.

## 1. Core Philosophy & Style
- **Idiomatic Go**: Adhere strictly to "Effective Go". Code must be simple, readable, and explicit.
- **Formatting**: All code must be formatted with `gofmt`.
- **Naming**:
    - Use `CamelCase` for exported identifiers and `camelCase` for unexported ones.
    - Keep variable names short (e.g., `i`, `c`) where scope is small; use descriptive names for larger scopes.
    - Acronyms should be all caps (e.g., `ServeHTTP`, `ID`, not `ServeHttp`, `Id`).
- **Error Handling**:
    - **Never** ignore errors. Handle them explicitly (`if err != nil`).
    - Use `errors.Is` and `errors.As` for checking and wrapping errors.
    - Avoid `panic` in library code; return errors instead. Only use `panic` for unrecoverable startup errors.

## 2. Project Structure
- Follow the **Standard Go Project Layout** conventions where applicable:
    - `cmd/`: Application entry points (`main.go`).
    - `internal/`: Private application and library code.
    - `pkg/`: Library code safe for external use.
    - `api/`: OpenAPI/Swagger, Protocol Buffers, JSON User definitions.

## 3. Concurrency
- **Goroutines**: Use them for concurrent execution, but be mindful of lifecycle management.
    - **Always** use `context.Context` to manage cancellation and timeouts.
    - Avoid goroutine leaks by ensuring they have a way to exit.
- **Channels**: "Share memory by communicating, don't communicate by sharing memory."
    - Use channels for orchestration and signaling.
    - Use `sync.Mutex` or `sync.RWMutex` for simple state protection.
- **Race Detection**: Always verify concurrent code with `go test -race`.

## 4. Testing
- **Table-Driven Tests**: Use table-driven tests for all unit tests to cover multiple scenarios efficiently.
- **Naming**: Test files must end in `_test.go`. Test functions must start with `Test`.
- **Subtests**: Use `t.Run` to structure nested tests.
- **Mocks**: Define interfaces for dependencies to enable easy mocking.

## 5. Performance & Efficiency
- **Pointers**: Use pointers to share data or modify state, but avoid unnecessary pointer dereferencing for small structs (pass by value is often faster).
- **Defer**: Use `defer` for cleanup (closing files, unlocking mutexes) to ensure it runs even if an error occurs.
- **Preallocate**: Preallocate slices and maps if the size is known (`make([]T, 0, capacity)`).

## 6. Dependencies
- Use Go Modules (`go.mod`, `go.sum`).
- Keep dependencies minimal. Prefer the standard library (`stdlib`) whenever possible.

## 7. Documentation
- Write GoDoc comments for all exported types and functions.
- Comments should be complete sentences starting with the name of the declared element.

## 8. Architectures
- **Clean Architecture**: Separate business logic (Entities/Use Cases) from infrastructure (HTTP handlers, Database).
- **Dependency Injection**: Explicitly pass dependencies to constructors/functions rather than using global state.

## Example: Idiomatic Table-Driven Test
```go
func TestAdd(t *testing.T) {
    tests := []struct {
        name string
        a, b int
        want int
    }{
        {"positive", 2, 3, 5},
        {"negative", -1, -2, -3},
        {"zero", 0, 0, 0},
    }
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            if got := Add(tt.a, tt.b); got != tt.want {
                t.Errorf("Add() = %v, want %v", got, tt.want)
            }
        })
    }
}
```
