export interface ErdColumn {
  name: string;
  type: string;
  pk: boolean;
  fk: boolean;
  nullable: boolean;
}

export interface ErdTable {
  name: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  columns: ErdColumn[];
}

export interface ErdRelation {
  from_table: string;
  from_column: string;
  to_table: string;
  to_column: string;
}

export interface ErdData {
  tables: ErdTable[];
  relations: ErdRelation[];
}

export interface LineCoords {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

export class ErdBuilder {
  /**
   * Prepares and normalizes ERD data with coordinates for SVG rendering.
   */
  public static buildLayout(data: any): ErdData {
    if (!data || !Array.isArray(data.tables)) {
      return { tables: [], relations: [] };
    }

    const TABLE_WIDTH = 220;
    const ROW_HEIGHT = 28;
    const HEADER_HEIGHT = 38;

    const tables: ErdTable[] = data.tables.map((tbl: any, idx: number) => {
      // Default grid layout if x/y not present
      const defaultX = 40 + (idx % 3) * 280;
      const defaultY = 40 + Math.floor(idx / 3) * 260;

      const columnsCount = Array.isArray(tbl.columns) ? tbl.columns.length : 0;
      const calculatedHeight = HEADER_HEIGHT + columnsCount * ROW_HEIGHT + 10;

      return {
        name: tbl.name,
        x: typeof tbl.x === "number" ? tbl.x : defaultX,
        y: typeof tbl.y === "number" ? tbl.y : defaultY,
        width: TABLE_WIDTH,
        height: calculatedHeight,
        columns: Array.isArray(tbl.columns) ? tbl.columns : [],
      };
    });

    const relations: ErdRelation[] = Array.isArray(data.relations)
      ? data.relations
      : [];

    return { tables, relations };
  }

  /**
   * Calculates connection points between two related tables.
   */
  public static calculateRelationLine(
    rel: ErdRelation,
    tablesMap: Map<string, ErdTable>
  ): LineCoords | null {
    const fromTable = tablesMap.get(rel.from_table);
    const toTable = tablesMap.get(rel.to_table);

    if (!fromTable || !toTable) return null;

    const fromX = fromTable.x + (fromTable.width ?? 220) / 2;
    const fromY = fromTable.y + (fromTable.height ?? 150) / 2;
    const toX = toTable.x + (toTable.width ?? 220) / 2;
    const toY = toTable.y + (toTable.height ?? 150) / 2;

    return { fromX, fromY, toX, toY };
  }
}
