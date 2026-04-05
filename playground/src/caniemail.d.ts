declare module 'caniemail-tool' {
  export interface FeatureIssue {
    title: string;
    support: 'full' | 'partial' | 'none';
    notes: string[];
    position?: {
      start: { line: number; column: number };
      end: { line: number; column: number };
      source?: string;
    };
  }

  export interface FeatureMap<T> extends Map<string, T[]> {}

  export interface FeatureIssues {
    errors: FeatureMap<FeatureIssue>;
    warnings: FeatureMap<FeatureIssue>;
  }

  export interface CanIEmailResult {
    issues: FeatureIssues;
    success: boolean;
  }

  export interface CanIEmailOptions {
    clients: string[];
    css?: string;
    html?: string;
  }

  export interface IssueGroup {
    issue: FeatureIssue;
    clients: string[];
  }

  export function caniemail(options: CanIEmailOptions): CanIEmailResult;
  export function formatIssue(options: {
    client: string;
    issue: FeatureIssue;
    issueType: 'error' | 'warning';
  }): { message: string; notes: string[] };
  export function groupIssues(issues: FeatureMap<FeatureIssue>): IssueGroup[];
  export function sortIssues(groups: IssueGroup[]): IssueGroup[];
  export function parseCss(css: string): unknown;
  export function parseHtml(html: string): unknown;
  export function getAllFeatures(clients: string[]): {
    supported: FeatureMap<FeatureIssue & { url: string }>;
    unsupported: FeatureMap<FeatureIssue & { url: string }>;
  };
}
