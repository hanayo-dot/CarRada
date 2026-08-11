package main

import (
    "context"
    "fmt"
    "log"
    "time"
)

// startReminderScheduler launches a background goroutine that checks for due
// maintenance reminders and logs them. This is a lightweight prototype of
// reminder delivery; integrate with a push/email provider for production.
func startReminderScheduler(cfg Config) {
    go func() {
        ticker := time.NewTicker(15 * time.Minute)
        defer ticker.Stop()

        // Run once at startup
        checkAndDeliverReminders()

        for range ticker.C {
            checkAndDeliverReminders()
        }
    }()
}

func checkAndDeliverReminders() {
    ctx := context.Background()
    rows, err := pool.Query(ctx, `SELECT id, user_id, description FROM maintenance_reminders WHERE notification_enabled = true AND notification_at IS NOT NULL AND notification_at <= current_date`)
    if err != nil {
        log.Printf("reminder scheduler: query failed: %v", err)
        return
    }
    defer rows.Close()

    for rows.Next() {
        var id int
        var userID int
        var desc string
        if err := rows.Scan(&id, &userID, &desc); err != nil {
            log.Printf("reminder scheduler: scan failed: %v", err)
            continue
        }

        user, err := getUserByID(ctx, userID)
        recipient := "unknown"
        if err == nil {
            recipient = fmt.Sprintf("%s (id:%d)", user.Email, user.ID)
        }

        // Placeholder delivery: log the reminder. Replace this with a real
        // push/email delivery integration (Expo push, FCM, APNs, SMTP, etc.).
        log.Printf("Reminder due for %s: id=%d desc=%s", recipient, id, desc)

        // Mark notification_at NULL so we don't repeatedly send the same reminder.
        if _, err := pool.Exec(ctx, "UPDATE maintenance_reminders SET notification_at = NULL WHERE id = $1", id); err != nil {
            log.Printf("reminder scheduler: failed to clear notification_at for %d: %v", id, err)
        }
    }
}
