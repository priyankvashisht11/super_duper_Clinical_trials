-- CreateTable
CREATE TABLE "crf_forms" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crf_forms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crf_fields" (
    "id" TEXT NOT NULL,
    "form_id" TEXT NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "label" VARCHAR(300) NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "options" TEXT[],
    "order_index" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "crf_fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "edc_patients" (
    "id" TEXT NOT NULL,
    "subject_id" VARCHAR(50) NOT NULL,
    "site" VARCHAR(200) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'screening',
    "enrolled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "edc_patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "edc_entries" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "form_id" TEXT NOT NULL,
    "visitDate" VARCHAR(20) NOT NULL,
    "data" JSONB NOT NULL,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "signer_name" VARCHAR(200),
    "signer_role" VARCHAR(100),
    "signed_at" TIMESTAMP(3),

    CONSTRAINT "edc_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "edc_audit_logs" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "action" VARCHAR(50) NOT NULL,
    "entity" VARCHAR(200) NOT NULL,
    "detail" TEXT NOT NULL,

    CONSTRAINT "edc_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "edc_patients_subject_id_key" ON "edc_patients"("subject_id");

-- AddForeignKey
ALTER TABLE "crf_fields" ADD CONSTRAINT "crf_fields_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "crf_forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "edc_entries" ADD CONSTRAINT "edc_entries_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "edc_patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "edc_entries" ADD CONSTRAINT "edc_entries_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "crf_forms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
