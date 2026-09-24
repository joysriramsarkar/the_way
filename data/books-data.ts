export interface BookLink {
  label: string;
  url: string;
}

export interface BookCategory {
  id: string;
  num: string;
  title: string;
  blurb: string;
  chip: string;
  bar: string;
}

export interface BookWork {
  id: string;
  slug?: string;
  cat: string;
  title: string;
  orig?: string;
  author: string;
  year: string;
  lang?: string;
  desc: string;
  links?: BookLink[];
  hasJson?: boolean;
  pdf?: string;
}

export const CATEGORIES: BookCategory[] = [
  {
    "id": "marx",
    "num": "০১",
    "title": "মার্কস–এঙ্গেলস",
    "blurb": "ভিত্তিপ্রস্তর — ইশতেহার থেকে পুঁজি",
    "chip": "bg-red text-paper",
    "bar": "bg-red"
  },
  {
    "id": "lenin",
    "num": "০২",
    "title": "লেনিন ও রুশ বিপ্লব",
    "blurb": "পার্টি, সাম্রাজ্যবাদ, রাষ্ট্র",
    "chip": "bg-steel text-paper",
    "bar": "bg-steel"
  },
  {
    "id": "theory",
    "num": "০৩",
    "title": "তত্ত্ব ও বিতর্ক",
    "blurb": "লুক্সেমবুর্গ থেকে গ্রামশি — সংশোধন, বিপ্লব, আধিপত্য",
    "chip": "bg-gold text-paper",
    "bar": "bg-gold"
  },
  {
    "id": "liberation",
    "num": "০৪",
    "title": "মুক্তিসংগ্রামের লেখা",
    "blurb": "চীন, ভিয়েতনাম, কিউবা, আলজেরিয়া, ভারত",
    "chip": "bg-olive text-paper",
    "bar": "bg-olive"
  },
  {
    "id": "fiction",
    "num": "০৫",
    "title": "উপন্যাস ও সাক্ষ্য-সাহিত্য",
    "blurb": "গোর্কি, লন্ডন, রিড — গল্পে বিপ্লবের শতাব্দী",
    "chip": "bg-plum text-paper",
    "bar": "bg-plum"
  },
  {
    "id": "poetry",
    "num": "০৬",
    "title": "কবিতা ও নাটক",
    "blurb": "মায়াভস্কি, নেরুদা, নজরুল, সুকান্ত",
    "chip": "bg-teal text-paper",
    "bar": "bg-teal"
  },
  {
    "id": "bangla",
    "num": "০৭",
    "title": "বাংলা মার্কসবাদ",
    "blurb": "ইশতেহারের বাংলা থেকে তিতাশ, তেভাগা",
    "chip": "bg-ink text-paper",
    "bar": "bg-ink"
  },
  {
    "id": "north-korea",
    "num": "০৮",
    "title": "উত্তর কোরীয় বিপ্লবী সাহিত্য",
    "blurb": "জুচে, কিম ইল-সুং থেকে কোরীয় বিপ্লবের মহাকাব্য",
    "chip": "bg-steel text-paper",
    "bar": "bg-steel"
  }
];

export const WORKS: BookWork[] = [
  {
    "id": "manifest",
    "cat": "marx",
    "title": "কমিউনিস্ট ইশতেহার",
    "orig": "Manifest der Kommunistischen Partei",
    "author": "কার্ল মার্কস ও ফ্রিডরিখ এঙ্গেলস",
    "year": "1848",
    "lang": "জার্মান",
    "desc": "“ইউরোপে এক ভূত ঘুরে বেড়াচ্ছে” — ২৩ পাতার এই ঘোষণাপত্র দিয়েই শুরু আধুনিক কমিউনিস্ট আন্দোলন; শ্রেণিসংগ্রামের ইতিহাসের সঙ্ক্ষিপ্ততম রূপরেখা।",
    "links": [
      {
        "label": "English",
        "url": "https://www.marxists.org/archive/marx/works/1848/communist-manifesto/"
      },
      {
        "label": "মূল জার্মান",
        "url": "https://www.marxists.org/deutsch/archiv/marx-engels/1848/manifest/"
      },
      {
        "label": "বাংলা অনুবাদ",
        "url": "https://www.marxists.org/bengali/"
      }
    ]
  },
  {
    "id": "capital1",
    "cat": "marx",
    "title": "পুঁজি, ১ম খণ্ড",
    "orig": "Das Kapital, Band I",
    "author": "কার্ল মার্কস",
    "year": "1867",
    "lang": "জার্মান",
    "desc": "পণ্য, উদ্বৃত্ত-মূল্য ও শোষণের বিশ্ববিখ্যাত বিশ্লেষণ — আধুনিক অর্থনীতির ভিত নাড়িয়ে দেওয়া গ্রন্থ।",
    "links": [
      {
        "label": "সম্পূর্ণ পড়ুন",
        "url": "https://www.marxists.org/archive/marx/works/1867-c1/"
      }
    ]
  },
  {
    "id": "capital2",
    "cat": "marx",
    "title": "পুঁজি, ২য় খণ্ড",
    "orig": "Das Kapital, Band II",
    "author": "কার্ল মার্কস (সম্পাদনা: এঙ্গেলস)",
    "year": "1885",
    "lang": "জার্মান",
    "desc": "পুঁজির প্রচলন ও পুনরুৎপাদনের তত্ত্ব — মার্কসের পাণ্ডুলিপি থেকে এঙ্গেলসের সম্পাদনায় প্রকাশ।",
    "links": [
      {
        "label": "সম্পূর্ণ পড়ুন",
        "url": "https://www.marxists.org/archive/marx/works/1885-c2/"
      }
    ]
  },
  {
    "id": "capital3",
    "cat": "marx",
    "title": "পুঁজি, ৩য় খণ্ড",
    "orig": "Das Kapital, Band III",
    "author": "কার্ল মার্কস (সম্পাদনা: এঙ্গেলস)",
    "year": "1894",
    "lang": "জার্মান",
    "desc": "মুনাফা, সুদ ও ভূমি-খাজনা — শোষণের চূড়ান্ত হিসাব কীভাবে বাজারের পর্দার আড়ালে চলে।",
    "links": [
      {
        "label": "সম্পূর্ণ পড়ুন",
        "url": "https://www.marxists.org/archive/marx/works/1894-c3/"
      }
    ]
  },
  {
    "id": "theses",
    "cat": "marx",
    "title": "ফয়েরবাখ সম্পর্কে এগারোটি অভিমত",
    "orig": "Thesen über Feuerbach",
    "author": "কার্ল মার্কস",
    "year": "1845",
    "lang": "জার্মান",
    "desc": "“দার্শনিকরা এ পর্যন্ত জগতকে কেবল ব্যাখ্যা করেছেন; আসল কথা তা বদলে ফেলা” — এক পাতার নোটে ঐতিহাসিক বস্তুবাদের বীজ।",
    "links": [
      {
        "label": "সম্পূর্ণ পড়ুন",
        "url": "https://www.marxists.org/archive/marx/works/1845/theses/"
      }
    ]
  },
  {
    "id": "ideology",
    "cat": "marx",
    "title": "জার্মান ভাবাদর্শ",
    "orig": "Die deutsche Ideologie",
    "author": "মার্কস ও এঙ্গেলস",
    "year": "1846",
    "lang": "জার্মান",
    "desc": "বস্তুবাদী ইতিহাস-দর্শনের প্রথম পূর্ণাঙ্গ প্রতিষ্ঠা — “চেতনা নয়, জীবনই চেতনাকে নির্ধারণ করে।”",
    "links": [
      {
        "label": "সম্পূর্ণ পড়ুন",
        "url": "https://www.marxists.org/archive/marx/works/1845/german-ideology/"
      }
    ]
  },
  {
    "id": "poverty",
    "cat": "marx",
    "title": "দর্শনের দারিদ্র্য",
    "orig": "Misère de la philosophie",
    "author": "কার্ল মার্কস",
    "year": "1847",
    "lang": "ফরাসি",
    "desc": "প্রুধনের অর্থনীতির জবাবে মার্কসের তীক্ষ্ণ প্রথম অর্থনৈতিক গ্রন্থ।",
    "links": [
      {
        "label": "সম্পূর্ণ পড়ুন",
        "url": "https://www.marxists.org/archive/marx/works/1847/poverty-philosophy/"
      }
    ]
  },
  {
    "id": "working-class",
    "cat": "marx",
    "title": "ইংল্যান্ডে শ্রমজীবী শ্রেণীর অবস্থা",
    "orig": "Die Lage der arbeitenden Klasse in England",
    "author": "ফ্রিডরিখ এঙ্গেলস",
    "year": "1845",
    "lang": "জার্মান",
    "desc": "ম্যানচেস্টারের কারখানা-গলির প্রত্যক্ষ তদন্ত — শ্রমিক দুর্দশার প্রথম বৈজ্ঞানিক দলিল।",
    "links": [
      {
        "label": "সম্পূর্ণ পড়ুন",
        "url": "https://www.marxists.org/archive/marx/works/1845/condition-working-class/"
      }
    ]
  },
  {
    "id": "wage",
    "cat": "marx",
    "title": "বেতন-শ্রম ও পুঁজি",
    "orig": "Lohnarbeit und Kapital",
    "author": "কার্ল মার্কস",
    "year": "1849",
    "lang": "জার্মান",
    "desc": "শ্রমিকের শ্রম আর মালিকের মুনাফার সম্পর্কের সবচেয়ে সহজ পাঠ।",
    "links": [
      {
        "label": "সম্পূর্ণ পড়ুন",
        "url": "https://www.marxists.org/archive/marx/works/1847/wage-labour/"
      }
    ]
  },
  {
    "id": "value",
    "cat": "marx",
    "title": "মূল্য, দাম ও মুনাফা",
    "orig": "Value, Price and Profit",
    "author": "কার্ল মার্কস",
    "year": "1865",
    "lang": "ইংরেজি",
    "desc": "প্রথম আন্তর্জাতিকের কর্মীদের জন্য মার্কসের নিজের হাতে লেখা জনপ্রিয় ব্যাখ্যা।",
    "links": [
      {
        "label": "সম্পূর্ণ পড়ুন",
        "url": "https://www.marxists.org/archive/marx/works/1865/value-price-profit/"
      }
    ]
  },
  {
    "id": "utopian",
    "cat": "marx",
    "title": "ইউটোপীয় ও বৈজ্ঞানিক সমাজতন্ত্র",
    "orig": "Socialisme utopique et socialisme scientifique",
    "author": "ফ্রিডরিখ এঙ্গেলস",
    "year": "1880",
    "lang": "ফরাসি",
    "desc": "স্বপ্নের সমাজতন্ত্র থেকে বিজ্ঞানের সমাজতন্ত্রে উত্তরণের পথনির্দেশ — সবচেয়ে বহুলপঠিত মার্কসবাদী ভূমিকা।",
    "links": [
      {
        "label": "সম্পূর্ণ পড়ুন",
        "url": "https://www.marxists.org/archive/marx/works/1880/soc-utop/"
      }
    ]
  },
  {
    "id": "origin",
    "cat": "marx",
    "title": "পরিবার, ব্যক্তিগত সম্পত্তি ও রাষ্ট্রের উৎপত্তি",
    "orig": "Der Ursprung der Familie, des Privateigentums und des Staats",
    "author": "ফ্রিডরিখ এঙ্গেলস",
    "year": "1884",
    "lang": "জার্মান",
    "desc": "নারীর অধীনতার শিকড় খোঁজে সম্পত্তির ইতিহাসে — মার্কসবাদী নারীবাদের ভিত্তিগ্রন্থ।",
    "links": [
      {
        "label": "সম্পূর্ণ পড়ুন",
        "url": "https://www.marxists.org/archive/marx/works/1884/origin-family/"
      }
    ]
  },
  {
    "id": "gotha",
    "cat": "marx",
    "title": "গৌতা কর্মসূচীর সমালোচনা",
    "orig": "Kritik des Gothaer Programms",
    "author": "কার্ল মার্কস",
    "year": "1875",
    "lang": "জার্মান",
    "desc": "“প্রত্যেকের কাছ থেকে তার সামর্থ্য, প্রত্যেককে তার প্রয়োজন মতো” — কমিউনিস্ট সমাজের দুই পর্যায়ের প্রথম খসড়া।",
    "links": [
      {
        "label": "সম্পূর্ণ পড়ুন",
        "url": "https://www.marxists.org/archive/marx/works/1875/gotha/"
      }
    ]
  },
  {
    "id": "civilwar",
    "cat": "marx",
    "title": "ফ্রান্সে গৃহযুদ্ধ",
    "orig": "The Civil War in France",
    "author": "কার্ল মার্কস",
    "year": "1871",
    "lang": "ইংরেজি",
    "desc": "প্যারিস কমিউনের রক্তাক্ত ৭২ দিনের অভিজ্ঞতা থেকে শ্রমিক-রাষ্ট্রের প্রথম পাঠ।",
    "links": [
      {
        "label": "সম্পূর্ণ পড়ুন",
        "url": "https://www.marxists.org/archive/marx/works/1871/civil-war-france/"
      }
    ]
  },
  {
    "id": "antiduhring",
    "cat": "marx",
    "title": "অ্যান্টি-ডুরিং",
    "orig": "Herrn Eugen Dührings Umwälzung der Wissenschaft",
    "author": "ফ্রিডরিখ এঙ্গেলস",
    "year": "1878",
    "lang": "জার্মান",
    "desc": "মার্কসবাদের দর্শন, অর্থনীতি ও সমাজতন্ত্র — তিন অংশের বিশ্বকোষীয় বিবরণ।",
    "links": [
      {
        "label": "সম্পূর্ণ পড়ুন",
        "url": "https://www.marxists.org/archive/marx/works/1877/anti-duhring/"
      }
    ]
  },
  {
    "id": "staterev",
    "cat": "lenin",
    "title": "রাষ্ট্র ও বিপ্লব",
    "orig": "Государство и революция",
    "author": "ভ. ই. লেনিন",
    "year": "1917",
    "lang": "রুশ",
    "desc": "রাষ্ট্রের শ্রেণীচরিত্রের প্রখর তাত্ত্বিক দলিল — অক্টোবরের ঠিক আগের মুহূর্তে, লুকিয়ে থেকে লেখা।",
    "links": [
      {
        "label": "সম্পূর্ণ পড়ুন",
        "url": "https://www.marxists.org/archive/lenin/works/1917/staterev/"
      }
    ]
  },
  {
    "id": "imperialism",
    "cat": "lenin",
    "title": "সাম্রাজ্যবাদ: পুঁজিবাদের সর্বোচ্চ স্তর",
    "orig": "Империализм, как высшая стадия капитализма",
    "author": "ভ. ই. লেনিন",
    "year": "1916",
    "lang": "রুশ",
    "desc": "একচেটি পুঁজি, আর্থিক অভিজাততন্ত্র ও বিশ্ব-বিভাজনের ধ্রুপদি বিশ্লেষণ — আজও প্রাসঙ্গিক।",
    "links": [
      {
        "label": "সম্পূর্ণ পড়ুন",
        "url": "https://www.marxists.org/archive/lenin/works/1916/imp-hsc/"
      }
    ]
  },
  {
    "id": "witbd",
    "cat": "lenin",
    "title": "কী করা করণীয়?",
    "orig": "Что делать?",
    "author": "ভ. ই. লেনিন",
    "year": "1902",
    "lang": "রুশ",
    "desc": "পেশাদার বিপ্লবীদের সংঘবদ্ধ দলের ধারণা — বিংশ শতাব্দীর কমিউনিস্ট পার্টিগুলোর জন্মদলিল।",
    "links": [
      {
        "label": "সম্পূর্ণ পড়ুন",
        "url": "https://www.marxists.org/archive/lenin/works/1901/witbd/"
      }
    ]
  },
  {
    "id": "april",
    "cat": "lenin",
    "title": "এপ্রিল অভিমত",
    "orig": "Апрельские тезисы",
    "author": "ভ. ই. লেনিন",
    "year": "1917",
    "lang": "রুশ",
    "desc": "“সব ক্ষমতা সোভিয়েতের হাতে” — ফেব্রুয়ারি থেকে অক্টোবরে যাওয়ার দশ দফা সঙ্কেত।",
    "links": [
      {
        "label": "সম্পূর্ণ পড়ুন",
        "url": "https://www.marxists.org/archive/lenin/works/1917/apr/"
      }
    ]
  },
  {
    "id": "lwc",
    "cat": "lenin",
    "title": "বামপন্থা: কমিউনিজমের শিশুসুলভ রোগ",
    "orig": "Детская болезнь «левизны» в коммунизме",
    "author": "ভ. ই. লেনিন",
    "year": "1920",
    "lang": "রুশ",
    "desc": "কৌশল, আপস ও গণসংগঠনে কাজের পাঠ — তৃতীয় আন্তর্জাতিকের নির্ধারিত পাঠ্য।",
    "links": [
      {
        "label": "সম্পূর্ণ পড়ুন",
        "url": "https://www.marxists.org/archive/lenin/works/1920/lwc/"
      }
    ]
  },
  {
    "id": "twotactics",
    "cat": "lenin",
    "title": "দুই কৌশল",
    "orig": "Две тактики социал-демократии в демократической революции",
    "author": "ভ. ই. লেনিন",
    "year": "1905",
    "lang": "রুশ",
    "desc": "১৯০৫-এর বিপ্লবের প্রশ্নে বোলশেভিক ও মেনশেভিক কৌশলের ধ্রুপদি লড়াই।",
    "links": [
      {
        "label": "সম্পূর্ণ পড়ুন",
        "url": "https://www.marxists.org/archive/lenin/works/1905/two-tactics/"
      }
    ]
  },
  {
    "id": "devel",
    "cat": "lenin",
    "title": "রুশিয়ায় পুঁজিবাদের বিকাশ",
    "orig": "Развитие капитализма в России",
    "author": "ভ. ই. লেনিন",
    "year": "1899",
    "lang": "রুশ",
    "desc": "নারোদনিকদের বিরুদ্ধে রুশ গ্রামাঞ্চলের বিশাল শ্রেণী-জরিপ — পরিসংখ্যানে লেখা বিতর্ক।",
    "links": [
      {
        "label": "সম্পূর্ণ পড়ুন",
        "url": "https://www.marxists.org/archive/lenin/works/1899/devel/"
      }
    ]
  },
  {
    "id": "mec",
    "cat": "lenin",
    "title": "বস্তুবাদ ও অভিজ্ঞতাসমালোচনা",
    "orig": "Материализм и эмпириокритицизм",
    "author": "ভ. ই. লেনিন",
    "year": "1908",
    "lang": "রুশ",
    "desc": "মার্কসবাদী জ্ঞানতত্ত্ব ও প্রতিফলন-তত্ত্বের প্রতিরক্ষা — দর্শনের রণাঙ্গনে লেনিন।",
    "links": [
      {
        "label": "সম্পূর্ণ পড়ুন",
        "url": "https://www.marxists.org/archive/lenin/works/1908/mec/"
      }
    ]
  },
  {
    "id": "kautsky-rev",
    "cat": "lenin",
    "title": "প্রলেতারীয় বিপ্লব ও ধর্মত্যাগী কাউৎস্কি",
    "orig": "Пролетарская революция и ренегат Каутский",
    "author": "ভ. ই. লেনিন",
    "year": "1918",
    "lang": "রুশ",
    "desc": "বুর্জোয়া বনাম প্রলেতারীয় গণতন্ত্র — বিপ্লবের পরপরই লেখা তীব্র তাত্ত্বিক লড়াই।",
    "links": [
      {
        "label": "সম্পূর্ণ পড়ুন",
        "url": "https://www.marxists.org/archive/lenin/works/1918/proletarian-revolution/"
      }
    ]
  },
  {
    "id": "lenin-works",
    "cat": "lenin",
    "title": "লেনিন নির্বাচিত রচনাবলি (৪৫ খণ্ড)",
    "orig": "Полное собрание сочинений",
    "author": "ভ. ই. লেনিন",
    "year": "১৮৯৩–১৯২৩",
    "lang": "বহুভাষিক",
    "desc": "প্রবন্ধ, চিঠি, ভাষণ, খসড়া — লেনিনের সম্পূর্ণ রচনার মুক্ত ইংরেজি সংগ্রহ, এক ইনডেক্সে।",
    "links": [
      {
        "label": "সম্পূর্ণ সংগ্রহ",
        "url": "https://www.marxists.org/archive/lenin/works/"
      }
    ]
  },
  {
    "id": "reform",
    "cat": "theory",
    "title": "সংস্কার না বিপ্লব?",
    "orig": "Sozialreform oder Revolution?",
    "author": "রোজা লুক্সেমবুর্গ",
    "year": "1899",
    "lang": "জার্মান",
    "desc": "বের্নস্টাইনের সংশোধনবাদের বিরুদ্ধে লুক্সেমবুর্গের বজ্রনির্ঘোষ — সমাজতন্ত্রের লক্ষ্য রক্ষার লড়াই।",
    "links": [
      {
        "label": "সম্পূর্ণ পড়ুন",
        "url": "https://www.marxists.org/archive/luxemburg/1900/reform-revolution/"
      }
    ]
  },
  {
    "id": "accum",
    "cat": "theory",
    "title": "পুঁজির সঞ্চয়",
    "orig": "Die Akkumulation des Kapitals",
    "author": "রোজা লুক্সেমবুর্গ",
    "year": "1913",
    "lang": "জার্মান",
    "desc": "সাম্রাজ্যবাদের অর্থনৈতিক শিকড় নিয়ে মার্কসীয় অর্থনীতির সাহসী সম্প্রসারণ।",
    "links": [
      {
        "label": "সম্পূর্ণ পড়ুন",
        "url": "https://www.marxists.org/archive/luxemburg/1913/accumulation-capital/"
      }
    ]
  },
  {
    "id": "mass-strike",
    "cat": "theory",
    "title": "গণধর্মঘট, দল ও ট্রেড ইউনিয়ন",
    "orig": "Massenstreik, Partei und Gewerkschaften",
    "author": "রোজা লুক্সেমবুর্গ",
    "year": "1906",
    "lang": "জার্মান",
    "desc": "১৯০৫-এর রুশ বিপ্লবের অভিজ্ঞতায় স্বতঃস্ফূর্ত গণআন্দোলনের তত্ত্ব।",
    "links": [
      {
        "label": "সম্পূর্ণ পড়ুন",
        "url": "https://www.marxists.org/archive/luxemburg/1906/mass-strike/"
      }
    ]
  },
  {
    "id": "permrev",
    "cat": "theory",
    "title": "স্থায়ী বিপ্লব",
    "orig": "Перманентная революция",
    "author": "লেভ ত্রোৎস্কি",
    "year": "1930",
    "lang": "রুশ",
    "desc": "পিছিয়ে-পড়া দেশে গণতান্ত্রিক থেকে সমাজতান্ত্রিক বিপ্লবে অবিচ্ছিন্ন উত্তরণের তত্ত্ব।",
    "links": [
      {
        "label": "সম্পূর্ণ পড়ুন",
        "url": "https://www.marxists.org/archive/trotsky/1930/permrev/"
      }
    ]
  },
  {
    "id": "revbet",
    "cat": "theory",
    "title": "বিশ্বাসঘাতকতার শিকার বিপ্লব",
    "orig": "Преданная революция",
    "author": "লেভ ত্রোৎস্কি",
    "year": "1936",
    "lang": "রুশ",
    "desc": "সোভিয়েত আমলাতন্ত্রের সমালোচনা — বাম বিরোধী ধারার কেন্দ্রীয় গ্রন্থ।",
    "links": [
      {
        "label": "সম্পূর্ণ পড়ুন",
        "url": "https://www.marxists.org/archive/trotsky/1936/revbet/"
      }
    ]
  },
  {
    "id": "hrr",
    "cat": "theory",
    "title": "রুশ বিপ্লবের ইতিহাস",
    "orig": "История русской революции",
    "author": "লেভ ত্রোৎস্কি",
    "year": "1930",
    "lang": "রুশ",
    "desc": "১৯১৭-এর ঘটনাপ্রবাহের ভেতর থেকে লেখা মহাকাব্যিক ইতিহাস — নির্বাসনের কেল্লায়।",
    "links": [
      {
        "label": "সম্পূর্ণ পড়ুন",
        "url": "https://www.marxists.org/archive/trotsky/1930/hrr/"
      }
    ]
  },
  {
    "id": "gramsci",
    "cat": "theory",
    "title": "কারাগারের খাতা",
    "orig": "Quaderni del carcere",
    "author": "আন্তোনিও গ্রামশি",
    "year": "১৯২৯–৩৫",
    "lang": "ইতালীয়",
    "desc": "ফ্যাসিস্ট কারাগারে লেখা ৩৩টি খাতা — “আধিপত্য” (hegemony) ধারণার জন্ম, পশ্চিমা মার্কসবাদের স্তম্ভ।",
    "links": [
      {
        "label": "নির্বাচিত অংশ",
        "url": "https://www.marxists.org/archive/gramsci/prison-notebooks/"
      }
    ]
  },
  {
    "id": "bukharin",
    "cat": "theory",
    "title": "সাম্রাজ্যবাদ ও বিশ্ব অর্থনীতি",
    "orig": "Империализм и мировое хозяйство",
    "author": "নিকোলাই বুখারিন",
    "year": "1915",
    "lang": "রুশ",
    "desc": "বিশ্বপুঁজিবাদের একক ব্যবস্থা হিসেবে সাম্রাজ্যবাদের তত্ত্ব — লেনিনের বইয়েরও পূর্বসূরি।",
    "links": [
      {
        "label": "সম্পূর্ণ পড়ুন",
        "url": "https://www.marxists.org/archive/bukharin/works/1915/imperialism/"
      }
    ]
  },
  {
    "id": "kollontai",
    "cat": "theory",
    "title": "নারী-প্রশ্নের সামাজিক ভিত্তি",
    "orig": "Социальные основы женского вопроса",
    "author": "আলেক্সান্দ্রা কোলোন্তাই",
    "year": "1909",
    "lang": "রুশ",
    "desc": "নারীমুক্তি ও সমাজতন্ত্রের অবিচ্ছেদ্য সম্পর্ক — মার্কসবাদী নারীবাদের প্রথম স্তম্ভগুলোর একটি।",
    "links": [
      {
        "label": "সম্পূর্ণ পড়ুন",
        "url": "https://www.marxists.org/archive/kollonta/1909/social-basis.htm"
      }
    ]
  },
  {
    "id": "klassenkampf",
    "cat": "theory",
    "title": "শ্রেণীসংগ্রাম",
    "orig": "Der Klassenkampf (Erfurter Programm)",
    "author": "কার্ল কাউৎস্কি",
    "year": "1892",
    "lang": "জার্মান",
    "desc": "এরফুর্ট কর্মসূচির ব্যাখ্যা — দ্বিতীয় আন্তর্জাতিকের যুগে সবচেয়ে বহুলপঠিত মার্কসবাদী পাঠ্য।",
    "links": [
      {
        "label": "সম্পূর্ণ পড়ুন",
        "url": "https://www.marxists.org/archive/kautsky/1892/erfurt/"
      }
    ]
  },
  {
    "id": "lukacs",
    "cat": "theory",
    "title": "ইতিহাস ও শ্রেণীসচেতনতা",
    "orig": "Geschichte und Klassenbewusstsein",
    "author": "জর্জ লুকাচ",
    "year": "1923",
    "lang": "জার্মান",
    "desc": "পুনর্বিভাজন ও প্রলেতারিয়েতের সচেতনতা — পশ্চিমা মার্কসবাদের সূচনাবিন্দু।",
    "links": [
      {
        "label": "লুকাচ আর্কাইভ",
        "url": "https://www.marxists.org/archive/lukacs/"
      }
    ]
  },
  {
    "id": "mao-sw",
    "cat": "liberation",
    "title": "মাও সেতুং নির্বাচিত রচনা (৫ খণ্ড)",
    "orig": "毛泽东选集",
    "author": "মাও সেতুং",
    "year": "১৯২৬–৫৭",
    "lang": "চীনা",
    "desc": "অনুশীলন, দ্বন্দ্ব, গণরেখা, দীর্ঘস্থায়ী গণযুদ্ধ — চীনা বিপ্লবের সম্পূর্ণ তাত্ত্বিক ভাণ্ডার।",
    "links": [
      {
        "label": "নির্বাচিত রচনা",
        "url": "https://www.marxists.org/reference/archive/mao/selected-works/"
      }
    ]
  },
  {
    "id": "mao-archive",
    "cat": "liberation",
    "title": "মাও আর্কাইভ সূচি",
    "orig": "Mao Zedong Reference Archive",
    "author": "মাও সেতুং",
    "year": "সম্পূর্ণ সংগ্রহ",
    "lang": "বহুভাষিক",
    "desc": "লাল বই (উদ্ধৃতিসংগ্রহ) থেকে কবিতা — মাও-সম্পর্কিত সব মুক্ত ইংরেজি পাঠের দরজা।",
    "links": [
      {
        "label": "সম্পূর্ণ সূচি",
        "url": "https://www.marxists.org/reference/archive/mao/"
      }
    ]
  },
  {
    "id": "ho-works",
    "cat": "liberation",
    "title": "হো চি মিন রচনাবলি",
    "orig": "Hồ Chí Minh toàn tập",
    "author": "হো চি মিন",
    "year": "১৯২০–৬৯",
    "lang": "ভিয়েতনামীয়",
    "desc": "উপনিবেশবিরোধী সংগ্রাম থেকে ভিয়েতনামের পথ — চাচা হো-র নির্বাচিত লেখা ও ভাষণ।",
    "links": [
      {
        "label": "রচনাবলি",
        "url": "https://www.marxists.org/reference/archive/ho-chi-minh/"
      }
    ]
  },
  {
    "id": "ho-decl",
    "cat": "liberation",
    "title": "ভিয়েতনামের স্বাধীনতার ঘোষণাপত্র",
    "orig": "Tuyên ngôn Độc lập",
    "author": "হো চি মিন",
    "year": "1945",
    "lang": "ভিয়েতনামীয়",
    "desc": "যুক্তরাষ্ট্রের স্বাধীনতার ঘোষণা উদ্ধৃত করে শুরু — সাম্রাজ্যবাদের মুখোমুখি এক জাতির আত্মঘোষণা।",
    "links": [
      {
        "label": "ঘোষণাপত্র",
        "url": "https://www.marxists.org/reference/archive/ho-chi-minh/works/1945/declaration-independence.htm"
      }
    ]
  },
  {
    "id": "che-guerrilla",
    "cat": "liberation",
    "title": "গেরিলা যুদ্ধ",
    "orig": "La Guerra de Guerrillas",
    "author": "চে গেভারা",
    "year": "1960",
    "lang": "স্পেনীয়",
    "desc": "কিউবার অভিজ্ঞতা থেকে গেরিলা যুদ্ধের ম্যানুয়াল — তৃতীয় বিশ্বের মুক্তিসংগ্রামের হাতে-হাতে পাঠ্য।",
    "links": [
      {
        "label": "সম্পূর্ণ পড়ুন",
        "url": "https://www.marxists.org/archive/guevara/1960/guerrilla/"
      }
    ]
  },
  {
    "id": "che-man",
    "cat": "liberation",
    "title": "সমাজতন্ত্র ও মানুষ",
    "orig": "El socialismo y el hombre en Cuba",
    "author": "চে গেভারা",
    "year": "1965",
    "lang": "স্পেনীয়",
    "desc": "“নতুন মানুষ” গড়ার প্রশ্নে খোলা চিঠি — বিপ্লবের নৈতিক দিগন্ত।",
    "links": [
      {
        "label": "চিঠিটি পড়ুন",
        "url": "https://www.marxists.org/archive/guevara/1965/man/"
      }
    ]
  },
  {
    "id": "fanon",
    "cat": "liberation",
    "title": "পৃথিবীর নিপীড়িত মানুষ",
    "orig": "Les Damnés de la Terre",
    "author": "ফ্রানৎস ফানোঁ",
    "year": "1961",
    "lang": "ফরাসি",
    "desc": "ঔপনিবেশিক মানসিকতার গভীর বিশ্লেষণ — মুক্তির মনস্তত্ত্বের ধ্রুপদি গ্রন্থ, সার্ত্রের ভূমিকাসহ।",
    "links": [
      {
        "label": "সম্পূর্ণ পড়ুন",
        "url": "https://www.marxists.org/subject/africa/fanon/wretched-of-the-earth/index.htm"
      }
    ]
  },
  {
    "id": "castro",
    "cat": "liberation",
    "title": "ইতিহাস আমাকে নির্দোষ সাব্যস্ত করবে",
    "orig": "La historia me absolverá",
    "author": "ফিদেল কাস্ত্রো",
    "year": "1953",
    "lang": "স্পেনীয়",
    "desc": "মোঙ্কাদা আক্রমণের পরে আদালতে কাস্ত্রোর ঐতিহাসিক আত্মপক্ষ-সমর্থন — কিউবার বিপ্লবের ইশতেহার।",
    "links": [
      {
        "label": "ভাষণটি পড়ুন",
        "url": "https://www.marxists.org/history/cuba/archive/castro/1953/10/16.htm"
      }
    ]
  },
  {
    "id": "luxun",
    "cat": "liberation",
    "title": "পাগলের ডায়েরি",
    "orig": "狂人日记",
    "author": "লু শুন",
    "year": "1918",
    "lang": "চীনা",
    "desc": "আধুনিক চীনা সাহিত্যের প্রথম গল্প — “খাদক সমাজের” বিরুদ্ধে পুরোনো চীনের জাগরণের চিৎকার।",
    "links": [
      {
        "label": "লু শুন আর্কাইভ",
        "url": "https://www.marxists.org/archive/lu-xun/"
      }
    ]
  },
  {
    "id": "bhagat",
    "cat": "liberation",
    "title": "কেন আমি নাস্তিক",
    "orig": "Why I Am an Atheist",
    "author": "ভগৎ সিং",
    "year": "1930",
    "lang": "ইংরেজি",
    "desc": "ফাঁসির সেলে লেখা দার্শনিক জবানবন্দি — ভারতের বিপ্লবী বাম ধারার অমর দলিল।",
    "links": [
      {
        "label": "প্রবন্ধটি পড়ুন",
        "url": "https://www.marxists.org/archive/bhagat-singh/1930/why-atheist.htm"
      },
      {
        "label": "ভগৎ সিং আর্কাইভ",
        "url": "https://www.marxists.org/archive/bhagat-singh/"
      }
    ]
  },
  {
    "id": "gorky-mother",
    "cat": "fiction",
    "title": "মা",
    "orig": "Мать",
    "author": "মাক্সিম গোর্কি",
    "year": "1906",
    "lang": "রুশ",
    "desc": "পিলাগেয়া নিলোভ্নার জাগরণ — সমাজতান্ত্রিক বাস্তবতার প্রথম মহান উপন্যাস।",
    "links": [
      {
        "label": "সম্পূর্ণ পড়ুন",
        "url": "https://www.marxists.org/archive/gorky-maxim/1906/mother/"
      }
    ]
  },
  {
    "id": "ostrovsky",
    "cat": "fiction",
    "title": "ইস্পাত কীভাবে ঝালানো হলো",
    "orig": "Как закалялась сталь",
    "author": "নিকোলাই অস্ত্রোভস্কি",
    "year": "1934",
    "lang": "রুশ",
    "desc": "পাবেল করচাগিনের জীবন — সোভিয়েত যুগের সবচেয়ে প্রভাবশালী উপন্যাস, চীন থেকে কিউবা পর্যন্ত প্রজন্ম জাগানো বই।",
    "links": [
      {
        "label": "সম্পূর্ণ পড়ুন",
        "url": "https://www.marxists.org/archive/ostrovsky/steeltmp/"
      }
    ]
  },
  {
    "id": "fadeyev",
    "cat": "fiction",
    "title": "তরুণ গার্ড",
    "orig": "Молодая гвардия",
    "author": "আলেক্সান্দ্র ফাদেয়েভ",
    "year": "1945",
    "lang": "রুশ",
    "desc": "নাৎসি-দখলকৃত ডনবাসে তরুণ ভূগর্ভস্থ প্রতিরোধের কাহিনি — সত্য ঘটনা অবলম্বনে।",
    "links": [
      {
        "label": "ফাদেয়েভ আর্কাইভ",
        "url": "https://www.marxists.org/archive/fadeyev/"
      }
    ]
  },
  {
    "id": "sholokhov",
    "cat": "fiction",
    "title": "শান্ত ডন নদী",
    "orig": "Тихий Дон",
    "author": "মিখাইল শোলোখভ",
    "year": "১৯২৮–৪০",
    "lang": "রুশ",
    "desc": "কসাক গ্রিগরি মেলিখভের মহাকাব্য — বিপ্লব ও গৃহযুদ্ধের রক্তাক্ত প্রহর, নোবেলজয়ী উপন্যাস।",
    "links": [
      {
        "label": "Archive.org-এ খুঁজুন",
        "url": "https://archive.org/search?query=and+quiet+flows+the+don"
      }
    ]
  },
  {
    "id": "iron-heel",
    "cat": "fiction",
    "title": "লৌহ জঁতা",
    "orig": "The Iron Heel",
    "author": "জ্যাক লন্ডন",
    "year": "1908",
    "lang": "ইংরেজি",
    "desc": "অলিগার্কির ভবিষ্যৎ-ফ্যাসিস্ট আমেরিকার ভবিষ্যদ্বাণী — ইংরেজি সাহিত্যের প্রথম মার্কসবাদী-ঘেঁষা ডিস্টোপিয়া।",
    "links": [
      {
        "label": "Gutenberg-এ পড়ুন",
        "url": "https://www.gutenberg.org/ebooks/1164"
      }
    ]
  },
  {
    "id": "jungle",
    "cat": "fiction",
    "title": "জঙ্গল",
    "orig": "The Jungle",
    "author": "আপটন সিনক্লেয়ার",
    "year": "1906",
    "lang": "ইংরেজি",
    "desc": "শিকাগোর মাংস-কারখানার নোংরা সত্য — শ্রমিকের দুর্দশা লিখতে গিয়ে জাগিয়ে দিলেন গোটা আমেরিকা।",
    "links": [
      {
        "label": "Gutenberg-এ পড়ুন",
        "url": "https://www.gutenberg.org/ebooks/140"
      }
    ]
  },
  {
    "id": "seventh-cross",
    "cat": "fiction",
    "title": "সপ্তম ক্রুশ",
    "orig": "Das siebte Kreuz",
    "author": "আনা জেগার্স",
    "year": "1942",
    "lang": "জার্মান",
    "desc": "কনসেনট্রেশন ক্যাম্প থেকে পালানো সাতজনের গল্প — নির্বাসনে লেখা অ্যান্টিফ্যাসিস্ট ধ্রুপদি।",
    "links": [
      {
        "label": "Archive.org-এ খুঁজুন",
        "url": "https://archive.org/search?query=the+seventh+cross+anna+seggers"
      }
    ]
  },
  {
    "id": "spartacus",
    "cat": "fiction",
    "title": "স্পার্টাকাস",
    "orig": "Spartacus",
    "author": "হাওয়ার্ড ফাস্ট",
    "year": "1951",
    "lang": "ইংরেজি",
    "desc": "রোমের দাস-বিদ্রোহের মহাকাব্য — মার্কিন “কালো তালিকা”র অন্ধকারে লেখা, নিজের পয়সায় ছাপা।",
    "links": [
      {
        "label": "Archive.org-এ খুঁজুন",
        "url": "https://archive.org/search?query=spartacus+howard+fast"
      }
    ]
  },
  {
    "id": "red-star",
    "cat": "fiction",
    "title": "রেড স্টার ওভার চায়না",
    "orig": "Red Star Over China",
    "author": "এডগার স্নো",
    "year": "1937",
    "lang": "ইংরেজি",
    "desc": "ইয়েনআনে মাও ও লাল ফৌজের ভেতরে প্রথম প্রতিবেদন — বিশ্বকে চীনা বিপ্লব চেনানো বই।",
    "links": [
      {
        "label": "Archive.org-এ খুঁজুন",
        "url": "https://archive.org/search?query=red+star+over+china"
      }
    ]
  },
  {
    "id": "tendays",
    "cat": "fiction",
    "title": "দশ দিন যা দুনিয়া কাঁপিয়ে দিল",
    "orig": "Ten Days that Shook the World",
    "author": "জন রিড",
    "year": "1919",
    "lang": "ইংরেজি",
    "desc": "অক্টোবর বিপ্লবের প্রত্যক্ষদর্শী প্রতিবেদন — লেনিন নিজেই লিখেছিলেন ভূমিকা।",
    "links": [
      {
        "label": "সম্পূর্ণ পড়ুন",
        "url": "https://www.marxists.org/archive/reed/1919/ten-days/ten-days.htm"
      }
    ]
  },
  {
    "id": "serge",
    "cat": "fiction",
    "title": "এক বিপ্লবীর স্মৃতিকথা",
    "orig": "Mémoires d'un révolutionnaire",
    "author": "ভিক্তর সের্জ",
    "year": "1943",
    "lang": "ফরাসি",
    "desc": "বোলশেভিক থেকে বিসংবাদী — বিংশ শতাব্দীর সবচেয়ে সৎ বিপ্লবী আত্মজীবনী।",
    "links": [
      {
        "label": "সের্জ আর্কাইভ",
        "url": "https://www.marxists.org/archive/serge/"
      }
    ]
  },
  {
    "id": "pather-dabi",
    "cat": "fiction",
    "title": "পথের দাবী",
    "orig": "—",
    "author": "শরৎচন্দ্র চট্টোপাধ্যায়",
    "year": "1926",
    "lang": "বাংলা",
    "desc": "ব্রিটিশ সাম্রাজ্যবাদবিরোধী বিপ্লবী দল ‘পথের দাবী’, ডাক্তার সব্যসাচী ও অমর মুক্তি সংগ্রামের রাজদ্রোহী নিষিদ্ধ উপন্যাস।",
    "links": [
      {
        "label": "উইকিসংকলনে পড়ুন",
        "url": "https://bn.wikisource.org/wiki/পথের_দাবী"
      }
    ]
  },
  {
    "id": "mayakovsky",
    "cat": "poetry",
    "title": "মায়াভস্কির কবিতা",
    "orig": "Стихотворения",
    "author": "ভ্লাদিমির মায়াভস্কি",
    "year": "১৯১২–৩০",
    "lang": "রুশ",
    "desc": "“শুনুন, কমরেড মাউজার!” — বিপ্লবের ঢাক, ভবিষ্যতবাদী ছন্দে লেখা প্লাকাত-কবিতা।",
    "links": [
      {
        "label": "কবিতাসমগ্র",
        "url": "https://www.marxists.org/archive/mayakovsky/works/"
      }
    ]
  },
  {
    "id": "hikmet",
    "cat": "poetry",
    "title": "নাজিম হিকমতের কবিতা",
    "orig": "Şiirler",
    "author": "নাজিম হিকমত",
    "year": "১৯২১–৬৩",
    "lang": "তুর্কি",
    "desc": "“সবচেয়ে সুন্দর দিনটি এখনো আসেনি” — কারাগারে তেরো বছর কাটানো কবির অপরাজেয় আশা।",
    "links": [
      {
        "label": "কবিতাসমগ্র",
        "url": "https://www.marxists.org/archive/hikmet/"
      }
    ]
  },
  {
    "id": "neruda",
    "cat": "poetry",
    "title": "কান্তো জেনেরাল",
    "orig": "Canto General",
    "author": "পাবলো নেরুদা",
    "year": "1950",
    "lang": "স্পেনীয়",
    "desc": "লাতিন আমেরিকার মাটি, খনি ও শোষিত মানুষের মহাকাব্য — পাহাড়ের আড়ালে লুকিয়ে লেখা নিষিদ্ধ বই।",
    "links": [
      {
        "label": "সম্পূর্ণ পড়ুন",
        "url": "https://www.marxists.org/archive/neruda/canto-general/"
      }
    ]
  },
  {
    "id": "brecht",
    "cat": "poetry",
    "title": "ব্রেখটের কবিতা ও নাটক",
    "orig": "Gedichte und Stücke",
    "author": "বেরটোল্ট ব্রেখট",
    "year": "১৯২২–৫৬",
    "lang": "জার্মান",
    "desc": "“প্রথমে পেট, তারপর নীতি” — এপিক থিয়েটার আর তীক্ষ্ণ শ্লেষে বুর্জোয়া সভ্যতার বিচার।",
    "links": [
      {
        "label": "ব্রেখট আর্কাইভ",
        "url": "https://www.marxists.org/archive/brecht/"
      }
    ]
  },
  {
    "id": "vallejo",
    "cat": "poetry",
    "title": "স্পেন, এই পাত্র আমায় সরিয়ে নাও",
    "orig": "España, aparta de mí este cáliz",
    "author": "সেসার ভায়েহো",
    "year": "1939",
    "lang": "স্পেনীয়",
    "desc": "স্পেনের গৃহযুদ্ধের শহীদদের জন্য পেরুর কবির বিলাপ — প্রতিরোধের শ্রেষ্ঠ কাব্যগ্রন্থগুলোর একটি।",
    "links": [
      {
        "label": "ভায়েহো আর্কাইভ",
        "url": "https://www.marxists.org/archive/vallejo/"
      }
    ]
  },
  {
    "id": "samyabadi",
    "cat": "poetry",
    "title": "সাম্যবাদী",
    "orig": "—",
    "author": "কাজী নজরুল ইসলাম",
    "year": "1924",
    "lang": "বাংলা",
    "desc": "“আমি সাম্যের গান গাই” — বাংলা কবিতায় সাম্যবাদের প্রথম জাগ্রত সুর।",
    "links": [
      {
        "label": "উইকিসোর্সে পড়ুন",
        "url": "https://bn.wikisource.org/wiki/সাম্যবাদী"
      }
    ]
  },
  {
    "id": "chharpatra",
    "cat": "poetry",
    "title": "ছাড়পত্র",
    "orig": "—",
    "author": "সুকান্ত ভট্টাচার্য",
    "year": "1948",
    "lang": "বাংলা",
    "desc": "“ক্ষুধার রাজ্যে পৃথিবী গদ্যময়” — একুশ বছর বয়সে মৃত কিশোর কবির ফেলে যাওয়া আগুন।",
    "links": [
      {
        "label": "উইকিসোর্সে পড়ুন",
        "url": "https://bn.wikisource.org/wiki/ছাড়পত্র"
      }
    ]
  },
  {
    "id": "padatik",
    "cat": "poetry",
    "title": "পদাতিক",
    "orig": "—",
    "author": "সুভাষ মুখোপাধ্যায়",
    "year": "1940",
    "lang": "বাংলা",
    "desc": "ফ্যাসিবিরোধী আন্দোলনের পায়ের আওয়াজ — বাংলা কমিউনিস্ট কবিতার দিকনির্ণয়ক সংকলন।",
    "links": [
      {
        "label": "Archive.org-এ খুঁজুন",
        "url": "https://archive.org/search?query=padatik+subhash+mukhopadhyay"
      }
    ]
  },
  {
    "id": "bengali-archive",
    "cat": "bangla",
    "title": "বাংলায় মার্কস–এঙ্গেলস–লেনিন",
    "orig": "marxists.org বাংলা বিভাগ",
    "author": "বহু লেখক ও অনুবাদক",
    "year": "চলমান প্রকল্প",
    "lang": "বাংলা",
    "desc": "ইশতেহার, রাষ্ট্র ও বিপ্লব-সহ মৌলিক গ্রন্থগুলোর বাংলা অনুবাদ — এক ঠিকানায়।",
    "links": [
      {
        "label": "বাংলা বিভাগ",
        "url": "https://www.marxists.org/bengali/"
      }
    ]
  },
  {
    "id": "muzaffar",
    "cat": "bangla",
    "title": "জননেতা মুজাফফর আহমদ: জীবন-সংগ্রাম",
    "orig": "—",
    "author": "কমরেড মুজাফফর আহমদ",
    "year": "১৯৭০-এর দশক",
    "lang": "বাংলা",
    "desc": "কানপুর ষড়যন্ত্র মামলার আসামি থেকে বাংলাদেশে কমিউনিস্ট আন্দোলনের পথিকৃৎ — আত্মজীবনী।",
    "links": [
      {
        "label": "Archive.org-এ খুঁজুন",
        "url": "https://archive.org/search?query=muzaffar+ahmad+jananeta"
      }
    ]
  },
  {
    "id": "moni-singh",
    "cat": "bangla",
    "title": "আমার জীবন আমার সময়",
    "orig": "—",
    "author": "মণি সিং",
    "year": "১৯৯০",
    "lang": "বাংলা",
    "desc": "নেত্রকোনা থেকে ভাষা আন্দোলন — বাংলাদেশের কমিউনিস্ট আন্দোলনের জীবন্ত ইতিহাস।",
    "links": [
      {
        "label": "Archive.org-এ খুঁজুন",
        "url": "https://archive.org/search?query=moni+singh+smritikatha"
      }
    ]
  },
  {
    "id": "putul",
    "cat": "bangla",
    "title": "পুতুলনাচের ইতিকথা",
    "orig": "—",
    "author": "মানিক বন্দ্যোপাধ্যায়",
    "year": "1936",
    "lang": "বাংলা",
    "desc": "কুসুম, শশী ও মতিলাল — গ্রামবাংলার অবক্ষয় আর মুক্তির আকাঙ্ক্ষার অমর উপন্যাস।",
    "links": [
      {
        "label": "Archive.org-এ খুঁজুন",
        "url": "https://archive.org/search?query=putulnacher+itikatha"
      }
    ]
  },
  {
    "id": "titash",
    "cat": "bangla",
    "title": "তিতাশ একটি নদীর নাম",
    "orig": "—",
    "author": "অদ্বৈত মল্লবর্মণ",
    "year": "1956",
    "lang": "বাংলা",
    "desc": "মাঝি-জীবনের মহাকাব্য — নদীর মরণ আর নিম্নবর্ণের মানুষের বেঁচে থাকার সংগ্রাম।",
    "links": [
      {
        "label": "Archive.org-এ খুঁজুন",
        "url": "https://archive.org/search?query=titash+ekti+nadir+nam"
      }
    ]
  },
  {
    "id": "tebhaga",
    "cat": "bangla",
    "title": "তেভাগা আন্দোলন: দলিল ও স্মৃতিকথা",
    "orig": "—",
    "author": "সম্পাদিত সংকলন",
    "year": "১৯৪৬–৫০",
    "lang": "বাংলা",
    "desc": "বাঁশদ্রোহ থেকে নাচোল — বাংলার কৃষক-সংগ্রামের প্রত্যক্ষ দলিল ও স্মৃতিকথা।",
    "links": [
      {
        "label": "Archive.org-এ খুঁজুন",
        "url": "https://archive.org/search?query=tebhaga+andolan"
      }
    ]
  },
  {
    "id": "bangla-marxist",
    "cat": "bangla",
    "title": "বাংলা মার্কসবাদী বইয়ের ভাণ্ডার",
    "orig": "archive.org সংগ্রহ",
    "author": "বহু লেখক",
    "year": "চলমান",
    "lang": "বাংলা",
    "desc": "শ্রমিক আন্দোলন, বাম সাহিত্য ও রাজনীতির বাংলা বইয়ের বিশাল মুক্ত সংগ্রহ।",
    "links": [
      {
        "label": "সংগ্রহটি দেখুন",
        "url": "https://archive.org/search?query=bengali+marxist"
      }
    ]
  }
];

export const QUOTES = [
  {
    "text": "শৃঙ্খল ছাড়া প্রলেতারিয়েতের হারাবার কিছুই নেই — জেতার আছে এক গোটা পৃথিবী।",
    "by": "মার্কস–এঙ্গেলস, কমিউনিস্ট ইশতেহার"
  },
  {
    "text": "দার্শনিকরা এতকাল জগতকে কেবল ব্যাখ্যা করেছেন — আসল কথা তা বদলে ফেলা।",
    "by": "কার্ল মার্কস"
  },
  {
    "text": "শিক্ষা নিন, সংগঠিত হন, আন্দোলন করুন।",
    "by": "আন্তোনিও গ্রামশি"
  },
  {
    "text": "দাসের মতো বাঁচার চেয়ে দাঁড়িয়ে মরা ভালো।",
    "by": "ডোলোরেস ইবারুরি, ‘লা পাসিওনারিয়া’"
  },
  {
    "text": "সবচেয়ে সুন্দর দিনটি এখনো আসেনি।",
    "by": "নাজিম হিকমত"
  },
  {
    "text": "সমাজতন্ত্র না হলে মৃত্যু।",
    "by": "চে গেভারা"
  },
  {
    "text": "ধর্ম হলো জনগণের আফিম।",
    "by": "কার্ল মার্কস"
  },
  {
    "text": "আমি মানুষ — মানুষের কিছুই আমার কাছে পর নয়।",
    "by": "কার্ল মার্কসের প্রিয় উক্তি"
  }
];

export const STATS = {
  "works": 73,
  "langs": 11,
  "authors": 47,
  "links": 76
};

export const TIMELINE = [
  {
    "year": "১৮৪৮",
    "title": "কমিউনিস্ট ইশতেহার",
    "note": "লন্ডনে ছাপা হয় ২৩ পাতার পুস্তিকা — বদলে যায় রাজনীতির ভাষা।"
  },
  {
    "year": "১৮৬৪",
    "title": "প্রথম আন্তর্জাতিক",
    "note": "শ্রমিক সংগঠনের প্রথম বিশ্বসংঘ প্রতিষ্ঠা।"
  },
  {
    "year": "১৮৬৭",
    "title": "পুঁজি, ১ম খণ্ড",
    "note": "হামবুর্গ থেকে বেরোয় শতাব্দীর সবচেয়ে বিস্ফোরক বই।"
  },
  {
    "year": "১৮৭১",
    "title": "প্যারিস কমিউন",
    "note": "৭২ দিনের শ্রমিক-শাসন; রক্তাক্ত দমন, তবু অমর দৃষ্টান্ত।"
  },
  {
    "year": "১৯০২",
    "title": "কী করা করণীয়?",
    "note": "বিপ্লবী দলের রূপরেখা — নতুন ধরনের সংগঠন।"
  },
  {
    "year": "১৯১৭",
    "title": "অক্টোবর বিপ্লব",
    "note": "“শান্তি, রুটি, জমি” — পেত্রোগ্রাদে ক্ষমতা সোভিয়েতের হাতে।"
  },
  {
    "year": "১৯১৯",
    "title": "তৃতীয় আন্তর্জাতিক",
    "note": "বিশ্ববিপ্লবের সংগঠন — ছুঁয়ে যায় ভারতের কানপুর ষড়যন্ত্র মামলাও।"
  },
  {
    "year": "১৯৩৪",
    "title": "ইস্পাত কীভাবে ঝালানো হলো",
    "note": "করচাগিন — সোভিয়েত সাহিত্যের প্রভাবশালী নায়ক।"
  },
  {
    "year": "১৯৩৬",
    "title": "স্পেনের গৃহযুদ্ধ",
    "note": "৪০ হাজার আন্তর্জাতিক স্বেচ্ছাসেবী ফ্যাসিবাদের বিরুদ্ধে।"
  },
  {
    "year": "১৯৪৬",
    "title": "তেভাগা আন্দোলন",
    "note": "বাংলার কৃষক ফসলের দুই-তৃতীয়াংশের দাবিতে মাঠে।"
  },
  {
    "year": "১৯৫০",
    "title": "কান্তো জেনেরাল",
    "note": "নির্বাসনে নেরুদার লাতিন আমেরিকার মহাকাব্য।"
  },
  {
    "year": "১৯৬১",
    "title": "পৃথিবীর নিপীড়িত মানুষ",
    "note": "উপনিবেশ-মুক্তির মানসিক দলিল — ফানোঁর শেষ বই।"
  }
];

// ─── North Korean Revolutionary Literature ──────────────────────────────────
const NORTH_KOREA_WORKS: BookWork[] = [
  {
    id: 'juche-ideology',
    cat: 'north-korea',
    title: 'জুচে চিন্তাধারা',
    orig: '주체사상 (Juche Ideology)',
    author: 'কিম ইল-সুং',
    year: '1955',
    lang: 'কোরিয়ান',
    desc: 'জুচে — "আত্মনির্ভরতা" — উত্তর কোরিয়ার রাষ্ট্রীয় দর্শনের ভিত্তি। কিম ইল-সুং কর্তৃক প্রণীত এই মতাদর্শ সোভিয়েত মার্কসবাদ-লেনিনবাদকে কোরীয় জাতীয়তাবাদের সাথে সমন্বিত করে।',
    links: [
      { label: 'Marxists.org', url: 'https://www.marxists.org/archive/kim-il-sung/' }
    ]
  },
  {
    id: 'kim-il-sung-selected-works',
    cat: 'north-korea',
    title: 'নির্বাচিত রচনাবলী',
    orig: '김일성선집 (Kim Il Sung Selected Works)',
    author: 'কিম ইল-সুং',
    year: '1946',
    lang: 'কোরিয়ান',
    desc: 'কিম ইল-সুংয়ের রাজনৈতিক, দার্শনিক ও সামরিক রচনার সংকলন — কোরীয় বিপ্লব, শ্রেণিসংগ্রাম ও সমাজতান্ত্রিক নির্মাণ বিষয়ক ভাষণ ও প্রবন্ধ।',
    links: [
      { label: 'Marxists.org Archive', url: 'https://www.marxists.org/archive/kim-il-sung/index.htm' }
    ]
  },
  {
    id: 'sea-of-blood',
    cat: 'north-korea',
    title: 'রক্তের সাগর',
    orig: '피바다 (Sea of Blood)',
    author: 'কিম ইল-সুং (মূল ধারণা)',
    year: '1936',
    lang: 'কোরিয়ান',
    desc: 'জাপানি উপনিবেশ শাসনের বিরুদ্ধে কোরীয় প্রতিরোধের মহাকাব্যিক চিত্রণ। পরে অপেরা ও চলচ্চিত্রে রূপান্তরিত, উত্তর কোরিয়ার সবচেয়ে প্রভাবশালী বিপ্লবী সাহিত্যকর্মগুলোর একটি।',
    links: []
  },
  {
    id: 'flower-girl',
    cat: 'north-korea',
    title: 'ফুলওয়ালী মেয়ে',
    orig: '꽃파는 처녀 (The Flower Girl)',
    author: 'কিম ইল-সুং (মূল ধারণা)',
    year: '1930',
    lang: 'কোরিয়ান',
    desc: 'জাপানি দখলদারিত্বের বিরুদ্ধে একটি গরিব ফুলওয়ালী মেয়ের পরিবারের লড়াইয়ের গল্প। অপেরা, চলচ্চিত্র ও উপন্যাস হিসেবে প্রকাশিত; উত্তর কোরীয় বিপ্লবী শিল্পকলার আইকনিক রচনা।',
    links: []
  },
  {
    id: 'on-the-art-of-opera',
    cat: 'north-korea',
    title: 'অপেরার শিল্প প্রসঙ্গে',
    orig: '가극예술론 (On the Art of Opera)',
    author: 'কিম জং-ইল',
    year: '1974',
    lang: 'কোরিয়ান',
    desc: 'কিম জং-ইল কর্তৃক রচিত উত্তর কোরিয়ার বিপ্লবী সংগীত ও অপেরা তত্ত্ব। "পিবাদা" ধারার শিল্পকলার সৌন্দর্যতত্ত্ব এবং সমাজতান্ত্রিক বাস্তববাদের কোরীয় পথ ব্যাখ্যা করে।',
    links: [
      { label: 'Marxists.org', url: 'https://www.marxists.org/reference/archive/kim-jong-il/' }
    ]
  },
  {
    id: 'with-the-century',
    cat: 'north-korea',
    title: 'শতাব্দীর সাথে',
    orig: '세기와 더불어 (With the Century)',
    author: 'কিম ইল-সুং',
    year: '1992',
    lang: 'কোরিয়ান',
    desc: 'কিম ইল-সুংয়ের আট খণ্ডের আত্মজীবনী — ১৯২০–৪০-এর দশকে কোরীয় মুক্তি আন্দোলন ও জাপান-বিরোধী সশস্ত্র গেরিলা সংগ্রামের বিস্তারিত বিবরণ।',
    links: []
  },
  {
    id: 'socialism-our-own-style',
    cat: 'north-korea',
    title: 'আমাদের স্টাইলের সমাজতন্ত্র',
    orig: '우리식 사회주의 (Socialism of Our Own Style)',
    author: 'কিম জং-ইল',
    year: '1990',
    lang: 'কোরিয়ান',
    desc: 'সোভিয়েত ইউনিয়নের পতনের প্রেক্ষাপটে কিম জং-ইলের রচনা — কোরীয় সমাজতন্ত্রকে সোভিয়েত মডেল থেকে আলাদা করে জুচে ও সামরিক-প্রথম নীতির ব্যাখ্যা।',
    links: [
      { label: 'Marxists.org', url: 'https://www.marxists.org/reference/archive/kim-jong-il/1990/02/27.htm' }
    ]
  },
  {
    id: 'on-juche-in-our-revolution',
    cat: 'north-korea',
    title: 'আমাদের বিপ্লবে জুচে',
    orig: '우리 혁명에서의 주체 (On Juche in Our Revolution)',
    author: 'কিম ইল-সুং',
    year: '1970',
    lang: 'কোরিয়ান',
    desc: 'কিম ইল-সুংয়ের বিখ্যাত ভাষণসমূহের সংকলন যেখানে কোরীয় বিপ্লবের পথে জুচে নীতি, মার্কসবাদ-লেনিনবাদের সৃজনশীল প্রয়োগ এবং সাম্রাজ্যবাদ-বিরোধী সংগ্রামের কৌশল ব্যাখ্যা করা হয়েছে।',
    links: []
  }
];

export function getAllBooks(): BookWork[] {
  return [...WORKS, ...NORTH_KOREA_WORKS];
}

export function getBookById(id: string): BookWork | undefined {
  return [...WORKS, ...NORTH_KOREA_WORKS].find(b => b.id === id || b.slug === id);
}

export function getCategories(): BookCategory[] {
  return CATEGORIES;
}
