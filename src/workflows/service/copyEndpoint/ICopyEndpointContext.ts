import { IPickWebPubSubContext } from "../../common/IPickWebPubSubContext";

export interface ICopyEndpointContext extends IPickWebPubSubContext {
    endpoint?: string;
}
