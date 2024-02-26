/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import { AzureNameStep } from "@microsoft/vscode-azext-utils";
import { KnownUserEvents, eventHandlerSystemEvents, eventHandlerUserEvents } from "../../../constants";
import { localize } from "../../../utils";
import  { type IUpdateEventHandlerContext } from "../common/IUpdateEventHandlerContext";
import  { type ICreateOrUpdateHubSettingContext } from "./ICreateEventHandlerContext";


export class InputHubSettingStep extends AzureNameStep<ICreateOrUpdateHubSettingContext> {
    constructor(public readonly isCreate = true) {
        super();
    }

    public async prompt(context: ICreateOrUpdateHubSettingContext): Promise<void> {
        if (!(context.hubProperties?.eventHandlers)) throw new Error(`Invalid hub properties ${context.hubProperties} or hub name ${context.hubName}`);
        await new InputHubNameStep().prompt(context);
        while (true) {
            const singleEventHandler: IUpdateEventHandlerContext = {
                ui: context.ui, telemetry: context.telemetry, errorHandling: context.errorHandling, valuesToMask: context.valuesToMask, registerActivity: context.registerActivity,
                hubName: context.hubName,
                eventHandler: {
                    urlTemplate: "",
                    userEventPattern: "",
                    systemEvents: [],
                    auth: {}
                }
            }
            await new InputUrlTemplateStep().prompt(singleEventHandler);
            await new SelectSystemEventsStep().prompt(singleEventHandler);
            await new InputUserEventsStep().prompt(singleEventHandler);
            context.hubProperties.eventHandlers.push(singleEventHandler.eventHandler!);

            const askNeedMore = context.ui.showQuickPick(
                [{ label: "No", data: "No" }, { label: "Yes", data: "Yes" }],
                { placeHolder: localize('moreEventHandler', 'Do you want to add more event handler?') });
            const needMore = await askNeedMore;
            if (needMore.data === "No") break;
        }
    }

    public shouldPrompt(context: ICreateOrUpdateHubSettingContext): boolean {
        if (!context.hubProperties) throw new Error(`Invalid hub properties ${context.hubProperties}`);
        return true;
    }

    protected async isRelatedNameAvailable(_context: ICreateOrUpdateHubSettingContext, _name: string): Promise<boolean> {
        return false;
    }
}

export class InputUrlTemplateStep extends AzureNameStep<IUpdateEventHandlerContext> {
    constructor(public readonly defaultUrlTemplate = "https://") {
        super();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this.valideteUrlTemplate = this.valideteUrlTemplate.bind(this);
    }

    public async prompt(context: IUpdateEventHandlerContext): Promise<void> {
        if (!context.eventHandler) throw new Error(`Invalid event handler ${context.eventHandler}`);

        const prompt: string = localize('eventHandlerPrompt', 'Enter an URL Template for the event Handler.');
        const inputBox = context.ui.showInputBox({
            prompt,
            validateInput: this.valideteUrlTemplate,
            value: this.defaultUrlTemplate
        });
        context.eventHandler.urlTemplate = await inputBox;
    }

    public shouldPrompt(context: IUpdateEventHandlerContext): boolean {
        return true;
    }

    protected async isRelatedNameAvailable(_context: IUpdateEventHandlerContext, _name: string): Promise<boolean> {
        return false;
    }

    private async valideteUrlTemplate(urlTemplate: string): Promise<string | undefined> {
        if (!urlTemplate) {
            return localize('emptyUrlTemplate', 'The Url Template Is Required.');
        }
        try {
            new URL(urlTemplate);
            return undefined;
        } catch (err) {
            return localize('invalidUrlTemplate', `The URL template must be a valid URL.`);
        }
    }
}

export class InputUserEventsStep extends AzureNameStep<IUpdateEventHandlerContext> {
    constructor(public readonly defaultUserEvents = {}) {
        super();
    }

    public async prompt(context: IUpdateEventHandlerContext): Promise<void> {
        const placeHodler: string = localize('userEventsPrompt', 'Select User Events');
        const candidateItems = eventHandlerUserEvents.map((event) => ({ label: event, data: event }));
        const pickBox = context.ui.showQuickPick(candidateItems, {
            placeHolder: placeHodler,
        })
        const userEvent = (await pickBox).data;
        let userEventPattern: string = "";
        switch (userEvent) {
            case KnownUserEvents.All: userEventPattern = "*"; break;
            case KnownUserEvents.None: userEventPattern = ""; break;
            case KnownUserEvents.Specify:
                const showInputBox = context.ui.showInputBox({
                    prompt: localize('userEventsPatternPrompt', 'Speicify the user events. Gets or sets the matching pattern for event names. There are 3 kinds of patterns supported: 1. "*", it matches any event name 2. Combine multiple events with ",", for example "event1,event2", it matches event "event1" and "event2" 3. A single event name, for example, "event1", it matches "event1"'),
                    value: ""
                });
                userEventPattern = (await showInputBox).trim();
                break;
            default:
                throw new Error(`Invalid User Event Type ${userEvent}`);
        }
        context.eventHandler!.userEventPattern = userEventPattern;
    }

    public shouldPrompt(context: IUpdateEventHandlerContext): boolean {
        if (!context.eventHandler) throw new Error(`Invalid event handler ${context.eventHandler}`);
        return true;
    }

    protected async isRelatedNameAvailable(_context: IUpdateEventHandlerContext, _name: string): Promise<boolean> {
        return false;
    }
}

export class SelectSystemEventsStep extends AzureNameStep<IUpdateEventHandlerContext> {
    public async prompt(context: IUpdateEventHandlerContext): Promise<void> {
        if (!context.eventHandler) throw new Error(`Invalid event handler ${context.eventHandler}`);
        const placeHodler: string = localize('systemEventsPrompt', 'Select System Events');
        const candidateItems = eventHandlerSystemEvents.map((event) => ({ label: event, data: event }));
        const selectedItems = await (context.ui.showQuickPick(candidateItems, {
            placeHolder: placeHodler,
            canPickMany: true
        }));
        context.eventHandler.systemEvents = selectedItems.map((item) => item.data);
    }

    public shouldPrompt(context: IUpdateEventHandlerContext): boolean { return true; }

    protected async isRelatedNameAvailable(_context: IUpdateEventHandlerContext, _name: string): Promise<boolean> {
        return false;
    }
}

export class InputHubNameStep extends AzureNameStep<ICreateOrUpdateHubSettingContext> {
    //refer:
    private static readonly VALID_HUB_REGEX: RegExp = /^[A-Za-z][A-Za-z0-9_`,.[/\]]{0,127}$/;

    constructor() {
        super();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this.validateWebPubSubName = this.validateWebPubSubName.bind(this);
    }

    public async prompt(context: ICreateOrUpdateHubSettingContext): Promise<void> {
        const prompt: string = localize('hubNamePrompt', 'Enter a name for the new hub.');
        context.hubName = (await context.ui.showInputBox({ prompt, validateInput: this.validateWebPubSubName })).trim();
        return Promise.resolve(undefined);
    }

    public shouldPrompt(context: ICreateOrUpdateHubSettingContext): boolean {
        return true;
    }

    protected async isRelatedNameAvailable(_context: ICreateOrUpdateHubSettingContext, _name: string): Promise<boolean> {
        return false;
    }

    private async validateWebPubSubName(name: string): Promise<string | undefined> {
        name = name.trim();
        if (!name) {
            return localize('emptyName', 'The hub name is required.');
        }
        if (!InputHubNameStep.VALID_HUB_REGEX.test(name)) {
            return localize('invalidHubName', `
                    The name is invalid.
                    The first character must be a letter.
                    The ther characters must be a letter, number, or one of {'_', ',', '.', '/', '\`'}
                    The value must be between 1 and 127 characters long.
                `);
        } else {
            // const webPubSubs: EnhancedWebPubSub[] = await this.service.getWebPubSub();
            // if (!webPubSubs.every(wps => wps.name !== name)) {
            //     return localize('existWebPubSubName', "Web PubSub with this name already exists.");
            // }
        }
        return undefined;
    }
}

// export async function createHubSetting(context: IActionContext, node?: HubsItem | ServiceItem): Promise<void> {
//     let serviceItem: ServiceItem;
//     if (node) {
//         serviceItem = node instanceof HubsItem ? node.service : node;
//     }
//     else {
//         serviceItem = await pickService(context, { title: localize('selectServer', 'Select Web PubSub Hub Service'), });
//     }

//     const subContext = createSubscriptionContext(serviceItem.subscription);
//     const wizardContext: ICreateHubContext = {
//         ...context,
//         ...await createActivityContext(),
//         subscription: subContext,
//         resourceGroupName: serviceItem.resourceGroup,
//         webPubSubResourceName: serviceItem.name,
//         hubSetting: { properties: { eventHandlers: [], eventListeners: [] } }
//     };

//     const client = createAzureClient([context, subContext], WebPubSubManagementClient);

//     const wizard: AzureWizard<ICreateHubContext> = new AzureWizard(wizardContext, {
//         title: localize('createWebPubSubHub', 'Create New Hub In "{0}"', serviceItem.name),
//         promptSteps: [new InputHubNameStep()],
//         executeSteps: [new CreateHubStep(client)]
//     });

//     await wizard.prompt();
//     wizardContext.activityTitle = utils.localize('createWebPubSubHub', 'Create New Web PubSub Hub "{0}"', wizardContext.hubName);

//     await ext.state.runWithTemporaryDescription(serviceItem.id, `Creating Hub...`, async () => {
//         await wizard.execute();
//     });
//     ext.branchDataProvider.refresh();

//     vscode.window.showInformationMessage(
//         `Successfully create a Hub ${wizardContext.hubName} in Web PubSub service ${serviceItem.name}. You need to create a event handler or event listner to make it work. Click button below to create a new event handler in the hub. `,
//         ...["Create a event handler", "Ignore"]
//     ).then(async (selection) => {
//         const selectedItem = selection as string;
//         if (selectedItem !== "Ignore") {
//             const hubs = await serviceItem.hubs.getChildren();
//             if (hubs.length === 0) throw new Error("No hub found");
//             const hub = hubs[hubs.length - 1];
//             vscode.window.showInformationMessage(`Create event handler for ${hub.hubName}`);
//             createEventHandler(context, hub);
//         }
//     });
// }

