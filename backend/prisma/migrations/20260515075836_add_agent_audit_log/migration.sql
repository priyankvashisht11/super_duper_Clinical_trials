-- CreateTable
CREATE TABLE "agent_audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "session_id" TEXT,
    "action" VARCHAR(50) NOT NULL,
    "tool_name" VARCHAR(100),
    "query_hash" VARCHAR(16),
    "status" VARCHAR(20) NOT NULL,
    "duration_ms" INTEGER,
    "meta" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "agent_audit_logs_user_id_idx" ON "agent_audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "agent_audit_logs_session_id_idx" ON "agent_audit_logs"("session_id");

-- CreateIndex
CREATE INDEX "agent_audit_logs_created_at_idx" ON "agent_audit_logs"("created_at");
