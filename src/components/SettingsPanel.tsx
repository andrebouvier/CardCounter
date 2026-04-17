import {
  COUNT_SYSTEM_OPTIONS,
  USER_RISK_OPTIONS,
  type UserSettings,
} from '../lib/config';

export type SettingsPanelProps = {
  value: UserSettings;
  onChange: (next: UserSettings) => void;
};

type SettingsField =
  | {
      id: 'bankrollSize';
      label: string;
      kind: 'number';
      min: number;
      max: number;
      step: number;
      helperText: string;
    }
  | {
      id: 'numberOfDecks';
      label: string;
      kind: 'number';
      min: number;
      max: number;
      step: number;
      helperText: string;
    }
  | {
      id: 'variance';
      label: string;
      kind: 'number';
      min: number;
      max: number;
      step: number;
      helperText: string;
    }
  | {
      id: 'countSystem';
      label: string;
      kind: 'select';
      options: readonly { id: string; label: string }[];
      helperText: string;
    }
  | {
      id: 'userRisk';
      label: string;
      kind: 'select';
      options: readonly { id: string; label: string }[];
      helperText: string;
    }
  | {
      id: 'betSpread';
      label: string;
      kind: 'betSpread';
      helperText: string;
    };

const SETTINGS_FIELDS: readonly SettingsField[] = [
  {
    id: 'bankrollSize',
    label: 'Bankroll size',
    kind: 'number',
    min: 1,
    max: 1000000,
    step: 1,
    helperText: 'Total bankroll used by Kelly bet sizing.',
  },
  {
    id: 'numberOfDecks',
    label: 'Number of decks',
    kind: 'number',
    min: 1,
    max: 8,
    step: 1,
    helperText: 'Number of decks used in each shoe. Most websites list decks used',
  },
  {
    id: 'betSpread',
    label: 'Bet spread (units)',
    kind: 'betSpread',
    helperText: 'Set your min and max unit spread.',
  },
  {
    id: 'countSystem',
    label: 'Count system',
    kind: 'select',
    options: COUNT_SYSTEM_OPTIONS,
    helperText: 'Select counting system.',
  },
  {
    id: 'userRisk',
    label: 'Risk',
    kind: 'select',
    options: USER_RISK_OPTIONS,
    helperText: 'Adjusts Kelly fraction sizing (quarter, half, full).',
  },
  {
    id: 'variance',
    label: 'Variance',
    kind: 'number',
    min: 0.0001,
    max: 100,
    step: 0.001,
    helperText: '(Advanced) Variance used in Kelly bet sizing calculations.',
  },
];

export function SettingsPanel({ value, onChange }: SettingsPanelProps) {
  const updateBankrollSize = (bankrollSize: number) => {
    onChange({ ...value, bankrollSize });
  };

  const updateDecks = (decks: number) => {
    onChange({ ...value, numberOfDecks: decks });
  };

  const updateVariance = (variance: number) => {
    onChange({ ...value, variance });
  };

  const updateCountSystem = (countSystem: UserSettings['countSystem']) => {
    onChange({ ...value, countSystem });
  };

  const updateRisk = (userRisk: UserSettings['userRisk']) => {
    onChange({ ...value, userRisk });
  };

  const updateSpread = (
    key: keyof UserSettings['betSpread'],
    nextValue: number,
  ) => {
    onChange({
      ...value,
      betSpread: { ...value.betSpread, [key]: nextValue },
    });
  };

  return (
    <details className="settings-panel">
      <summary className="settings-panel__summary">Settings</summary>
      <div className="settings-panel__body">
        {SETTINGS_FIELDS.map((field) => {
          if (field.kind === 'number') {
            return (
              <label className="settings-field" key={field.id}>
                <span className="settings-field__label">{field.label}</span>
                <input
                  type="number"
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  value={
                    field.id === 'bankrollSize'
                      ? value.bankrollSize
                      : field.id === 'numberOfDecks'
                        ? value.numberOfDecks
                        : value.variance
                  }
                  onChange={(event) =>
                    field.id === 'bankrollSize'
                      ? updateBankrollSize(Number(event.target.value) || field.min)
                      : field.id === 'numberOfDecks'
                      ? updateDecks(Number(event.target.value) || field.min)
                      : updateVariance(Number(event.target.value) || field.min)
                  }
                />
                <span className="settings-field__helper">{field.helperText}</span>
              </label>
            );
          }

          if (field.kind === 'select') {
            return (
              <label className="settings-field" key={field.id}>
                <span className="settings-field__label">{field.label}</span>
                <select
                  value={field.id === 'countSystem' ? value.countSystem : value.userRisk}
                  onChange={(event) =>
                    field.id === 'countSystem'
                      ? updateCountSystem(event.target.value as UserSettings['countSystem'])
                      : updateRisk(event.target.value as UserSettings['userRisk'])
                  }
                >
                  {field.options.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <span className="settings-field__helper">{field.helperText}</span>
              </label>
            );
          }

          return (
            <div className="settings-field" key={field.id}>
              <span className="settings-field__label">{field.label}</span>
              <div className="settings-field__spread">
                <label>
                  <span>Min</span>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    step={1}
                    value={value.betSpread.minUnits}
                    onChange={(event) =>
                      updateSpread('minUnits', Number(event.target.value) || 1)
                    }
                  />
                </label>
                <label>
                  <span>Max</span>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    step={1}
                    value={value.betSpread.maxUnits}
                    onChange={(event) =>
                      updateSpread('maxUnits', Number(event.target.value) || 1)
                    }
                  />
                </label>
              </div>
              <span className="settings-field__helper">{field.helperText}</span>
            </div>
          );
        })}
      </div>
    </details>
  );
}
