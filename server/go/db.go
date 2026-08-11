package main

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

var pool *pgxpool.Pool

func ConnectDatabase(ctx context.Context, databaseURL string) error {
	var err error
	pool, err = pgxpool.New(ctx, databaseURL)
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	return nil
}
