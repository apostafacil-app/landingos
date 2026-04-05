-- ============================================================
-- Migration: infraestrutura de geração por IA
-- Cria colunas de créditos, função consume_ai_credit,
-- tabela security_events (se não existir)
-- ============================================================

-- 1. Garantir colunas de créditos na tabela workspaces
ALTER TABLE public.workspaces
  ADD COLUMN IF NOT EXISTS ai_credits_limit integer NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS ai_credits_used  integer NOT NULL DEFAULT 0;

-- 2. Função atômica de consumo de crédito
--    Retorna true = OK, false = sem crédito
CREATE OR REPLACE FUNCTION consume_ai_credit(p_workspace_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_updated integer;
BEGIN
  UPDATE public.workspaces
  SET ai_credits_used = ai_credits_used + 1
  WHERE id = p_workspace_id
    AND ai_credits_used < ai_credits_limit
    AND status = 'active';

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated > 0;
END;
$$;

-- 3. Tabela de eventos de auditoria (security_events)
CREATE TABLE IF NOT EXISTS public.security_events (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE,
  event        text NOT NULL,
  resource     text,
  action       text,
  result       text,
  metadata     jsonb,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- RLS: apenas inserção autenticada (append-only)
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sec_events: autenticado pode inserir" ON public.security_events;
CREATE POLICY "sec_events: autenticado pode inserir"
  ON public.security_events FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
