export abstract class ToolInstanceForComponent {
  public abstract setResult(result: any[]): void;
  public abstract exportData(): any[];
  public abstract setValid(valid: boolean): void;
}
