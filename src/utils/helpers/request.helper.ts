
import { AsyncLocalStorage } from "async_hooks";
type AsyncLocalStorageType= {
    corealtionId:string
}

export const asyncLocalStorage = new AsyncLocalStorage<AsyncLocalStorageType>();

export const getCorealtionId  = () => {
    const asyncStorage = asyncLocalStorage.getStore();
    return asyncStorage?.corealtionId || "corealtionId-Not-Found"
}