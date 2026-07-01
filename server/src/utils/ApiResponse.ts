/**
 * Node Imports
 */


export class ApiResponse<T = unknown>{
    success : boolean;
    data? : T;
    message? : string;

    constructor(success : boolean, data? : T, message? : string){
        this.success = success;
        if (data !== undefined) this.data = data;
        if (message !== undefined) this.message = message;
    }
}