const CITY = "Velbert";
const COUNTRY = "Germany";
const METHOD = 13; // Turkish Diyanet

const NOW = new Date();
const CURRENT_YEAR = NOW.getFullYear();
const END_YEAR = 2030;

const prayerData = {}; // { [year]: { year:[..], ramadan:[..] } }

const tableBody = document.getElementById("times-body");
const tableTitle = document.getElementById("table-title");
const tableHintEl = document.getElementById("table-hint");
const ramadanBanner = document.getElementById("ramadan-banner");
const modeButtons = document.querySelectorAll(".mode-btn");

const ayAr = document.getElementById("ayah-ar");
const ayTr = document.getElementById("ayah-tr");
const ayRef = document.getElementById("ayah-ref");

const nowDateEl = document.getElementById("now-date");
const nowTimeEl = document.getElementById("now-time");

const todayDateLabel = document.getElementById("today-date-label");
const todayImsakEl = document.getElementById("today-imsak");
const todayGunesEl = document.getElementById("today-gunes");
const todayOgleEl = document.getElementById("today-ogle");
const todayIkindiEl = document.getElementById("today-ikindi");
const todayAksamEl = document.getElementById("today-aksam");
const todayYatsiEl = document.getElementById("today-yatsi");
const kerahatStatusEl = document.getElementById("kerahat-status");

const weekdayMap = {
  Sunday: "Pazar",
  Monday: "Pazartesi",
  Tuesday: "Salı",
  Wednesday: "Çarşamba",
  Thursday: "Perşembe",
  Friday: "Cuma",
  Saturday: "Cumartesi",
};

const monthNamesTr = [
  "",
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];

// Mindestens 100 kurze Ayetler
const ayatList = [
  { ar: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا", tr: "Şüphesiz zorlukla beraber bir kolaylık vardır.", ref: "İnşirah, 94:6" },
  { ar: "إِنَّ مَعَ الْعُسْرِ يُسْرًا", tr: "Gerçekten güçlükle beraber bir kolaylık vardır.", ref: "İnşirah, 94:5" },
  { ar: "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ", tr: "Şüphesiz Allah sabredenlerle beraberdir.", ref: "Bakara, 2:153" },
  { ar: "وَبَشِّرِ الصَّابِرِينَ", tr: "Sabredenleri müjdele.", ref: "Bakara, 2:155" },
  { ar: "ادْعُونِي أَسْتَجِبْ لَكُمْ", tr: "Bana dua edin, size cevap vereyim.", ref: "Mümin, 40:60" },
  { ar: "وَقَالَ رَبُّكُمُ ادْعُونِي أَسْتَجِبْ لَكُمْ", tr: "Rabbiniz buyurdu: Bana dua edin, size icabet edeyim.", ref: "Mümin, 40:60" },
  { ar: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ", tr: "Kalpler ancak Allah’ı zikretmekle huzur bulur.", ref: "Ra’d, 13:28" },
  { ar: "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ", tr: "Kim Allah’a tevekkül ederse, O ona yeter.", ref: "Talak, 65:3" },
  { ar: "لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ", tr: "Allah’ın rahmetinden ümidinizi kesmeyin.", ref: "Zümer, 39:53" },
  { ar: "إِنَّ رَحْمَتَ اللَّهِ قَرِيبٌ مِّنَ الْمُحْسِنِينَ", tr: "Allah’ın rahmeti iyilik yapanlara yakındır.", ref: "A’raf, 7:56" },
  { ar: "نَحْنُ أَقْرَبُ إِلَيْهِ مِنْ حَبْلِ الْوَرِيدِ", tr: "Biz insana şah damarından daha yakınız.", ref: "Kaf, 50:16" },
  { ar: "وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ", tr: "Siz nerede olursanız olun O sizinle beraberdir.", ref: "Hadid, 57:4" },
  { ar: "وَعَسَى أَن تَكْرَهُوا شَيْئًا وَهُوَ خَيْرٌ لَّكُمْ", tr: "Hoşunuza gitmeyen bir şeyde sizin için hayır olabilir.", ref: "Bakara, 2:216" },
  { ar: "وَعَسَى أَن تُحِبُّوا شَيْئًا وَهُوَ شَرٌّ لَّكُمْ", tr: "Sevdiğiniz bir şey de sizin için şer olabilir.", ref: "Bakara, 2:216" },
  { ar: "إِنَّ اللَّهَ غَفُورٌ رَّحِيمٌ", tr: "Şüphesiz Allah çok bağışlayandır, çok merhamet edendir.", ref: "Bakara, 2:173" },
  { ar: "إِنَّ اللَّهَ يُحِبُّ الْمُتَوَكِّلِينَ", tr: "Allah tevekkül edenleri sever.", ref: "Al-i İmran, 3:159" },
  { ar: "إِنَّ اللَّهَ يُحِبُّ الْمُحْسِنِينَ", tr: "Allah iyilik yapanları sever.", ref: "Bakara, 2:195" },
  { ar: "إِنَّ اللَّهَ يُحِبُّ الْتَّوَّابِينَ", tr: "Allah çokça tevbe edenleri sever.", ref: "Bakara, 2:222" },
  { ar: "إِنَّ اللَّهَ يُحِبُّ الْمُتَطَهِّرِينَ", tr: "Allah temizlenenleri sever.", ref: "Bakara, 2:222" },
  { ar: "وَاللَّهُ يُحِبُّ الصَّابِرِينَ", tr: "Allah sabredenleri sever.", ref: "Al-i İmran, 3:146" },
  { ar: "وَاللَّهُ سَمِيعٌ عَلِيمٌ", tr: "Allah işitendir, bilendir.", ref: "Bakara, 2:181" },
  { ar: "وَاللَّهُ عَلَى كُلِّ شَيْءٍ قَدِيرٌ", tr: "Allah her şeye hakkıyla gücü yetendir.", ref: "Bakara, 2:20" },
  { ar: "اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ", tr: "Allah göklerin ve yerin nurudur.", ref: "Nur, 24:35" },
  { ar: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ", tr: "Allah bize yeter, O ne güzel vekildir.", ref: "Al-i İmran, 3:173" },
  { ar: "رَّبِّ زِدْنِي عِلْمًا", tr: "Rabbim, ilmimi artır.", ref: "Taha, 20:114" },
  { ar: "رَبِّ اشْرَحْ لِي صَدْرِي", tr: "Rabbim göğsümü genişlet.", ref: "Taha, 20:25" },
  { ar: "رَبِّ زِدْنِي هُدًى", tr: "Rabbim, hidayetimi artır.", ref: "Kehf, 18:24 (mana)" },
  { ar: "رَبَّنَا ظَلَمْنَا أَنفُسَنَا", tr: "Rabbimiz, kendimize zulmettik.", ref: "A’raf, 7:23" },
  { ar: "رَبَّنَا اغْفِرْ لَنَا ذُنُوبَنَا", tr: "Rabbimiz, günahlarımızı bağışla.", ref: "Al-i İmran, 3:16" },
  { ar: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً", tr: "Rabbimiz, bize dünyada iyilik ver.", ref: "Bakara, 2:201" },
  { ar: "وَفِي الْآخِرَةِ حَسَنَةً", tr: "Ahirette de iyilik ver.", ref: "Bakara, 2:201" },
  { ar: "رَبَّنَا تَقَبَّلْ مِنَّا", tr: "Rabbimiz, bizden (ibadetimizi) kabul buyur.", ref: "Bakara, 2:127" },
  { ar: "رَبِّ اغْفِرْ وَارْحَمْ", tr: "Rabbim, bağışla ve merhamet et.", ref: "Müminun, 23:118" },
  { ar: "وَعَلَى اللَّهِ فَلْيَتَوَكَّلِ الْمُؤْمِنُونَ", tr: "Müminler sadece Allah’a tevekkül etsinler.", ref: "Al-i İmran, 3:122" },
  { ar: "فَاذْكُرُونِي أَذْكُرْكُمْ", tr: "Beni anın ki ben de sizi anayım.", ref: "Bakara, 2:152" },
  { ar: "إِنَّ اللَّهَ لَا يُضِيعُ أَجْرَ الْمُحْسِنِينَ", tr: "Allah iyilik yapanların ecrini zayi etmez.", ref: "Tevbe, 9:120" },
  { ar: "لَا خَوْفٌ عَلَيْهِمْ وَلَا هُمْ يَحْزَنُونَ", tr: "Onlara korku yoktur, onlar mahzun da olmayacaklardır.", ref: "Yunus, 10:62" },
  { ar: "وَلَا تَيْأَسُوا مِن رَّوْحِ اللَّهِ", tr: "Allah’ın rahmetinden ümit kesmeyin.", ref: "Yusuf, 12:87" },
  { ar: "إِنَّ اللَّهَ يُحِبُّ الْمُتَطَهِّرِينَ", tr: "Allah temizlenenleri sever.", ref: "Tevbe, 9:108" },
  { ar: "إِنَّ أَكْرَمَكُمْ عِندَ اللَّهِ أَتْقَاكُمْ", tr: "Allah katında en değerliniz, en takvalı olanınızdır.", ref: "Hucurat, 49:13" },
  { ar: "لَن يَنفَعَكُمُ الْيَوْمَ إِذ ظَلَمْتُمْ", tr: "Bugün zalim olduğunuz için size fayda yoktur.", ref: "Zuhruf, 43:39" },
  { ar: "إِنَّ اللّهَ لاَ يُغَيِّرُ مَا بِقَوْمٍ", tr: "Allah, bir kavim kendini değiştirmedikçe durumlarını değiştirmez.", ref: "Ra’d, 13:11" },
  { ar: "وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ", tr: "O, her şeye güç yetirendir.", ref: "Mülk, 67:1" },
  { ar: "إِنَّهُ عَلَى رَجْعِهِ لَقَادِرٌ", tr: "Şüphesiz O, onu (insanı) geri döndürmeye kadirdir.", ref: "Tarık, 86:8" },
  { ar: "إِنَّ رَبِّي لَطِيفٌ لِّمَا يَشَاءُ", tr: "Rabbim dilediğine karşı latiftir.", ref: "Yusuf, 12:100" },
  { ar: "إِنَّ رَبَّكَ وَاسِعُ الْمَغْفِرَةِ", tr: "Şüphesiz Rabbinin mağfireti geniştir.", ref: "Necm, 53:32" },
  { ar: "إِنَّ رَبَّكَ لَذُو فَضْلٍ عَلَى النَّاسِ", tr: "Rabbin insanlara karşı büyük lütuf sahibidir.", ref: "Neml, 27:73" },
  { ar: "وَاصْبِرْ وَمَا صَبْرُكَ إِلَّا بِاللَّهِ", tr: "Sabret! Senin sabrın ancak Allah iledir.", ref: "Nahl, 16:127" },
  { ar: "فَاسْتَقِمْ كَمَا أُمِرْتَ", tr: "Emrolunduğun gibi dosdoğru ol.", ref: "Hud, 11:112" },
  { ar: "وَمَا الْحَيَاةُ الدُّنْيَا إِلَّا مَتَاعُ الْغُرُورِ", tr: "Dünya hayatı aldatıcı bir metadan ibarettir.", ref: "Al-i İmran, 3:185" },
  { ar: "إِنَّ أَجَلَ اللَّهِ إِذَا جَاءَ لَا يُؤَخَّرُ", tr: "Allah’ın eceli geldiğinde asla ertelenmez.", ref: "Nuh, 71:4" },
  { ar: "إِنَّ اللَّهَ سَرِيعُ الْحِسَابِ", tr: "Şüphesiz Allah hesabı çabuk görendir.", ref: "Al-i İmran, 3:19" },
  { ar: "مَا عِندَ اللَّهِ خَيْرٌ وَأَبْقَى", tr: "Allah katındaki daha hayırlı ve daha kalıcıdır.", ref: "Kasas, 28:60" },
  { ar: "وَاتَّقُواْ اللّهَ لَعَلَّكُمْ تُفْلِحُونَ", tr: "Umulur ki kurtuluşa eresiniz diye Allah’tan sakının.", ref: "Bakara, 2:189" },
  { ar: "وَتَوَكَّلْ عَلَى اللَّهِ وَكَفَى بِاللَّهِ وَكِيلًا", tr: "Allah’a tevekkül et; vekil olarak Allah yeter.", ref: "Ahzab, 33:3" },
  { ar: "إِنَّ اللَّهَ يَرْزُقُ مَن يَشَاءُ بِغَيْرِ حِسَابٍ", tr: "Allah dilediğine hesapsız rızık verir.", ref: "Nur, 24:38" },
  { ar: "وَرِزْقُ رَبِّكَ خَيْرٌ وَأَبْقَى", tr: "Rabbinin rızkı daha hayırlı ve daha kalıcıdır.", ref: "Taha, 20:131" },
  { ar: "وَمَا عِندَ اللَّهِ خَيْرٌ لِّلْأَبْرَارِ", tr: "Allah katında olan, iyiler için daha hayırlıdır.", ref: "Al-i İmran, 3:198" },
  { ar: "إِنَّ اللَّهَ كَانَ عَلَيْكُمْ رَقِيبًا", tr: "Şüphesiz Allah üzerinizde gözeticidir.", ref: "Nisa, 4:1" },
  { ar: "نِعْمَ الْمَوْلَى وَنِعْمَ النَّصِيرُ", tr: "O ne güzel Mevlâ ve ne güzel yardımcıdır.", ref: "Enfal, 8:40" },
  { ar: "وَأَنَّ إِلَى رَبِّكَ الْمُنتَهَى", tr: "Son varış Rabbinedir.", ref: "Necm, 53:42" },
  { ar: "إِنَّهُ هُوَ السَّمِيعُ الْبَصِيرُ", tr: "Şüphesiz O işitendir, görendir.", ref: "İsra, 17:1" },
  { ar: "إِنَّهُ بِكُلِّ شَيْءٍ عَلِيمٌ", tr: "O her şeyi hakkıyla bilendir.", ref: "Şura, 42:12" },
  { ar: "وَكَانَ فَضْلُ اللَّهِ عَلَيْكَ عَظِيمًا", tr: "Allah’ın üzerinizdeki nimeti çok büyüktür.", ref: "Nisa, 4:113" },
  { ar: "وَهُوَ الْغَفُورُ الرَّحِيمُ", tr: "O, çok bağışlayan, çok merhamet edendir.", ref: "Yunus, 10:107" },
  { ar: "وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ", tr: "Başarım yalnızca Allah’ın yardımı iledir.", ref: "Hud, 11:88" },
  { ar: "وَمَن يَغْفِرُ الذُّنُوبَ إِلَّا اللَّهُ", tr: "Günahları Allah’tan başka kim bağışlayabilir?", ref: "Al-i İmran, 3:135" },
  { ar: "إِنَّ رَبِّي قَرِيبٌ مُّجِيبٌ", tr: "Şüphesiz Rabbim yakındır, duaları kabul edendir.", ref: "Hud, 11:61" },
  { ar: "وَرَحْمَتِي وَسِعَتْ كُلَّ شَيْءٍ", tr: "Rahmetim her şeyi kuşatmıştır.", ref: "A’raf, 7:156" },
  { ar: "إِنَّ اللَّهَ يُدَافِعُ عَنِ الَّذِينَ آمَنُوا", tr: "Allah, iman edenleri savunur.", ref: "Hac, 22:38" },
  { ar: "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا", tr: "Kim Allah’tan sakınırsa, O ona bir çıkış yolu verir.", ref: "Talak, 65:2" },
  { ar: "وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ", tr: "Onu ummadığı yerden rızıklandırır.", ref: "Talak, 65:3" },
  { ar: "إِنَّ اللَّهَ لَطِيفٌ بِعِبَادِهِ", tr: "Şüphesiz Allah kullarına karşı lütuf sahibidir.", ref: "Şura, 42:19" },
  { ar: "إِنَّ رَبَّكَ عَلَى صِرَاطٍ مُّسْتَقِيمٍ", tr: "Şüphesiz Rabbin dosdoğru bir yol üzerindedir.", ref: "Hud, 11:56" },
  { ar: "وَمَن يَغْفِرُ السَّيِّئَاتِ إِلَّا اللَّهُ", tr: "Kötülükleri Allah’tan başka kim bağışlayabilir?", ref: "Al-i İmran, 3:135 (mana)" },
  { ar: "قُلْ حَسْبِيَ اللَّهُ", tr: "De ki: Bana Allah yeter.", ref: "Tevbe, 9:129" },
  { ar: "وَعَلَى اللَّهِ فَلْيَتَوَكَّلِ الْمُتَوَكِّلُونَ", tr: "Tevekkül edenler yalnız Allah’a tevekkül etsinler.", ref: "İbrahim, 14:12" },
  { ar: "إِنَّ مَعِيَ رَبِّي سَيَهْدِينِ", tr: "Şüphesiz Rabbim benimle beraberdir, bana yol gösterecektir.", ref: "Şuara, 26:62" },
  { ar: "قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا", tr: "De ki: Ey nefislerine zulmeden kullarım...", ref: "Zümer, 39:53" },
  { ar: "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا", tr: "Allah kimseye gücünün yettiğinden fazlasını yüklemez.", ref: "Bakara, 2:286" },
  { ar: "هُوَ عَلَيْكُمْ رَؤُوفٌ رَّحِيمٌ", tr: "O size karşı çok şefkatli, çok merhametlidir.", ref: "Hadid, 57:9" },
  { ar: "إِنَّ رَبَّكَ سَرِيعُ الْعِقَابِ", tr: "Şüphesiz Rabbin cezası çabuk verendir.", ref: "A’raf, 7:167" },
  { ar: "إِنَّ رَبَّكَ لَغَفُورٌ رَّحِيمٌ", tr: "Şüphesiz Rabbin çok bağışlayandır, çok merhamet edendir.", ref: "Kehf, 18:58" },
  { ar: "إِنَّ رَبَّكَ وَاسِعُ الرَّحْمَةِ", tr: "Şüphesiz Rabbin rahmeti geniştir.", ref: "En’am, 6:147" },
  { ar: "إِنِّى مَعَكُمَا أَسْمَعُ وَأَرَى", tr: "Şüphesiz ben sizinle beraberim, işitiyorum ve görüyorum.", ref: "Taha, 20:46" },
  { ar: "إِنَّ اللَّهَ خَبِيرٌ بِمَا تَعْمَلُونَ", tr: "Allah yaptıklarınızdan haberdardır.", ref: "Hucurat, 49:18" },
  { ar: "إِنَّ اللَّهَ يُحِبُّ التَّوَّابِينَ", tr: "Allah tevbe edenleri sever.", ref: "Bakara, 2:222 (tekrar farklı ifade)" },
  { ar: "فَاللَّهُ خَيْرٌ حَافِظًا", tr: "Allah en hayırlı koruyucudur.", ref: "Yusuf, 12:64" },
  { ar: "إِنَّ اللَّهَ مَعَنَا", tr: "Şüphesiz Allah bizimle beraberdir.", ref: "Tevbe, 9:40" },
  { ar: "وَاسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ", tr: "Sabır ve namazla yardım isteyin.", ref: "Bakara, 2:45" },
  { ar: "إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا", tr: "Namaz, müminler üzerine vakitleri belirlenmiş bir farzdır.", ref: "Nisa, 4:103" },
  { ar: "وَأَقِمِ الصَّلَاةَ لِذِكْرِي", tr: "Beni anmak için namaz kıl.", ref: "Taha, 20:14" },
  { ar: "أَقِمِ الصَّلَاةَ إِنَّ الصَّلَاةَ تَنْهَىٰ عَنِ الْفَحْشَاءِ", tr: "Namazı kıl; çünkü namaz hayasızlıktan alıkoyar.", ref: "Ankebut, 29:45" },
  { ar: "يَا أَيُّهَا الَّذِينَ آمَنُوا اسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ", tr: "Ey iman edenler! Sabır ve namazla yardım isteyin.", ref: "Bakara, 2:153" },
  { ar: "إِنَّ اللّهَ يُحِبُّ الْمُقْسِطِينَ", tr: "Allah adaletli davrananları sever.", ref: "Maide, 5:42" },
  { ar: "وَاللّهُ يُحِبُّ الْمُطَّهِّرِينَ", tr: "Allah temiz olanları sever.", ref: "Tevbe, 9:108 (farklı ifade)" },
  { ar: "إِنَّ رَبِّي عَلَى صِرَاطٍ مُّسْتَقِيمٍ", tr: "Rabbim dosdoğru yol üzerindedir.", ref: "Hud, 11:56 (kısaltma)" },
  { ar: "اللَّهُ خَالِقُ كُلِّ شَيْءٍ", tr: "Allah her şeyin yaratıcısıdır.", ref: "Zümer, 39:62" },
  { ar: "وَهُوَ عَلَى كُلِّ شَيْءٍ وَكِيلٌ", tr: "O, her şeyin üzerinde vekildir.", ref: "Şura, 42:6" },
  { ar: "وَهُوَ عَلَى كُلِّ شَيْءٍ شَهِيدٌ", tr: "O, her şeye şahittir.", ref: "Fussilet, 41:53" },
  { ar: "إِنَّ رَبَّكَ لَبِالْمِرْصَادِ", tr: "Şüphesiz Rabbin gözetlemededir.", ref: "Fecr, 89:14" },
  { ar: "إِنَّ الظَّالِمِينَ لَهُمْ عَذَابٌ أَلِيمٌ", tr: "Şüphesiz zalimler için elem verici bir azap vardır.", ref: "İbrahim, 14:22" },
  { ar: "إِنَّ الْأَبْرَارَ لَفِي نَعِيمٍ", tr: "Şüphesiz iyiler mutluluk içindedirler.", ref: "İnfitâr, 82:13" },
  { ar: "إِنَّ الْفُجَّارَ لَفِي جَحِيمٍ", tr: "Şüphesiz günahkârlar cehennem içindedirler.", ref: "İnfitâr, 82:14" },
  { ar: "سَلَامٌ قَوْلًا مِّن رَّبٍّ رَّحِيمٍ", tr: "Onlara çok merhametli Rabden bir söz olarak 'Selam' vardır.", ref: "Yasin, 36:58" },
  { ar: "لَهُم مَّا يَشَاؤُونَ فِيهَا", tr: "Orada onların diledikleri her şey vardır.", ref: "Kaf, 50:35" },
  { ar: "وَلَدَيْنَا مَزِيدٌ", tr: "Katımızda daha fazlası da vardır.", ref: "Kaf, 50:35" }
];

let currentMode = "normal"; // "normal" oder "ramadan"
let kerahatIntervalId = null;

function cleanTime(str) {
  return String(str).split(" ")[0];
}

async function loadYearData(year) {
  if (prayerData[year]) return;

  const yearRows = [];
  const ramadanRows = [];

  for (let month = 1; month <= 12; month++) {
    const url =
      "https://api.aladhan.com/v1/calendarByCity?" +
      `city=${encodeURIComponent(CITY)}` +
      `&country=${encodeURIComponent(COUNTRY)}` +
      `&method=${METHOD}` +
      `&month=${month}` +
      `&year=${year}`;

    const res = await fetch(url);
    const json = await res.json();

    if (json.code !== 200 || !Array.isArray(json.data)) {
      console.error("API error", json);
      throw new Error("Namaz vakti API hatası.");
    }

    json.data.forEach((dayObj) => {
      const g = dayObj.date.gregorian;
      const h = dayObj.date.hijri;
      const t = dayObj.timings;

      const [dayStr, monthStr, yearStr] = g.date.split("-");
      const d = parseInt(dayStr, 10);
      const m = parseInt(monthStr, 10);
      const y = parseInt(yearStr, 10);

      const dateStr = `${dayStr}.${monthStr}.${yearStr}`;
      const weekdayEn = g.weekday.en;
      const weekdayTr = weekdayMap[weekdayEn] || weekdayEn;

      const row = {
        date: dateStr,
        day: weekdayTr,
        dayNum: d,
        monthNum: m,
        yearNum: y,
        imsak: cleanTime(t.Imsak),
        gunes: cleanTime(t.Sunrise),
        ogle: cleanTime(t.Dhuhr),
        ikindi: cleanTime(t.Asr),
        aksam: cleanTime(t.Maghrib),
        yatsi: cleanTime(t.Isha),
        isRamadan: h.month.number === 9
      };

      yearRows.push(row);
      if (row.isRamadan) {
        ramadanRows.push(row);
      }
    });
  }

  prayerData[year] = { year: yearRows, ramadan: ramadanRows };
}

async function loadAllYearsUpTo2030() {
  for (let y = CURRENT_YEAR; y <= END_YEAR; y++) {
    await loadYearData(y);
  }
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function updateClock() {
  if (!nowDateEl || !nowTimeEl) return;
  const now = new Date();
  const d = pad2(now.getDate());
  const m = pad2(now.getMonth() + 1);
  const y = now.getFullYear();
  const hh = pad2(now.getHours());
  const mm = pad2(now.getMinutes());
  const ss = pad2(now.getSeconds());

  nowDateEl.textContent = `${d}.${m}.${y}`;
  nowTimeEl.textContent = `${hh}:${mm}:${ss}`;
}

function renderRandomAyah() {
  if (!ayAr || !ayTr || !ayRef) return;
  const idx = Math.floor(Math.random() * ayatList.length);
  const ay = ayatList[idx];
  ayAr.textContent = ay.ar;
  ayTr.textContent = ay.tr;
  ayRef.textContent = ay.ref;
}

function toDateFromRow(row) {
  return new Date(row.yearNum, row.monthNum - 1, row.dayNum);
}

function parseTimeOnDate(row, timeStr) {
  const [hh, mm] = timeStr.split(":").map((v) => parseInt(v, 10));
  return new Date(row.yearNum, row.monthNum - 1, row.dayNum, hh, mm, 0, 0);
}

function renderTodayBlock(todayRow) {
  if (
    !todayRow ||
    !todayImsakEl ||
    !todayGunesEl ||
    !todayOgleEl ||
    !todayIkindiEl ||
    !todayAksamEl ||
    !todayYatsiEl ||
    !todayDateLabel
  )
    return;

  const d = pad2(todayRow.dayNum);
  const mName = monthNamesTr[todayRow.monthNum] || "";
  todayDateLabel.textContent = `${todayRow.day} • ${d} ${mName} ${todayRow.yearNum}`;

  todayImsakEl.textContent = todayRow.imsak;
  todayGunesEl.textContent = todayRow.gunes;
  todayOgleEl.textContent = todayRow.ogle;
  todayIkindiEl.textContent = todayRow.ikindi;
  todayAksamEl.textContent = todayRow.aksam;
  todayYatsiEl.textContent = todayRow.yatsi;

  updateKerahat(todayRow);
}

function updateKerahat(todayRow) {
  if (!kerahatStatusEl || !todayRow) return;

  kerahatStatusEl.classList.remove("kerahat-active");

  try {
    const now = new Date();
    const ikindiTime = parseTimeOnDate(todayRow, todayRow.ikindi);
    const aksamTime = parseTimeOnDate(todayRow, todayRow.aksam);

    if (now >= ikindiTime && now < aksamTime) {
      const diffMin = (aksamTime - now) / (1000 * 60);
      if (diffMin <= 45) {
        kerahatStatusEl.textContent =
          "Kerahat: İkindi ile Akşam arası son 45 dakika.";
        kerahatStatusEl.classList.add("kerahat-active");
        return;
      }
    }

    kerahatStatusEl.textContent = "Kerahat: –";
  } catch (e) {
    console.error(e);
    kerahatStatusEl.textContent = "Kerahat: –";
  }
}

function setMode(newMode) {
  currentMode = newMode;
  modeButtons.forEach((btn) => {
    if (btn.dataset.mode === newMode) btn.classList.add("active");
    else btn.classList.remove("active");
  });

  if (ramadanBanner) {
    ramadanBanner.classList.toggle("visible", newMode === "ramadan");
  }

  if (tableHintEl) {
    if (newMode === "normal") {
      tableHintEl.innerHTML =
        'Bugünden itibaren <strong>2030 sonuna kadar</strong> tüm günler.';
    } else {
      tableHintEl.textContent =
        "Bugünden itibaren Ramazan günleri (birinci günden son güne kadar) gösterilir.";
    }
  }

  renderTableAndToday();
}

async function renderTableAndToday() {
  if (!tableBody || !tableTitle) return;

  tableBody.innerHTML =
    '<tr><td colspan="8" style="padding:0.8rem;">Yükleniyor...</td></tr>';

  try {
    await loadAllYearsUpTo2030();

    const allRows = [];
    const allRamadanRows = [];

    for (let y = CURRENT_YEAR; y <= END_YEAR; y++) {
      const data = prayerData[y];
      if (!data) continue;
      allRows.push(...data.year);
      allRamadanRows.push(...data.ramadan);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Heute-Row
    const todayRow = allRows.find((row) => {
      const rd = toDateFromRow(row);
      return rd.getTime() === today.getTime();
    });
    if (todayRow) renderTodayBlock(todayRow);

    if (kerahatIntervalId) clearInterval(kerahatIntervalId);
    if (todayRow) {
      kerahatIntervalId = setInterval(() => updateKerahat(todayRow), 60_000);
    }

    let rowsToShow = [];

    if (currentMode === "normal") {
      rowsToShow = allRows
        .filter((row) => toDateFromRow(row) >= today)
        .sort((a, b) => toDateFromRow(a) - toDateFromRow(b));

      tableTitle.textContent =
        "Velbert – Namaz Takvimi (Bugünden 2030 sonuna kadar)";
    } else {
      rowsToShow = allRamadanRows
        .filter((row) => toDateFromRow(row) >= today)
        .sort((a, b) => toDateFromRow(a) - toDateFromRow(b));

      tableTitle.textContent =
        "Velbert – Ramazan Günleri (birinci günden son güne kadar)";
    }

    tableBody.innerHTML = "";

    if (rowsToShow.length === 0) {
      const tr = document.createElement("tr");
      tr.innerHTML =
        '<td colspan="8" style="padding:0.8rem;">Gösterilecek gün bulunamadı.</td>';
      tableBody.appendChild(tr);
      return;
    }

    rowsToShow.forEach((row) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="date-cell">${row.date}</td>
        <td class="day-cell">${row.day}</td>
        <td>${row.imsak}</td>
        <td>${row.gunes}</td>
        <td>${row.ogle}</td>
        <td>${row.ikindi}</td>
        <td>${row.aksam}</td>
        <td>${row.yatsi}</td>
      `;
      tableBody.appendChild(tr);
    });
  } catch (err) {
    console.error(err);
    tableBody.innerHTML =
      '<tr><td colspan="8" style="padding:0.8rem;color:#fca5a5;">Namaz vakitleri alınırken bir hata oluştu. Lütfen sayfayı yenile.</td></tr>';
  }
}

/* Event-Listener */

modeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const mode = btn.dataset.mode;
    setMode(mode);
  });
});

/* Initialisierung */

renderRandomAyah();
updateClock();
setInterval(updateClock, 1000);
renderTableAndToday();
