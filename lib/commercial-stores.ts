import "server-only";
import rawStats from "@/data/processed/commercial-stats.json";
import type {
  RawCommercialStats,
  RawStoreTuple,
  Store,
  StoreListQuery,
  StoreListResponse,
} from "@/types/commercial";
import { largeCodeOf, midCodeOf } from "@/lib/commercial";

const stats = rawStats as unknown as RawCommercialStats;
const DEFAULT_LIMIT = 300;

// 같은 서버리스 인스턴스가 여러 요청을 처리하는 동안(warm) 같은 시군구 파티션을 반복해서
// 다시 받아오지 않도록 메모리에 캐시합니다. 콜드 스타트 시에는 다시 받아옵니다.
const partitionCache = new Map<string, RawStoreTuple[]>();

/**
 * data/processed/stores/<시군구코드>.json은 빌드 시 public/commercial-stores/로 복사되어
 * 정적 파일로 서빙됩니다. 서버리스 함수에서 "런타임에 계산된 파일명"을 fs로 직접 읽으면
 * 배포 환경의 파일 트레이싱에서 누락될 수 있어, 같은 오리진의 정적 파일을 fetch로
 * 가져오는 방식을 씁니다(모든 Next.js 배포 환경에서 안전하게 동작).
 */
async function loadPartition(sigunguCode: string, baseUrl: string): Promise<RawStoreTuple[]> {
  const cached = partitionCache.get(sigunguCode);
  if (cached) return cached;

  try {
    const res = await fetch(`${baseUrl}/commercial-stores/${sigunguCode}.json`, {
      cache: "force-cache",
    });
    if (!res.ok) {
      partitionCache.set(sigunguCode, []);
      return [];
    }
    const list = (await res.json()) as RawStoreTuple[];
    partitionCache.set(sigunguCode, list);
    return list;
  } catch {
    return [];
  }
}

function toStore([name, branch, smallCode, dongCode, address, lat, lng]: RawStoreTuple): Store {
  return {
    name,
    branch,
    smallCode,
    smallName: stats.industryNames[smallCode] ?? smallCode,
    midName: stats.industryNames[midCodeOf(smallCode)] ?? "",
    largeName: stats.industryNames[largeCodeOf(smallCode)] ?? "",
    dongCode,
    dongName: stats.dongNames[dongCode] ?? dongCode,
    address,
    lat,
    lng,
  };
}

/** matched 배열이 limit보다 크면, 앞부분에 쏠리지 않도록 일정 간격으로 샘플링합니다. */
function sample<T>(items: T[], limit: number): T[] {
  if (items.length <= limit) return items;
  const step = items.length / limit;
  const result: T[] = [];
  for (let i = 0; i < limit; i++) {
    result.push(items[Math.floor(i * step)]!);
  }
  return result;
}

export async function listStores(
  query: StoreListQuery,
  baseUrl: string
): Promise<StoreListResponse> {
  const partition = await loadPartition(query.sigunguCode, baseUrl);
  const limit = query.limit ?? DEFAULT_LIMIT;

  const matched = partition.filter((tuple) => {
    const [, , smallCode, dongCode] = tuple;
    if (query.dongCode && dongCode !== query.dongCode) return false;
    if (query.smallCode) return smallCode === query.smallCode;
    if (query.midCode) return midCodeOf(smallCode) === query.midCode;
    if (query.largeCode) return largeCodeOf(smallCode) === query.largeCode;
    return true;
  });

  const sampled = sample(matched, limit);
  const stores = sampled.map(toStore);

  let center: StoreListResponse["center"] = null;
  if (query.dongCode && stats.dongCentroids[query.dongCode]) {
    const [lat, lng] = stats.dongCentroids[query.dongCode]!;
    center = { lat, lng };
  } else if (stores.length > 0) {
    const sumLat = stores.reduce((s, st) => s + st.lat, 0);
    const sumLng = stores.reduce((s, st) => s + st.lng, 0);
    center = { lat: sumLat / stores.length, lng: sumLng / stores.length };
  }

  return {
    totalCount: matched.length,
    stores,
    center,
    truncated: matched.length > stores.length,
  };
}
