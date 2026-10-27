(function () {
  const STORAGE_KEY = "qingyan.lang";
  // Fill with the numeric Apple ID from App Store Connect after release.
  const APP_STORE_ID = "";
  const APP_STORE_URL = APP_STORE_ID ? `https://apps.apple.com/app/id${APP_STORE_ID}` : "";

  function normalizeLang(raw) {
    if (!raw) return null;
    const value = String(raw).toLowerCase().replace(/_/g, "-");
    if (value.startsWith("zh-hant") || value.startsWith("zh-tw") || value.startsWith("zh-hk") || value.startsWith("zh-mo")) {
      return "zh-Hant";
    }
    if (value.startsWith("zh")) return "zh-Hans";
    if (value.startsWith("ja")) return "ja";
    if (value.startsWith("ko")) return "ko";
    if (value.startsWith("en")) return "en";
    return null;
  }

  function detectLang() {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = normalizeLang(params.get("lang"));
    if (fromQuery && SITE_I18N[fromQuery]) return fromQuery;

    const fromStorage = localStorage.getItem(STORAGE_KEY);
    if (fromStorage && SITE_I18N[fromStorage]) return fromStorage;

    const nav = navigator.languages || [navigator.language];
    for (const lang of nav) {
      const normalized = normalizeLang(lang);
      if (normalized && SITE_I18N[normalized]) return normalized;
    }
    return DEFAULT_LANG;
  }

  function screenshotBase(lang) {
    const folder = LOCALE_SCREENSHOT_FOLDER[lang] || LOCALE_SCREENSHOT_FOLDER[DEFAULT_LANG];
    return `assets/screenshots/${folder}/`;
  }

  function applyStore(strings) {
    document.querySelectorAll("#app-store-link, #app-store-link-bottom").forEach((link) => {
      if (APP_STORE_URL) {
        link.href = APP_STORE_URL;
        link.removeAttribute("aria-disabled");
        link.classList.remove("is-pending");
        link.textContent = strings.download;
      } else {
        link.removeAttribute("href");
        link.setAttribute("aria-disabled", "true");
        link.classList.add("is-pending");
        link.textContent = strings.comingSoon;
      }
    });
  }

  function applyLang(lang) {
    const strings = SITE_I18N[lang] || SITE_I18N[DEFAULT_LANG];
    document.documentElement.lang = lang;

    document.querySelectorAll("[data-i18n]").forEach((node) => {
      const key = node.getAttribute("data-i18n");
      if (strings[key]) node.textContent = strings[key];
    });

    document.title = strings.metaTitle;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", strings.metaDescription);

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", strings.metaTitle);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", strings.metaDescription);

    const base = screenshotBase(lang);
    document.querySelectorAll("[data-screenshot]").forEach((img) => {
      const file = img.getAttribute("data-screenshot");
      img.dataset.fallbackTried = "";
      img.onerror = () => {
        if (img.dataset.fallbackTried) return;
        img.dataset.fallbackTried = "1";
        img.src = `assets/screenshots/en/${file}`;
      };
      img.src = `${base}${file}`;
      img.alt = strings.appName;
    });

    document.querySelectorAll(".lang-switcher button").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.lang === lang);
    });

    applyStore(strings);
    localStorage.setItem(STORAGE_KEY, lang);
  }

  function initLangSwitcher() {
    document.querySelectorAll(".lang-switcher button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const lang = btn.dataset.lang;
        if (!SITE_I18N[lang]) return;
        applyLang(lang);
        const url = new URL(window.location.href);
        url.searchParams.set("lang", lang);
        history.replaceState({}, "", url);
      });
    });
  }

  applyLang(detectLang());
  initLangSwitcher();
})();
