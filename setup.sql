CREATE TABLE public.messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  relationship text,
  date text NOT NULL,
  text text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ativar segurança
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Permitir que qualquer pessoa aceda e leia as mensagens do mural
CREATE POLICY "Mensagens visíveis para todos" ON public.messages FOR SELECT USING (true);

-- Permitir que qualquer pessoa deixe uma mensagem no mural
CREATE POLICY "Qualquer um pode inserir mensagens" ON public.messages FOR INSERT WITH CHECK (true);
