import { useState, useEffect } from 'react';
import api from '@/lib/api'; // 프로젝트의 axios 인스턴스 경로

// 1. 백엔드에서 받아올 데이터의 타입을 정의합니다.
interface CategoryInfo {
  category: {
    id: number;
    slug: string;
    name: string;
  };
}

interface ReportData {
  monthlyReadCount: number;
  bookmarkCount: number;
  likeCount: number;
  topCategories: CategoryInfo[];
}

export function useUserReport() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        // 2. 실제 백엔드 API로 GET 요청을 보냅니다.
        const res = await api.get('/users/me/report');
        
        // 3. 받아온 데이터를 상태에 저장합니다.
        setReport(res.data);
      } catch (err: any) {
        console.error("통계 데이터를 불러오지 못했습니다.", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  return { report, loading, error };
}