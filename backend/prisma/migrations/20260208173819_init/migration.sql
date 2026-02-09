-- CreateTable
CREATE TABLE "protocols" (
    "id" TEXT NOT NULL,
    "sponsor_protocol_identifier" VARCHAR(100) NOT NULL,
    "full_title" TEXT NOT NULL,
    "short_title" VARCHAR(250),
    "protocol_version" VARCHAR(50) NOT NULL,
    "protocol_date" DATE NOT NULL,
    "original_protocol_indicator" BOOLEAN NOT NULL DEFAULT true,
    "protocol_amendment_number" VARCHAR(20),
    "amendment_scope" VARCHAR(50),
    "trial_phase" VARCHAR(50),
    "indication" TEXT,
    "study_type" VARCHAR(50) NOT NULL DEFAULT 'Interventional',
    "protocol_status" VARCHAR(50) NOT NULL DEFAULT 'draft',
    "completeness_percentage" INTEGER NOT NULL DEFAULT 0,
    "usdm_json" JSONB,
    "created_by" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR(100),
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "protocols_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "protocol_sections" (
    "id" TEXT NOT NULL,
    "protocol_id" TEXT NOT NULL,
    "section_number" VARCHAR(10) NOT NULL,
    "section_title" VARCHAR(200) NOT NULL,
    "section_type" VARCHAR(50) NOT NULL,
    "content" JSONB NOT NULL DEFAULT '{}',
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "is_complete" BOOLEAN NOT NULL DEFAULT false,
    "order_index" INTEGER NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "protocol_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "objectives" (
    "id" TEXT NOT NULL,
    "protocol_id" TEXT NOT NULL,
    "objective_type" VARCHAR(20) NOT NULL,
    "order_index" INTEGER NOT NULL,
    "objective_text" TEXT NOT NULL,
    "estimand" JSONB,
    "rationale" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "objectives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eligibility_criteria" (
    "id" TEXT NOT NULL,
    "protocol_id" TEXT NOT NULL,
    "criterion_type" VARCHAR(10) NOT NULL,
    "criterion_number" VARCHAR(10) NOT NULL,
    "criterion_text" TEXT NOT NULL,
    "order_index" INTEGER NOT NULL,
    "is_critical" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eligibility_criteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interventions" (
    "id" TEXT NOT NULL,
    "protocol_id" TEXT NOT NULL,
    "intervention_type" VARCHAR(50) NOT NULL,
    "product_name" VARCHAR(200) NOT NULL,
    "dosage_form" VARCHAR(100),
    "route_of_administration" VARCHAR(100),
    "dose" VARCHAR(50),
    "dose_unit" VARCHAR(20),
    "frequency" VARCHAR(100),
    "duration" VARCHAR(100),
    "rationale" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interventions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "controlled_terminologies" (
    "id" TEXT NOT NULL,
    "domain" VARCHAR(50) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "display_name" VARCHAR(200) NOT NULL,
    "definition" TEXT,
    "parent_code" VARCHAR(50),
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "controlled_terminologies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "protocols_sponsor_protocol_identifier_key" ON "protocols"("sponsor_protocol_identifier");

-- CreateIndex
CREATE INDEX "protocol_sections_protocol_id_idx" ON "protocol_sections"("protocol_id");

-- CreateIndex
CREATE UNIQUE INDEX "protocol_sections_protocol_id_section_number_key" ON "protocol_sections"("protocol_id", "section_number");

-- CreateIndex
CREATE INDEX "objectives_protocol_id_idx" ON "objectives"("protocol_id");

-- CreateIndex
CREATE INDEX "eligibility_criteria_protocol_id_idx" ON "eligibility_criteria"("protocol_id");

-- CreateIndex
CREATE UNIQUE INDEX "eligibility_criteria_protocol_id_criterion_type_criterion_n_key" ON "eligibility_criteria"("protocol_id", "criterion_type", "criterion_number");

-- CreateIndex
CREATE INDEX "interventions_protocol_id_idx" ON "interventions"("protocol_id");

-- CreateIndex
CREATE INDEX "controlled_terminologies_domain_idx" ON "controlled_terminologies"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "controlled_terminologies_domain_code_key" ON "controlled_terminologies"("domain", "code");

-- AddForeignKey
ALTER TABLE "protocol_sections" ADD CONSTRAINT "protocol_sections_protocol_id_fkey" FOREIGN KEY ("protocol_id") REFERENCES "protocols"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "objectives" ADD CONSTRAINT "objectives_protocol_id_fkey" FOREIGN KEY ("protocol_id") REFERENCES "protocols"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eligibility_criteria" ADD CONSTRAINT "eligibility_criteria_protocol_id_fkey" FOREIGN KEY ("protocol_id") REFERENCES "protocols"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interventions" ADD CONSTRAINT "interventions_protocol_id_fkey" FOREIGN KEY ("protocol_id") REFERENCES "protocols"("id") ON DELETE CASCADE ON UPDATE CASCADE;
