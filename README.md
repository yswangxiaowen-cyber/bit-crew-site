# Bit-Crew Netlify Site

This is a static Netlify-ready company website for 株式会社ビット・クルー.

The site has:

- Company profile and service sections
- News list and news detail pages
- Decap CMS admin at `/admin/` for editing `data/news.json`

## Deploy

1. Create a new site on Netlify.
2. Connect it to a Git repository. CMS editing requires Git-backed deploys.
3. Publish directory: `.`
4. Build command: leave empty.

## Preview

For the most accurate local preview, open:

- `http://localhost:8090`

You can also open `index.html` directly in a browser. Styles and images use relative paths so the page will render correctly, but the dynamic news JSON may depend on browser security rules when opened as a local file.

## News

News content is stored in:

- `data/news.json`

The front page renders the latest 4 news items. `/news.html` shows all items. Detail pages use:

- `/news.html?id=NEWS_ID`

## Admin CMS

Open `/admin/` after deployment.

To enable CMS login on Netlify:

1. Enable Identity: Site configuration -> Identity -> Enable Identity.
2. Enable Git Gateway: Identity -> Services -> Git Gateway.
3. Invite the admin email address under Identity users.
4. Log in at `/admin/`.
5. Edit "お知らせ" and publish.

The CMS edits `data/news.json` and commits the change to the connected Git repository.
