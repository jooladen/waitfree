"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useFingerprint } from "@/components/FingerprintProvider";
import { useToast } from "@/components/Toast";
import { ORG_NAME_MIN, ORG_NAME_MAX } from "@/lib/constants";
import type { OrgType } from "@/types";

export default function AddPage() {
  const router = useRouter();
  const { fingerprint } = useFingerprint();
  const { showToast } = useToast();

  const [name, setName] = useState("");
  const [type, setType] = useState<OrgType>("website");
  const [url, setUrl] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    const trimmed = name.trim();
    if (trimmed.length < ORG_NAME_MIN || trimmed.length > ORG_NAME_MAX) {
      newErrors.name = `기관 이름은 ${ORG_NAME_MIN}~${ORG_NAME_MAX}자여야 합니다`;
    }

    if (type === "website") {
      if (!url || !/^https?:\/\/.+/.test(url)) {
        newErrors.url =
          "http:// 또는 https://로 시작하는 URL을 입력해주세요";
      }
    } else {
      const digitsOnly = phone.replace(/-/g, "");
      if (!phone || !/^[\d-]+$/.test(phone) || digitsOnly.length < 8) {
        newErrors.phone = "숫자와 하이픈으로 8자 이상 입력해주세요";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate() || !fingerprint || submitting) return;

    setSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        name: name.trim(),
        type,
        fingerprint,
      };
      if (type === "website") {
        body.url = url;
      } else {
        body.phone = phone;
      }

      const res = await fetch("/api/organization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (res.ok) {
        showToast("등록 완료!", "success");
        router.push("/");
      } else if (res.status === 409) {
        showToast("이미 등록된 곳이에요!", "error");
      } else if (res.status === 429) {
        showToast("오늘은 더 등록할 수 없어요", "error");
      } else {
        showToast(data.error || "등록에 실패했습니다", "error");
      }
    } catch {
      showToast("네트워크 오류가 발생했습니다", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main>
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/"
          className="text-lg text-gray-400 transition-colors hover:text-gray-600"
        >
          &larr;
        </Link>
        <h1 className="text-xl font-bold">새 기관 등록</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            기관 이름
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 국세청"
            maxLength={ORG_NAME_MAX}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-500">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            종류
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType("website")}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                type === "website"
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              🌐 웹사이트
            </button>
            <button
              type="button"
              onClick={() => setType("phone")}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                type === "phone"
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              📞 전화
            </button>
          </div>
        </div>

        {type === "website" ? (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.example.go.kr"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
            />
            {errors.url && (
              <p className="mt-1 text-xs text-red-500">{errors.url}</p>
            )}
          </div>
        ) : (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              전화번호
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="1577-1000"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !fingerprint}
          className="w-full rounded-lg bg-gray-900 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "등록 중..." : "등록하기"}
        </button>
      </form>
    </main>
  );
}
