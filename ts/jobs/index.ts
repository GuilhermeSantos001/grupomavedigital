declare interface JobDataCore {
  email: string
  username: string
}

export interface ConfirmMailData extends JobDataCore {
  token: string
  temporarypass: string | null
}

export interface AccountForgotPasswordData extends JobDataCore {
  token: string
  signature: string
}

export interface AccountRetrieveData extends JobDataCore {
  token: string
}

export interface SessionNewAccessData extends JobDataCore {
  navigator: {
    browser: string
    os: string
    locationIP: string
    internetAdress: string
  }
}

export interface HerculesOrdersData extends JobDataCore {
  title: string
  description: string
  link: string
}

export interface JobData extends
  ConfirmMailData,
  AccountForgotPasswordData,
  AccountRetrieveData,
  SessionNewAccessData,
  HerculesOrdersData { }

export type JobKeys =
  | 'CONFIRM_MAIL'
  | 'ACCOUNT_FORGOT_PASSWORD'
  | 'ACCOUNT_RETRIEVE'
  | 'SESSION_NEW_ACCESS'
  | 'HERCULES_ORDERS'

export { default as ConfirmMail } from './ConfirmMail';
export { default as AccountForgotPassword } from './AccountForgotPassword';
export { default as AccountRetrieve } from './AccountRetrieve';
export { default as SessionNewAccess } from './SessionNewAccess';
export { default as HerculesOrders } from './HerculesOrders';