These files were confirmed unused/dead during a HerCycle cleanup pass and
moved out of src/ and public/ so they no longer sit inside the live app or
ship in production builds.

Why each one is dead:
- App.css: never imported by main.jsx/App.jsx (only index.css is). It's
  leftover default Vite+React template CSS and references CSS custom
  properties (--accent, --border, --text-h, etc.) that aren't defined
  anywhere in this app's theme (src/index.css), so it was never even
  valid for this project's styling.
- assets/hero.png, assets/react.svg, assets/vite.svg: the default Vite
  template's logo/hero images. No component in src/ imports from
  '../assets' or './assets' anywhere in the app. hero.png corresponds to
  the .hero/.base/.framework/.vite classes in the dead App.css above.
- icons.svg (from public/): the default Vite template's social-link icon
  sprite (GitHub/Discord/X/Bluesky/docs icons), referenced only by the
  dead App.css's #next-steps boilerplate. Nothing in src/ references
  '/icons.svg'. Because it lived in public/, it WAS being copied verbatim
  into every production build (dist/) despite being unused — removing it
  trims the shipped bundle.

This folder is safe to delete entirely, e.g. from PowerShell:
  Remove-Item -Recurse -Force "_unused-confirmed-dead"

(The cleanup tooling used to make these changes could move files but had
no delete capability, which is why this folder exists instead of the
files being removed outright.)
