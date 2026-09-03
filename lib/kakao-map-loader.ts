/**
 * 카카오맵 JS SDK 로더. AcademyMap, CommercialMap 등 여러 지도 컴포넌트가 공유합니다.
 * SDK는 페이지에서 한 번만 로드되면 되므로, 모듈 스코프의 Promise를 캐시해 재사용합니다.
 */
const KAKAO_SDK_ID = "kakao-maps-sdk";

let kakaoSdkLoadPromise: Promise<void> | null = null;

export function loadKakaoSdk(appKey: string): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("브라우저 환경이 아닙니다."));
  }
  if (window.kakao?.maps) {
    return Promise.resolve();
  }
  if (kakaoSdkLoadPromise) {
    return kakaoSdkLoadPromise;
  }

  kakaoSdkLoadPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById(KAKAO_SDK_ID) as HTMLScriptElement | null;

    const handleLoad = () => {
      window.kakao.maps.load(() => resolve());
    };

    if (existing) {
      existing.addEventListener("load", handleLoad, { once: true });
      existing.addEventListener("error", () => reject(new Error("카카오맵 스크립트 로드 실패")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.id = KAKAO_SDK_ID;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(appKey)}&autoload=false`;
    script.async = true;
    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", () => reject(new Error("카카오맵 스크립트 로드 실패")), {
      once: true,
    });
    document.head.appendChild(script);
  });

  return kakaoSdkLoadPromise;
}
