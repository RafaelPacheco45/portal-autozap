const LOGO_SRC = "autozap-logo.png";
const BANNER_SRC = "banner.png";
const API_BASE_URL = "https://aip.autozap.log.br";
const DEBUG_API = localStorage.getItem("DEBUG_API") === "1";
const USE_MOCK = false;

// STORAGE HELPERS
const STORAGE_SESSION = "autozap_supplier_session";
const STORAGE_TOKEN = "autozap_token";
const LEGACY_TOKEN_KEYS = ["autozap_supplier_token", "token", "authToken", "accessToken", "autozapToken"];
const STORAGE_PRODUCTS = "autozap_supplier_products";
const STORAGE_POSTS = "autozap_supplier_posts";
const STORAGE_HELP = "autozap_supplier_help_requests";
const STORAGE_SUPPLIERS = "autozap_admin_suppliers";

const app = document.querySelector("#app");
let adminTab = "overview";
let productFilters = { search: "", category: "all", status: "all", lowStock: false };
let supplierDataLoaded = false;
let supplierQuotas = null;
let adminDataLoaded = false;
let adminLoading = false;
let adminError = "";

// Development-only mock data. Production keeps USE_MOCK false and loads real API data.
const supplierUser = {
  id: "",
  role: "supplier",
  name: "",
  legalName: "",
  email: "",
  cnpj: "",
  address: "",
  pixKey: "",
  bank: "",
  paymentIdentity: "",
  responsible: "",
  phone: "",
  plan: { name: "", monthlyPosts: 0, usedPosts: 0 },
  status: ""
};

const adminUser = {
  id: "admin-001",
  role: "admin",
  name: "Central Administrativa AutoZap",
  email: "admin@autozap.com"
};

const defaultProducts = [
  { id: "p1", supplierId: "supplier-001", supplier: "Distribuidora Alpha", name: "Pelicula 3D iPhone 13", category: "Acessorios", description: "Vidro 3D com aplicacao rapida para vitrine premium.", price: 25, stock: 30, status: "active", updatedAt: "2026-05-20T15:33" },
  { id: "p2", supplierId: "supplier-001", supplier: "Distribuidora Alpha", name: "Carregador Turbo USB-C 30W", category: "Carregadores", description: "Carregador rapido com embalagem para revenda.", price: 59.9, stock: 12, status: "active", updatedAt: "2026-05-21T09:10" },
  { id: "p3", supplierId: "supplier-001", supplier: "Distribuidora Alpha", name: "Cabo Lightning Reforcado", category: "Cabos", description: "Cabo com malha reforcada e ponta metalica.", price: 39.9, stock: 0, status: "out_of_stock", updatedAt: "2026-05-19T17:45" },
  { id: "p4", supplierId: "supplier-001", supplier: "Distribuidora Alpha", name: "Capinha Transparente Samsung A15", category: "Capinhas", description: "Capinha antimpacto com acabamento cristal.", price: 29.9, stock: 18, status: "active", updatedAt: "2026-05-18T11:24" },
  { id: "p5", supplierId: "supplier-002", supplier: "MegaCell Atacado", name: "Suporte Veicular Magnetico", category: "Acessorios", description: "Suporte magnetico para painel e saida de ar.", price: 44.9, stock: 8, status: "active", updatedAt: "2026-05-20T14:20" }
];

const defaultPosts = [
  { id: "post-1", supplierId: "supplier-001", supplier: "Distribuidora Alpha", campaign: "Promocao de carregadores turbo", type: "Imagem", fileName: "promocao-carregadores.png", desiredDate: "2026-05-21", desiredTime: "14:00", scheduledAt: "2026-05-21T14:00", status: "scheduled", plan: "Plano Pro", notes: "Priorizar chamada de oferta para lojistas." },
  { id: "post-2", supplierId: "supplier-001", supplier: "Distribuidora Alpha", campaign: "Semana das peliculas 3D", type: "Imagem", fileName: "banner-peliculas.png", desiredDate: "2026-05-22", desiredTime: "10:30", scheduledAt: "2026-05-22T10:30", status: "review", plan: "Plano Pro", notes: "Campanha em analise pela equipe AutoZap." },
  { id: "post-3", supplierId: "supplier-002", supplier: "MegaCell Atacado", campaign: "Linha premium de suportes", type: "Video", fileName: "suportes-premium.mp4", desiredDate: "2026-05-23", desiredTime: "16:00", scheduledAt: "2026-05-23T16:00", status: "needs_adjustment", plan: "Plano Pro", notes: "Ajustar legenda antes da publicacao." }
];

const defaultSuppliers = [
  { id: "supplier-001", role: "supplier", name: "Distribuidora Alpha", legalName: "Distribuidora Alpha Tecnologia LTDA", email: "fornecedor@autozap.com", cnpj: "00.000.000/0001-00", address: "Rua Exemplo, 123 - Sao Paulo/SP", pixKey: "financeiro@distribuidoraalpha.com", bank: "Banco AutoZap - Ag. 0001 / Cc. 12345-6", paymentIdentity: "ID-AZPAY-ALPHA-001", responsible: "Carlos Almeida", phone: "(11) 99999-9999", planName: "Plano Pro", monthlyPosts: 20, usedPosts: 8, remainingPosts: 12, activeProducts: 4, status: "active", verified: true },
  { id: "supplier-002", role: "supplier", name: "MegaCell Atacado", legalName: "MegaCell Atacado LTDA", email: "contato@megacell.com", cnpj: "11.111.111/0001-11", address: "Av. Central, 880 - Campinas/SP", pixKey: "pix@megacell.com", bank: "Banco 341 - Ag. 3321 / Cc. 9911-0", paymentIdentity: "ID-AZPAY-MEGA-002", responsible: "Marina Costa", phone: "(19) 98888-1111", planName: "Plano Pro", monthlyPosts: 40, usedPosts: 10, remainingPosts: 30, activeProducts: 85, status: "active" },
  { id: "supplier-003", role: "supplier", name: "Fornecedor Beta", legalName: "Fornecedor Beta Comercio LTDA", email: "beta@fornecedor.com", cnpj: "22.222.222/0001-22", address: "Rua Norte, 45 - Curitiba/PR", pixKey: "beta@pix.com", bank: "Banco 001 - Ag. 1010 / Cc. 4040-1", paymentIdentity: "ID-AZPAY-BETA-003", responsible: "Rafael Lima", phone: "(41) 97777-2222", planName: "Plano Basico", monthlyPosts: 10, usedPosts: 7, remainingPosts: 3, activeProducts: 19, status: "pending" }
];

const defaultHelpRequests = [
  { id: "h1", supplierId: "supplier-001", supplier: "Distribuidora Alpha", type: "Alteracao de dados protegidos", description: "Solicitacao para revisar chave Pix cadastrada.", date: "2026-05-20", status: "Aberta" },
  { id: "h2", supplierId: "supplier-002", supplier: "MegaCell Atacado", type: "Criacao de arte profissional", description: "Campanha de lancamento para linha de suportes.", date: "2026-05-19", status: "Em andamento" },
  { id: "h3", supplierId: "supplier-003", supplier: "Fornecedor Beta", type: "Duvidas de publicacao", description: "Validar melhores horarios para AutoBook.", date: "2026-05-18", status: "Aberta" }
];

let products = USE_MOCK ? loadFromStorage(STORAGE_PRODUCTS, defaultProducts) : [];
let posts = USE_MOCK ? loadFromStorage(STORAGE_POSTS, defaultPosts) : [];
let suppliers = USE_MOCK ? loadFromStorage(STORAGE_SUPPLIERS, defaultSuppliers) : [];
let helpRequests = USE_MOCK ? loadFromStorage(STORAGE_HELP, defaultHelpRequests) : [];

function loadFromStorage(key, fallback) {
  const value = localStorage.getItem(key);
  if (!value) return structuredClone(fallback);
  try {
    return JSON.parse(value);
  } catch {
    return structuredClone(fallback);
  }
}

function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function session() {
  return loadFromStorage(STORAGE_SESSION, null);
}

function authToken() {
  const current = localStorage.getItem(STORAGE_TOKEN);
  if (current) return current;
  for (const key of LEGACY_TOKEN_KEYS) {
    const legacy = localStorage.getItem(key);
    if (legacy) {
      localStorage.setItem(STORAGE_TOKEN, legacy);
      return legacy;
    }
  }
  const sessionToken = session()?.token;
  if (sessionToken) {
    localStorage.setItem(STORAGE_TOKEN, sessionToken);
    return sessionToken;
  }
  return "";
}

function clearAuthState() {
  localStorage.removeItem(STORAGE_SESSION);
  localStorage.removeItem(STORAGE_TOKEN);
  LEGACY_TOKEN_KEYS.forEach((key) => localStorage.removeItem(key));
  supplierDataLoaded = false;
  adminDataLoaded = false;
  adminError = "";
}

function setSession(user, token = "") {
  saveToStorage(STORAGE_SESSION, { ...user });
  if (token) localStorage.setItem(STORAGE_TOKEN, token);
}

function logout() {
  clearAuthState();
  navigate("#/login");
}

function navigate(route) {
  location.hash = route;
}

// FORMATTING HELPERS
function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(`${value}T12:00:00`));
}

function formatDateTime(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

function latestDate(rows) {
  const dates = rows.map((item) => new Date(item.updatedAt || item.scheduledAt || 0).getTime()).filter(Boolean);
  if (!dates.length) return "Hoje";
  return formatDateTime(new Date(Math.max(...dates)).toISOString());
}

function statusLabel(status) {
  const labels = {
    active: "Ativo",
    paused: "Pausado",
    out_of_stock: "Sem estoque",
    scheduled: "Agendada",
    published: "Publicada",
    review: "Em analise",
    rejected: "Rejeitada",
    pending: "Pendente",
    needs_adjustment: "Precisa de ajuste",
    start_visible: "Disponivel",
    start_hidden: "Oculto"
  };
  return labels[status] || status;
}

function showToast(message, type = "success") {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.className = "toast";
  }, 3200);
}

// API CLIENT
function unwrapApiPayload(payload) {
  if (payload && typeof payload === "object" && "data" in payload) return payload.data;
  return payload;
}

function normalizeApiError(payload, fallback) {
  const code = payload?.message || payload?.error || payload?.code;
  const messages = {
    invalid_login: "E-mail ou senha invalidos. Confira os dados e tente novamente.",
    cors_origin_denied: "Origem bloqueada pela API. Abra o portal pelo servidor local ou libere o dominio no backend."
  };
  return messages[code] || code || fallback;
}

function isProtectedPath(path) {
  return path.startsWith("/admin/") || path.startsWith("/supplier/") || path.startsWith("/start/") || path === "/app/bootstrap";
}

function debugApi(path, url, status, hasToken) {
  if (!DEBUG_API) return;
  console.info("[AutoZap API]", { endpoint: path, url, status, hasToken, role: session()?.role || "" });
}

function extractToken(payload) {
  const data = unwrapApiPayload(payload) || {};
  return data.token || data.accessToken || data.jwt || data.sessionToken || data.auth?.token || data.session?.token || "";
}

function extractLoginUser(payload) {
  const data = unwrapApiPayload(payload) || {};
  return data.user || data.account || data.supplier || data.admin || data.profile || (data.role ? data : {});
}

function normalizeLoginUser(raw = {}, fallbackEmail = "") {
  const role = raw.role || raw.userRole || raw.accountRole || raw.type || (raw.isAdmin ? "admin" : "supplier");
  return {
    ...raw,
    id: raw.id || raw._id || raw.userId || raw.supplierId || fallbackEmail,
    role,
    name: raw.name || raw.companyName || raw.email || fallbackEmail,
    email: raw.email || fallbackEmail
  };
}

function normalizeSupplier(raw = {}) {
  const supplier = unwrapApiPayload(raw) || {};
  const plan = supplier.plan || {};
  return {
    ...supplierUser,
    ...supplier,
    id: supplier.id || supplier._id || supplier.supplierId || supplierUser.id,
    role: supplier.role || "supplier",
    name: supplier.name || supplier.tradeName || supplier.companyName || supplierUser.name,
    legalName: supplier.legalName || supplier.razaoSocial || supplier.companyLegalName || supplierUser.legalName,
    cnpj: supplier.cnpj || supplier.document || supplierUser.cnpj,
    address: supplier.address || supplier.fullAddress || supplierUser.address,
    pixKey: supplier.pixKey || supplier.pix || supplierUser.pixKey,
    bank: supplier.bank || supplier.bankData || supplierUser.bank,
    paymentIdentity: supplier.paymentIdentity || supplier.paymentId || supplierUser.paymentIdentity,
    responsible: supplier.responsible || supplier.contactName || supplierUser.responsible,
    phone: supplier.phone || supplier.whatsapp || supplierUser.phone,
    startVisible: supplier.startVisible ?? supplier.visibleOnStart ?? supplierUser.startVisible ?? true,
    plan: {
      ...supplierUser.plan,
      ...plan,
      name: plan.name || supplier.planName || supplierUser.plan.name,
      monthlyPosts: Number(plan.monthlyPosts || supplier.monthlyPosts || supplierUser.plan.monthlyPosts),
      usedPosts: Number(plan.usedPosts || supplier.usedPosts || supplierUser.plan.usedPosts)
    },
    status: supplier.status || supplierUser.status
  };
}

function normalizeProduct(raw = {}) {
  return {
    ...raw,
    id: raw.id || raw._id || raw.productId,
    supplierId: raw.supplierId || raw.supplier_id || supplierUser.id,
    supplier: raw.supplier || raw.supplierName || supplierUser.name,
    name: raw.name || raw.title || "",
    category: raw.category || raw.categoryName || "Geral",
    description: raw.description || raw.shortDescription || "",
    price: Number(raw.price || raw.salePrice || 0),
    stock: Number(raw.stock || raw.quantity || raw.availableQuantity || 0),
    status: raw.status || (Number(raw.stock || 0) <= 0 ? "out_of_stock" : "active"),
    startVisible: raw.startVisible ?? raw.visibleOnStart ?? true,
    updatedAt: raw.updatedAt || raw.updated_at || new Date().toISOString()
  };
}

function normalizeProducts(raw) {
  const payload = unwrapApiPayload(raw);
  const rows = Array.isArray(payload) ? payload : payload?.products || payload?.items || payload?.rows || [];
  return rows.map(normalizeProduct).filter((product) => product.id && product.name);
}

function normalizeAdminSupplier(raw = {}) {
  const supplier = unwrapApiPayload(raw) || {};
  const user = supplier.user || supplier.account || {};
  const plan = supplier.plan || {};
  const monthlyPosts = Number(supplier.autobookPostQuota || supplier.monthlyPosts || plan.monthlyPosts || plan.limit || 0);
  const usedPosts = Number(supplier.usedPosts || plan.usedPosts || plan.used || 0);
  return {
    ...supplier,
    id: supplier.id || supplier._id || supplier.supplierId,
    userId: supplier.userId || supplier.user_id || user.id || user._id,
    name: supplier.name || supplier.companyName || supplier.tradeName || supplier.legalName || "",
    companyName: supplier.companyName || supplier.name || supplier.tradeName || "",
    contactName: supplier.contactName || supplier.responsible || supplier.contact || "",
    email: supplier.email || user.email || "",
    phone: supplier.phone || supplier.whatsapp || "",
    city: supplier.city || "",
    state: supplier.state || "",
    cnpj: supplier.cnpj || supplier.document || "",
    pixKey: supplier.pixKey || supplier.pix || "",
    status: supplier.status || user.status || "pending",
    verified: Boolean(supplier.verified),
    startVisible: supplier.startVisible ?? supplier.visibleOnStart ?? true,
    planName: supplier.planName || plan.name || "Fornecedor",
    monthlyPosts,
    usedPosts,
    remainingPosts: Math.max(0, monthlyPosts - usedPosts),
    activeProducts: Number(supplier.activeProducts || supplier.productCount || supplier.productsCount || 0)
  };
}

function normalizeAdminSuppliers(raw) {
  const payload = unwrapApiPayload(raw);
  const rows = Array.isArray(payload) ? payload : payload?.suppliers || payload?.items || payload?.rows || [];
  return rows.map(normalizeAdminSupplier).filter((supplier) => supplier.id);
}

async function apiRequest(path, options = {}) {
  const headers = { Accept: "application/json", ...(options.headers || {}) };
  const token = authToken();
  if (isProtectedPath(path) && !token) {
    clearAuthState();
    navigate("#/login");
    throw new Error("Sessao expirada. Entre novamente.");
  }
  if (token) headers.Authorization = `Bearer ${token}`;
  if (options.body && !(options.body instanceof FormData)) headers["Content-Type"] = "application/json";
  const url = `${API_BASE_URL}${path}`;

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
      body: options.body && !(options.body instanceof FormData) ? JSON.stringify(options.body) : options.body
    });
  } catch (error) {
    debugApi(path, url, "network_error", Boolean(token));
    throw new Error("Nao foi possivel acessar a API.");
  }

  const payload = await response.json().catch(() => null);
  debugApi(path, url, response.status, Boolean(token));
  if (response.status === 401) {
    if (path === "/auth/login") {
      throw new Error(normalizeApiError(payload, "E-mail ou senha invalidos. Confira os dados e tente novamente."));
    }
    clearAuthState();
    navigate("#/login");
    throw new Error("Sessao expirada ou invalida. Entre novamente.");
  }
  if (response.status === 403) throw new Error("Seu usuario nao tem permissao administrativa.");
  if (response.status === 404) throw new Error("Rota nao encontrada na API.");
  if (response.status >= 500) throw new Error("Erro interno no servidor.");
  if (!response.ok) {
    const debug = DEBUG_API ? ` Endpoint: ${path}. URL: ${url}. Status: ${response.status}. HasToken: ${Boolean(token)}.` : "";
    throw new Error(normalizeApiError(payload, `Falha na API (${response.status}).${debug}`));
  }
  return unwrapApiPayload(payload);
}

async function apiLoginSupplier(email, password) {
  if (USE_MOCK) {
    if (!password || password.length < 8) throw new Error("Senha mock deve ter pelo menos 8 caracteres.");
    if (email === "fornecedor@autozap.com") return { token: crypto.randomUUID(), user: defaultSuppliers[0] };
    if (email === "admin@autozap.com") return { token: crypto.randomUUID(), user: adminUser };
    throw new Error("E-mail ou senha invalidos. Confira os dados e tente novamente.");
  }

  const payload = await apiRequest("/auth/login", { method: "POST", body: { email, password } });
  const token = extractToken(payload);
  const user = normalizeLoginUser(extractLoginUser(payload), email);
  if (!token) throw new Error("Login realizado sem token de acesso retornado pela API.");
  return { token, user };
}

async function apiGetSupplierMe() {
  if (USE_MOCK) return supplierUser;
  return normalizeSupplier(await apiRequest("/supplier/me"));
}

async function apiGetSupplierProducts() {
  if (USE_MOCK) return loadFromStorage(STORAGE_PRODUCTS, defaultProducts);
  return normalizeProducts(await apiRequest("/supplier/products"));
}

async function apiCreateSupplierProduct(product) {
  if (USE_MOCK) return { id: `p${Date.now()}`, ...product, updatedAt: new Date().toISOString() };
  return normalizeProduct(await apiRequest("/supplier/products", { method: "POST", body: product }));
}

async function apiUpdateSupplierProduct(productId, product) {
  if (USE_MOCK) return { id: productId, ...product, updatedAt: new Date().toISOString() };
  return normalizeProduct(await apiRequest(`/supplier/products/${encodeURIComponent(productId)}`, { method: "PUT", body: product }));
}

async function apiDeleteSupplierProduct(productId) {
  if (USE_MOCK) return { deleted: true };
  return apiRequest(`/supplier/products/${encodeURIComponent(productId)}`, { method: "DELETE" });
}

async function apiGetSupplierQuotas() {
  if (USE_MOCK) return supplierUser.plan;
  try {
    return await apiRequest("/supplier/quotas");
  } catch (error) {
    if (/404|not found/i.test(error.message)) return null;
    throw error;
  }
}

async function apiCreateSupplierAutoBookPost(post) {
  if (USE_MOCK) return { id: `post-${Date.now()}`, ...post, status: "review" };
  return apiRequest("/supplier/autobook/posts", { method: "POST", body: post });
}

async function apiGetAdminSuppliers() {
  if (USE_MOCK) return loadFromStorage(STORAGE_SUPPLIERS, defaultSuppliers).map(normalizeAdminSupplier);
  return normalizeAdminSuppliers(await apiRequest("/admin/suppliers"));
}

async function apiCreateAdminSupplier(data) {
  if (USE_MOCK) {
    const created = normalizeAdminSupplier({ id: `supplier-${Date.now()}`, ...data, email: data.email });
    suppliers = [created, ...suppliers];
    saveToStorage(STORAGE_SUPPLIERS, suppliers);
    return created;
  }
  return normalizeAdminSupplier(await apiRequest("/admin/suppliers", { method: "POST", body: data }));
}

async function apiUpdateAdminSupplier(supplierId, data) {
  if (USE_MOCK) {
    const updated = normalizeAdminSupplier({ ...suppliers.find((item) => item.id === supplierId), ...data });
    suppliers = suppliers.map((item) => item.id === supplierId ? updated : item);
    saveToStorage(STORAGE_SUPPLIERS, suppliers);
    return updated;
  }
  return normalizeAdminSupplier(await apiRequest(`/admin/suppliers/${encodeURIComponent(supplierId)}`, { method: "PUT", body: data }));
}

function buildStartSupplierPayload(supplier = {}, source = "portal") {
  const id = supplier.id || supplier._id || supplier.supplierId || "";
  const companyName = supplier.companyName || supplier.name || supplier.tradeName || "";
  const visible = supplier.startVisible !== false && !["blocked", "deleted", "archived"].includes(supplier.status);
  return {
    supplierId: id,
    id,
    name: companyName,
    companyName,
    tradeName: companyName,
    contactName: supplier.contactName || supplier.responsible || supplier.contact || "",
    responsible: supplier.contactName || supplier.responsible || supplier.contact || "",
    email: supplier.email || "",
    phone: supplier.phone || supplier.whatsapp || "",
    whatsapp: supplier.phone || supplier.whatsapp || "",
    city: supplier.city || "",
    state: supplier.state || "",
    cnpj: supplier.cnpj || supplier.document || "",
    pixKey: supplier.pixKey || supplier.pix || "",
    status: supplier.status || "pending",
    verified: Boolean(supplier.verified),
    startVisible: visible,
    visibleOnStart: visible,
    source,
    updatedAt: new Date().toISOString()
  };
}

function buildStartProductPayload(product = {}, supplier = supplierUser, source = "portal") {
  const supplierId = product.supplierId || supplier.id || supplier.supplierId || "";
  const stock = Number(product.stock || product.quantity || product.availableQuantity || 0);
  const status = product.status || (stock <= 0 ? "out_of_stock" : "active");
  const visible = product.startVisible !== false && status === "active" && stock > 0;
  return {
    productId: product.id || product._id || product.productId || "",
    id: product.id || product._id || product.productId || "",
    supplierId,
    supplier: product.supplier || supplier.companyName || supplier.name || "",
    supplierName: product.supplier || supplier.companyName || supplier.name || "",
    name: product.name || product.title || "",
    title: product.name || product.title || "",
    category: product.category || product.categoryName || "Geral",
    description: product.description || product.shortDescription || "",
    shortDescription: product.description || product.shortDescription || "",
    price: Number(product.price || product.salePrice || 0),
    salePrice: Number(product.price || product.salePrice || 0),
    stock,
    quantity: stock,
    availableQuantity: stock,
    status,
    startVisible: visible,
    visibleOnStart: visible,
    source,
    updatedAt: new Date().toISOString()
  };
}

async function tryStartSync(endpoints, payload) {
  if (USE_MOCK) return { ok: true, mock: true };
  let lastError = null;
  for (const endpoint of endpoints) {
    try {
      await apiRequest(endpoint.path, { method: endpoint.method, body: payload });
      return { ok: true, endpoint: endpoint.path };
    } catch (error) {
      lastError = error;
      if (!/Rota nao encontrada|Falha na API \(405\)|Falha na API \(404\)/i.test(error.message || "")) break;
    }
  }
  console.warn("[AutoZap Start sync]", lastError);
  return { ok: false, error: lastError?.message || "Sincronizacao com AutoZap Start pendente." };
}

async function syncSupplierToStart(supplier, source = "portal") {
  const payload = buildStartSupplierPayload(supplier, source);
  const supplierId = encodeURIComponent(payload.supplierId || "");
  const endpoints = [
    ...(payload.supplierId ? [{ method: "PUT", path: `/start/suppliers/${supplierId}` }] : []),
    { method: "POST", path: "/start/suppliers" },
    { method: "POST", path: "/start/suppliers/sync" }
  ];
  return tryStartSync(endpoints, payload);
}

async function syncProductToStart(product, supplier = supplierUser, source = "portal") {
  const payload = buildStartProductPayload(product, supplier, source);
  const supplierId = encodeURIComponent(payload.supplierId || "");
  const productId = encodeURIComponent(payload.productId || "");
  const endpoints = [
    ...(supplierId && productId ? [{ method: "PUT", path: `/start/suppliers/${supplierId}/products/${productId}` }] : []),
    ...(supplierId ? [{ method: "POST", path: `/start/suppliers/${supplierId}/products` }] : []),
    { method: "POST", path: "/start/products" },
    { method: "POST", path: "/start/supplier-products" }
  ];
  return tryStartSync(endpoints, payload);
}

async function apiResetAdminSupplierPassword(supplierId, newPassword) {
  if (USE_MOCK) return { ok: true };
  return apiRequest(`/admin/suppliers/${encodeURIComponent(supplierId)}/reset-password`, { method: "POST", body: { newPassword } });
}

async function apiSetAdminSupplierStatus(supplierId, action) {
  if (USE_MOCK) {
    const status = action === "activate" ? "active" : "blocked";
    suppliers = suppliers.map((item) => item.id === supplierId ? { ...item, status } : item);
    saveToStorage(STORAGE_SUPPLIERS, suppliers);
    return { ok: true };
  }
  return apiRequest(`/admin/suppliers/${encodeURIComponent(supplierId)}/${action}`, { method: "POST" });
}

async function apiArchiveAdminSupplier(supplierId) {
  if (USE_MOCK) {
    suppliers = suppliers.map((item) => item.id === supplierId ? { ...item, status: "deleted" } : item);
    saveToStorage(STORAGE_SUPPLIERS, suppliers);
    return { ok: true };
  }
  return apiRequest(`/admin/suppliers/${encodeURIComponent(supplierId)}`, { method: "DELETE" });
}

async function loadAdminData({ force = false } = {}) {
  const user = session();
  if (!authToken()) throw new Error("Sessao expirada. Entre novamente.");
  if (user?.role !== "admin") throw new Error("Seu usuario nao tem permissao administrativa.");
  if (adminLoading || adminDataLoaded && !force) return;
  adminLoading = true;
  adminError = "";
  try {
    suppliers = await apiGetAdminSuppliers();
    suppliers = suppliers.filter((supplier) => supplier.status !== "deleted");
    adminDataLoaded = true;
  } catch (error) {
    adminError = error.message || "Nao foi possivel carregar fornecedores.";
    throw error;
  } finally {
    adminLoading = false;
  }
}

async function loadSupplierData({ force = false } = {}) {
  if (USE_MOCK || supplierDataLoaded && !force) return;
  const [profile, productRows, quotaData] = await Promise.all([
    apiGetSupplierMe(),
    apiGetSupplierProducts(),
    apiGetSupplierQuotas().catch(() => null)
  ]);
  Object.assign(supplierUser, profile);
  if (profile.plan) supplierUser.plan = profile.plan;
  products = productRows;
  supplierQuotas = quotaData;
  supplierDataLoaded = true;
}

function icon(name) {
  const paths = {
    package: '<path d="M21 8.5 12 3 3 8.5v7L12 21l9-5.5v-7Z"/><path d="m3.3 8.7 8.7 5.1 8.7-5.1"/><path d="M12 21v-7.2"/>',
    megaphone: '<path d="m3 11 18-5v12L3 13v-2Z"/><path d="M11.6 16.5 13 21H8l-1.4-6.7"/>',
    lock: '<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    chart: '<path d="M4 19V5"/><path d="M4 19h17"/><path d="M8 16v-5"/><path d="M13 16V8"/><path d="M18 16v-9"/>',
    upload: '<path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M20 16v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    spark: '<path d="M13 2 3 14h8l-1 8 10-12h-8l1-8Z"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    clipboard: '<path d="M9 5h6"/><path d="M9 3h6v4H9z"/><path d="M5 5h2"/><path d="M17 5h2"/><path d="M5 5v16h14V5"/><path d="M8 12h8"/><path d="M8 16h5"/>'
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.chart}</svg>`;
}

function badge(status) {
  return `<span class="badge ${escapeHTML(status)}">${escapeHTML(statusLabel(status))}</span>`;
}

function statCard(label, value, detail = "") {
  return `<article class="stat-card"><span>${escapeHTML(label)}</span><strong>${escapeHTML(value)}</strong>${detail ? `<small>${escapeHTML(detail)}</small>` : ""}</article>`;
}

function miniMetric(label, value) {
  return `<div class="mini-metric"><span>${escapeHTML(label)}</span><strong>${escapeHTML(value)}</strong></div>`;
}

function readonly(label, value) {
  return `<div class="readonly"><span>${escapeHTML(label)}</span><strong>${escapeHTML(value)}</strong></div>`;
}

function currentPlan() {
  const quotaPayload = unwrapApiPayload(supplierQuotas) || {};
  const monthlyPosts = Number(quotaPayload.monthlyPosts || quotaPayload.total || quotaPayload.limit || supplierUser.plan.monthlyPosts || 0);
  const usedPosts = Number(quotaPayload.usedPosts || quotaPayload.used || supplierUser.plan.usedPosts || 0);
  return {
    ...supplierUser.plan,
    ...quotaPayload,
    name: quotaPayload.name || quotaPayload.planName || supplierUser.plan.name,
    monthlyPosts: Number.isFinite(monthlyPosts) ? monthlyPosts : 0,
    usedPosts: Number.isFinite(usedPosts) ? usedPosts : 0
  };
}

// ROUTING
function shell({ title, subtitle = "", back = false, admin = false, content }) {
  const user = session();
  return `
    <div class="page-shell">
      <nav class="navbar">
        <button class="brand" data-route="${admin ? "#/admin" : "#/select"}" aria-label="Inicio">
          <img src="${LOGO_SRC}" alt="AutoZap" />
          <span class="brand-text">
            <strong>AutoZap</strong>
            <small>Portal do Fornecedor</small>
          </span>
        </button>
        <div class="nav-title">
          <strong>${escapeHTML(title)}</strong>
          ${subtitle ? `<small>${escapeHTML(subtitle)}</small>` : ""}
        </div>
        <div class="nav-actions">
          ${user ? `<span class="user-chip">${escapeHTML(user.name)}</span>` : ""}
          ${back ? `<button class="btn ghost" data-route="#/select">Voltar</button>` : ""}
          <button class="btn outline" data-action="logout">Sair</button>
        </div>
      </nav>
      ${content}
    </div>
  `;
}

function protect(routeName) {
  let user = session();
  const token = authToken();
  if (user && !token) {
    clearAuthState();
    user = null;
    if (routeName !== "login") {
      navigate("#/login");
      showToast("Sessao expirada. Entre novamente.", "error");
      return false;
    }
  }
  if (!user && routeName !== "login") {
    navigate("#/login");
    showToast("Sessao expirada. Entre novamente.", "error");
    return false;
  }
  if (user && routeName === "login") {
    navigate(user.role === "admin" ? "#/admin" : "#/select");
    return false;
  }
  if (user?.role !== "admin" && routeName === "admin") {
    navigate("#/select");
    showToast("Seu usuario nao tem permissao administrativa.", "error");
    return false;
  }
  if (user?.role === "admin" && ["select", "autobook", "start"].includes(routeName)) {
    navigate("#/admin");
    return false;
  }
  return true;
}

async function route() {
  const routeName = (location.hash.replace("#/", "") || "login").split("?")[0];
  if (!protect(routeName)) return;
  if (routeName === "login") return renderLogin();
  if (["select", "autobook", "start"].includes(routeName)) {
    try {
      await loadSupplierData();
    } catch (error) {
      showToast(error.message || "Falha ao carregar dados do fornecedor.", "error");
      if (!USE_MOCK) return;
    }
  }
  if (routeName === "select") return renderSupplierDashboard();
  if (routeName === "autobook") return renderAutoBook();
  if (routeName === "start") return renderAutoZapStart();
  if (routeName === "admin") {
    renderAdminDashboard();
    try {
      await loadAdminData();
      renderAdminDashboard();
    } catch (error) {
      if (!session() || !authToken()) {
        navigate("#/login");
        showToast(error.message || "Sessao expirada. Entre novamente.", "error");
        return;
      }
      renderAdminDashboard();
      showToast(error.message || "Falha ao carregar dados administrativos.", "error");
    }
    return;
  }
  navigate("#/login");
}

// AUTH
function renderLogin() {
  app.innerHTML = `
    <main class="login-page">
      <section class="login-card">
        <div class="login-brand">
          <div class="login-brand-row">
            <img class="login-logo" src="${LOGO_SRC}" alt="AutoZap" />
            <h1>AutoZap</h1>
          </div>
          <h2>Portal do Fornecedor</h2>
          <p>Acesse sua central de produtos, anuncios e campanhas dentro do ecossistema AutoZap.</p>
        </div>
        <form id="loginForm" class="form-stack">
          <label>E-mail<input name="email" type="email" autocomplete="username" placeholder="fornecedor@autozap.com" required /></label>
          <label>Senha<input name="password" type="password" autocomplete="current-password" placeholder="Digite sua senha" required /></label>
          <div id="loginAlert" class="alert hidden">E-mail ou senha invalidos. Confira os dados e tente novamente.</div>
          <button class="btn primary full" type="submit">Entrar no portal</button>
        </form>
        ${USE_MOCK ? `<small>Modo mock local ativo. Use uma senha de desenvolvimento com pelo menos 8 caracteres.</small>` : ""}
      </section>
    </main>
  `;
}

// SUPPLIER AREA
function renderSupplierDashboard() {
  const activeProducts = products.filter((product) => product.supplierId === supplierUser.id && product.status === "active").length;
  const stockItems = products.filter((product) => product.supplierId === supplierUser.id).reduce((sum, product) => sum + Number(product.stock || 0), 0);
  const supplierPosts = posts.filter((post) => post.supplierId === supplierUser.id);
  const plan = currentPlan();
  const used = plan.usedPosts + Math.max(0, supplierPosts.length - defaultPosts.filter((post) => post.supplierId === supplierUser.id).length);
  const remaining = Math.max(0, plan.monthlyPosts - used);
  const nextPost = supplierPosts.filter((post) => post.status === "scheduled").sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))[0];

  app.innerHTML = `
    <main class="select-page" style="--banner:url('${BANNER_SRC}')">
      ${shell({
        title: "Portal do Fornecedor",
        content: `
          <section class="select-hero">
            <div class="hero-copy">
              <span class="eyebrow">Ecossistema AutoZap</span>
              <h1>Central de Crescimento do Fornecedor AutoZap</h1>
              <p>Gerencie seus produtos no AutoZap Start e publique campanhas dentro do AutoBook.</p>
            </div>
            <div class="area-grid">
              <article class="area-card">
                <div class="card-top">
                  <div class="card-icon">${icon("package")}</div>
                  <span class="operation-chip">Operacao comercial</span>
                </div>
                <h2>AutoZap Start</h2>
                <p>Gerencie produtos, precos e estoque disponiveis para as lojas conectadas ao AutoZap.</p>
                <div class="mini-grid">
                  ${miniMetric("Produtos ativos", activeProducts)}
                  ${miniMetric("Itens em estoque", stockItems)}
                  ${miniMetric("Ultima atualizacao", latestDate(products))}
                  ${miniMetric("Status da operacao", "Sincronizada")}
                </div>
                <button class="btn primary" data-route="#/start">Gerenciar estoque</button>
              </article>
              <article class="area-card">
                <div class="card-top">
                  <div class="card-icon">${icon("megaphone")}</div>
                  <span class="operation-chip">Midia e campanhas</span>
                </div>
                <h2>AutoBook</h2>
                <p>Envie campanhas, anuncios e conteudos para aparecer na rede social comercial do ecossistema AutoZap.</p>
                <div class="mini-grid">
                  ${miniMetric("Postagens restantes", remaining)}
                  ${miniMetric("Proxima publicacao", nextPost ? formatDateTime(nextPost.scheduledAt) : "Sem agenda")}
                  ${miniMetric("Status do plano", "Ativo")}
                  ${miniMetric("Conteudos enviados", supplierPosts.length)}
                </div>
                <button class="btn primary" data-route="#/autobook">Enviar campanha</button>
              </article>
            </div>
          </section>
        `
      })}
    </main>
  `;
}

// AUTOBOOK
function renderAutoBook() {
  const supplierPosts = posts.filter((post) => post.supplierId === supplierUser.id);
  const defaultSupplierPosts = defaultPosts.filter((post) => post.supplierId === supplierUser.id).length;
  const plan = currentPlan();
  const used = plan.usedPosts + Math.max(0, supplierPosts.length - defaultSupplierPosts);
  const total = plan.monthlyPosts;
  const remaining = Math.max(0, total - used);
  const percent = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
  const nextPost = supplierPosts.filter((post) => post.status === "scheduled").sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))[0];

  app.innerHTML = shell({
    title: "AutoBook",
    subtitle: "Central de campanhas e midia",
    back: true,
    content: `
      <main class="content-grid two-col">
        <section>
          <header class="page-header">
            <span class="eyebrow">AutoBook</span>
            <h1>AutoBook - Central de Campanhas</h1>
            <p>Envie artes, videos e publicacoes para divulgar sua marca dentro da comunidade AutoZap.</p>
          </header>
          <section class="stats-grid">
            ${statCard("Plano atual", plan.name, "Campanhas dentro do ciclo mensal")}
            ${statCard("Postagens disponiveis", remaining, `${used}/${total} usadas`)}
            ${statCard("Postagens usadas", used, "Inclui envios em analise")}
            ${statCard("Proxima publicacao", nextPost ? formatDateTime(nextPost.scheduledAt) : "Sem agenda", "Agenda AutoBook")}
          </section>
          <article class="panel">
            <div class="section-heading">
              <h2>Enviar nova campanha</h2>
              <p>Envie o criativo e detalhe a publicacao para a equipe AutoZap revisar antes de entrar na agenda.</p>
            </div>
            <form id="postForm" class="form-stack">
              <label class="dropzone" for="postFile">
                ${icon("upload")}
                <strong>Upload de arquivo/design</strong>
                <span>PNG, JPG, MP4 ou PDF ate 50 MB</span>
                <input id="postFile" name="file" type="file" accept="image/*,video/mp4,application/pdf" />
                <em id="fileName">Nenhum arquivo selecionado</em>
              </label>
              <div class="form-grid">
                <label>Titulo da campanha<input name="campaign" placeholder="Ex: Semana dos carregadores turbo" required /></label>
                <label>Tipo<select name="type"><option>Imagem</option><option>Video</option><option>Banner</option><option>Carrossel</option></select></label>
                <label>Data desejada<input name="desiredDate" type="date" required /></label>
                <label>Horario desejado<input name="desiredTime" type="time" required /></label>
              </div>
              <label>Descricao curta<textarea name="description" placeholder="Resumo comercial que deve aparecer na campanha." required></textarea></label>
              <label>Observacoes para a equipe AutoZap<textarea name="notes" placeholder="Informe publico, promocao, produtos, restricoes ou referencias visuais."></textarea></label>
              <div class="progress-wrap"><span>${used}/${total} publicacoes usadas no plano</span><div class="progress"><i style="width:${percent}%"></i></div></div>
              <button class="btn primary full" type="submit">Enviar para analise</button>
            </form>
          </article>
          <article class="panel table-panel">
            <div class="toolbar">
              <div><h2>Status das campanhas</h2><p>Acompanhe analise, agenda, publicacao e ajustes solicitados.</p></div>
            </div>
            ${postsTable(supplierPosts)}
          </article>
        </section>
        <aside class="panel help-card accent-panel">
          <div class="card-icon">${icon("spark")}</div>
          <h2>Precisa de uma arte profissional?</h2>
          <p>A equipe AutoZap pode criar posts, banners e campanhas para sua marca aparecer com mais forca no AutoBook.</p>
          <button class="btn primary full" data-action="designHelp">Solicitar criacao profissional</button>
        </aside>
      </main>
    `
  });
}

function postsTable(rows) {
  if (!rows.length) return `<div class="empty-state">Nenhuma campanha enviada ainda.</div>`;
  return `
    <div class="table-scroll">
      <table class="responsive-table">
        <thead><tr><th>Campanha</th><th>Tipo</th><th>Data desejada</th><th>Status</th><th>Plano</th><th>Acoes</th></tr></thead>
        <tbody>
          ${rows.map((post) => `
            <tr>
              <td data-label="Campanha"><strong>${escapeHTML(post.campaign || post.fileName)}</strong><small>${escapeHTML(post.fileName)}</small></td>
              <td data-label="Tipo">${escapeHTML(post.type || "Imagem")}</td>
              <td data-label="Data desejada">${formatDate(post.desiredDate)} ${escapeHTML(post.desiredTime || "")}</td>
              <td data-label="Status">${badge(post.status)}</td>
              <td data-label="Plano">${escapeHTML(post.plan || supplierUser.plan.name)}</td>
              <td data-label="Acoes" class="actions"><button class="btn tiny ghost" data-post-status="${post.id}">Marcar publicada</button></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

async function createCampaign(form) {
  const file = form.file.files[0];
  if (!file) return showToast("Selecione um arquivo para enviar a campanha.", "error");
  if (!form.campaign.value.trim()) return showToast("Informe o titulo da campanha.", "error");
  if (!form.desiredDate.value || !form.desiredTime.value) return showToast("Escolha data e horario desejados.", "error");

  const desiredDate = form.desiredDate.value;
  const desiredTime = form.desiredTime.value;
  const payload = {
    supplierId: supplierUser.id,
    supplier: supplierUser.name,
    campaign: form.campaign.value.trim(),
    type: form.type.value,
    fileName: file.name,
    desiredDate,
    desiredTime,
    scheduledAt: `${desiredDate}T${desiredTime}`,
    status: "review",
    plan: currentPlan().name,
    description: form.description.value.trim(),
    notes: form.notes.value.trim()
  };

  try {
    const created = await apiCreateSupplierAutoBookPost(payload);
    posts = [{ id: created.id || `post-${Date.now()}`, ...payload, ...created }, ...posts];
    if (USE_MOCK) saveToStorage(STORAGE_POSTS, posts);
    route();
    showToast("Campanha enviada para analise da equipe AutoZap.");
  } catch (error) {
    showToast(error.message || "Envio de campanha indisponivel no servidor.", "error");
  }
}

// AUTOZAP START
function renderAutoZapStart() {
  const supplierProducts = products.filter((product) => product.supplierId === supplierUser.id);
  const filteredProducts = filterProducts(supplierProducts);
  const activeCount = supplierProducts.filter((product) => product.status === "active").length;
  const noStock = supplierProducts.filter((product) => product.stock <= 0 || product.status === "out_of_stock").length;
  const totalStock = supplierProducts.reduce((sum, product) => sum + Number(product.stock || 0), 0);
  const categories = [...new Set(supplierProducts.map((product) => product.category))].sort();

  app.innerHTML = shell({
    title: "AutoZap Start",
    subtitle: "Gestao comercial do catalogo",
    back: true,
    content: `
      <main class="content-grid">
        <header class="page-header">
          <span class="eyebrow">AutoZap Start</span>
          <h1>AutoZap Start - Gestao de Produtos</h1>
          <p>Mantenha seu catalogo, precos e estoque atualizados para as lojas conectadas ao AutoZap.</p>
        </header>
        <section class="stats-grid">
          ${statCard("Produtos ativos", activeCount, "Disponiveis para lojas")}
          ${statCard("Produtos sem estoque", noStock, "Exigem reposicao")}
          ${statCard("Estoque total", `${totalStock} un.`, "Somando itens ativos e pausados")}
          ${statCard("Ultima sincronizacao", latestDate(supplierProducts), USE_MOCK ? "LocalStorage mock" : "Core Server V1")}
        </section>
        <section class="panel sync-panel">
          <div class="section-heading inline">
            <div class="card-icon small">${icon("spark")}</div>
            <div>
              <h2>Envio para o AutoZap Start</h2>
              <p>Produtos ativos, com estoque e marcados como disponiveis para o Start podem aparecer para novos lojistas montarem o primeiro pedido. Dados de Pix e pagamento continuam protegidos e sao usados apenas no fechamento direto com o fornecedor.</p>
            </div>
          </div>
        </section>
        <section class="panel table-panel">
          <div class="toolbar">
            <div><h2>Catalogo comercial</h2><p>Atualize informacoes comerciais sem alterar dados fiscais ou de pagamento.</p></div>
            <button class="btn primary" data-action="addProduct">Adicionar produto</button>
          </div>
          <div class="filters-grid">
            <label>Busca por nome<input data-filter="search" value="${escapeHTML(productFilters.search)}" placeholder="Buscar produto" /></label>
            <label>Categoria<select data-filter="category"><option value="all">Todas</option>${categories.map((category) => `<option value="${escapeHTML(category)}" ${productFilters.category === category ? "selected" : ""}>${escapeHTML(category)}</option>`).join("")}</select></label>
            <label>Status<select data-filter="status"><option value="all">Todos</option><option value="active" ${productFilters.status === "active" ? "selected" : ""}>Ativo</option><option value="paused" ${productFilters.status === "paused" ? "selected" : ""}>Pausado</option><option value="out_of_stock" ${productFilters.status === "out_of_stock" ? "selected" : ""}>Sem estoque</option></select></label>
            <label class="check-filter"><input data-filter="lowStock" type="checkbox" ${productFilters.lowStock ? "checked" : ""} /> Estoque baixo</label>
          </div>
          ${productsTable(filteredProducts, false)}
        </section>
        <section class="panel locked-panel">
          <div class="section-heading inline">
            <div class="card-icon small">${icon("lock")}</div>
            <div>
              <h2>Dados protegidos da empresa</h2>
              <p>Essas informacoes sao protegidas para evitar erros fiscais, comerciais ou de pagamento. Caso precise corrigir algum dado, solicite suporte.</p>
            </div>
          </div>
          <div class="readonly-grid">
            ${readonly("CNPJ", supplierUser.cnpj)}
            ${readonly("Nome juridico", supplierUser.legalName)}
            ${readonly("Endereco", supplierUser.address)}
            ${readonly("Chave Pix", supplierUser.pixKey)}
            ${readonly("Dados bancarios", supplierUser.bank)}
            ${readonly("Identidade de pagamento", supplierUser.paymentIdentity)}
          </div>
          <button class="btn outline" data-action="registrationHelp">Preciso alterar meus dados</button>
        </section>
      </main>
    `
  });
}

function filterProducts(rows) {
  return rows.filter((product) => {
    const matchName = product.name.toLowerCase().includes(productFilters.search.toLowerCase().trim());
    const matchCategory = productFilters.category === "all" || product.category === productFilters.category;
    const matchStatus = productFilters.status === "all" || product.status === productFilters.status;
    const matchLowStock = !productFilters.lowStock || Number(product.stock) <= 10;
    return matchName && matchCategory && matchStatus && matchLowStock;
  });
}

function productsTable(rows, adminMode) {
  if (!rows.length) return `<div class="empty-state">Nenhum produto encontrado para os filtros atuais.</div>`;
  return `
    <div class="table-scroll">
      <table class="responsive-table">
        <thead>
          <tr>${adminMode ? "<th>Fornecedor</th>" : ""}<th>Produto</th><th>Categoria</th><th>Preco</th><th>Estoque</th><th>Status</th><th>Start</th><th>Ultima atualizacao</th><th>Acoes</th></tr>
        </thead>
        <tbody>
          ${rows.map((product) => `
            <tr>
              ${adminMode ? `<td data-label="Fornecedor">${escapeHTML(product.supplier || supplierUser.name)}</td>` : ""}
              <td data-label="Produto"><strong>${escapeHTML(product.name)}</strong><small>${escapeHTML(product.description || "Sem descricao curta")}</small></td>
              <td data-label="Categoria">${escapeHTML(product.category)}</td>
              <td data-label="Preco">${formatCurrency(product.price)}</td>
              <td data-label="Estoque">${Number(product.stock || 0)} un.</td>
              <td data-label="Status">${badge(product.status)}</td>
              <td data-label="Start">${badge(product.startVisible !== false && product.status === "active" && Number(product.stock || 0) > 0 ? "start_visible" : "start_hidden")}</td>
              <td data-label="Ultima atualizacao">${formatDateTime(product.updatedAt)}</td>
              <td data-label="Acoes" class="actions">
                <button class="btn tiny ghost" data-edit-product="${product.id}">Editar</button>
                ${!adminMode ? `<button class="btn tiny ghost" data-duplicate-product="${product.id}">Duplicar</button>` : ""}
                <button class="btn tiny ghost" data-toggle-product="${product.id}">${product.status === "paused" ? "Ativar" : "Desativar"}</button>
                ${!adminMode ? `<button class="btn tiny danger" data-remove-product="${product.id}">Remover</button>` : ""}
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

async function updateProduct(productId, payload) {
  const updated = await apiUpdateSupplierProduct(productId, payload);
  const merged = { ...products.find((item) => item.id === productId), ...payload, ...updated, updatedAt: updated.updatedAt || new Date().toISOString() };
  products = products.map((item) => item.id === productId ? merged : item);
  if (USE_MOCK) saveToStorage(STORAGE_PRODUCTS, products);
  return merged;
}

function openProductModal(product = null) {
  const isEdit = Boolean(product);
  openModal(`
    <form id="productForm" class="modal-card form-stack">
      <h2>${isEdit ? "Atualizar informacoes comerciais" : "Adicionar produto ao catalogo"}</h2>
      <p>Dados fiscais, bancarios e identidade de pagamento permanecem bloqueados para sua seguranca.</p>
      <label>Nome do produto<input name="name" value="${escapeHTML(product?.name || "")}" required /></label>
      <div class="form-grid">
        <label>Categoria<input name="category" value="${escapeHTML(product?.category || "")}" required /></label>
        <label>Preco<input name="price" type="number" min="0" step="0.01" value="${escapeHTML(product?.price || "")}" required /></label>
        <label>Quantidade disponivel<input name="stock" type="number" min="0" step="1" value="${escapeHTML(product?.stock ?? "")}" required /></label>
        <label>Status<select name="status"><option value="active" ${product?.status === "active" ? "selected" : ""}>Ativo</option><option value="paused" ${product?.status === "paused" ? "selected" : ""}>Pausado</option><option value="out_of_stock" ${product?.status === "out_of_stock" ? "selected" : ""}>Sem estoque</option></select></label>
        <label>Disponivel no AutoZap Start<select name="startVisible"><option value="true" ${product?.startVisible !== false ? "selected" : ""}>Sim</option><option value="false" ${product?.startVisible === false ? "selected" : ""}>Nao</option></select></label>
      </div>
      <label>Descricao curta<textarea name="description" required>${escapeHTML(product?.description || "")}</textarea></label>
      <div class="modal-actions">
        <button type="button" class="btn ghost" data-action="closeModal">Cancelar</button>
        <button class="btn primary" type="submit">Salvar alteracoes</button>
      </div>
    </form>
  `);

  document.querySelector("#productForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    if (Number(data.price) < 0 || Number(data.stock) < 0) return showToast("Preco e estoque precisam ser valores validos.", "error");

    const payload = {
      supplierId: product?.supplierId || supplierUser.id,
      supplier: product?.supplier || supplierUser.name,
      name: data.name.trim(),
      category: data.category.trim(),
      description: data.description.trim(),
      price: Number(data.price),
      stock: Number(data.stock),
      status: data.status,
      startVisible: data.startVisible === "true"
    };

    try {
      let savedProduct;
      if (isEdit) {
        savedProduct = await updateProduct(product.id, payload);
      } else {
        const created = await apiCreateSupplierProduct(payload);
        savedProduct = { id: created.id || `p${Date.now()}`, ...payload, ...created, updatedAt: created.updatedAt || new Date().toISOString() };
        products = [savedProduct, ...products];
        if (USE_MOCK) saveToStorage(STORAGE_PRODUCTS, products);
      }
      const sync = await syncProductToStart(savedProduct, supplierUser, isEdit ? "supplier-product-update" : "supplier-product-create");

      closeModal();
      route();
      showToast(sync.ok ? (isEdit ? "Produto atualizado e enviado ao Start." : "Produto criado e enviado ao Start.") : "Produto salvo. Sincronizacao com Start pendente.");
    } catch (error) {
      showToast(error.message || "Nao foi possivel salvar o produto.", "error");
    }
  });
}

async function duplicateProduct(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product) return;
  try {
    const { id, updatedAt, ...copyPayload } = product;
    const created = await apiCreateSupplierProduct({ ...copyPayload, name: `${product.name} - copia`, status: "paused" });
    const savedProduct = { ...product, ...created, id: created.id || `p${Date.now()}`, name: `${product.name} - copia`, status: "paused", startVisible: false, updatedAt: created.updatedAt || new Date().toISOString() };
    products = [savedProduct, ...products];
    if (USE_MOCK) saveToStorage(STORAGE_PRODUCTS, products);
    await syncProductToStart(savedProduct, supplierUser, "supplier-product-duplicate");
    route();
    showToast("Produto duplicado como item pausado.");
  } catch (error) {
    showToast(error.message || "Nao foi possivel duplicar o produto.", "error");
  }
}

// ADMIN AREA
function renderAdminDashboard() {
  app.innerHTML = shell({
    title: "Central Administrativa AutoZap",
    subtitle: "Controle geral de fornecedores, campanhas e quotas",
    admin: true,
    content: `
      <main class="content-grid admin-grid">
        <header class="page-header">
          <span class="eyebrow">Administrativo</span>
          <h1>Central Administrativa AutoZap</h1>
          <p>Monitore fornecedores, postagens, estoque, planos, pendencias e solicitacoes de ajuda.</p>
        </header>
        <nav class="tabs" aria-label="Abas administrativas">
          ${adminTabButton("overview", "Visao geral")}
          ${adminTabButton("suppliers", "Fornecedores")}
          ${adminTabButton("autobook", "AutoBook")}
          ${adminTabButton("start", "AutoZap Start")}
          ${adminTabButton("requests", "Solicitacoes")}
          ${adminTabButton("plans", "Planos e quotas")}
        </nav>
        ${renderAdminTabContent()}
      </main>
    `
  });
}

function adminTabButton(tab, label) {
  return `<button class="tab-button ${adminTab === tab ? "active" : ""}" data-admin-tab="${tab}">${label}</button>`;
}

function renderAdminTabContent() {
  if (adminTab === "overview") return renderAdminOverview();
  if (adminTab === "suppliers") return renderAdminSuppliersTab();
  if (adminTab === "autobook") return USE_MOCK ? `<section class="panel table-panel"><h2>Campanhas AutoBook</h2>${adminPostsTable()}</section>` : adminUnavailablePanel("Campanhas AutoBook", "Conecte esta aba a uma rota real de campanhas administrativas antes de usar em producao.");
  if (adminTab === "start") return USE_MOCK ? `<section class="panel table-panel"><h2>Estoque AutoZap Start</h2>${productsTable(products, true)}</section>` : adminUnavailablePanel("Estoque AutoZap Start", "Esta visao foi zerada em producao para nao exibir produtos simulados.");
  if (adminTab === "requests") return USE_MOCK ? `<section class="panel table-panel"><h2>Solicitacoes abertas</h2>${helpTable()}</section>` : adminUnavailablePanel("Solicitacoes abertas", "Esta aba aguarda rota real de solicitacoes administrativas.");
  if (adminTab === "plans") return `<section class="panel table-panel"><h2>Planos e quotas</h2><p>Edite plano, limite mensal, postagens usadas e status pelo detalhe do fornecedor.</p>${plansTable()}</section>`;
  return renderAdminOverview();
}

function renderAdminOverview() {
  const activeSuppliers = suppliers.filter((supplier) => supplier.status === "active").length;
  return `
    <section class="stats-grid five">
      ${statCard("Total de fornecedores", suppliers.length, USE_MOCK ? "Mock local" : "API real")}
      ${statCard("Fornecedores ativos", activeSuppliers, "Operacao liberada")}
      ${statCard("Campanhas pendentes", USE_MOCK ? posts.filter((post) => ["review", "needs_adjustment"].includes(post.status)).length : "-", USE_MOCK ? "Mock local" : "Sem rota real conectada")}
      ${statCard("Produtos cadastrados", USE_MOCK ? products.length : "-", USE_MOCK ? "Mock local" : "Sem rota real conectada")}
      ${statCard("Solicitacoes abertas", USE_MOCK ? helpRequests.filter((request) => request.status !== "Concluida").length : "-", USE_MOCK ? "Mock local" : "Sem rota real conectada")}
    </section>
    ${adminError ? `<div class="alert">${escapeHTML(adminError)}</div>` : ""}
    ${USE_MOCK ? `
      <section class="admin-overview-grid">
        <article class="panel table-panel"><h2>Pendencias recentes</h2>${adminPostsTable(posts.filter((post) => post.status !== "published").slice(0, 4))}</article>
        <article class="panel table-panel"><h2>Pedidos de ajuda</h2>${helpTable(helpRequests.slice(0, 4))}</article>
      </section>
    ` : renderAdminSuppliersTab(true)}
  `;
}

function adminUnavailablePanel(title, message) {
  return `<section class="panel table-panel"><h2>${escapeHTML(title)}</h2><div class="empty-state">${escapeHTML(message)}</div></section>`;
}

function renderAdminSuppliersTab(compact = false) {
  return `
    <section class="panel table-panel">
      <div class="toolbar">
        <div>
          <h2>Fornecedores</h2>
          <p>Cadastre fornecedores reais e gerencie acesso ao Portal do Fornecedor.</p>
        </div>
        ${compact ? "" : `<button class="btn primary" data-action="newSupplier">Novo fornecedor</button>`}
      </div>
      ${adminLoading ? `<div class="empty-state">Carregando fornecedores...</div>` : ""}
      ${adminError ? `<div class="alert">${escapeHTML(adminError)}</div>` : ""}
      ${!adminLoading && !adminError ? suppliersTable() : ""}
    </section>
  `;
}

function suppliersTable() {
  if (!suppliers.length) return `<div class="empty-state">Nenhum fornecedor encontrado. Use "Novo fornecedor" para criar o primeiro acesso real.</div>`;
  return `
    <div class="table-scroll">
      <table class="responsive-table">
        <thead><tr><th>Empresa</th><th>Login</th><th>Responsavel</th><th>Status</th><th>Start</th><th>Produtos</th><th>Quota AutoBook</th><th>Acoes</th></tr></thead>
        <tbody>
          ${suppliers.map((supplier) => `
            <tr>
              <td data-label="Empresa"><strong>${escapeHTML(supplier.companyName || supplier.name)}</strong><small>${escapeHTML(supplier.cnpj || "-")}</small></td>
              <td data-label="Login">${escapeHTML(supplier.email || "-")}</td>
              <td data-label="Responsavel">${escapeHTML(supplier.contactName || "-")}<small>${escapeHTML([supplier.phone, supplier.city, supplier.state].filter(Boolean).join(" - ") || "-")}</small></td>
              <td data-label="Status">${badge(supplier.status)}</td>
              <td data-label="Start">${badge(supplier.startVisible !== false && supplier.status === "active" ? "start_visible" : "start_hidden")}</td>
              <td data-label="Produtos">${escapeHTML(supplier.activeProducts)}</td>
              <td data-label="Quota AutoBook">${escapeHTML(supplier.monthlyPosts || 0)}</td>
              <td data-label="Acoes" class="actions">
                <button class="btn tiny ghost" data-edit-supplier="${supplier.id}">Editar</button>
                <button class="btn tiny ghost" data-reset-supplier-password="${supplier.id}">Redefinir senha</button>
                <button class="btn tiny ghost" data-toggle-supplier="${supplier.id}">${supplier.status === "active" ? "Bloquear" : "Ativar"}</button>
                <button class="btn tiny danger" data-archive-supplier="${supplier.id}">Arquivar</button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function adminPostsTable(rows = posts) {
  if (!rows.length) return `<div class="empty-state">Nenhuma campanha encontrada.</div>`;
  return `
    <div class="table-scroll">
      <table class="responsive-table">
        <thead><tr><th>Fornecedor</th><th>Campanha</th><th>Arquivo</th><th>Data desejada</th><th>Status</th><th>Acoes</th></tr></thead>
        <tbody>
          ${rows.map((post) => `
            <tr>
              <td data-label="Fornecedor">${escapeHTML(post.supplier)}</td>
              <td data-label="Campanha">${escapeHTML(post.campaign || post.fileName)}</td>
              <td data-label="Arquivo">${escapeHTML(post.fileName)}</td>
              <td data-label="Data desejada">${formatDate(post.desiredDate)} ${escapeHTML(post.desiredTime || "")}</td>
              <td data-label="Status">${badge(post.status)}</td>
              <td data-label="Acoes" class="actions">
                <button class="btn tiny ghost" data-admin-post="${post.id}" data-status="scheduled">Aprovar</button>
                <button class="btn tiny ghost" data-admin-post="${post.id}" data-status="rejected">Rejeitar</button>
                <button class="btn tiny ghost" data-admin-post="${post.id}" data-status="published">Publicada</button>
                <button class="btn tiny ghost" data-admin-post="${post.id}" data-status="needs_adjustment">Pedir ajuste</button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function helpTable(rows = helpRequests) {
  if (!rows.length) return `<div class="empty-state">Nenhuma solicitacao registrada.</div>`;
  return `
    <div class="table-scroll">
      <table class="responsive-table">
        <thead><tr><th>Fornecedor</th><th>Tipo</th><th>Descricao</th><th>Data</th><th>Status</th><th>Acoes</th></tr></thead>
        <tbody>
          ${rows.map((item) => `
            <tr>
              <td data-label="Fornecedor">${escapeHTML(item.supplier)}</td>
              <td data-label="Tipo">${escapeHTML(item.type)}</td>
              <td data-label="Descricao">${escapeHTML(item.description)}</td>
              <td data-label="Data">${escapeHTML(item.date)}</td>
              <td data-label="Status">${escapeHTML(item.status)}</td>
              <td data-label="Acoes" class="actions"><button class="btn tiny ghost" data-close-request="${item.id}">Concluir</button></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function plansTable() {
  if (!suppliers.length) return `<div class="empty-state">Nenhum fornecedor real carregado.</div>`;
  return `
    <div class="table-scroll">
      <table class="responsive-table">
        <thead><tr><th>Fornecedor</th><th>Plano</th><th>Limite</th><th>Usadas</th><th>Restantes</th><th>Status</th><th>Acoes</th></tr></thead>
        <tbody>
          ${suppliers.map((supplier) => `
            <tr>
              <td data-label="Fornecedor">${escapeHTML(supplier.name)}</td>
              <td data-label="Plano">${escapeHTML(supplier.planName)}</td>
              <td data-label="Limite">${escapeHTML(supplier.monthlyPosts || 0)}</td>
              <td data-label="Usadas">${escapeHTML(supplier.usedPosts || 0)}</td>
              <td data-label="Restantes">${escapeHTML(supplier.remainingPosts || 0)}</td>
              <td data-label="Status">${badge(supplier.status)}</td>
              <td data-label="Acoes" class="actions"><button class="btn tiny ghost" data-edit-supplier="${supplier.id}">Editar quota</button></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function updateCampaignStatus(postId, status) {
  if (!USE_MOCK) {
    showToast("A rota administrativa de campanhas ainda nao esta conectada.", "error");
    return;
  }
  posts = posts.map((item) => item.id === postId ? { ...item, status } : item);
  saveToStorage(STORAGE_POSTS, posts);
}

function supplierFormFields(supplier = {}, mode = "create") {
  const isCreate = mode === "create";
  return `
    <div class="modal-grid">
      <label>Nome da empresa<input name="companyName" value="${escapeHTML(supplier.companyName || supplier.name || "")}" required /></label>
      <label>Nome do responsavel<input name="contactName" value="${escapeHTML(supplier.contactName || "")}" required /></label>
      <label>Email de login<input name="email" type="email" value="${escapeHTML(supplier.email || "")}" ${isCreate ? "required" : ""} ${isCreate ? "" : "readonly"} /></label>
      ${isCreate ? `<label>Senha temporaria<input name="temporaryPassword" type="password" minlength="8" autocomplete="new-password" required /></label>` : ""}
      <label>Telefone<input name="phone" value="${escapeHTML(supplier.phone || "")}" /></label>
      <label>Cidade<input name="city" value="${escapeHTML(supplier.city || "")}" /></label>
      <label>Estado<input name="state" maxlength="2" value="${escapeHTML(supplier.state || "")}" /></label>
      <label>CNPJ opcional<input name="cnpj" value="${escapeHTML(supplier.cnpj || "")}" /></label>
      <label>Chave Pix opcional<input name="pixKey" value="${escapeHTML(supplier.pixKey || "")}" /></label>
      <label>Status<select name="status"><option value="active" ${supplier.status === "active" ? "selected" : ""}>Ativo</option><option value="pending" ${supplier.status === "pending" ? "selected" : ""}>Pendente</option><option value="blocked" ${supplier.status === "blocked" ? "selected" : ""}>Bloqueado</option></select></label>
      <label>Verificado<select name="verified"><option value="true" ${supplier.verified ? "selected" : ""}>Sim</option><option value="false" ${!supplier.verified ? "selected" : ""}>Nao</option></select></label>
      <label>Quota mensal AutoBook<input name="autobookPostQuota" type="number" min="0" value="${escapeHTML(supplier.monthlyPosts || 0)}" /></label>
      <label>Visivel no AutoZap Start<select name="startVisible"><option value="true" ${supplier.startVisible !== false ? "selected" : ""}>Sim</option><option value="false" ${supplier.startVisible === false ? "selected" : ""}>Nao</option></select></label>
    </div>
  `;
}

function readSupplierForm(form, includePassword = false) {
  const data = Object.fromEntries(new FormData(form));
  const payload = {
    companyName: data.companyName?.trim(),
    contactName: data.contactName?.trim(),
    email: data.email?.trim().toLowerCase(),
    phone: data.phone?.trim(),
    city: data.city?.trim(),
    state: data.state?.trim().toUpperCase(),
    cnpj: data.cnpj?.trim(),
    pixKey: data.pixKey?.trim(),
    status: data.status || "pending",
    verified: data.verified === "true",
    autobookPostQuota: Number(data.autobookPostQuota || 0),
    startVisible: data.startVisible === "true"
  };
  if (includePassword) payload.temporaryPassword = data.temporaryPassword;
  return payload;
}

function openNewSupplierModal() {
  openModal(`
    <form id="createSupplierForm" class="modal-card form-stack wide">
      <h2>Novo fornecedor</h2>
      <p>Crie o usuario supplier e o cadastro vinculado. A senha nao sera exibida novamente depois de salvar.</p>
      ${supplierFormFields({}, "create")}
      <div class="modal-actions">
        <button type="button" class="btn ghost" data-action="closeModal">Cancelar</button>
        <button class="btn primary" type="submit">Criar fornecedor</button>
      </div>
    </form>
  `);
}

function openSupplierModal(supplier) {
  if (!supplier) return showToast("Fornecedor nao encontrado.", "error");
  openModal(`
    <form id="supplierForm" class="modal-card form-stack wide" data-supplier-id="${escapeHTML(supplier.id)}">
      <h2>Detalhe do fornecedor</h2>
      <p>Atualize dados comerciais, status e quota. Senha e email de login nao sao alterados por aqui.</p>
      ${supplierFormFields(supplier, "edit")}
      <div class="modal-actions">
        <button type="button" class="btn ghost" data-action="closeModal">Cancelar</button>
        <button class="btn primary" type="submit">Salvar alteracoes</button>
      </div>
    </form>
  `);

}

function openResetSupplierPasswordModal(supplier) {
  if (!supplier) return showToast("Fornecedor nao encontrado.", "error");
  openModal(`
    <form id="resetSupplierPasswordForm" class="modal-card form-stack" data-supplier-id="${escapeHTML(supplier.id)}">
      <h2>Redefinir senha</h2>
      <p>A nova senha sera salva com hash no servidor e nao sera exibida novamente.</p>
      <label>Fornecedor<input value="${escapeHTML(supplier.companyName || supplier.name)}" readonly /></label>
      <label>Nova senha<input name="newPassword" type="password" minlength="8" autocomplete="new-password" required /></label>
      <div class="modal-actions">
        <button type="button" class="btn ghost" data-action="closeModal">Cancelar</button>
        <button class="btn primary" type="submit">Redefinir senha</button>
      </div>
    </form>
  `);
}

document.addEventListener("submit", async (event) => {
  if (event.target.id === "createSupplierForm") {
    event.preventDefault();
    try {
      const created = await apiCreateAdminSupplier(readSupplierForm(event.target, true));
      const sync = await syncSupplierToStart(created, "admin-supplier-create");
      event.target.reset();
      closeModal();
      await loadAdminData({ force: true });
      renderAdminDashboard();
      showToast(sync.ok ? "Fornecedor criado e sincronizado com o AutoZap Start." : "Fornecedor criado. Sincronizacao com Start pendente.");
    } catch (error) {
      showToast(error.message || "Nao foi possivel criar o fornecedor.", "error");
    }
  }
  if (event.target.id === "supplierForm") {
    event.preventDefault();
    try {
      const updated = await apiUpdateAdminSupplier(event.target.dataset.supplierId, readSupplierForm(event.target, false));
      const sync = await syncSupplierToStart(updated, "admin-supplier-update");
      closeModal();
      await loadAdminData({ force: true });
      renderAdminDashboard();
      showToast(sync.ok ? "Fornecedor atualizado e sincronizado com o Start." : "Fornecedor atualizado. Sincronizacao com Start pendente.");
    } catch (error) {
      showToast(error.message || "Nao foi possivel atualizar o fornecedor.", "error");
    }
  }
  if (event.target.id === "resetSupplierPasswordForm") {
    event.preventDefault();
    try {
      await apiResetAdminSupplierPassword(event.target.dataset.supplierId, new FormData(event.target).get("newPassword"));
      event.target.reset();
      closeModal();
      showToast("Senha redefinida. Envie a nova senha ao fornecedor por canal seguro.");
    } catch (error) {
      showToast(error.message || "Nao foi possivel redefinir a senha.", "error");
    }
  }
});

// MODALS
function openModal(html) {
  document.body.insertAdjacentHTML("beforeend", `<div class="modal-backdrop">${html}</div>`);
}

function closeModal() {
  document.querySelector(".modal-backdrop")?.remove();
}

function createHelpRequest(type, description) {
  const request = {
    id: `h${Date.now()}`,
    supplierId: supplierUser.id,
    supplier: supplierUser.name,
    type,
    description,
    date: new Date().toISOString().slice(0, 10),
    status: "Aberta"
  };
  helpRequests = [request, ...helpRequests];
  saveToStorage(STORAGE_HELP, helpRequests);
  showToast("Solicitacao registrada para a equipe AutoZap.");
}

// EVENTS
document.addEventListener("submit", async (event) => {
  if (event.target.id === "loginForm") {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target));
    try {
      const login = await apiLoginSupplier(data.email, data.password);
      const user = normalizeLoginUser(login.user || {}, data.email);
      setSession({ id: user.id, role: user.role, name: user.name || data.email, email: user.email || data.email }, login.token);
      if (user.role === "admin") {
        navigate("#/admin");
      } else {
        Object.assign(supplierUser, normalizeSupplier(user));
        supplierDataLoaded = false;
        navigate("#/select");
      }
    } catch (error) {
      const alert = document.querySelector("#loginAlert");
      if (alert) alert.textContent = error.message || "E-mail ou senha invalidos. Confira os dados e tente novamente.";
      document.querySelector("#loginAlert")?.classList.remove("hidden");
    }
  }
  if (event.target.id === "postForm") {
    event.preventDefault();
    await createCampaign(event.target);
  }
});

document.addEventListener("input", (event) => {
  if (event.target.dataset.filter === "search") {
    productFilters.search = event.target.value;
    renderAutoZapStart();
    event.target.focus();
    event.target.setSelectionRange(productFilters.search.length, productFilters.search.length);
  }
});

document.addEventListener("change", (event) => {
  if (event.target.id === "postFile") {
    document.querySelector("#fileName").textContent = event.target.files[0]?.name || "Nenhum arquivo selecionado";
  }
  if (event.target.dataset.filter === "category") {
    productFilters.category = event.target.value;
    renderAutoZapStart();
  }
  if (event.target.dataset.filter === "status") {
    productFilters.status = event.target.value;
    renderAutoZapStart();
  }
  if (event.target.dataset.filter === "lowStock") {
    productFilters.lowStock = event.target.checked;
    renderAutoZapStart();
  }
});

document.addEventListener("click", async (event) => {
  const target = event.target.closest("button");
  if (!target) return;
  if (target.dataset.route) navigate(target.dataset.route);
  if (target.dataset.action === "logout") logout();
  if (target.dataset.action === "closeModal") closeModal();
  if (target.dataset.action === "addProduct") openProductModal();
  if (target.dataset.action === "newSupplier") openNewSupplierModal();
  if (target.dataset.action === "designHelp") createHelpRequest("Criacao de arte profissional", "Fornecedor solicitou apoio para criacao de posts, banners ou campanha AutoBook.");
  if (target.dataset.action === "registrationHelp") createHelpRequest("Alteracao de dados protegidos", "Fornecedor solicitou suporte para alterar CNPJ, dados bancarios, Pix ou identidade de pagamento.");

  if (target.dataset.adminTab) {
    adminTab = target.dataset.adminTab;
    renderAdminDashboard();
  }
  if (target.dataset.editProduct) openProductModal(products.find((item) => item.id === target.dataset.editProduct));
  if (target.dataset.duplicateProduct) await duplicateProduct(target.dataset.duplicateProduct);
  if (target.dataset.toggleProduct) {
    const product = products.find((item) => item.id === target.dataset.toggleProduct);
    try {
      const updated = await updateProduct(target.dataset.toggleProduct, { status: product?.status === "paused" ? "active" : "paused" });
      await syncProductToStart(updated, supplierUser, "supplier-product-status");
      route();
      showToast("Status do produto atualizado e enviado ao Start.");
    } catch (error) {
      showToast(error.message || "Nao foi possivel atualizar o status.", "error");
    }
  }
  if (target.dataset.removeProduct) {
    try {
      const product = products.find((item) => item.id === target.dataset.removeProduct);
      await apiDeleteSupplierProduct(target.dataset.removeProduct);
      if (product) await syncProductToStart({ ...product, status: "paused", startVisible: false, stock: 0 }, supplierUser, "supplier-product-remove");
      products = products.filter((item) => item.id !== target.dataset.removeProduct);
      if (USE_MOCK) saveToStorage(STORAGE_PRODUCTS, products);
      route();
      showToast("Produto removido do catalogo e ocultado no Start.");
    } catch (error) {
      showToast(error.message || "Nao foi possivel remover o produto.", "error");
    }
  }
  if (target.dataset.postStatus) {
    updateCampaignStatus(target.dataset.postStatus, "published");
    route();
    showToast("Campanha marcada como publicada.");
  }
  if (target.dataset.adminPost) {
    updateCampaignStatus(target.dataset.adminPost, target.dataset.status);
    route();
    if (USE_MOCK) showToast("Status da campanha atualizado.");
  }
  if (target.dataset.editSupplier) openSupplierModal(suppliers.find((item) => item.id === target.dataset.editSupplier));
  if (target.dataset.resetSupplierPassword) openResetSupplierPasswordModal(suppliers.find((item) => item.id === target.dataset.resetSupplierPassword));
  if (target.dataset.toggleSupplier) {
    const supplier = suppliers.find((item) => item.id === target.dataset.toggleSupplier);
    const action = supplier?.status === "active" ? "block" : "activate";
    try {
      await apiSetAdminSupplierStatus(target.dataset.toggleSupplier, action);
      await syncSupplierToStart({ ...supplier, status: action === "activate" ? "active" : "blocked" }, "admin-supplier-status");
      await loadAdminData({ force: true });
      renderAdminDashboard();
      showToast(action === "activate" ? "Fornecedor ativado e enviado ao Start." : "Fornecedor bloqueado e ocultado no Start.");
    } catch (error) {
      showToast(error.message || "Nao foi possivel atualizar o status do fornecedor.", "error");
    }
  }
  if (target.dataset.archiveSupplier) {
    if (!confirm("Tem certeza que deseja arquivar este fornecedor? Ele nao conseguira mais acessar o Portal.")) return;
    try {
      const supplier = suppliers.find((item) => item.id === target.dataset.archiveSupplier);
      await apiArchiveAdminSupplier(target.dataset.archiveSupplier);
      if (supplier) await syncSupplierToStart({ ...supplier, status: "deleted", startVisible: false }, "admin-supplier-archive");
      await loadAdminData({ force: true });
      renderAdminDashboard();
      showToast("Fornecedor arquivado e ocultado no Start.");
    } catch (error) {
      showToast(error.message || "Nao foi possivel arquivar o fornecedor.", "error");
    }
  }
  if (target.dataset.closeRequest) {
    if (!USE_MOCK) return showToast("A rota administrativa de solicitacoes ainda nao esta conectada.", "error");
    helpRequests = helpRequests.map((item) => item.id === target.dataset.closeRequest ? { ...item, status: "Concluida" } : item);
    saveToStorage(STORAGE_HELP, helpRequests);
    route();
    showToast("Solicitacao concluida.");
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeModal();
});

window.addEventListener("hashchange", route);
route();
