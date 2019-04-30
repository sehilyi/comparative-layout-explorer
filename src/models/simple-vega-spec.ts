export type Spec = {
  data: Data;
  mark: Mark;
  encoding: Encoding;
  transform?: Filter[];
}
export type Data = {
  values: object[];
}
export type Mark = "bar" | "point" | "rect";
export type Encoding = {
  x: Field;
  y: Field;
  color?: Field; // TODO: currently, do not consider separation by color (grouped bar chart)
}
export type Field = {
  field: string;
  type: DataType;
  aggregate?: Aggregate;
}
export type Color = {
  field: string;
  type: DataType;
}
export type DataType = 'nominal' | 'quantitative';
export type Aggregate = 'sum' | 'mean' | 'median' | 'max' | 'min' | 'count';
export type Filter = {
  filter: {
    field: string;
    oneOf: string;  // TODO: change to accept multiple oneOf crieteria with OR
  };
}