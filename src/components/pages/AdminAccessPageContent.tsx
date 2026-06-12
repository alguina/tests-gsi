"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { verifyAdminAccessAction } from "@/app/actions/admin";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { useI18n } from "@/lib/i18n/useI18n";

export function AdminAccessPageContent() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const result = await verifyAdminAccessAction(token);

    if (!result.ok) {
      setError(t("admin.accessDenied"));
      setIsSubmitting(false);
      return;
    }

    router.push(searchParams.get("next") ?? "/import");
    router.refresh();
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow={t("admin.eyebrow")}
        title={t("admin.accessTitle")}
        description={t("admin.accessDescription")}
      />
      <Card as="section" className="max-w-lg">
        <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
          <label className="block text-sm font-medium text-text-primary">
            {t("admin.accessTokenLabel")}
            <Input
              type="password"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              placeholder={t("admin.accessTokenPlaceholder")}
              className="mt-2"
              autoComplete="off"
            />
          </label>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <Button type="submit" disabled={isSubmitting || !token.trim()}>
            {t("admin.unlock")}
          </Button>
        </form>
      </Card>
    </PageContainer>
  );
}
