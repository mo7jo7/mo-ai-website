# LiteAI Lab Website

A fast, accessible, fully static website for the [LiteAI Lab YouTube channel](https://www.youtube.com/@LiteAILab).
Plain HTML, CSS and vanilla JavaScript. No backend, no build step, no external CDNs.
It works by double-clicking `index.html` and when hosted on GitHub Pages.

## What's inside

```
index.html          Home: hero, searchable/filterable video list, highlights
about.html          Mission, what viewers learn, content categories, milestones
contact.html        Contact form, social links, FAQ accordion
favicon.ico         16/32/48 px multi-size icon
site.webmanifest    Web app manifest (Android/PWA icons)
assets/
  css/styles.css    Design system (CSS variables, dark + light themes)
  js/main.js        Theme toggle, mobile menu, scroll reveal, contact form, SITE_CONFIG
  js/videos.js      Embedded video data + rendering, tag filters, search
  images/           Logo and all favicon/social variants
  generated/        Abstract tech/AI images used across the site
```

## 1. Upload to GitHub Pages

1. Create a GitHub account and sign in at <https://github.com>.
2. Click **New repository**. Name it, for example, `liteai-lab` (or `YOUR-USERNAME.github.io` to use the root address). Keep it **Public**.
3. Unzip this archive. Open the new repository and click **Add file > Upload files**.
4. Drag in **the contents** of the unzipped folder (so `index.html` sits at the top level of the repository, not inside a sub-folder), then click **Commit changes**.
5. Go to **Settings > Pages**. Under **Build and deployment**, set **Source** to *Deploy from a branch*, choose branch `main` and folder `/ (root)`, then **Save**.
6. After a minute or two the site is live at `https://YOUR-USERNAME.github.io/liteai-lab/` (or `https://YOUR-USERNAME.github.io/` for a user site).
7. **Update the social-preview URLs.** In each HTML file, search for `https://YOUR-USERNAME.github.io/liteai-lab/` (in the `og:` and `twitter:` meta tags) and replace it with your real site address. Social networks need absolute URLs to show the preview image.

All internal links and assets use relative paths, so the site works in a sub-folder or on a custom domain without changes.

## 2. Replace the logo

Your logo lives in `assets/images/`. If you get a new logo, **every variant must be regenerated**:

| File | Size |
|------|------|
| `assets/images/logo.png` | header logo (96 px high, shown at 44 px) |
| `assets/images/logo-large.png` | 512 x 512 |
| `favicon.ico` | 16, 32 and 48 px in one file |
| `assets/images/favicon-16x16.png` / `favicon-32x32.png` | 16 / 32 px |
| `assets/images/apple-touch-icon.png` | 180 x 180 |
| `assets/images/android-chrome-192x192.png` / `-512x512.png` | 192 / 512 px |
| `assets/images/og-image.png` | 1200 x 630 (logo centred on a branded background) |

Easiest option: use an online favicon generator such as **<https://realfavicongenerator.net>** (or <https://favicon.io>). Upload your logo, download the package, and copy the files over the ones above, keeping the **same file names**. For `logo.png`, `logo-large.png` and `og-image.png`, export from any image editor at the sizes in the table.

Tip: use a square PNG with a transparent background, at least 512 x 512 px.

## 3. Update the video data

All video data is **embedded** in `assets/js/videos.js` (no `fetch`, so it works from `file://`).

1. Open `assets/js/videos.js`.
2. Find `window.LITEAI_VIDEOS = { "videos": [ ... ] };` near the top.
3. Replace the `videos` array with the array from your JSON file. Each video looks like this:

```json
{
  "id": "videoId",
  "title": "Video Title",
  "description": "Full description text",
  "thumbnail": "https://i.ytimg.com/vi/videoId/mqdefault.jpg",
  "url": "https://www.youtube.com/watch?v=videoId",
  "date": "2025-01-15",
  "duration": "12:34",
  "tags": ["tutorial", "docker", "beginner"]
}
```

4. Save and refresh. Videos are sorted newest first (by `date`). The tag buttons, tag counts and video count are generated automatically. Search matches the **title, description and tags**.

Notes:
- The 6 videos in the file are **sample placeholders** that link to the channel page. Delete them when you add your own.
- Thumbnails are shown in full at their natural aspect ratio (never cropped). Remote YouTube thumbnails (`i.ytimg.com`) need an internet connection; a local fallback image is used if one fails to load.
- Use plain text in descriptions. Line breaks (`\n`) are preserved. Keep the JSON valid (double quotes, commas between items, no trailing comma).

## 4. Configure the contact form

Open `assets/js/main.js` and edit `window.SITE_CONFIG` at the top.

**Option A: mailto (default).** Set `contactEmail` to your real address, for example `hello@yourdomain.com`. Submitting the form opens the visitor's email app with the message pre-filled. (The default `contact@example.com` is only a placeholder.)

**Option B: Formspree (sends without opening an email app).**
1. Create a free form at <https://formspree.io> and copy its endpoint, like `https://formspree.io/f/xxxxxxxx`.
2. In `main.js` set:
   ```js
   contactMode: "formspree",
   formspreeEndpoint: "https://formspree.io/f/xxxxxxxx"
   ```
No secrets are stored in the code; the endpoint is public by design. A hidden honeypot field filters most spam bots.

## 5. Customize

- **Colours, spacing, fonts:** edit the CSS variables at the top of `assets/css/styles.css`. `:root` is the dark theme; `:root[data-theme="light"]` is the light theme. The brand gradient is `--accent-gradient`.
- **Text:** edit the HTML directly. Page copy is plain HTML in `index.html`, `about.html` and `contact.html`.
- **Social links:** the YouTube link is real. The X/Twitter, LinkedIn and GitHub links point to each site's home page as placeholders. Replace them with your profiles in the footer and on the contact page (search for `x.com`, `linkedin.com`, `github.com`).
- **Generated images:** the files in `assets/generated/` are abstract placeholders and can be swapped for your own artwork. Keep the same names or update the references and `alt` text.
- **Theme:** the site is dark by default; visitors can switch to light with the sun/moon button, and their choice is remembered.

## Limitations

- Fully static: no server code, database, comments or analytics are included.
- The video list is updated by editing `videos.js` by hand (or pasting new JSON). It does not sync with YouTube automatically.
- The mailto form depends on the visitor having an email app set up; Formspree avoids that but needs a free account.
- Open Graph / Twitter previews need the absolute URLs updated (step 7 in the GitHub Pages section) and only appear once the site is online.
- Remote thumbnails need internet access; everything else works offline.
