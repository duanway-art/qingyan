(function () {
  const STORAGE_KEY = "qingyan.lang";
  const DEFAULT_LANG = "en";

  const BACK_LABEL = {
    "zh-Hans": "返回首页",
    "zh-Hant": "返回首頁",
    en: "Back to home",
    ja: "ホームに戻る",
    ko: "홈으로 돌아가기",
  };

  const BRAND = {
    "zh-Hans": "祖坟冒烟",
    "zh-Hant": "祖蔭",
    en: "Benison",
    ja: "加護",
    ko: "음덕",
  };

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
    if (fromQuery && window.LEGAL_CONTENT?.documents?.privacy?.[fromQuery]) return fromQuery;

    const fromStorage = localStorage.getItem(STORAGE_KEY);
    if (fromStorage && window.LEGAL_CONTENT?.documents?.privacy?.[fromStorage]) return fromStorage;

    const nav = navigator.languages || [navigator.language];
    for (const lang of nav) {
      const normalized = normalizeLang(lang);
      if (normalized && window.LEGAL_CONTENT?.documents?.privacy?.[normalized]) return normalized;
    }
    return DEFAULT_LANG;
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function sectionHtml(sections) {
    return sections
      .map(
        (section) => `
          <article class="legal-section">
            <h2>${escapeHtml(section.title)}</h2>
            <p class="legal-section-body">${escapeHtml(section.body)}</p>
          </article>`
      )
      .join("");
  }

  function render(documentKind, lang) {
    const content = window.LEGAL_CONTENT;
    if (!content) return;

    const sections = content.documents?.[documentKind]?.[lang]
      || content.documents?.[documentKind]?.[DEFAULT_LANG]
      || [];
    const title = content.titles?.[documentKind]?.[lang]
      || content.titles?.[documentKind]?.[DEFAULT_LANG]
      || "";
    const brand = BRAND[lang] || BRAND.en;

    document.documentElement.lang = lang;
    document.title = `${title} · ${brand}`;

    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", title);

    const titleEl = document.getElementById("legal-title");
    const updatedEl = document.getElementById("legal-updated");
    const bodyEl = document.getElementById("legal-sections");
    const backEl = document.getElementById("legal-back");
    const brandEl = document.getElementById("legal-brand");
    const footerBrand = document.getElementById("legal-footer-brand");
    const privacyLink = document.getElementById("legal-link-privacy");
    const termsLink = document.getElementById("legal-link-terms");

    if (titleEl) titleEl.textContent = title;
    if (updatedEl) updatedEl.textContent = content.updated?.[lang] || content.updated?.[DEFAULT_LANG] || "";
    if (backEl) backEl.textContent = BACK_LABEL[lang] || BACK_LABEL.en;
    if (brandEl) brandEl.textContent = brand;
    if (footerBrand) footerBrand.textContent = `© ${brand}`;
    if (privacyLink) privacyLink.textContent = content.titles.privacy[lang] || content.titles.privacy[DEFAULT_LANG];
    if (termsLink) termsLink.textContent = content.titles.terms[lang] || content.titles.terms[DEFAULT_LANG];

    if (bodyEl) {
      let html = sectionHtml(sections);
      if (documentKind === "terms") {
        const paymentTitle = content.titles.payment[lang] || content.titles.payment[DEFAULT_LANG];
        const payment = content.documents.payment[lang] || content.documents.payment[DEFAULT_LANG];
        html += `
          <section class="legal-appendix" id="payment">
            <h2 class="legal-appendix-title">${escapeHtml(paymentTitle)}</h2>
            ${sectionHtml(payment)}
          </section>`;
      }
      bodyEl.innerHTML = html;
    }

    document.querySelectorAll(".lang-switcher button").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.lang === lang);
    });

    localStorage.setItem(STORAGE_KEY, lang);
  }

  function initLangSwitcher(documentKind) {
    document.querySelectorAll(".lang-switcher button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const lang = btn.dataset.lang;
        if (!window.LEGAL_CONTENT?.documents?.privacy?.[lang]) return;
        render(documentKind, lang);
        const url = new URL(window.location.href);
        url.searchParams.set("lang", lang);
        history.replaceState({}, "", url);
      });
    });
  }

  const documentKind = document.body.dataset.document;
  if (!documentKind) return;

  const lang = detectLang();
  render(documentKind, lang);
  initLangSwitcher(documentKind);
})();
