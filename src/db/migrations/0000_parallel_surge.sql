-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."booking_status" AS ENUM('pending_request', 'confirmed', 'reminder', 'canceled', 'altered');--> statement-breakpoint
CREATE TYPE "public"."invite_status" AS ENUM('pending', 'accepted', 'declined');--> statement-breakpoint
CREATE TYPE "public"."invite_type" AS ENUM('email', 'sms', 'link');--> statement-breakpoint
CREATE TYPE "public"."member_role" AS ENUM('admin', 'member');--> statement-breakpoint
CREATE TYPE "public"."party_status" AS ENUM('forming', 'active', 'under_contract', 'closed', 'archived');--> statement-breakpoint
CREATE TABLE "listings" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"unit_id" uuid NOT NULL,
	"platform_room_id" text NOT NULL,
	"platform_listing_url" text,
	"title" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT utc_now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT utc_now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guests" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"full_name" text NOT NULL,
	"profile_city" text,
	"reviews_count" integer DEFAULT 0,
	"is_identity_verified" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT utc_now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT utc_now() NOT NULL,
	CONSTRAINT "guests_full_name_check" CHECK (length(TRIM(BOTH FROM full_name)) > 0),
	CONSTRAINT "guests_reviews_count_check" CHECK (reviews_count >= 0)
);
--> statement-breakpoint
CREATE TABLE "reservation_line_items" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"reservation_id" uuid NOT NULL,
	"category" text NOT NULL,
	"description" text,
	"qty" numeric(12, 3) DEFAULT '1' NOT NULL,
	"unit_amount" numeric(12, 2),
	"total_amount" numeric(12, 2) NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT utc_now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"reservation_id" uuid,
	"direction" text NOT NULL,
	"author" text NOT NULL,
	"body" text NOT NULL,
	"posted_at" timestamp with time zone DEFAULT utc_now() NOT NULL,
	"source_url" text,
	"created_at" timestamp with time zone DEFAULT utc_now() NOT NULL,
	CONSTRAINT "messages_author_check" CHECK (length(TRIM(BOTH FROM author)) > 0),
	CONSTRAINT "messages_body_check" CHECK (length(TRIM(BOTH FROM body)) > 0),
	CONSTRAINT "messages_direction_check" CHECK (direction = ANY (ARRAY['guest_to_host'::text, 'host_to_guest'::text]))
);
--> statement-breakpoint
CREATE TABLE "emails_raw" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"reservation_id" uuid,
	"listing_id" uuid,
	"subject" text NOT NULL,
	"sent_at" timestamp with time zone NOT NULL,
	"from_address" text NOT NULL,
	"to_address" text NOT NULL,
	"raw_eml" "bytea",
	"parsed" jsonb DEFAULT '{}'::jsonb,
	"processed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT utc_now() NOT NULL,
	CONSTRAINT "emails_raw_from_address_check" CHECK (from_address ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text),
	CONSTRAINT "emails_raw_subject_check" CHECK (length(TRIM(BOTH FROM subject)) > 0),
	CONSTRAINT "emails_raw_to_address_check" CHECK (to_address ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text)
);
--> statement-breakpoint
CREATE TABLE "chart_of_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_account_id" uuid,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"code" text,
	"description" text,
	CONSTRAINT "uq_name_parent" UNIQUE("parent_account_id","name"),
	CONSTRAINT "chart_of_accounts_code_key" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "vendors" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"name" text NOT NULL,
	"type" text DEFAULT 'other' NOT NULL,
	"contact_info" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT utc_now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT utc_now() NOT NULL,
	CONSTRAINT "vendors_name_check" CHECK (length(TRIM(BOTH FROM name)) > 0),
	CONSTRAINT "vendors_type_check" CHECK (type = ANY (ARRAY['cleaner'::text, 'utilities'::text, 'supplies'::text, 'streaming'::text, 'repairs'::text, 'tax'::text, 'other'::text]))
);
--> statement-breakpoint
CREATE TABLE "ai_documents" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"source_type" text NOT NULL,
	"source_id" uuid,
	"title" text NOT NULL,
	"url" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT utc_now() NOT NULL,
	"source_updated_at" timestamp with time zone,
	"content_sha256" text,
	"embedding_model" text,
	"embedding_dim" integer,
	"file_type" text,
	"test_environment" text DEFAULT 'production',
	CONSTRAINT "ai_documents_file_type_check" CHECK (file_type = ANY (ARRAY['pdf'::text, 'xlsx'::text, 'docx'::text, 'csv'::text, 'jpg'::text, 'jpeg'::text, 'png'::text, 'txt'::text, 'other'::text])),
	CONSTRAINT "ai_documents_source_type_check" CHECK (source_type = ANY (ARRAY['email'::text, 'reservation'::text, 'message'::text, 'payout'::text, 'expense'::text, 'statement'::text, 'receipt'::text, 'invoice'::text, 'memo'::text, 'contract'::text, 'report'::text, 'other'::text])),
	CONSTRAINT "ai_documents_title_check" CHECK (length(TRIM(BOTH FROM title)) > 0)
);
--> statement-breakpoint
CREATE TABLE "ai_chunks" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"document_id" uuid,
	"chunk_index" integer,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT utc_now() NOT NULL,
	"embedding" vector(1536),
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	CONSTRAINT "ai_chunks_document_id_chunk_index_key" UNIQUE("document_id","chunk_index"),
	CONSTRAINT "ai_chunks_chunk_index_check" CHECK (chunk_index >= 0),
	CONSTRAINT "ai_chunks_content_check" CHECK (length(TRIM(BOTH FROM content)) > 0)
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text,
	"phone" text,
	"full_name" text,
	"avatar_url" text,
	"onboarding_completed" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
	"updated_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "buying_parties" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"name" text NOT NULL,
	"status" "party_status" DEFAULT 'forming' NOT NULL,
	"created_by" uuid,
	"calculator_state" jsonb,
	"target_city" text,
	"target_budget" numeric,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
	"updated_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "buying_parties" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "party_members" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"party_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "member_role" DEFAULT 'member' NOT NULL,
	"invite_status" "invite_status" DEFAULT 'accepted' NOT NULL,
	"ownership_percentage" numeric,
	"down_payment_contribution" numeric,
	"monthly_contribution" numeric,
	"joined_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
	CONSTRAINT "party_members_party_id_user_id_key" UNIQUE("party_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "party_members" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "properties" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"name" text NOT NULL,
	"address_line1" text NOT NULL,
	"address_line2" text,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"postal_code" text,
	"country" text DEFAULT 'US' NOT NULL,
	"created_at" timestamp with time zone DEFAULT utc_now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT utc_now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payouts" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"reservation_id" uuid NOT NULL,
	"expected_payout_date" date NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"host_service_fee" numeric(12, 2) DEFAULT '0',
	"currency" text DEFAULT 'USD' NOT NULL,
	"paid_at" timestamp with time zone,
	"payout_ref" text,
	"created_at" timestamp with time zone DEFAULT utc_now() NOT NULL,
	"payout_date" date GENERATED ALWAYS AS (COALESCE(((paid_at AT TIME ZONE 'UTC'::text))::date, expected_payout_date)) STORED,
	"payout_month" date GENERATED ALWAYS AS ((date_trunc('month'::text, COALESCE((paid_at AT TIME ZONE 'UTC'::text), (expected_payout_date)::timestamp without time zone)))::date) STORED,
	"payout_period_start" date,
	"payout_period_end" date,
	CONSTRAINT "payouts_amount_check" CHECK (amount >= (0)::numeric),
	CONSTRAINT "payouts_currency_check" CHECK (currency = ANY (ARRAY['USD'::text, 'EUR'::text, 'CAD'::text, 'GBP'::text]))
);
--> statement-breakpoint
CREATE TABLE "expense_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"subcategories" text[],
	"is_operating_expense" boolean DEFAULT true,
	"parent_category" text,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "expense_categories_name_key" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "units" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"property_id" uuid NOT NULL,
	"unit_code" text NOT NULL,
	"display_name" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT utc_now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT utc_now() NOT NULL,
	"available_from" date,
	"available_until" date,
	"is_rental_unit" boolean DEFAULT true,
	"aliases" text[],
	CONSTRAINT "units_property_id_unit_code_key" UNIQUE("property_id","unit_code")
);
--> statement-breakpoint
CREATE TABLE "reservations" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"listing_id" uuid,
	"guest_id" uuid,
	"platform" text DEFAULT 'airbnb' NOT NULL,
	"confirmation_code" text NOT NULL,
	"status" "booking_status" NOT NULL,
	"checkin_date" date NOT NULL,
	"checkin_time" time DEFAULT '15:00:00',
	"checkout_date" date NOT NULL,
	"checkout_time" time DEFAULT '11:00:00',
	"nights" integer GENERATED ALWAYS AS ((checkout_date - checkin_date)) STORED,
	"adults" integer DEFAULT 1 NOT NULL,
	"children" integer DEFAULT 0 NOT NULL,
	"infants" integer DEFAULT 0 NOT NULL,
	"pets" integer DEFAULT 0 NOT NULL,
	"message_excerpt" text,
	"occupancy_taxes_collected" numeric(12, 2) DEFAULT '0',
	"currency" text DEFAULT 'USD' NOT NULL,
	"created_at" timestamp with time zone DEFAULT utc_now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT utc_now() NOT NULL,
	"content" text,
	"embedding" vector(768),
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"checkin_month" date GENERATED ALWAYS AS ((date_trunc('month'::text, (checkin_date)::timestamp without time zone))::date) STORED,
	"checkout_month" date GENERATED ALWAYS AS ((date_trunc('month'::text, (checkout_date)::timestamp without time zone))::date) STORED,
	"gross_amount" numeric(10, 2),
	"host_fees" numeric(10, 2),
	"net_amount" numeric(10, 2),
	CONSTRAINT "reservations_platform_confirmation_code_key" UNIQUE("platform","confirmation_code"),
	CONSTRAINT "nights_consistent" CHECK (nights = (checkout_date - checkin_date)),
	CONSTRAINT "reservations_check" CHECK (checkout_date > checkin_date),
	CONSTRAINT "reservations_check1" CHECK ((adults > 0) AND (children >= 0) AND (infants >= 0) AND (pets >= 0)),
	CONSTRAINT "reservations_confirmation_code_check" CHECK (length(TRIM(BOTH FROM confirmation_code)) > 0),
	CONSTRAINT "reservations_currency_check" CHECK (currency = ANY (ARRAY['USD'::text, 'EUR'::text, 'CAD'::text, 'GBP'::text])),
	CONSTRAINT "reservations_occupancy_taxes_collected_check" CHECK (occupancy_taxes_collected >= (0)::numeric)
);
--> statement-breakpoint
CREATE TABLE "party_invites" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"party_id" uuid NOT NULL,
	"invite_type" "invite_type" NOT NULL,
	"invite_value" text NOT NULL,
	"invited_by" uuid,
	"role" "member_role" DEFAULT 'member' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"accepted_at" timestamp with time zone,
	"accepted_by" uuid,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "party_invites" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "financial_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_document_id" uuid NOT NULL,
	"tx_date" date NOT NULL,
	"description" text NOT NULL,
	"merchant" text,
	"amount" numeric(12, 2) NOT NULL,
	"transaction_type" text,
	"source" text,
	"cardholder" text,
	"principal" numeric(12, 2),
	"interest" numeric(12, 2),
	"escrow" numeric(12, 2),
	"fees" numeric(12, 2),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"reservation_id" uuid,
	"description_tsv" "tsvector" GENERATED ALWAYS AS (to_tsvector('english'::regconfig, ((description || ' '::text) || COALESCE(merchant, ''::text)))) STORED,
	"test_environment" text DEFAULT 'production',
	CONSTRAINT "transactions_transaction_type_check" CHECK (transaction_type = ANY (ARRAY['credit'::text, 'debit'::text, 'purchase'::text, 'payment'::text, 'mortgage_payment'::text, 'escrow_disbursement'::text, 'transfer'::text]))
);
--> statement-breakpoint
CREATE TABLE "vendor_mappings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"merchant_pattern" text NOT NULL,
	"chart_of_account_id" uuid NOT NULL,
	"split_across_units" boolean DEFAULT false,
	"confidence" numeric DEFAULT '1.0',
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "vendor_mappings_merchant_pattern_unique" UNIQUE("merchant_pattern")
);
--> statement-breakpoint
CREATE TABLE "transaction_allocations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"financial_transaction_id" uuid NOT NULL,
	"chart_of_account_id" uuid NOT NULL,
	"property_id" uuid,
	"unit_id" uuid,
	"amount" numeric(10, 2) NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"needs_review" boolean DEFAULT false,
	"test_environment" text DEFAULT 'production',
	"is_split" boolean DEFAULT false,
	CONSTRAINT "unique_transaction_allocation" UNIQUE("financial_transaction_id","chart_of_account_id")
);
--> statement-breakpoint
ALTER TABLE "transaction_allocations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "source_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"file_id" text NOT NULL,
	"file_name" text NOT NULL,
	"file_hash" text NOT NULL,
	"institution" text,
	"account_number" text,
	"statement_date" date,
	"document_type" text,
	"processed_date" timestamp with time zone DEFAULT now(),
	"confidence_score" numeric(3, 2),
	"raw_data" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"beginning_balance" numeric(10, 2),
	"ending_balance" numeric(10, 2),
	"reconciliation_status" text DEFAULT 'pending',
	"test_environment" text DEFAULT 'production',
	"telegram_chat_id" text,
	CONSTRAINT "statements_file_hash_key" UNIQUE("file_hash"),
	CONSTRAINT "statements_confidence_score_check" CHECK ((confidence_score >= (0)::numeric) AND (confidence_score <= (1)::numeric)),
	CONSTRAINT "statements_document_type_check" CHECK (document_type = ANY (ARRAY['bank_statement'::text, 'credit_card'::text, 'mortgage'::text, 'utility'::text, 'unknown'::text]))
);
--> statement-breakpoint
CREATE TABLE "owner_blocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"unit_id" uuid,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"reason" varchar(50) DEFAULT 'owner_use',
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "owner_blocks" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"table_name" text NOT NULL,
	"record_id" uuid NOT NULL,
	"old_data" jsonb,
	"new_data" jsonb,
	"changed_by" text DEFAULT 'system',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "expense_review_queue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"financial_transaction_id" uuid,
	"merchant" text,
	"amount" numeric,
	"tx_date" date,
	"suggested_categories" jsonb,
	"status" text DEFAULT 'pending',
	"telegram_message_id" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "expense_review_queue" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "expense_review_state" (
	"telegram_user_id" bigint PRIMARY KEY NOT NULL,
	"current_review_id" uuid,
	"awaiting_category" boolean DEFAULT false,
	"last_message_id" bigint,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "manual_review_queue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"file_id" text NOT NULL,
	"file_name" text NOT NULL,
	"reason" text NOT NULL,
	"status" text DEFAULT 'pending',
	"data" jsonb,
	"reviewer_notes" text,
	"reviewed_by" text,
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"merchant" text,
	"description" text,
	"amount" numeric(10, 2),
	"tx_date" date,
	"test_environment" text,
	CONSTRAINT "manual_review_queue_status_check" CHECK (status = ANY (ARRAY['pending'::text, 'in_review'::text, 'approved'::text, 'rejected'::text]))
);
--> statement-breakpoint
CREATE TABLE "merchant_category_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"merchant_pattern" text NOT NULL,
	"correct_account_id" uuid,
	"correct_account_name" text,
	"rule_type" text DEFAULT 'contains',
	"priority" integer DEFAULT 0,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "merchant_category_rules_rule_type_check" CHECK (rule_type = ANY (ARRAY['exact'::text, 'contains'::text]))
);
--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservation_line_items" ADD CONSTRAINT "reservation_line_items_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "public"."reservations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "public"."reservations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emails_raw" ADD CONSTRAINT "emails_raw_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emails_raw" ADD CONSTRAINT "emails_raw_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "public"."reservations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chart_of_accounts" ADD CONSTRAINT "chart_of_accounts_parent_account_id_fkey" FOREIGN KEY ("parent_account_id") REFERENCES "public"."chart_of_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_chunks" ADD CONSTRAINT "ai_chunks_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."ai_documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "buying_parties" ADD CONSTRAINT "buying_parties_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "party_members" ADD CONSTRAINT "party_members_party_id_fkey" FOREIGN KEY ("party_id") REFERENCES "public"."buying_parties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "party_members" ADD CONSTRAINT "party_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "public"."reservations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "units" ADD CONSTRAINT "units_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "public"."guests"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "party_invites" ADD CONSTRAINT "party_invites_accepted_by_fkey" FOREIGN KEY ("accepted_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "party_invites" ADD CONSTRAINT "party_invites_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "party_invites" ADD CONSTRAINT "party_invites_party_id_fkey" FOREIGN KEY ("party_id") REFERENCES "public"."buying_parties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_transactions" ADD CONSTRAINT "financial_transactions_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "public"."reservations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_transactions" ADD CONSTRAINT "transactions_statement_id_fkey" FOREIGN KEY ("source_document_id") REFERENCES "public"."source_documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_mappings" ADD CONSTRAINT "vendor_mappings_chart_of_account_id_fkey" FOREIGN KEY ("chart_of_account_id") REFERENCES "public"."chart_of_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_allocations" ADD CONSTRAINT "transaction_allocations_financial_transaction_id_fkey" FOREIGN KEY ("financial_transaction_id") REFERENCES "public"."financial_transactions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_allocations" ADD CONSTRAINT "transaction_allocations_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_allocations" ADD CONSTRAINT "transaction_allocations_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "owner_blocks" ADD CONSTRAINT "owner_blocks_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_review_queue" ADD CONSTRAINT "expense_review_queue_financial_transaction_id_fkey" FOREIGN KEY ("financial_transaction_id") REFERENCES "public"."financial_transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_review_state" ADD CONSTRAINT "expense_review_state_current_review_id_fkey" FOREIGN KEY ("current_review_id") REFERENCES "public"."expense_review_queue"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merchant_category_rules" ADD CONSTRAINT "merchant_category_rules_correct_account_id_fkey" FOREIGN KEY ("correct_account_id") REFERENCES "public"."chart_of_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ix_listings_unit" ON "listings" USING btree ("unit_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "listings_unit_idx" ON "listings" USING btree ("unit_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "guests_name_idx" ON "guests" USING gin ("full_name" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "line_items_category_idx" ON "reservation_line_items" USING btree ("category" text_ops);--> statement-breakpoint
CREATE INDEX "line_items_reservation_idx" ON "reservation_line_items" USING btree ("reservation_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "messages_posted_idx" ON "messages" USING btree ("posted_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "messages_reservation_idx" ON "messages" USING btree ("reservation_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "emails_processed_idx" ON "emails_raw" USING btree ("processed" bool_ops);--> statement-breakpoint
CREATE INDEX "emails_sent_idx" ON "emails_raw" USING btree ("sent_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "emails_subject_idx" ON "emails_raw" USING gin ("subject" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "vendors_name_idx" ON "vendors" USING gin ("name" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "vendors_type_idx" ON "vendors" USING btree ("type" text_ops);--> statement-breakpoint
CREATE INDEX "ai_documents_meta_idx" ON "ai_documents" USING gin ("metadata" jsonb_path_ops);--> statement-breakpoint
CREATE INDEX "ai_documents_source_idx" ON "ai_documents" USING btree ("source_type" text_ops,"source_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_ai_documents_file_type" ON "ai_documents" USING btree ("file_type" text_ops);--> statement-breakpoint
CREATE INDEX "idx_ai_documents_test_env" ON "ai_documents" USING btree ("test_environment" text_ops);--> statement-breakpoint
CREATE INDEX "ix_ai_documents_sha" ON "ai_documents" USING btree ("content_sha256" text_ops);--> statement-breakpoint
CREATE INDEX "ai_chunks_doc_idx" ON "ai_chunks" USING btree ("document_id" uuid_ops,"chunk_index" int4_ops);--> statement-breakpoint
CREATE INDEX "ai_chunks_embedding_idx" ON "ai_chunks" USING ivfflat ("embedding" vector_cosine_ops) WITH (lists=100);--> statement-breakpoint
CREATE INDEX "idx_ai_chunks_metadata_chunk_type" ON "ai_chunks" USING btree (((metadata ->> 'chunk_type'::text)) text_ops);--> statement-breakpoint
CREATE INDEX "idx_ai_chunks_metadata_document_type" ON "ai_chunks" USING btree (((metadata ->> 'document_type'::text)) text_ops);--> statement-breakpoint
CREATE INDEX "idx_ai_chunks_metadata_gin" ON "ai_chunks" USING gin ("metadata" jsonb_ops);--> statement-breakpoint
CREATE INDEX "idx_ai_chunks_metadata_institution" ON "ai_chunks" USING btree (((metadata ->> 'institution'::text)) text_ops);--> statement-breakpoint
CREATE INDEX "idx_ai_chunks_metadata_statement_id" ON "ai_chunks" USING btree (((metadata ->> 'statement_id'::text)) text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "uq_ai_chunks_doc_idx" ON "ai_chunks" USING btree ("document_id" int4_ops,"chunk_index" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_profiles_email" ON "profiles" USING btree ("email" text_ops);--> statement-breakpoint
CREATE INDEX "idx_profiles_phone" ON "profiles" USING btree ("phone" text_ops);--> statement-breakpoint
CREATE INDEX "idx_buying_parties_created_by" ON "buying_parties" USING btree ("created_by" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_buying_parties_status" ON "buying_parties" USING btree ("status" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_party_members_party_id" ON "party_members" USING btree ("party_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_party_members_user_id" ON "party_members" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "ix_payouts_payout_date" ON "payouts" USING btree ("payout_date" date_ops);--> statement-breakpoint
CREATE INDEX "ix_payouts_payout_month" ON "payouts" USING btree ("payout_month" date_ops);--> statement-breakpoint
CREATE INDEX "ix_payouts_reservation" ON "payouts" USING btree ("reservation_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "payouts_expected_date_idx" ON "payouts" USING btree ("expected_payout_date" date_ops);--> statement-breakpoint
CREATE INDEX "payouts_paid_idx" ON "payouts" USING btree ("paid_at" timestamptz_ops) WHERE (paid_at IS NOT NULL);--> statement-breakpoint
CREATE INDEX "ix_units_property" ON "units" USING btree ("property_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_reservations_checkin_date" ON "reservations" USING btree ("checkin_date" date_ops);--> statement-breakpoint
CREATE INDEX "idx_reservations_checkout_date" ON "reservations" USING btree ("checkout_date" date_ops);--> statement-breakpoint
CREATE INDEX "idx_reservations_confirmation_code" ON "reservations" USING btree ("confirmation_code" text_ops);--> statement-breakpoint
CREATE INDEX "idx_reservations_platform" ON "reservations" USING btree ("platform" text_ops);--> statement-breakpoint
CREATE INDEX "ix_reservations_checkin_month" ON "reservations" USING btree ("checkin_month" date_ops);--> statement-breakpoint
CREATE INDEX "ix_reservations_listing" ON "reservations" USING btree ("listing_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "ix_reservations_status" ON "reservations" USING btree ("status" enum_ops);--> statement-breakpoint
CREATE INDEX "reservations_dates_idx" ON "reservations" USING btree ("checkin_date" date_ops,"checkout_date" date_ops);--> statement-breakpoint
CREATE INDEX "reservations_embedding_idx" ON "reservations" USING ivfflat ("embedding" vector_cosine_ops);--> statement-breakpoint
CREATE INDEX "reservations_listing_dates_idx" ON "reservations" USING btree ("listing_id" date_ops,"checkin_date" uuid_ops,"checkout_date" date_ops);--> statement-breakpoint
CREATE INDEX "reservations_status_idx" ON "reservations" USING btree ("status" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_party_invites_expires" ON "party_invites" USING btree ("expires_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_party_invites_party_id" ON "party_invites" USING btree ("party_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_party_invites_value" ON "party_invites" USING btree ("invite_value" text_ops);--> statement-breakpoint
CREATE INDEX "idx_fin_tx_date" ON "financial_transactions" USING btree ("tx_date" date_ops);--> statement-breakpoint
CREATE INDEX "idx_fin_tx_date_type" ON "financial_transactions" USING btree ("tx_date" text_ops,"transaction_type" text_ops);--> statement-breakpoint
CREATE INDEX "idx_fin_tx_fts" ON "financial_transactions" USING gin ("description_tsv" tsvector_ops);--> statement-breakpoint
CREATE INDEX "idx_fin_tx_merchant" ON "financial_transactions" USING btree ("merchant" text_ops);--> statement-breakpoint
CREATE INDEX "idx_fin_tx_source" ON "financial_transactions" USING btree ("source" text_ops);--> statement-breakpoint
CREATE INDEX "idx_financial_txns_test_env" ON "financial_transactions" USING btree ("test_environment" text_ops);--> statement-breakpoint
CREATE INDEX "idx_transactions_amount" ON "financial_transactions" USING btree ("amount" numeric_ops);--> statement-breakpoint
CREATE INDEX "idx_transactions_date" ON "financial_transactions" USING btree ("tx_date" date_ops);--> statement-breakpoint
CREATE INDEX "idx_transactions_statement_id" ON "financial_transactions" USING btree ("source_document_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_transactions_type" ON "financial_transactions" USING btree ("transaction_type" text_ops);--> statement-breakpoint
CREATE INDEX "idx_vendor_mappings_merchant" ON "vendor_mappings" USING btree ("merchant_pattern" text_ops);--> statement-breakpoint
CREATE INDEX "idx_allocations_needs_review" ON "transaction_allocations" USING btree ("needs_review" bool_ops) WHERE (needs_review = true);--> statement-breakpoint
CREATE INDEX "idx_allocations_test_env" ON "transaction_allocations" USING btree ("test_environment" text_ops);--> statement-breakpoint
CREATE INDEX "idx_allocations_tx_id" ON "transaction_allocations" USING btree ("financial_transaction_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_source_docs_test_env" ON "source_documents" USING btree ("test_environment" text_ops);--> statement-breakpoint
CREATE INDEX "idx_statements_document_type" ON "source_documents" USING btree ("document_type" text_ops);--> statement-breakpoint
CREATE INDEX "idx_statements_file_hash" ON "source_documents" USING btree ("file_hash" text_ops);--> statement-breakpoint
CREATE INDEX "idx_statements_institution" ON "source_documents" USING btree ("institution" text_ops);--> statement-breakpoint
CREATE INDEX "idx_statements_statement_date" ON "source_documents" USING btree ("statement_date" date_ops);--> statement-breakpoint
CREATE INDEX "idx_owner_blocks_dates" ON "owner_blocks" USING btree ("start_date" date_ops,"end_date" date_ops);--> statement-breakpoint
CREATE INDEX "idx_owner_blocks_unit_dates" ON "owner_blocks" USING btree ("unit_id" uuid_ops,"start_date" uuid_ops,"end_date" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_review_queue_created_at" ON "manual_review_queue" USING btree ("created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_review_queue_status" ON "manual_review_queue" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "idx_merchant_rules_pattern" ON "merchant_category_rules" USING btree ("merchant_pattern" text_ops);--> statement-breakpoint
CREATE VIEW "public"."v_payouts" AS (SELECT id, reservation_id, COALESCE(paid_at::date, expected_payout_date) AS payout_date, amount::numeric AS amount, host_service_fee::numeric AS host_service_fee, currency, payout_ref, created_at FROM payouts p);--> statement-breakpoint
CREATE VIEW "public"."v_revenue_by_day" AS (SELECT r.id AS reservation_id, r.confirmation_code, d.day AS revenue_date, date_trunc('month'::text, d.day)::date AS revenue_month, u.property_id, l.unit_id, r.platform, CASE WHEN r.nights > 0 THEN COALESCE(ps.total_payout, 0::numeric) / r.nights::numeric ELSE 0::numeric END AS daily_revenue, CASE WHEN r.nights > 0 THEN COALESCE(ps.net_revenue, 0::numeric) / r.nights::numeric ELSE 0::numeric END AS daily_net_revenue, r.nights AS total_nights, COALESCE(ps.total_payout, 0::numeric) AS total_revenue FROM reservations r JOIN listings l ON r.listing_id = l.id JOIN units u ON l.unit_id = u.id LEFT JOIN ( SELECT v_payouts_canonical.reservation_id, sum(v_payouts_canonical.payout_amount) AS total_payout, sum(v_payouts_canonical.payout_amount - COALESCE(v_payouts_canonical.host_service_fee, 0::numeric)) AS net_revenue FROM v_payouts_canonical GROUP BY v_payouts_canonical.reservation_id) ps ON r.id = ps.reservation_id CROSS JOIN LATERAL generate_series(r.checkin_date::timestamp with time zone, (r.checkout_date - 1)::timestamp with time zone, '1 day'::interval) d(day) WHERE r.status = ANY (ARRAY['confirmed'::booking_status, 'altered'::booking_status]));--> statement-breakpoint
CREATE VIEW "public"."v_reservations_canonical" AS (SELECT r.id AS reservation_id, r.listing_id, l.unit_id, u.property_id, r.platform, r.status, r.checkin_date, r.checkout_date, r.nights, r.currency, r.created_at, r.updated_at FROM reservations r LEFT JOIN listings l ON l.id = r.listing_id LEFT JOIN units u ON u.id = l.unit_id);--> statement-breakpoint
CREATE VIEW "public"."v_payouts_canonical" AS (SELECT p.id AS payout_id, p.reservation_id, p.payout_date, p.payout_month, p.amount::numeric AS payout_amount, p.host_service_fee::numeric AS host_service_fee, p.currency, r.listing_id, l.unit_id, u.property_id FROM payouts p JOIN reservations r ON r.id = p.reservation_id LEFT JOIN listings l ON l.id = r.listing_id LEFT JOIN units u ON u.id = l.unit_id);--> statement-breakpoint
CREATE VIEW "public"."v_revenue_by_month_payout" AS (SELECT payout_month AS month, property_id, sum(payout_amount) AS amount FROM v_payouts_canonical GROUP BY payout_month, property_id ORDER BY payout_month, property_id);--> statement-breakpoint
CREATE VIEW "public"."v_revenue_by_month_staynights" AS (WITH base AS ( SELECT r.reservation_id, r.property_id, r.checkin_date, r.checkout_date, r.nights, COALESCE(p.payout_amount, 0::numeric) AS total_payout FROM v_reservations_canonical r LEFT JOIN ( SELECT v_payouts_canonical.reservation_id, sum(v_payouts_canonical.payout_amount) AS payout_amount FROM v_payouts_canonical GROUP BY v_payouts_canonical.reservation_id) p ON p.reservation_id = r.reservation_id WHERE r.status = ANY (ARRAY['confirmed'::booking_status, 'altered'::booking_status]) ), expanded AS ( SELECT base.reservation_id, base.property_id, generate_series(base.checkin_date::timestamp without time zone, base.checkout_date - '1 day'::interval, '1 day'::interval)::date AS stay_date, CASE WHEN base.nights > 0 THEN base.total_payout / base.nights::numeric ELSE 0::numeric END AS cents_per_night FROM base ) SELECT date_trunc('month'::text, stay_date::timestamp with time zone)::date AS month, property_id, sum(cents_per_night) AS amount FROM expanded GROUP BY (date_trunc('month'::text, stay_date::timestamp with time zone)::date), property_id ORDER BY (date_trunc('month'::text, stay_date::timestamp with time zone)::date), property_id);--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."mv_revenue_monthly" AS (SELECT month, property_id, amount FROM v_revenue_by_month_payout);--> statement-breakpoint
CREATE VIEW "public"."v_reservations_enriched" AS (SELECT r.id AS reservation_id, r.confirmation_code, r.platform, r.status, r.checkin_date, r.checkout_date, r.nights, r.checkin_month, r.checkout_month, r.adults, r.children, r.infants, r.pets, r.adults + r.children AS total_guests, g.id AS guest_id, g.full_name AS guest_name, g.profile_city AS guest_city, g.is_identity_verified AS guest_verified, p.id AS property_id, p.name AS property_name, p.address_line1, p.city AS property_city, p.state AS property_state, u.id AS unit_id, u.display_name AS unit_name, u.unit_code, l.id AS listing_id, l.title AS listing_title, l.platform_room_id, COALESCE(payout_summary.total_payout, 0::numeric) AS total_revenue, COALESCE(payout_summary.total_fees, 0::numeric) AS host_fees, COALESCE(payout_summary.net_revenue, 0::numeric) AS net_revenue, CASE WHEN r.nights > 0 THEN round(COALESCE(payout_summary.total_payout, 0::numeric) / r.nights::numeric, 2) ELSE 0::numeric END AS adr, format('Reservation %s at %s (%s, %s). Unit: %s. Guest: %s from %s. Platform: %s. Dates: %s to %s (%s nights, %s guests). Revenue: $%s (Net: $%s after $%s fees). Status: %s. ADR: $%s'::text, r.confirmation_code, COALESCE(p.name, 'Unknown Property'::text), COALESCE(p.city, 'Unknown City'::text), COALESCE(p.state, 'Unknown State'::text), COALESCE(u.display_name, u.unit_code, 'N/A'::text), COALESCE(g.full_name, 'Unknown Guest'::text), COALESCE(g.profile_city, 'Unknown'::text), r.platform, r.checkin_date::text, r.checkout_date::text, r.nights, r.adults + r.children, COALESCE(payout_summary.total_payout, 0::numeric), COALESCE(payout_summary.net_revenue, 0::numeric), COALESCE(payout_summary.total_fees, 0::numeric), r.status::text, CASE WHEN r.nights > 0 THEN round(COALESCE(payout_summary.total_payout, 0::numeric) / r.nights::numeric, 2) ELSE 0::numeric END) AS searchable_content, r.created_at, r.updated_at FROM reservations r LEFT JOIN guests g ON r.guest_id = g.id LEFT JOIN listings l ON r.listing_id = l.id LEFT JOIN units u ON l.unit_id = u.id LEFT JOIN properties p ON u.property_id = p.id LEFT JOIN ( SELECT v_payouts_canonical.reservation_id, sum(v_payouts_canonical.payout_amount) AS total_payout, sum(v_payouts_canonical.host_service_fee) AS total_fees, sum(v_payouts_canonical.payout_amount - COALESCE(v_payouts_canonical.host_service_fee, 0::numeric)) AS net_revenue FROM v_payouts_canonical GROUP BY v_payouts_canonical.reservation_id) payout_summary ON r.id = payout_summary.reservation_id);--> statement-breakpoint
CREATE VIEW "public"."v_occupancy_by_month" AS (WITH calendar AS ( SELECT generate_series(date_trunc('month'::text, min(reservations.checkin_date)::timestamp with time zone), date_trunc('month'::text, max(reservations.checkout_date)::timestamp with time zone), '1 mon'::interval)::date AS month FROM reservations ), unit_months AS ( SELECT u.id AS unit_id, u.property_id, u.display_name AS unit_name, c.month, date_part('days'::text, c.month + '1 mon'::interval - c.month::timestamp without time zone) AS days_in_month FROM units u CROSS JOIN calendar c WHERE u.is_active = true ), booked_nights AS ( SELECT l.unit_id, date_trunc('month'::text, d.day)::date AS month, count(*) AS nights_booked FROM reservations r JOIN listings l ON r.listing_id = l.id CROSS JOIN LATERAL generate_series(r.checkin_date::timestamp with time zone, (r.checkout_date - 1)::timestamp with time zone, '1 day'::interval) d(day) WHERE r.status = ANY (ARRAY['confirmed'::booking_status, 'altered'::booking_status]) GROUP BY l.unit_id, (date_trunc('month'::text, d.day)) ) SELECT um.month, um.property_id, um.unit_id, um.unit_name, um.days_in_month AS available_nights, COALESCE(bn.nights_booked, 0::bigint) AS booked_nights, round(COALESCE(bn.nights_booked, 0::bigint)::numeric / um.days_in_month::numeric * 100::numeric, 2) AS occupancy_rate FROM unit_months um LEFT JOIN booked_nights bn ON um.unit_id = bn.unit_id AND um.month = bn.month ORDER BY um.month DESC, um.property_id, um.unit_id);--> statement-breakpoint
CREATE VIEW "public"."v_metrics_by_month" AS (SELECT revenue_month AS month, property_id, sum(daily_revenue) AS total_revenue, sum(daily_net_revenue) AS net_revenue, count(*) AS occupied_nights, count(DISTINCT reservation_id) AS booking_count, round(sum(daily_revenue) / NULLIF(count(*), 0)::numeric, 2) AS adr, round(sum(daily_revenue) / NULLIF(count(DISTINCT reservation_id), 0)::numeric, 2) AS avg_booking_value, round(((sum(daily_revenue) / NULLIF(count(*), 0)::numeric)::double precision * (count(*)::numeric::double precision / date_part('days'::text, revenue_month + '1 mon'::interval - revenue_month::timestamp without time zone)))::numeric, 2) AS revpar_estimate FROM v_revenue_by_day GROUP BY revenue_month, property_id ORDER BY revenue_month DESC, property_id);--> statement-breakpoint
CREATE POLICY "Users can insert own profile" ON "profiles" AS PERMISSIVE FOR INSERT TO public WITH CHECK ((auth.uid() = id));--> statement-breakpoint
CREATE POLICY "Users can update own profile" ON "profiles" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "Users can view own profile" ON "profiles" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "Admins can delete parties" ON "buying_parties" AS PERMISSIVE FOR DELETE TO public USING ((id IN ( SELECT party_members.party_id
   FROM party_members
  WHERE ((party_members.user_id = auth.uid()) AND (party_members.role = 'admin'::member_role)))));--> statement-breakpoint
CREATE POLICY "Admins can update their parties" ON "buying_parties" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "Members can view their parties" ON "buying_parties" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "Users can create parties" ON "buying_parties" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "Admins can add members" ON "party_members" AS PERMISSIVE FOR INSERT TO public WITH CHECK ((EXISTS ( SELECT 1
   FROM party_members pm
  WHERE ((pm.party_id = pm.party_id) AND (pm.user_id = auth.uid()) AND (pm.role = 'admin'::member_role)))));--> statement-breakpoint
CREATE POLICY "Admins can remove members" ON "party_members" AS PERMISSIVE FOR DELETE TO public;--> statement-breakpoint
CREATE POLICY "Admins can update members" ON "party_members" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "Members can view own membership" ON "party_members" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "Members can view party members" ON "party_members" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "Users can add themselves via invite" ON "party_members" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "Admins can create invites" ON "party_invites" AS PERMISSIVE FOR INSERT TO public WITH CHECK ((EXISTS ( SELECT 1
   FROM party_members
  WHERE ((party_members.party_id = party_invites.party_id) AND (party_members.user_id = auth.uid()) AND (party_members.role = 'admin'::member_role)))));--> statement-breakpoint
CREATE POLICY "Admins can delete invites" ON "party_invites" AS PERMISSIVE FOR DELETE TO public;--> statement-breakpoint
CREATE POLICY "Anyone can view link invites by token" ON "party_invites" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "Members can view party invites" ON "party_invites" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "Users can accept invites" ON "party_invites" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "Allow all inserts" ON "transaction_allocations" AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "Allow service_role inserts" ON "transaction_allocations" AS PERMISSIVE FOR INSERT TO "service_role";--> statement-breakpoint
CREATE POLICY "Allow anon read for owner blocks" ON "owner_blocks" AS PERMISSIVE FOR SELECT TO "anon" USING (true);--> statement-breakpoint
CREATE POLICY "Authenticated users can read owner blocks" ON "owner_blocks" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Service role can read all owner blocks" ON "owner_blocks" AS PERMISSIVE FOR SELECT TO "service_role";--> statement-breakpoint
CREATE POLICY "Allow authenticated read" ON "expense_review_queue" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);
*/