-- ========================================================
-- SEED CATEGORIES ONLY (CARGA DE CATEGORIAS FIXAS)
-- ========================================================

INSERT INTO "Category" ("id", "name", "slug", "imageUrl", "displayOrder", "createdAt", "updatedAt")
VALUES
  ('cat-jardinagem', 'Jardinagem & Vasos', 'jardinagem', 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=600', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-petshop', 'Rações & Acessórios Pet', 'petshop', 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=600', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-agropecuaria', 'Agropecuária Geral', 'agropecuaria', 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=600', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-ferramentas', 'Ferramentas & Equipamentos', 'ferramentas', 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?q=80&w=600', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-irrigacao', 'Irrigação', 'irrigacao', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=600', 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-vestuario-epi', 'Vestuário & EPI', 'vestuario-epi', 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?q=80&w=600', 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO UPDATE SET
  "name" = EXCLUDED."name",
  "slug" = EXCLUDED."slug",
  "imageUrl" = EXCLUDED."imageUrl",
  "displayOrder" = EXCLUDED."displayOrder",
  "updatedAt" = CURRENT_TIMESTAMP;
