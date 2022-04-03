export interface StartupRequest {
    type: 'startup'
}

export interface StateResponse {
    type: 'state'
    data: unknown
}

export interface StateChange {
    type: 'change'
    id: string
    data: unknown
}

export type Message = StartupRequest | StateResponse | StateChange;
