import type { MessageDictionary } from '../types.js';

export const fr: MessageDictionary = {
  'common.close': 'Fermer',
  'common.retry': 'Réessayer',
  'common.tryAgain': 'Réessayer',
  'common.dismiss': 'Fermer',
  'common.done': 'Terminé',
  'common.loading': 'Chargement…',
  'common.credits': 'crédits',
  'common.bundle': 'forfait',
  'common.continueWith': 'Continuer avec {label}',

  'balance.current': 'Solde actuel',
  'balance.loading': 'Chargement du solde',

  'topUp.defaultLabel': 'Recharger des crédits',
  'topUp.startError': 'Impossible de démarrer la recharge',
  'topUp.title': 'Recharger des crédits',
  'topUp.balanceFallback': 'Recharge',
  'topUp.noBundles': 'Aucun forfait actif pour cette application.',
  'topUp.bundlesLoading': 'Chargement des forfaits',
  'topUp.lowBalance':
    'Votre solde est faible. Rechargez pour continuer.',
  'topUp.lowBalanceWithCost':
    'Solde insuffisant pour cette action ({cost} crédits{feature}). Rechargez pour continuer.',
  'topUp.buy': 'Acheter',
  'topUp.buyAmount': 'Acheter {amount}',

  'ledger.loading': 'Chargement des transactions',
  'ledger.emptyTitle': 'Aucune transaction',
  'ledger.emptyMessage':
    'Les recharges et achats apparaîtront ici.',
  'ledger.errorTitle': 'Impossible de charger les transactions',
  'ledger.loadError': 'Impossible de charger le journal',
  'ledger.refreshError': 'Impossible d’actualiser le journal',
  'ledger.loadMoreError': 'Impossible de charger plus',
  'ledger.kind.topUp': 'Recharge',
  'ledger.kind.purchase': 'Achat',
  'ledger.kind.refund': 'Remboursement',
  'ledger.title.mobileMoney': 'Mobile Money',
  'ledger.status.completed': 'Terminé',
  'ledger.section.today': 'Aujourd’hui',
  'ledger.section.yesterday': 'Hier',
  'ledger.section.earlier': 'Plus tôt',

  'action.unknownFeature': 'Fonctionnalité inconnue : {code}',
  'action.failed': 'Action échouée',
  'action.creditsMeta': '{cost} crédits',

  'payment.country': 'Pays',
  'payment.phone': 'Numéro de téléphone',
  'payment.phonePlaceholder': 'Entrez le numéro',
  'payment.searchCountry': 'Rechercher un pays',
  'payment.noCountries': 'Aucun pays correspondant',
  'payment.selectCurrency': 'Choisir la devise',

  'result.processing': 'Paiement en cours...',
  'result.authorize': 'Veuillez autoriser sur votre appareil',
  'result.failed': 'Paiement échoué',
  'result.genericError': 'Une erreur s’est produite',
  'result.success': 'Recharge réussie',
  'result.creditsAdded':
    '{credits} crédits ont été ajoutés à votre solde.',
};
