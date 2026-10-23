# PUBLISH_AND_SECURITY.md (copy into each project root)

Free options first. Follow the section for your target. Run the security checklist (section 1) before every publish.

## 1. Security checklist (tick only what applies)
**All projects**
- [ ] No secrets in code, in Git history, or in screenshots. `.env` is in `.gitignore`.
- [ ] `.env.example` lists secret names with empty values.
- [ ] Dependencies are few and up to date (`npm audit` if Node is used).
- [ ] All user input is validated and escaped.
- [ ] No console errors. No test data or debug logs left in.

**If the project has logins or stored user data (Firebase etc.)**
- [ ] Firebase security rules are NOT open. Each user can read and write only their own data.
- [ ] Firebase API keys restricted to the project's domain (the web key is public by design; the rules are what protect data).
- [ ] Only the minimum personal data is collected.
- [ ] A short privacy note page exists (what is collected, why, how to delete it).
- [ ] Passwords are never stored by me. Use the provider's login.

**If payments are involved**
- [ ] Hosted checkout of a payment provider only. No card data touches my code.
- [ ] Server-side keys never in the browser.

**If the project calls an AI or other paid API**
- [ ] Key is kept on a server or serverless function, never in browser code.
- [ ] Usage limit or spending cap is set.

## 2. Pre-publish checklist
- [ ] MASTER_SPEC.md "Done means" passes.
- [ ] Works on a 360px phone screen and desktop; tested in Chrome and one other browser.
- [ ] README explains run, deploy, and change settings.
- [ ] Latest work committed, pushed to GitHub, and tagged (`v0.1-mvp` or `v1.0-production`).

## 3. Publishing a web app or browser game (free)
**Option A: GitHub Pages (simplest for static sites and games)**
1. Push the project to a GitHub repo.
2. If the project needs a build (Vite), have Antigravity set up a GitHub Actions deploy or build to a `/docs` or `dist` folder, as the stack requires.
3. On GitHub: repo, Settings, Pages, choose the branch and folder, Save.
4. Wait a minute. The site opens at `https://<username>.github.io/<repo>/`.
5. Open it on your phone and check everything works. Check that asset paths work under the `/<repo>/` subfolder.

**Option B: Netlify or Cloudflare Pages (better for forms, serverless functions, nicer URLs)**
1. Sign up with GitHub.
2. Add new site, import from Git, pick the repo.
3. Set build command and publish folder (Antigravity tells you from the stack decision).
4. Add secrets in the host's environment variable settings, never in the repo.
5. Deploy. You get a free `*.netlify.app` or `*.pages.dev` address.
6. Every `git push` to `main` redeploys automatically.

Custom domain later is optional and costs money. Skip it at first.

## 4. Publishing as an Android app (Play Store)
Only do this after the web version works as a PWA.

**Costs and prerequisites**
- Google Play developer account: a one-time fee (check the current amount and the current testing requirements for new personal accounts on Google's Play Console help pages before starting, since these rules change).
- A privacy policy URL is required.

**Steps**
1. Make the web app a proper PWA: manifest file, icons (192 and 512 px), service worker, works offline where sensible, HTTPS hosting (Pages or Netlify gives this).
2. Wrap it: use a Trusted Web Activity (Bubblewrap) or Capacitor. Have Antigravity set it up and generate the Android App Bundle (`.aab`).
3. Create a signing key. Store the key file and passwords safely OUTSIDE the repo. Losing it blocks future updates.
4. Test the app on your own Android phone first.
5. In Play Console: create app, fill the store listing (name, short and full description, screenshots, icon, feature graphic), content rating form, data safety form, target audience, privacy policy URL.
6. Upload the `.aab` to an internal or closed testing track first. Fix issues.
7. Promote to production and submit for review. Review can take days.
8. For updates: raise the version code, rebuild the bundle, upload, submit.

## 5. Browser extension
1. Zip the extension folder.
2. Chrome Web Store: developer account has a small one-time fee. Upload the zip, fill the listing and privacy details, submit.
3. Or share the zip for manual install in developer mode (free, for personal or testing use).

## 6. Scripts and desktop tools
1. Put code and a clear README on GitHub (private or public).
2. Tag a release and attach the file or packaged build in GitHub Releases.
3. State clearly how to install and run on Windows.

## 7. After publishing (maintenance)
- Re-test after each change on phone and desktop.
- Commit every change, tag every release.
- Update dependencies every few months and re-run the security checklist.
- Rotate any key you suspect has leaked.
- Keep a short list of "known issues" in the README.

## 8. Client handover (when relevant)
Give the client: repo access, hosting account ownership (or transfer steps), list of secrets and where they live, the README, and the MASTER_SPEC.md so another person can continue.
