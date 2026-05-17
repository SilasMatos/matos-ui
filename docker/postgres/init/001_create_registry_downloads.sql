CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS registry_download_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  component_name text NOT NULL,
  registry_path text NOT NULL,
  registry_item_type text NOT NULL DEFAULT 'component',
  package_manager text,
  cli_name text,
  registry_version text,
  source text NOT NULL DEFAULT 'registry',
  referer text,
  user_agent text,
  ip_hash text,
  country_code char(2),
  country_name text,
  region text,
  city text,
  edge_region text,
  request_id text,
  downloaded_at timestamptz NOT NULL DEFAULT now(),
  download_date date NOT NULL DEFAULT CURRENT_DATE,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT registry_download_events_component_name_check
    CHECK (component_name ~ '^[a-z0-9][a-z0-9-]*$'),
  CONSTRAINT registry_download_events_country_code_check
    CHECK (country_code IS NULL OR country_code ~ '^[A-Z]{2}$')
);

CREATE INDEX IF NOT EXISTS registry_download_events_component_date_idx
  ON registry_download_events (component_name, download_date DESC);

CREATE INDEX IF NOT EXISTS registry_download_events_downloaded_at_idx
  ON registry_download_events (downloaded_at DESC);

CREATE INDEX IF NOT EXISTS registry_download_events_country_idx
  ON registry_download_events (country_code, country_name);

CREATE INDEX IF NOT EXISTS registry_download_events_ip_hash_idx
  ON registry_download_events (ip_hash)
  WHERE ip_hash IS NOT NULL;

CREATE INDEX IF NOT EXISTS registry_download_events_metadata_idx
  ON registry_download_events USING gin (metadata);

CREATE OR REPLACE VIEW registry_download_component_stats AS
SELECT
  component_name,
  count(*)::bigint AS total_downloads,
  count(
    DISTINCT CASE
      WHEN ip_hash IS NULL THEN NULL
      ELSE concat_ws('|', ip_hash, coalesce(user_agent, ''), download_date::text)
    END
  )::bigint AS unique_daily_downloads,
  min(downloaded_at) AS first_downloaded_at,
  max(downloaded_at) AS last_downloaded_at
FROM registry_download_events
GROUP BY component_name;

CREATE OR REPLACE VIEW registry_download_country_stats AS
SELECT
  coalesce(country_code, 'ZZ') AS country_code,
  coalesce(country_name, 'Unknown') AS country_name,
  count(*)::bigint AS total_downloads,
  count(
    DISTINCT CASE
      WHEN ip_hash IS NULL THEN NULL
      ELSE concat_ws('|', ip_hash, coalesce(user_agent, ''), download_date::text)
    END
  )::bigint AS unique_daily_downloads,
  max(downloaded_at) AS last_downloaded_at
FROM registry_download_events
GROUP BY coalesce(country_code, 'ZZ'), coalesce(country_name, 'Unknown');

CREATE OR REPLACE VIEW registry_download_daily_stats AS
SELECT
  download_date,
  component_name,
  count(*)::bigint AS total_downloads,
  count(
    DISTINCT CASE
      WHEN ip_hash IS NULL THEN NULL
      ELSE concat_ws('|', ip_hash, coalesce(user_agent, ''), download_date::text)
    END
  )::bigint AS unique_daily_downloads
FROM registry_download_events
GROUP BY download_date, component_name;

COMMENT ON TABLE registry_download_events IS
  'Raw download events for Matos UI registry items.';

COMMENT ON COLUMN registry_download_events.ip_hash IS
  'Hash of the requester IP. Do not store raw IP addresses here.';

COMMENT ON VIEW registry_download_country_stats IS
  'Aggregated downloads by country. Order by total_downloads DESC to find the top country.';
