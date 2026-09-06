-- Remove indexes duplicated by UNIQUE constraints. PostgreSQL's unique indexes
-- already serve email, uuid, and token equality lookups.
DROP INDEX IF EXISTS "users_email_idx";
DROP INDEX IF EXISTS "users_uuid_idx";
DROP INDEX IF EXISTS "refresh_tokens_token_idx";

-- Cover the ownership/filter + ordering combinations used by list endpoints.
CREATE INDEX "users_deletedAt_createdAt_idx" ON "users"("deletedAt", "createdAt");
CREATE INDEX "login_history_userId_createdAt_idx" ON "login_history"("userId", "createdAt");
CREATE INDEX "workspaces_userId_createdAt_idx" ON "workspaces"("userId", "createdAt");
CREATE INDEX "teams_workspaceId_createdAt_idx" ON "teams"("workspaceId", "createdAt");
CREATE INDEX "team_members_teamId_createdAt_idx" ON "team_members"("teamId", "createdAt");
CREATE INDEX "meeting_notes_workspaceId_createdAt_idx" ON "meeting_notes"("workspaceId", "createdAt");
CREATE INDEX "meeting_notes_teamId_createdAt_idx" ON "meeting_notes"("teamId", "createdAt");
CREATE INDEX "action_items_teamId_createdAt_idx" ON "action_items"("teamId", "createdAt");
CREATE INDEX "notifications_userId_createdAt_idx" ON "notifications"("userId", "createdAt");
CREATE INDEX "notifications_userId_read_createdAt_idx" ON "notifications"("userId", "read", "createdAt");
