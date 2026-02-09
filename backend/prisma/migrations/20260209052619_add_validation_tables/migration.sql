-- AlterTable
ALTER TABLE "protocols" ADD COLUMN     "last_validation_date" TIMESTAMP(3),
ADD COLUMN     "last_validation_id" TEXT;

-- CreateTable
CREATE TABLE "validation_rules" (
    "id" TEXT NOT NULL,
    "rule_id" VARCHAR(50) NOT NULL,
    "rule_name" VARCHAR(200) NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "severity" VARCHAR(20) NOT NULL,
    "description" TEXT NOT NULL,
    "section" VARCHAR(10),
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "validation_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "validation_results" (
    "id" TEXT NOT NULL,
    "protocol_id" TEXT NOT NULL,
    "validation_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "overall_status" VARCHAR(50) NOT NULL,
    "completeness_score" INTEGER NOT NULL DEFAULT 0,
    "results" JSONB NOT NULL,
    "section_status" JSONB NOT NULL,

    CONSTRAINT "validation_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "validation_rules_rule_id_key" ON "validation_rules"("rule_id");

-- CreateIndex
CREATE INDEX "validation_rules_category_idx" ON "validation_rules"("category");

-- CreateIndex
CREATE INDEX "validation_rules_severity_idx" ON "validation_rules"("severity");

-- CreateIndex
CREATE INDEX "validation_results_protocol_id_idx" ON "validation_results"("protocol_id");

-- CreateIndex
CREATE INDEX "validation_results_validation_date_idx" ON "validation_results"("validation_date");

-- AddForeignKey
ALTER TABLE "validation_results" ADD CONSTRAINT "validation_results_protocol_id_fkey" FOREIGN KEY ("protocol_id") REFERENCES "protocols"("id") ON DELETE CASCADE ON UPDATE CASCADE;
