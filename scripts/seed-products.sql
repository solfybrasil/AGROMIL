-- ============================================================
--  Seed de 10 produtos REAIS por categoria (60 produtos)
--  Execute no SQL Editor do Supabase.
--  Categoria resolvida pelo slug. SKU único gerado por prefixo+índice.
--  Idempotente: não insere se já existir produto com mesmo nome na categoria.
-- ============================================================

INSERT INTO "Product" (id, name, description, "shortDesc", price, "promoPrice", "categoryId", images, stock, unit, sku, active, featured, "createdAt", "updatedAt")
SELECT
  gen_random_uuid(),
  p.name,
  p.description,
  p.shortDesc,
  p.price,
  p.promoPrice,
  c.id,
  p.images::text[],
  p.stock,
  p.unit,
  p.sku,
  true,
  p.featured,
  now(),
  now()
FROM (VALUES
  -- ───────────────────────── JARDINAGEM (JAR) ─────────────────────────
  ('jardinagem', 'Adubo Orgânico Premium 1kg', 'Adubo 100% natural compostável, rico em matéria orgânica para hortas, jardins e vasos. Melhora a estrutura do solo e a retenção de umidade.', 'Adubo orgânico para solo saudável', 24.90, NULL, 'kg', '{"https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=600"}', 120, 'JAR-01', true),
  ('jardinagem', 'Vaso de Cerâmica 30cm', 'Vaso decorativo de cerâmica esmaltada, ideal para plantas ornamentais e suculentas. Com furo para drenagem.', 'Vaso cerâmico 30cm com drenagem', 39.90, 34.90, 'unidade', '{"https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=600"}', 60, 'JAR-02', true),
  ('jardinagem', 'Tesoura de Poda Aço Inox', 'Tesoura de poda ergonômica com lâminas em aço inox forjado. Corte preciso em galhos de até 2,5cm.', 'Tesoura poda aço inox', 49.90, NULL, 'unidade', '{"https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?q=80&w=600"}', 80, 'JAR-03', false),
  ('jardinagem', 'Substrato para Plantas 5kg', 'Substrato leve e arejado, livre de pragas, com perlita e turfa. Perfeito para mudas e replantio.', 'Substrato 5kg pronto uso', 29.90, NULL, 'kg', '{"https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?q=80&w=600"}', 100, 'JAR-04', false),
  ('jardinagem', 'Mangueira de Jardim 15m', 'Mangueira flexível de 15 metros com conexões reforçadas. Resiste a pressão e intempéries.', 'Mangueira 15m reforçada', 59.90, 49.90, 'unidade', '{"https://images.unsplash.com/photo-1558904541-efa843a96f9f?q=80&w=600"}', 40, 'JAR-05', false),
  ('jardinagem', 'Kit 3 Suculentas Decorativas', 'Conjunto com 3 suculentas variadas, fáceis de cuidar. Decoram qualquer ambiente interno.', 'Kit 3 suculentas', 34.90, NULL, 'kit', '{"https://images.unsplash.com/photo-1459411552884-841db9b45ccb?q=80&w=600"}', 50, 'JAR-06', true),
  ('jardinagem', 'Fertilizante Líquido 500ml', 'Fertilizante foliar líquido concentrado, dilui em água para rega semanal. Estimula floração.', 'Fertilizante líquido 500ml', 19.90, NULL, 'ml', '{"https://images.unsplash.com/photo-1535813547-3e2a4f6d4f3f?q=80&w=600"}', 90, 'JAR-07', false),
  ('jardinagem', 'Pá de Jardinagem com Cabo', 'Pá resistente com cabo de madeira tratada e ponteira em aço carbono.', 'Pá jardim cabo madeira', 27.90, NULL, 'unidade', '{"https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=600"}', 70, 'JAR-08', false),
  ('jardinagem', 'Cobertura de Casca 10kg', 'Casca de pinus triturada para cobertura de solo, controla ervas daninhas e mantém umidade.', 'Cobertura 10kg', 22.90, NULL, 'kg', '{"https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?q=80&w=600"}', 110, 'JAR-09', false),
  ('jardinagem', 'Regador Galvanizado 5L', 'Regador metálico galvanizado de 5 litros, resistente e elegante para jardim e varanda.', 'Regador 5L galvanizado', 44.90, 39.90, 'unidade', '{"https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=600"}', 45, 'JAR-10', false),

  -- ───────────────────────── PET SHOP (PET) ─────────────────────────
  ('petshop', 'Ração Golden Cães Adultos 15kg', 'Ração premium para cães adultos, com frango e arroz. Nutrição completa e balanceada.', 'Ração cães adultos 15kg', 189.90, 169.90, 'kg', '{"https://images.unsplash.com/photo-1589924691995-400dc9ecc119?q=80&w=600"}', 60, 'PET-01', true),
  ('petshop', 'Ração Whiskas Gatos 10kg', 'Ração seca para gatos adultos, sabor peixe. Pelletes crocantes que ajudam na saúde bucal.', 'Ração gatos 10kg', 159.90, NULL, 'kg', '{"https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=600"}', 55, 'PET-02', false),
  ('petshop', 'Coleira Antiparasitária Cães', 'Coleira repelente de pulgas e carrapatos, proteção por até 8 meses. À prova d''água.', 'Coleira antipulgas cães', 39.90, NULL, 'unidade', '{"https://images.unsplash.com/photo-1601758228041-f3b2795255f1?q=80&w=600"}', 80, 'PET-03', false),
  ('petshop', 'Cama Pet Conforto M', 'Cama macia anti-alérgica tamanho M, com enchimento memory e capa removível lavável.', 'Cama pet tamanho M', 79.90, 69.90, 'unidade', '{"https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=600"}', 40, 'PET-04', false),
  ('petshop', 'Brinquedo Corda Cachorro', 'Brinquedo de algodão trançado para cães, estimula dentes e diversão. Indestrutível.', 'Brinquedo corda cão', 19.90, NULL, 'unidade', '{"https://images.unsplash.com/photo-1576201836106-db1758fd1c97?q=80&w=600"}', 100, 'PET-05', false),
  ('petshop', 'Areia Sanitária Catuja 7,2kg', 'Areia de saúde para gatos, grãos finos com poder absorvente e controle de odores.', 'Areia sanitária 7,2kg', 34.90, NULL, 'kg', '{"https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=600"}', 70, 'PET-06', true),
  ('petshop', 'Shampoo Pet Hipoalergênico 500ml', 'Shampoo neutro hipoalergênico para cães e gatos sensíveis. Higieniza sem irritar.', 'Shampoo pet 500ml', 29.90, NULL, 'ml', '{"https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=600"}', 85, 'PET-07', false),
  ('petshop', 'Comedouro Inox Duplo', 'Comedouro e bebedouro em inox duplo, antideslizante e higiênico para cães e gatos.', 'Comedouro inox duplo', 49.90, 44.90, 'unidade', '{"https://images.unsplash.com/photo-1601758228041-f3b2795255f1?q=80&w=600"}', 50, 'PET-08', false),
  ('petshop', 'Osso de Brinquedo Natural', 'Osso de couro natural para roer, limpa os dentes e evita tédio do pet.', 'Osso natural pet', 24.90, NULL, 'unidade', '{"https://images.unsplash.com/photo-1576201836106-db1758fd1c97?q=80&w=600"}', 90, 'PET-09', false),
  ('petshop', 'Tapete Higiênico 30 Un', 'Tapetes absorventes para filhotes e gatos, com indicador de umidade e leptosperm.', 'Tapete higiênico 30un', 54.90, NULL, 'pacote', '{"https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=600"}', 65, 'PET-10', false),

  -- ───────────────────────── AGROPECUÁRIA GERAL (AGR) ─────────────────────────
  ('agropecuaria', 'Sal Mineral Bovino 25kg', 'Sal mineralizado completo para bovinos de corte e leite. Suplementa minerais essenciais.', 'Sal mineral bovino 25kg', 89.90, NULL, 'kg', '{"https://images.unsplash.com/photo-1500595046743-cd271c9d7a40?q=80&w=600"}', 30, 'AGR-01', true),
  ('agropecuaria', 'Ração Poedeira 30kg', 'Ração balanceada para galinhas poedeiras, com cálcio para casca de ovo forte.', 'Ração poedeira 30kg', 119.90, 109.90, 'kg', '{"https://images.unsplash.com/photo-1548550023-2bdb3c1422e1?q=80&w=600"}', 40, 'AGR-02', false),
  ('agropecuaria', 'Milho Grão 20kg', 'Milho grão seco de alta qualidade para aves e suínos. Energia e digestibilidade.', 'Milho grão 20kg', 69.90, NULL, 'kg', '{"https://images.unsplash.com/photo-1551754655-cd27e38d2076?q=80&w=600"}', 50, 'AGR-03', false),
  ('agropecuaria', 'Vermífugo Oral 50ml', 'Vermífugo oral amplo espectro para bovinos e equinos. Controle de nematódeos.', 'Vermífugo 50ml', 45.90, NULL, 'ml', '{"https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=600"}', 60, 'AGR-04', false),
  ('agropecuaria', 'Bebedouro Galvanizado 10L', 'Bebedouro de metal galvanizado 10 litros para aves e pequenos animais. Durável.', 'Bebedouro 10L', 39.90, NULL, 'unidade', '{"https://images.unsplash.com/photo-1548550023-2bdb3c1422e1?q=80&w=600"}', 45, 'AGR-05', false),
  ('agropecuaria', 'Feno de Alfafa 1kg', 'Feno de alfafa de alta qualidade para coelhos, cavalos e roedores. Rico em proteína.', 'Feno alfafa 1kg', 18.90, NULL, 'kg', '{"https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=600"}', 80, 'AGR-06', false),
  ('agropecuaria', 'Vacina Polivalente 10 doses', 'Vacina polivalente para bovinos, proteção contra clostridioses. Aplicação veterinária.', 'Vacina polivalente 10d', 79.90, NULL, 'dose', '{"https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=600"}', 25, 'AGR-07', false),
  ('agropecuaria', 'Cerca Elétrica 100m', 'Fio de cerca elétrica 100 metros, alta condução e resistência às intempéries.', 'Cerca elétrica 100m', 99.90, 89.90, 'rolo', '{"https://images.unsplash.com/photo-1500595046743-cd271c9d7a40?q=80&w=600"}', 20, 'AGR-08', false),
  ('agropecuaria', 'Ração Equina 20kg', 'Ração concentrada para equinos adultos em manutenção. Fibra e energia equilibradas.', 'Ração equina 20kg', 109.90, NULL, 'kg', '{"https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?q=80&w=600"}', 35, 'AGR-09', false),
  ('agropecuaria', 'Pote de Ração 5kg', 'Pote plástico resistente 5kg para ração de aves e pequenos animais. Tampa hermética.', 'Pote ração 5kg', 29.90, NULL, 'unidade', '{"https://images.unsplash.com/photo-1548550023-2bdb3c1422e1?q=80&w=600"}', 55, 'AGR-10', false),

  -- ───────────────────────── FERRAMENTAS (FER) ─────────────────────────
  ('ferramentas', 'Furadeira de Impacto 550W', 'Furadeira de impacto 550W com empunhadura emborrachada e mandril keyless 13mm.', 'Furadeira impacto 550W', 199.90, 179.90, 'unidade', '{"https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=600"}', 25, 'FER-01', true),
  ('ferramentas', 'Jogo de Chaves Phillips 6pcs', 'Conjunto com 6 chaves de fenda Phillips e planas, aço cromo vanádio temperado.', 'Chaves 6pcs', 39.90, NULL, 'kit', '{"https://images.unsplash.com/photo-1530124566582-a618bc2615dc?q=80&w=600"}', 70, 'FER-02', false),
  ('ferramentas', 'Serra Circular 1200W', 'Serra circular elétrica 1200W, corte preciso em madeira até 55mm. Guia lateral.', 'Serra circular 1200W', 289.90, 259.90, 'unidade', '{"https://images.unsplash.com/photo-1572981779307-38b8cabb2407?q=80&w=600"}', 15, 'FER-03', false),
  ('ferramentas', 'Alicate Universal 8"', 'Alicate universal 8 polegadas, corte diagonal e aperto. Cabo ergonômico isolado.', 'Alicate 8 polegadas', 24.90, NULL, 'unidade', '{"https://images.unsplash.com/photo-1530124566582-a618bc2615dc?q=80&w=600"}', 90, 'FER-04', false),
  ('ferramentas', 'Lixadeira Orbital 120V', 'Lixadeira orbital 120V, base 125mm, coletor de poeira. Acabamento profissional.', 'Lixadeira orbital', 159.90, NULL, 'unidade', '{"https://images.unsplash.com/photo-1572981779307-38b8cabb2407?q=80&w=600"}', 20, 'FER-05', false),
  ('ferramentas', 'Martelo de Unha 500g', 'Martelo de unha 500g com cabo de fibra de vidro e empunhadura antiderrapante.', 'Martelo 500g', 29.90, 24.90, 'unidade', '{"https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=600"}', 85, 'FER-06', false),
  ('ferramentas', 'Furadeira Parafusadeira 12V', 'Furadeira a bateria 12V com 2 baterias e carregador. Leve e prática.', 'Furadeira 12V bateria', 249.90, NULL, 'kit', '{"https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=600"}', 18, 'FER-07', true),
  ('ferramentas', 'Nível Laser 3 Linhas', 'Nível a laser 3 linhas, alcance 15m, autonivelante. Precisão para obras.', 'Nível laser', 199.90, 179.90, 'unidade', '{"https://images.unsplash.com/photo-1530124566582-a618bc2615dc?q=80&w=600"}', 22, 'FER-08', false),
  ('ferramentas', 'Serrote Manual 22"', 'Serrote podão 22 polegadas, lâmina endurecida para corte rápido de madeira.', 'Serrote 22 polegadas', 54.90, NULL, 'unidade', '{"https://images.unsplash.com/photo-1572981779307-38b8cabb2407?q=80&w=600"}', 40, 'FER-09', false),
  ('ferramentas', 'Kit Ferramentas 110pcs', 'Maleta completa com 110 peças: chaves, soquetes, bits e alicate. Para oficina.', 'Kit 110 peças', 299.90, 269.90, 'kit', '{"https://images.unsplash.com/photo-1530124566582-a618bc2615dc?q=80&w=600"}', 12, 'FER-10', false),

  -- ───────────────────────── IRRIGAÇÃO (IRI) ─────────────────────────
  ('irrigacao', 'Gotejador de Pressão Compensada', 'Gotejador de 2L/h pressão compensada, vazão uniforme em declives. Pack 10.', 'Gotejador 2L/h pack10', 19.90, NULL, 'pack', '{"https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=600"}', 100, 'IRI-01', false),
  ('irrigacao', 'Mangueira Gotejadora 30m', 'Mangueira porosa de 30m para gotejamento em horta e canteiro. Economia de água.', 'Mangueira gotejadora 30m', 89.90, 79.90, 'unidade', '{"https://images.unsplash.com/photo-1558904541-efa843a96f9f?q=80&w=600"}', 30, 'IRI-02', true),
  ('irrigacao', 'Asperador de Jardim 360°', 'Asperador rotativo 360 graus, alcance até 8m. Cobertura uniforme do gramado.', 'Asperador 360', 34.90, NULL, 'unidade', '{"https://images.unsplash.com/photo-1558904541-efa843a96f9f?q=80&w=600"}', 60, 'IRI-03', false),
  ('irrigacao', 'Conector Rápido 1/2"', 'Conector rápido para mangueira 1/2 polegada, encaixe sem rosquear. Pack 5.', 'Conector 1/2 pack5', 14.90, NULL, 'pack', '{"https://images.unsplash.com/photo-1558904541-efa843a96f9f?q=80&w=600"}', 120, 'IRI-04', false),
  ('irrigacao', 'Reservatório de Água 500L', 'Caixa d''água polietileno 500 litros, resistente a raios UV. Para reuso.', 'Caixa 500L', 349.90, 319.90, 'unidade', '{"https://images.unsplash.com/photo-1558904541-efa843a96f9f?q=80&w=600"}', 10, 'IRI-05', false),
  ('irrigacao', 'Timer de Rega Digital', 'Timer programável para mangueira, rega automática em horários definidos. Bateria.', 'Timer rega digital', 79.90, NULL, 'unidade', '{"https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=600"}', 35, 'IRI-06', false),
  ('irrigacao', 'Tubo de PVC 20mm 3m', 'Tubo PVC rígido 20mm, trecho de 3m para redes de irrigação enterrada.', 'Tubo PVC 20mm 3m', 24.90, NULL, 'unidade', '{"https://images.unsplash.com/photo-1558904541-efa843a96f9f?q=80&w=600"}', 70, 'IRI-07', false),
  ('irrigacao', 'Registro de Gaveta 3/4"', 'Registro de gaveta 3/4 polegada em bronze, controle de fluxo de água.', 'Registro 3/4', 29.90, 25.90, 'unidade', '{"https://images.unsplash.com/photo-1558904541-efa843a96f9f?q=80&w=600"}', 50, 'IRI-08', false),
  ('irrigacao', 'Microaspersor Pack 20', 'Microaspersores ajustáveis pack 20, ideal para hortas e estufas.', 'Microaspersor pack20', 22.90, NULL, 'pack', '{"https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=600"}', 80, 'IRI-09', false),
  ('irrigacao', 'Bomba de Água 1/2 CV', 'Bomba centrífuga 1/2 CV para poço e cisterna, pressurização de irrigação.', 'Bomba 1/2 CV', 399.90, 369.90, 'unidade', '{"https://images.unsplash.com/photo-1558904541-efa843a96f9f?q=80&w=600"}', 8, 'IRI-10', false),

  -- ───────────────────────── VESTUÁRIO & EPI (EPI) ─────────────────────────
  ('vestuario-epi', 'Bota de Segurança NR 35', 'Bota de segurança com biqueira de aço, solado antitimpacto e antiderrapante. NR 35.', 'Bota segurança NR35', 159.90, 139.90, 'par', '{"https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600"}', 40, 'EPI-01', true),
  ('vestuario-epi', 'Luvas de Couro Rústica', 'Luvas de raspa de couro para manuseio de ferramentas e roçada. Resistentes.', 'Luvas couro', 24.90, NULL, 'par', '{"https://images.unsplash.com/photo-1595079676339-1534801ad6cf?q=80&w=600"}', 90, 'EPI-02', false),
  ('vestuario-epi', 'Capacete de Segurança', 'Capacete de proteção tipo aba, encaixe regulável. Absorve impactos. NR 6.', 'Capacete segurança', 39.90, NULL, 'unidade', '{"https://images.unsplash.com/photo-1595079676339-1534801ad6cf?q=80&w=600"}', 60, 'EPI-03', false),
  ('vestuario-epi', 'Máscara Respiratória PFF2', 'Máscara PFF2 descartável, filtra poeira e partículas. Caixa com 20 un.', 'Máscara PFF2 20un', 49.90, 44.90, 'caixa', '{"https://images.unsplash.com/photo-1595079676339-1534801ad6cf?q=80&w=600"}', 70, 'EPI-04', false),
  ('vestuario-epi', 'Capa de Chuva Impermeável', 'Capa de chuva impermeável de PVC, mangas e capuz. Tamanho único.', 'Capa chuva PVC', 34.90, NULL, 'unidade', '{"https://images.unsplash.com/photo-1595079676339-1534801ad6cf?q=80&w=600"}', 55, 'EPI-05', false),
  ('vestuario-epi', 'Óculos de Proteção', 'Óculos de segurança incolor com hastes ajustáveis. Antiembaçante. NR 10.', 'Óculos proteção', 19.90, NULL, 'unidade', '{"https://images.unsplash.com/photo-1595079676339-1534801ad6cf?q=80&w=600"}', 100, 'EPI-06', false),
  ('vestuario-epi', 'Camiseta de Algodão Agromil', 'Camiseta manga curta 100% algodão com estampa Agromil. Confortável no campo.', 'Camiseta Agromil', 44.90, 39.90, 'unidade', '{"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=600"}', 80, 'EPI-07', true),
  ('vestuario-epi', 'Protetor Auricular NRR25', 'Abafadores de ruído NRR 25dB, confortáveis para uso prolongado em máquinas.', 'Protetor auricular', 29.90, NULL, 'par', '{"https://images.unsplash.com/photo-1595079676339-1534801ad6cf?q=80&w=600"}', 65, 'EPI-08', false),
  ('vestuario-epi', 'Cinto de Utilidades', 'Cinto estofado com ilhós e bolsos para ferramentas e EPIs. Couro sintético.', 'Cinto utilidades', 39.90, NULL, 'unidade', '{"https://images.unsplash.com/photo-1595079676339-1534801ad6cf?q=80&w=600"}', 45, 'EPI-09', false),
  ('vestuario-epi', 'Botina de Borracha 39', 'Botina de borracha natural forrada, impermeável para campo e lavoura. Tamanho 39.', 'Botina borracha 39', 69.90, 59.90, 'par', '{"https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600"}', 50, 'EPI-10', false)
) AS p(slug, name, description, shortDesc, price, promoPrice, unit, images, stock, sku, featured)
JOIN "Category" c ON c.slug = p.slug
WHERE NOT EXISTS (
  SELECT 1 FROM "Product" pr WHERE pr."categoryId" = c.id AND pr.name = p.name
);
