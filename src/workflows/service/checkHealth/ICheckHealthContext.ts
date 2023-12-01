import { IPickWebPubSubContext } from "../../common/IPickWebPubSubContext";

export interface ICheckHealthContext extends IPickWebPubSubContext {
    endpoint?: string;
}
