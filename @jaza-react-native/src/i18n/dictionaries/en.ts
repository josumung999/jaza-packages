import type { MessageDictionary } from '../types.js';

export const en: MessageDictionary = {
  'common.close': 'Close',
  'common.retry': 'Retry',
  'common.tryAgain': 'Try again',
  'common.dismiss': 'Dismiss',
  'common.done': 'Done',
  'common.loading': 'Loading…',
  'common.credits': 'credits',
  'common.bundle': 'bundle',
  'common.continueWith': 'Continue with {label}',

  'balance.current': 'Current Balance',
  'balance.loading': 'Loading balance',

  'topUp.defaultLabel': 'Top up credits',
  'topUp.startError': 'Could not start top-up',
  'topUp.title': 'Top-up Credits',
  'topUp.balanceFallback': 'Top-up Balance',
  'topUp.noBundles': 'No active bundles for this app.',
  'topUp.bundlesLoading': 'Loading bundles',
  'topUp.lowBalance': 'Your balance is running low. Top up to continue.',
  'topUp.lowBalanceWithCost':
    'Your balance is too low for this action ({cost} credits{feature}). Top up to continue.',
  'topUp.buy': 'Buy',
  'topUp.buyAmount': 'Buy {amount}',

  'ledger.loading': 'Loading transactions',
  'ledger.emptyTitle': 'No transactions yet',
  'ledger.emptyMessage': 'Top-ups and purchases will show up here.',
  'ledger.errorTitle': 'Couldn’t load transactions',
  'ledger.loadError': 'Could not load ledger',
  'ledger.refreshError': 'Could not refresh ledger',
  'ledger.loadMoreError': 'Could not load more',
  'ledger.kind.topUp': 'Top-up',
  'ledger.kind.purchase': 'Purchase',
  'ledger.kind.refund': 'Refund',
  'ledger.title.mobileMoney': 'Mobile Money',
  'ledger.status.completed': 'Completed',
  'ledger.section.today': 'Today',
  'ledger.section.yesterday': 'Yesterday',
  'ledger.section.earlier': 'Earlier',

  'action.unknownFeature': 'Unknown feature: {code}',
  'action.failed': 'Action failed',
  'action.creditsMeta': '{cost} credits',

  'payment.country': 'Country',
  'payment.phone': 'Phone Number',
  'payment.phonePlaceholder': 'Enter number',
  'payment.searchCountry': 'Search country',
  'payment.noCountries': 'No countries match',
  'payment.selectCurrency': 'Select currency',

  'result.processing': 'Processing payment...',
  'result.authorize': 'Please authorize on your device',
  'result.failed': 'Payment failed',
  'result.genericError': 'Something went wrong',
  'result.success': 'Top-up Successful',
  'result.creditsAdded':
    '{credits} credits have been added to your balance.',
};
