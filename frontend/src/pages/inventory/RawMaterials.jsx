import InventoryList from "./InventoryList";

export default function RawMaterials() {
  return (
    <InventoryList
      title="Raw Materials"
      itemType="raw_material"
      createPath="/inventory/items/create?type=raw_material"
      createLabel="New Material"
    />
  );
}
