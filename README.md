# 상권분석 · 경기도 학원 검색

전국 단위 **상권분석**(소상공인시장진흥공단 상가업소정보 기반)을 첫 화면으로 하고, 그 안쪽에
**경기도 학원 검색**(경기데이터드림 공공데이터, `Tbinstutm`)을 별도 페이지로 둔 Next.js 웹
서비스입니다.

- `/` — 상권분석 (첫 화면). 지역·업종별 점포 수 통계, 경쟁강도·업종 공백 진단, 지도에서 개별
  업체 보기, AI 상권 분석가 챗봇.
- `/academy` — 경기도 학원 검색. 첫 화면 헤더의 "경기 학원 검색 →" 링크로 원하는 사람만
  들어갈 수 있습니다.
- `/compare` — 상권분석의 지역 비교 페이지.

## 기술 스택

- Next.js 14 (App Router) + TypeScript (strict)
- Tailwind CSS
- 카카오맵 JavaScript SDK
- React 기본 hooks (별도 상태관리 라이브러리 없음)

## 프로젝트 구조

```
app/
├── layout.tsx, globals.css
├── page.tsx                  # "/" 상권분석 (첫 화면)
├── compare/page.tsx          # "/compare" 지역 비교
├── academy/page.tsx          # "/academy" 경기도 학원 검색 (안쪽 페이지)
└── api/
    ├── academies/route.ts                     # 경기데이터드림 API 서버 프록시
    ├── commercial-analysis/route.ts           # 상권분석 결과
    ├── commercial-analysis/options/route.ts   # 지역/업종 드롭다운 옵션
    ├── commercial-analysis/stores/route.ts    # 지도용 업체 목록
    └── ai-analysis/route.ts                   # AI 상권 분석가(Gemini) 프록시
components/
├── SearchForm.tsx, AcademyMap.tsx, AcademyList.tsx, IndustryStats.tsx,
│   FavoriteToggle.tsx        # 학원 검색 UI
├── DataSourceNotice.tsx      # 출처/기준일자 안내
└── analysis/                 # 상권분석 UI (RegionIndustryPicker, AnalysisResult,
                               #   SaturationCard, GapAnalysisPanel, CompareResult,
                               #   StoreMapPanel, CommercialMap, AIAnalystChat 등)
lib/
├── gg-api.ts, normalize.ts, constants.ts   # 학원 검색 데이터 처리
├── commercial.ts, commercial-stores.ts     # 상권분석 집계·업체 목록 조회
├── gemini-prompt.ts, ai-constants.ts       # AI 상권 분석가 시스템 프롬프트·모델 목록
└── csv-export.ts                           # CSV 다운로드
types/
├── academy.ts, commercial.ts, ai-analysis.ts
└── kakao.d.ts    # 카카오맵 SDK 최소 타입 선언
hooks/
├── useFavorites.ts       # 로컬스토리지 기반 즐겨찾기
├── useGeminiApiKey.ts    # 로컬스토리지 기반 Gemini API 키 저장
└── useGeminiModel.ts     # 로컬스토리지 기반 Gemini 모델 선택 저장
```

## 실행 방법

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

`.env.local.example`을 `.env.local`로 복사하고 실제 키 값을 채워넣으세요.

```bash
cp .env.local.example .env.local
```

```env
# .env.local
GG_API_KEY=발급받은_경기데이터드림_인증키
NEXT_PUBLIC_KAKAO_MAP_KEY=카카오_JavaScript_앱키
```

- `GG_API_KEY`는 서버(`app/api/academies/route.ts`, `lib/gg-api.ts`)에서만 사용되며 브라우저에
  노출되지 않습니다.
- `NEXT_PUBLIC_KAKAO_MAP_KEY`는 브라우저에서 지도를 그릴 때 필요해 `NEXT_PUBLIC_` 접두사가
  붙습니다(클라이언트에 노출되는 값이므로, 카카오 개발자 콘솔에서 **플랫폼 도메인 등록으로
  도메인을 제한**해 악용을 막으세요).

### 3. 개발 서버 실행 (반드시 3000번 포트)

```bash
npm run dev
```

카카오 개발자 콘솔의 "플랫폼 > Web"에 **`http://localhost:3000`만** 등록되어 있으므로,
반드시 3000번 포트로 실행해야 카카오맵이 정상적으로 로드됩니다. (`npm run dev`는
`next dev -p 3000`으로 고정되어 있습니다.) 다른 포트가 이미 사용 중이라면 그 포트를 비우고
실행하세요.

### 4. (배포 시) Netlify 등 호스팅에 환경변수 등록

`.env.local`은 `.gitignore`에 포함되어 있어 **저장소에도, 배포 플랫폼에도 자동으로 올라가지
않습니다.** Netlify 등에 배포한 뒤 "GG_API_KEY가 설정되어 있지 않습니다" 같은 에러가 보인다면,
해당 사이트가 아직 환경변수를 모르기 때문입니다. Netlify 기준:

1. Netlify 사이트 대시보드 → **Site configuration → Environment variables**
2. `GG_API_KEY`, `NEXT_PUBLIC_KAKAO_MAP_KEY` 두 값을 각각 추가
3. **Deploys → Trigger deploy(Clear cache and deploy site)**로 재배포 (환경변수는 다음 빌드부터
   반영되며, 기존 배포에는 소급 적용되지 않습니다)
4. 카카오 개발자 콘솔의 "플랫폼 > Web"에 배포된 도메인(예: `https://xxxx.netlify.app`)도
   함께 등록하세요. `localhost:3000`만 등록된 상태로는 배포 환경에서 지도가 로드되지 않습니다.

리포지토리에는 Netlify의 공식 Next.js 런타임(`@netlify/plugin-nextjs`)을 사용하도록
`netlify.toml`이 포함되어 있어, API 라우트(`/api/academies`)를 포함한 App Router 기능이
서버리스 함수로 정상 배포됩니다.

브라우저에서 http://localhost:3000 접속 시 첫 화면은 상권분석이며, 지역과 업종을 선택하고
"분석하기"를 눌러보세요. 경기도 학원 검색은 헤더의 "경기 학원 검색 →" 링크(`/academy`)로
들어갈 수 있습니다.

## ⚠️ API 응답 스키마 관련 안내

이 저장소를 구성한 환경은 외부 네트워크 정책상 `openapi.gg.go.kr`에 직접 접근할 수 없어,
실제 키로 라이브 호출을 해서 응답 구조를 검증하지 못했습니다. `lib/gg-api.ts`의
`parseTbinstutmResponse()`는 경기데이터드림 공공API들이 공통으로 쓰는 표준 포맷
(`{"Tbinstutm":[{"head":[...]},{"row":[...]}]}`)을 기준으로 방어적으로 작성되어 있습니다.

**최초 실행 시 서버(터미널) 콘솔에 `[gg-api] Tbinstutm 원본 응답 (pIndex=1) 확인용 로그:`로
시작하는 원본 응답 전체가 그대로 출력됩니다.** 만약 실제 구조가 예상과 다르면(필드명, 중첩
순서 등), `lib/gg-api.ts`의 `parseTbinstutmResponse()` 함수만 실제 로그를 보고 수정하면
됩니다 — 다른 파일들은 이 함수가 반환하는 `{ rows, totalCount }` 형태에만 의존하므로 영향받지
않습니다.

## 데이터 기준일자 변경 시

`lib/constants.ts`의 `DATA_REFERENCE_DATE` 상수 한 곳만 수정하면 화면 하단 출처 안내와
API 응답의 `dataReferenceDate` 값에 모두 반영됩니다.

## 참고: API 요청/응답 개요

- 요청주소: `https://openapi.gg.go.kr/Tbinstutm`
- 필수 파라미터: `KEY`, `Type=json`, `pIndex`, `pSize`
- 선택 파라미터(필터): `SIGUN_NM`, `EMD_NM`, `INDUTYPE_DIV_NM`, `SIGUN_CD`
  - 이 프로젝트는 `SIGUN_NM`만 원본 API로 전달합니다. `EMD_NM`(읍면동), `INDUTYPE_DIV_NM`(업종
    구분), 학원명은 원본 API에 정확일치로 넘길 경우 실제 저장된 표기(예: "보습" vs
    "보습학원")를 확신할 수 없어 값이 조금만 달라도 결과가 0건이 되는 문제가 있었습니다.
    대신 서버 라우트(`/api/academies`)에서 `SIGUN_NM`으로 받아온 결과에 대해 세 조건 모두
    부분일치(포함) 필터링으로 안전하게 처리합니다.
  - 한글 파라미터는 `encodeURIComponent`로 인코딩해 요청합니다.
- 페이지당 최대 200건(`GG_API_PAGE_SIZE`, `lib/constants.ts`)씩 `pIndex`를 늘려가며 호출해
  전체 데이터를 모읍니다(`fetchAllAcademies`, `lib/gg-api.ts`).

## 상권분석 (`/`, 첫 화면)

경기 학원 검색과는 별도로, **소상공인시장진흥공단 상가(상권)정보**(전국 업종별 점포 현황)를
기반으로 지역·업종을 선택하면 점포 수·비중·하위 업종/행정동별 분포를 보여주는 기능입니다.
경기 학원 검색(`/academy`)은 첫 화면 헤더의 링크로만 들어갈 수 있는 안쪽 페이지로 옮겼습니다.
소상공인 컨설팅을 염두에 두고 아래 기능도 함께 제공합니다:

- **경쟁강도 진단**: 선택한 업종이 선택한 지역에 상위 지역(행정동→시군구, 시군구→시도) 평균
  대비 몇 배 밀집해 있는지 계산해 "매우 낮음~매우 높음(포화)" 5단계로 보여줍니다
  (`analyzeSaturation`, `components/analysis/SaturationCard.tsx`).
- **업종 공백 분석**: 같은 비교 기준 대비 이 지역에 상대적으로 적은 업종을 순위로 보여줘
  창업 기회 후보를 참고할 수 있습니다(`analyzeGaps`, `components/analysis/GapAnalysisPanel.tsx`).
- **지역 비교 (`/compare`)**: 후보지 두 곳(지역+업종)을 나란히 놓고 점포 수·비중·
  경쟁강도·업종 구성을 비교합니다.
- **CSV 다운로드**: 분석 결과, 업체 목록, 지역 비교 결과를 각각 CSV로 내려받아 고객 자료로
  바로 쓸 수 있습니다(`lib/csv-export.ts`).
- **업체명 검색**: "지도에서 업체 보기" 패널에서 상호명/지점명으로 검색할 수 있습니다. 현재
  선택된 지역·업종 범위 안에서, 샘플링 이전의 전체 목록을 대상으로 검색하므로(지도에는 최대
  300개만 표시되지만) 표시되지 않은 업체도 찾을 수 있습니다(`nameQuery` 파라미터,
  `lib/commercial-stores.ts`).
- **AI 상권 분석가**: 현재 분석 결과(점포 수·경쟁강도·업종 공백 등)를 근거로 Google Gemini와
  대화하며 조언을 받을 수 있는 챗봇입니다. **사용자가 자신의 Gemini API 키를 직접 입력**하며,
  이 키는 브라우저 `localStorage`에만 저장되고 서버에는 저장·로깅되지 않습니다 — 요청마다
  서버(`app/api/ai-analysis/route.ts`)를 한 번 거쳐 Gemini에 전달될 뿐입니다(CORS 문제 없이
  안정적으로 호출하기 위함). 대화 상태는 Gemini API 특성상 매 턴 전체 이력을 다시 보내는
  방식으로 유지됩니다(`hooks/useGeminiApiKey.ts`, `components/analysis/AIAnalystChat.tsx`,
  `lib/gemini-prompt.ts`). **모델은 채팅창 상단 드롭다운에서 직접 고를 수 있으며**
  (`gemini-3.5-flash-lite` / `gemini-3.7-flash` / `gemini-3.8-flash`), 선택은
  `hooks/useGeminiModel.ts`가 브라우저에 기억해둡니다. 서버는 클라이언트가 보낸 모델 ID가
  `lib/ai-constants.ts`의 `GEMINI_MODELS` 허용 목록에 없으면 기본 모델로 안전하게 대체합니다.
  모델을 추가/교체하려면 `GEMINI_MODELS` 배열만 수정하면 됩니다.

### 왜 오픈API가 아니라 정적 파일 기반인가

경기 학원 데이터와 달리 이 데이터셋은 (현재 확보된 방식 기준) 실시간 API가 아니라
**시/도별로 나뉜 대용량 CSV 원본 파일**(지역 1개당 수십~수백MB)로 제공됩니다. 원본을 그대로
서버리스 함수에서 매 요청마다 읽는 건 비현실적이라, **빌드 전 단계에서 미리 집계**해서 씁니다.

### 데이터 파이프라인

```
data/raw/*.csv              원본 CSV (지역별로 여러 개, 이 저장소에 커밋됨)
        │  node scripts/build-commercial-stats.mjs
        ├──▶ data/processed/commercial-stats.json   지역×업종별 집계 결과 (개수·비중·드릴다운용)
        └──▶ public/commercial-stores/<시군구코드>.json   시군구별 업체 목록 (지도 마커·업체명용)
```

- `scripts/build-commercial-stats.mjs`가 `data/raw/`의 모든 CSV를 읽어 **행정동×업종소분류
  조합별 점포 수**로 집계합니다. 원본 CSV의 업종코드(대분류 2자 ⊂ 중분류 4자 ⊂ 소분류 6자)와
  지역코드(시도 2자 ⊂ 시군구 5자 ⊂ 행정동 8자)가 모두 **접두사 계층 구조**라, 소분류코드와
  행정동코드만 저장해도 상위 분류를 문자열 접두사로 복원할 수 있어 매우 작게 압축됩니다
  (전국 기준 약 277만 행 → 집계 후 약 40만 그룹, `commercial-stats.json` 약 9.6MB).
  ⚠️ **집계는 "몇 개인지"만 압축하는 것이지 데이터가 줄어드는 게 아닙니다** — 각 그룹의 점포
  수를 모두 더하면 원본 행 수와 정확히 일치합니다(스크립트 실행 시 콘솔에 두 숫자가 모두
  출력되어 바로 검증할 수 있습니다).
- 같은 스크립트가 **업체명·주소·좌표가 담긴 원본 행**도 시군구 단위로 나눠
  `public/commercial-stores/<시군구코드>.json`에 저장합니다("이 근처에 어떤 업체가 있는지",
  "카페가 몇 개인지"처럼 개별 업체 단위 질문에 답하기 위함). `data/processed/` 대신
  `public/`에 두는 이유: 서버리스 함수(API 라우트)가 **런타임에 계산된 파일명**
  (`${시군구코드}.json`)을 `fs`로 직접 읽으면 Next.js 배포 트레이싱이 그 파일을 감지하지
  못해 실제 배포본에서 파일이 함수에 빠질 수 있습니다. `public/`의 정적 파일은 항상 같은
  오리진에서 서빙되는 게 보장되므로, API 라우트가 `fetch`로 안전하게 가져옵니다.
- `lib/commercial.ts`가 집계 JSON을 읽어 지역/업종 옵션 목록, 조건별 집계·비중·드릴다운을
  계산합니다. `app/api/commercial-analysis/route.ts`(분석 결과)와
  `app/api/commercial-analysis/options/route.ts`(드롭다운 옵션)가 이를 사용합니다.
- `lib/commercial-stores.ts`가 `public/commercial-stores/`에서 시군구 단위 업체 목록을
  가져와 지역/업종 조건으로 필터링합니다. `app/api/commercial-analysis/stores/route.ts`가
  이를 사용하며, `components/analysis/CommercialMap.tsx`(카카오맵, `lib/kakao-map-loader.ts`
  공유 SDK 로더 사용)가 결과를 마커로 표시합니다. 업체가 많으면 지도 성능을 위해
  대표 300개만 균등 샘플링해서 보여주고, 실제 총 개수는 별도로 표시합니다.

### 지역 데이터 범위

전국 16개 시/도(경기·서울은 GitHub 100MB 파일 제한 때문에 여러 CSV로 분할) 원본 CSV가
모두 `data/raw/`에 있으며, 집계 결과는 이를 전부 반영합니다(총 약 277만 개 점포, 256개
시군구, 3,558개 행정동). `/` 페이지의 지역 드롭다운은 실제 데이터가 있는 지역만 자동으로
보여주므로, 지역이 추가/변경되어도 코드 수정 없이 그대로 반영됩니다.

**데이터를 최신화하려면:**
1. 같은 형식(소상공인시장진흥공단 상가업소정보 CSV)의 새 원본 파일로 `data/raw/`의 해당
   지역 파일을 교체(또는 추가)
2. `node scripts/build-commercial-stats.mjs` 재실행 → `data/processed/commercial-stats.json`과
   `public/commercial-stores/*.json`이 전체 지역을 다시 생성합니다
3. 커밋 & 배포 — 코드 변경 없이 드롭다운/통계에 반영됩니다

⚠️ **저장소 용량 참고**: 원본 CSV(`data/raw/`) 약 1.5GB + 업체 목록 파티션
(`public/commercial-stores/`) 약 344MB가 저장소에 포함되어 있습니다. 저장소/배포 용량이
부담스러워지면 원본 CSV를 git 히스토리에서 정리하고 집계·파티션 결과만 남기는 것을
고려해볼 수 있습니다(현재는 재처리에 대비해 원본을 그대로 두었습니다).
