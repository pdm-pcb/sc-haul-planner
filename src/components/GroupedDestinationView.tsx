import type { DestinationGroup } from "../domain/DeliveryLeg";
import { formatBoxes } from "../domain/groupDeliveryLegs";

interface GroupedDestinationViewProps {
  groups: DestinationGroup[];
}

export function GroupedDestinationView({ groups }: GroupedDestinationViewProps) {
  return (
    <section className="card">
      <h2>Grouped destination manifest</h2>

      {groups.length === 0 ? (
        <p>No destination groups yet.</p>
      ) : (
        <div className="groups">
          {groups.map((group) => (
            <article className="group" key={group.destination}>
              <h3>
                {group.destination} — {group.totalScu} SCU
              </h3>

              <ul className="manifest">
                {group.cargoLines.map((line) => (
                  <li
                    key={`${line.pickup}-${line.destination}-${line.commodity}`}
                  >
                    <strong>
                      {line.totalScu} SCU {line.commodity}
                    </strong>{" "}
                    from {line.pickup} to {line.destination}
                    <br />
                    <span className="muted">
                      Boxes: {formatBoxes(line.boxes)}
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}