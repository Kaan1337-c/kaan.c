(() => {
  const panel = document.getElementById('visitor-terminal');
  const output = document.getElementById('visitor-output');
  if (!panel || !output) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let stopped=false,generation=0;
  window.addEventListener('pagehide',()=>{stopped=true;generation++;});
  window.addEventListener('pageshow',event=>{if(event.persisted){stopped=false;start();}});


  const messages = {
    en: ['Welcome!', 'Thanks for viewing my portfolio.', 'If you have any questions, you can email me:'],
    tr: ['Hoş geldin!', 'Portföyümü incelediğin için teşekkürler.', 'Soruların varsa bana e-posta gönderebilirsin:'],
    de: ['Willkommen!', 'Danke, dass du dir mein Portfolio ansiehst.', 'Bei Fragen kannst du mir eine E-Mail schreiben:'],
    fr: ['Bienvenue !', 'Merci de consulter mon portfolio.', 'Si tu as des questions, tu peux m’envoyer un e-mail :'],
    es: ['¡Bienvenido!', 'Gracias por visitar mi portafolio.', 'Si tienes alguna pregunta, puedes escribirme:'],
    it: ['Benvenuto!', 'Grazie per aver visitato il mio portfolio.', 'Se hai domande, puoi scrivermi via e-mail:'],
    pt: ['Bem-vindo!', 'Obrigado por visitar meu portfólio.', 'Se tiver alguma dúvida, pode me enviar um e-mail:'],
    ru: ['Добро пожаловать!', 'Спасибо за просмотр моего портфолио.', 'Если у вас есть вопросы, напишите мне:'],
    uk: ['Ласкаво прошу!', 'Дякую за перегляд мого портфоліо.', 'Якщо маєте запитання, напишіть мені:'],
    pl: ['Witaj!', 'Dziękuję za obejrzenie mojego portfolio.', 'Jeśli masz pytania, napisz do mnie:'],
    nl: ['Welkom!', 'Bedankt voor het bekijken van mijn portfolio.', 'Als je vragen hebt, kun je me mailen:'],
    sv: ['Välkommen!', 'Tack för att du tittar på min portfolio.', 'Om du har frågor kan du mejla mig:'],
    da: ['Velkommen!', 'Tak fordi du ser min portfolio.', 'Hvis du har spørgsmål, kan du sende mig en e-mail:'],
    no: ['Velkommen!', 'Takk for at du ser på porteføljen min.', 'Har du spørsmål, kan du sende meg en e-post:'],
    fi: ['Tervetuloa!', 'Kiitos, että tutustut portfoliooni.', 'Jos sinulla on kysyttävää, voit lähettää minulle sähköpostia:'],
    cs: ['Vítej!', 'Děkuji za prohlédnutí mého portfolia.', 'Pokud máš otázky, můžeš mi napsat e-mail:'],
    sk: ['Vitaj!', 'Ďakujem za prezretie môjho portfólia.', 'Ak máš otázky, môžeš mi napísať e-mail:'],
    hu: ['Üdvözöllek!', 'Köszönöm, hogy megnézed a portfóliómat.', 'Ha kérdésed van, írj nekem e-mailt:'],
    ro: ['Bun venit!', 'Mulțumesc că îmi vizitezi portofoliul.', 'Dacă ai întrebări, îmi poți trimite un e-mail:'],
    bg: ['Добре дошли!', 'Благодаря, че разглеждате моето портфолио.', 'Ако имате въпроси, пишете ми:'],
    el: ['Καλώς ήρθες!', 'Ευχαριστώ που βλέπεις το portfolio μου.', 'Αν έχεις ερωτήσεις, μπορείς να μου στείλεις email:'],
    sr: ['Dobro došli!', 'Hvala što gledate moj portfolio.', 'Ako imate pitanja, pošaljite mi e-mail:'],
    hr: ['Dobro došli!', 'Hvala što pregledavate moj portfolio.', 'Ako imate pitanja, pošaljite mi e-poštu:'],
    bs: ['Dobro došli!', 'Hvala što pregledate moj portfolio.', 'Ako imate pitanja, pošaljite mi e-mail:'],
    sl: ['Dobrodošli!', 'Hvala za ogled mojega portfelja.', 'Če imate vprašanja, mi lahko pošljete e-pošto:'],
    sq: ['Mirë se vini!', 'Faleminderit që po shikoni portofolin tim.', 'Nëse keni pyetje, mund të më dërgoni një email:'],
    az: ['Xoş gəlmisən!', 'Portfolioma baxdığın üçün təşəkkürlər.', 'Sualların varsa, mənə e-poçt göndərə bilərsən:'],
    ka: ['კეთილი იყოს თქვენი მობრძანება!', 'გმადლობთ ჩემი პორტფოლიოს ნახვისთვის.', 'თუ შეკითხვები გაქვთ, მომწერეთ ელფოსტაზე:'],
    ar: ['أهلاً وسهلاً!', 'شكراً لزيارة معرض أعمالي.', 'إذا كانت لديك أسئلة، يمكنك مراسلتي عبر البريد الإلكتروني:'],
    fa: ['خوش آمدید!', 'از اینکه نمونه‌کارهای من را می‌بینید سپاسگزارم.', 'اگر سؤالی دارید، می‌توانید برایم ایمیل بفرستید:'],
    he: ['ברוכים הבאים!', 'תודה שצפיתם בתיק העבודות שלי.', 'אם יש לכם שאלות, אפשר לשלוח לי אימייל:'],
    ja: ['ようこそ！', 'ポートフォリオをご覧いただき、ありがとうございます。', 'ご質問がありましたら、メールでご連絡ください：'],
    ko: ['환영합니다!', '제 포트폴리오를 봐 주셔서 감사합니다.', '궁금한 점이 있으시면 이메일로 연락해 주세요:'],
    zh: ['欢迎！', '感谢浏览我的作品集。', '如有任何问题，欢迎通过电子邮件联系我：'],
    hi: ['स्वागत है!', 'मेरा पोर्टफोलियो देखने के लिए धन्यवाद।', 'यदि आपके कोई सवाल हैं, तो मुझे ईमेल कर सकते हैं:'],
    bn: ['স্বাগতম!', 'আমার পোর্টফোলিও দেখার জন্য ধন্যবাদ।', 'কোনো প্রশ্ন থাকলে আমাকে ইমেইল করতে পারেন:'],
    ur: ['خوش آمدید!', 'میرا پورٹ فولیو دیکھنے کا شکریہ۔', 'اگر آپ کے کوئی سوالات ہیں تو مجھے ای میل کر سکتے ہیں:'],
    id: ['Selamat datang!', 'Terima kasih sudah melihat portofolio saya.', 'Jika ada pertanyaan, silakan kirim email kepada saya:'],
    ms: ['Selamat datang!', 'Terima kasih kerana melihat portfolio saya.', 'Jika ada soalan, anda boleh menghantar e-mel kepada saya:'],
    vi: ['Chào mừng!', 'Cảm ơn bạn đã xem hồ sơ dự án của tôi.', 'Nếu có câu hỏi, bạn có thể gửi email cho tôi:'],
    th: ['ยินดีต้อนรับ!', 'ขอบคุณที่เข้าชมผลงานของผม', 'หากมีคำถาม สามารถส่งอีเมลถึงผมได้:'],
    tl: ['Maligayang pagdating!', 'Salamat sa pagtingin sa aking portfolio.', 'Kung may mga tanong ka, maaari mo akong i-email:'],
    sw: ['Karibu!', 'Asante kwa kutazama kazi zangu.', 'Ikiwa una maswali, unaweza kunitumia barua pepe:']
  };
  const localizedHello={ru:'Привет',ja:'こんにちは'};
  const language = value => String(value || '').toLowerCase().split(/[-_]/)[0];
  const countryLanguages = {};
  const regions = {
    tr:'TR CY',de:'DE AT LI',fr:'FR MC SN CI BF ML NE BJ TG CD CG GA GN',es:'ES MX AR BO CL CO CR CU DO EC GT HN NI PA PE PY SV UY VE',it:'IT SM VA',pt:'PT BR AO MZ CV ST GW',ru:'RU BY',uk:'UA',pl:'PL',nl:'NL SR',sv:'SE',da:'DK',no:'NO',fi:'FI',cs:'CZ',sk:'SK',hu:'HU',ro:'RO MD',bg:'BG',el:'GR',sr:'RS ME',hr:'HR',bs:'BA',sl:'SI',sq:'AL XK',az:'AZ',ka:'GE',ar:'SA AE BH KW OM QA JO LB SY IQ YE EG DZ MA TN LY SD PS',fa:'IR AF',he:'IL',ja:'JP',ko:'KR',zh:'CN TW HK MO',hi:'IN',bn:'BD',ur:'PK',id:'ID',ms:'MY BN',vi:'VN',th:'TH',tl:'PH',sw:'TZ KE',en:'US GB AU NZ IE JM BB BS TT GY BZ NG GH GM SL LR ZM ZW MW BW NA UG RW SS'
  };
  Object.entries(regions).forEach(([lang,countries]) => countries.split(' ').forEach(country => { countryLanguages[country]=lang; }));
  Object.assign(countryLanguages, {CA:'en,fr',BE:'nl,fr,de',CH:'de,fr,it',LU:'fr,de',SG:'en,zh,ms',ZA:'en',MT:'en',IS:'en',EE:'en',LV:'en',LT:'en'});
  const validIP = value => typeof value === 'string' && value.length <= 45 &&
    (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(value) || /^[a-f0-9:]+$/i.test(value) && value.includes(':'));
  async function getJSON(url,options={}) {
    const {timeoutMs=4500,...request}=options;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { ...request, signal: controller.signal, credentials: 'omit', cache: 'no-store', referrerPolicy: 'no-referrer' });
      if (!response.ok) throw new Error('Lookup unavailable');
      return await response.json();
    } finally { clearTimeout(timeout); }
  }
  async function locate() {
    try {
      const geo = await getJSON('https://api.country.is/');
      if (!validIP(geo.ip) || !/^[A-Z]{2}$/.test(geo.country || '')) throw new Error('Lookup unavailable');
      return {ip:geo.ip,country_code:geo.country,languages:countryLanguages[geo.country] || 'en'};
    } catch {                                                         }
    try {
      const geo = await getJSON('https://ipapi.co/json/');
      if (geo.error || !validIP(geo.ip)) throw new Error('Lookup unavailable');
      return geo;
    } catch {
      try { const result = await getJSON('https://api64.ipify.org?format=json'); return { ip: validIP(result.ip) ? result.ip : null }; }
      catch { return {}; }
    }
  }
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  async function visibleWait(ms,run=generation){
    let remaining=ms;
    while(remaining>0&&!stopped&&run===generation){
      const part=Math.min(remaining,100);
      await wait(part);
      if(!document.hidden)remaining-=part;
    }
  }
  function addFlag(line,country){
    if(!country)return;
    const img=document.createElement('img');
    img.className='country-flag';img.src=`https://flagcdn.com/${country.toLowerCase()}.svg`;
    img.width=24;img.height=16;img.alt=`${country} flag`;img.referrerPolicy='no-referrer';
    img.addEventListener('error',()=>{const fallback=document.createElement('span');fallback.className='country-flag';fallback.textContent=country;img.replaceWith(fallback);},{once:true});
    line.append(img);
  }
  async function showPart(part,index,run=generation){
    if(stopped||run!==generation)return;
    output.replaceChildren();output.classList.remove('fading');
    panel.dataset.phase=String(index);
    const prompt=document.createElement('div');prompt.className='cmd-prompt';prompt.textContent='> console.log("hello")';
    const line=document.createElement('p');line.className='cmd-message';line.lang=part.lang;
    if(['ar','fa','he','ur'].includes(part.lang))line.dir='rtl';
    const target=document.createElement('span');
    const text=document.createTextNode('');target.append(text);line.append(target);
    const cursor=document.createElement('span');cursor.className='typing-cursor';cursor.textContent='▋';cursor.setAttribute('aria-hidden','true');line.append(cursor);
    output.append(prompt,line);
    if(part.email){
      const email=document.createElement('a');email.className='cmd-email';email.href='mailto:kaanyaxiz@icloud.com';email.textContent='kaanyaxiz@icloud.com';
      output.append(email);
    }
    if(reduced.matches)text.appendData(part.text);
    else for(const char of part.text){
        if(stopped||run!==generation)return;
        text.appendData(char);
        await visibleWait(45+Math.random()*25,run);
      }
    if(stopped||run!==generation)return;
    addFlag(line,part.country);
    await visibleWait(part.email?8000:3200,run);
    if(!reduced.matches&&run===generation){output.classList.add('fading');await visibleWait(650,run);}
  }
  async function start(){
    const run=++generation;
    const geo=await locate();if(stopped||run!==generation)return;
    const browser=language(navigator.language);
    const local=String(geo.languages||'').split(',').map(language).filter(Boolean);
    const lang=local.includes(browser)&&messages[browser]?browser:local.find(item=>messages[item])||(messages[browser]?browser:'en');
    const strings=messages[lang];
    const country=/^[A-Z]{2}$/.test(geo.country_code||'')?geo.country_code:'';
    const parts=[
      {text:strings[0],lang,country},
      {text:strings[1],lang},
      {text:strings[2],lang,email:true}
    ];
    if(document.documentElement.classList.contains('intro-active')) await new Promise(resolve=>document.addEventListener('portfolio:ready',resolve,{once:true}));
    if(stopped||run!==generation)return;
    panel.hidden=false;
    const helloWord=localizedHello[lang]||'Hello';
    const hello={text:geo.ip?`${helloWord} ${geo.ip}`:helloWord,lang};
    await showPart(hello,0,run);
    if(stopped||run!==generation)return;
    while(!stopped&&run===generation){
      for(let i=0;i<parts.length&&!stopped&&run===generation;i++)await showPart(parts[i],i+1,run);
      if(!stopped&&run===generation)await showPart(hello,0,run);
    }
  }
  start();
})();
