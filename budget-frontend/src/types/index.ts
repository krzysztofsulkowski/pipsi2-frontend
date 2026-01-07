export enum TransactionType {
    Income = 0,
    Expense = 1
}

export interface Transaction {
    id: number;
    date: string;
    title: string;           
    amount: number;
    type: TransactionType;
    categoryName?: string;
    status?: number;
    paymentMethod?: number;  
    userName?: string;
}

export const mapPaymentMethodIdToName = (id: number | undefined): string => {
    if (id === undefined || id === null) return "-";
    const mapping: Record<number, string> = {
        0: "Gotówka",
        1: "Karta",
        2: "BLIK",
        3: "Przelew",
        10: "Inne"
    };
    return mapping[id] || "Inne";
};

export interface Budget {
    id: number;
    name: string;
    budgetName?: string;
    [key: string]: string | number | undefined | unknown; 
}
