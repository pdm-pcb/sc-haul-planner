import { useState } from "react";
import { FuzzyComboBox } from "./FuzzyComboBox";
import type { BoxSize, DeliveryLeg, LocationId } from "../domain/DeliveryLeg";
import {
  boxSizesDescending,
  breakScuIntoFewestBoxes,
  formatBoxes,
} from "../domain/groupDeliveryLegs";

interface DeliveryLegFormProps {
  locations: LocationId[];
  commodities: string[];
  onAddLeg: (leg: DeliveryLeg) => void;
}

export function DeliveryLegForm({
  locations,
  commodities,
  onAddLeg,
}: DeliveryLegFormProps) {
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [commodity, setCommodity] = useState("");
  const [totalScu, setTotalScu] = useState(1);
  const [maxBoxSize, setMaxBoxSize] = useState<BoxSize>(32);

  const previewBoxes = breakScuIntoFewestBoxes(totalScu, maxBoxSize);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedCommodity = commodity.trim();

    if (
      pickup.length === 0 ||
      destination.length === 0 ||
      trimmedCommodity.length === 0 ||
      !Number.isInteger(totalScu) ||
      totalScu <= 0
    ) {
      return;
    }

    onAddLeg({
      id: crypto.randomUUID(),
      pickup,
      destination,
      commodity: trimmedCommodity,
      totalScu,
      maxBoxSize,
      createdAt: new Date().toISOString(),
    });

    // setCommodity("");
    // setTotalScu(1);
  }

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h2>Add delivery leg</h2>

      <FuzzyComboBox
        label="Pickup"
        value={pickup}
        options={locations}
        onChange={setPickup}
        placeholder="Pickup location..."
      />

      <FuzzyComboBox
        label="Destination"
        value={destination}
        options={locations}
        onChange={setDestination}
        placeholder="Drop-off location..."
      />

      <FuzzyComboBox
        label="Commodity"
        value={commodity}
        options={commodities}
        onChange={setCommodity}
        placeholder="Aluminum, Stims, Medical Supplies..."
      />

      <label>
        Total SCU
        <input
          min={1}
          step={1}
          type="number"
          value={totalScu}
          onChange={(event) => setTotalScu(Number(event.target.value))}
        />
      </label>

      <label>
        Maximum box size
        <select
          value={maxBoxSize}
          onChange={(event) =>
            setMaxBoxSize(Number(event.target.value) as BoxSize)
          }
        >
          {boxSizesDescending.map((size) => (
            <option key={size} value={size}>
              {size} SCU
            </option>
          ))}
        </select>
      </label>

      <p className="muted">
        Boxes:{" "}
        <strong>
          {previewBoxes.length === 0 ? "-" : formatBoxes(previewBoxes)}
        </strong>
      </p>

      <button type="submit">Add Delivery Leg</button>
    </form>
  );
}