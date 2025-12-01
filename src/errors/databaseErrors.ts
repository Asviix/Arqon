// src\errors\databaseErrors.ts

import { AppError } from "./appErrors";

export class DatabaseError extends AppError {
    constructor(message: string, sql?: string, params?: any[]) {
        super(message)
    };
};

export class TransactionError extends AppError{};

export class InsertError extends AppError {};
export class NoReturnError extends InsertError {};

export class SelectError extends AppError {};
export class DuplicateKeyError extends SelectError {};