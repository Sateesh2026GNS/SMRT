import InventoryList from "./InventoryList";

export default function FinishedGoods() {
  return (
    <InventoryList
      title="Finished Goods"
      itemType="finished_good"
      createPath="/inventory/items/create?type=finished_good"
      createLabel="New Finished Good"
    />
  );
}
