# LinguaMedia 🌍

**Learn any language through real-world content — videos, articles, and instant hover translation.**

A YouTube-style language learning website. Search any topic, choose a language, and get matching videos and Wikipedia articles. Hover over any foreign word to see an instant translation.

---

## Live site

👉 **[Open LinguaMedia](https://chriscc23.github.io/language-learning-media/)**

---

## Getting started (one-time setup, ~5 minutes)

The site works immediately with Wikipedia articles and demo video cards. To unlock real YouTube videos, you need a **free YouTube API key**.

### Step 1 — Get a free YouTube API key

1. Go to **[Google Cloud Console](https://console.cloud.google.com/)**
2. Sign in with your Google account
3. Click **"Select a project"** → **"New Project"** → give it any name → **Create**
4. In the search bar at the top, type **"YouTube Data API v3"**
5. Click it → click **"Enable"**
6. Click **"Create Credentials"** → choose **"API Key"**
7. Copy the key that appears (it looks like `AIzaSy...`)

### Step 2 — Add the key to the website

1. Open the file **`config.js`** in any text editor (Notepad works fine)
2. Find this line:
   ```
   YOUTUBE_API_KEY: 'YOUR_YOUTUBE_API_KEY_HERE',
   ```
3. Replace `YOUR_YOUTUBE_API_KEY_HERE` with your actual key, e.g.:
   ```
   YOUTUBE_API_KEY: 'AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz',
   ```
4. Save the file

### Step 3 — Push the update to your live site

Open a terminal (Command Prompt or PowerShell) in the `language-learning-media` folder, then run:
```
git add config.js
git commit -m "Add YouTube API key"
git push
```

Your live site updates automatically within ~1 minute.

---

## How to use the site

| Feature | How |
|---|---|
| **Search** | Select a language from the dropdown → type a topic → press Enter or click 🔍 |
| **Watch a video** | Click any video card to open the player |
| **Read an article** | Click the "Articles" tab — Wikipedia articles in your chosen language |
| **Hover translation** | Click the **Translate** button in the top-right, then hover any word on the page |
| **Suggested content** | Right-hand panel shows related videos from your search |
| **Quick topics** | Click the topic chips on the home screen, or the left sidebar menu |

---

## Customising the site

Open `config.js` to change:

| Setting | Default | Description |
|---|---|---|
| `YOUTUBE_API_KEY` | `'YOUR_YOUTUBE_API_KEY_HERE'` | Your YouTube API key |
| `DEFAULT_LANGUAGE` | `'Spanish'` | Language shown when the page loads |
| `VIDEO_RESULTS` | `20` | How many video results to show |
| `ARTICLE_RESULTS` | `6` | How many Wikipedia articles to show |
| `NATIVE_LANGUAGE` | `'English'` | Your language — translations appear in this language |

---

## Supported languages

🇪🇸 Spanish · 🇫🇷 French · 🇩🇪 German · 🇯🇵 Japanese · 🇨🇳 Chinese · 🇰🇷 Korean · 🇮🇹 Italian · 🇧🇷 Portuguese · 🇷🇺 Russian · 🇸🇦 Arabic · 🇳🇱 Dutch · 🇸🇪 Swedish · 🇵🇱 Polish · 🇹🇷 Turkish · 🇮🇳 Hindi

---

## Frequently asked questions

**Will I be charged for the YouTube API?**
No. Google gives you 10,000 free quota units per day. Each search uses about 100 units, so you get roughly 100 free searches per day — more than enough for personal use.

**The translation isn't showing up.**
Make sure you clicked the **Translate** button in the top-right first (it turns red when active). Then hover over a word in any article or video description.

**I see demo cards instead of real videos.**
Your YouTube API key hasn't been added yet. Follow Step 2 above.

**Can I add more languages?**
Yes — open `index.html`, add an `<option>` tag in the language dropdown, then add an entry in the `LANGUAGES` object in `app.js` with the correct [ISO 639-1 language code](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes).

---

## Technology used

- Plain HTML, CSS, and JavaScript — no frameworks, no installation required
- [YouTube Data API v3](https://developers.google.com/youtube/v3) — video search
- [Wikipedia API](https://www.mediawiki.org/wiki/API) — articles in any language (free, no key needed)
- [MyMemory Translation API](https://mymemory.translated.net/) — hover word translation (free, no key needed)
- Hosted on [GitHub Pages](https://pages.github.com/) — free

---

*Built with Claude Code*
