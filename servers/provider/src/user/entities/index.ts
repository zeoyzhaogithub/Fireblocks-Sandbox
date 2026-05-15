/**
 * 与 `AuthGuard` 写入的 `request.session` 形状一致（供 `@Session()` 类型标注）。
 */
export interface Logged {
  user: {
    id: string;
  };
}
