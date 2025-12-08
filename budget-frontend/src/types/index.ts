export interface Transaction {
    id: number;
    title: string;
    categoryName: string;
    amount: number;
    type: 0 | 1;
    userName: string;
    date: string;
}

export interface Budget {
    id: number;
    name: string;
    budgetName?: string;
    [key: string]: string | number | undefined | unknown; 
}
