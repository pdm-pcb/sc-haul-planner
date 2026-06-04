import type { DeliveryLeg } from "../domain/DeliveryLeg";
import {
  breakScuIntoFewestBoxes,
  formatBoxes,
} from "../domain/groupDeliveryLegs";

interface DeliveryLegTableProps {
  legs: DeliveryLeg[];
  onDeleteLeg: (id: string) => void;
}

export function DeliveryLegTable({ legs, onDeleteLeg }: DeliveryLegTableProps) {
  return (
    <section className="card">
      <h2>Entered delivery legs</h2>

      {legs.length === 0 ? (
        <p>No delivery legs yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Pickup</th>
              <th>Destination</th>
              <th>Commodity</th>
              <th>Total SCU</th>
              <th>Max box</th>
              <th>Boxes</th>
              <th />
            </tr>
          </thead>

          <tbody>
            {legs.map((leg) => {
              const boxes = breakScuIntoFewestBoxes(
                leg.totalScu,
                leg.maxBoxSize,
              );

              return (
                <tr key={leg.id}>
                  <td>{leg.pickup}</td>
                  <td>{leg.destination}</td>
                  <td>{leg.commodity}</td>
                  <td>{leg.totalScu}</td>
                  <td>{leg.maxBoxSize} SCU</td>
                  <td>{formatBoxes(boxes)}</td>
                  <td>
                    <button onClick={() => onDeleteLeg(leg.id)}>Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
}