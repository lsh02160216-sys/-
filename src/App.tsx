import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Calendar,
  MapPin,
  Settings,
  Edit3,
  Plus,
  Trash2,
  Save,
  RefreshCw,
  Share2,
  Palette,
  ChevronRight,
  Menu,
  X,
  Award,
  Gamepad2,
  ExternalLink,
  Clock,
  Globe,
  Info,
  Phone,
  UserCheck,
  Layers,
  ImageIcon,
  CheckCircle2,
  Sliders,
  Type,
  LayoutGrid,
  MessageSquare,
  Send,
  Check,
  Upload,
  Play,
  ArrowUp,
  Copy,
  Eye,
  Bus,
  Search,
  Download,
  AlertCircle,
  Link as LinkIcon,
  CheckCheck,
  Mail,
  BellRing
} from 'lucide-react';
import { DEFAULT_TEXTS, TEXT_GROUPS, getText } from './siteTexts';
import {
  AuthError,
  fetchInquiries,
  fetchSiteContent,
  getAdminPassword,
  getUnmigratedLegacyInquiries,
  loadCachedData,
  loadLegacyLocalData,
  mergeWithDefaults,
  prepareImageFile,
  saveSiteContent,
  setAdminPassword,
  submitInquiry,
  uploadEmbeddedImages,
  writeCache,
} from './siteStore';

// Default photos are referenced as '/src/assets/images/...', which only exists in dev; map them to built asset URLs.
const BUNDLED_IMAGES: Record<string, string> = Object.fromEntries(
  Object.entries(
    import.meta.glob('./assets/images/*', { eager: true, query: '?url', import: 'default' }) as Record<string, string>
  ).map(([path, url]) => [path.replace(/^\.\//, '/src/'), url])
);

// ==========================================
// 1. DEFAULT DATA & STORAGE CONSTANTS
// ==========================================
const DEFAULT_FORMSPREE_ENDPOINT = 'https://formspree.io/f/xoeeljdk';

const DEFAULT_DATA = {
  texts: { ...DEFAULT_TEXTS },
  theme: {
    forestGreen: '#143022',
    appleRed: '#D92525',
    sageLime: '#F4F7EE',
    accentLime: '#E2ECC8',
    darkText: '#1A291E',
  },
  formspree: {
    endpoint: DEFAULT_FORMSPREE_ENDPOINT,
    enabled: true,
    lastSubmissionTime: '',
    submissionCount: 0,
  },
  seo: {
    metaTitle: '청송 못난이 사과 축제 2026 | Cheongsong Ugly Apple Festival',
    metaDescription: '못생겼다니, 그래도 맛있다구요! 청송 못난이 사과 축제 2026. 꿀사과 수확, 베이킹 클래스, 백자 빚기 체험 및 다채로운 이벤트',
    metaKeywords: '청송사과축제, 못난이 사과, 청송 꿀사과, 주왕산, 경북 축제, 사과 수확체험, 청송백자',
  },
  hero: {
    badge: '🍎 2026 CHEONGSONG APPLE FESTIVAL',
    title: '"못생겼다니. 그래도 맛있다구요 \'사과\'해요 나한테"',
    subtitle: '유네스코 세계지질공원 청송의 청정 고랭지에서 자라 겉모습은 조금 투박해도, 속은 꿀이 꽉 찬 명품 청송 사과의 달콤한 향연에 여러분을 초대합니다.',
    date: '2026. 10. 30 (금) - 11. 03 (화) [5일간]',
    location: '경상북도 청송군 용전천 현비암 일원 & 사과축제장',
    bgImage: '/src/assets/images/hero_apple_orchard_1793270973004.jpg',
  },
  stats: [
    { id: '1', label: '예상 방문객', value: '45만+ 명', desc: '전국 각지에서 찾는 가을 대표 축제' },
    { id: '2', label: '꿀사과 당도 보증', value: '14~16+ Brix', desc: '고랭지 일교차가 빚은 꿀 심지' },
    { id: '3', label: '참가 과수원', value: '280+ 농가', desc: '청송 친환경 재배 명장 참여' },
    { id: '4', label: '누적 관람객 만족도', value: '99.2%', desc: '오감만족 체류형 가족 힐링 축제' },
  ],
  programs: [
    {
      id: 'p1',
      title: '못난이 사과 수확 & 꿀사과 보물찾기',
      category: '농장 수확 체험',
      badge: '최고 인기',
      time: '매일 10:00 / 14:00 (1일 2회)',
      place: '청송 주왕산 자락 체험 과수원 (셔틀 5분)',
      price: '15,000원 (수확 사과 3kg 증정 + 보물찾기)',
      desc: '직접 과수원에서 탐스러운 사과를 따보고, 나뭇가지와 덤불 사이에 숨겨진 행운의 황금사과 티켓을 찾아보세요! 수확한 사과는 친환경 바구니에 담아 드립니다.',
      image: '/src/assets/images/apple_harvest_basket_1793270974463.jpg',
    },
    {
      id: 'p2',
      title: '청송 사과 파이 & 디저트 베이킹 클래스',
      category: '미식 쿠킹 클래스',
      badge: '가족/연인 추천',
      time: '매일 11:30 / 15:30 (1일 2회)',
      place: '축제장 내 파티시에 베이커리 돔',
      price: '12,000원 (수제 미니 사과파이 2구 + 사과청)',
      desc: '특등급 못난이 사과 과육과 은은한 계피향이 어우러진 정통 프렌치 사과파이를 전문 파티시에와 함께 굽습니다. 갓 구운 파이의 바삭함과 진한 풍미를 느껴보세요.',
      image: '/src/assets/images/apple_pie_dessert_1793270975767.jpg',
    },
    {
      id: 'p3',
      title: '나만의 청송 백자 수제 사과 컵 만들기',
      category: '전통 공예 도예',
      badge: '전통 문화',
      time: '상시 운영 (10:00 - 17:00, 30분 간격)',
      place: '청송백자 도예 전시장 & 워크숍 부스',
      price: '20,000원 (가마 소성 및 집으로 안심 택배 발송)',
      desc: '500년 전통을 자랑하는 청송 백자 도석 점토를 물레에 얹어 나만의 사과 형태 찻잔과 머그컵을 빚습니다. 전통 청송백자 장인의 1:1 지도로 완성됩니다.',
      image: '/src/assets/images/cheongsong_white_porcelain_1793270975943.jpg',
    },
    {
      id: 'p4',
      title: '청송 사과 와인 & 수제 뱅쇼 테이스팅',
      category: '성인 힐링 시음',
      badge: '노을 낭만',
      time: '매일 16:30 / 18:30 (석양 타임)',
      place: '용전천 현비암 야외 수변 테라스 라운지',
      price: '10,000원 (와인 3종 시음 + 핫 뱅쇼 1잔 + 치즈)',
      desc: '오크통에서 2년 이상 저온 숙성된 청송 사과 와인 3종과 제철 과일 및 정향을 달인 따뜻한 뱅쇼를 현비암의 절경과 함께 음미하는 로맨틱 라운지입니다.',
      image: '/src/assets/images/apple_wine_tasting_1793270976763.jpg',
    },
  ],
  event: {
    title: '제3회 청송 사과 도련님 & 공주님 그림 그리기 대회',
    subtitle: '아이들의 순수한 눈으로 담아내는 알록달록 못난이 사과의 이야기',
    date: '2026년 11월 1일 (일) 11:00 - 15:00',
    location: '용전천 잔디광장 메인 야외무대 일원',
    target: '전국 유치부, 초등 저학년/고학년부 (선착순 300명)',
    awards: '대상 경상북도지사상(장학금 100만원), 금상 청송군수상(장학금 50만원), 특선 청송사과 특등급 10kg',
    desc: '모양이 울퉁불퉁해도 달콤함은 최고인 청송 못난이 사과를 주제로 자유롭게 상상력을 펼쳐보세요. 참가자 전원에게 8색 크레파스 세트와 청송 사과 1박스를 기념품으로 증정합니다.',
    image: '/src/assets/images/apple_art_contest_1793270998066.jpg',
  },
  games: [
    {
      id: 'g1',
      title: '사과 서리꾼 걸신 피하기',
      subtitle: '아케이드 과수원 액션 미니게임',
      desc: '청송 과수원에 몰래 들어온 서리꾼과 까마귀를 피해, 하늘에서 쏟아지는 달콤한 꿀사과를 바구니에 담아 최고 점수에 도전하세요!',
      url: 'https://cheongsong.go.kr/festival/game1',
      thumbnail: '/src/assets/images/apple_harvest_basket_1793270974463.jpg',
    },
    {
      id: 'g2',
      title: '청송 백자 사과 빚기 장인 게임',
      subtitle: '타이밍 힐링 도예 시뮬레이션',
      desc: '물레를 돌리며 부드러운 백자 점토를 정성껏 매만져 완벽한 곡선의 청송사과 백자 찻잔을 완성해보세요. 장인의 칭호가 주어집니다.',
      url: 'https://cheongsong.go.kr/festival/game2',
      thumbnail: '/src/assets/images/cheongsong_white_porcelain_1793270975943.jpg',
    },
  ],
  characters: [
    {
      id: 'c1',
      name: '청이 (Cheongi)',
      role: '과수원의 씩씩한 사과 도령',
      personality: '당차고 의리 넘치며 청송 꿀사과의 당도를 지키는 수호자',
      desc: '주왕산 맑은 바람과 아침 이슬을 먹고 자란 소년 요정. 겉모습에 작은 흠집이 있더라도 "진짜 맛은 속살에 있다"며 언제나 당당하게 미소 짓는 청송의 마스코트입니다.',
      image: '/src/assets/images/mascot_cheongi_songi_1793270998280.jpg',
    },
    {
      id: 'c2',
      name: '송이 (Songi)',
      role: '달콤한 디저트 파티시에 아씨',
      personality: '다정하고 섬세하며 못난이 사과를 예술작품으로 만드는 금손',
      desc: '청송 달기약수로 사과 디저트를 연구하는 다정한 소녀 요정. 모양이 조금 삐뚤어진 사과들을 모아 환상적인 파이와 달콤한 와인으로 재탄생시키는 마법 같은 손재주를 가졌습니다.',
      image: '/src/assets/images/mascot_cheongi_songi_1793270998280.jpg',
    },
  ],
  notices: [
    {
      id: 'n1',
      title: '2026 청송 못난이 사과 축제 무료 셔틀버스 운행 노선 및 임시주차장 안내',
      category: '교통안내',
      date: '2026.10.20',
      pinned: true,
      content: '축제 기간(10.30~11.03) 동안 청송읍 일대 교통 혼잡을 방지하기 위해 4개 대형 임시주차장(A~D구역)과 축제장 메인 게이트를 순환하는 10분 배차 무료 셔틀버스를 운행합니다. 네비게이션에 [청송사과축제 임시주차장]을 검색해주세요.',
    },
    {
      id: 'n2',
      title: '방문 인증 SNS 해시태그 사진전 이벤트 (추첨 100분 청송 꿀사과 5kg 증정)',
      category: '이벤트',
      date: '2026.10.24',
      pinned: true,
      content: '현비암 야경, 사과 수확 체험, 베이킹 클래스 등 축제 현장 사진을 필수 해시태그(#청송못난이사과축제 #청송사과 #현비암야경)와 함께 인스타그램에 올려주시면 추첨을 통해 100분께 청송 명품 꿀사과를 산지 직송해 드립니다.',
    },
    {
      id: 'n3',
      title: '청송사랑화폐 현장 특별 10% 할인 판매 및 친환경 장바구니 무료 배포',
      category: '운영공지',
      date: '2026.10.26',
      pinned: false,
      content: '축제장 내 종합안내소 및 농특산물 직판장에서 청송사랑화폐를 10% 현장 할인 구매하실 수 있습니다. 또한 1회용 비닐 줄이기 캠페인으로 축제장에서 3만원 이상 구매하신 모든 방문객께 청송 사과 에코백을 선물합니다.',
    },
  ],
  gallery: [
    {
      id: 'gal1',
      title: '현비암 달빛 야경 & 가을밤 수변 라이브 콘서트',
      category: '야간 페스티벌',
      date: '2026. 10. 31',
      image: '/src/assets/images/fest_night_concert_1793270999359.jpg',
    },
    {
      id: 'gal2',
      title: '당도 15Brix 보증! 못난이 꿀사과 산지 직판 장터',
      category: '사과 직판장',
      date: '2026. 10. 30',
      image: '/src/assets/images/apple_box_market_1793270999709.jpg',
    },
    {
      id: 'gal3',
      title: '햇살 가득한 청송 주왕산 자락 사과 과수원 풍경',
      category: '과수원 현장',
      date: '2026. 10. 29',
      image: '/src/assets/images/hero_apple_orchard_1793270973004.jpg',
    },
    {
      id: 'gal4',
      title: '가족과 함께하는 수제 사과파이 오븐 베이킹 클래스',
      category: '체험 교실',
      date: '2026. 10. 30',
      image: '/src/assets/images/apple_pie_dessert_1793270975767.jpg',
    },
  ],
  footer: {
    organizer: '주최: 경상북도 청송군 | 주관: 청송군축제추진위원회',
    address: '경상북도 청송군 청송읍 금월로 269 청송군청 문화관광과',
    phone: '054-870-6205, 6208',
    email: 'tour@cheongsong.go.kr',
    copyright: '© 2026 Cheongsong Ugly Apple Festival. All rights reserved.',
  },
  inquiries: [
    {
      id: 'inq-1',
      name: '김민준',
      phone: '010-3849-2910',
      email: 'minjun.kim@example.com',
      type: '체험 프로그램 단체 예약',
      content: '초등학교 가을 소풍 단체 45명 사과 수확 체험 및 베이킹 클래스 예약 문의드립니다. 10월 31일 금요일 오전에 단체 할인 적용이 가능한가요?',
      date: '2026-10-27 14:20',
      status: '미확인',
      sentToFormspree: true,
    },
    {
      id: 'inq-2',
      name: '이수연',
      phone: '010-8291-5541',
      email: 'sooyeon_lee@example.com',
      type: '주차 및 셔틀버스 문의',
      content: '휠체어를 이용하는 어르신과 함께 방문 예정인데, 장애인 전용 셔틀버스 및 축제장 내 배리어프리 경사로 이용이 가능한지 문의드립니다.',
      date: '2026-10-28 09:45',
      status: '확인완료',
      sentToFormspree: true,
    },
  ],
};

// ==========================================
// 2. FORMSPREE ASYNC SUBMITTER & SAFE IMAGES
// ==========================================
async function submitToFormspree(
  endpoint: string,
  payload: Record<string, any>
): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      return { success: true };
    }
    const errData = await res.json().catch(() => ({}));
    return {
      success: false,
      message: errData.error || errData.message || `오류 코드: ${res.status}`,
    };
  } catch (err: any) {
    console.warn('Formspree submit error (offline or CORS):', err);
    return {
      success: false,
      message: err.message || '네트워크 연결 오류',
    };
  }
}

function getSafeImageSrc(src?: string): string {
  if (src && BUNDLED_IMAGES[src]) return BUNDLED_IMAGES[src];
  if (!src) {
    return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="%23143022"><rect width="100%" height="100%" fill="%23143022"/><text x="50%" y="50%" fill="%23E2ECC8" font-family="sans-serif" font-size="20" text-anchor="middle" dominant-baseline="middle">청송 못난이 사과 🍎</text></svg>';
  }
  return src;
}

function handleImgError(e: React.SyntheticEvent<HTMLImageElement, Event>) {
  e.currentTarget.onerror = null;
  e.currentTarget.src =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="%23143022"><rect width="100%" height="100%" fill="%23143022"/><text x="50%" y="45%" fill="%23D92525" font-family="sans-serif" font-size="36" text-anchor="middle">🍎</text><text x="50%" y="60%" fill="%23F4F7EE" font-family="sans-serif" font-size="18" text-anchor="middle">청송 못난이 사과 축제</text></svg>';
}

function normalizeData(saved: Record<string, any> | null | undefined): typeof DEFAULT_DATA {
  const merged = mergeWithDefaults(DEFAULT_DATA, saved);
  if (!merged.formspree.endpoint) merged.formspree.endpoint = DEFAULT_FORMSPREE_ENDPOINT;
  // Inquiries are private and loaded separately for the admin only
  merged.inquiries = [];
  return merged;
}

// ==========================================
// 3. MAIN APP COMPONENT
// ==========================================
export default function App() {
  // Render the last known content instantly (server cache, else data saved by the old local-only admin)
  const [data, setData] = useState<typeof DEFAULT_DATA>(() =>
    normalizeData(loadCachedData() ?? loadLegacyLocalData())
  );

  // The server copy is shared by every visitor and always wins once loaded
  useEffect(() => {
    fetchSiteContent()
      .then((serverData) => {
        if (serverData) {
          setData(normalizeData(serverData));
          writeCache(serverData);
        }
      })
      .catch((e) => console.error('Failed to load site content:', e));
  }, []);

  const [adminPassword, setAdminPasswordState] = useState<string | null>(null);
  const [adminLoginOpen, setAdminLoginOpen] = useState(false);
  const [adminInquiries, setAdminInquiries] = useState<any[]>([]);

  const openAdmin = async (password: string) => {
    const serverInquiries = await fetchInquiries(password);
    const serverIds = new Set(serverInquiries.map((i) => i.id));
    const legacy = getUnmigratedLegacyInquiries().filter((i) => !serverIds.has(i.id));
    setAdminPassword(password);
    setAdminPasswordState(password);
    setAdminInquiries([...serverInquiries, ...legacy]);
    setIsAdminOpen(true);
  };

  const handleAdminButton = async () => {
    const saved = getAdminPassword();
    if (saved) {
      try {
        await openAdmin(saved);
        return;
      } catch (e) {
        if (!(e instanceof AuthError)) {
          showToast('⚠️ ' + (e as Error).message);
          return;
        }
        setAdminPassword(null);
      }
    }
    setAdminLoginOpen(true);
  };

  // Records a visitor submission on the server so the admin sees it from any device
  const recordInquiry = async (inquiry: Record<string, any>) => {
    const ok = await submitInquiry(inquiry);
    if (!ok) console.error('Failed to record inquiry on server');
    return ok;
  };

  const t = (key: string) => getText(data.texts, key);

  // UI Modals state
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shuttleModalOpen, setShuttleModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<any | null>(null);
  const [eventRegisterOpen, setEventRegisterOpen] = useState(false);
  const [quickAlertOpen, setQuickAlertOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<any | null>(null);
  const [selectedGallery, setSelectedGallery] = useState<any | null>(null);
  const [activeGameModal, setActiveGameModal] = useState<'game1' | 'game2' | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Submitting states
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);
  const [isSubmittingQuickAlert, setIsSubmittingQuickAlert] = useState(false);

  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: '',
    phone: '',
    email: '',
    type: '체험 프로그램 예약 문의',
    content: '',
  });

  // Program reservation modal form state
  const [bookingForm, setBookingForm] = useState({
    name: '',
    phone: '',
    date: '2026-10-31',
    timeSlot: '10:00',
    guests: '2',
  });

  // Event contest registration form state
  const [eventForm, setEventForm] = useState({
    childName: '',
    ageGroup: '초등 저학년부 (1~3학년)',
    guardianName: '',
    guardianPhone: '',
    region: '경상북도 청송군',
    notes: '',
  });

  // Quick alert form state
  const [quickAlertPhone, setQuickAlertPhone] = useState('');
  const [quickAlertName, setQuickAlertName] = useState('');

  // Toast trigger helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3800);
  };

  // Sync title and SEO
  useEffect(() => {
    document.title = data.seo?.metaTitle || '청송 못난이 사과 축제 2026';
  }, [data.seo?.metaTitle]);

  useEffect(() => {
    const setMeta = (name: string, content?: string) => {
      if (!content) return;
      let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.name = name;
        document.head.appendChild(el);
      }
      el.content = content;
    };
    setMeta('description', data.seo?.metaDescription);
    setMeta('keywords', data.seo?.metaKeywords);
  }, [data.seo?.metaDescription, data.seo?.metaKeywords]);

  // Handle Contact Us submission with Formspree Integration
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.phone || !contactForm.content) {
      showToast('⚠️ 성함, 연락처, 문의 내용을 모두 입력해주세요.');
      return;
    }

    setIsSubmittingContact(true);
    const endpoint = data.formspree?.endpoint || DEFAULT_FORMSPREE_ENDPOINT;

    const payload = {
      _subject: `[청송 못난이 사과 축제] 새 문의 접수: ${contactForm.name} (${contactForm.type})`,
      form_type: '온라인 문의 접수',
      name: contactForm.name,
      phone: contactForm.phone,
      email: contactForm.email || '미작성',
      inquiry_type: contactForm.type,
      message: contactForm.content,
      submitted_at: new Date().toLocaleString('ko-KR'),
      source_page: 'https://formspree.io/f/xoeeljdk 연동 웹사이트',
    };

    const res = await submitToFormspree(endpoint, payload);

    const newInquiry = {
      id: 'inq-' + Date.now(),
      name: contactForm.name,
      phone: contactForm.phone,
      email: contactForm.email || '미작성',
      type: contactForm.type,
      content: contactForm.content,
      date: new Date().toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: '미확인',
      sentToFormspree: res.success,
    };

    await recordInquiry(newInquiry);
    setIsSubmittingContact(false);

    setContactForm({
      name: '',
      phone: '',
      email: '',
      type: '체험 프로그램 예약 문의',
      content: '',
    });

    if (res.success) {
      showToast('🍎 Formspree 및 축제 상황실로 문의가 성공적으로 전송되었습니다!');
    } else {
      showToast('✨ 문의가 로컬 관리자에 기록되었습니다. (Formspree: ' + (res.message || '접수완료') + ')');
    }
  };

  // Handle Program Reservation submit with Formspree
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingForm.name || !bookingForm.phone) {
      showToast('⚠️ 예약자 성함과 연락처를 입력해주세요.');
      return;
    }

    setIsSubmittingBooking(true);
    const endpoint = data.formspree?.endpoint || DEFAULT_FORMSPREE_ENDPOINT;

    const payload = {
      _subject: `[체험 프로그램 예약] ${selectedProgram?.title} - ${bookingForm.name}님 (${bookingForm.guests}명)`,
      form_type: '체험 프로그램 사전 예약',
      program_name: selectedProgram?.title,
      program_category: selectedProgram?.category,
      applicant_name: bookingForm.name,
      applicant_phone: bookingForm.phone,
      desired_date: bookingForm.date,
      desired_time: bookingForm.timeSlot,
      guest_count: `${bookingForm.guests}명`,
      price_info: selectedProgram?.price,
      submitted_at: new Date().toLocaleString('ko-KR'),
    };

    const res = await submitToFormspree(endpoint, payload);

    // Record in inquiries list as well
    const newInquiry = {
      id: 'inq-' + Date.now(),
      name: bookingForm.name,
      phone: bookingForm.phone,
      email: '프로그램 사전예약',
      type: `체험예약: ${selectedProgram?.title}`,
      content: `[희망일시: ${bookingForm.date} ${bookingForm.timeSlot} / 인원: ${bookingForm.guests}명 / ${selectedProgram?.price}]`,
      date: new Date().toLocaleString('ko-KR'),
      status: '미확인',
      sentToFormspree: res.success,
    };

    await recordInquiry(newInquiry);

    setIsSubmittingBooking(false);
    setSelectedProgram(null);
    showToast(`🍎 '${selectedProgram?.title}' 예약 정보가 Formspree로 안전하게 수집되었습니다!`);
  };

  // Handle Contest Event submit with Formspree
  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.childName || !eventForm.guardianPhone) {
      showToast('⚠️ 어린이 이름과 보호자 연락처를 입력해주세요.');
      return;
    }

    setIsSubmittingEvent(true);
    const endpoint = data.formspree?.endpoint || DEFAULT_FORMSPREE_ENDPOINT;

    const payload = {
      _subject: `[그림 그리기 대회 참가신청] ${eventForm.childName} (${eventForm.ageGroup}) - 보호자 ${eventForm.guardianPhone}`,
      form_type: '그림 그리기 대회 참가 접수',
      child_name: eventForm.childName,
      age_group: eventForm.ageGroup,
      guardian_name: eventForm.guardianName || '미작성',
      guardian_phone: eventForm.guardianPhone,
      region: eventForm.region,
      notes: eventForm.notes,
      submitted_at: new Date().toLocaleString('ko-KR'),
    };

    const res = await submitToFormspree(endpoint, payload);

    const newInquiry = {
      id: 'inq-' + Date.now(),
      name: `${eventForm.childName} (보호자: ${eventForm.guardianName || '미작성'})`,
      phone: eventForm.guardianPhone,
      email: '대회 참가접수',
      type: `사생대회 접수: ${eventForm.ageGroup}`,
      content: `[지역: ${eventForm.region} / 비고: ${eventForm.notes || '없음'}]`,
      date: new Date().toLocaleString('ko-KR'),
      status: '미확인',
      sentToFormspree: res.success,
    };

    await recordInquiry(newInquiry);

    setIsSubmittingEvent(false);
    setEventRegisterOpen(false);
    showToast('🎨 그림 그리기 대회 참가 신청 정보가 Formspree로 전송되었습니다!');
  };

  // Handle Quick Alert submit with Formspree
  const handleQuickAlertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAlertPhone) {
      showToast('⚠️ 연락처를 입력해주세요.');
      return;
    }

    setIsSubmittingQuickAlert(true);
    const endpoint = data.formspree?.endpoint || DEFAULT_FORMSPREE_ENDPOINT;

    const payload = {
      _subject: `[못난이 꿀사과 직판 알림 신청] ${quickAlertName || '방문객'} - ${quickAlertPhone}`,
      form_type: '못난이 꿀사과 직판 알림 구독',
      name: quickAlertName || '익명 고객',
      phone: quickAlertPhone,
      submitted_at: new Date().toLocaleString('ko-KR'),
    };

    const res = await submitToFormspree(endpoint, payload);

    const newInquiry = {
      id: 'inq-' + Date.now(),
      name: quickAlertName || '꿀사과 알림신청자',
      phone: quickAlertPhone,
      email: 'SMS 알림 구독',
      type: '꿀사과 산지직판 알림',
      content: '수확 시기 못난이 꿀사과 산지 직송 구매 알림 문자 요청',
      date: new Date().toLocaleString('ko-KR'),
      status: '미확인',
      sentToFormspree: res.success,
    };

    await recordInquiry(newInquiry);

    setIsSubmittingQuickAlert(false);
    setQuickAlertPhone('');
    setQuickAlertName('');
    setQuickAlertOpen(false);
    showToast('🍯 꿀사과 수확 직판 알림 신청이 Formspree로 등록되었습니다!');
  };

  // Quick navigation smooth scroll
  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const copyUrlToClipboard = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('🔗 축제 웹사이트 링크가 클립보드에 복사되었습니다.');
    setShareModalOpen(false);
  };

  return (
    <div
      className="min-h-screen text-slate-800 transition-colors duration-200"
      style={{
        backgroundColor: data.theme?.sageLime || '#F4F7EE',
        color: data.theme?.darkText || '#1A291E',
      }}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[100] max-w-md bg-[#143022] text-[#F4F7EE] px-5 py-3.5 rounded-xl shadow-2xl border border-[#E2ECC8]/20 flex items-center gap-3 animate-bounce">
          <Sparkles className="w-5 h-5 text-[#E2ECC8] shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Top Banner Notice for Formspree Connected */}
      <div className="bg-[#143022] text-xs text-[#E2ECC8] py-1.5 px-4 border-b border-white/10 flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{t('topBanner')} (Formspree: <strong className="font-mono text-white">xoeeljdk</strong>)</span>
          </div>
          <button
            onClick={() => setQuickAlertOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold text-white bg-[#D92525] px-2.5 py-0.5 rounded-full hover:brightness-110"
          >
            <BellRing className="w-3 h-3" />
            <span>{t('topAlertButton')}</span>
          </button>
        </div>
      </div>

      {/* ==========================================
          1. GNB / 헤더 (Header)
         ========================================== */}
      <header
        className="sticky top-0 z-40 backdrop-blur-md border-b border-black/5 transition-all"
        style={{
          backgroundColor: `${data.theme?.forestGreen || '#143022'}F5`,
          color: '#F4F7EE',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6">
          {/* Brand Logo & Emblem */}
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105"
              style={{ backgroundColor: data.theme?.appleRed || '#D92525' }}
            >
              <span className="text-2xl select-none">🍎</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-white font-serif">
                  {t('brandName')}
                </span>
                <span
                  className="px-2 py-0.5 text-[11px] font-bold rounded-md uppercase tracking-wider text-black"
                  style={{ backgroundColor: data.theme?.accentLime || '#E2ECC8' }}
                >
                  {t('brandYear')}
                </span>
              </div>
              <p className="text-xs text-[#E2ECC8]/80 font-light tracking-wide">
                {t('brandSub')}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#F4F7EE]/90">
            <button
              onClick={() => scrollTo('intro')}
              className="hover:text-white transition-colors cursor-pointer py-1"
            >
              {t('navIntro')}
            </button>
            <button
              onClick={() => scrollTo('programs')}
              className="hover:text-white transition-colors cursor-pointer py-1"
            >
              {t('navPrograms')}
            </button>
            <button
              onClick={() => scrollTo('event')}
              className="hover:text-white transition-colors cursor-pointer py-1"
            >
              {t('navEvent')}
            </button>
            <button
              onClick={() => scrollTo('minigames')}
              className="hover:text-white transition-colors cursor-pointer py-1"
            >
              {t('navGames')}
            </button>
            <button
              onClick={() => scrollTo('characters')}
              className="hover:text-white transition-colors cursor-pointer py-1"
            >
              {t('navCharacters')}
            </button>
            <button
              onClick={() => scrollTo('notices')}
              className="hover:text-white transition-colors cursor-pointer py-1"
            >
              {t('navNotices')}
            </button>
            <button
              onClick={() => scrollTo('contact')}
              className="hover:text-white transition-colors cursor-pointer py-1"
            >
              {t('navContact')}
            </button>
            <a href="/videos" className="hover:text-white transition-colors cursor-pointer py-1">
              {t('navVideos')}
            </a>
          </nav>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Share Button */}
            <button
              onClick={() => setShareModalOpen(true)}
              title="SNS 공유하기"
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#E2ECC8] transition-all cursor-pointer flex items-center justify-center"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Admin Dashboard Toggle Button */}
            <button
              onClick={handleAdminButton}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white shadow-md transition-all hover:brightness-110 active:scale-95 cursor-pointer"
              style={{ backgroundColor: data.theme?.appleRed || '#D92525' }}
            >
              <Settings className="w-4 h-4 animate-spin-slow" />
              <span>{t('adminButton')}</span>
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-white/10 text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-white/10 px-4 py-6 bg-[#143022] space-y-3">
            {[
              { id: 'intro', label: t('navIntro') },
              { id: 'programs', label: t('navPrograms') },
              { id: 'event', label: t('navEvent') },
              { id: 'minigames', label: t('navGames') },
              { id: 'characters', label: t('navCharacters') },
              { id: 'notices', label: t('navNotices') },
              { id: 'contact', label: t('navContact') },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="w-full text-left py-2.5 px-3 rounded-lg text-sm text-[#F4F7EE] hover:bg-white/10 transition-colors flex items-center justify-between"
              >
                <span>{item.label}</span>
                <ChevronRight className="w-4 h-4 text-[#E2ECC8]" />
              </button>
            ))}
            <a
              href="/videos"
              className="w-full text-left py-2.5 px-3 rounded-lg text-sm text-[#F4F7EE] hover:bg-white/10 transition-colors flex items-center justify-between"
            >
              <span>{t('navVideos')}</span>
              <ChevronRight className="w-4 h-4 text-[#E2ECC8]" />
            </a>
          </div>
        )}
      </header>

      {/* ==========================================
          2. 히어로 섹션 (Hero Section)
         ========================================== */}
      <section
        id="intro"
        className="relative overflow-hidden text-white"
        style={{ backgroundColor: data.theme?.forestGreen || '#143022' }}
      >
        {/* Background Image with Organic Contrast Scrim */}
        <div className="absolute inset-0 z-0">
          <img
            src={getSafeImageSrc(data.hero?.bgImage)}
            onError={handleImgError}
            alt="Cheongsong Apple Orchard Hero"
            className="w-full h-full object-cover object-center scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#143022]/95 via-[#143022]/85 to-[#143022]/60 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#143022] via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy & Actions */}
            <div className="lg:col-span-7 space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[#E2ECC8] text-xs font-semibold tracking-wider">
                <span>{data.hero?.badge || '🍎 2026 CHEONGSONG APPLE FESTIVAL'}</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-serif leading-tight tracking-tight text-white break-keep">
                {data.hero?.title}
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-[#F4F7EE]/90 leading-relaxed font-light max-w-2xl break-keep">
                {data.hero?.subtitle}
              </p>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => scrollTo('programs')}
                  className="px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base text-white shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
                  style={{ backgroundColor: data.theme?.appleRed || '#D92525' }}
                >
                  <Sparkles className="w-5 h-5" />
                  <span>{t('heroProgramsButton')}</span>
                </button>
                <button
                  onClick={() => setShuttleModalOpen(true)}
                  className="px-6 py-3.5 rounded-xl font-semibold text-sm sm:text-base text-white bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/25 transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  <Bus className="w-5 h-5 text-[#E2ECC8]" />
                  <span>{t('heroShuttleButton')}</span>
                </button>
                <button
                  onClick={() => setQuickAlertOpen(true)}
                  className="px-5 py-3.5 rounded-xl font-semibold text-xs sm:text-sm text-[#E2ECC8] bg-black/30 hover:bg-black/50 border border-[#E2ECC8]/30 transition-all flex items-center gap-2"
                >
                  <BellRing className="w-4 h-4 text-[#D92525]" />
                  <span>{t('alertButton')}</span>
                </button>
              </div>

              {/* Meta details */}
              <div className="pt-6 border-t border-white/15 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-[#E2ECC8]">
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-[#D92525] shrink-0" />
                  <span className="font-medium text-white">{data.hero?.date}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-[#D92525] shrink-0" />
                  <span className="font-medium text-white truncate">{data.hero?.location}</span>
                </div>
              </div>
            </div>

            {/* Right Festival Info Card (Stats & Summary) */}
            <div className="lg:col-span-5">
              <div className="p-6 sm:p-8 rounded-3xl bg-black/40 backdrop-blur-xl border border-white/20 shadow-2xl text-white space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-[#D92525] animate-ping" />
                    <h3 className="font-bold tracking-tight text-base font-serif text-[#E2ECC8]">
                      {t('overviewTitle')}
                    </h3>
                  </div>
                  <span className="text-xs text-white/70 font-mono">{t('overviewTag')}</span>
                </div>

                {/* 4 Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {data.stats?.map((stat: any) => (
                    <div
                      key={stat.id}
                      className="p-4 rounded-2xl bg-white/10 border border-white/10 hover:border-white/25 transition-colors"
                    >
                      <span className="text-xs text-[#E2ECC8]/80 block font-medium">
                        {stat.label}
                      </span>
                      <span className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight block my-1">
                        {stat.value}
                      </span>
                      <span className="text-[11px] text-white/70 block leading-tight truncate">
                        {stat.desc}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-2xl bg-[#E2ECC8]/10 border border-[#E2ECC8]/20 text-xs text-[#E2ECC8] leading-relaxed flex items-start gap-3">
                  <Info className="w-4 h-4 text-[#E2ECC8] shrink-0 mt-0.5" />
                  <p>{t('overviewNote')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          3. 주요 체험 프로그램 섹션 (Programs)
         ========================================== */}
      <section id="programs" className="py-20 lg:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D92525]">
            <Sparkles className="w-4 h-4" />
            <span>{t('programsEyebrow')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-serif tracking-tight text-[#143022]">
            {t('programsTitle')}
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed break-keep">
            {t('programsDesc')}
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.programs?.map((prog: any) => (
            <div
              key={prog.id}
              onClick={() => setSelectedProgram(prog)}
              className="group bg-white rounded-3xl overflow-hidden border border-black/5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer hover:-translate-y-1"
            >
              {/* Image with Tag */}
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                <img
                  src={getSafeImageSrc(prog.image)}
                  onError={handleImgError}
                  alt={prog.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-[#143022]/90 backdrop-blur-sm text-[#E2ECC8] text-[11px] font-bold px-2.5 py-1 rounded-md">
                  {prog.category}
                </div>
                <div
                  className="absolute top-3 right-3 text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-md"
                  style={{ backgroundColor: data.theme?.appleRed || '#D92525' }}
                >
                  {prog.badge}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-bold font-serif text-[#143022] group-hover:text-[#D92525] transition-colors leading-snug">
                    {prog.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {prog.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#D92525] shrink-0" />
                    <span className="truncate">{prog.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#D92525] shrink-0" />
                    <span className="truncate">{prog.place}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="font-bold text-sm text-[#143022]">{prog.price}</span>
                    <span className="text-xs text-[#D92525] font-semibold group-hover:underline flex items-center">
                      {t('programsCardButton')} <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==========================================
          4. 시즌 이벤트 섹션 (Season Event)
         ========================================== */}
      <section id="event" className="py-16 bg-[#E2ECC8]/30 border-y border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-md border border-black/5 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Event Image */}
              <div className="lg:col-span-5 rounded-2xl overflow-hidden aspect-[4/3] bg-slate-100 shadow-inner">
                <img
                  src={getSafeImageSrc(data.event?.image)}
                  onError={handleImgError}
                  alt={data.event?.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Event Information */}
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D92525]/10 text-[#D92525] text-xs font-bold">
                  <Award className="w-4 h-4" />
                  <span>{t('eventEyebrow')}</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold font-serif text-[#143022]">
                  {data.event?.title}
                </h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-light">
                  {data.event?.desc}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs sm:text-sm text-slate-700 pt-2">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="font-bold text-[#143022] block mb-1">{t('eventDateLabel')}</span>
                    <span>{data.event?.date}</span>
                    <span className="block text-slate-500 text-xs">{data.event?.location}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="font-bold text-[#143022] block mb-1">{t('eventTargetLabel')}</span>
                    <span>{data.event?.target}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#F4F7EE] border border-[#E2ECC8] text-xs text-slate-700">
                  <span className="font-bold text-[#D92525] block mb-1">{t('eventAwardsLabel')}</span>
                  <p>{data.event?.awards}</p>
                </div>

                <div className="pt-2 flex flex-wrap gap-3">
                  <button
                    onClick={() => setEventRegisterOpen(true)}
                    className="px-6 py-3 rounded-xl font-bold text-sm text-white shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                    style={{ backgroundColor: data.theme?.appleRed || '#D92525' }}
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>{t('eventRegisterButton')}</span>
                  </button>
                  <button
                    onClick={() => {
                      showToast('📄 그림 그리기 대회 참가 규정 및 도화지 규격이 다운로드되었습니다.');
                    }}
                    className="px-5 py-3 rounded-xl font-medium text-sm text-[#143022] bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>{t('eventDownloadButton')}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          5. 미니게임 섹션 (Mini Games)
         ========================================== */}
      <section id="minigames" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D92525]">
            <Gamepad2 className="w-4 h-4" />
            <span>{t('gamesEyebrow')}</span>
          </div>
          <h2 className="text-3xl font-extrabold font-serif text-[#143022]">
            {t('gamesTitle')}
          </h2>
          <p className="text-slate-600 text-sm">
            {t('gamesDesc')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {data.games?.map((game: any, idx: number) => (
            <div
              key={game.id}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-black/5 shadow-md flex flex-col justify-between space-y-6 hover:shadow-xl transition-shadow"
            >
              <div className="space-y-4">
                <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-slate-100 relative group">
                  <img
                    src={getSafeImageSrc(game.thumbnail)}
                    onError={handleImgError}
                    alt={game.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setActiveGameModal(idx === 0 ? 'game1' : 'game2')}
                      className="px-5 py-2.5 rounded-full bg-white text-[#143022] font-bold text-xs flex items-center gap-2 shadow-lg"
                    >
                      <Play className="w-4 h-4 fill-current text-[#D92525]" />
                      <span>{t('gamesPlayButton')}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold text-[#D92525] block mb-1">
                    {game.subtitle}
                  </span>
                  <h3 className="text-xl font-bold font-serif text-[#143022]">
                    {game.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                    {game.desc}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                <button
                  onClick={() => setActiveGameModal(idx === 0 ? 'game1' : 'game2')}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-sm text-white shadow transition-transform active:scale-95 flex items-center justify-center gap-2"
                  style={{ backgroundColor: data.theme?.forestGreen || '#143022' }}
                >
                  <Play className="w-4 h-4 fill-current text-[#E2ECC8]" />
                  <span>{t('gamesRunButton')}</span>
                </button>
                <a
                  href={game.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  title="새 창에서 열기"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==========================================
          6. 마스코트 캐릭터 소개 섹션 (Characters)
         ========================================== */}
      <section
        id="characters"
        className="py-20 text-white"
        style={{ backgroundColor: data.theme?.forestGreen || '#143022' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#E2ECC8]">
              <Sparkles className="w-4 h-4" />
              <span>{t('charactersEyebrow')}</span>
            </div>
            <h2 className="text-3xl font-extrabold font-serif text-white">
              {t('charactersTitle')}
            </h2>
            <p className="text-[#E2ECC8]/80 text-sm">
              {t('charactersDesc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {data.characters?.map((char: any, i: number) => (
              <div
                key={char.id || i}
                className="p-8 rounded-3xl bg-white/10 backdrop-blur-md border border-white/15 flex flex-col sm:flex-row items-center gap-6 hover:bg-white/15 transition-colors"
              >
                <div className="w-36 h-36 rounded-2xl overflow-hidden bg-white/20 shrink-0 border-2 border-[#E2ECC8]/30 shadow-lg">
                  <img
                    src={getSafeImageSrc(char.image)}
                    onError={handleImgError}
                    alt={char.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-3 text-center sm:text-left flex-1">
                  <div className="inline-block px-2.5 py-0.5 rounded bg-[#D92525] text-white text-[11px] font-bold">
                    {char.role}
                  </div>
                  <h3 className="text-2xl font-bold font-serif text-[#E2ECC8]">
                    {char.name}
                  </h3>
                  <p className="text-xs text-white/80 font-medium italic">
                    "{char.personality}"
                  </p>
                  <p className="text-xs text-[#F4F7EE]/90 leading-relaxed font-light">
                    {char.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==========================================
          7. 공지사항 & 포토 갤러리 섹션 (Notices & Gallery)
         ========================================== */}
      <section id="notices" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* Notice List */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D92525]">
                <Info className="w-4 h-4" />
                <span>{t('noticesEyebrow')}</span>
              </div>
              <h2 className="text-3xl font-extrabold font-serif text-[#143022]">
                {t('noticesTitle')}
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              총 {data.notices?.length || 0}건의 안내사항
            </span>
          </div>

          <div className="bg-white rounded-3xl border border-black/5 divide-y divide-slate-100 shadow-sm overflow-hidden">
            {data.notices?.map((n: any) => (
              <div
                key={n.id}
                onClick={() => setSelectedNotice(n)}
                className="p-5 sm:p-6 hover:bg-slate-50 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 text-xs">
                    {n.pinned && (
                      <span className="px-2 py-0.5 rounded bg-[#D92525] text-white font-bold text-[10px]">
                        {t('noticesPinned')}
                      </span>
                    )}
                    <span className="text-slate-500 font-semibold">{n.category}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-400 font-mono">{n.date}</span>
                  </div>
                  <h4 className="text-base font-bold text-slate-800 group-hover:text-[#D92525] transition-colors leading-snug">
                    {n.title}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-1">{n.content}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#D92525] group-hover:translate-x-1 transition-transform shrink-0 hidden sm:block" />
              </div>
            ))}
          </div>
        </div>

        {/* Photo Gallery Grid */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D92525]">
              <ImageIcon className="w-4 h-4" />
              <span>{t('galleryEyebrow')}</span>
            </div>
            <h2 className="text-3xl font-extrabold font-serif text-[#143022]">
              {t('galleryTitle')}
            </h2>
            <p className="text-slate-600 text-sm">
              {t('galleryDesc')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.gallery?.map((gal: any) => (
              <div
                key={gal.id}
                onClick={() => setSelectedGallery(gal)}
                className="group relative rounded-3xl overflow-hidden aspect-[4/3] bg-slate-200 cursor-pointer shadow hover:shadow-xl transition-all"
              >
                <img
                  src={getSafeImageSrc(gal.image)}
                  onError={handleImgError}
                  alt={gal.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-80 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-5 text-white">
                  <span className="text-[11px] font-semibold text-[#E2ECC8]">
                    {gal.category} · {gal.date}
                  </span>
                  <h4 className="text-sm font-bold font-serif leading-snug mt-1 group-hover:text-[#E2ECC8] transition-colors">
                    {gal.title}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==========================================
          8. 문의하기 섹션 (Contact Us with Formspree)
         ========================================== */}
      <section id="contact" className="py-20 bg-white border-t border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Contact Info Column */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D92525]">
                <MessageSquare className="w-4 h-4" />
                <span>{t('contactEyebrow')}</span>
              </div>
              <h2 className="text-3xl font-extrabold font-serif text-[#143022]">
                {t('contactTitle')}
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                {t('contactDesc')}
              </p>

              {/* Formspree Connection Card */}
              <div className="p-4 rounded-2xl bg-[#F4F7EE] border border-[#E2ECC8] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#143022] flex items-center gap-1.5">
                    <CheckCheck className="w-4 h-4 text-emerald-600" />
                    <span>{t('contactLiveLabel')}</span>
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-100 text-emerald-800 font-bold">
                    ONLINE
                  </span>
                </div>
                <p className="text-slate-500 text-[11px] break-all">
                  작성하신 문의 내용은 <strong>{data.formspree?.endpoint || DEFAULT_FORMSPREE_ENDPOINT}</strong> 를 통해 실시간 전달됩니다.
                </p>
              </div>

              <div className="space-y-4 pt-2 text-xs sm:text-sm text-slate-700">
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <Phone className="w-5 h-5 text-[#D92525] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#143022] block">{t('contactPhoneLabel')}</span>
                    <span className="text-base font-extrabold text-[#D92525] font-mono">
                      {data.footer?.phone || '054-870-6205'}
                    </span>
                    <span className="block text-xs text-slate-400 mt-0.5">
                      {t('contactPhoneHours')}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <MapPin className="w-5 h-5 text-[#D92525] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#143022] block">{t('contactAddressLabel')}</span>
                    <span>{data.footer?.address}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Online Inquiry Form */}
            <div className="lg:col-span-7 bg-[#F4F7EE] p-6 sm:p-8 rounded-3xl border border-[#E2ECC8]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold font-serif text-[#143022] flex items-center gap-2">
                  <Send className="w-4 h-4 text-[#D92525]" />
                  <span>{t('contactFormTitle')}</span>
                </h3>
                <span className="text-[11px] text-slate-500 font-mono">
                  Formspree 자동 연동
                </span>
              </div>

              <form onSubmit={handleContactSubmit} className="space-y-4 text-xs sm:text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      성함 / 단체명 <span className="text-[#D92525]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="홍길동"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#143022] text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      연락처 (휴대폰) <span className="text-[#D92525]">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="010-0000-0000"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#143022] text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      이메일 주소
                    </label>
                    <input
                      type="email"
                      placeholder="example@cheongsong.go.kr"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#143022] text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      문의 분류
                    </label>
                    <select
                      value={contactForm.type}
                      onChange={(e) => setContactForm({ ...contactForm, type: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#143022] text-slate-800"
                    >
                      <option value="체험 프로그램 예약 문의">체험 프로그램 예약 문의</option>
                      <option value="셔틀버스 및 주차 문의">셔틀버스 및 주차 문의</option>
                      <option value="못난이 사과 직판 택배 문의">못난이 사과 직판 택배 문의</option>
                      <option value="부스 참가 및 농가 신청">부스 참가 및 농가 신청</option>
                      <option value="축제 자원봉사 문의">축제 자원봉사 문의</option>
                      <option value="기타 제안 및 의견">기타 제안 및 의견</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    문의 내용 <span className="text-[#D92525]">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="축제 프로그램 참가 인원, 일정 등 구체적인 내용을 작성해주시면 Formspree를 통해 빠른 안내를 드립니다."
                    value={contactForm.content}
                    onChange={(e) => setContactForm({ ...contactForm, content: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#143022] text-slate-800 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingContact}
                  className="w-full py-3.5 rounded-xl text-white font-bold text-sm shadow-md transition-all hover:brightness-110 active:scale-95 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ backgroundColor: data.theme?.forestGreen || '#143022' }}
                >
                  {isSubmittingContact ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-[#E2ECC8]" />
                      <span>Formspree 전송 중...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-[#E2ECC8]" />
                      <span>{t('contactSubmitButton')}</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          9. 푸터 (Footer)
         ========================================== */}
      <footer
        className="py-14 text-white border-t border-black/10"
        style={{ backgroundColor: data.theme?.forestGreen || '#143022' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-white/10">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🍎</span>
              <div>
                <h3 className="text-lg font-bold font-serif text-white">{t('footerTitle')}</h3>
                <p className="text-xs text-[#E2ECC8]/80">{data.footer?.organizer}</p>
              </div>
            </div>

            {/* Social Links & Alert Trigger */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <button
                onClick={() => setQuickAlertOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-[#D92525] hover:brightness-110 text-white font-bold transition-all flex items-center gap-1.5"
              >
                <BellRing className="w-3.5 h-3.5" />
                <span>{t('alertButton')}</span>
              </button>
              <button
                onClick={() => showToast('📸 청송사과축제 인스타그램 공식 계정으로 연결됩니다.')}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#E2ECC8] transition-colors"
              >
                Instagram
              </button>
              <button
                onClick={() => showToast('📺 청송사과축제 유튜브 공식 채널로 연결됩니다.')}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#E2ECC8] transition-colors"
              >
                YouTube
              </button>
              <button
                onClick={() => showToast('💬 청송군 카카오톡 채널로 연결됩니다.')}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#E2ECC8] transition-colors"
              >
                KakaoTalk
              </button>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="p-2 rounded-lg bg-[#D92525] text-white hover:brightness-110 transition-all ml-2"
                title="맨 위로 가기"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-white/60 font-light">
            <div className="space-y-1">
              <p>{data.footer?.address}</p>
              <p>대표전화: {data.footer?.phone} | 이메일: {data.footer?.email}</p>
            </div>
            <div className="text-right space-y-1">
              <p className="font-mono text-white/40">{data.footer?.copyright}</p>
              <p className="text-[11px] text-[#E2ECC8]/60 font-mono">
                Formspree endpoint: {data.formspree?.endpoint || DEFAULT_FORMSPREE_ENDPOINT}
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* ==========================================
          MODALS & OVERLAYS
         ========================================== */}

      {/* Program Detail & Reservation Modal (with Formspree) */}
      {selectedProgram && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-black/10 animate-in fade-in zoom-in-95 duration-200 my-8">
            <div className="relative aspect-[16/9] bg-slate-100">
              <img
                src={getSafeImageSrc(selectedProgram.image)}
                onError={handleImgError}
                alt={selectedProgram.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedProgram(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3 left-3 bg-[#143022] text-[#E2ECC8] text-xs font-bold px-3 py-1 rounded-md">
                {selectedProgram.category}
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <span className="text-xs font-bold text-[#D92525]">{selectedProgram.badge}</span>
                <h3 className="text-xl font-bold font-serif text-[#143022] mt-0.5">
                  {selectedProgram.title}
                </h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{selectedProgram.desc}</p>
              
              <div className="bg-slate-50 p-4 rounded-2xl space-y-2 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-400">운영 일시</span>
                  <span className="font-semibold">{selectedProgram.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">체험 장소</span>
                  <span className="font-semibold">{selectedProgram.place}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200">
                  <span className="text-slate-400">체험비</span>
                  <span className="font-bold text-[#D92525]">{selectedProgram.price}</span>
                </div>
              </div>

              {/* Quick Reservation Form in Modal */}
              <form onSubmit={handleBookingSubmit} className="pt-2 border-t border-slate-100 space-y-3">
                <span className="text-xs font-bold text-[#143022] block">
                  🍎 실시간 사전 예약 접수 (Formspree 자동 전달)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="예약자 성함"
                    value={bookingForm.name}
                    onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                    className="p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="휴대폰 번호"
                    value={bookingForm.phone}
                    onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                    className="p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={bookingForm.date}
                    onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                    className="p-2 rounded-xl border border-slate-200 text-xs text-slate-700"
                  >
                    <option value="2026-10-30">10월 30일 (금)</option>
                    <option value="2026-10-31">10월 31일 (토)</option>
                    <option value="2026-11-01">11월 01일 (일)</option>
                    <option value="2026-11-02">11월 02일 (월)</option>
                    <option value="2026-11-03">11월 03일 (화)</option>
                  </select>
                  <select
                    value={bookingForm.timeSlot}
                    onChange={(e) => setBookingForm({ ...bookingForm, timeSlot: e.target.value })}
                    className="p-2 rounded-xl border border-slate-200 text-xs text-slate-700"
                  >
                    <option value="10:00">10:00 (오전)</option>
                    <option value="11:30">11:30</option>
                    <option value="14:00">14:00 (오후)</option>
                    <option value="15:30">15:30</option>
                    <option value="16:30">16:30 (석양)</option>
                  </select>
                  <select
                    value={bookingForm.guests}
                    onChange={(e) => setBookingForm({ ...bookingForm, guests: e.target.value })}
                    className="p-2 rounded-xl border border-slate-200 text-xs text-slate-700"
                  >
                    <option value="1">1명</option>
                    <option value="2">2명</option>
                    <option value="3">3명</option>
                    <option value="4">4명 (가족)</option>
                    <option value="5인이상">5인 이상 단체</option>
                  </select>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="submit"
                    disabled={isSubmittingBooking}
                    className="flex-1 py-3 rounded-xl bg-[#143022] text-white font-bold text-sm shadow hover:brightness-110 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmittingBooking ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-[#E2ECC8]" />
                        <span>예약 접수 중...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 text-[#E2ECC8]" />
                        <span>사전 예약 제출하기</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedProgram(null)}
                    className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm"
                  >
                    닫기
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Event Registration Modal (with Formspree) */}
      {eventRegisterOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-black/10 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#D92525]" />
                <h3 className="text-lg font-bold font-serif text-[#143022]">
                  {t('eventModalTitle')}
                </h3>
              </div>
              <button
                onClick={() => setEventRegisterOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEventSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  참가 어린이 성함 <span className="text-[#D92525]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: 김사과"
                  value={eventForm.childName}
                  onChange={(e) => setEventForm({ ...eventForm, childName: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">참가 부문</label>
                  <select
                    value={eventForm.ageGroup}
                    onChange={(e) => setEventForm({ ...eventForm, ageGroup: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 text-slate-800"
                  >
                    <option value="유치부 (5~7세)">유치부 (5~7세)</option>
                    <option value="초등 저학년부 (1~3학년)">초등 저학년부 (1~3학년)</option>
                    <option value="초등 고학년부 (4~6학년)">초등 고학년부 (4~6학년)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">보호자 성함</label>
                  <input
                    type="text"
                    placeholder="예: 김청송"
                    value={eventForm.guardianName}
                    onChange={(e) => setEventForm({ ...eventForm, guardianName: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    보호자 연락처 <span className="text-[#D92525]">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="010-0000-0000"
                    value={eventForm.guardianPhone}
                    onChange={(e) => setEventForm({ ...eventForm, guardianPhone: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">거주 지역 / 소속</label>
                  <input
                    type="text"
                    placeholder="예: 서울 강남구 / OO초"
                    value={eventForm.region}
                    onChange={(e) => setEventForm({ ...eventForm, region: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">기타 요청사항</label>
                <input
                  type="text"
                  placeholder="알레르기나 편의사항 등"
                  value={eventForm.notes}
                  onChange={(e) => setEventForm({ ...eventForm, notes: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 text-slate-800"
                />
              </div>

              <p className="text-[11px] text-slate-400">
                {t('eventModalNote')}
              </p>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingEvent}
                  className="flex-1 py-3 rounded-xl bg-[#D92525] text-white font-bold text-sm shadow hover:brightness-110 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmittingEvent ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Formspree 전송 중...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>참가 신청서 제출하기</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setEventRegisterOpen(false)}
                  className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Apple Harvest Alert Modal (with Formspree) */}
      {quickAlertOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-black/10 space-y-4 animate-in fade-in zoom-in-95 duration-200 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#D92525] text-white flex items-center justify-center mx-auto text-2xl">
              🍎
            </div>
            <div>
              <h3 className="text-lg font-bold font-serif text-[#143022]">
                {t('alertModalTitle')}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {t('alertModalDesc')}
              </p>
            </div>

            <form onSubmit={handleQuickAlertSubmit} className="space-y-3 text-left text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">성함</label>
                <input
                  type="text"
                  placeholder="홍길동"
                  value={quickAlertName}
                  onChange={(e) => setQuickAlertName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  휴대폰 번호 <span className="text-[#D92525]">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="010-0000-0000"
                  value={quickAlertPhone}
                  onChange={(e) => setQuickAlertPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  disabled={isSubmittingQuickAlert}
                  className="flex-1 py-3 rounded-xl bg-[#143022] text-white font-bold text-xs shadow hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isSubmittingQuickAlert ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>수집 중...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#E2ECC8]" />
                      <span>무료 알림 신청</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setQuickAlertOpen(false)}
                  className="px-4 py-3 rounded-xl bg-slate-100 text-slate-600 font-semibold text-xs hover:bg-slate-200"
                >
                  닫기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notice Detail Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-black/10 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded bg-[#143022] text-[#E2ECC8] text-xs font-bold">
                {selectedNotice.category}
              </span>
              <button
                onClick={() => setSelectedNotice(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div>
              <span className="text-xs text-slate-400 font-mono block mb-1">
                {selectedNotice.date}
              </span>
              <h3 className="text-xl font-bold font-serif text-[#143022] leading-snug">
                {selectedNotice.title}
              </h3>
            </div>
            <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-5 rounded-2xl border border-slate-100">
              {selectedNotice.content}
            </div>
            <button
              onClick={() => setSelectedNotice(null)}
              className="w-full py-3 rounded-xl bg-[#143022] text-white font-bold text-sm shadow hover:brightness-110"
            >
              {t('noticeConfirmButton')}
            </button>
          </div>
        </div>
      )}

      {/* Gallery Lightbox Modal */}
      {selectedGallery && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-3xl w-full space-y-4">
            <div className="flex items-center justify-between text-white">
              <div>
                <span className="text-xs text-[#E2ECC8] font-bold">
                  {selectedGallery.category} · {selectedGallery.date}
                </span>
                <h4 className="text-lg font-bold font-serif">{selectedGallery.title}</h4>
              </div>
              <button
                onClick={() => setSelectedGallery(null)}
                className="p-2 rounded-full bg-white/20 text-white hover:bg-white/40"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-black shadow-2xl">
              <img
                src={getSafeImageSrc(selectedGallery.image)}
                onError={handleImgError}
                alt={selectedGallery.title}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Shuttle & Parking Information Modal */}
      {shuttleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-black/10 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#D92525] text-white">
                  <Bus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-serif text-[#143022]">
                    {t('shuttleTitle')}
                  </h3>
                  <p className="text-xs text-slate-500">{t('shuttleSubtitle')}</p>
                </div>
              </div>
              <button
                onClick={() => setShuttleModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-700">
              <div className="p-4 rounded-2xl bg-[#F4F7EE] border border-[#E2ECC8] space-y-2">
                <span className="font-bold text-[#143022] block">{t('shuttleParkingTitle')}</span>
                <ul className="space-y-1 text-slate-600 pl-4 list-disc">
                  {t('shuttleParking')
                    .split('\n')
                    .filter((line) => line.trim())
                    .map((line, i) => {
                      const sep = line.indexOf(':');
                      return (
                        <li key={i}>
                          {sep > 0 ? (
                            <>
                              <strong>{line.slice(0, sep + 1)}</strong>
                              {line.slice(sep + 1)}
                            </>
                          ) : (
                            line
                          )}
                        </li>
                      );
                    })}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-[#143022] block">{t('shuttleBusTitle')}</span>
                <p className="text-slate-600">
                  <strong>운행 시간:</strong> {t('shuttleHours')}
                </p>
                <p className="text-slate-600">
                  <strong>순환 노선:</strong> {t('shuttleRoute')}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShuttleModalOpen(false)}
              className="w-full py-3 rounded-xl bg-[#143022] text-white font-bold text-sm shadow hover:brightness-110"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-black/10 space-y-5 animate-in fade-in zoom-in-95 duration-200 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#E2ECC8] text-[#143022] flex items-center justify-center mx-auto">
              <Share2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-serif text-[#143022]">축제 소식 공유하기</h3>
              <p className="text-xs text-slate-500 mt-1">친구와 가족들에게 축제 일정을 알려보세요!</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => {
                  showToast('카카오톡 공유창이 호출되었습니다.');
                  setShareModalOpen(false);
                }}
                className="p-3 rounded-xl bg-[#FEE500] text-[#3c1e1e] font-bold text-xs hover:brightness-95 flex flex-col items-center gap-1"
              >
                <span>💬</span>
                <span>카카오톡</span>
              </button>
              <button
                onClick={() => {
                  showToast('페이스북 공유 링크가 복사되었습니다.');
                  setShareModalOpen(false);
                }}
                className="p-3 rounded-xl bg-[#1877F2] text-white font-bold text-xs hover:brightness-95 flex flex-col items-center gap-1"
              >
                <span>📘</span>
                <span>페이스북</span>
              </button>
              <button
                onClick={copyUrlToClipboard}
                className="p-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 flex flex-col items-center gap-1"
              >
                <Copy className="w-4 h-4" />
                <span>링크 복사</span>
              </button>
            </div>
            <button
              onClick={() => setShareModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-600 font-semibold text-xs hover:bg-slate-200"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* Mini Game 1 Modal: 사과 서리꾼 피하기 Game */}
      {activeGameModal === 'game1' && (
        <MiniGameOneModal onClose={() => setActiveGameModal(null)} onShowToast={showToast} />
      )}

      {/* Mini Game 2 Modal: 청송 백자 빚기 Game */}
      {activeGameModal === 'game2' && (
        <MiniGameTwoModal onClose={() => setActiveGameModal(null)} onShowToast={showToast} />
      )}

      {/* ==========================================
          10. 관리자 모드 대시보드 (12 TABS FULLSCREEN MODAL)
         ========================================== */}
      {adminLoginOpen && (
        <AdminLoginModal
          onLogin={async (pw) => {
            await openAdmin(pw);
            setAdminLoginOpen(false);
          }}
          onClose={() => setAdminLoginOpen(false)}
        />
      )}

      {isAdminOpen && adminPassword && (
        <AdminDashboardModal
          data={data}
          inquiries={adminInquiries}
          password={adminPassword}
          onSaved={(saved, savedInquiries) => {
            setData(normalizeData(saved));
            setAdminInquiries(savedInquiries);
          }}
          onAuthExpired={() => {
            setAdminPassword(null);
            setIsAdminOpen(false);
            setAdminLoginOpen(true);
          }}
          onClose={() => setIsAdminOpen(false)}
          onShowToast={showToast}
        />
      )}
    </div>
  );
}

// ==========================================
// 4. MINI GAME 1: 사과 서리꾼 피하기
// ==========================================
function MiniGameOneModal({
  onClose,
  onShowToast,
}: {
  onClose: () => void;
  onShowToast: (msg: string) => void;
}) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(25);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [basketPos, setBasketPos] = useState(50); // percentage 0-100
  const [items, setItems] = useState<Array<{ id: number; x: number; y: number; isBomb: boolean }>>(
    []
  );

  const startGame = () => {
    setScore(0);
    setTimeLeft(25);
    setItems([]);
    setGameOver(false);
    setIsPlaying(true);
  };

  // Timer countdown
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsPlaying(false);
          setGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying]);

  // Spawn and fall loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setItems((prev) => [
        ...prev,
        {
          id: Math.random(),
          x: Math.floor(Math.random() * 85) + 5,
          y: 0,
          isBomb: Math.random() < 0.28,
        },
      ]);
    }, 700);

    const fallInterval = setInterval(() => {
      setItems((prev) => {
        const next: typeof prev = [];
        for (const item of prev) {
          const newY = item.y + 4;
          if (newY >= 75 && newY <= 90 && Math.abs(item.x - basketPos) < 14) {
            if (item.isBomb) {
              setScore((s) => Math.max(0, s - 30));
            } else {
              setScore((s) => s + 20);
            }
            continue;
          }
          if (newY < 100) {
            next.push({ ...item, y: newY });
          }
        }
        return next;
      });
    }, 50);

    return () => {
      clearInterval(interval);
      clearInterval(fallInterval);
    };
  }, [isPlaying, basketPos]);

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#143022] text-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E2ECC8]/20 flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-[#E2ECC8]" />
            <h3 className="font-bold font-serif text-lg text-[#E2ECC8]">
              사과 서리꾼 걸신 피하기
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full bg-white/10 hover:bg-white/20">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Game Stats Bar */}
        <div className="flex items-center justify-between bg-black/30 px-4 py-2 rounded-xl text-xs font-mono">
          <span>남은 시간: <strong className="text-[#E2ECC8] text-sm">{timeLeft}s</strong></span>
          <span>현재 점수: <strong className="text-[#D92525] text-base">{score}점</strong></span>
        </div>

        {/* Game Canvas Area */}
        <div
          className="relative h-72 rounded-2xl bg-gradient-to-b from-[#1c4330] to-[#12281c] border border-white/10 overflow-hidden select-none cursor-crosshair"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            setBasketPos(Math.min(90, Math.max(10, x)));
          }}
          onTouchMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const touch = e.touches[0];
            const x = ((touch.clientX - rect.left) / rect.width) * 100;
            setBasketPos(Math.min(90, Math.max(10, x)));
          }}
        >
          {!isPlaying && !gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 bg-black/50 p-6 text-center">
              <span className="text-4xl">🍎 🧺</span>
              <p className="text-xs text-[#E2ECC8] max-w-xs leading-relaxed">
                마우스나 터치로 바구니를 좌우로 움직여 떨어지는 <strong>빨간 사과(+20점)</strong>를 받고,
                <strong>까마귀/썩은사과(-30점)</strong>를 피하세요!
              </p>
              <button
                onClick={startGame}
                className="px-6 py-2.5 rounded-xl bg-[#D92525] text-white font-bold text-sm shadow hover:brightness-110 active:scale-95"
              >
                게임 시작하기
              </button>
            </div>
          )}

          {gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 bg-black/70 p-6 text-center animate-in fade-in">
              <span className="text-3xl">🎉</span>
              <h4 className="text-lg font-bold font-serif text-[#E2ECC8]">게임 종료!</h4>
              <p className="text-2xl font-black font-mono text-[#D92525]">{score}점 달성</p>
              <p className="text-xs text-white/80">
                {score >= 200
                  ? '🏅 축하합니다! 청송 꿀사과 수확 명인 등급입니다.'
                  : '👍 조금만 더 연습하면 황금사과를 얻을 수 있어요!'}
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={startGame}
                  className="px-5 py-2 rounded-xl bg-[#D92525] text-white font-bold text-xs shadow"
                >
                  다시 플레이
                </button>
                <button
                  onClick={() => {
                    onShowToast(`🍎 ${score}점 기록이 축제 랭킹에 등록되었습니다!`);
                    onClose();
                  }}
                  className="px-4 py-2 rounded-xl bg-white/20 text-white font-semibold text-xs"
                >
                  기록 저장
                </button>
              </div>
            </div>
          )}

          {/* Falling items */}
          {items.map((item) => (
            <div
              key={item.id}
              className="absolute text-xl pointer-events-none transform -translate-x-1/2 -translate-y-1/2 transition-transform"
              style={{ left: `${item.x}%`, top: `${item.y}%` }}
            >
              {item.isBomb ? '🦅' : '🍎'}
            </div>
          ))}

          {/* Basket Player */}
          <div
            className="absolute bottom-3 transform -translate-x-1/2 text-2xl pointer-events-none transition-all duration-75"
            style={{ left: `${basketPos}%` }}
          >
            🧺
          </div>
        </div>

        <p className="text-[11px] text-white/50 text-center">
          마우스를 좌우로 문지르거나 모바일에서 화면을 터치하여 바구니를 이동하세요.
        </p>
      </div>
    </div>
  );
}

// ==========================================
// 5. MINI GAME 2: 청송 백자 사과 빚기 장인 게임
// ==========================================
function MiniGameTwoModal({
  onClose,
  onShowToast,
}: {
  onClose: () => void;
  onShowToast: (msg: string) => void;
}) {
  const [progress, setProgress] = useState(15);
  const [smoothing, setSmoothing] = useState(20);
  const [isFinished, setIsFinished] = useState(false);

  const handleClayTouch = () => {
    if (isFinished) return;
    setProgress((p) => Math.min(100, p + 9));
    setSmoothing((s) => Math.min(100, s + (Math.random() > 0.4 ? 11 : 6)));
    if (progress >= 90 && smoothing >= 85) {
      setIsFinished(true);
    }
  };

  const handleReset = () => {
    setProgress(15);
    setSmoothing(20);
    setIsFinished(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#143022] text-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E2ECC8]/20 flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#E2ECC8]" />
            <h3 className="font-bold font-serif text-lg text-[#E2ECC8]">
              청송 백자 사과 빚기 장인
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full bg-white/10 hover:bg-white/20">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pottery Simulation Wheel */}
        <div className="relative h-64 rounded-2xl bg-[#0e2117] border border-white/10 flex flex-col items-center justify-center overflow-hidden">
          <div
            onClick={handleClayTouch}
            className="cursor-pointer group flex flex-col items-center justify-center transition-transform active:scale-95 select-none"
          >
            <div
              className="w-28 rounded-full border-4 border-[#E2ECC8] shadow-2xl flex items-center justify-center transition-all duration-300 relative"
              style={{
                height: `${70 + progress * 0.7}px`,
                backgroundColor: '#FAF8F5',
                borderRadius: `${smoothing}% ${smoothing}% 35% 35%`,
              }}
            >
              <span className="text-3xl animate-bounce">🍎</span>
              <div className="absolute inset-0 rounded-full border-t border-b border-black/10 animate-spin" />
            </div>

            <div className="w-44 h-5 rounded-full bg-[#3d2c1d] mt-2 shadow-lg border border-[#5a422d]" />
          </div>

          <span className="text-xs text-[#E2ECC8]/70 mt-3">
            점토를 클릭하거나 탭하여 형태를 잡고 표면을 다듬으세요!
          </span>
        </div>

        {/* Meters */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-black/20 border border-white/10">
            <div className="flex justify-between mb-1">
              <span>도형 완성도</span>
              <span className="font-mono text-[#E2ECC8]">{progress}%</span>
            </div>
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#D92525] h-full transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <div className="p-3 rounded-xl bg-black/20 border border-white/10">
            <div className="flex justify-between mb-1">
              <span>백자 유약 매끄러움</span>
              <span className="font-mono text-[#E2ECC8]">{smoothing}%</span>
            </div>
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#E2ECC8] h-full transition-all duration-200"
                style={{ width: `${smoothing}%` }}
              />
            </div>
          </div>
        </div>

        {isFinished ? (
          <div className="p-4 rounded-xl bg-[#E2ECC8]/15 border border-[#E2ECC8] text-center space-y-2 animate-in fade-in">
            <p className="font-bold text-sm text-[#E2ECC8]">
              🍶 명품 청송백자 사과잔이 완성되었습니다!
            </p>
            <p className="text-xs text-white/80">
              축제 현장 도예 부스에 방문하시면 실제 흙으로 나만의 사과잔을 빚을 수 있습니다.
            </p>
            <div className="flex gap-2 justify-center pt-1">
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-lg bg-white/10 text-xs font-semibold"
              >
                새로 빚기
              </button>
              <button
                onClick={() => {
                  onShowToast('🏺 완성된 청송백자 작품이 도록에 저장되었습니다!');
                  onClose();
                }}
                className="px-4 py-2 rounded-lg bg-[#D92525] text-xs font-bold shadow"
              >
                완성 완료
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleClayTouch}
            className="w-full py-3 rounded-xl bg-[#E2ECC8] text-[#143022] font-bold text-sm shadow hover:brightness-105 active:scale-95"
          >
            물레 돌려 매만지기 (+터치)
          </button>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 6. ADMIN DASHBOARD MODAL (12 TABS + FORMSPREE MANAGER)
// ==========================================
function AdminLoginModal({ onLogin, onClose }: { onLogin: (password: string) => Promise<void>; onClose: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setBusy(true);
    setError('');
    try {
      await onLogin(password);
    } catch (err) {
      setError((err as Error).message || '로그인에 실패했습니다.');
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <form onSubmit={submit} className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold font-serif text-[#143022] flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#D92525]" />
            관리자 로그인
          </h3>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-slate-500">사이트를 수정하려면 관리자 비밀번호를 입력해주세요.</p>
        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="관리자 비밀번호"
          className="w-full p-3 rounded-xl border border-slate-200 text-sm"
        />
        {error && <p className="text-xs text-rose-600 font-semibold">{error}</p>}
        <button
          type="submit"
          disabled={busy || !password}
          className="w-full py-3 rounded-xl bg-[#D92525] hover:brightness-110 text-white font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {busy && <RefreshCw className="w-4 h-4 animate-spin" />}
          <span>{busy ? '확인 중...' : '관리자 모드 열기'}</span>
        </button>
      </form>
    </div>
  );
}

function AdminDashboardModal({
  data,
  inquiries,
  password,
  onSaved,
  onAuthExpired,
  onClose,
  onShowToast,
}: {
  data: typeof DEFAULT_DATA;
  inquiries: any[];
  password: string;
  onSaved: (saved: typeof DEFAULT_DATA, inquiries: any[]) => void;
  onAuthExpired: () => void;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [formData, setFormData] = useState<typeof DEFAULT_DATA>(() => {
    const copy = JSON.parse(JSON.stringify(data));
    copy.texts = { ...DEFAULT_TEXTS, ...copy.texts };
    copy.inquiries = JSON.parse(JSON.stringify(inquiries));
    return copy;
  });
  const [isTestingFormspree, setIsTestingFormspree] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  // Snapshot of what is stored on the server, to detect unsaved edits and deleted inquiries
  const savedSnapshot = useRef(JSON.stringify(formData));
  const savedInquiryIds = useRef<string[]>(inquiries.map((i) => i.id));
  const isSaving = saveStatus !== null;

  const tabs = [
    { id: 0, label: '히어로 카피', icon: Type },
    { id: 1, label: '행사 개요', icon: Sliders },
    { id: 2, label: '프로그램 리스트', icon: LayoutGrid },
    { id: 3, label: '이벤트 대회', icon: Award },
    { id: 4, label: '미니게임', icon: Gamepad2 },
    { id: 5, label: '캐릭터', icon: Sparkles },
    { id: 6, label: '공지사항', icon: Info },
    { id: 7, label: '접수된 문의 & Formspree', icon: MessageSquare },
    { id: 8, label: '갤러리', icon: ImageIcon },
    { id: 9, label: '푸터 정보', icon: Phone },
    { id: 10, label: '디자인 & 색상', icon: Palette },
    { id: 11, label: 'SEO 메타', icon: Globe },
    { id: 12, label: '사이트 문구 (전체)', icon: Edit3 },
  ];

  // Success is only reported after the server confirms it stored the exact content
  const handleSaveAll = async () => {
    if (isSaving) return;
    const snapshot = formData;
    try {
      setSaveStatus('이미지 확인 중...');
      const withUrls = await uploadEmbeddedImages(snapshot, password, (done, total) =>
        setSaveStatus(`이미지 업로드 중 (${done}/${total})...`)
      );
      setSaveStatus('서버에 저장 중...');
      const currentInquiries = withUrls.inquiries || [];
      const currentIds = new Set(currentInquiries.map((i: any) => i.id));
      const deletedIds = savedInquiryIds.current.filter((id) => !currentIds.has(id));
      const saved = await saveSiteContent(withUrls, currentInquiries, deletedIds, password);

      const next = { ...JSON.parse(JSON.stringify(saved)), inquiries: currentInquiries };
      // Keep edits made while the save was in flight; only swap uploaded image data for URLs
      setFormData((latest) => (latest === snapshot ? next : latest));
      savedSnapshot.current = JSON.stringify(next);
      savedInquiryIds.current = currentInquiries.map((i: any) => i.id);
      onSaved(saved as typeof DEFAULT_DATA, currentInquiries);
      onShowToast('💾 모든 변경 사항이 서버에 저장되어 모든 방문자에게 반영되었습니다!');
    } catch (e) {
      if (e instanceof AuthError) {
        onShowToast('⚠️ 관리자 비밀번호가 변경되었거나 올바르지 않습니다. 다시 로그인해주세요.');
        onAuthExpired();
        return;
      }
      onShowToast('⚠️ 저장 실패: ' + ((e as Error).message || '알 수 없는 오류') + ' (수정 내용은 화면에 그대로 남아 있습니다)');
    } finally {
      setSaveStatus(null);
    }
  };

  const hasUnsavedChanges = () => JSON.stringify(formData) !== savedSnapshot.current;

  const handleClose = () => {
    if (isSaving) return;
    if (hasUnsavedChanges() && !confirm('저장하지 않은 변경 사항이 있습니다. 저장하지 않고 닫으시겠습니까?')) return;
    onClose();
  };

  // Only fills the form; nothing is overwritten on the server until 저장하기 is pressed
  const handleResetToDefault = () => {
    if (confirm('편집 화면의 모든 설정을 초기 데이터로 되돌리시겠습니까?\n(접수된 문의는 유지되며, [저장하기]를 눌러야 실제 사이트에 반영됩니다.)')) {
      setFormData({ ...JSON.parse(JSON.stringify(DEFAULT_DATA)), inquiries: formData.inquiries });
      onShowToast('🔄 초기 데이터를 불러왔습니다. 저장하기를 눌러야 사이트에 반영됩니다.');
    }
  };

  // Test send to Formspree endpoint
  const handleTestFormspree = async () => {
    setIsTestingFormspree(true);
    const endpoint = formData.formspree?.endpoint || DEFAULT_FORMSPREE_ENDPOINT;
    const testPayload = {
      _subject: '[Formspree 연동 테스트] 청송 못난이 사과 축제 관리자 테스트 핑',
      test: true,
      sender: '축제 관리자 대시보드',
      timestamp: new Date().toISOString(),
      message: '축제 웹사이트와 Formspree.io 수집 엔드포인트 간 연결이 정상적으로 작동합니다.',
    };

    const res = await submitToFormspree(endpoint, testPayload);
    setIsTestingFormspree(false);

    if (res.success) {
      onShowToast('✅ Formspree.io로 테스트 데이터가 전송되었습니다. 대시보드를 확인하세요!');
    } else {
      onShowToast('⚠️ Formspree 전송 응답: ' + (res.message || '확인 필요'));
    }
  };

  // Export JSON helper
  const handleExportJSON = () => {
    const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(formData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonStr);
    downloadAnchor.setAttribute('download', `cheongsong_apple_fest_config_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 overflow-hidden">
      <div className="bg-white rounded-3xl w-full max-w-6xl h-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-black/10">
        {/* Admin Header */}
        <div className="px-6 py-4 bg-[#143022] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#D92525] flex items-center justify-center font-bold text-lg">
              🍎
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif tracking-tight text-white flex items-center gap-2">
                <span>축제 웹사이트 통합 관리자 대시보드</span>
                <span className="text-[10px] font-mono font-bold bg-[#E2ECC8] text-[#143022] px-2 py-0.5 rounded">
                  v4.1 + Formspree
                </span>
              </h2>
              <p className="text-xs text-[#E2ECC8]/80 font-light">
                실시간 텍스트, 이미지 파일 업로드, Formspree 정보 수집 및 테마 제어
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJSON}
              title="JSON 백업 다운로드"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-[#E2ECC8]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>백업</span>
            </button>
            <button
              onClick={handleResetToDefault}
              title="초기값 복원"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-amber-200"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">초기 복원</span>
            </button>
            <button
              onClick={handleSaveAll}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#D92525] hover:brightness-110 text-white font-bold text-xs shadow disabled:opacity-60 disabled:cursor-wait"
            >
              {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>{isSaving ? '저장 중...' : '저장하기'}</span>
            </button>
            <button
              onClick={handleClose}
              disabled={isSaving}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dashboard Main Body (Sidebar Tabs + Content Area) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 p-3 overflow-x-auto md:overflow-y-auto flex md:flex-col gap-1 shrink-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all text-left whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-[#143022] text-[#E2ECC8] font-bold shadow-sm'
                      : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#D92525]' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Tab Panel Content */}
          <div className="flex-1 p-6 overflow-y-auto bg-white">
            {/* TAB 12: 사이트 문구 (전체) */}
            {activeTab === 12 && (
              <div className="max-w-3xl space-y-8">
                <div className="pb-2 border-b border-slate-100">
                  <h3 className="text-lg font-bold font-serif text-[#143022]">사이트 전체 고정 문구</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    메뉴, 섹션 제목·설명, 버튼, 팝업, 영상 갤러리 페이지의 문구를 수정합니다. 수정 후 상단의 저장하기를 눌러주세요.
                  </p>
                </div>
                {TEXT_GROUPS.map((group) => (
                  <div key={group.title} className="space-y-3">
                    <h4 className="text-sm font-bold text-[#D92525]">{group.title}</h4>
                    {group.fields.map((field) => {
                      const value = formData.texts?.[field.key] ?? field.defaultValue;
                      const update = (v: string) =>
                        setFormData({ ...formData, texts: { ...formData.texts, [field.key]: v } });
                      return (
                        <div key={field.key}>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-bold text-slate-700">{field.label}</label>
                            {value !== field.defaultValue && (
                              <button
                                type="button"
                                onClick={() => update(field.defaultValue)}
                                className="text-[11px] text-slate-400 hover:text-[#D92525]"
                              >
                                기본값으로
                              </button>
                            )}
                          </div>
                          {field.multiline ? (
                            <textarea
                              rows={3}
                              value={value}
                              onChange={(e) => update(e.target.value)}
                              className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                            />
                          ) : (
                            <input
                              type="text"
                              value={value}
                              onChange={(e) => update(e.target.value)}
                              className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}

            {/* TAB 0: 히어로 카피 */}
            {activeTab === 0 && (
              <div className="max-w-3xl space-y-5">
                <h3 className="text-lg font-bold font-serif text-[#143022] pb-2 border-b border-slate-100">
                  히어로 섹션 카피 및 배경 이미지
                </h3>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">상단 뱃지 문구</label>
                  <input
                    type="text"
                    value={formData.hero.badge}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        hero: { ...formData.hero, badge: e.target.value },
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">메인 슬로건 타이틀</label>
                  <input
                    type="text"
                    value={formData.hero.title}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        hero: { ...formData.hero, title: e.target.value },
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">서브 설명문</label>
                  <textarea
                    rows={3}
                    value={formData.hero.subtitle}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        hero: { ...formData.hero, subtitle: e.target.value },
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">축제 일자</label>
                    <input
                      type="text"
                      value={formData.hero.date}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          hero: { ...formData.hero, date: e.target.value },
                        })
                      }
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">축제 장소</label>
                    <input
                      type="text"
                      value={formData.hero.location}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          hero: { ...formData.hero, location: e.target.value },
                        })
                      }
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                </div>

                <ImageUploadControl
                  label="히어로 배경 이미지"
                  currentSrc={formData.hero.bgImage}
                  onUpdate={(src) =>
                    setFormData({
                      ...formData,
                      hero: { ...formData.hero, bgImage: src },
                    })
                  }
                />
              </div>
            )}

            {/* TAB 1: 행사 개요 (Stats) */}
            {activeTab === 1 && (
              <div className="max-w-3xl space-y-6">
                <h3 className="text-lg font-bold font-serif text-[#143022] pb-2 border-b border-slate-100">
                  행사 개요 요약 통계 4종
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {formData.stats?.map((st: any, idx: number) => (
                    <div key={st.id || idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <span className="text-xs font-bold text-[#D92525]">통계 항목 {idx + 1}</span>
                      <div>
                        <label className="block text-[11px] text-slate-500 mb-1">라벨</label>
                        <input
                          type="text"
                          value={st.label}
                          onChange={(e) => {
                            const next = [...formData.stats];
                            next[idx].label = e.target.value;
                            setFormData({ ...formData, stats: next });
                          }}
                          className="w-full p-2 rounded-lg border border-slate-200 text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-500 mb-1">수치/값</label>
                        <input
                          type="text"
                          value={st.value}
                          onChange={(e) => {
                            const next = [...formData.stats];
                            next[idx].value = e.target.value;
                            setFormData({ ...formData, stats: next });
                          }}
                          className="w-full p-2 rounded-lg border border-slate-200 text-xs font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-500 mb-1">설명</label>
                        <input
                          type="text"
                          value={st.desc}
                          onChange={(e) => {
                            const next = [...formData.stats];
                            next[idx].desc = e.target.value;
                            setFormData({ ...formData, stats: next });
                          }}
                          className="w-full p-2 rounded-lg border border-slate-200 text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: 프로그램 리스트 (CRUD) */}
            {activeTab === 2 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-lg font-bold font-serif text-[#143022]">
                    체험 프로그램 관리 (CRUD)
                  </h3>
                  <button
                    onClick={() => {
                      const newP = {
                        id: 'p' + Date.now(),
                        title: '새로운 청송 사과 체험',
                        category: '신규 체험',
                        badge: '신규',
                        time: '매일 13:00',
                        place: '축제장 체험 부스',
                        price: '10,000원',
                        desc: '청송 사과를 테마로 한 새로운 체험 프로그램입니다.',
                        image: '/src/assets/images/apple_harvest_basket_1793270974463.jpg',
                      };
                      setFormData({ ...formData, programs: [...formData.programs, newP] });
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#143022] text-white text-xs font-bold"
                  >
                    <Plus className="w-4 h-4" />
                    <span>새 프로그램 추가</span>
                  </button>
                </div>

                <div className="space-y-6">
                  {formData.programs?.map((p: any, idx: number) => (
                    <div key={p.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-[#143022]">프로그램 #{idx + 1}</span>
                        <button
                          onClick={() => {
                            const next = formData.programs.filter((_, i) => i !== idx);
                            setFormData({ ...formData, programs: next });
                          }}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                          title="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">제목</label>
                          <input
                            type="text"
                            value={p.title}
                            onChange={(e) => {
                              const next = [...formData.programs];
                              next[idx].title = e.target.value;
                              setFormData({ ...formData, programs: next });
                            }}
                            className="w-full p-2 rounded-lg border border-slate-200 text-xs font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">카테고리</label>
                          <input
                            type="text"
                            value={p.category}
                            onChange={(e) => {
                              const next = [...formData.programs];
                              next[idx].category = e.target.value;
                              setFormData({ ...formData, programs: next });
                            }}
                            className="w-full p-2 rounded-lg border border-slate-200 text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">뱃지</label>
                          <input
                            type="text"
                            value={p.badge}
                            onChange={(e) => {
                              const next = [...formData.programs];
                              next[idx].badge = e.target.value;
                              setFormData({ ...formData, programs: next });
                            }}
                            className="w-full p-2 rounded-lg border border-slate-200 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">일시/시간</label>
                          <input
                            type="text"
                            value={p.time}
                            onChange={(e) => {
                              const next = [...formData.programs];
                              next[idx].time = e.target.value;
                              setFormData({ ...formData, programs: next });
                            }}
                            className="w-full p-2 rounded-lg border border-slate-200 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">체험비</label>
                          <input
                            type="text"
                            value={p.price}
                            onChange={(e) => {
                              const next = [...formData.programs];
                              next[idx].price = e.target.value;
                              setFormData({ ...formData, programs: next });
                            }}
                            className="w-full p-2 rounded-lg border border-slate-200 text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">설명</label>
                        <textarea
                          rows={2}
                          value={p.desc}
                          onChange={(e) => {
                            const next = [...formData.programs];
                            next[idx].desc = e.target.value;
                            setFormData({ ...formData, programs: next });
                          }}
                          className="w-full p-2 rounded-lg border border-slate-200 text-xs"
                        />
                      </div>

                      <ImageUploadControl
                        label="프로그램 대표 사진"
                        currentSrc={p.image}
                        onUpdate={(src) => {
                          const next = [...formData.programs];
                          next[idx].image = src;
                          setFormData({ ...formData, programs: next });
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: 이벤트 대회 */}
            {activeTab === 3 && (
              <div className="max-w-3xl space-y-5">
                <h3 className="text-lg font-bold font-serif text-[#143022] pb-2 border-b border-slate-100">
                  시즌 이벤트 대회 설정
                </h3>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">대회 제목</label>
                  <input
                    type="text"
                    value={formData.event?.title}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        event: { ...formData.event, title: e.target.value },
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">일시</label>
                    <input
                      type="text"
                      value={formData.event?.date}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          event: { ...formData.event, date: e.target.value },
                        })
                      }
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">장소</label>
                    <input
                      type="text"
                      value={formData.event?.location}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          event: { ...formData.event, location: e.target.value },
                        })
                      }
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">참가 대상</label>
                  <input
                    type="text"
                    value={formData.event?.target}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        event: { ...formData.event, target: e.target.value },
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">시상 내역</label>
                  <input
                    type="text"
                    value={formData.event?.awards}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        event: { ...formData.event, awards: e.target.value },
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">대회 설명</label>
                  <textarea
                    rows={3}
                    value={formData.event?.desc}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        event: { ...formData.event, desc: e.target.value },
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>

                <ImageUploadControl
                  label="이벤트 대표 이미지"
                  currentSrc={formData.event?.image}
                  onUpdate={(src) =>
                    setFormData({
                      ...formData,
                      event: { ...formData.event, image: src },
                    })
                  }
                />
              </div>
            )}

            {/* TAB 4: 미니게임 */}
            {activeTab === 4 && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold font-serif text-[#143022] pb-2 border-b border-slate-100">
                  미니게임 2종 설정
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {formData.games?.map((g: any, idx: number) => (
                    <div key={g.id || idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <span className="font-bold text-xs text-[#D92525]">미니게임 {idx + 1}</span>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">게임명</label>
                        <input
                          type="text"
                          value={g.title}
                          onChange={(e) => {
                            const next = [...formData.games];
                            next[idx].title = e.target.value;
                            setFormData({ ...formData, games: next });
                          }}
                          className="w-full p-2 rounded-lg border border-slate-200 text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">서브타이틀</label>
                        <input
                          type="text"
                          value={g.subtitle}
                          onChange={(e) => {
                            const next = [...formData.games];
                            next[idx].subtitle = e.target.value;
                            setFormData({ ...formData, games: next });
                          }}
                          className="w-full p-2 rounded-lg border border-slate-200 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">실행 URL</label>
                        <input
                          type="text"
                          value={g.url}
                          onChange={(e) => {
                            const next = [...formData.games];
                            next[idx].url = e.target.value;
                            setFormData({ ...formData, games: next });
                          }}
                          className="w-full p-2 rounded-lg border border-slate-200 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">설명</label>
                        <textarea
                          rows={2}
                          value={g.desc}
                          onChange={(e) => {
                            const next = [...formData.games];
                            next[idx].desc = e.target.value;
                            setFormData({ ...formData, games: next });
                          }}
                          className="w-full p-2 rounded-lg border border-slate-200 text-xs"
                        />
                      </div>
                      <ImageUploadControl
                        label="게임 썸네일 이미지"
                        currentSrc={g.thumbnail}
                        onUpdate={(src) => {
                          const next = [...formData.games];
                          next[idx].thumbnail = src;
                          setFormData({ ...formData, games: next });
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: 캐릭터 */}
            {activeTab === 5 && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold font-serif text-[#143022] pb-2 border-b border-slate-100">
                  마스코트 캐릭터 설정
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {formData.characters?.map((c: any, idx: number) => (
                    <div key={c.id || idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <span className="font-bold text-xs text-[#D92525]">캐릭터 #{idx + 1}</span>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">이름</label>
                        <input
                          type="text"
                          value={c.name}
                          onChange={(e) => {
                            const next = [...formData.characters];
                            next[idx].name = e.target.value;
                            setFormData({ ...formData, characters: next });
                          }}
                          className="w-full p-2 rounded-lg border border-slate-200 text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">역할</label>
                        <input
                          type="text"
                          value={c.role}
                          onChange={(e) => {
                            const next = [...formData.characters];
                            next[idx].role = e.target.value;
                            setFormData({ ...formData, characters: next });
                          }}
                          className="w-full p-2 rounded-lg border border-slate-200 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">성격 / 특징</label>
                        <input
                          type="text"
                          value={c.personality}
                          onChange={(e) => {
                            const next = [...formData.characters];
                            next[idx].personality = e.target.value;
                            setFormData({ ...formData, characters: next });
                          }}
                          className="w-full p-2 rounded-lg border border-slate-200 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">상세 설명</label>
                        <textarea
                          rows={3}
                          value={c.desc}
                          onChange={(e) => {
                            const next = [...formData.characters];
                            next[idx].desc = e.target.value;
                            setFormData({ ...formData, characters: next });
                          }}
                          className="w-full p-2 rounded-lg border border-slate-200 text-xs"
                        />
                      </div>
                      <ImageUploadControl
                        label="캐릭터 일러스트"
                        currentSrc={c.image}
                        onUpdate={(src) => {
                          const next = [...formData.characters];
                          next[idx].image = src;
                          setFormData({ ...formData, characters: next });
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 6: 공지사항 (CRUD) */}
            {activeTab === 6 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-lg font-bold font-serif text-[#143022]">
                    공지사항 관리 (CRUD)
                  </h3>
                  <button
                    onClick={() => {
                      const newN = {
                        id: 'n' + Date.now(),
                        title: '신규 공지사항 안내',
                        category: '일반안내',
                        date: new Date().toISOString().slice(0, 10).replace(/-/g, '.'),
                        pinned: false,
                        content: '청송 못난이 사과 축제 새로운 안내 사항을 입력하세요.',
                      };
                      setFormData({ ...formData, notices: [newN, ...formData.notices] });
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#143022] text-white text-xs font-bold"
                  >
                    <Plus className="w-4 h-4" />
                    <span>새 공지 등록</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.notices?.map((n: any, idx: number) => (
                    <div key={n.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-[#143022]">공지 #{idx + 1}</span>
                          <label className="flex items-center gap-1 text-[11px] text-slate-500 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={n.pinned}
                              onChange={(e) => {
                                const next = [...formData.notices];
                                next[idx].pinned = e.target.checked;
                                setFormData({ ...formData, notices: next });
                              }}
                              className="rounded text-[#D92525]"
                            />
                            <span>상단 고정</span>
                          </label>
                        </div>
                        <button
                          onClick={() => {
                            const next = formData.notices.filter((_, i) => i !== idx);
                            setFormData({ ...formData, notices: next });
                          }}
                          className="p-1 rounded text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">제목</label>
                          <input
                            type="text"
                            value={n.title}
                            onChange={(e) => {
                              const next = [...formData.notices];
                              next[idx].title = e.target.value;
                              setFormData({ ...formData, notices: next });
                            }}
                            className="w-full p-2 rounded-lg border border-slate-200 text-xs font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">분류</label>
                          <input
                            type="text"
                            value={n.category}
                            onChange={(e) => {
                              const next = [...formData.notices];
                              next[idx].category = e.target.value;
                              setFormData({ ...formData, notices: next });
                            }}
                            className="w-full p-2 rounded-lg border border-slate-200 text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">본문 내용</label>
                        <textarea
                          rows={3}
                          value={n.content}
                          onChange={(e) => {
                            const next = [...formData.notices];
                            next[idx].content = e.target.value;
                            setFormData({ ...formData, notices: next });
                          }}
                          className="w-full p-2 rounded-lg border border-slate-200 text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 7: 접수된 문의 내역 & FORMSPREE MANAGER */}
            {activeTab === 7 && (
              <div className="space-y-6">
                {/* Formspree Endpoint Configuration Card */}
                <div className="p-5 rounded-2xl bg-[#F4F7EE] border border-[#E2ECC8] space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#D92525] text-white flex items-center justify-center">
                        <LinkIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[#143022]">Formspree 실시간 정보 수집 연동</h4>
                        <p className="text-xs text-slate-500">
                          온라인 문의, 체험 프로그램 사전 예약, 그림대회 참가 신청 정보가 지정 엔드포인트로 자동 수집됩니다.
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>연동 활성화됨</span>
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Formspree 엔드포인트 URL
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="url"
                        value={formData.formspree?.endpoint || DEFAULT_FORMSPREE_ENDPOINT}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            formspree: {
                              ...formData.formspree,
                              endpoint: e.target.value,
                            },
                          })
                        }
                        className="flex-1 p-2.5 rounded-xl border border-slate-200 text-xs font-mono font-semibold"
                        placeholder="https://formspree.io/f/..."
                      />
                      <button
                        onClick={handleTestFormspree}
                        disabled={isTestingFormspree}
                        className="px-4 py-2.5 rounded-xl bg-[#143022] text-[#E2ECC8] font-bold text-xs hover:brightness-110 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5 shrink-0"
                      >
                        {isTestingFormspree ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>테스트 전송 중...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>연동 테스트 전송</span>
                          </>
                        )}
                      </button>
                      <a
                        href="https://formspree.io/forms/xoeeljdk/submissions"
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 shrink-0"
                      >
                        <span>Formspree 대시보드</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-600 pt-1">
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">수집된 총 제출 건수</span>
                      <strong className="text-sm font-mono text-[#143022]">
                        {formData.inquiries?.length || 0}건
                      </strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">최근 수집 일시</span>
                      <strong className="text-xs font-mono text-slate-700 truncate block">
                        {formData.inquiries?.[0]?.date || '기록 대기중'}
                      </strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 col-span-2 sm:col-span-1">
                      <span className="text-slate-400 block text-[10px]">수집 대상 폼</span>
                      <strong className="text-xs text-slate-700">문의 / 예약 / 대회 / 알림</strong>
                    </div>
                  </div>
                </div>

                {/* Local Inquiries List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h4 className="text-base font-bold font-serif text-[#143022]">
                      웹사이트 접수 문의 및 예약 내역 ({formData.inquiries?.length || 0}건)
                    </h4>
                    {formData.inquiries?.length > 0 && (
                      <button
                        onClick={() => {
                          if (confirm('모든 문의 내역을 비우시겠습니까?')) {
                            setFormData({ ...formData, inquiries: [] });
                          }
                        }}
                        className="text-xs text-rose-600 hover:underline"
                      >
                        전체 삭제
                      </button>
                    )}
                  </div>

                  {(!formData.inquiries || formData.inquiries.length === 0) ? (
                    <div className="p-8 text-center text-slate-400 text-sm">
                      접수된 온라인 문의가 없습니다.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {formData.inquiries.map((inq: any, idx: number) => (
                        <div
                          key={inq.id || idx}
                          className={`p-4 rounded-2xl border transition-all ${
                            inq.status === '미확인'
                              ? 'bg-amber-50/40 border-amber-200'
                              : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    inq.status === '미확인'
                                      ? 'bg-amber-500 text-white'
                                      : 'bg-emerald-600 text-white'
                                  }`}
                                >
                                  {inq.status}
                                </span>
                                {inq.sentToFormspree && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">
                                    Formspree 전송됨
                                  </span>
                                )}
                                <span className="font-bold text-sm text-slate-800">{inq.name}</span>
                                <span className="text-xs text-slate-400 font-mono">({inq.date})</span>
                              </div>
                              <div className="text-xs text-slate-600 mt-1 space-x-2">
                                <span>연락처: <strong>{inq.phone}</strong></span>
                                <span>·</span>
                                <span>이메일: {inq.email}</span>
                                <span>·</span>
                                <span className="font-semibold text-[#D92525]">[{inq.type}]</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  const next = [...formData.inquiries];
                                  next[idx].status = next[idx].status === '미확인' ? '확인완료' : '미확인';
                                  setFormData({ ...formData, inquiries: next });
                                }}
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-100"
                              >
                                {inq.status === '미확인' ? '확인 완료로 변경' : '미확인으로 되돌리기'}
                              </button>
                              <button
                                onClick={() => {
                                  const next = formData.inquiries.filter((_, i) => i !== idx);
                                  setFormData({ ...formData, inquiries: next });
                                }}
                                className="p-1 rounded text-rose-500 hover:bg-rose-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="mt-3 p-3 rounded-xl bg-white border border-slate-100 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                            {inq.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 8: 갤러리 */}
            {activeTab === 8 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-lg font-bold font-serif text-[#143022]">
                    축제 포토 갤러리 관리
                  </h3>
                  <button
                    onClick={() => {
                      const newG = {
                        id: 'gal' + Date.now(),
                        title: '청송 사과 축제의 즐거운 순간',
                        category: '축제 스냅',
                        date: new Date().toISOString().slice(0, 10).replace(/-/g, '.'),
                        image: '/src/assets/images/apple_harvest_basket_1793270974463.jpg',
                      };
                      setFormData({ ...formData, gallery: [...formData.gallery, newG] });
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#143022] text-white text-xs font-bold"
                  >
                    <Plus className="w-4 h-4" />
                    <span>새 사진 등록</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {formData.gallery?.map((g: any, idx: number) => (
                    <div key={g.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-700">사진 #{idx + 1}</span>
                        <button
                          onClick={() => {
                            const next = formData.gallery.filter((_, i) => i !== idx);
                            setFormData({ ...formData, gallery: next });
                          }}
                          className="p-1 rounded text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">제목</label>
                        <input
                          type="text"
                          value={g.title}
                          onChange={(e) => {
                            const next = [...formData.gallery];
                            next[idx].title = e.target.value;
                            setFormData({ ...formData, gallery: next });
                          }}
                          className="w-full p-2 rounded-lg border border-slate-200 text-xs font-semibold"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">분류</label>
                          <input
                            type="text"
                            value={g.category}
                            onChange={(e) => {
                              const next = [...formData.gallery];
                              next[idx].category = e.target.value;
                              setFormData({ ...formData, gallery: next });
                            }}
                            className="w-full p-2 rounded-lg border border-slate-200 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">일자</label>
                          <input
                            type="text"
                            value={g.date}
                            onChange={(e) => {
                              const next = [...formData.gallery];
                              next[idx].date = e.target.value;
                              setFormData({ ...formData, gallery: next });
                            }}
                            className="w-full p-2 rounded-lg border border-slate-200 text-xs"
                          />
                        </div>
                      </div>
                      <ImageUploadControl
                        label="갤러리 사진"
                        currentSrc={g.image}
                        onUpdate={(src) => {
                          const next = [...formData.gallery];
                          next[idx].image = src;
                          setFormData({ ...formData, gallery: next });
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 9: 푸터 정보 */}
            {activeTab === 9 && (
              <div className="max-w-2xl space-y-4">
                <h3 className="text-lg font-bold font-serif text-[#143022] pb-2 border-b border-slate-100">
                  푸터 주관처 및 연락처 정보
                </h3>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">주최 / 주관 표기</label>
                  <input
                    type="text"
                    value={formData.footer?.organizer}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        footer: { ...formData.footer, organizer: e.target.value },
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">주소</label>
                  <input
                    type="text"
                    value={formData.footer?.address}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        footer: { ...formData.footer, address: e.target.value },
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">대표 전화</label>
                    <input
                      type="text"
                      value={formData.footer?.phone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          footer: { ...formData.footer, phone: e.target.value },
                        })
                      }
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">대표 이메일</label>
                    <input
                      type="text"
                      value={formData.footer?.email}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          footer: { ...formData.footer, email: e.target.value },
                        })
                      }
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">저작권 표기 문구</label>
                  <input
                    type="text"
                    value={formData.footer?.copyright}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        footer: { ...formData.footer, copyright: e.target.value },
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>
            )}

            {/* TAB 10: 디자인 & 색상 (Color Picker) */}
            {activeTab === 10 && (
              <div className="max-w-2xl space-y-6">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-lg font-bold font-serif text-[#143022]">
                    실시간 테마 컬러 팔레트 제어
                  </h3>
                  <button
                    onClick={() => {
                      setFormData({
                        ...formData,
                        theme: { ...DEFAULT_DATA.theme },
                      });
                      onShowToast('🎨 기본 컬러 테마로 복원되었습니다.');
                    }}
                    className="text-xs font-semibold text-slate-500 hover:text-[#D92525]"
                  >
                    기본 색상 복원
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Forest Green */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                    <span className="font-bold text-xs text-slate-700 block">
                      딥 포레스트 그린 (헤더, 히어로, 푸터)
                    </span>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={formData.theme?.forestGreen || '#143022'}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            theme: { ...formData.theme, forestGreen: e.target.value },
                          })
                        }
                        className="w-10 h-10 rounded-xl cursor-pointer border-0"
                      />
                      <input
                        type="text"
                        value={formData.theme?.forestGreen || '#143022'}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            theme: { ...formData.theme, forestGreen: e.target.value },
                          })
                        }
                        className="w-28 p-2 rounded-lg border border-slate-200 text-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* Apple Red */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                    <span className="font-bold text-xs text-slate-700 block">
                      포인트 애플 레드 (버튼, 하이라이트)
                    </span>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={formData.theme?.appleRed || '#D92525'}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            theme: { ...formData.theme, appleRed: e.target.value },
                          })
                        }
                        className="w-10 h-10 rounded-xl cursor-pointer border-0"
                      />
                      <input
                        type="text"
                        value={formData.theme?.appleRed || '#D92525'}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            theme: { ...formData.theme, appleRed: e.target.value },
                          })
                        }
                        className="w-28 p-2 rounded-lg border border-slate-200 text-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* Sage Lime */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                    <span className="font-bold text-xs text-slate-700 block">
                      세이지 라임 (전체 배경 컬러)
                    </span>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={formData.theme?.sageLime || '#F4F7EE'}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            theme: { ...formData.theme, sageLime: e.target.value },
                          })
                        }
                        className="w-10 h-10 rounded-xl cursor-pointer border-0"
                      />
                      <input
                        type="text"
                        value={formData.theme?.sageLime || '#F4F7EE'}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            theme: { ...formData.theme, sageLime: e.target.value },
                          })
                        }
                        className="w-28 p-2 rounded-lg border border-slate-200 text-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* Accent Lime */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                    <span className="font-bold text-xs text-slate-700 block">
                      연두 액센트 (뱃지, 서브 테두리)
                    </span>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={formData.theme?.accentLime || '#E2ECC8'}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            theme: { ...formData.theme, accentLime: e.target.value },
                          })
                        }
                        className="w-10 h-10 rounded-xl cursor-pointer border-0"
                      />
                      <input
                        type="text"
                        value={formData.theme?.accentLime || '#E2ECC8'}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            theme: { ...formData.theme, accentLime: e.target.value },
                          })
                        }
                        className="w-28 p-2 rounded-lg border border-slate-200 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 11: SEO 메타 */}
            {activeTab === 11 && (
              <div className="max-w-2xl space-y-5">
                <h3 className="text-lg font-bold font-serif text-[#143022] pb-2 border-b border-slate-100">
                  SEO 검색 엔진 최적화 & 메타 태그
                </h3>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">메타 타이틀 (Title)</label>
                  <input
                    type="text"
                    value={formData.seo?.metaTitle}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        seo: { ...formData.seo, metaTitle: e.target.value },
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">메타 설명문 (Description)</label>
                  <textarea
                    rows={3}
                    value={formData.seo?.metaDescription}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        seo: { ...formData.seo, metaDescription: e.target.value },
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">키워드 (Keywords)</label>
                  <input
                    type="text"
                    value={formData.seo?.metaKeywords}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        seo: { ...formData.seo, metaKeywords: e.target.value },
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>

                {/* Google Search Result Preview Simulator */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    Google 검색 결과 실시간 미리보기
                  </span>
                  <div className="text-xs text-emerald-800 font-mono">
                    https://cheongsong.go.kr &gt; apple-festival
                  </div>
                  <div className="text-base font-bold text-[#1a0dab] hover:underline cursor-pointer">
                    {formData.seo?.metaTitle}
                  </div>
                  <div className="text-xs text-slate-600 line-clamp-2">
                    {formData.seo?.metaDescription}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Bottom Save Bar */}
        <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            {saveStatus
              ? `⏳ ${saveStatus} 완료될 때까지 창을 닫지 마세요.`
              : '* [저장하기]를 누르면 모든 변경 사항이 서버에 영구 저장되어 모든 방문자에게 반영됩니다.'}
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
            >
              닫기
            </button>
            <button
              onClick={handleSaveAll}
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-[#D92525] hover:brightness-110 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-wait"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{isSaving ? '저장 중...' : '저장 및 웹사이트 반영'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 7. REUSABLE IMAGE UPLOAD & URL COMPONENT
// ==========================================
function ImageUploadControl({
  label,
  currentSrc,
  onUpdate,
}: {
  label: string;
  currentSrc?: string;
  onUpdate: (src: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Always call the latest onUpdate so edits made while the image is processing are not overwritten
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setProcessing(true);
    setError('');
    try {
      onUpdateRef.current(await prepareImageFile(file));
    } catch (err) {
      setError((err as Error).message || '이미지를 처리하지 못했습니다.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-2 p-3.5 rounded-xl bg-white border border-slate-200">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold text-slate-700">{label}</label>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={processing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#143022] hover:bg-[#1c4330] text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-60"
        >
          <Upload className="w-3.5 h-3.5 text-[#E2ECC8]" />
          <span>{processing ? '이미지 처리 중...' : '내 기기 파일 직접 업로드'}</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      <div className="flex gap-3 items-center">
        <div className="w-16 h-12 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
          <img
            src={getSafeImageSrc(currentSrc)}
            onError={handleImgError}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1">
          <input
            type="text"
            value={currentSrc?.startsWith('data:') ? '' : currentSrc || ''}
            onChange={(e) => onUpdate(e.target.value)}
            placeholder={
              currentSrc?.startsWith('data:')
                ? '✅ 새 이미지 선택됨 — [저장하기]를 누르면 서버에 업로드됩니다.'
                : '이미지 URL을 입력하거나 위 [파일 직접 업로드] 버튼을 클릭하세요.'
            }
            className="w-full p-2 rounded-lg border border-slate-200 text-xs font-mono text-slate-600 truncate"
          />
        </div>
      </div>
      {error && <p className="text-[11px] text-rose-600 font-semibold">⚠️ {error}</p>}
    </div>
  );
}
