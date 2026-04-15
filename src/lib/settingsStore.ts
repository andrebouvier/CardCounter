//settings persistence WIP
import Store from 'electron-store';

const schema = {
    bankrollSize: {
        type: 'number',
        minimum: 1,
        maximum: 1000000,
        default: 100,
    },
    numberOfDecks: {
        type: 'number',
        minimum: 1,
        maximum: 100,
        default: 6,
    },
    countSystem: {
        type: 'string',
        enum: ['zen'], //'hilo'],
    },
    betSpread: {
        type: 'object',
        properties: {
            minUnits: { type: 'number', minimum: 1, maximum: 100, default: 1 },
            maxUnits: { type: 'number', minimum: 1, maximum: 100, default: 12 },
        },
    },
    userRisk: {
        type: 'string',
        enum: ['Low', 'Medium', 'High'],
        default: 'medium',
    },
    variance: {
        type: 'number',
        minimum: 0.0001,
        default: 1.346,
    }
};

export const settingsStore = new Store({ schema });