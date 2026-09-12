import type { MessageDictionary } from '../types.js';

export const ln: MessageDictionary = {
  'common.close': 'Kangá',
  'common.retry': 'Meka lisusu',
  'common.tryAgain': 'Meka lisusu',
  'common.dismiss': 'Boya',
  'common.done': 'Esili',
  'common.loading': 'Ezali kozwa…',
  'common.credits': 'ba crédit',
  'common.bundle': 'paquet',
  'common.continueWith': 'Koba na {label}',

  'balance.current': 'Solde ya sikoyo',
  'balance.loading': 'Ezali kozwa solde',

  'topUp.defaultLabel': 'Kobakisa ba crédit',
  'topUp.startError': 'Ekoki te kobanda kobakisa',
  'topUp.title': 'Kobakisa ba crédit',
  'topUp.balanceFallback': 'Kobakisa solde',
  'topUp.noBundles': 'Paquet ya mosala ezali te mpo na appli oyo.',
  'topUp.bundlesLoading': 'Ezali kozwa ba paquet',
  'topUp.lowBalance':
    'Solde na yo ezali moke. Bakisa mpo okoba.',
  'topUp.lowBalanceWithCost':
    'Solde ekoki te mpo na action oyo ({cost} ba crédit{feature}). Bakisa mpo okoba.',
  'topUp.buy': 'Somba',
  'topUp.buyAmount': 'Somba {amount}',

  'ledger.loading': 'Ezali kozwa ba transaction',
  'ledger.emptyTitle': 'Transaction ezali te',
  'ledger.emptyMessage':
    'Ba bakiseli mpe ba sombeli ekomonana awa.',
  'ledger.errorTitle': 'Ekoki te kozwa ba transaction',
  'ledger.loadError': 'Ekoki te kozwa journal',
  'ledger.refreshError': 'Ekoki te kozongisa journal',
  'ledger.loadMoreError': 'Ekoki te kozwa mingi',
  'ledger.kind.topUp': 'Bakiseli',
  'ledger.kind.purchase': 'Sombeli',
  'ledger.kind.refund': 'Bozongisi',
  'ledger.title.mobileMoney': 'Mobile Money',
  'ledger.status.completed': 'Esili',
  'ledger.section.today': 'Lelo',
  'ledger.section.yesterday': 'Lobi',
  'ledger.section.earlier': 'Liboso',

  'action.unknownFeature': 'Fonctionnalité eyebani te: {code}',
  'action.failed': 'Action elongi te',
  'action.creditsMeta': '{cost} ba crédit',

  'payment.country': 'Ekólo',
  'payment.phone': 'Numéro ya téléphone',
  'payment.phonePlaceholder': 'Kotia numéro',
  'payment.searchCountry': 'Luka ekólo',
  'payment.noCountries': 'Ekólo ezali te',
  'payment.selectCurrency': 'Pona monnaie',

  'result.processing': 'Paiement ezali kosala...',
  'result.authorize': 'Svp ndima na appareil na yo',
  'result.failed': 'Paiement elongi te',
  'result.genericError': 'Likambo moko esalemi',
  'result.success': 'Bakiseli elongi',
  'result.creditsAdded':
    'Ba crédit {credits} ebakisami na solde na yo.',
};
