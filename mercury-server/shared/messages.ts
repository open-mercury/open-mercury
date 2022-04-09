export interface StartupRequest {
    type: 'startup'
}

export interface DispatchAction {
    type: 'dispatch'
    action: unknown
}

export type Message = StartupRequest | DispatchAction;
