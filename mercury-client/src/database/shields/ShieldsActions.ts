export enum ShieldsActionType {
    SET_ENABLED = 'shields_update_enabled',
    SET_LEVEL = 'shields_update_level',
    SET_FREQUENCY = 'shields_update_frequency',
}

export type ShieldsAction =
    | SetShieldsEnabledAction
    | SetShieldsLevelAction
    | SetShieldsFrequencyAction
;

//! enabled state

export interface SetShieldsEnabledAction {
    type: ShieldsActionType.SET_ENABLED
    enabled: boolean
}

export function setShieldsEnabled(enabled: boolean): SetShieldsEnabledAction {
    return {
        type: ShieldsActionType.SET_ENABLED,
        enabled,
    };
}

//! shields level

export interface SetShieldsLevelAction {
    type: ShieldsActionType.SET_LEVEL
    level: number
}

export function setShieldsLevel(level: number): SetShieldsLevelAction {
    return {
        type: ShieldsActionType.SET_LEVEL,
        level,
    };
}

//! shields frequency

export interface SetShieldsFrequencyAction {
    type: ShieldsActionType.SET_FREQUENCY
    frequency: number
}

export function setShieldsFrequency(frequency: number): SetShieldsFrequencyAction {
    return {
        type: ShieldsActionType.SET_FREQUENCY,
        frequency,
    };
}
