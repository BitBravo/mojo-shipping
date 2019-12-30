export interface Pagination {
    limit: number;
    skip: number;
  }
   
export interface Options extends Pagination {
    [key: string]: any
  }