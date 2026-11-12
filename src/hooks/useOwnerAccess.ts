import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export type OwnerAccessStatus = 'loading' | 'signed_out' | 'not_owner' | 'owner' | 'error';

export interface OwnerAccess {
  status: OwnerAccessStatus;
  email: string | null;
}

export function useOwnerAccess() {
  const [access, setAccess] = useState<OwnerAccess>({ status: 'loading', email: null });

  useEffect(() => {
    let active = true;

    const resolve = async (session: Session | null) => {
      if (!session) {
        if (active) setAccess({ status: 'signed_out', email: null });
        return;
      }
      const { data, error } = await supabase
        .from('shop_owners')
        .select('user_id')
        .eq('user_id', session.user.id)
        .maybeSingle();
      if (!active) return;
      if (error) {
        setAccess({ status: 'error', email: session.user.email ?? null });
        return;
      }
      setAccess({ status: data ? 'owner' : 'not_owner', email: session.user.email ?? null });
    };

    supabase.auth.getSession().then(({ data }) => resolve(data.session));
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        await resolve(session);
      })();
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  return access;
}
