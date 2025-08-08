import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders } from '../_shared/cors.ts';

console.log("Starting invite function...");

Deno.serve(async (req) => {

  // CORS Preflight 対応
  if (req.method === 'OPTIONS') {
    return new Response("ok", { headers: corsHeaders });
  }

  // AuthorizationヘッダーからJWTを取得
  const token = req.headers.get('Authorization')?.replace('Bearer ', '')

  if (!token) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { inviteCode } = await req.json()
  const data = {
    inviteCode: inviteCode,
  }

  try {
    // Supabaseクライアントの初期化
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    // ユーザーの認証情報を取得
    const { data: userData, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !userData?.user) throw new Error("User not authenticated");

    // 招待コードの存在確認
    const { data: inviteData, error: inviteError } = await supabaseClient.from('invite_codes')
      .select('id, household_id, is_used')
      .eq('code', inviteCode)
      .single();
    if (inviteError) throw new Error(`Error fetching invite code: ${inviteError.message}`);
    if (!inviteData) throw new Error("Invalid invite code");
    if (inviteData.is_used) throw new Error("Invite code has already been used");

    // 現在のログインユーザーIDを取得
    const userId = userData.user.id;

    // household_membersテーブルにユーザーを追加
    const { error: insertError } = await supabaseClient.from('household_members').insert({
      user_id: userId,
      household_id: inviteData.household_id,
    });
    if (insertError) throw new Error(`Error inserting household member: ${insertError.message}`);

    // 招待コードを使用済みに更新
    const { error: updateError } = await supabaseClient.from('invite_codes')
      .update({ is_used: true })
      .eq('id', inviteData.id);
    if (updateError) throw new Error(`Error updating invite code: ${updateError.message}`);
    data.success = true;
    data.message = "Successfully joined household using invite code";

  } catch (error) {
    // エラーハンドリング
    console.error("Error processing invite code:", error);
    data.success = false;
    data.error = error.message || "An error occurred while processing the invite code";

    // エラーが発生した場合は、エラーメッセージを設定
    return new Response(
      JSON.stringify({ error: data.error }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // 成功した場合のレスポンス
  return new Response(
    JSON.stringify(data),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );

  console.log("Invite function completed successfully", data);
});
