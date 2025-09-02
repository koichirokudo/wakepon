import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Category } from '../types';
import { useAuth } from '../contexts/AuthContext';

export default function Rlstest() {
  const { user, member } = useAuth();

  const testHouseholdAccess = async () => {
    console.log('=== Testing household access ===');

    // 1. 自分の情報
    const { data: myInfo } = await supabase
      .from('users')
      .select('id, name')
      .eq('id', user?.id)
      .single();
    console.log('My info:', myInfo);

    // 2. 全ユーザー（同じ世帯のみ見えるはず）
    const { data: allUsers } = await supabase
      .from('users')
      .select('id, name');
    console.log('All visible users:', allUsers);

    // 3. household_members
    const { data: householdMembers } = await supabase
      .from('household_members')
      .select('user_id, household_id');
    console.log('Visible household members:', householdMembers);

    // 4. households
    const { data: households } = await supabase
      .from('households')
      .select('id, name');
    console.log('Visible households:', households);
  };

  testHouseholdAccess()
  return (
    <h1>RLSポリシーテストページ</h1>
  );
}