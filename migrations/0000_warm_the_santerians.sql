CREATE TYPE "public"."event_status" AS ENUM('draft', 'published', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('super_admin', 'admin', 'editor');--> statement-breakpoint
CREATE TABLE "activity_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"action" varchar NOT NULL,
	"entity_type" varchar,
	"entity_id" integer,
	"details" jsonb,
	"ip_address" varchar,
	"nursery_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"nursery_location" text NOT NULL,
	"message" text NOT NULL,
	"ip_address" text,
	"submission_time" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"description" text NOT NULL,
	"location" varchar NOT NULL,
	"date" varchar NOT NULL,
	"time" varchar NOT NULL,
	"duration" varchar,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"all_day" boolean DEFAULT false,
	"status" "event_status" DEFAULT 'draft' NOT NULL,
	"capacity" integer,
	"registrations" integer DEFAULT 0,
	"organizer" varchar,
	"nursery_id" integer NOT NULL,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gallery_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gallery_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"filename" varchar NOT NULL,
	"nursery_id" integer NOT NULL,
	"category_id" integer,
	"uploaded_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invitations" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar NOT NULL,
	"role" "role" NOT NULL,
	"nursery_id" integer,
	"token" varchar NOT NULL,
	"invited_by" integer NOT NULL,
	"accepted" boolean DEFAULT false,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invitations_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "media_library" (
	"id" serial PRIMARY KEY NOT NULL,
	"file_name" varchar NOT NULL,
	"file_url" varchar NOT NULL,
	"file_type" varchar NOT NULL,
	"file_size" integer NOT NULL,
	"nursery_id" integer NOT NULL,
	"uploaded_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "newsletters" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"filename" varchar NOT NULL,
	"file" varchar,
	"thumbnail_url" varchar,
	"month" varchar NOT NULL,
	"year" integer NOT NULL,
	"nursery_id" integer NOT NULL,
	"author_id" integer NOT NULL,
	"status" varchar DEFAULT 'published' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nurseries" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"location" varchar NOT NULL,
	"address" varchar NOT NULL,
	"phone_number" varchar NOT NULL,
	"email" varchar NOT NULL,
	"description" text NOT NULL,
	"opening_hours" jsonb NOT NULL,
	"hero_image" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "nurseries_location_unique" UNIQUE("location")
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"slug" varchar NOT NULL,
	"content" text NOT NULL,
	"excerpt" text,
	"featured_image" varchar,
	"nursery_id" integer NOT NULL,
	"author_id" integer NOT NULL,
	"status" varchar DEFAULT 'draft' NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_nurseries" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"nursery_id" integer NOT NULL,
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	"assigned_by" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar NOT NULL,
	"password" varchar,
	"first_name" varchar NOT NULL,
	"last_name" varchar NOT NULL,
	"role" "role" DEFAULT 'editor' NOT NULL,
	"nursery_id" integer,
	"profile_image_url" varchar,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "user_nurseries" ADD CONSTRAINT "user_nurseries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_nurseries" ADD CONSTRAINT "user_nurseries_nursery_id_nurseries_id_fk" FOREIGN KEY ("nursery_id") REFERENCES "public"."nurseries"("id") ON DELETE cascade ON UPDATE no action;