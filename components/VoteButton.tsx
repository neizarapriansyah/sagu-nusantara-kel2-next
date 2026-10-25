type VoteButtonProps = {
  icon: string;
  label: string;
  count: number;
  active: boolean;
  pop: boolean;
  disabled: boolean;
  onClick: () => void;
};

// tombol like / dislike pada fakta menarik
export default function VoteButton({ icon, label, count, active, pop, disabled, onClick }: VoteButtonProps) {
  return (
    <button
      type="button"
      className={`fakta-vote-button${active ? " active" : ""}${pop ? " pop" : ""}`}
      aria-pressed={active}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
    >
      <img src={icon} alt="" />
      <span>{count}</span>
    </button>
  );
}
