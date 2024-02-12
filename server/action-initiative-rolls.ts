import { number } from "fp-ts";


export type UserRoll = {
    id: string;
    userName: string;
    role: string;
    status: boolean;
}


export class AIR {
    private _usersRolls: Array<UserRoll>;
    private _processTask: <TReturnType = unknown>(
      operationIdentifier: string,
      process: () => unknown
    ) => Promise<TReturnType>;
  
    constructor({
      processTask,
      databaseConection,
    }: {
      processTask: <TReturnType = unknown>(
        operationIdentifier: string,
        process: () => unknown
      ) => Promise<TReturnType>;
      databaseConection: string;
    }) {
        this._processTask = processTask;
        this._usersRolls = [];
    }
}