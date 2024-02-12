import { number } from "fp-ts";


type User = {
    id: string;
    userName: string;
    role: string;
    status: boolean;
}


export class Users {
    private _userStatus: boolean;
    private _users: Array<User>;
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
        this._users = [];
        this._userStatus = false;
    }

    getUserStatus(){
      return this._userStatus;
    }

    setUserStatus(status: boolean){
      this._userStatus = status;
    }
}