export interface StartupRequest {
    type: 'startup'
}

export interface DispatchAction {
    type: 'dispatch'
    id: string
    action: unknown
}

export type Message = StartupRequest | DispatchAction;
