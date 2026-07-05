# Netlify Deploy Guide

## Recommended setup

Use GitHub + Netlify for this site.

This is the best option because the admin page saves edited content into JSON files in the GitHub repository, and Netlify redeploys automatically.

## Steps

1. Create a new GitHub repository, for example `bit-crew-site`.
2. Upload all files in this folder to that repository.
3. In Netlify, choose **Add new site**.
4. Choose **Import an existing project**.
5. Connect GitHub and select the repository.
6. Build settings:
   - Build command: leave empty
   - Publish directory: `.`
7. Deploy the site.
8. Add your company domain in Netlify Domain settings.

## Admin page

The admin page is:

```text
/admin/
```

The visible footer link is intentionally shown only as a small dot.

## Content files

The CMS edits these files:

- `data/news.json`
- `data/services.json`
- `data/recruit.json`

## Important

Do not use drag-and-drop deploy if you want the admin page to save edits.

Drag-and-drop is fine for previewing the public website, but the CMS needs a Git-backed repository to save changes.
