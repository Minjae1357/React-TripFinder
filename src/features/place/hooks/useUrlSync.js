import { useRef, useCallback } from 'react';

export function useUrlSync() {
  const isRestoringRef = useRef(false);

  const updateUrlParams = useCallback((newParams = {}) => {
    // 현재 경로가 /place가 아니거나(홈/상세페이지 등), 복원 중일 때는 URL 변경 차단
    if (isRestoringRef.current || window.location.pathname !== '/place') return;

    const url = new URL(window.location.href);
    const params = url.searchParams;

    Object.entries(newParams).forEach(([key, val]) => {
      if (val === null || val === undefined || val === '') {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });

    const queryString = params.toString() ? `?${params.toString()}` : '';
    window.history.replaceState(null, '', `/place${queryString}`);
  }, []);

  return {
    isRestoringRef,
    updateUrlParams,
  };
}