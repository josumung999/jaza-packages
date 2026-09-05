import type { MessageDictionary } from '../types.js';

export const sw: MessageDictionary = {
  'common.close': 'Funga',
  'common.retry': 'Jaribu tena',
  'common.tryAgain': 'Jaribu tena',
  'common.dismiss': 'Ondoa',
  'common.done': 'Imekamilika',
  'common.loading': 'Inapakia…',
  'common.credits': 'kredi',
  'common.bundle': 'kifurushi',
  'common.continueWith': 'Endelea na {label}',

  'balance.current': 'Salio la sasa',
  'balance.loading': 'Inapakia salio',

  'topUp.defaultLabel': 'Ongeza kredi',
  'topUp.startError': 'Imeshindwa kuanza kuongeza',
  'topUp.title': 'Ongeza Kredi',
  'topUp.balanceFallback': 'Ongeza Salio',
  'topUp.noBundles': 'Hakuna vifurushi vilivyo hai kwa programu hii.',
  'topUp.bundlesLoading': 'Inapakia vifurushi',
  'topUp.lowBalance':
    'Salio lako linapungua. Ongeza ili uendelee.',
  'topUp.lowBalanceWithCost':
    'Salio halitoshi kwa kitendo hiki ({cost} kredi{feature}). Ongeza ili uendelee.',
  'topUp.buy': 'Nunua',
  'topUp.buyAmount': 'Nunua {amount}',

  'ledger.loading': 'Inapakia miamala',
  'ledger.emptyTitle': 'Hakuna miamala bado',
  'ledger.emptyMessage':
    'Ongezo na ununuzi zitaonekana hapa.',
  'ledger.errorTitle': 'Imeshindwa kupakia miamala',
  'ledger.loadError': 'Imeshindwa kupakia daftari',
  'ledger.refreshError': 'Imeshindwa kuonyesha upya daftari',
  'ledger.loadMoreError': 'Imeshindwa kupakia zaidi',
  'ledger.kind.topUp': 'Ongezo',
  'ledger.kind.purchase': 'Ununuzi',
  'ledger.kind.refund': 'Rejesho',
  'ledger.title.mobileMoney': 'Mobile Money',
  'ledger.status.completed': 'Imekamilika',
  'ledger.section.today': 'Leo',
  'ledger.section.yesterday': 'Jana',
  'ledger.section.earlier': 'Awali',

  'action.unknownFeature': 'Kipengele kisichojulikana: {code}',
  'action.failed': 'Kitendo kimeshindwa',
  'action.creditsMeta': '{cost} kredi',

  'payment.country': 'Nchi',
  'payment.phone': 'Nambari ya simu',
  'payment.phonePlaceholder': 'Ingiza nambari',
  'payment.searchCountry': 'Tafuta nchi',
  'payment.noCountries': 'Hakuna nchi zinazolingana',
  'payment.selectCurrency': 'Chagua sarafu',

  'result.processing': 'Malipo yanaendelea...',
  'result.authorize': 'Tafadhali idhinisha kwenye kifaa chako',
  'result.failed': 'Malipo yameshindwa',
  'result.genericError': 'Kuna hitilafu iliyotokea',
  'result.success': 'Ongezo limefaulu',
  'result.creditsAdded':
    'Kredi {credits} zimeongezwa kwenye salio lako.',
};
