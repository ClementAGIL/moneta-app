// Friendly names for the generated API schema types (schema.ts is generated: npm run api:types -w @moneta/shared).
import type { components } from './schema';

type S = components['schemas'];

export type ErrorBody = S['Error'];
export type Tokens = S['Tokens'];
export type User = S['User'];
export type Bank = S['Bank'];
export type Account = S['Account'];
export type AccountInput = S['AccountInput'];
export type AccountKind = S['AccountKind'];
export type Category = S['Category'];
export type CategoryInput = S['CategoryInput'];
export type Mapping = S['Mapping'];
export type MappingRequestBody = S['MappingRequest'];
export type ImportPreview = S['ImportPreview'];
export type ImportSummary = S['ImportSummary'];
export type StagedRow = S['StagedRow'];
export type Transaction = S['Transaction'];
export type TransactionPage = S['TransactionPage'];
export type TransactionUpdate = S['TransactionUpdate'];
export type Rule = S['Rule'];
export type RuleInput = S['RuleInput'];
export type StatsSummary = S['StatsSummary'];
export type MonthAmount = S['MonthAmount'];
export type Merchant = S['Merchant'];
export type Totals = S['Totals'];
export type Recurring = S['Recurring'];
export type Budget = S['Budget'];
export type Insight = S['Insight'];
