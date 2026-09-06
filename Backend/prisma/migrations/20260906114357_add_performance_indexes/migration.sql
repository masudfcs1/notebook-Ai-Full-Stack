-- CreateIndex
CREATE INDEX "action_items_status_idx" ON "action_items"("status");

-- CreateIndex
CREATE INDEX "action_items_priority_idx" ON "action_items"("priority");

-- CreateIndex
CREATE INDEX "action_items_noteId_idx" ON "action_items"("noteId");

-- CreateIndex
CREATE INDEX "action_items_teamId_status_idx" ON "action_items"("teamId", "status");

-- CreateIndex
CREATE INDEX "meeting_notes_workspaceId_teamId_idx" ON "meeting_notes"("workspaceId", "teamId");

-- CreateIndex
CREATE INDEX "team_members_userId_idx" ON "team_members"("userId");

-- CreateIndex
CREATE INDEX "team_members_email_idx" ON "team_members"("email");

-- CreateIndex
CREATE INDEX "team_members_teamId_userId_idx" ON "team_members"("teamId", "userId");
