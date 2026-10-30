// Every fixed label/heading on the site, editable from the admin "사이트 문구" tab.
export const STORAGE_KEY = 'cheongsong_apple_fest_data_v4';

type TextField = { key: string; label: string; multiline?: boolean; defaultValue: string };

export const TEXT_GROUPS: { title: string; fields: TextField[] }[] = [
  {
    title: '상단 배너 & 헤더',
    fields: [
      { key: 'topBanner', label: '최상단 배너 문구', defaultValue: '실시간 방문자 정보 수집 연동 활성화' },
      { key: 'brandName', label: '사이트 이름 (로고)', defaultValue: '청송 못난이 사과 축제' },
      { key: 'brandYear', label: '로고 옆 연도 뱃지', defaultValue: '2026' },
      { key: 'brandSub', label: '로고 아래 영문명', defaultValue: 'CHEONGSONG UGLY APPLE FESTIVAL' },
      { key: 'adminButton', label: '관리자 버튼', defaultValue: '관리자 모드' },
    ],
  },
  {
    title: '메뉴',
    fields: [
      { key: 'navIntro', label: '축제 소개 메뉴', defaultValue: '축제 소개' },
      { key: 'navPrograms', label: '체험 프로그램 메뉴', defaultValue: '체험 프로그램' },
      { key: 'navEvent', label: '시즌 이벤트 메뉴', defaultValue: '시즌 이벤트' },
      { key: 'navGames', label: '미니게임 메뉴', defaultValue: '미니게임' },
      { key: 'navCharacters', label: '캐릭터 메뉴', defaultValue: '캐릭터 소개' },
      { key: 'navNotices', label: '공지 & 갤러리 메뉴', defaultValue: '공지 & 갤러리' },
      { key: 'navContact', label: '문의하기 메뉴', defaultValue: '문의하기' },
      { key: 'navVideos', label: '영상 갤러리 메뉴', defaultValue: '영상 갤러리' },
    ],
  },
  {
    title: '히어로 & 행사 개요',
    fields: [
      { key: 'heroProgramsButton', label: '프로그램 보기 버튼', defaultValue: '축제 프로그램 둘러보기' },
      { key: 'heroShuttleButton', label: '셔틀버스 안내 버튼', defaultValue: '셔틀버스 & 주차장 안내' },
      { key: 'alertButton', label: '수확 알림 버튼', defaultValue: '꿀사과 수확 알림' },
      { key: 'topAlertButton', label: '배너의 수확 알림 버튼', defaultValue: '사과 수확 알림 받기' },
      { key: 'overviewTitle', label: '개요 카드 제목', defaultValue: 'FESTIVAL OVERVIEW' },
      { key: 'overviewTag', label: '개요 카드 태그', defaultValue: 'LIVE 2026' },
      {
        key: 'overviewNote',
        label: '개요 카드 안내문',
        multiline: true,
        defaultValue:
          '못난이 사과는 작은 흠이나 불규칙한 모양 때문에 상품 등급에서 밀려났지만, 풍부한 일조량과 고랭지 일교차로 인해 당도(Brix)는 최상급입니다!',
      },
    ],
  },
  {
    title: '체험 프로그램 섹션',
    fields: [
      { key: 'programsEyebrow', label: '소제목', defaultValue: 'FESTIVAL EXPERIENCES' },
      { key: 'programsTitle', label: '제목', defaultValue: '오감으로 맛보고 즐기는 체험 프로그램' },
      {
        key: 'programsDesc',
        label: '설명',
        multiline: true,
        defaultValue:
          '사과 수확의 기쁨부터 청송백자 물레 빚기, 향긋한 사과 디저트와 와인 테이스팅까지 온 가족이 함께 즐길 수 있는 다채로운 체험이 준비되어 있습니다.',
      },
      { key: 'programsCardButton', label: '카드 버튼', defaultValue: '상세 & 예약' },
    ],
  },
  {
    title: '시즌 이벤트 섹션',
    fields: [
      { key: 'eventEyebrow', label: '소제목', defaultValue: 'SPECIAL SEASON CONTEST' },
      { key: 'eventDateLabel', label: '일시 및 장소 라벨', defaultValue: '일시 및 장소' },
      { key: 'eventTargetLabel', label: '참가 대상 라벨', defaultValue: '참가 대상' },
      { key: 'eventAwardsLabel', label: '시상 내역 라벨', defaultValue: '시상 내역' },
      { key: 'eventRegisterButton', label: '참가 신청 버튼', defaultValue: '대회 사전 참가 신청하기' },
      { key: 'eventDownloadButton', label: '요강 다운로드 버튼', defaultValue: '대회 요강 다운로드' },
    ],
  },
  {
    title: '미니게임 섹션',
    fields: [
      { key: 'gamesEyebrow', label: '소제목', defaultValue: 'INTERACTIVE MINI GAMES' },
      { key: 'gamesTitle', label: '제목', defaultValue: '손끝으로 즐기는 축제 미니게임' },
      {
        key: 'gamesDesc',
        label: '설명',
        multiline: true,
        defaultValue: '스마트폰과 PC에서 누구나 바로 즐길 수 있는 2종의 축제 미니게임을 플레이하고 행운 쿠폰을 획득하세요!',
      },
      { key: 'gamesPlayButton', label: '이미지 위 플레이 버튼', defaultValue: '지금 플레이하기' },
      { key: 'gamesRunButton', label: '실행 버튼', defaultValue: '웹 브라우저 즉시 실행' },
    ],
  },
  {
    title: '캐릭터 섹션',
    fields: [
      { key: 'charactersEyebrow', label: '소제목', defaultValue: 'OFFICIAL MASCOTS' },
      { key: 'charactersTitle', label: '제목', defaultValue: "청송 못난이 사과 요정 '청이'와 '송이'" },
      { key: 'charactersDesc', label: '설명', multiline: true, defaultValue: '울퉁불퉁한 모습도 사랑스러운 청송의 공식 수호 요정 듀오를 만나보세요!' },
    ],
  },
  {
    title: '공지사항 & 갤러리 섹션',
    fields: [
      { key: 'noticesEyebrow', label: '공지 소제목', defaultValue: 'NOTICES & NEWS' },
      { key: 'noticesTitle', label: '공지 제목', defaultValue: '축제 공지사항 & 알림마당' },
      { key: 'noticesPinned', label: '중요공지 뱃지', defaultValue: '중요공지' },
      { key: 'noticeConfirmButton', label: '공지 팝업 확인 버튼', defaultValue: '확인 완료' },
      { key: 'galleryEyebrow', label: '갤러리 소제목', defaultValue: 'PHOTO MOMENTS' },
      { key: 'galleryTitle', label: '갤러리 제목', defaultValue: '청송 축제 현장 포토 갤러리' },
      { key: 'galleryDesc', label: '갤러리 설명', multiline: true, defaultValue: '가을 정취 가득한 주왕산과 현비암, 행복한 미소가 가득했던 지난 축제의 하이라이트' },
    ],
  },
  {
    title: '문의하기 섹션',
    fields: [
      { key: 'contactEyebrow', label: '소제목', defaultValue: 'CONTACT & FORMSPREE COLLECTOR' },
      { key: 'contactTitle', label: '제목', defaultValue: '축제 문의 및 온라인 소통' },
      {
        key: 'contactDesc',
        label: '설명',
        multiline: true,
        defaultValue:
          '청송 못난이 사과 축제에 대해 궁금한 점이나 단체 수확 체험, 휠체어/유모차 대여 등 필요하신 내용을 남겨주시면 축제 운영위원회에서 친절하게 답변드립니다.',
      },
      { key: 'contactLiveLabel', label: '연동 카드 제목', defaultValue: '실시간 수집 연동 (Formspree)' },
      { key: 'contactPhoneLabel', label: '전화 라벨', defaultValue: '축제 종합 상황실 전화' },
      { key: 'contactPhoneHours', label: '전화 운영시간', defaultValue: '(평일/주말 09:00 - 18:00 축제기간 상시 운영)' },
      { key: 'contactAddressLabel', label: '주소 라벨', defaultValue: '축제장 및 사무국 주소' },
      { key: 'contactFormTitle', label: '문의 폼 제목', defaultValue: '온라인 문의 작성' },
      { key: 'contactSubmitButton', label: '문의 전송 버튼', defaultValue: '문의 작성 완료 및 Formspree 전송' },
    ],
  },
  {
    title: '팝업 (알림 신청 / 대회 신청 / 셔틀)',
    fields: [
      { key: 'alertModalTitle', label: '알림 신청 팝업 제목', defaultValue: '꿀사과 수확 & 산지직판 알림' },
      {
        key: 'alertModalDesc',
        label: '알림 신청 팝업 설명',
        multiline: true,
        defaultValue: '청송 고랭지 당도 15Brix 이상 특등급 못난이 사과 수확 당일 산지 직배송 특가 알림을 문자로 보내드립니다!',
      },
      { key: 'eventModalTitle', label: '대회 신청 팝업 제목', defaultValue: '그림 그리기 대회 사전 참가 신청' },
      { key: 'eventModalNote', label: '대회 신청 팝업 안내', multiline: true, defaultValue: '* 참가자 전원에게 8색 크레파스 및 꿀사과 1박스 기념품이 현장 지급됩니다.' },
      { key: 'shuttleTitle', label: '셔틀 팝업 제목', defaultValue: '셔틀버스 & 주차장 안내' },
      { key: 'shuttleSubtitle', label: '셔틀 팝업 부제', defaultValue: '축제 기간 전 구간 무료 순환 운행' },
      { key: 'shuttleParkingTitle', label: '주차장 제목', defaultValue: '🚗 임시 무료 주차장 4개소' },
      {
        key: 'shuttleParking',
        label: '주차장 목록 (한 줄에 하나, "이름: 설명")',
        multiline: true,
        defaultValue: [
          'A주차장 (메인): 청송공설운동장 (1,200대 수용)',
          'B주차장: 용전천 수변체육공원 하류 (800대 수용)',
          'C주차장: 청송군청 및 군민회관 뒤편 (500대 수용)',
          'D주차장: 주왕산 입구 대형버스 전용 주차장 (300대 수용)',
        ].join('\n'),
      },
      { key: 'shuttleBusTitle', label: '셔틀 운행표 제목', defaultValue: '🚌 무료 순환 셔틀버스 운행표' },
      { key: 'shuttleHours', label: '운행 시간', defaultValue: '축제 기간 매일 09:30 - 20:30 (배차 간격 10~15분)' },
      { key: 'shuttleRoute', label: '순환 노선', defaultValue: 'A주차장 ↔ B주차장 ↔ 축제장 메인게이트 (현비암 앞) ↔ C주차장' },
    ],
  },
  {
    title: '푸터',
    fields: [{ key: 'footerTitle', label: '푸터 사이트 이름', defaultValue: '청송 못난이 사과 축제' }],
  },
  {
    title: '영상 갤러리 페이지',
    fields: [
      { key: 'videosBack', label: '메인으로 버튼', defaultValue: '메인으로' },
      { key: 'videosBadge', label: '상단 뱃지', defaultValue: '축제 영상 갤러리' },
      { key: 'videosTitle', label: '제목', defaultValue: '청송의 가을, 영상으로 나눠요' },
      { key: 'videosTitleHighlight', label: '제목에서 강조할 단어', defaultValue: '영상' },
      {
        key: 'videosDesc',
        label: '설명',
        multiline: true,
        defaultValue: '축제 현장 브이로그, 사과 수확 체험, 현비암 야경까지! 유튜브 영상 링크를 첨부하면 누구나 함께 볼 수 있는 갤러리에 등록됩니다.',
      },
      { key: 'videosFormTitle', label: '등록 폼 제목', defaultValue: '유튜브 영상 첨부하기' },
      { key: 'videosSubmitButton', label: '등록 버튼', defaultValue: '영상 등록하기' },
      { key: 'videosListTitle', label: '목록 제목', defaultValue: '등록된 영상' },
      { key: 'videosEmptyTitle', label: '빈 목록 제목', defaultValue: '아직 등록된 영상이 없어요' },
      { key: 'videosEmptyDesc', label: '빈 목록 설명', defaultValue: '첫 번째 축제 영상을 첨부해주세요!' },
    ],
  },
];

export const DEFAULT_TEXTS: Record<string, string> = Object.fromEntries(
  TEXT_GROUPS.flatMap((g) => g.fields.map((f) => [f.key, f.defaultValue]))
);

// Resolves a text key, falling back to the default when unset (e.g. older saved data)
export function getText(texts: Record<string, string> | undefined, key: string): string {
  return texts?.[key] ?? DEFAULT_TEXTS[key] ?? '';
}

export function loadSavedTexts(): Record<string, string> | undefined {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved).texts : undefined;
  } catch {
    return undefined;
  }
}
