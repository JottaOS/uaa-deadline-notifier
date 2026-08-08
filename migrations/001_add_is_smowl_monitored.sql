-- Migration: add SMOWL monitoring flag to activity table

ALTER TABLE public.activity ADD COLUMN is_smowl_monitored boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.activity.is_smowl_monitored IS 'Indica si la actividad es monitoreada por SMOWL';
