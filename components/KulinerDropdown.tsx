type KulinerDropdownProps = {
  id: string;
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
};

export default function KulinerDropdown({ id, label, value, options, onChange }: KulinerDropdownProps) {
  return (
    <div className="kuliner-dropdown">
      <label htmlFor={id} className="kuliner-label">
        {label}
      </label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="Semua">Semua</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
