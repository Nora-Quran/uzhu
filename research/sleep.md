# Sleep section — research notes (Oct 2026)

Concise findings used for `js/sleep-data.js`. Only sources seen in search results are listed.

## Core guidance
- **Duration:** adults 18–60 need 7+ h; 61–64: 7–9 h; 65+: 7–8 h. See a doctor if, despite 7–9 h in bed, you regularly take 30+ min to fall asleep, wake repeatedly, nap often or feel sleepy at wrong times. https://www.cdc.gov/sleep/about/index.html , https://www.cdc.gov/niosh/bulletin/2020/sleep.html
- **CBT-I is first-line** for chronic insomnia (AASM 2021 guideline, Edinger et al., JCSM 17(2):255; strong rec for multicomponent CBT-I; stimulus control / sleep restriction / relaxation conditional as single components; sleep hygiene alone NOT recommended as sole therapy). https://aasm.org/new-guideline-supports-behavioral-psychological-treatments-for-insomnia/ , patient guide: https://aasm.org/wp-content/uploads/2021/08/Behavioral-and-Psychological-Treatments-for-Insomnia-Patient-Guide.pdf
- **NHS:** regular times incl. days off, wind down, no devices ~1 h before bed, write a to-do list if you worry, get up if awake ~20 min, results take weeks. https://www.nhs.uk/every-mind-matters/mental-wellbeing-tips/how-to-fall-asleep-faster-and-sleep-better/ , https://policyonline.nhslothian.scot/wp-content/uploads/2025/10/Sleep-A-guide-for-patients.pdf
- **Regularity matters:** UK Biobank actigraphy (~61k): most regular sleepers had ~30% lower all-cause mortality vs least regular; regularity predicted better than duration (association). https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10782489/
- **Light:** 2022 PLOS Biology expert consensus (Brown et al.): daytime ≥250 lux melanopic EDI, ≤10 lux in the 3 h before bed, ≤1 lux while sleeping. https://doi.org/10.1371/journal.pbio.3001571 . CDC suggests time outdoors in daylight early in the day.
- **Caffeine:** 400 mg even 6 h before bed cut objective sleep >1 h while subjects didn't notice (Drake 2013, n=12). https://sleepeducation.org/late-afternoon-and-early-evening-caffeine-can-disrupt-sleep/ , https://pmc.ncbi.nlm.nih.gov/articles/PMC3805807/ . Sleep Foundation: cut off ~2 p.m.; effects up to ~8 h. https://www.sleepfoundation.org/sleep-habits
- **Temperature:** ~18.3 °C (65 °F), range ~18–20 °C. https://www.sleepfoundation.org/bedroom-environment/best-temperature-for-sleep
- **Alcohol:** speeds sleep onset but fragments 2nd half of night. CDC/Sleep Foundation guidebook. https://www.sleepfoundation.org/sleep-hygiene/healthy-sleep-tips
- **Naps:** ~20 min, max 30, early afternoon; long/late naps hurt night sleep. https://www.sleepfoundation.org/napping
- **Exercise:** regular exercise helps; CDC/NHS pages suggest finishing vigorous exercise ≥3–4 h before bed (individual; recent evidence says moderate evening exercise is usually fine). https://www.cdc.gov/niosh/bulletin/2020/sleep.html
- **Screens:** 2025 meta-analysis (21 cohorts, ~548k): each extra hour of screen time ≈ 3–5 min less sleep; association, not proven causation; content/arousal matters. https://www.frontiersin.org/journals/psychiatry/articles/10.3389/fpsyt.2025.1640263/full

## Sleep ↔ sugar / metabolism
- Sleep restriction → lower leptin, higher ghrelin, impaired glucose tolerance, cravings for high-carb foods (Van Cauter / Spiegel lab). https://mdedge.com/content/sleep-loss-tied-impaired-glucose-tolerance-0
- St-Onge 2016 JCSM (n=26): more fiber → more slow-wave sleep; more saturated fat → less SWS; more sugar → more arousals. https://aasm.org/study-suggests-that-what-you-eat-can-influence-how-you-sleep/

## Women
- PCOS: OSA prevalence ~35% in meta-analysis (mostly clinic samples); UK cohort OSA incidence 8.1 vs 3.3 /10k py. https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7127997/ , https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6410684/
- Menopause: hot flashes + OSA risk 2–3× after menopause; half of a midlife sample with complaints had a primary sleep disorder. https://www.hopkinsmedicine.org/health/wellness-and-prevention/how-does-menopause-affect-my-sleep , https://www.health.harvard.edu/womens-health/nighttime-awakenings-in-menopause-may-be-caused-by-sleep-disorders-not-hot-flashes

## Red flags / meds
- Apnea: loud snoring, pauses, gasping, daytime sleepiness, morning headache; women may present with insomnia/fatigue. https://www.nhlbi.nih.gov/health/sleep-apnea/symptoms , https://www.mayoclinic.org/diseases-conditions/obstructive-sleep-apnea/symptoms-causes/syc-20352090
- RLS: evening urge to move legs; check iron with a doctor. https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12433697/
- Melatonin: AASM suggests NOT using it for chronic insomnia in adults; possible use for timing problems (jet lag, shift work) with a clinician; OTC quality varies. https://aasm.org/missing-the-mark-melatonin-finding-best-treatment-insomnia/

## Techniques
- Cognitive shuffle (Beaudoin, "serial diverse imagining"): random neutral images; small evidence base. https://theconversation.com/what-is-cognitive-shuffling-and-does-it-really-help-you-get-to-sleep-two-sleep-scientists-explain-256444
- Music: Cochrane review — music listening may improve subjective sleep quality in adults with insomnia (moderate certainty, PSQI). https://www.cochrane.org/CD010459/SLEEP_music-for-insomnia-adults
- Pink noise: not researched in depth here; early lab studies only — present as "may help some people", no claims.

## What top apps do (features worth copying)
- **CBT-i Coach (VA/Stanford/DoD, free):** sleep diary as entry point, caffeine reminders, relaxation audio, scheduled "worry time". https://psychnews.psychiatryonline.org/doi/10.1176/appi.pn.2015.8b17
- **Rise / Sleepio:** CBT-I step-by-step (stimulus control, sleep window, cognitive tools); personalised schedule from diary data. https://www.risescience.com/
- **Headspace / Calm:** wind-down + body scan + sleepcasts/stories + long ambient music with sleep timer. https://www.youtube.com/@calm
- **Sleep Cycle / Pokémon Sleep / BetterSleep:** gentle wake-window alarm, gamified streaks, sound mixer. (Not separately verified; general product knowledge.)
- → Implemented in Uzhu: nightly checklist, sleep diary feedback, chronotype quiz, wind-down timeline, body-scan player, cognitive-shuffle word generator, curated music links.

## Music links (seen in search results; channel ownership not 100% verifiable — YouTube not reachable from sandbox)
Marconi Union Weightless (Official Extended / Official 10 h), Max Richter Dream 3, Brian Eno 1/1 (Provided to YouTube by UMG), Lang Lang Gymnopédie 1 (UMG/DG), Headspace Slumber & Streamways, Calm rain & Moby, BBC Earth Relax, Hossein Alizadeh Daramad & Homayun (Provided to YouTube, The Orchard).
