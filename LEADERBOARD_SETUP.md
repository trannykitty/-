# Mad Mice online leaderboard setup

The leaderboard UI is included, but online rankings need a Supabase project. This is a one-time setup.

## 1) Create a Supabase project

Open https://supabase.com/ and create a project. In the project dashboard, find the **Project URL** and **Publishable key** (or legacy `anon` key) in the Connect dialog or API Keys settings.

**Important:** `leaderboard-config.js` is downloaded by every player. Put only the public publishable key / legacy anon key there. Never put a `sb_secret_...` key or `service_role` key into the game.

## 2) Create the score table and permissions

In the Supabase dashboard, open **SQL Editor**, create a query, paste the full contents of `supabase-leaderboard.sql`, and run it. It creates the leaderboard table, read policy, and score-submission function. The table uses Row Level Security and regular browser clients cannot directly edit score rows.

## 3) Connect the game

Open `leaderboard-config.js` and fill the two blank strings:

```js
window.MAD_MICE_LEADERBOARD_CONFIG = {
  url: "https://YOUR_PROJECT_REF.supabase.co",
  publishableKey: "YOUR_SUPABASE_PUBLISHABLE_KEY"
};
```

Use your actual Project URL and publishable key. Keep the quotes. Save the file.

## 4) Publish all game files

Upload all game files to the **root** of the same GitHub Pages project, replacing the old files. Keep `index.html`, `script.js`, `style.css`, `leaderboard-config.js`, `version.json`, both sound files, and `bg_song.mp3` together. The `.sql` and this setup guide are only for setup; they do not need to be in the web root (but it is okay if they are public).

Then open the game and press **Ctrl + Shift + R**. Click **Leaderboard** and use **Refresh** to test it. Save a nickname in the leaderboard screen. A score is submitted when a Relax/Pro run ends or when you leave an Endless run. The best score for that nickname is kept separately for each mode.

## Notes about fair play and privacy

- Names are public nicknames, not authenticated accounts. Pick a nickname that does not reveal personal information.
- This is a casual browser-game leaderboard, not a cheat-proof competitive ranking. Players can inspect browser code and call public endpoints themselves; the SQL validates basic score data and only updates a nickname's entry when it improves, but it cannot prove the score was earned honestly. Strong anti-cheat requires server-authoritative gameplay or user accounts and server-side validation.
- This is a nickname-based board, so two people using the same nickname share the same entry in a mode. Choose a distinctive nickname if that matters.


## Suggestions inbox
Suggestions are posted to the configured Discord webhook from the browser. Because this is a static GitHub Pages site, the webhook URL is visible in the public JavaScript source. If the URL is ever abused, regenerate the webhook in Discord and update `suggestionWebhook` in `script.js`. For stronger protection, route submissions through a server-side endpoint instead.
