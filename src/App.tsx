import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MobileBottomNav from '@/components/MobileBottomNav';
import Home from '@/app/page';
import BuscaPage from '@/app/busca/page';
import CategoryPage from '@/app/categoria/[slug]/page';
import ProductDetailPage from '@/app/produto/[id]/page';
import CarrinhoPage from '@/app/carrinho/page';
import CheckoutPage from '@/app/checkout/page';
import LoginPage from '@/app/login/page';
import CadastroPage from '@/app/cadastro/page';
import FavoritosPage from '@/app/favoritos/page';
import PedidosPage from '@/app/pedidos/page';
import PedidoDetailPage from '@/app/pedidos/[id]/page';
import ConfirmacaoPedidoPage from '@/app/pedido/[id]/confirmacao/page';
import SobrePage from '@/app/sobre/page';
import ContatoPage from '@/app/contato/page';

// Minha Conta
import MinhaContaLayout from '@/app/minha-conta/layout';
import MinhaContaPage from '@/app/minha-conta/page';
import PerfilPage from '@/app/minha-conta/perfil/page';
import EnderecosPage from '@/app/minha-conta/enderecos/page';
import MinhaContaPedidosPage from '@/app/minha-conta/pedidos/page';
import MinhaContaPedidoDetailPage from '@/app/minha-conta/pedidos/[id]/page';

// Admin
import AdminLayout from '@/app/admin/layout';
import AdminDashboardPage from '@/app/admin/page';
import AdminProdutosPage from '@/app/admin/produtos/page';
import AdminNovoProdutoPage from '@/app/admin/produtos/novo/page';
import AdminEditarProdutoPage from '@/app/admin/produtos/[id]/editar/page';
import AdminPedidosPage from '@/app/admin/pedidos/page';
import AdminPedidoDetailPage from '@/app/admin/pedidos/[id]/page';
import AdminHeroPage from '@/app/admin/hero/page';
import AdminBannersPage from '@/app/admin/banners/page';
import AdminRelatoriosPage from '@/app/admin/relatorios/page';
import AdminCategoriasPage from '@/app/admin/categorias/page';
import AdminCuponsPage from '@/app/admin/cupons/page';
import AdminAvaliacoesPage from '@/app/admin/avaliacoes/page';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex-1 flex flex-col min-h-screen pb-mobile-nav md:pb-0">
        <Routes>
          {/* Main Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/busca" element={<BuscaPage />} />
          <Route path="/categoria/:slug" element={<CategoryPage />} />
          <Route path="/produto/:id" element={<ProductDetailPage />} />
          <Route path="/carrinho" element={<CarrinhoPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cadastro" element={<CadastroPage />} />
          <Route path="/favoritos" element={<FavoritosPage />} />
          <Route path="/pedidos" element={<PedidosPage />} />
          <Route path="/pedidos/:id" element={<PedidoDetailPage />} />
          <Route path="/pedido/:id/confirmacao" element={<ConfirmacaoPedidoPage />} />
          <Route path="/sobre" element={<SobrePage />} />
          <Route path="/contato" element={<ContatoPage />} />

          {/* Minha Conta Nested Routes */}
          <Route path="/minha-conta" element={<MinhaContaLayout><MinhaContaPage /></MinhaContaLayout>} />
          <Route path="/minha-conta/perfil" element={<MinhaContaLayout><PerfilPage /></MinhaContaLayout>} />
          <Route path="/minha-conta/enderecos" element={<MinhaContaLayout><EnderecosPage /></MinhaContaLayout>} />
          <Route path="/minha-conta/pedidos" element={<MinhaContaLayout><MinhaContaPedidosPage /></MinhaContaLayout>} />
          <Route path="/minha-conta/pedidos/:id" element={<MinhaContaLayout><MinhaContaPedidoDetailPage /></MinhaContaLayout>} />

          {/* Admin Nested Routes */}
          <Route path="/admin" element={<AdminLayout><AdminDashboardPage /></AdminLayout>} />
          <Route path="/admin/relatorios" element={<AdminLayout><AdminRelatoriosPage /></AdminLayout>} />
          <Route path="/admin/produtos" element={<AdminLayout><AdminProdutosPage /></AdminLayout>} />
          <Route path="/admin/produtos/novo" element={<AdminLayout><AdminNovoProdutoPage /></AdminLayout>} />
          <Route path="/admin/produtos/:id/editar" element={<AdminLayout><AdminEditarProdutoPage /></AdminLayout>} />
          <Route path="/admin/categorias" element={<AdminLayout><AdminCategoriasPage /></AdminLayout>} />
          <Route path="/admin/pedidos" element={<AdminLayout><AdminPedidosPage /></AdminLayout>} />
          <Route path="/admin/pedidos/:id" element={<AdminLayout><AdminPedidoDetailPage /></AdminLayout>} />
          <Route path="/admin/hero" element={<AdminLayout><AdminHeroPage /></AdminLayout>} />
          <Route path="/admin/banners" element={<AdminLayout><AdminBannersPage /></AdminLayout>} />
          <Route path="/admin/cupons" element={<AdminLayout><AdminCuponsPage /></AdminLayout>} />
          <Route path="/admin/avaliacoes" element={<AdminLayout><AdminAvaliacoesPage /></AdminLayout>} />

          {/* Fallback Catch-all Route */}
          <Route path="*" element={<Home />} />
        </Routes>
        <MobileBottomNav />
      </div>
    </BrowserRouter>
  );
}
