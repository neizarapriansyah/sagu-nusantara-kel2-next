type ChipListProps = {
  items: string[];
};

// daftar label kecil (bahan, makanan khas, dll.)
export default function ChipList({ items }: ChipListProps) {
  return (
    <div className="chip-list">
      {items.map((item) => (
        <span className="chip" key={item}>
          {item}
        </span>
      ))}
    </div>
  );
}
