export const IAP_PRODUCTS_MAP: Record<string, number> = {
  'fr.academik.app.starter': 10,
  'fr.academik.app.essentiel': 30,
  'fr.academik.app.pro': 100,
};

export const IAP_PRODUCT_IDS = [
  'fr.academik.app.starter',
  'fr.academik.app.essentiel',
  'fr.academik.app.pro',
];

export function isNativeIOS(): boolean {
  const w = window as any;
  return !!(w.Capacitor?.isNativePlatform?.() && w.Capacitor?.getPlatform?.() === 'ios');
}

export function getCdvPurchase(): any {
  return (window as any).CdvPurchase;
}
