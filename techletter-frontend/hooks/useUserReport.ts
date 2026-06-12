import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface CategoryInfo {
  category: {
    id: number;
    slug: string;
    name: string;
  };
}

export interface UserReportData {
  monthlyReadCount: number;
  bookmarkCount: number;
  likeCount: number;
  commentCount: number;
  recentViewCount: number;
  topCategories: CategoryInfo[];
}

const emptyReport: UserReportData = {
  monthlyReadCount: 0,
  bookmarkCount: 0,
  likeCount: 0,
  commentCount: 0,
  recentViewCount: 0,
  topCategories: [],
};

export function useUserReport() {
  const [report, setReport] = useState<UserReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    api.get('/users/me/report')
      .then((response) => {
        setReport({ ...emptyReport, ...response.data });
        setError(null);
      })
      .catch((requestError) => {
        setReport(emptyReport);
        setError(requestError);
      })
      .finally(() => setLoading(false));
  }, []);

  return { report, loading, error };
}
