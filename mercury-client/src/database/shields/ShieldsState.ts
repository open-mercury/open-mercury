import { ShieldsAction, ShieldsActionType } from './ShieldsActions';

export interface ShieldsState {
    enabled: boolean
    level: number
    frequency: number
}

const initialState: ShieldsState = {
    enabled: true,
    level: 0.5,
    frequency: 0,
};

export function reduceShieldsState(state: ShieldsState, action?: ShieldsAction) {
    if (!action) {
        return initialState;
    }

    switch (action.type) {
        case ShieldsActionType.SET_ENABLED:
            state.enabled = action.enabled;
            break;

        case ShieldsActionType.SET_LEVEL:
            state.level = action.level;
            break;

        case ShieldsActionType.SET_FREQUENCY:
            state.frequency = action.frequency;
            break;
    }

    return state;
}
