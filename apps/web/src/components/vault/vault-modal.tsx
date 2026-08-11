"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Icon, IconName } from "@personal-platform/ui";
import {
  useVaultStore,
  VaultCategory,
  DecryptedVaultItem,
} from "../../store/vaultStore";
import {
  generateSmartPassword,
  evaluatePasswordHealth,
  generateTOTPCode,
  PasswordGeneratorOptions,
} from "../../lib/vault-crypto";

interface VaultModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_CONFIG: Record<
  VaultCategory | "all" | "favorites",
  { label: string; icon: IconName; color: string }
> = {
  all: { label: "Todos los elementos", icon: "key", color: "#38bdf8" },
  website: { label: "Páginas & Sitios Web", icon: "cloud", color: "#60a5fa" },
  app: { label: "Aplicaciones & Móvil", icon: "terminal", color: "#a78bfa" },
  email: { label: "Cuentas de Correo", icon: "user", color: "#34d399" },
  social: { label: "Redes Sociales", icon: "star", color: "#f472b6" },
  streaming: { label: "Streaming & Música", icon: "dashboard", color: "#fb923c" },
  api_key: { label: "Claves API & Dev", icon: "code", color: "#2dd4bf" },
  note: { label: "Notas Seguras", icon: "edit", color: "#fbbf24" },
  card: { label: "Tarjetas", icon: "credit-card", color: "#f43f5e" },
  server: { label: "Servidores & SSH", icon: "terminal", color: "#818cf8" },
  login: { label: "Inicios de Sesión", icon: "user", color: "#38bdf8" },
  favorites: { label: "Favoritos", icon: "star-filled", color: "#fbbf24" },
};

// Plantillas rápidas para agregar servicios populares con 1 clic
const POPULAR_TEMPLATES = [
  { name: "Google / Gmail", category: "email" as VaultCategory, url: "https://accounts.google.com", icon: "user" },
  { name: "Netflix", category: "streaming" as VaultCategory, url: "https://www.netflix.com", icon: "dashboard" },
  { name: "Spotify", category: "streaming" as VaultCategory, url: "https://open.spotify.com", icon: "cloud" },
  { name: "Discord", category: "app" as VaultCategory, url: "https://discord.com", icon: "terminal" },
  { name: "Instagram", category: "social" as VaultCategory, url: "https://www.instagram.com", icon: "user" },
  { name: "GitHub", category: "api_key" as VaultCategory, url: "https://github.com", icon: "code" },
  { name: "Steam", category: "app" as VaultCategory, url: "https://store.steampowered.com", icon: "project" },
  { name: "Amazon", category: "website" as VaultCategory, url: "https://www.amazon.com", icon: "cloud" },
  { name: "WhatsApp Web", category: "app" as VaultCategory, url: "https://web.whatsapp.com", icon: "terminal" },
];

export const VaultModal: React.FC<VaultModalProps> = ({ isOpen, onClose }) => {
  const {
    isUnlocked,
    hasMasterPasswordSet,
    selectedCategory,
    selectedItemId,
    searchQuery,
    decryptedItems,
    unlockVault,
    setupMasterPassword,
    lockVault,
    saveItem,
    deleteItem,
    toggleFavorite,
    setSelectedCategory,
    setSelectedItemId,
    setSearchQuery,
    getSecurityAudit,
    exportVaultBackup,
    importVaultBackup,
  } = useVaultStore();

  // Estados de desbloqueo
  const [masterPasswordInput, setMasterPasswordInput] = useState("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");
  const [unlockError, setUnlockError] = useState("");
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [showMasterPass, setShowMasterPass] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados de edición de item
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<DecryptedVaultItem>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Estados del Generador de Contraseñas
  const [isGenOpen, setIsGenOpen] = useState(false);
  const [genOptions, setGenOptions] = useState<PasswordGeneratorOptions>({
    length: 18,
    useUppercase: true,
    useLowercase: true,
    useNumbers: true,
    useSymbols: true,
    mode: "random",
    wordCount: 4,
    wordSeparator: "-",
  });
  const [generatedPassword, setGeneratedPassword] = useState("");

  // Estado de TOTP (2FA) en vivo
  const [totpCode, setTotpCode] = useState<string>("------");
  const [totpRemaining, setTotpRemaining] = useState<number>(30);

  // Auditoría de salud de seguridad
  const audit = useMemo(() => getSecurityAudit(), [decryptedItems, isUnlocked]);

  // Item seleccionado actualmente
  const selectedItem = useMemo(() => {
    return decryptedItems.find((i) => i.id === selectedItemId) || null;
  }, [decryptedItems, selectedItemId]);

  // Items filtrados
  const filteredItems = useMemo(() => {
    return decryptedItems.filter((item) => {
      if (selectedCategory === "favorites" && !item.isFavorite) return false;
      if (selectedCategory !== "all" && selectedCategory !== "favorites") {
        if (selectedCategory === "website" && item.category === "login") return true;
        if (item.category !== selectedCategory) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchUser = item.username?.toLowerCase().includes(q);
        const matchUrl = item.websiteUrl?.toLowerCase().includes(q);
        const matchNotes = item.notes?.toLowerCase().includes(q);
        if (!matchTitle && !matchUser && !matchUrl && !matchNotes) return false;
      }
      return true;
    });
  }, [decryptedItems, selectedCategory, searchQuery]);

  // Generar contraseña al abrir el generador
  useEffect(() => {
    if (isGenOpen) {
      setGeneratedPassword(generateSmartPassword(genOptions));
    }
  }, [isGenOpen, genOptions]);

  // Temporizador y cálculo de TOTP (2FA)
  useEffect(() => {
    if (!selectedItem?.totpSecret || !isUnlocked) return;

    let isMounted = true;
    const updateTotp = async () => {
      if (!selectedItem.totpSecret) return;
      const res = await generateTOTPCode(selectedItem.totpSecret);
      if (isMounted) {
        setTotpCode(res.code);
        setTotpRemaining(res.remainingSeconds);
      }
    };

    updateTotp();
    const interval = setInterval(updateTotp, 1000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedItem?.totpSecret, isUnlocked]);

  if (!isOpen) return null;

  // ----------------------------------------------------
  // Controladores de eventos
  // ----------------------------------------------------

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!masterPasswordInput) return;
    setIsSubmitting(true);
    setUnlockError("");

    if (!hasMasterPasswordSet || isSettingUp) {
      if (masterPasswordInput !== confirmPasswordInput) {
        setUnlockError("Las contraseñas maestras no coinciden.");
        setIsSubmitting(false);
        return;
      }
      if (masterPasswordInput.length < 6) {
        setUnlockError("La contraseña maestra debe tener al menos 6 caracteres.");
        setIsSubmitting(false);
        return;
      }

      await setupMasterPassword(masterPasswordInput);
      setIsSettingUp(false);
      setIsSubmitting(false);
    } else {
      const res = await unlockVault(masterPasswordInput);
      setIsSubmitting(false);
      if (!res.success) {
        setUnlockError(res.error || "Contraseña maestra incorrecta.");
      }
    }
  };

  const handleCopy = (text: string | undefined, fieldName: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const startCreateNewItem = (category: VaultCategory = "website") => {
    const newItem: Partial<DecryptedVaultItem> = {
      title: "Nueva Cuenta",
      category,
      username: "",
      password: generateSmartPassword({ length: 18, useNumbers: true, useSymbols: true, useUppercase: true, useLowercase: true }),
      websiteUrl: "",
      notes: "",
      isFavorite: false,
      tags: [],
      customFields: [],
    };
    setEditFormData(newItem);
    setIsEditing(true);
  };

  const applyTemplate = (template: typeof POPULAR_TEMPLATES[0]) => {
    setEditFormData({
      ...editFormData,
      title: template.name,
      category: template.category,
      websiteUrl: template.url,
      icon: template.icon,
    });
  };

  const handleSaveItem = async () => {
    if (!editFormData.title?.trim()) return;
    const currentPass = masterPasswordInput || "vault_master_key";
    await saveItem(
      {
        id: editFormData.id,
        title: editFormData.title.trim(),
        category: editFormData.category || "website",
        username: editFormData.username || "",
        password: editFormData.password || "",
        websiteUrl: editFormData.websiteUrl || "",
        notes: editFormData.notes || "",
        totpSecret: editFormData.totpSecret || "",
        customFields: editFormData.customFields || [],
        isFavorite: editFormData.isFavorite || false,
        tags: editFormData.tags || [],
        cardNumber: editFormData.cardNumber,
        cardHolder: editFormData.cardHolder,
        cardExpMonth: editFormData.cardExpMonth,
        cardExpYear: editFormData.cardExpYear,
        cardCvv: editFormData.cardCvv,
        serverHost: editFormData.serverHost,
        serverPort: editFormData.serverPort,
        serverPrivateKey: editFormData.serverPrivateKey,
      },
      currentPass
    );
    setIsEditing(false);
  };

  // ----------------------------------------------------
  // PANTALLA DE DESBLOQUEO / INICIALIZACIÓN
  // ----------------------------------------------------
  if (!isUnlocked) {
    const isNewVault = !hasMasterPasswordSet || isSettingUp;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in">
        <div className="relative w-full max-w-md p-8 overflow-hidden rounded-3xl border border-white/10 bg-slate-950/90 shadow-2xl shadow-cyan-950/50 text-white">
          {/* Resplandor ambiental */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Botón Cerrar */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          >
            <Icon name="close" size={16} />
          </button>

          {/* Icono y Título */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 to-emerald-500 p-0.5 shadow-lg shadow-cyan-500/30 mb-4 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Icon name="shield" size={32} className="text-cyan-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              CipherVault
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
              {isNewVault
                ? "Configura tu Contraseña Maestra. Tus cuentas y claves se cifrarán localmente con AES-256-GCM."
                : "Ingresa tu Contraseña Maestra para descifrar tus cuentas, páginas web y aplicaciones."}
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                {isNewVault ? "Crear Contraseña Maestra" : "Contraseña Maestra"}
              </label>
              <div className="relative">
                <input
                  type={showMasterPass ? "text" : "password"}
                  value={masterPasswordInput}
                  onChange={(e) => setMasterPasswordInput(e.target.value)}
                  placeholder="Ingresa tu contraseña maestra..."
                  autoFocus
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowMasterPass(!showMasterPass)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-white"
                >
                  <Icon name={showMasterPass ? "eye-off" : "eye"} size={16} />
                </button>
              </div>

              {isNewVault && masterPasswordInput && (
                <div className="mt-2 space-y-1">
                  {(() => {
                    const h = evaluatePasswordHealth(masterPasswordInput);
                    return (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Seguridad:</span>
                          <span style={{ color: h.color }} className="font-semibold">{h.rating} ({h.score}%)</span>
                        </div>
                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full transition-all duration-300" style={{ width: `${h.score}%`, backgroundColor: h.color }} />
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {isNewVault && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Confirmar Contraseña Maestra
                </label>
                <input
                  type={showMasterPass ? "text" : "password"}
                  value={confirmPasswordInput}
                  onChange={(e) => setConfirmPasswordInput(e.target.value)}
                  placeholder="Vuelve a escribir la contraseña..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm transition-all"
                />
              </div>
            )}

            {unlockError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
                <Icon name="close" size={14} />
                <span>{unlockError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !masterPasswordInput}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/25 hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Icon name={isNewVault ? "shield" : "unlock"} size={16} />
              <span>{isSubmitting ? "Descifrando bóveda..." : isNewVault ? "Inicializar Bóveda Segura" : "Desbloquear Bóveda"}</span>
            </button>
          </form>

          {/* Botón rápido de demostración */}
          {!hasMasterPasswordSet && (
            <div className="mt-4 pt-4 border-t border-white/5 text-center">
              <button
                type="button"
                onClick={() => {
                  setMasterPasswordInput("AdminVault2026!");
                  setConfirmPasswordInput("AdminVault2026!");
                }}
                className="text-[11px] text-cyan-400/80 hover:text-cyan-300 underline underline-offset-2"
              >
                Usar Contraseña Rápida de Prueba (AdminVault2026!)
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // VISTA PRINCIPAL (BÓVEDA DESBLOQUEADA)
  // ----------------------------------------------------
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/85 backdrop-blur-2xl animate-fade-in text-white">
      <div className="relative w-full max-w-7xl h-[90vh] flex flex-col rounded-3xl border border-white/10 bg-slate-950/95 shadow-2xl shadow-cyan-950/40 overflow-hidden">
        
        {/* BARRA SUPERIOR */}
        <header className="px-6 py-4 border-b border-white/10 bg-white/[0.02] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-400 p-0.5 flex items-center justify-center shadow-md shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Icon name="shield" size={20} className="text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white">CipherVault</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Cifrado AES-256 Activo
                </span>
              </div>
              <p className="text-xs text-slate-400">Gestor Seguro de Contraseñas, Sitios Web y Aplicaciones</p>
            </div>
          </div>

          {/* Puntuación de Salud de Seguridad */}
          <div className="hidden md:flex items-center gap-6 px-4 py-1.5 rounded-2xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Salud de Seguridad</div>
                <div className="text-sm font-bold" style={{ color: audit.overallScore >= 80 ? "#10b981" : "#f59e0b" }}>
                  {audit.overallScore}% Protegido
                </div>
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-white/10 flex items-center justify-center font-mono text-xs font-bold" style={{ borderColor: audit.overallScore >= 80 ? "#10b981" : "#f59e0b" }}>
                {audit.total}
              </div>
            </div>

            {audit.weakCount > 0 && (
              <span className="text-[11px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                ⚠️ {audit.weakCount} débiles
              </span>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsGenOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-cyan-300 hover:text-cyan-200 transition-all flex items-center gap-1.5"
            >
              <Icon name="refresh" size={14} />
              <span className="hidden sm:inline">Generador</span>
            </button>

            <button
              onClick={() => startCreateNewItem("website")}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:opacity-95 text-slate-950 text-xs font-bold shadow-md shadow-cyan-500/20 transition-all flex items-center gap-1.5"
            >
              <Icon name="plus" size={14} />
              <span>+ Guardar Contraseña</span>
            </button>

            <button
              onClick={lockVault}
              title="Bloquear Bóveda"
              className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-slate-400 border border-white/10 transition-all"
            >
              <Icon name="lock" size={16} />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-all"
            >
              <Icon name="close" size={16} />
            </button>
          </div>
        </header>

        {/* CUERPO DEL ESPACIO DE TRABAJO */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* PANEL LATERAL IZQUIERDO: Categorías de Sitios & Apps */}
          <aside className="w-64 border-r border-white/10 bg-black/30 p-4 flex flex-col justify-between shrink-0 hidden lg:flex">
            <div className="space-y-5">
              {/* Lista de Categorías */}
              <div className="space-y-1">
                <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 px-3 mb-2">Categorías</div>
                {(["all", "website", "app", "email", "social", "streaming", "api_key", "note", "favorites"] as const).map((cat) => {
                  const conf = CATEGORY_CONFIG[cat];
                  const count = cat === "all"
                    ? decryptedItems.length
                    : cat === "favorites"
                    ? decryptedItems.filter((i) => i.isFavorite).length
                    : cat === "website"
                    ? decryptedItems.filter((i) => i.category === "website" || i.category === "login").length
                    : decryptedItems.filter((i) => i.category === cat).length;
                  const isActive = selectedCategory === cat;

                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full px-3 py-2 rounded-xl flex items-center justify-between text-xs font-medium transition-all ${
                        isActive
                          ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm"
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon name={conf.icon} size={15} style={{ color: conf.color }} />
                        <span>{conf.label}</span>
                      </div>
                      <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono bg-white/5 text-slate-400">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Resumen de Seguridad */}
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <Icon name="shield" size={13} className="text-cyan-400" />
                    Estado del Vault
                  </span>
                  <span className="text-emerald-400 font-mono">{audit.overallScore}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-500"
                    style={{ width: `${audit.overallScore}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Protegidas con 2FA</span>
                    <span className="text-cyan-300 font-mono">{audit.totpCount} cuentas</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Claves Reutilizadas</span>
                    <span className="text-amber-300 font-mono">{audit.reusedCount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Acciones de Copia de Seguridad */}
            <div className="pt-4 border-t border-white/5 flex gap-2">
              <button
                onClick={async () => {
                  const backup = await exportVaultBackup(masterPasswordInput);
                  const blob = new Blob([backup], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `ciphervault-respaldo-${new Date().toISOString().slice(0, 10)}.json`;
                  a.click();
                }}
                className="flex-1 py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-medium text-slate-400 hover:text-white flex items-center justify-center gap-1"
              >
                <Icon name="download" size={12} />
                Exportar
              </button>
              <label className="flex-1 py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-medium text-slate-400 hover:text-white flex items-center justify-center gap-1 cursor-pointer">
                <Icon name="upload" size={12} />
                Importar
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const text = await file.text();
                    await importVaultBackup(text, masterPasswordInput);
                  }}
                />
              </label>
            </div>
          </aside>

          {/* COLUMNA CENTRAL: Búsqueda y Lista de Cuentas */}
          <section className="w-full sm:w-80 lg:w-96 border-r border-white/10 flex flex-col shrink-0 bg-slate-950/50">
            {/* Cabecera de Búsqueda */}
            <div className="p-3 border-b border-white/10">
              <div className="relative">
                <Icon name="search" size={15} className="absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar cuentas, páginas, correos..."
                  className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Lista de Elementos */}
            <div className="flex-1 overflow-y-auto divide-y divide-white/5 p-2 space-y-1">
              {filteredItems.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  <Icon name="key" size={28} className="mx-auto mb-2 opacity-40" />
                  No hay contraseñas guardadas en esta categoría.
                </div>
              ) : (
                filteredItems.map((item) => {
                  const conf = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.website;
                  const isSelected = selectedItemId === item.id;

                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelectedItemId(item.id);
                        setIsEditing(false);
                      }}
                      className={`p-3 rounded-2xl cursor-pointer transition-all flex items-center justify-between gap-3 group ${
                        isSelected
                          ? "bg-cyan-500/15 border border-cyan-500/30"
                          : "hover:bg-white/5 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${conf.color}15`, border: `1px solid ${conf.color}30` }}
                        >
                          <Icon name={conf.icon} size={16} style={{ color: conf.color }} />
                        </div>
                        <div className="truncate">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                              {item.title}
                            </span>
                            {item.isFavorite && <Icon name="star-filled" size={11} className="text-amber-400 shrink-0" />}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {item.username || item.websiteUrl || "Sin usuario"}
                          </div>
                        </div>
                      </div>

                      {/* Botón rápido de copia al pasar el mouse */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.totpSecret && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-cyan-500/20 text-cyan-300">2FA</span>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(item.password, item.id);
                          }}
                          title="Copiar Contraseña"
                          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300"
                        >
                          <Icon name={copiedField === item.id ? "check" : "copy"} size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* COLUMNA DERECHA: Detalle y Editor de Cuenta */}
          <main className="flex-1 bg-black/20 overflow-y-auto p-6 flex flex-col">
            {isEditing ? (
              /* FORMULARIO DE EDICIÓN O NUEVA CUENTA */
              <div className="max-w-2xl w-full mx-auto space-y-6 animate-fade-in">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Icon name="edit" size={18} className="text-cyan-400" />
                    {editFormData.id ? "Editar Cuenta" : "Guardar Nueva Contraseña"}
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-400"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveItem}
                      className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20"
                    >
                      Guardar Datos
                    </button>
                  </div>
                </div>

                {/* Plantillas Rápidas si es nuevo */}
                {!editFormData.id && (
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-2">
                      ⚡ Plantillas Rápidas (Autocompletar servicio):
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {POPULAR_TEMPLATES.map((tmpl) => (
                        <button
                          key={tmpl.name}
                          type="button"
                          onClick={() => applyTemplate(tmpl)}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-300 text-[11px] font-medium text-slate-300 border border-white/5 transition-all"
                        >
                          + {tmpl.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Categoría y Nombre de la Página/App */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Categoría</label>
                      <select
                        value={editFormData.category || "website"}
                        onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value as VaultCategory })}
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                      >
                        <option value="website" className="bg-slate-900">Páginas & Sitios Web</option>
                        <option value="app" className="bg-slate-900">Aplicaciones & Móvil</option>
                        <option value="email" className="bg-slate-900">Cuentas de Correo</option>
                        <option value="social" className="bg-slate-900">Redes Sociales</option>
                        <option value="streaming" className="bg-slate-900">Streaming & Música</option>
                        <option value="api_key" className="bg-slate-900">Claves API & Dev</option>
                        <option value="note" className="bg-slate-900">Notas Seguras</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Nombre de la Página o App</label>
                      <input
                        type="text"
                        value={editFormData.title || ""}
                        onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                        placeholder="ej: Google, Netflix, Spotify, Banco..."
                        className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  {/* Usuario/Email y Contraseña */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Usuario / Correo Electrónico</label>
                      <input
                        type="text"
                        value={editFormData.username || ""}
                        onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                        placeholder="tu_correo@gmail.com o usuario"
                        className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Contraseña</label>
                        <button
                          type="button"
                          onClick={() => setEditFormData({ ...editFormData, password: generateSmartPassword({ length: 20, useNumbers: true, useSymbols: true }) })}
                          className="text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold"
                        >
                          Generar Segura
                        </button>
                      </div>
                      <input
                        type="text"
                        value={editFormData.password || ""}
                        onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                        placeholder="Escribe o genera la contraseña..."
                        className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>
                  </div>

                  {/* Enlace Web & Clave 2FA */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Enlace / URL de la Página Web</label>
                      <input
                        type="url"
                        value={editFormData.websiteUrl || ""}
                        onChange={(e) => setEditFormData({ ...editFormData, websiteUrl: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Secreto 2FA / TOTP (Opcional)</label>
                      <input
                        type="text"
                        value={editFormData.totpSecret || ""}
                        onChange={(e) => setEditFormData({ ...editFormData, totpSecret: e.target.value })}
                        placeholder="ej: JBSWY3DPEHPK3PXP"
                        className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 font-mono uppercase"
                      />
                    </div>
                  </div>

                  {/* Notas Seguras */}
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Notas y Detalles Protegidos</label>
                    <textarea
                      rows={4}
                      value={editFormData.notes || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                      placeholder="Añade notas privadas, respuestas de seguridad, códigos de recuperación..."
                      className="w-full p-3.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 leading-relaxed resize-none"
                    />
                  </div>
                </div>
              </div>
            ) : selectedItem ? (
              /* VISTA DE DETALLE DE LA CUENTA */
              <div className="max-w-2xl w-full mx-auto space-y-6 animate-fade-in">
                {/* Cabecera */}
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3.5">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: `${CATEGORY_CONFIG[selectedItem.category]?.color || "#38bdf8"}20`,
                        border: `1px solid ${CATEGORY_CONFIG[selectedItem.category]?.color || "#38bdf8"}40`,
                      }}
                    >
                      <Icon
                        name={CATEGORY_CONFIG[selectedItem.category]?.icon || "key"}
                        size={22}
                        style={{ color: CATEGORY_CONFIG[selectedItem.category]?.color }}
                      />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">{selectedItem.title}</h2>
                      <span className="text-xs text-slate-400">{CATEGORY_CONFIG[selectedItem.category]?.label}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleFavorite(selectedItem.id, masterPasswordInput)}
                      className={`p-2 rounded-xl border border-white/10 transition-all ${
                        selectedItem.isFavorite ? "bg-amber-500/20 text-amber-400 border-amber-500/30" : "bg-white/5 text-slate-400 hover:text-white"
                      }`}
                      title={selectedItem.isFavorite ? "Quitar de favoritos" : "Marcar como favorito"}
                    >
                      <Icon name={selectedItem.isFavorite ? "star-filled" : "star"} size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setEditFormData({ ...selectedItem });
                        setIsEditing(true);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 flex items-center gap-1.5"
                    >
                      <Icon name="edit" size={14} />
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={() => deleteItem(selectedItem.id)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-white/10"
                      title="Eliminar cuenta"
                    >
                      <Icon name="trash" size={16} />
                    </button>
                  </div>
                </div>

                {/* Tarjetas de Datos Principales */}
                <div className="space-y-3">
                  {/* Tarjeta Usuario / Email */}
                  {selectedItem.username && (
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between gap-4">
                      <div>
                        <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Usuario / Correo Electrónico</div>
                        <div className="text-sm font-medium text-white font-mono mt-0.5">{selectedItem.username}</div>
                      </div>
                      <button
                        onClick={() => handleCopy(selectedItem.username, "user")}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 flex items-center gap-1.5"
                      >
                        <Icon name={copiedField === "user" ? "check" : "copy"} size={13} />
                        <span>{copiedField === "user" ? "¡Copiado!" : "Copiar"}</span>
                      </button>
                    </div>
                  )}

                  {/* Tarjeta Contraseña */}
                  {selectedItem.password && (
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2.5">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Contraseña</div>
                          <div className="text-sm font-bold text-cyan-300 font-mono mt-0.5 tracking-wider">
                            {showPassword ? selectedItem.password : "••••••••••••••••••••"}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setShowPassword(!showPassword)}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                            title={showPassword ? "Ocultar" : "Mostrar contraseña"}
                          >
                            <Icon name={showPassword ? "eye-off" : "eye"} size={14} />
                          </button>
                          <button
                            onClick={() => handleCopy(selectedItem.password, "pass")}
                            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 text-xs font-semibold text-cyan-300 flex items-center gap-1.5"
                          >
                            <Icon name={copiedField === "pass" ? "check" : "copy"} size={13} />
                            <span>{copiedField === "pass" ? "¡Copiada!" : "Copiar Contraseña"}</span>
                          </button>
                        </div>
                      </div>

                      {/* Medidor de Seguridad de la Contraseña */}
                      {(() => {
                        const h = evaluatePasswordHealth(selectedItem.password);
                        return (
                          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                            <span className="text-slate-400 text-[11px]">Nivel de Seguridad:</span>
                            <span className="font-semibold" style={{ color: h.color }}>{h.rating} ({h.score}%)</span>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Tarjeta de Código 2FA / TOTP en Tiempo Real */}
                  {selectedItem.totpSecret && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-slate-900/60 border border-cyan-500/30 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center font-mono font-bold text-xs text-cyan-300">
                          {totpRemaining}s
                        </div>
                        <div>
                          <div className="text-[10px] uppercase font-semibold text-cyan-400 tracking-wider flex items-center gap-1">
                            <span>Código de Verificación 2FA</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                          </div>
                          <div className="text-2xl font-black tracking-widest text-white font-mono mt-0.5">
                            {totpCode.slice(0, 3)} {totpCode.slice(3)}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleCopy(totpCode, "totp")}
                        className="px-3.5 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 hover:opacity-90 flex items-center gap-1.5"
                      >
                        <Icon name={copiedField === "totp" ? "check" : "copy"} size={13} />
                        <span>{copiedField === "totp" ? "¡Copiado!" : "Copiar Código"}</span>
                      </button>
                    </div>
                  )}

                  {/* Tarjeta Enlace Web con Apertura Directa */}
                  {selectedItem.websiteUrl && (
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between gap-4">
                      <div className="truncate">
                        <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Sitio Web / Aplicación</div>
                        <div className="text-xs font-medium text-slate-300 truncate mt-0.5">{selectedItem.websiteUrl}</div>
                      </div>
                      <a
                        href={selectedItem.websiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-xs font-semibold text-cyan-400 flex items-center gap-1.5 shrink-0 transition-colors"
                      >
                        <span>Abrir Sitio</span>
                        <Icon name="external-link" size={12} />
                      </a>
                    </div>
                  )}

                  {/* Notas Seguras */}
                  {selectedItem.notes && (
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1.5">
                      <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Notas Privadas</div>
                      <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{selectedItem.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-xs text-center">
                <Icon name="shield" size={40} className="opacity-30 mb-3" />
                <p className="font-semibold text-slate-400">Selecciona una cuenta</p>
                <p className="text-slate-500 max-w-xs mt-1">Selecciona una página web o aplicación de la lista, o haz clic en "+ Guardar Contraseña" para registrar una nueva.</p>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* MODAL DEL GENERADOR DE CONTRASEÑAS */}
      {isGenOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl border border-cyan-500/30 bg-slate-950 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Icon name="refresh" size={16} className="text-cyan-400" />
                Generador de Contraseñas Seguras
              </h3>
              <button onClick={() => setIsGenOpen(false)} className="text-slate-400 hover:text-white">
                <Icon name="close" size={16} />
              </button>
            </div>

            {/* Salida Generada */}
            <div className="p-4 rounded-2xl bg-white/5 border border-cyan-500/40 flex items-center justify-between gap-3">
              <span className="text-base font-bold font-mono text-cyan-300 truncate select-all">{generatedPassword}</span>
              <button
                onClick={() => handleCopy(generatedPassword, "gen")}
                className="px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs shrink-0"
              >
                {copiedField === "gen" ? "¡Copiada!" : "Copiar"}
              </button>
            </div>

            {/* Controles */}
            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Longitud:</span>
                  <span className="font-mono font-bold text-cyan-400">{genOptions.length} caracteres</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="40"
                  value={genOptions.length}
                  onChange={(e) => setGenOptions({ ...genOptions, length: parseInt(e.target.value) })}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <label className="flex items-center gap-2 p-2 rounded-xl bg-white/5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={genOptions.useUppercase}
                    onChange={(e) => setGenOptions({ ...genOptions, useUppercase: e.target.checked })}
                    className="accent-cyan-400"
                  />
                  <span>Mayúsculas (A-Z)</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded-xl bg-white/5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={genOptions.useLowercase}
                    onChange={(e) => setGenOptions({ ...genOptions, useLowercase: e.target.checked })}
                    className="accent-cyan-400"
                  />
                  <span>Minúsculas (a-z)</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded-xl bg-white/5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={genOptions.useNumbers}
                    onChange={(e) => setGenOptions({ ...genOptions, useNumbers: e.target.checked })}
                    className="accent-cyan-400"
                  />
                  <span>Números (0-9)</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded-xl bg-white/5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={genOptions.useSymbols}
                    onChange={(e) => setGenOptions({ ...genOptions, useSymbols: e.target.checked })}
                    className="accent-cyan-400"
                  />
                  <span>Símbolos (!@#$)</span>
                </label>
              </div>
            </div>

            <button
              onClick={() => setGeneratedPassword(generateSmartPassword(genOptions))}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white flex items-center justify-center gap-2"
            >
              <Icon name="refresh" size={14} />
              Generar Otra Contraseña
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
