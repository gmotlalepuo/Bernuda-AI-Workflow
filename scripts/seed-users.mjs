import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
}

const seedUsers = [
  {
    role: "admin",
    email: process.env.BERNUDA_ADMIN_EMAIL,
    password: process.env.BERNUDA_ADMIN_PASSWORD,
    fullName: process.env.BERNUDA_ADMIN_NAME ?? "Bernuda Administrator",
    department: "Platform"
  },
  {
    role: "designer",
    email: process.env.BERNUDA_DESIGNER_EMAIL,
    password: process.env.BERNUDA_DESIGNER_PASSWORD,
    fullName: process.env.BERNUDA_DESIGNER_NAME ?? "Bernuda Designer",
    department: "Product Design"
  },
  {
    role: "viewer",
    email: process.env.BERNUDA_VIEWER_EMAIL,
    password: process.env.BERNUDA_VIEWER_PASSWORD,
    fullName: process.env.BERNUDA_VIEWER_NAME ?? "Bernuda Viewer",
    department: "Business Review"
  }
];

for (const user of seedUsers) {
  if (!user.email || !user.password) {
    throw new Error(`Missing BERNUDA_${user.role.toUpperCase()}_EMAIL or BERNUDA_${user.role.toUpperCase()}_PASSWORD.`);
  }
}

const supabase = createClient(url, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const { error: schemaError } = await supabase
  .from("workflow_users")
  .select("workflow_id", { head: true })
  .limit(1);

if (schemaError) {
  const missingTable = schemaError.code === "PGRST205" || schemaError.message.includes("workflow_users");
  if (missingTable) {
    throw new Error(
      [
        "The table public.workflow_users is not available in Supabase.",
        "Run the SQL files in docs/SUPABASE_SQL_TO_RUN.md before running npm run seed:users.",
        "Minimum required order:",
        "1. supabase/migrations/202606230001_workflow_core_schema.sql",
        "2. supabase/migrations/202606230002_workflow_auth_roles_rls.sql",
        "3. supabase/seed.sql",
        "If you already ran them, open Supabase Dashboard > Project Settings > API and click Reload schema cache, then retry."
      ].join("\n")
    );
  }
  throw schemaError;
}

async function findAuthUser(email) {
  let page = 1;
  while (page < 20) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 100 });
    if (error) throw error;
    const match = data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
    if (match) return match;
    if (data.users.length < 100) return null;
    page += 1;
  }
  return null;
}

for (const seedUser of seedUsers) {
  let authUser = await findAuthUser(seedUser.email);

  if (!authUser) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: seedUser.email,
      password: seedUser.password,
      email_confirm: true,
      user_metadata: {
        workflow_full_name: seedUser.fullName,
        workflow_role: seedUser.role
      }
    });
    if (error) throw error;
    authUser = data.user;
  } else {
    const { error } = await supabase.auth.admin.updateUserById(authUser.id, {
      password: seedUser.password,
      email_confirm: true,
      user_metadata: {
        ...authUser.user_metadata,
        workflow_full_name: seedUser.fullName,
        workflow_role: seedUser.role
      }
    });
    if (error) throw error;
  }

  const { error: upsertError } = await supabase.from("workflow_users").upsert({
    workflow_auth_user_id: authUser.id,
    workflow_email: seedUser.email,
    workflow_full_name: seedUser.fullName,
    workflow_role: seedUser.role,
    workflow_department: seedUser.department,
    workflow_mfa_enabled: seedUser.role === "admin"
  }, { onConflict: "workflow_auth_user_id" });

  if (upsertError) throw upsertError;

  console.log(`Bernuda ${seedUser.role} ready: ${seedUser.email}`);
}
