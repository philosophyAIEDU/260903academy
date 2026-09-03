# 경기도 학원 검색

경기도교육청 학원 현황 오픈API(경기데이터드림, `Tbinstutm`)를 이용해 지역·업종·교습과정으로
학원을 검색하고, 카카오맵에서 위치를 확인할 수 있는 Next.js 웹 서비스입니다.

## 기술 스택

- Next.js 14 (App Router) + TypeScript (strict)
- Tailwind CSS
- 카카오맵 JavaScript SDK
- React 기본 hooks (별도 상태관리 라이브러리 없음)

## 프로젝트 구조

```
app/
├── layout.tsx, page.tsx, globals.css
└── api/academies/route.ts   # 경기데이터드림 API 서버 프록시
components/
├── SearchForm.tsx            # 시군/읍면동/업종/학원명 검색 UI
├── AcademyMap.tsx             # 카카오맵 + 마커 + 인포윈도우
├── AcademyList.tsx            # 검색 결과 리스트
├── IndustryStats.tsx          # 업종별 통계 요약 (선택 기능)
├── FavoriteToggle.tsx         # 즐겨찾기 버튼 (선택 기능)
└── DataSourceNotice.tsx       # 출처/기준일자 안내
lib/
├── gg-api.ts     # 원본 API 호출 + 페이지네이션(pIndex 증가) + 응답 파싱
├── normalize.ts  # 원본 row → Academy 정규화
└── constants.ts  # DATA_REFERENCE_DATE, 시군 목록 등
types/
├── academy.ts    # Academy, AcademyApiRow 등 타입 정의
└── kakao.d.ts    # 카카오맵 SDK 최소 타입 선언
hooks/
└── useFavorites.ts  # 로컬스토리지 기반 즐겨찾기
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

브라우저에서 http://localhost:3000 접속 후, 시군을 선택하고 검색해보세요.

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

## 상권분석 (`/analysis`)

경기 학원 검색과는 별도로, **소상공인시장진흥공단 상가(상권)정보**(전국 업종별 점포 현황)를
기반으로 지역·업종을 선택하면 점포 수·비중·하위 업종/행정동별 분포를 보여주는 기능입니다.
소상공인 컨설팅을 염두에 두고 아래 기능도 함께 제공합니다:

- **경쟁강도 진단**: 선택한 업종이 선택한 지역에 상위 지역(행정동→시군구, 시군구→시도) 평균
  대비 몇 배 밀집해 있는지 계산해 "매우 낮음~매우 높음(포화)" 5단계로 보여줍니다
  (`analyzeSaturation`, `components/analysis/SaturationCard.tsx`).
- **업종 공백 분석**: 같은 비교 기준 대비 이 지역에 상대적으로 적은 업종을 순위로 보여줘
  창업 기회 후보를 참고할 수 있습니다(`analyzeGaps`, `components/analysis/GapAnalysisPanel.tsx`).
- **지역 비교 (`/analysis/compare`)**: 후보지 두 곳(지역+업종)을 나란히 놓고 점포 수·비중·
  경쟁강도·업종 구성을 비교합니다.
- **CSV 다운로드**: 분석 결과, 업체 목록, 지역 비교 결과를 각각 CSV로 내려받아 고객 자료로
  바로 쓸 수 있습니다(`lib/csv-export.ts`).

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
  (전남·광주 지역 기준 17만 5천여 행 → 집계 후 3만 2천여 그룹, 약 800KB).
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

### 지역이 아직 일부만 있는 이유

전국 단위 원본 CSV를 한 번에 전달받기 어려워(용량 문제), **지역별로 하나씩 추가**하는 구조로
설계했습니다. 현재는 `data/raw/`에 있는 파일만큼만 지원되며(현재: 전남·광주),
`/analysis` 페이지의 지역 드롭다운은 실제 데이터가 있는 지역만 자동으로 보여줍니다.

**지역을 추가하려면:**
1. 같은 형식(소상공인시장진흥공단 상가업소정보 CSV)의 다른 지역 파일을 `data/raw/`에 추가
2. `node scripts/build-commercial-stats.mjs` 재실행 → `data/processed/commercial-stats.json`과
   `public/commercial-stores/*.json`이 전체(기존 지역 포함) 다시 생성됩니다
3. 커밋 & 배포 — 코드 변경 없이 드롭다운에 새 지역이 자동으로 나타납니다

⚠️ **저장소 용량 참고**: 지역 1개(전남·광주)당 원본 CSV 약 99MB + 업체 목록 파티션 약
24MB가 저장소에 쌓입니다. 전국(17개 시/도)까지 다 채우면 수 GB 규모가 될 수 있어, 나중에는
원본 CSV(`data/raw/`)를 git 히스토리에서 정리하고 집계·파티션 결과만 남기는 것을 고려해볼
수 있습니다(현재는 재처리에 대비해 원본을 그대로 두었습니다).
