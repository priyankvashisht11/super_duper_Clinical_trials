/*
  Warnings:

  - You are about to drop the column `is_critical` on the `eligibility_criteria` table. All the data in the column will be lost.
  - You are about to drop the column `is_complete` on the `protocol_sections` table. All the data in the column will be lost.
  - You are about to drop the column `is_required` on the `protocol_sections` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `protocols` table. All the data in the column will be lost.
  - You are about to drop the column `last_validation_date` on the `protocols` table. All the data in the column will be lost.
  - You are about to drop the column `last_validation_id` on the `protocols` table. All the data in the column will be lost.
  - You are about to drop the column `completeness_score` on the `validation_results` table. All the data in the column will be lost.
  - You are about to drop the column `is_enabled` on the `validation_rules` table. All the data in the column will be lost.
  - You are about to drop the `controlled_terminologies` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `order_index` to the `interventions` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "eligibility_criteria_protocol_id_criterion_type_criterion_n_key";

-- DropIndex
DROP INDEX "eligibility_criteria_protocol_id_idx";

-- DropIndex
DROP INDEX "interventions_protocol_id_idx";

-- DropIndex
DROP INDEX "objectives_protocol_id_idx";

-- DropIndex
DROP INDEX "protocol_sections_protocol_id_idx";

-- DropIndex
DROP INDEX "validation_results_protocol_id_idx";

-- DropIndex
DROP INDEX "validation_results_validation_date_idx";

-- DropIndex
DROP INDEX "validation_rules_category_idx";

-- DropIndex
DROP INDEX "validation_rules_severity_idx";

-- AlterTable
ALTER TABLE "eligibility_criteria" DROP COLUMN "is_critical",
ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "interventions" ADD COLUMN     "order_index" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "objectives" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "protocol_sections" DROP COLUMN "is_complete",
DROP COLUMN "is_required",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "protocols" DROP COLUMN "deleted_at",
DROP COLUMN "last_validation_date",
DROP COLUMN "last_validation_id",
ALTER COLUMN "completeness_percentage" DROP NOT NULL,
ALTER COLUMN "completeness_percentage" SET DEFAULT 0,
ALTER COLUMN "completeness_percentage" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "validation_results" DROP COLUMN "completeness_score",
ADD COLUMN     "error_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "total_issues" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "warning_count" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "validation_rules" DROP COLUMN "is_enabled",
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "updated_at" DROP DEFAULT;

-- DropTable
DROP TABLE "controlled_terminologies";

-- CreateTable
CREATE TABLE "controlled_terminology" (
    "id" TEXT NOT NULL,
    "domain" VARCHAR(50) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "display_name" VARCHAR(200) NOT NULL,
    "definition" TEXT,
    "parent_code" VARCHAR(50),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "controlled_terminology_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "controlled_terminology_domain_code_key" ON "controlled_terminology"("domain", "code");
