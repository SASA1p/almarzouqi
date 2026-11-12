import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/types';

export function useActiveProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: queryError } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    if (queryError) {
      setError('تعذر تحميل المنتجات الآن، حاول مرة أخرى.');
    } else {
      setProducts((data ?? []) as Product[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { products, loading, error, reload: load };
}
