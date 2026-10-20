# پژوهش بخش ورزش یوژو: پیاده‌روی، تنفس شکمی، یوگا و پیلاتس در خانه

> منبعِ علمی و طراحیِ بخش «ورزش» و فایل `js/exercise.js`. فقط منابعی آمده که وجودشان با جست‌وجو تأیید شد. هر جا یافته از گزارش ثانویه بود، گفته شده.
> تاریخ گردآوری: اکتبر ۲۰۲۶

---

## ۱. ایده‌هایی که از اپ‌ها و مربی‌ها برمی‌داریم

| اپ / مربی | ایدهٔ برتر | در یوژو |
|---|---|---|
| **Down Dog** | قابل‌تنظیم‌ترین اپ یوگا: انتخاب سرعت انتقال («کندترین»)، طول ماندن در حرکت، سطح توضیح («دستورالعمل کامل») و صدای مربی | دکمهٔ «آهسته‌تر / توضیح کامل» برای هر روال؛ زمان هر حرکت (`secs`) قابل تغییر |
| **Asana Rebel** | ترکیب یوگا و فیتنس؛ جلسه‌های ۴ تا ~۳۰ دقیقه؛ سطح‌بندی برای همه | روال‌ها از ~۹ دقیقه در چرخهٔ ۱ تا ~۲۵ دقیقه در چرخهٔ ۳ |
| **Nike Training Club** | رایگان، «مربی دیجیتال»، ویدیو برای هر حرکت، برنامه‌های چندهفته‌ای | کارت هر حرکت: انیمیشن + مراحل + ویدیوی آموزشی + نسخهٔ آسان‌تر |
| **Alo Moves / Glo** | «سری»ها (Series) تا مبتدی در انتخاب کلاس گم نشود؛ فیلتر بر اساس مدت، سطح و سبک | برنامهٔ ۶۳ روزه از پیش چیده‌شده؛ کاربر انتخاب سخت ندارد |
| **Yoga With Adriene** | ویدیوی «Yoga For Complete Beginners» و سری «Foundations of Yoga» (هر ویدیو یک حرکت) و چالش‌های ۳۰ روزه («Day 1 – Ease Into It») | آموزش تک‌حرکتی + لحن مهربان «Find what feels good» |
| **Jessica Valant Pilates** | فیزیوتراپیست و مربی پیلاتس؛ همیشه نسخهٔ ساده‌شده؛ چالش «10 in 10» (۱۰ تمرین ۱۰ دقیقه‌ای) | فیلد `easier` برای هر حرکت؛ شروع ۱۰ دقیقه‌ای |
| **Move With Nicole** | برچسب شدت روی هر کلاس (Beginner / Moderate / Intermediate) | فیلد `level` (۱ تا ۳) و نشان سطح روی کارت |
| **Leslie Sansone – Walk at Home** | «پیاده‌روی در خانه» بدون وسیله: رژه در جا، قدم به پهلو، لگد، ۱ مایل ≈ ۱۵ دقیقه | حرکات `walk-march` و `walk-steptouch` برای روزهای بدِ هوا |
| **Fitbod / Apple Fitness+** | پیشرفت تدریجی خودکار، حلقه/استریک روزانه، یادآور | تیک ورزش در لیست روزانه، استریک، اعلان‌های جداگانه |

**جمع‌بندی طراحی:** (۱) برنامهٔ آماده و پله‌پله، (۲) یک کارت روشن برای هر حرکت با ویدیو یا انیمیشن، (۳) همیشه نسخهٔ آسان‌تر، (۴) روز ریکاوری هر ۷ روز، (۵) اعلان جدا برای پیاده‌روی و تنفس، (۶) ورزش در چک‌لیست روزانه.

**منابع (مرورها و صفحه‌های رسمی):**
- All Yoga Training, *Best Yoga Apps for Beginners* (مقایسهٔ Down Dog، Glo، Alo Moves): https://www.allyogatraining.com/best-beginner-yoga-app
- Woman & Home, *The 10 best yoga apps* (2024): https://www.womanandhome.com/health-wellbeing/best-yoga-apps/
- Yoga With Adriene, *Yoga For Complete Beginners – 20 Minute Home Yoga Workout!*: https://www.youtube.com/watch?v=v7AYKMP6rOE
- Yoga With Adriene, *Day 1 – Ease Into It – 30 Days of Yoga*: https://www.youtube.com/watch?v=oBu-pQG6sTY
- Jessica Valant, *Pilates for Beginners – Full Body Beginner Pilates at Home!*: https://www.youtube.com/watch?v=p0ngO1SYR9U
- Fit&Well, *15-minute Pilates routine for beginners* (Jessica Valant): https://www.fitandwell.com/features/this-is-the-15-minute-pilates-routine-an-instructor-recommends-for-beginners-who-want-to-build-full-body-strength
- Fit&Well, *Beginner Pilates YouTube challenges*: https://www.fitandwell.com/exercise/pilates/anyone-new-to-pilates-should-start-with-these-four-youtube-challenges-according-to-instructors
- Move With Nicole (کانال): https://www.youtube.com/@MoveWithNicole
- Walk at Home, *1.0 Mile Happy Walk*: https://www.youtube.com/watch?v=X3q5e1pV4pc — مرور: https://www.fitandwell.com/exercise/walking/i-tried-the-most-popular-walking-workout-video-on-youtube-and-this-is-what-i-discovered
- منبع فارسیِ معتبرِ تأییدشده‌ای برای آموزش تک‌حرکتی پیدا نشد؛ متن‌ها از منابع بالا ترجمه و ساده شده‌اند.

---

## ۲. شواهد علمی

### ۲.۱ چقدر حرکت؟ (WHO 2020)
- بزرگسالان: **۱۵۰ تا ۳۰۰ دقیقه در هفته** فعالیت هوازی متوسط (یا ۷۵ تا ۱۵۰ دقیقه شدید)، به‌علاوهٔ تمرین تقویتی عضلات **حداقل ۲ روز در هفته**، و کم کردن نشستن. ۳۰ دقیقه پیاده‌روی تند در روز ≈ ۲۱۰ دقیقه در هفته.
- راهنما آستانهٔ مشخصی برای «زمان نشستن» تعیین نکرد، ولی «هر حرکتی بهتر از هیچ» است.
- منبع: Bull FC, et al. WHO 2020 guidelines on physical activity and sedentary behaviour. *Br J Sports Med* 2020;54:1451–1462. https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7719906/

### ۲.۲ پیاده‌روی کوتاه بعد از غذا و قند خون
- متاآنالیز Buffey و همکاران (۲۰۲۲): شکستن نشستن طولانی با ایستادن یا **پیاده‌روی سبک ۲ تا ۵ دقیقه‌ای**، قند خون بعد از غذا را کم کرد؛ پیاده‌روی سبک از ایستادن مؤثرتر بود و انسولین را هم پایین آورد. (طبق گزارش رسانه‌ها از قول نویسنده: کاهش متوسط حدود ۱۷٪ برای پیاده‌روی در برابر ~۹.۵٪ برای ایستادن؛ عدد دقیق را در اصل مقاله ببینید.)
- کارآزمایی مرتبط: ۲ دقیقه پیاده‌روی هر ۲۰ دقیقه در بزرگسالان دارای اضافه‌وزن، قند و انسولین بعد از غذا را حدود ۲۷٪ و ۲۳٪ کاهش داد.
- **کاربرد در یوژو:** نکتهٔ ثابت «۱۰ دقیقه بعد از ناهار/شام»؛ تکه کردن ۳۰ دقیقه به ۳ × ۱۰.
- منبع: Buffey AJ, et al. The Acute Effects of Interrupting Prolonged Sitting Time in Adults with Standing and Light-Intensity Walking on Biomarkers of Cardiometabolic Health. *Sports Med* 2022;52(8):1765–1787. doi:10.1007/s40279-022-01649-4. https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9325803/

### ۲.۳ ورزش و هوس شیرینی
- Taylor & Oliver (۲۰۰۹): ۱۵ دقیقه پیاده‌روی تند در ۲۵ نفرِ مصرف‌کنندهٔ همیشگی شکلات (بعد از ۳ روز پرهیز)، هوس شکلات را حین و دست‌کم ۱۰ دقیقه بعد از ورزش کم کرد. *Appetite* 2009.
- Oh & Taylor (۲۰۱۱): در محیط شبیه‌سازی‌شدهٔ کار (۷۸ نفر)، گروهی که قبل از کار ۱۵ دقیقه راه رفتند حدود نصف شکلات خوردند (۱۵ در برابر ۲۸ گرم). *Appetite* 2011. گزارش: https://www.sciencedaily.com/releases/2011/12/111207105313.htm
- **احتیاط:** مطالعات کوچک‌اند. مرور Beaulieu و همکاران (*Curr Obes Rep* 2020) می‌گوید ورزش حاد در افراد کم‌تحرک «پاداشِ» غذاهای پرانرژی را کمی کم می‌کند، ولی شواهد ناهمگون است؛ یک کارآزمایی ۲۰۲۵ حتی افزایش اشتها بعد از ۴۰ دقیقه دوچرخه گزارش کرد. پس می‌گوییم «ممکن است کمک کند»، نه «هوس را از بین می‌برد». https://link.springer.com/10.1007/s13679-020-00372-3

### ۲.۴ حساسیت به انسولین و PCOS
- راهنمای بین‌المللی PCOS (Teede و همکاران ۲۰۲۳) سبک زندگی سالم را محور درمان می‌داند؛ بیانیهٔ موضع ورزشیِ مبتنی بر آن، همان **۱۵۰–۳۰۰ دقیقه** فعالیت متوسط در هفته به‌علاوهٔ تمرین تقویتی را توصیه می‌کند و نوع خاصی از ورزش را برتر نمی‌داند.
- منابع: Teede HJ, et al. Recommendations from the 2023 International Evidence-based Guideline for the Assessment and Management of PCOS. *Hum Reprod* 2023;38(9):1655–1679 / *J Clin Endocrinol Metab* 2023;108(10):2447–2469. بیانیهٔ موضع ورزش: https://vuir.vu.edu.au/48965/1/Exercise_in_the_management_of_polycystic_ovary_syndrome.pdf

### ۲.۵ تنفس شکمی (دیافراگمی)
- روش Cleveland Clinic: به پشت با زانوهای خم؛ یک دست روی سینه، یک دست زیر دنده‌ها؛ دم آرام از بینی تا شکم بالا بیاید و سینه ثابت بماند؛ بازدم با لب‌های غنچه و جمع کردن شکم. بعد از تسلط، نشسته. تمرین اولیه: ۵ تا ۱۰ دقیقه، ۳ تا ۴ بار در روز؛ خستگی اولیه طبیعی است.
- Harvard Health: تنفس شکمی هستهٔ تکنیک‌هایی است که «پاسخ آرام‌سازی» را فعال می‌کنند و در برابر پاسخ استرس عمل می‌کنند.
- **کاربرد در یوژو:** ریتم ۴ ثانیه دم / ۶ ثانیه بازدم (بازدم بلندتر)؛ از ۱۰ نفس در روز ۱ تا ۳۰ نفس در روز ۲۱ و پس از آن. «نفس SOS» هنگام هوس.
- منابع: Cleveland Clinic, *Diaphragmatic Breathing*: https://my.clevelandclinic.org/health/articles/9445-diaphragmatic-breathing — Harvard Health, *Relaxation techniques: Breath control helps quell errant stress response*: https://www.health.harvard.edu/mind-and-mood/relaxation-techniques-breath-control-helps-quell-errant-stress-response

### ۲.۶ ایمنی یوگا و پیلاتس برای مبتدی
- متاآنالیز ۹۴ کارآزمایی (۸۴۳۰ نفر): عوارض جدی یوگا با ورزش معمول یا مراقبت معمول تفاوتی نداشت (Cramer et al., *Am J Epidemiol* 2015).
- مرور گزارش‌های موردی (Cramer et al., *PLoS ONE* 2013): بیشتر عوارض اسکلتی‌عضلانی بودند؛ **مبتدی‌ها از حرکات افراطی مثل ایستادن روی سر، لوتوس و تنفس‌های شدید پرهیز کنند**؛ افراد گلوکوم از حرکات وارونه. https://pmc.ncbi.nlm.nih.gov/articles/PMC3797727
- در یوژو هیچ حرکت وارونهٔ کامل، لوتوس یا تنفس شدید (مثل کاپالابهاتی) نیست؛ «سگ رو به پایین» با زانوی خم و نسخهٔ دیواری.

---

## ۳. نکات ایمنی برای متن سایت
1. قبل از شروع اگر بیماری قلبی، فشار خون کنترل‌نشده، دیابت تحت درمان با انسولین یا سولفونیل‌اوره، بارداری، پوکی استخوان شدید یا جراحی اخیر دارید، با پزشک مشورت کنید.
2. علائم توقف فوری: درد قفسهٔ سینه، سرگیجه، تنگی نفس شدید، درد تیز مفصلی.
3. دیابت دارویی: خطر افت قند در ورزش؛ یک میان‌وعدهٔ مناسب همراه داشته باشید.
4. «تست حرف زدن»: در پیاده‌روی متوسط می‌شود حرف زد ولی آواز نه.
5. پیلاتس شکمی (صدتایی، رول‌آپ، کشش تک‌پا) برای دیاستاز رکتی، بعد از زایمان و کمردرد حاد مناسب نیست مگر با نظر فیزیوتراپ؛ نسخهٔ سر روی زمین را پیشنهاد دهید.
6. هر حرکت یک نسخهٔ آسان‌تر دارد؛ انتخاب آن «تقلب» نیست.

---

## ۴. منطق برنامهٔ ۶۳ روزه (در `exercise.js`)
- **چرخهٔ ۱ (روز ۱–۲۱) پایه:** روال ۹–۱۱ دقیقه، فقط حرکات سطح ۱؛ پیاده‌روی ۱۰ → ۳۰ دقیقه تا روز ۱۰؛ تنفس ۱۰ → ۳۰ نفس.
- **چرخهٔ ۲ (روز ۲۲–۴۲) ساختن:** روال ۱۲–۱۷ دقیقه؛ سطح ۲ (سگ رو به پایین، لانج، جنگجو ۲، درخت، سوسک مرده، کشش تک‌پا، صدتایی)؛ پیاده‌روی ۳۰ → ۳۵.
- **چرخهٔ ۳ (روز ۴۳–۶۳) تقویت:** روال ۲۱–۲۵ دقیقه؛ سطح ۳ (پلانک، شنا، رول‌آپ)؛ پیاده‌روی ۳۵ → ۴۰.
- روزهای ۷، ۱۴، ۲۱ هر چرخه: ریکاوری (کشش + تنفس). یوگا و پیلاتس یک روز در میان؛ در چرخهٔ ۲ و ۳ روز ششم هر هفته «ترکیبی».
- تمرین تقویتی (پیلاتس، پل، جنگجو) حداقل ۲–۳ بار در هفته، مطابق WHO.

---

## ۵. ویدیوهای تأییدشده (عنوان و کانال از نتایج جست‌وجوی YouTube)
| حرکت | ویدیو | کانال |
|---|---|---|
| breath-belly | Relax with deep breathing. — https://www.youtube.com/watch?v=zd-7rvZCYvA | Cleveland Clinic |
| walk-march / walk-steptouch | 1.0 Mile Happy Walk — https://www.youtube.com/watch?v=X3q5e1pV4pc | Leslie Sansone's Walk at Home |
| yoga-mountain | Mountain Pose (Tadasana) — https://www.youtube.com/watch?v=NYhH8Gr35cI | Yoga With Adriene |
| yoga-catcow | Cat-Cow Yoga Pose — https://www.youtube.com/watch?v=y39PrKY_4JM | Yoga With Adriene |
| yoga-child | Extended Child's Pose — https://www.youtube.com/watch?v=eqVMAPM00DM | Yoga With Adriene |
| yoga-downdog | Downward Dog — https://www.youtube.com/watch?v=j97SSGsnCAQ | Yoga With Adriene |
| yoga-cobra | Cobra Pose — https://www.youtube.com/watch?v=n6jrC6WeF84 | Yoga With Adriene |
| yoga-lunge | Runner's Lunge – Foundations of Yoga — https://www.youtube.com/watch?v=OfJl_jhJcWw | Yoga With Adriene |
| yoga-warrior2 | Warrior 2 Yoga Pose — https://www.youtube.com/watch?v=4Ejz7IgODlU | Yoga With Adriene |
| yoga-tree | Tree Pose – Vrksasana — https://www.youtube.com/watch?v=yVE4XXFFO70 | Yoga With Adriene |
| yoga-bridge | Bridge Pose — https://www.youtube.com/watch?v=NnbvPeAIhmA | Yoga With Adriene |
| yoga-forwardfold | Forward Fold Yoga Pose — https://www.youtube.com/watch?v=g7Uhp5tphAs | Yoga With Adriene |
| yoga-twist | Reclined Twist Yoga Pose — https://www.youtube.com/watch?v=mKC3IeldPOc | Yoga With Adriene |
| pil-pelvictilt | Pelvic Tilt Exercise – How To Fix Pelvic Tilt — https://www.youtube.com/watch?v=RhwUQhApRPg | Jessica Valant Pilates |
| pil-hundred | The Pilates Hundreds Exercise – 5 Minute Ab Workout! — https://www.youtube.com/watch?v=f-KBjAwQ574 | Jessica Valant Pilates |
| pil-plank | How To Do a Plank – Plus 5 Minute Plank Workout! — https://www.youtube.com/watch?v=-V6gk1i4pvY | Jessica Valant Pilates |
| pil-rollup | How To Do The Pilates Roll Up Exercise – For Anyone! — https://www.youtube.com/watch?v=HB9ex7zlpcE | Jessica Valant Pilates |
| pil-clam | Clamshell in Sidelying Exercise for the Hips — https://www.youtube.com/watch?v=O2KPabIoPPk | Ask Doctor Jo (فیزیوتراپ) |
| pil-sidelift | Hip Abduction in Sidelying — https://www.youtube.com/watch?v=EwBJKBa4PKU | Ask Doctor Jo (فیزیوتراپ) |

**بدون ویدیو (کانال معتبرِ قابل‌تأیید پیدا نشد):** pil-deadbug، pil-singleleg، pil-birddog، pil-swimming — برای این‌ها فقط انیمیشن کارتونی سایت نمایش داده شود. ویدیوهای Pelvic Tilt و Side-lying از نوع آموزش فیزیوتراپی‌اند نه کلاس پیلاتس، اما همان حرکت را نشان می‌دهند. قبل از انتشار، یک بار پخش هر لینک را دستی چک کنید (دسترسی مستقیم به YouTube از محیط پژوهش ممکن نبود).
