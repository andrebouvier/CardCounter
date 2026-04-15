import { COUNT_SYSTEM_OPTIONS, type UserSettings } from '../lib/config';

export type SettingsPanelProps = {
  value: UserSettings;
  onChange: (next: UserSettings) => void;
};

type SettingsField =
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
      id: 'countSystem';
      label: string;
      kind: 'select';
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
    helperText: 'Select counting system.',
  },
];

export function SettingsPanel({ value, onChange }: SettingsPanelProps) {
  const updateDecks = (decks: number) => {
    onChange({ ...value, numberOfDecks: decks });
  };

  const updateCountSystem = (countSystem: UserSettings['countSystem']) => {
    onChange({ ...value, countSystem });
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
                  value={value.numberOfDecks}
                  onChange={(event) =>
                    updateDecks(Number(event.target.value) || field.min)
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
                  value={value.countSystem}
                  onChange={(event) =>
                    updateCountSystem(event.target.value as UserSettings['countSystem'])
                  }
                >
                  {COUNT_SYSTEM_OPTIONS.map((option) => (
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
