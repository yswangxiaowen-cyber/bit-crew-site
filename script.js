const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".site-nav");

if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

const formatDate = (dateText) => dateText.replaceAll("-", ".");

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const sortNews = (items) =>
  [...items].sort((a, b) => String(b.date).localeCompare(String(a.date)));

const makeAutoId = (...parts) =>
  parts
    .filter(Boolean)
    .join("-")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^a-z0-9\u3040-\u30ff\u3400-\u9fff]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

const getNewsId = (item) => item.slug || makeAutoId(item.date, item.title);

const getServiceId = (item) => item.slug || makeAutoId(item.number, item.title);

const renderNewsItem = (item) => `
  <article>
    <time datetime="${escapeHtml(item.date)}">${formatDate(escapeHtml(item.date))}</time>
    <div>
      <p class="news-category">${escapeHtml(item.category)}</p>
      <h3><a href="news.html?id=${encodeURIComponent(getNewsId(item))}">${escapeHtml(item.title)}</a></h3>
      ${item.excerpt ? `<p>${escapeHtml(item.excerpt)}</p>` : ""}
    </div>
  </article>
`;

const renderNewsDetail = (item) => {
  const paragraphs = String(item.body ?? "")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replaceAll("\n", "<br>")}</p>`)
    .join("");

  return `
    <article class="news-detail-card">
      <a class="text-link" href="news.html">お知らせ一覧へ戻る</a>
      <p class="news-category">${escapeHtml(item.category)}</p>
      <time datetime="${escapeHtml(item.date)}">${formatDate(escapeHtml(item.date))}</time>
      <h2>${escapeHtml(item.title)}</h2>
      <div class="news-body">${paragraphs}</div>
    </article>
  `;
};

const loadTopNotice = async () => {
  const section = document.querySelector("[data-top-notice]");
  if (!section) return;

  try {
    const response = await fetch("data/top-notice.json", { cache: "no-store" });
    if (!response.ok) throw new Error("top notice data not found");

    const data = await response.json();
    if (data.enabled === false) {
      section.hidden = true;
      return;
    }

    const label = section.querySelector("[data-top-notice-label]");
    const date = section.querySelector("[data-top-notice-date]");
    const title = section.querySelector("[data-top-notice-title]");
    const excerpt = section.querySelector("[data-top-notice-excerpt]");
    const link = section.querySelector("[data-top-notice-link]");

    if (label) label.textContent = data.label || "Important Notice";
    if (date) {
      date.dateTime = data.date || "";
      date.textContent = data.date ? formatDate(data.date) : "";
    }
    if (title) title.textContent = data.title || "";
    if (excerpt) excerpt.textContent = data.excerpt || "";
    if (link) {
      link.textContent = data.linkText || "詳細を見る";
      link.href = data.linkUrl || "news.html";
      link.hidden = !data.linkUrl;
    }
  } catch (error) {
    console.warn(error);
  }
};

const renderServiceCard = (item) => `
  <a class="service-card" href="services.html#${encodeURIComponent(getServiceId(item))}">
    <span>${escapeHtml(item.number)}</span>
    <h3>${escapeHtml(item.title)}</h3>
    <p>${escapeHtml(item.summary)}</p>
    <strong>詳細を見る</strong>
  </a>
`;

const renderServiceSection = (section) => {
  const items = Array.isArray(section.items) ? section.items.filter(Boolean) : [];
  return `
    <div>
      <h3>${escapeHtml(section.title)}</h3>
      ${section.body ? `<p>${escapeHtml(section.body)}</p>` : ""}
      ${items.length ? `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : ""}
    </div>
  `;
};

const renderServiceDetail = (item) => `
  <article class="service-detail" id="${escapeHtml(getServiceId(item))}">
    <div class="service-detail-head">
      <span>${escapeHtml(item.number)}</span>
      ${item.label ? `<p class="label">${escapeHtml(item.label)}</p>` : ""}
      <h2>${escapeHtml(item.title)}</h2>
      <p>${escapeHtml(item.lead || item.summary)}</p>
    </div>
    <div class="service-detail-body">
      ${(item.sections || []).map(renderServiceSection).join("")}
    </div>
  </article>
`;

const loadServices = async () => {
  const listTargets = document.querySelectorAll("[data-services-list]");
  const detailTarget = document.querySelector("[data-services-detail]");
  const jumpTarget = document.querySelector("[data-services-jump]");

  if (!listTargets.length && !detailTarget && !jumpTarget) return;

  try {
    const response = await fetch("data/services.json", { cache: "no-store" });
    if (!response.ok) throw new Error("services data not found");

    const data = await response.json();
    const services = data.services || [];

    listTargets.forEach((target) => {
      target.innerHTML = services.map(renderServiceCard).join("");
    });

    if (jumpTarget) {
      jumpTarget.innerHTML = services
        .map((item) => `<a href="#${escapeHtml(getServiceId(item))}">${escapeHtml(item.title)}</a>`)
        .join("");
    }

    if (detailTarget) {
      detailTarget.innerHTML = services.map(renderServiceDetail).join("");
    }
  } catch (error) {
    console.warn(error);
  }
};

const renderRequirements = (items = []) => `
  <p class="label">Requirements</p>
  <dl>
    ${items
      .map((item) => `<div><dt>${escapeHtml(item.label)}</dt><dd>${escapeHtml(item.value)}</dd></div>`)
      .join("")}
  </dl>
`;

const renderCompanyProfile = (items = []) =>
  items
    .map(
      (item) =>
        `<div><dt>${escapeHtml(item.label)}</dt><dd>${escapeHtml(item.value).replaceAll("\n", "<br>")}</dd></div>`
    )
    .join("");

const renderCompanyPolicy = (items = []) =>
  items
    .map((item) => `<article><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.body)}</p></article>`)
    .join("");

const loadCompany = async () => {
  const headlineTargets = document.querySelectorAll("[data-company-headline]");
  const leadTargets = document.querySelectorAll("[data-company-lead]");
  const introTargets = document.querySelectorAll("[data-company-intro]");
  const valuesTargets = document.querySelectorAll("[data-company-values]");
  const profileTargets = document.querySelectorAll("[data-company-profile]");
  const policyTargets = document.querySelectorAll("[data-company-policy]");

  if (
    !headlineTargets.length &&
    !leadTargets.length &&
    !introTargets.length &&
    !valuesTargets.length &&
    !profileTargets.length &&
    !policyTargets.length
  ) {
    return;
  }

  try {
    const response = await fetch("data/company.json", { cache: "no-store" });
    if (!response.ok) throw new Error("company data not found");

    const data = await response.json();

    headlineTargets.forEach((target) => {
      target.textContent = data.headline || "";
    });

    leadTargets.forEach((target) => {
      target.textContent = data.lead || "";
    });

    introTargets.forEach((target) => {
      target.textContent = data.intro || "";
    });

    valuesTargets.forEach((target) => {
      target.innerHTML = (data.values || []).map((value) => `<span>${escapeHtml(value)}</span>`).join("");
    });

    profileTargets.forEach((target) => {
      target.innerHTML = renderCompanyProfile(data.profile || []);
    });

    policyTargets.forEach((target) => {
      target.innerHTML = renderCompanyPolicy(data.policy || []);
    });
  } catch (error) {
    console.warn(error);
  }
};

const loadRecruit = async () => {
  const summaries = document.querySelectorAll("[data-recruit-summary]");
  const introTargets = document.querySelectorAll("[data-recruit-intro]");
  const tagTargets = document.querySelectorAll("[data-recruit-tags]");
  const workTarget = document.querySelector("[data-recruit-work]");
  const pointsTarget = document.querySelector("[data-recruit-points]");

  if (!summaries.length && !introTargets.length && !tagTargets.length && !workTarget && !pointsTarget) return;

  try {
    const response = await fetch("data/recruit.json", { cache: "no-store" });
    if (!response.ok) throw new Error("recruit data not found");

    const data = await response.json();

    summaries.forEach((target) => {
      target.innerHTML = renderRequirements(data.requirements || []);
    });

    introTargets.forEach((target) => {
      target.textContent = data.intro || "";
    });

    tagTargets.forEach((target) => {
      target.innerHTML = (data.tags || []).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
    });

    if (workTarget) {
      workTarget.innerHTML = (data.work || [])
        .map((item) => `<article><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.body)}</p></article>`)
        .join("");
    }

    if (pointsTarget) {
      pointsTarget.innerHTML = (data.points || []).map((point) => `<li>${escapeHtml(point)}</li>`).join("");
    }
  } catch (error) {
    console.warn(error);
  }
};

const loadNews = async () => {
  const listTargets = document.querySelectorAll("[data-news-list]");
  const detailTarget = document.querySelector("[data-news-detail]");

  if (!listTargets.length && !detailTarget) return;

  try {
    const response = await fetch("data/news.json", { cache: "no-store" });
    if (!response.ok) throw new Error("news data not found");

    const data = await response.json();
    const items = sortNews(data.news || []);
    const currentId = new URLSearchParams(window.location.search).get("id");

    listTargets.forEach((target) => {
      const mode = target.dataset.newsList;
      const shownItems = mode === "home" ? items.slice(0, 4) : items;
      target.innerHTML = shownItems.map(renderNewsItem).join("");
    });

    if (detailTarget && currentId) {
      const item = items.find((entry) => getNewsId(entry) === currentId);
      if (item) {
        detailTarget.innerHTML = renderNewsDetail(item);
        document.title = `${item.title} | 株式会社ビット・クルー`;
        const list = document.querySelector('[data-news-list="all"]');
        if (list) list.hidden = true;
      } else {
        detailTarget.innerHTML = `
          <article class="news-detail-card">
            <p class="label">Not Found</p>
            <h2>お知らせが見つかりませんでした。</h2>
            <a class="button primary" href="news.html">一覧へ戻る</a>
          </article>
        `;
      }
    }
  } catch (error) {
    listTargets.forEach((target) => {
      target.innerHTML = '<p class="news-error">お知らせを読み込めませんでした。</p>';
    });
  }
};

loadServices();
loadCompany();
loadRecruit();
loadNews();
loadTopNotice();
