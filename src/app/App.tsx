import type { DeliveryLeg } from "../domain/DeliveryLeg";
import { groupDeliveryLegsByDestination } from "../domain/groupDeliveryLegs";
import { defaultLocations } from "../data/defaultLocations";
import { defaultCommodities } from "../data/defaultCommodities";
import { useLocalStorageState } from "../storage/useLocalStorageState";
import { DeliveryLegForm } from "../components/DeliveryLegForm";
import { DeliveryLegTable } from "../components/DeliveryLegTable";
import { GroupedDestinationView } from "../components/GroupedDestinationView";

export function App() {
  const [legs, setLegs] = useLocalStorageState<DeliveryLeg[]>(
    "sc-haul-planner.delivery-legs.v3",
    [],
  );

  const groups = groupDeliveryLegsByDestination(legs);

  function handleAddLeg(leg: DeliveryLeg) {
    setLegs((current) => [...current, leg]);
  }

  function handleDeleteLeg(id: string) {
    setLegs((current) => current.filter((leg) => leg.id !== id));
  }

  function handleClearAll() {
    setLegs([]);
  }

  return (
    <main className="app">
      <header>
        <h1>Star Citizen Haul Planner</h1>
        <p>
          Enter delivery legs, then group cargo by destination.
        </p>
      </header>

      <div className="layout">
        <DeliveryLegForm
          locations={defaultLocations}
          commodities={defaultCommodities}
          onAddLeg={handleAddLeg}
        />

        <div className="main-column">
          <GroupedDestinationView groups={groups} />

          <DeliveryLegTable legs={legs} onDeleteLeg={handleDeleteLeg} />

          {legs.length > 0 && (
            <button className="danger" onClick={handleClearAll}>
              Clear all delivery legs
            </button>
          )}
        </div>
      </div>
    </main>
  );
}