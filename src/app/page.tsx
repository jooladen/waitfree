import { createClient } from "@/lib/supabase/server";
import PresetTabs from "@/components/PresetTabs";
import OrgList from "@/components/OrgList";
import Link from "next/link";
import type { Organization } from "@/types";

export default async function Home() {
  let presetOrgs: Organization[] = [];
  let userOrgs: Organization[] = [];

  try {
    const supabase = await createClient();
    const { data: orgs } = await supabase
      .from("organizations")
      .select("*")
      .order("created_at", { ascending: true });

    presetOrgs =
      (orgs?.filter((o) => o.is_preset) as Organization[]) || [];
    userOrgs =
      (orgs?.filter((o) => !o.is_preset) as Organization[]) || [];
  } catch {
    // Supabase 연결 실패 시 빈 데이터로 표시
  }

  return (
    <main>
      <header className="mb-6 text-center">
        <h1 className="text-2xl font-bold">WaitFree</h1>
        <p className="mt-1 text-sm text-gray-500">
          공공기관 지금 터졌나요?
        </p>
      </header>

      {presetOrgs.length > 0 && (
        <section className="mb-6">
          <PresetTabs presets={presetOrgs} />
        </section>
      )}

      <section className="mb-6">
        <OrgList orgs={userOrgs} />
      </section>

      <div className="text-center">
        <Link
          href="/add"
          className="inline-block rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800"
        >
          + 다른 기관 추가하기
        </Link>
      </div>
    </main>
  );
}
