interface ModeSwitchProps {
  isEditMode: boolean;
  onToggle: () => void;
}

export function ModeSwitch({ isEditMode, onToggle }: ModeSwitchProps) {
  return (
    <div className="mode-switch-container">
      <button
        className={`mode-switch ${isEditMode ? 'mode-edit' : 'mode-read'}`}
        onClick={onToggle}
        title={isEditMode ? 'Mode édition - Cliquez pour passer en lecture' : 'Mode lecture - Cliquez pour passer en édition'}
      >
        <span className="mode-switch-track">
          <span className="mode-switch-thumb">
            {isEditMode ? '✏️' : '👁️'}
          </span>
        </span>
        <span className="mode-switch-label">
          {isEditMode ? 'Édition' : 'Lecture'}
        </span>
      </button>
    </div>
  );
}
