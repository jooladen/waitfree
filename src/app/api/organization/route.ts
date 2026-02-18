import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getClientIp, combineFingerprint } from "@/lib/fingerprint";
import {
  ORG_NAME_MIN,
  ORG_NAME_MAX,
  ORG_REGISTER_DAILY_LIMIT,
} from "@/lib/constants";
import type { OrgType } from "@/types";

function normalizeUrl(url: string): string {
  let normalized = url.toLowerCase().trim();
  normalized = normalized.replace(/^https?:\/\//, "");
  normalized = normalized.replace(/\/+$/, "");
  return normalized;
}

function normalizePhone(phone: string): string {
  return phone.replace(/-/g, "").trim();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      type,
      url,
      phone,
      fingerprint: browserFp,
    } = body;

    if (!name || !type || !browserFp) {
      return Response.json(
        { error: "필수 필드가 누락되었습니다 (name, type, fingerprint)" },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();

    if (
      trimmedName.length < ORG_NAME_MIN ||
      trimmedName.length > ORG_NAME_MAX
    ) {
      return Response.json(
        {
          error: `기관 이름은 ${ORG_NAME_MIN}~${ORG_NAME_MAX}자여야 합니다`,
        },
        { status: 400 }
      );
    }

    if (type !== "website" && type !== "phone") {
      return Response.json(
        { error: "type은 'website' 또는 'phone'만 가능합니다" },
        { status: 400 }
      );
    }

    const orgType = type as OrgType;

    if (orgType === "website") {
      if (!url) {
        return Response.json(
          { error: "웹사이트 기관은 URL이 필요합니다" },
          { status: 400 }
        );
      }

      if (!/^https?:\/\/.+/i.test(url)) {
        return Response.json(
          { error: "URL은 http:// 또는 https://로 시작해야 합니다" },
          { status: 400 }
        );
      }
    }

    if (orgType === "phone") {
      if (!phone) {
        return Response.json(
          { error: "전화 기관은 전화번호가 필요합니다" },
          { status: 400 }
        );
      }

      if (!/^[\d-]+$/.test(phone)) {
        return Response.json(
          { error: "전화번호는 숫자와 하이픈만 입력 가능합니다" },
          { status: 400 }
        );
      }

      const digitsOnly = phone.replace(/-/g, "");
      if (digitsOnly.length < 8) {
        return Response.json(
          { error: "전화번호는 최소 8자 이상이어야 합니다" },
          { status: 400 }
        );
      }
    }

    const ip = getClientIp(request);
    const fingerprint = await combineFingerprint(browserFp, ip);

    const supabase = createAdminClient();

    if (orgType === "website") {
      const normalizedUrl = normalizeUrl(url);

      const { data: existing } = await supabase
        .from("organizations")
        .select("id")
        .eq("url", normalizedUrl)
        .single();

      if (existing) {
        return Response.json(
          {
            error: "이미 등록된 URL입니다",
            existingOrgId: existing.id,
          },
          { status: 409 }
        );
      }
    }

    if (orgType === "phone") {
      const normalizedPhone = normalizePhone(phone);

      const { data: existing } = await supabase
        .from("organizations")
        .select("id")
        .eq("phone", normalizedPhone)
        .single();

      if (existing) {
        return Response.json(
          {
            error: "이미 등록된 전화번호입니다",
            existingOrgId: existing.id,
          },
          { status: 409 }
        );
      }
    }

    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { count } = await supabase
      .from("organizations")
      .select("*", { count: "exact", head: true })
      .eq("created_by_fingerprint", fingerprint)
      .gte("created_at", dayAgo);

    if (count !== null && count >= ORG_REGISTER_DAILY_LIMIT) {
      return Response.json(
        { error: "오늘은 더 등록할 수 없어요 (24시간 내 3개 제한)" },
        { status: 429 }
      );
    }

    const insertData: Record<string, unknown> = {
      name: trimmedName,
      type: orgType,
      is_preset: false,
      ping_enabled: orgType === "website",
      created_by_fingerprint: fingerprint,
    };

    if (orgType === "website") {
      insertData.url = normalizeUrl(url);
    } else {
      insertData.phone = normalizePhone(phone);
    }

    const { data: org, error: insertError } = await supabase
      .from("organizations")
      .insert(insertData)
      .select("id, name")
      .single();

    if (insertError || !org) {
      return Response.json(
        { error: "기관 등록에 실패했습니다" },
        { status: 500 }
      );
    }

    return Response.json(
      { success: true, organization: { id: org.id, name: org.name } },
      { status: 201 }
    );
  } catch {
    return Response.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
