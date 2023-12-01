import { IPickServiceContext } from "../../common/IPickServiceContext";

export interface ICheckHealthContext extends IPickServiceContext {
    endpoint?: string;
}
