# Uzhu plugin API (for js/features-*.js and js/admin.js)

Plugin files load BEFORE app.js. Register like this:

```js
(window.UZHU_PLUGINS = window.UZHU_PLUGINS || []).push(function (A) { /* A = window.UZHU_APP */ });
```

## A (window.UZHU_APP)
- `A.user` (getter): `{ email, name, data }` or null. `A.D()` = user.data (state object, see below). `A.save()` persists (async) and resyncs push schedule.
- `A.render()`, `A.go(route)`, `A.toast(text, spotName|null, mood|undefined)` (mood: 'happy'|'calm'|'sleepy'|'wow' shows mascot), `A.modal(html, (el, close) => {})` (set `el._cleanup` for timers), `A.confetti()`, `A.notify(text, spot)`.
- helpers: `A.fa(n)` Persian digits, `A.esc(s)`, `A.pad`, `A.dateKey(date?)` 'YYYY-MM-DD' local, `A.jalali(date?)`, `A.money(n)`, `A.pick(arr)`, `A.dayDiff(a,b)`, `A.addMin('HH:MM', m)`.
- data: `A.ART` (mascot(mood,{arms:'up'|'wave'}), spots{water,moon,brain,book,trophy,bell}, hero()), `A.POSE` (svgFor(id,t), animate(), ids), `A.EX` (exercise: moves{id:{name,type,level,...}}, days[63], reminders, breathing), `A.PROGRAM` (cycles[3].days[21] {title, technique, read[], mission, tip, tasks[], reflect, reminders[{time,text}]}, sos[], quotes[]), `A.RECIPES` [{id,title,category,ingredients[],steps[],svg,...}], `A.ARTICLES` {articles[], hidden[{food,level,note}]}, `A.STORE` (mode 'local'|'supabase', social{publish,byCodes,team,league,cheer,myCheers}), `A.LEVELS`.
- program helpers: `A.stats()` → {total, streak, cubes, toman, beaten}; `A.dayObj()`, `A.cycleObj(n)`, `A.exDay(cycle, day)`, `A.logKey(c?, d?)` 'c1d3', `A.moveLog()` today's exercise log {walk,breaths,routine}; `A.plant(day)`, `A.ring(day,total,color)` svg html; `A.fig(poseId, cls)` animated figure html (cls '', 'sm', 'big'); `A.openRecipe(id)`, `A.openArticle(id)`, `A.openMove(id)`, `A.openSOS()`.
- Routes: add a page with `A.views.myroute = () => html; A.mounts.myroute = () => { bind events }; A.titles.myroute = 'عنوان'; A.appRoutes.push('myroute')` (appRoutes = login required). Add it to the tools hub: `A.tools.push({ route:'myroute', icon:'🧭', title:'…', desc:'…', show?: () => bool })`.
- Hooks: `A.H[name] = (A.H[name] || []).concat(fn)`. HTML hooks return a string:
  - `cycleDone(cycleN)` (on the cycle-finished screen), `todayTop()`, `todayMain()`, `todayAside()`, `nightExtra(prevLog)`, `journey()`, `settings()`, `recipesTop()`, `learnTop()`, `moveTop()`
  - side-effect hooks: `mount(route)` after every render (bind events here, check route), `nightSubmit(log, isFirstTime)` before save, `settingsSave()`, `onboardDone(state)`, `boot()` once before first render, `reminders(dayN)` → return extra [{time:'HH:MM', text, spot?, url?:'#route'}].

## State (A.D())
`{ profile:{name?, servings, control, trigger[], cravingTime, spend, goal[], level, why, ifthen, sign, signedAt}, settings:{reminders, times[4], moveRem, moveTime}, cycle, day, cycleDone, completedCycles[], lastCompleteDate, startedAt, log:{c1d1:{done,date,tasks[],move[],slip:'no'|'bit'|'lot',craving:0-4,reflect}}, move:{c1d1:{walk,breaths,routine}}, sos:{beaten,gave,events[{t,hour,beaten}]} }`.
Plugins store their own data under `A.D().x = A.D().x || {}` with a namespaced key (e.g. `A.D().fa_tracker`) and call `A.save()`.

## Styling
Use tokens from css/style.css: --bg --surface --surface-2 --ink --ink-soft --line --mint --mint-soft --berry --berry-soft --sun --sun-soft --lav --lav-soft --blob; classes .wrap .stack .row .card .card.pop .chip(.mint/.berry/.sun/.lav) .btn(.primary/.berry/.sun/.ghost/.big) .eyebrow .muted .small .num .display .input .field .check(label>input[type=checkbox]+span) .scale .progress>i .two .filters>button.on .mission .timer .section-head. Fonts: headings h2/h3 use Lalezar automatically. RTL Persian, informal warm "تو" voice, Persian digits via A.fa. Every color via tokens (light & dark themes).

## Testing
Serve: `cd /mnt/project-files/uzhu-site && python3 -m http.server <port>`. The real js/config.js points at Supabase which this container cannot reach, so in Playwright route it: `page.route('**/js/config.js', r => r.fulfill({ contentType:'application/javascript', body:'window.UZHU_CONFIG={}' }))`. Playwright: `require('/opt/node-tools/node_modules/playwright')` (chromium preinstalled; never run playwright install). Signup flow: #signup fill #name #email #pass → submit → 6 quiz steps (click `.opt` then `#next`), level step `#next`, then fill #why #ifthen #sign → `#next`. Settings has `#skip` to jump a day.

## Admin-controlled site settings (added)
`A.site.settings` is filled before the first render from the admin panel (may be empty `{}`):
- `features`: `{ <featureKey>: false }` hides a feature. Check `A.site.settings.features?.<key> !== false` before showing a tool/widget. Use your feature's short key, e.g. 'freeze','prep','reintro','journeys','challenges','companion','buddy','team','league','quiz','coach','slipwizard','taarof','checkin','timeline','scorecard','assess','swaps','traffic','labelcalc','shopping','trackers','plate','sameday','kitchen','builder','lazy','mindful','occasions','letters'.
- `messages`: `{ morning: [..], evening: [..] }` admin-written morning/evening messages (feature 30 should prefer these when non-empty).
- `swaps`: optional extra swap entries `[{from, to, note}]` (feature 18 should append them).
- `coach`: optional `{ text }` admin note shown in coach feedback (feature 11).
Register an async loader with `A.H.load` (returns a Promise) if you need data before first render.
