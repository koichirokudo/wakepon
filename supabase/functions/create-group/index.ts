import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders } from '../_shared/cors.ts';

console.log("Start createGroup function...");

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

  const { userId, userName } = await req.json()
  const data = {
    userId: userId,
    userName: userName,
  }
  console.log("Received data:", data);
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

    // householdテーブルに新しいグループを作成
    const { data: householdData, error: householdError } = await supabaseClient
    .from('households').insert({name: userName + "のグループ",})
    .select().single();

    console.log("Created household:", householdData);
    if (householdError) throw new Error(`Error creating household: ${householdError.message}`);
    if (!householdData) throw new Error("Failed to create household");


    // household_membersテーブルにユーザーを追加
    const { error: insertError } = await supabaseClient.from('household_members').insert({
      user_id: userId,
      household_id: householdData.id,
    });
    if (insertError) throw new Error(`Error inserting household member: ${insertError.message}`);

    data.success = true;
    data.message = "Successfully created new group and added user";

  } catch (error) {
    console.error("Error fetching user data:", error);
    data.success = false;
    data.error = error.message || "An error occurred while fetching user data";
    return new Response(
      JSON.stringify({ error: data.error }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  return new Response(
    JSON.stringify(data),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );

  console.log("CreateGroup function completed successfully", data);
});
