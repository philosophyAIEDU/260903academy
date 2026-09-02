/**
 * 카카오맵 JavaScript SDK의 최소 전역 타입 선언.
 * 공식 @types 패키지가 없어 이 프로젝트에서 사용하는 API만 최소한으로 선언합니다.
 */
export {};

declare global {
  interface Window {
    kakao: typeof kakao;
  }

  namespace kakao.maps {
    class LatLng {
      constructor(lat: number, lng: number);
      getLat(): number;
      getLng(): number;
    }

    interface MapOptions {
      center: LatLng;
      level?: number;
    }

    class Map {
      constructor(container: HTMLElement, options: MapOptions);
      setCenter(latlng: LatLng): void;
      setLevel(level: number): void;
      relayout(): void;
    }

    interface MarkerOptions {
      position: LatLng;
      map?: Map;
      title?: string;
    }

    class Marker {
      constructor(options: MarkerOptions);
      setMap(map: Map | null): void;
      getPosition(): LatLng;
    }

    interface InfoWindowOptions {
      content?: string | HTMLElement;
      removable?: boolean;
    }

    class InfoWindow {
      constructor(options?: InfoWindowOptions);
      open(map: Map, marker?: Marker): void;
      close(): void;
      setContent(content: string | HTMLElement): void;
    }

    namespace event {
      function addListener(
        target: Marker | Map,
        type: string,
        handler: (...args: unknown[]) => void
      ): void;
    }

    function load(callback: () => void): void;
  }
}
