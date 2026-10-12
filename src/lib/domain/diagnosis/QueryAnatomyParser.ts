import { Parser } from "node-sql-parser";
import { QueryAnatomy, TableRef, JoinRef } from "./types";

const parser = new Parser();

export class QueryAnatomyParser {
  /**
   * Safely parses SQL into QueryAnatomy using node-sql-parser.
   * NEVER throws on invalid or unsupported syntax — returns null.
   */
  public static parse(sql: string): QueryAnatomy | null {
    try {
      const astOrList = parser.astify(sql, { database: "postgresql" });
      const ast = Array.isArray(astOrList) ? astOrList[0] : astOrList;

      if (!ast || typeof ast !== "object" || (ast as any).type !== "select") {
        return null;
      }

      const tables: TableRef[] = [];
      const joins: JoinRef[] = [];

      // Extract tables and joins from FROM clause
      if (Array.isArray((ast as any).from)) {
        for (let i = 0; i < (ast as any).from.length; i++) {
          const item = (ast as any).from[i];
          const tableName = item.table || (item.expr ? "(subquery)" : "");
          const tableAlias = item.as || undefined;

          if (tableName) {
            tables.push({ name: tableName, alias: tableAlias });
          }

          if (item.join) {
            joins.push({
              type: (item.join || "INNER JOIN").toUpperCase(),
              table: tableName,
              alias: tableAlias,
              on: item.on,
              using: item.using,
            });
          }
        }
      }

      // Extract columns
      const columns: string[] = [];
      let hasAggregate = false;
      const aggFunctions = new Set(["COUNT", "SUM", "AVG", "MIN", "MAX"]);

      if (Array.isArray((ast as any).columns)) {
        for (const col of (ast as any).columns) {
          if (col.expr) {
            if (col.expr.type === "column_ref") {
              columns.push(col.expr.column);
            } else if (col.expr.type === "aggr_func") {
              hasAggregate = true;
              columns.push(col.as || col.expr.name);
            } else if (col.expr.name && aggFunctions.has(col.expr.name.toUpperCase())) {
              hasAggregate = true;
              columns.push(col.as || col.expr.name);
            } else {
              columns.push(col.as || "*");
            }
          } else if (col === "*") {
            columns.push("*");
          }
        }
      }

      const hasGroupBy = Boolean((ast as any).groupby && (ast as any).groupby.length > 0);
      const hasDistinct = Boolean((ast as any).distinct);

      return {
        tables,
        joins,
        columns,
        where: (ast as any).where || null,
        hasGroupBy,
        hasDistinct,
        hasAggregate,
        rawAst: ast,
      };
    } catch {
      // Fail-safe: return null if parsing fails
      return null;
    }
  }
}
