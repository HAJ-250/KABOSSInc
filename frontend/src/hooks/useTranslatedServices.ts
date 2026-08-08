import { useMemo } from 'react';
import { services, serviceCategories, type ServiceData } from '@/data/services';
import { useI18n } from '@/i18n';

/**
 * Returns services data with all user-facing strings resolved to the
 * currently selected language. Falls back to English via the `t` helper.
 */
export function useTranslatedServices(): ServiceData[] {
  const { t } = useI18n();

  return useMemo(
    () =>
      services.map((s) => ({
        ...s,
        title: t(s.titleKey),
        description: t(s.descriptionKey),
        items: s.itemsKeys.map((k) => t(k)),
      })),
    [t]
  );
}

export function useTranslatedServiceCategories() {
  const { t } = useI18n();
  return useMemo(
    () => serviceCategories.map((c) => ({ ...c, label: t(c.labelKey) })),
    [t]
  );
}
